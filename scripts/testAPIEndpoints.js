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

const testAPIEndpoints = async () => {
  try {
    console.log('🔍 ANÁLISE DE SISTEMAS - TESTE DE ENDPOINTS');
    console.log('=' .repeat(60));

    // 1. Testar endpoint de módulos
    console.log('\n📚 1. TESTANDO ENDPOINT /api/modules:');
    console.log('-' .repeat(40));
    
    const modulesResponse = await makeRequest('/modules');
    console.log(`✅ Status: ${modulesResponse.status}`);
    
    if (modulesResponse.data.modules && Array.isArray(modulesResponse.data.modules)) {
      const modules = modulesResponse.data.modules;
      console.log(`📊 Total de módulos retornados: ${modules.length}`);
      
      // Agrupar por nível
      const levelGroups = {};
      modules.forEach(module => {
        if (!levelGroups[module.level]) {
          levelGroups[module.level] = [];
        }
        levelGroups[module.level].push(module);
      });
      
      console.log('\n📈 DISTRIBUIÇÃO POR NÍVEL:');
      Object.entries(levelGroups).forEach(([level, levelModules]) => {
        console.log(`   🎯 ${level.toUpperCase()}: ${levelModules.length} módulos`);
        levelModules.forEach(module => {
          console.log(`      - ${module.title}`);
        });
      });
      
      // 2. Testar endpoint de quizzes para cada módulo
      console.log('\n🎯 2. TESTANDO ENDPOINTS DE QUIZZES:');
      console.log('-' .repeat(40));
      
      let totalQuestions = 0;
      let totalQuizzes = 0;
      
      for (const module of modules) {
        try {
          const quizResponse = await makeRequest(`/quiz/module/${module._id}`);
          
          if (quizResponse.data.success && quizResponse.data.quiz) {
            const quiz = quizResponse.data.quiz;
            const questionCount = quiz.questions ? quiz.questions.length : 0;
            totalQuestions += questionCount;
            totalQuizzes++;
            
            console.log(`\n✅ Quiz encontrado: ${quiz.title}`);
            console.log(`   📝 Perguntas: ${questionCount}`);
            console.log(`   🎯 Nível: ${module.level}`);
            console.log(`   📂 Categoria: ${module.category}`);
            
            if (quiz.questions && quiz.questions.length > 0) {
              console.log(`   📋 Primeiras 3 perguntas:`);
              quiz.questions.slice(0, 3).forEach((question, index) => {
                console.log(`      ${index + 1}. ${question.question}`);
                console.log(`         Opções: ${question.options ? question.options.length : 0}`);
                console.log(`         Dificuldade: ${question.difficulty || 'N/A'}`);
              });
            }
          } else {
            console.log(`❌ Quiz não encontrado para: ${module.title}`);
          }
        } catch (error) {
          console.log(`❌ Erro ao buscar quiz para ${module.title}: ${error.message}`);
        }
      }
      
      // 3. Resumo final
      console.log('\n📊 3. RESUMO FINAL DA API:');
      console.log('-' .repeat(40));
      console.log(`📚 Total de módulos: ${modules.length}`);
      console.log(`🎯 Total de quizzes: ${totalQuizzes}`);
      console.log(`❓ Total de perguntas: ${totalQuestions}`);
      console.log(`📈 Média de perguntas por quiz: ${totalQuizzes > 0 ? Math.round(totalQuestions / totalQuizzes) : 0}`);
      
      // 4. Verificar se está retornando os dados corretos
      if (totalQuestions >= 90) {
        console.log(`\n✅ SUCESSO: API retornando ${totalQuestions} perguntas (esperado: 90+)`);
      } else {
        console.log(`\n❌ PROBLEMA: API retornando apenas ${totalQuestions} perguntas (esperado: 90+)`);
      }
      
    } else {
      console.log(`❌ Estrutura inválida na resposta:`, modulesResponse.data);
    }

    // 5. Testar endpoint de categorias
    console.log('\n📂 4. TESTANDO ENDPOINT /api/modules/categories:');
    console.log('-' .repeat(40));
    
    const categoriesResponse = await makeRequest('/modules/categories');
    console.log(`✅ Status: ${categoriesResponse.status}`);
    
    if (categoriesResponse.data.categories && Array.isArray(categoriesResponse.data.categories)) {
      const categories = categoriesResponse.data.categories;
      console.log(`📊 Total de categorias: ${categories.length}`);
      
      categories.forEach((category, index) => {
        console.log(`\n${index + 1}. ${category.name}`);
        console.log(`   Módulos: ${category.modules ? category.modules.length : 0}`);
        if (category.modules && category.modules.length > 0) {
          category.modules.forEach((module, moduleIndex) => {
            console.log(`     ${moduleIndex + 1}. ${module.title} (${module.level})`);
          });
        }
      });
    }

    console.log('\n🎉 ANÁLISE DE ENDPOINTS CONCLUÍDA!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a análise:', error);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  testAPIEndpoints();
}

module.exports = { testAPIEndpoints };



