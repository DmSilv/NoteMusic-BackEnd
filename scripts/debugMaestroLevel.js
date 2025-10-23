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

const debugMaestroLevel = async () => {
  try {
    console.log('🔍 DEBUG DO NÍVEL MAESTRO');
    console.log('=' .repeat(50));

    // 1. Buscar todos os módulos
    console.log('\n📚 1. TODOS OS MÓDULOS:');
    console.log('-' .repeat(30));
    
    const response = await makeRequest('/modules');
    console.log(`✅ Status: ${response.status}`);
    
    if (response.data.modules && Array.isArray(response.data.modules)) {
      console.log(`📊 Total de módulos: ${response.data.modules.length}`);
      
      // Filtrar apenas módulos do nível Maestro
      const maestroModules = response.data.modules.filter(module => 
        module.level === 'maestro' || module.level === 'Maestro'
      );
      
      console.log(`\n🎯 MÓDULOS DO NÍVEL MAESTRO: ${maestroModules.length}`);
      console.log('-' .repeat(40));
      
      maestroModules.forEach((module, index) => {
        console.log(`\n${index + 1}. ${module.title}`);
        console.log(`   ID: ${module._id}`);
        console.log(`   Nível: ${module.level}`);
        console.log(`   Categoria: ${module.category}`);
        console.log(`   Ordem: ${module.order}`);
        console.log(`   Pontos: ${module.points}`);
        console.log(`   Descrição: ${module.description}`);
        
        // Verificar se tem conteúdo
        if (module.content) {
          console.log(`   Conteúdo: ${typeof module.content}`);
          if (typeof module.content === 'object') {
            console.log(`   Teoria: ${module.content.theory ? 'Sim' : 'Não'}`);
            console.log(`   Exemplos: ${module.content.examples ? module.content.examples.length : 0}`);
            console.log(`   Exercícios: ${module.content.exercises ? module.content.exercises.length : 0}`);
          }
        }
      });
      
      // 2. Testar busca de quiz para cada módulo Maestro
      console.log('\n🎯 2. TESTANDO QUIZZES DOS MÓDULOS MAESTRO:');
      console.log('-' .repeat(50));
      
      for (let i = 0; i < maestroModules.length; i++) {
        const module = maestroModules[i];
        console.log(`\n🔍 Testando módulo ${i + 1}: ${module.title}`);
        
        try {
          const quizResponse = await makeRequest(`/quiz/module/${module._id}`);
          console.log(`   Status: ${quizResponse.status}`);
          
          if (quizResponse.data.success && quizResponse.data.quiz) {
            const quiz = quizResponse.data.quiz;
            console.log(`   ✅ Quiz encontrado: ${quiz.title}`);
            console.log(`   ID do Quiz: ${quiz.id}`);
            console.log(`   Perguntas: ${quiz.questions ? quiz.questions.length : 0}`);
            console.log(`   Tempo limite: ${quiz.timeLimit}s`);
            
            if (quiz.questions && quiz.questions.length > 0) {
              console.log(`   📝 Primeira pergunta: ${quiz.questions[0].question}`);
            }
          } else {
            console.log(`   ❌ Quiz não encontrado:`, quizResponse.data);
          }
        } catch (error) {
          console.log(`   ❌ Erro ao buscar quiz: ${error.message}`);
        }
      }
      
      // 3. Verificar distribuição por categoria
      console.log('\n📂 3. DISTRIBUIÇÃO POR CATEGORIA (MAESTRO):');
      console.log('-' .repeat(50));
      
      const categoryDistribution = maestroModules.reduce((acc, module) => {
        acc[module.category] = (acc[module.category] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(categoryDistribution).forEach(([category, count]) => {
        console.log(`   📁 ${category}: ${count} módulo(s)`);
      });
      
    } else {
      console.log(`❌ Estrutura inválida:`, response.data);
    }

    console.log('\n🎉 DEBUG CONCLUÍDO!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  debugMaestroLevel();
}

module.exports = { debugMaestroLevel };



