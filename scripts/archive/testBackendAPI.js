const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3333/api';

const testBackendAPI = async () => {
  try {
    console.log('🌐 TESTE DE API DO BACKEND');
    console.log('=' .repeat(60));

    // 1. Testar health check
    console.log('\n🏥 1. TESTANDO HEALTH CHECK:');
    console.log('-' .repeat(40));
    
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      const healthData = await healthResponse.json();
      console.log(`✅ Status: ${healthData.status}`);
      console.log(`📝 Mensagem: ${healthData.message}`);
    } catch (error) {
      console.log(`❌ Erro no health check: ${error.message}`);
    }

    // 2. Testar busca de módulos
    console.log('\n📚 2. TESTANDO BUSCA DE MÓDULOS:');
    console.log('-' .repeat(40));
    
    try {
      const modulesResponse = await fetch(`${API_BASE_URL}/modules`);
      const modulesData = await modulesResponse.json();
      
      if (modulesData.modules && Array.isArray(modulesData.modules)) {
        console.log(`✅ Módulos encontrados: ${modulesData.modules.length}`);
        modulesData.modules.forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.title} (${module.level})`);
        });
      } else {
        console.log(`❌ Estrutura de resposta inválida:`, modulesData);
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar módulos: ${error.message}`);
    }

    // 3. Testar busca de quiz por módulo
    console.log('\n🎯 3. TESTANDO BUSCA DE QUIZ POR MÓDULO:');
    console.log('-' .repeat(40));
    
    try {
      // Primeiro buscar um módulo para pegar o ID
      const modulesResponse = await fetch(`${API_BASE_URL}/modules`);
      const modulesData = await modulesResponse.json();
      
      if (modulesData.modules && modulesData.modules.length > 0) {
        const firstModule = modulesData.modules[0];
        console.log(`🔍 Testando com módulo: ${firstModule.title}`);
        console.log(`   ID: ${firstModule._id}`);
        
        // Buscar quiz para este módulo
        const quizResponse = await fetch(`${API_BASE_URL}/quiz/module/${firstModule._id}`);
        const quizData = await quizResponse.json();
        
        if (quizData.success && quizData.quiz) {
          console.log(`✅ Quiz encontrado: ${quizData.quiz.title}`);
          console.log(`   Perguntas: ${quizData.quiz.questions ? quizData.quiz.questions.length : 0}`);
          console.log(`   Tempo limite: ${quizData.quiz.timeLimit}s`);
          console.log(`   Nível: ${quizData.quiz.level}`);
          
          // Verificar estrutura das perguntas
          if (quizData.quiz.questions && quizData.quiz.questions.length > 0) {
            console.log(`   Estrutura da primeira pergunta:`);
            const firstQuestion = quizData.quiz.questions[0];
            console.log(`     Pergunta: ${firstQuestion.question}`);
            console.log(`     Opções: ${firstQuestion.options ? firstQuestion.options.length : 0}`);
            if (firstQuestion.options && firstQuestion.options.length > 0) {
              firstQuestion.options.forEach((option, index) => {
                console.log(`       ${index + 1}. ${option.label}`);
              });
            }
          }
        } else {
          console.log(`❌ Quiz não encontrado:`, quizData);
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
      const modulesResponse = await fetch(`${API_BASE_URL}/modules`);
      const modulesData = await modulesResponse.json();
      
      if (modulesData.modules && modulesData.modules.length > 0) {
        const firstModule = modulesData.modules[0];
        const quizResponse = await fetch(`${API_BASE_URL}/quiz/module/${firstModule._id}`);
        const quizData = await quizResponse.json();
        
        if (quizData.success && quizData.quiz && quizData.quiz.questions && quizData.quiz.questions.length > 0) {
          const quizId = quizData.quiz.id;
          const questionIndex = 0;
          const selectedAnswer = 0; // Primeira opção
          
          console.log(`🔍 Testando validação da questão ${questionIndex + 1} do quiz ${quizId}`);
          console.log(`   Resposta selecionada: ${selectedAnswer}`);
          
          const validationResponse = await fetch(`${API_BASE_URL}/quiz/${quizId}/validate/${questionIndex}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selectedAnswer })
          });
          
          const validationData = await validationResponse.json();
          
          if (validationData.success) {
            console.log(`✅ Validação funcionando:`);
            console.log(`   Resposta correta: ${validationData.isCorrect}`);
            console.log(`   Resposta selecionada: ${validationData.selectedAnswer.text}`);
            console.log(`   Resposta correta: ${validationData.correctAnswer.text}`);
            console.log(`   Explicação: ${validationData.explanation || 'N/A'}`);
            console.log(`   Pontos: ${validationData.points}`);
          } else {
            console.log(`❌ Erro na validação:`, validationData);
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
      const modulesResponse = await fetch(`${API_BASE_URL}/modules`);
      const modulesData = await modulesResponse.json();
      
      if (modulesData.modules && modulesData.modules.length > 0) {
        const firstModule = modulesData.modules[0];
        const quizResponse = await fetch(`${API_BASE_URL}/quiz/module/${firstModule._id}`);
        const quizData = await quizResponse.json();
        
        if (quizData.success && quizData.quiz && quizData.quiz.questions && quizData.quiz.questions.length > 0) {
          const quizId = quizData.quiz.id;
          const answers = [0, 1, 2, 0, 1, 2, 0]; // Respostas de exemplo
          const timeSpent = 120; // 2 minutos
          
          console.log(`🔍 Testando submissão do quiz ${quizId}`);
          console.log(`   Respostas: ${answers.join(', ')}`);
          console.log(`   Tempo gasto: ${timeSpent}s`);
          
          const submissionResponse = await fetch(`${API_BASE_URL}/quiz/${quizId}/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answers, timeSpent })
          });
          
          const submissionData = await submissionResponse.json();
          
          if (submissionData.success) {
            console.log(`✅ Submissão funcionando:`);
            console.log(`   Score: ${submissionData.score}/${submissionData.total}`);
            console.log(`   Porcentagem: ${submissionData.percentage}%`);
            console.log(`   Feedback: ${submissionData.feedback}`);
            console.log(`   Tempo gasto: ${submissionData.timeSpent}s`);
          } else {
            console.log(`❌ Erro na submissão:`, submissionData);
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
  testBackendAPI();
}

module.exports = { testBackendAPI };



