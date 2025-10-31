const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3333';

// Função para medir tempo de resposta
async function measureTime(fn, label) {
  const start = Date.now();
  try {
    const response = await fn();
    const end = Date.now();
    const time = end - start;
    return { time, success: true, response, label };
  } catch (error) {
    const end = Date.now();
    const time = end - start;
    return { time, success: false, error: error.message, label };
  }
}

// Testes de performance
async function runPerformanceTests() {
  console.log('🚀 Iniciando testes de performance do backend...\n');
  console.log(`📍 URL da API: ${API_URL}\n`);

  const results = [];

  // Teste 1: Health Check
  console.log('1️⃣ Testando Health Check...');
  const healthTest = await measureTime(
    () => axios.get(`${API_URL}/api/health`),
    'Health Check'
  );
  results.push(healthTest);
  console.log(`   ✅ Tempo: ${healthTest.time}ms\n`);

  // Teste 2: Listar Módulos (sem cache na primeira vez)
  console.log('2️⃣ Testando GET /api/modules (primeira chamada - sem cache)...');
  const modulesTest1 = await measureTime(
    () => axios.get(`${API_URL}/api/modules`),
    'GET /api/modules (sem cache)'
  );
  results.push(modulesTest1);
  console.log(`   ✅ Tempo: ${modulesTest1.time}ms`);
  if (modulesTest1.success) {
    console.log(`   📊 Módulos retornados: ${modulesTest1.response.data.count || 0}\n`);
  } else {
    console.log(`   ❌ Erro: ${modulesTest1.error}\n`);
  }

  // Teste 3: Listar Módulos (com cache na segunda vez)
  console.log('3️⃣ Testando GET /api/modules (segunda chamada - COM cache)...');
  const modulesTest2 = await measureTime(
    () => axios.get(`${API_URL}/api/modules`),
    'GET /api/modules (com cache)'
  );
  results.push(modulesTest2);
  console.log(`   ✅ Tempo: ${modulesTest2.time}ms`);
  if (modulesTest2.success && modulesTest1.success) {
    const improvement = ((modulesTest1.time - modulesTest2.time) / modulesTest1.time * 100).toFixed(1);
    console.log(`   📈 Melhoria: ${improvement}% mais rápido com cache!\n`);
  } else {
    console.log(`   ⚠️ Não foi possível calcular melhoria\n`);
  }

  // Teste 4: Categorias
  console.log('4️⃣ Testando GET /api/modules/categories...');
  const categoriesTest = await measureTime(
    () => axios.get(`${API_URL}/api/modules/categories`),
    'GET /api/modules/categories'
  );
  results.push(categoriesTest);
  console.log(`   ✅ Tempo: ${categoriesTest.time}ms\n`);

  // Teste 5: Stats de Módulos
  console.log('5️⃣ Testando GET /api/modules/stats...');
  const statsTest = await measureTime(
    () => axios.get(`${API_URL}/api/modules/stats`),
    'GET /api/modules/stats'
  );
  results.push(statsTest);
  console.log(`   ✅ Tempo: ${statsTest.time}ms\n`);

  // Resumo dos resultados
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DOS TESTES DE PERFORMANCE');
  console.log('='.repeat(60) + '\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Testes bem-sucedidos: ${successful.length}/${results.length}`);
  if (failed.length > 0) {
    console.log(`❌ Testes falhados: ${failed.length}`);
    failed.forEach(f => console.log(`   - ${f.label}: ${f.error}`));
  }

  if (successful.length > 0) {
    const times = successful.map(r => r.time);
    const avgTime = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`\n⏱️  Tempos de resposta:`);
    console.log(`   - Média: ${avgTime}ms`);
    console.log(`   - Mínimo: ${minTime}ms`);
    console.log(`   - Máximo: ${maxTime}ms`);

    console.log(`\n📋 Detalhamento:`);
    successful.forEach(r => {
      const status = r.time < 200 ? '🟢' : r.time < 500 ? '🟡' : '🔴';
      console.log(`   ${status} ${r.label}: ${r.time}ms`);
    });

    // Avaliação geral
    console.log(`\n🎯 Avaliação:`);
    if (avgTime < 200) {
      console.log(`   🟢 Excelente! Performance muito boa (média < 200ms)`);
    } else if (avgTime < 500) {
      console.log(`   🟡 Boa performance, mas pode melhorar (média < 500ms)`);
    } else {
      console.log(`   🔴 Performance precisa de otimização (média > 500ms)`);
      console.log(`   💡 Dicas:`);
      console.log(`      - Verifique se os índices do MongoDB estão criados`);
      console.log(`      - Verifique se o cache está funcionando`);
      console.log(`      - Considere adicionar mais índices nas queries lentas`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// Executar testes
runPerformanceTests().catch(error => {
  console.error('❌ Erro ao executar testes:', error.message);
  process.exit(1);
});

