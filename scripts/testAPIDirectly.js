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

const testAPIDirectly = async () => {
  try {
    console.log('🔍 TESTE DIRETO DA API');
    console.log('=' .repeat(60));

    // 1. Testar endpoint de módulos
    console.log('\n📚 1. TESTANDO /api/modules:');
    console.log('-' .repeat(40));
    
    const modulesResponse = await makeRequest('/modules');
    console.log(`✅ Status: ${modulesResponse.status}`);
    
    if (modulesResponse.data.modules && Array.isArray(modulesResponse.data.modules)) {
      const modules = modulesResponse.data.modules;
      console.log(`📊 Total de módulos retornados: ${modules.length}`);
      
      // Listar todos os módulos
      modules.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title}`);
        console.log(`   ID: ${module._id}`);
        console.log(`   Nível: ${module.level}`);
        console.log(`   Categoria: ${module.category}`);
        console.log(`   Ordem: ${module.order}`);
        console.log(`   Ativo: ${module.isActive}`);
        console.log('');
      });
      
      // Verificar se há módulos faltando
      const expectedModules = [
        'Propriedades do Som - Os Pilares da Música',
        'Notas Musicais e Solfejo - O ABC da Música',
        'Pauta Musical e Claves - Onde Escrevemos a Música',
        'Figuras de Valor - A Duração das Notas',
        'Compassos Simples - Organizando o Tempo',
        'Escalas Maiores - A Base da Harmonia',
        'Escalas Menores - A Expressão Musical',
        'Intervalos Musicais - A Distância Entre as Notas',
        'Acordes Básicos - A Harmonia em Ação',
        'Modos Gregos - As Cores da Música',
        'Harmonia Avançada - A Orquestração Completa',
        'Contraponto - A Arte da Voz Independente',
        'Orquestração - Pintando com Sons'
      ];
      
      console.log('\n🔍 VERIFICAÇÃO DE MÓDULOS ESPERADOS:');
      console.log('-' .repeat(40));
      
      const foundModules = modules.map(m => m.title);
      const missingModules = expectedModules.filter(title => !foundModules.includes(title));
      const extraModules = foundModules.filter(title => !expectedModules.includes(title));
      
      console.log(`📊 Módulos esperados: ${expectedModules.length}`);
      console.log(`📊 Módulos encontrados: ${foundModules.length}`);
      console.log(`📊 Módulos faltando: ${missingModules.length}`);
      console.log(`📊 Módulos extras: ${extraModules.length}`);
      
      if (missingModules.length > 0) {
        console.log('\n❌ MÓDULOS FALTANDO:');
        missingModules.forEach((title, index) => {
          console.log(`${index + 1}. ${title}`);
        });
      }
      
      if (extraModules.length > 0) {
        console.log('\n❌ MÓDULOS EXTRAS:');
        extraModules.forEach((title, index) => {
          console.log(`${index + 1}. ${title}`);
        });
      }
      
      if (missingModules.length === 0 && extraModules.length === 0) {
        console.log('\n✅ TODOS OS MÓDULOS ESTÃO PRESENTES!');
      }
      
    } else {
      console.log(`❌ Estrutura inválida na resposta:`, modulesResponse.data);
    }

    // 2. Testar endpoint de quizzes
    console.log('\n🎯 2. TESTANDO QUIZZES:');
    console.log('-' .repeat(40));
    
    let totalQuestions = 0;
    let totalQuizzes = 0;
    
    if (modulesResponse.data.modules && Array.isArray(modulesResponse.data.modules)) {
      const modules = modulesResponse.data.modules;
      
      for (const module of modules) {
        try {
          const quizResponse = await makeRequest(`/quiz/module/${module._id}`);
          
          if (quizResponse.data.success && quizResponse.data.quiz) {
            const quiz = quizResponse.data.quiz;
            const questionCount = quiz.questions ? quiz.questions.length : 0;
            totalQuestions += questionCount;
            totalQuizzes++;
            
            console.log(`✅ ${quiz.title}: ${questionCount} perguntas`);
          } else {
            console.log(`❌ Quiz não encontrado para: ${module.title}`);
          }
        } catch (error) {
          console.log(`❌ Erro ao buscar quiz para ${module.title}: ${error.message}`);
        }
      }
      
      console.log(`\n📊 RESUMO DOS QUIZZES:`);
      console.log(`   Total de quizzes: ${totalQuizzes}`);
      console.log(`   Total de perguntas: ${totalQuestions}`);
      console.log(`   Média de perguntas por quiz: ${totalQuizzes > 0 ? Math.round(totalQuestions / totalQuizzes) : 0}`);
    }

    console.log('\n🎉 TESTE DIRETO DA API CONCLUÍDO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  testAPIDirectly();
}

module.exports = { testAPIDirectly };



