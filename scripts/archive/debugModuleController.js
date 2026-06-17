const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../../src/models/module.model');
const Quiz = require('../../src/models/quiz.model');

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

// Debug do controller de módulos
const debugModuleController = async () => {
  try {
    console.log('🔍 DEBUG DO CONTROLLER DE MÓDULOS');
    console.log('=' .repeat(60));

    // 1. Simular a query do controller getModules
    console.log('\n📚 1. SIMULANDO QUERY DO CONTROLLER:');
    console.log('-' .repeat(40));
    
    const filter = { isActive: true };
    const modules = await Module.find(filter)
      .sort({ order: 1 })
      .select('-content.exercises');

    console.log(`📊 Total de módulos retornados: ${modules.length}`);

    // Distribuição por nível
    const modulesByLevel = {};
    modules.forEach(module => {
      if (!modulesByLevel[module.level]) {
        modulesByLevel[module.level] = [];
      }
      modulesByLevel[module.level].push(module);
    });

    console.log('\n📈 DISTRIBUIÇÃO POR NÍVEL:');
    Object.keys(modulesByLevel).forEach(level => {
      console.log(`   🎯 ${level.toUpperCase()}: ${modulesByLevel[level].length} módulos`);
      modulesByLevel[level].forEach((module, index) => {
        console.log(`      - ${module.title}`);
      });
    });

    // 2. Verificar se há módulos com isActive=false
    console.log('\n🔍 2. VERIFICANDO MÓDULOS INATIVOS:');
    console.log('-' .repeat(40));
    
    const inactiveModules = await Module.find({ isActive: false });
    console.log(`📊 Total de módulos inativos: ${inactiveModules.length}`);
    
    if (inactiveModules.length > 0) {
      console.log('⚠️ MÓDULOS INATIVOS ENCONTRADOS:');
      inactiveModules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title} (${module.level})`);
      });
    }

    // 3. Verificar se há módulos sem isActive definido
    console.log('\n🔍 3. VERIFICANDO MÓDULOS SEM isActive:');
    console.log('-' .repeat(40));
    
    const undefinedActiveModules = await Module.find({ isActive: { $exists: false } });
    console.log(`📊 Total de módulos sem isActive: ${undefinedActiveModules.length}`);
    
    if (undefinedActiveModules.length > 0) {
      console.log('⚠️ MÓDULOS SEM isActive ENCONTRADOS:');
      undefinedActiveModules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title} (${module.level})`);
      });
    }

    // 4. Verificar se há módulos antigos e novos juntos
    console.log('\n🔍 4. COMPARANDO MÓDULOS ANTIGOS E NOVOS:');
    console.log('-' .repeat(40));
    
    const oldTitles = ['As 7 Notas Musicais', 'Figuras de Valor - Duração das Notas', 'Compasso Simples - 2/4, 3/4, 4/4'];
    const newTitles = ['Propriedades do Som', 'Notas Musicais', 'Pauta Musical'];
    
    const oldModules = await Module.find({ title: { $in: oldTitles } });
    const newModules = await Module.find({ title: { $in: newTitles } });
    
    console.log(`📊 Módulos com títulos antigos: ${oldModules.length}`);
    console.log(`📊 Módulos com títulos novos: ${newModules.length}`);
    
    if (oldModules.length > 0 && newModules.length > 0) {
      console.log('⚠️ PROBLEMA: Há módulos antigos e novos juntos no banco!');
    }

    // 5. Verificar se há módulos duplicados
    console.log('\n🔍 5. VERIFICANDO MÓDULOS DUPLICADOS:');
    console.log('-' .repeat(40));
    
    const duplicateModules = await Module.aggregate([
      { $group: { _id: "$title", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    console.log(`📊 Total de títulos duplicados: ${duplicateModules.length}`);
    
    if (duplicateModules.length > 0) {
      console.log('⚠️ TÍTULOS DUPLICADOS ENCONTRADOS:');
      duplicateModules.forEach((dup, index) => {
        console.log(`   ${index + 1}. "${dup._id}" (${dup.count} vezes)`);
      });
      
      // Listar os módulos duplicados
      for (const dup of duplicateModules) {
        const dupes = await Module.find({ title: dup._id });
        console.log(`\n   Módulos com título "${dup._id}":`);
        dupes.forEach((module, i) => {
          console.log(`      ${i + 1}. ID: ${module._id}, Level: ${module.level}, isActive: ${module.isActive}`);
        });
      }
    }

    // 6. Verificar se há módulos com ordem duplicada dentro do mesmo nível
    console.log('\n🔍 6. VERIFICANDO ORDENS DUPLICADAS POR NÍVEL:');
    console.log('-' .repeat(40));
    
    const levels = ['aprendiz', 'virtuoso', 'maestro'];
    
    for (const level of levels) {
      const modulesInLevel = await Module.find({ level });
      
      const orderCounts = {};
      modulesInLevel.forEach(module => {
        if (!orderCounts[module.order]) {
          orderCounts[module.order] = [];
        }
        orderCounts[module.order].push(module);
      });
      
      const duplicateOrders = Object.entries(orderCounts)
        .filter(([order, modules]) => modules.length > 1);
      
      console.log(`📊 ${level.toUpperCase()}: ${duplicateOrders.length} ordens duplicadas`);
      
      if (duplicateOrders.length > 0) {
        console.log(`⚠️ ORDENS DUPLICADAS EM ${level.toUpperCase()}:`);
        duplicateOrders.forEach(([order, modules]) => {
          console.log(`   Ordem ${order}:`);
          modules.forEach((module, i) => {
            console.log(`      ${i + 1}. ${module.title} (ID: ${module._id})`);
          });
        });
      }
    }

    // 7. Verificar todos os módulos e seus status
    console.log('\n📋 7. LISTA COMPLETA DE MÓDULOS:');
    console.log('-' .repeat(40));
    
    const allModules = await Module.find({}).sort({ level: 1, order: 1 });
    
    console.log(`📊 Total de módulos no banco: ${allModules.length}`);
    
    const modulesByLevelComplete = {};
    allModules.forEach(module => {
      if (!modulesByLevelComplete[module.level]) {
        modulesByLevelComplete[module.level] = [];
      }
      modulesByLevelComplete[module.level].push(module);
    });
    
    Object.keys(modulesByLevelComplete).forEach(level => {
      console.log(`\n   🎯 ${level.toUpperCase()}: ${modulesByLevelComplete[level].length} módulos`);
      modulesByLevelComplete[level].forEach((module, index) => {
        const status = module.isActive === true ? '✅' : module.isActive === false ? '❌' : '❓';
        console.log(`      ${index + 1}. ${status} ${module.title} (Ordem: ${module.order}, ID: ${module._id})`);
      });
    });

    console.log('\n🎉 DEBUG CONCLUÍDO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(debugModuleController);
}

module.exports = { debugModuleController };



