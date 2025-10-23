const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../src/models/Module');

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

// Testar a consulta exata da API
const testAPIController = async () => {
  try {
    console.log('🧪 TESTANDO CONSULTA DA API');
    console.log('=' .repeat(60));

    // Simular a consulta exata do controller
    const filter = { isActive: true };
    console.log('🔍 Filtro aplicado:', filter);

    const modules = await Module.find(filter)
      .sort({ order: 1 })
      .select('-content.exercises');

    console.log(`\n📊 RESULTADO DA CONSULTA:`);
    console.log(`   Total de módulos: ${modules.length}`);
    
    // Agrupar por nível
    const levelGroups = {};
    modules.forEach(module => {
      if (!levelGroups[module.level]) {
        levelGroups[module.level] = [];
      }
      levelGroups[module.level].push(module);
    });
    
    Object.entries(levelGroups).forEach(([level, levelModules]) => {
      console.log(`\n🎯 ${level.toUpperCase()}: ${levelModules.length} módulos`);
      levelModules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title} (${module.category})`);
      });
    });

    // Verificar se há módulos com isActive = false
    console.log('\n🔍 VERIFICAÇÃO DE MÓDULOS INATIVOS:');
    console.log('-' .repeat(40));
    
    const inactiveModules = await Module.find({ isActive: false });
    console.log(`📊 Módulos inativos: ${inactiveModules.length}`);
    
    if (inactiveModules.length > 0) {
      console.log('⚠️ Módulos inativos encontrados:');
      inactiveModules.forEach(module => {
        console.log(`   - ${module.title} (${module.level})`);
      });
    }

    // Verificar se há módulos sem isActive
    console.log('\n🔍 VERIFICAÇÃO DE MÓDULOS SEM isActive:');
    console.log('-' .repeat(40));
    
    const modulesWithoutIsActive = await Module.find({ isActive: { $exists: false } });
    console.log(`📊 Módulos sem campo isActive: ${modulesWithoutIsActive.length}`);
    
    if (modulesWithoutIsActive.length > 0) {
      console.log('⚠️ Módulos sem isActive encontrados:');
      modulesWithoutIsActive.forEach(module => {
        console.log(`   - ${module.title} (${module.level})`);
      });
    }

    // Verificar todos os módulos sem filtro
    console.log('\n🔍 VERIFICAÇÃO DE TODOS OS MÓDULOS:');
    console.log('-' .repeat(40));
    
    const allModules = await Module.find({}).sort({ order: 1 });
    console.log(`📊 Total de módulos no banco: ${allModules.length}`);
    
    // Verificar valores de isActive
    const activeCount = allModules.filter(m => m.isActive === true).length;
    const inactiveCount = allModules.filter(m => m.isActive === false).length;
    const undefinedCount = allModules.filter(m => m.isActive === undefined).length;
    
    console.log(`📊 Módulos ativos (isActive: true): ${activeCount}`);
    console.log(`📊 Módulos inativos (isActive: false): ${inactiveCount}`);
    console.log(`📊 Módulos sem isActive: ${undefinedCount}`);

    // Listar todos os módulos com seus status
    console.log('\n📋 LISTA COMPLETA COM STATUS:');
    console.log('-' .repeat(40));
    
    allModules.forEach((module, index) => {
      const status = module.isActive === true ? '✅' : module.isActive === false ? '❌' : '❓';
      console.log(`${index + 1}. ${status} ${module.title} (${module.level}) - isActive: ${module.isActive}`);
    });

    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(testAPIController);
}

module.exports = { testAPIController };



