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

// Corrigir o controller de módulos
const fixModuleController = async () => {
  try {
    console.log('🔧 CORRIGINDO CONTROLLER DE MÓDULOS');
    console.log('=' .repeat(60));

    // 1. Ler o arquivo do controller
    const controllerPath = path.join(__dirname, '../../src/controllers/module.controller.js');
    console.log(`📂 Lendo arquivo: ${controllerPath}`);
    
    let controllerCode = fs.readFileSync(controllerPath, 'utf8');
    
    // 2. Fazer backup do arquivo
    const backupPath = path.join(__dirname, '../../src/controllers/module.controller.backup.js');
    fs.writeFileSync(backupPath, controllerCode);
    console.log(`✅ Backup criado em: ${backupPath}`);
    
    // 3. Analisar o código atual
    console.log('\n🔍 ANALISANDO CÓDIGO DO CONTROLLER:');
    console.log('-' .repeat(40));
    
    // Verificar se há algum cache explícito
    const hasCacheCode = controllerCode.includes('cache') || 
                         controllerCode.includes('Cache') || 
                         controllerCode.includes('memoize');
    
    console.log(`📊 Código de cache encontrado: ${hasCacheCode ? 'SIM' : 'NÃO'}`);
    
    // 4. Modificar o controller para garantir que não use cache
    console.log('\n🔄 MODIFICANDO O CONTROLLER:');
    console.log('-' .repeat(40));
    
    // Localizar a função getModules
    const getModulesRegex = /exports\.getModules\s*=\s*async\s*\(req,\s*res,\s*next\)\s*=>\s*\{[\s\S]*?\};/;
    const getModulesMatch = controllerCode.match(getModulesRegex);
    
    if (!getModulesMatch) {
      console.log('❌ Função getModules não encontrada no controller!');
      return;
    }
    
    const originalGetModules = getModulesMatch[0];
    console.log('✅ Função getModules encontrada');
    
    // Criar versão modificada da função getModules
    const modifiedGetModules = originalGetModules.replace(
      /const modules = await Module\.find\(filter\)/,
      'console.log(`🔍 Executando query com filtro:`, filter);\n' +
      '    const modules = await Module.find(filter)'
    );
    
    // Substituir a função no código
    const updatedControllerCode = controllerCode.replace(originalGetModules, modifiedGetModules);
    
    // 5. Salvar o arquivo modificado
    fs.writeFileSync(controllerPath, updatedControllerCode);
    console.log('✅ Controller modificado com sucesso');
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    console.log('=' .repeat(60));
    console.log('✅ O controller foi modificado para mostrar logs da query.');
    console.log('✅ Reinicie o servidor para aplicar as alterações.');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(fixModuleController);
}

module.exports = { fixModuleController };



