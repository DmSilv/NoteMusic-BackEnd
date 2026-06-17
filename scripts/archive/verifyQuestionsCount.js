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

const verifyQuestionsCount = async () => {
  try {
    console.log('🔍 VERIFICAÇÃO DETALHADA DAS PERGUNTAS');
    console.log('=' .repeat(60));

    // 1. Buscar todos os módulos
    console.log('\n📚 1. BUSCANDO TODOS OS MÓDULOS:');
    console.log('-' .repeat(40));
    
    const modulesResponse = await makeRequest('/modules');
    console.log(`✅ Status: ${modulesResponse.status}`);
    
    if (modulesResponse.data.modules && Array.isArray(modulesResponse.data.modules)) {
      const modules = modulesResponse.data.modules;
      console.log(`📊 Total de módulos: ${modules.length}`);
      
      // 2. Verificar cada módulo e contar perguntas
      console.log('\n🎯 2. VERIFICANDO PERGUNTAS POR MÓDULO:');
      console.log('-' .repeat(40));
      
      let totalQuestions = 0;
      const moduleDetails = [];
      
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        console.log(`\n🔍 Módulo ${i + 1}: ${module.title}`);
        console.log(`   ID: ${module._id}`);
        console.log(`   Nível: ${module.level}`);
        console.log(`   Categoria: ${module.category}`);
        
        try {
          // Buscar quiz para este módulo
          const quizResponse = await makeRequest(`/quiz/module/${module._id}`);
          
          if (quizResponse.data.success && quizResponse.data.quiz) {
            const quiz = quizResponse.data.quiz;
            const questionCount = quiz.questions ? quiz.questions.length : 0;
            totalQuestions += questionCount;
            
            console.log(`   ✅ Quiz encontrado: ${quiz.title}`);
            console.log(`   📝 Perguntas: ${questionCount}`);
            console.log(`   ⏱️ Tempo limite: ${quiz.timeLimit}s`);
            
            // Detalhes das perguntas
            if (quiz.questions && quiz.questions.length > 0) {
              console.log(`   📋 Detalhes das perguntas:`);
              quiz.questions.forEach((question, qIndex) => {
                console.log(`      ${qIndex + 1}. ${question.question}`);
                console.log(`         Opções: ${question.options ? question.options.length : 0}`);
                console.log(`         Dificuldade: ${question.difficulty || 'N/A'}`);
                console.log(`         Pontos: ${question.points || 'N/A'}`);
              });
            }
            
            moduleDetails.push({
              title: module.title,
              level: module.level,
              category: module.category,
              questionCount: questionCount,
              quizId: quiz.id
            });
            
          } else {
            console.log(`   ❌ Quiz não encontrado:`, quizResponse.data);
            moduleDetails.push({
              title: module.title,
              level: module.level,
              category: module.category,
              questionCount: 0,
              quizId: null
            });
          }
        } catch (error) {
          console.log(`   ❌ Erro ao buscar quiz: ${error.message}`);
          moduleDetails.push({
            title: module.title,
            level: module.level,
            category: module.category,
            questionCount: 0,
            quizId: null
          });
        }
      }
      
      // 3. Resumo por nível
      console.log('\n📊 3. RESUMO POR NÍVEL:');
      console.log('-' .repeat(40));
      
      const levelSummary = {};
      moduleDetails.forEach(module => {
        if (!levelSummary[module.level]) {
          levelSummary[module.level] = {
            modules: 0,
            questions: 0,
            details: []
          };
        }
        levelSummary[module.level].modules++;
        levelSummary[module.level].questions += module.questionCount;
        levelSummary[module.level].details.push(module);
      });
      
      Object.entries(levelSummary).forEach(([level, data]) => {
        console.log(`\n🎯 ${level.toUpperCase()}:`);
        console.log(`   Módulos: ${data.modules}`);
        console.log(`   Perguntas: ${data.questions}`);
        console.log(`   Média por módulo: ${(data.questions / data.modules).toFixed(1)}`);
        
        data.details.forEach(module => {
          console.log(`     - ${module.title}: ${module.questionCount} perguntas`);
        });
      });
      
      // 4. Resumo geral
      console.log('\n📈 4. RESUMO GERAL:');
      console.log('-' .repeat(40));
      console.log(`📊 Total de módulos: ${modules.length}`);
      console.log(`📝 Total de perguntas: ${totalQuestions}`);
      console.log(`📊 Média de perguntas por módulo: ${(totalQuestions / modules.length).toFixed(1)}`);
      
      // 5. Verificar se há módulos sem perguntas
      const modulesWithoutQuestions = moduleDetails.filter(m => m.questionCount === 0);
      if (modulesWithoutQuestions.length > 0) {
        console.log(`\n⚠️ MÓDULOS SEM PERGUNTAS: ${modulesWithoutQuestions.length}`);
        modulesWithoutQuestions.forEach(module => {
          console.log(`   - ${module.title} (${module.level})`);
        });
      }
      
      // 6. Verificar se o total está correto
      console.log('\n🎯 5. VERIFICAÇÃO FINAL:');
      console.log('-' .repeat(40));
      if (totalQuestions >= 77) {
        console.log(`✅ SUCESSO: ${totalQuestions} perguntas encontradas (esperado: 77+)`);
      } else {
        console.log(`❌ PROBLEMA: Apenas ${totalQuestions} perguntas encontradas (esperado: 77+)`);
        console.log(`🔍 Verificando se há problemas na inserção...`);
      }
      
    } else {
      console.log(`❌ Estrutura inválida:`, modulesResponse.data);
    }

    console.log('\n🎉 VERIFICAÇÃO CONCLUÍDA!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  verifyQuestionsCount();
}

module.exports = { verifyQuestionsCount };



