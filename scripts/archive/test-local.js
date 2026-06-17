const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3333';

async function testLocalBackend() {
  console.log('🧪 Testando backend local...\n');
  console.log(`📍 URL: ${API_URL}\n`);

  const tests = [
    {
      name: 'Health Check (/api/health)',
      url: `${API_URL}/api/health`,
      method: 'GET'
    },
    {
      name: 'Health Check Root (/health)',
      url: `${API_URL}/health`,
      method: 'GET'
    },
    {
      name: 'Listar Módulos',
      url: `${API_URL}/api/modules`,
      method: 'GET'
    },
    {
      name: 'Categorias',
      url: `${API_URL}/api/modules/categories`,
      method: 'GET'
    },
    {
      name: 'Stats de Módulos',
      url: `${API_URL}/api/modules/stats`,
      method: 'GET'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const start = Date.now();
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000
      });
      const time = Date.now() - start;

      if (response.status === 200) {
        console.log(`✅ ${test.name}: ${time}ms`);
        passed++;
        
        // Mostrar dados úteis
        if (test.name === 'Listar Módulos' && response.data.modules) {
          console.log(`   📊 Módulos encontrados: ${response.data.count || response.data.modules.length}`);
        }
        if (test.name === 'Health Check (/api/health)') {
          console.log(`   📊 Status: ${response.data.status}`);
          console.log(`   📊 Ambiente: ${response.data.environment}`);
        }
      } else {
        console.log(`❌ ${test.name}: Status ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESUMO: ${passed} passaram, ${failed} falharam`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n✅ Todos os testes passaram! Backend está funcionando corretamente.');
    console.log('✅ Pronto para fazer commit e deploy!');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique os erros acima.');
    process.exit(1);
  }
}

// Aguardar um pouco para o servidor iniciar
setTimeout(() => {
  testLocalBackend().catch(error => {
    console.error('❌ Erro ao executar testes:', error.message);
    process.exit(1);
  });
}, 2000);

