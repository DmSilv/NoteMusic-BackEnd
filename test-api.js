const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('🧪 Testando API...');
    
    // Teste 1: Health Check
    console.log('\n1. Testando Health Check...');
    const healthResponse = await fetch('http://localhost:3333/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    
    // Teste 2: Login
    console.log('\n2. Testando Login...');
    const loginResponse = await fetch('http://localhost:3333/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teste@notemusic.com',
        password: 'senha123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login bem-sucedido:', loginData);
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Erro no login:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

testAPI(); 