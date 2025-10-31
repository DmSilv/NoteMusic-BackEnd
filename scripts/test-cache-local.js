const axios = require('axios');

const API_URL = 'http://localhost:3333';

async function testCache() {
  console.log('🧪 Testando Sistema de Cache...\n');

  // Primeira chamada (sem cache)
  console.log('1️⃣ Primeira chamada (SEM cache)...');
  const start1 = Date.now();
  const res1 = await axios.get(`${API_URL}/api/modules`);
  const time1 = Date.now() - start1;
  console.log(`   ⏱️  Tempo: ${time1}ms`);
  console.log(`   📊 Módulos: ${res1.data.count || res1.data.modules.length}\n`);

  // Segunda chamada (COM cache)
  console.log('2️⃣ Segunda chamada (COM cache)...');
  const start2 = Date.now();
  const res2 = await axios.get(`${API_URL}/api/modules`);
  const time2 = Date.now() - start2;
  console.log(`   ⏱️  Tempo: ${time2}ms`);
  console.log(`   📊 Módulos: ${res2.data.count || res2.data.modules.length}\n`);

  // Terceira chamada (confirmar cache)
  console.log('3️⃣ Terceira chamada (confirmar cache)...');
  const start3 = Date.now();
  const res3 = await axios.get(`${API_URL}/api/modules`);
  const time3 = Date.now() - start3;
  console.log(`   ⏱️  Tempo: ${time3}ms\n`);

  // Análise
  const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
  const avgWithCache = ((time2 + time3) / 2).toFixed(0);

  console.log('='.repeat(50));
  console.log('📊 ANÁLISE DE PERFORMANCE');
  console.log('='.repeat(50));
  console.log(`Primeira (sem cache): ${time1}ms`);
  console.log(`Segunda (com cache):  ${time2}ms`);
  console.log(`Terceira (com cache): ${time3}ms`);
  console.log(`\n📈 Melhoria: ${improvement}% mais rápido com cache!`);
  console.log(`📈 Tempo médio com cache: ${avgWithCache}ms`);
  
  if (time2 < time1 * 0.3) {
    console.log('\n✅ Cache funcionando PERFEITAMENTE! (>70% mais rápido)');
  } else if (time2 < time1 * 0.5) {
    console.log('\n✅ Cache funcionando bem! (>50% mais rápido)');
  } else {
    console.log('\n⚠️ Cache pode não estar funcionando. Verifique os logs do servidor.');
  }
}

testCache().catch(error => {
  console.error('❌ Erro:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.error('⚠️ Servidor não está rodando! Execute: npm start');
  }
  process.exit(1);
});

