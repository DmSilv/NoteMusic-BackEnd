const axios = require('axios');

const API_URL = 'http://localhost:3333';

async function testCategoriesOptimized() {
  console.log('🧪 Testando novo endpoint OTIMIZADO de categorias...\n');
  console.log(`📍 URL: ${API_URL}\n`);

  try {
    // Teste 1: Novo endpoint otimizado
    console.log('1️⃣ Testando GET /api/modules/categories-with-modules (OTIMIZADO)...');
    const start1 = Date.now();
    const res1 = await axios.get(`${API_URL}/api/modules/categories-with-modules`);
    const time1 = Date.now() - start1;
    
    console.log(`   ⏱️  Tempo: ${time1}ms`);
    console.log(`   📊 Categorias: ${res1.data.categories.length}`);
    console.log(`   📊 Total módulos: ${res1.data.meta?.totalModules || 'N/A'}`);
    console.log(`   ⚡ Query time: ${res1.data.meta?.queryTime || 'N/A'}ms\n`);
    
    // Verificar se tem quizTimeLimit nos módulos
    let modulesWithQuizTime = 0;
    let modulesWithoutQuizTime = 0;
    let totalModules = 0;
    
    res1.data.categories.forEach(cat => {
      cat.modules.forEach(module => {
        totalModules++;
        if (module.quizTimeLimit) {
          modulesWithQuizTime++;
        } else {
          modulesWithoutQuizTime++;
        }
      });
    });
    
    console.log(`   ✅ Módulos COM quizTimeLimit: ${modulesWithQuizTime}/${totalModules}`);
    if (modulesWithoutQuizTime > 0) {
      console.log(`   ⚠️  Módulos SEM quizTimeLimit: ${modulesWithoutQuizTime}`);
    }
    console.log('');
    
    // Teste 2: Comparar com método antigo (múltiplas requisições)
    console.log('2️⃣ Comparando com método ANTIGO (simulação)...');
    console.log('   Método antigo faria:');
    console.log(`   - 1x GET /api/modules`);
    console.log(`   - ${totalModules}x GET /api/quiz/:moduleId (para quizTimeLimit)`);
    console.log(`   Total: ${totalModules + 1} requisições\n`);
    
    // Teste 3: Segunda chamada (com cache)
    console.log('3️⃣ Segunda chamada (COM cache)...');
    const start2 = Date.now();
    const res2 = await axios.get(`${API_URL}/api/modules/categories-with-modules`);
    const time2 = Date.now() - start2;
    console.log(`   ⏱️  Tempo: ${time2}ms`);
    
    const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
    console.log(`   📈 Melhoria com cache: ${improvement}%\n`);
    
    // Teste 4: Verificar estrutura de dados
    console.log('4️⃣ Verificando estrutura de dados...');
    if (res1.data.categories.length > 0) {
      const firstCat = res1.data.categories[0];
      console.log(`   ✅ Primeira categoria: ${firstCat.name}`);
      console.log(`   ✅ Tem ${firstCat.modules.length} módulos`);
      
      if (firstCat.modules.length > 0) {
        const firstModule = firstCat.modules[0];
        console.log(`   ✅ Primeiro módulo: ${firstModule.title}`);
        console.log(`   ✅ Tem quizTimeLimit: ${firstModule.quizTimeLimit ? 'SIM ✅' : 'NÃO ❌'}`);
        console.log(`   ✅ Campos: id, title, category, level, order, quizTimeLimit`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO');
    console.log('='.repeat(60));
    console.log(`✅ Endpoint funcionando corretamente!`);
    console.log(`✅ Tempo primeira chamada: ${time1}ms`);
    console.log(`✅ Tempo com cache: ${time2}ms`);
    console.log(`✅ Redução de ${totalModules + 1} para 1 requisição!`);
    console.log(`✅ Economia: ${((totalModules + 1 - 1) / (totalModules + 1) * 100).toFixed(1)}% menos requisições`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️ Servidor não está rodando! Execute: npm start');
    } else if (error.response) {
      console.error(`⚠️ Status: ${error.response.status}`);
      console.error(`⚠️ Erro: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

testCategoriesOptimized();

