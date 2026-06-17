const http = require('http');

const API_BASE_URL = 'http://localhost:3333';

const makeRequest = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3333,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const testAPI = async () => {
  try {
    console.log('🌐 TESTE DE API DO BACKEND');
    console.log('=' .repeat(60));

    // 1. Testar health check
    console.log('\n🏥 1. TESTANDO HEALTH CHECK:');
    console.log('-' .repeat(40));
    
    try {
      const response = await makeRequest('/health');
      console.log(`✅ Status: ${response.status}`);
      console.log(`📝 Dados:`, response.data);
    } catch (error) {
      console.log(`❌ Erro no health check: ${error.message}`);
    }

    // 2. Testar busca de módulos
    console.log('\n📚 2. TESTANDO BUSCA DE MÓDULOS:');
    console.log('-' .repeat(40));
    
    try {
      const response = await makeRequest('/modules');
      console.log(`✅ Status: ${response.status}`);
      
      if (response.data.modules && Array.isArray(response.data.modules)) {
        console.log(`📊 Módulos encontrados: ${response.data.modules.length}`);
        response.data.modules.forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.title} (${module.level})`);
        });
      } else {
        console.log(`❌ Estrutura de resposta inválida:`, response.data);
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar módulos: ${error.message}`);
    }

    // 3. Testar busca de quiz por módulo
    console.log('\n🎯 3. TESTANDO BUSCA DE QUIZ POR MÓDULO:');
    console.log('-' .repeat(40));
    
    try {
      // Primeiro buscar um módulo para pegar o ID
      const modulesResponse = await makeRequest('/modules');
      
      if (modulesResponse.data.modules && modulesResponse.data.modules.length > 0) {
        const firstModule = modulesResponse.data.modules[0];
        console.log(`🔍 Testando com módulo: ${firstModule.title}`);
        console.log(`   ID: ${firstModule._id}`);
        
        // Buscar quiz para este módulo
        const quizResponse = await makeRequest(`/quiz/module/${firstModule._id}`);
        console.log(`✅ Status: ${quizResponse.status}`);
        
        if (quizResponse.data.success && quizResponse.data.quiz) {
          console.log(`✅ Quiz encontrado: ${quizResponse.data.quiz.title}`);
          console.log(`   Perguntas: ${quizResponse.data.quiz.questions ? quizResponse.data.quiz.questions.length : 0}`);
          console.log(`   Tempo limite: ${quizResponse.data.quiz.timeLimit}s`);
          console.log(`   Nível: ${quizResponse.data.quiz.level}`);
          
          // Verificar estrutura das perguntas
          if (quizResponse.data.quiz.questions && quizResponse.data.quiz.questions.length > 0) {
            console.log(`   Estrutura da primeira pergunta:`);
            const firstQuestion = quizResponse.data.quiz.questions[0];
            console.log(`     Pergunta: ${firstQuestion.question}`);
            console.log(`     Opções: ${firstQuestion.options ? firstQuestion.options.length : 0}`);
            if (firstQuestion.options && firstQuestion.options.length > 0) {
              firstQuestion.options.forEach((option, index) => {
                console.log(`       ${index + 1}. ${option.label}`);
              });
            }
          }
        } else {
          console.log(`❌ Quiz não encontrado:`, quizResponse.data);
        }
      } else {
        console.log(`❌ Nenhum módulo encontrado para testar`);
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar quiz: ${error.message}`);
    }

    // 4. Testar validação de questão
    console.log('\n✅ 4. TESTANDO VALIDAÇÃO DE QUESTÃO:');
    console.log('-' .repeat(40));
    
    try {
      // Buscar um quiz primeiro
      const modulesResponse = await makeRequest('/modules');
      
      if (modulesResponse.data.modules && modulesResponse.data.modules.length > 0) {
        const firstModule = modulesResponse.data.modules[0];
        const quizResponse = await makeRequest(`/quiz/module/${firstModule._id}`);
        
        if (quizResponse.data.success && quizResponse.data.quiz && quizResponse.data.quiz.questions && quizResponse.data.quiz.questions.length > 0) {
          const quizId = quizResponse.data.quiz.id;
          const questionIndex = 0;
          const selectedAnswer = 0; // Primeira opção
          
          console.log(`🔍 Testando validação da questão ${questionIndex + 1} do quiz ${quizId}`);
          console.log(`   Resposta selecionada: ${selectedAnswer}`);
          
          const validationResponse = await makeRequest(`/quiz/${quizId}/validate/${questionIndex}`, 'POST', { selectedAnswer });
          console.log(`✅ Status: ${validationResponse.status}`);
          
          if (validationResponse.data.success) {
            console.log(`✅ Validação funcionando:`);
            console.log(`   Resposta correta: ${validationResponse.data.isCorrect}`);
            console.log(`   Resposta selecionada: ${validationResponse.data.selectedAnswer.text}`);
            console.log(`   Resposta correta: ${validationResponse.data.correctAnswer.text}`);
            console.log(`   Explicação: ${validationResponse.data.explanation || 'N/A'}`);
            console.log(`   Pontos: ${validationResponse.data.points}`);
          } else {
            console.log(`❌ Erro na validação:`, validationResponse.data);
          }
        } else {
          console.log(`❌ Nenhum quiz válido encontrado para testar validação`);
        }
      }
    } catch (error) {
      console.log(`❌ Erro ao testar validação: ${error.message}`);
    }

    // 5. Testar submissão de quiz
    console.log('\n📝 5. TESTANDO SUBMISSÃO DE QUIZ:');
    console.log('-' .repeat(40));
    
    try {
      // Buscar um quiz primeiro
      const modulesResponse = await makeRequest('/modules');
      
      if (modulesResponse.data.modules && modulesResponse.data.modules.length > 0) {
        const firstModule = modulesResponse.data.modules[0];
        const quizResponse = await makeRequest(`/quiz/module/${firstModule._id}`);
        
        if (quizResponse.data.success && quizResponse.data.quiz && quizResponse.data.quiz.questions && quizResponse.data.quiz.questions.length > 0) {
          const quizId = quizResponse.data.quiz.id;
          const answers = [0, 1, 2, 0, 1, 2, 0]; // Respostas de exemplo
          const timeSpent = 120; // 2 minutos
          
          console.log(`🔍 Testando submissão do quiz ${quizId}`);
          console.log(`   Respostas: ${answers.join(', ')}`);
          console.log(`   Tempo gasto: ${timeSpent}s`);
          
          const submissionResponse = await makeRequest(`/quiz/${quizId}/submit`, 'POST', { answers, timeSpent });
          console.log(`✅ Status: ${submissionResponse.status}`);
          
          if (submissionResponse.data.success) {
            console.log(`✅ Submissão funcionando:`);
            console.log(`   Score: ${submissionResponse.data.score}/${submissionResponse.data.total}`);
            console.log(`   Porcentagem: ${submissionResponse.data.percentage}%`);
            console.log(`   Feedback: ${submissionResponse.data.feedback}`);
            console.log(`   Tempo gasto: ${submissionResponse.data.timeSpent}s`);
          } else {
            console.log(`❌ Erro na submissão:`, submissionResponse.data);
          }
        } else {
          console.log(`❌ Nenhum quiz válido encontrado para testar submissão`);
        }
      }
    } catch (error) {
      console.log(`❌ Erro ao testar submissão: ${error.message}`);
    }

    console.log('\n🎉 TESTE DE API CONCLUÍDO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };



