const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Conectar ao banco
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
};

// Forçar restart da API
const forceAPIRestart = async () => {
  try {
    console.log('🔄 FORÇANDO RESTART DA API');
    console.log('=' .repeat(60));

    // 1. Parar todos os processos Node.js
    console.log('\n🛑 1. PARANDO PROCESSOS NODE.JS:');
    console.log('-' .repeat(40));
    
    const { exec } = require('child_process');
    
    exec('taskkill /f /im node.exe', (error, stdout, stderr) => {
      if (error) {
        console.log('ℹ️ Nenhum processo Node.js encontrado ou erro ao parar');
      } else {
        console.log('✅ Processos Node.js parados');
      }
    });

    // 2. Limpar cache do Node.js
    console.log('\n🧹 2. LIMPANDO CACHE:');
    console.log('-' .repeat(40));
    
    // Limpar require cache
    Object.keys(require.cache).forEach(key => {
      if (key.includes('module.controller') || key.includes('Module') || key.includes('Quiz')) {
        delete require.cache[key];
      }
    });
    
    console.log('✅ Cache limpo');

    // 3. Verificar se o servidor está rodando
    console.log('\n🔍 3. VERIFICANDO SERVIDOR:');
    console.log('-' .repeat(40));
    
    const netstat = require('child_process').exec('netstat -an | findstr :3333', (error, stdout, stderr) => {
      if (stdout.includes('3333')) {
        console.log('⚠️ Porta 3333 ainda está em uso');
      } else {
        console.log('✅ Porta 3333 está livre');
      }
    });

    // 4. Aguardar um pouco
    console.log('\n⏳ 4. AGUARDANDO...');
    console.log('-' .repeat(40));
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Aguardou 3 segundos');

    // 5. Iniciar servidor
    console.log('\n🚀 5. INICIANDO SERVIDOR:');
    console.log('-' .repeat(40));
    
    const serverPath = path.join(__dirname, '..', 'server.js');
    console.log(`📂 Caminho do servidor: ${serverPath}`);
    
    if (fs.existsSync(serverPath)) {
      console.log('✅ Arquivo server.js encontrado');
      
      // Iniciar servidor em background
      const serverProcess = require('child_process').spawn('node', [serverPath], {
        detached: true,
        stdio: 'ignore'
      });
      
      serverProcess.unref();
      console.log('✅ Servidor iniciado em background');
      
      // Aguardar servidor inicializar
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('✅ Aguardou 5 segundos para servidor inicializar');
      
    } else {
      console.log('❌ Arquivo server.js não encontrado');
    }

    // 6. Testar API
    console.log('\n🧪 6. TESTANDO API:');
    console.log('-' .repeat(40));
    
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('http://localhost:3333/api/modules');
      const data = await response.json();
      
      console.log(`📊 Status da API: ${response.status}`);
      console.log(`📊 Módulos retornados: ${data.count || data.modules?.length || 0}`);
      
      if (data.modules && data.modules.length > 0) {
        console.log('\n📈 DISTRIBUIÇÃO POR NÍVEL:');
        const modulesByLevel = {};
        data.modules.forEach(module => {
          if (!modulesByLevel[module.level]) {
            modulesByLevel[module.level] = [];
          }
          modulesByLevel[module.level].push(module);
        });
        
        Object.keys(modulesByLevel).forEach(level => {
          console.log(`   🎯 ${level.toUpperCase()}: ${modulesByLevel[level].length} módulos`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Erro ao testar API: ${error.message}`);
    }

    console.log('\n🎉 RESTART FORÇADO CONCLUÍDO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante o restart:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(forceAPIRestart);
}

module.exports = { forceAPIRestart };



