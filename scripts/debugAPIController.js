const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../src/models/Module');
const Quiz = require('../src/models/Quiz');

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

const debugAPIController = async () => {
  try {
    console.log('🔍 DEBUG DO CONTROLLER DA API');
    console.log('=' .repeat(60));

    // 1. Simular a consulta do getModules
    console.log('\n📚 1. SIMULANDO CONSULTA getModules:');
    console.log('-' .repeat(40));
    
    const filter = { isActive: true };
    console.log(`🔍 Filtro aplicado:`, filter);
    
    const modules = await Module.find(filter)
      .sort({ order: 1 })
      .select('-content.exercises');
    
    console.log(`📊 Total de módulos encontrados: ${modules.length}`);
    
    // 2. Verificar cada módulo
    console.log('\n📋 2. MÓDULOS ENCONTRADOS:');
    console.log('-' .repeat(40));
    
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title}`);
      console.log(`   ID: ${module._id}`);
      console.log(`   Nível: ${module.level}`);
      console.log(`   Categoria: ${module.category}`);
      console.log(`   Ordem: ${module.order}`);
      console.log(`   Ativo: ${module.isActive}`);
      console.log('');
    });

    // 3. Verificar se há módulos com isActive = false
    console.log('\n🔍 3. VERIFICANDO MÓDULOS INATIVOS:');
    console.log('-' .repeat(40));
    
    const inactiveModules = await Module.find({ isActive: false });
    console.log(`📊 Módulos inativos: ${inactiveModules.length}`);
    
    if (inactiveModules.length > 0) {
      inactiveModules.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level})`);
      });
    }

    // 4. Verificar se há módulos sem order
    console.log('\n🔍 4. VERIFICANDO MÓDULOS SEM ORDER:');
    console.log('-' .repeat(40));
    
    const modulesWithoutOrder = await Module.find({ order: { $exists: false } });
    console.log(`📊 Módulos sem order: ${modulesWithoutOrder.length}`);
    
    if (modulesWithoutOrder.length > 0) {
      modulesWithoutOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level})`);
      });
    }

    // 5. Verificar se há módulos com order null
    console.log('\n🔍 5. VERIFICANDO MÓDULOS COM ORDER NULL:');
    console.log('-' .repeat(40));
    
    const modulesWithNullOrder = await Module.find({ order: null });
    console.log(`📊 Módulos com order null: ${modulesWithNullOrder.length}`);
    
    if (modulesWithNullOrder.length > 0) {
      modulesWithNullOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level})`);
      });
    }

    // 6. Verificar se há módulos com order 0
    console.log('\n🔍 6. VERIFICANDO MÓDULOS COM ORDER 0:');
    console.log('-' .repeat(40));
    
    const modulesWithZeroOrder = await Module.find({ order: 0 });
    console.log(`📊 Módulos com order 0: ${modulesWithZeroOrder.length}`);
    
    if (modulesWithZeroOrder.length > 0) {
      modulesWithZeroOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level})`);
      });
    }

    // 7. Verificar se há módulos com order negativo
    console.log('\n🔍 7. VERIFICANDO MÓDULOS COM ORDER NEGATIVO:');
    console.log('-' .repeat(40));
    
    const modulesWithNegativeOrder = await Module.find({ order: { $lt: 0 } });
    console.log(`📊 Módulos com order negativo: ${modulesWithNegativeOrder.length}`);
    
    if (modulesWithNegativeOrder.length > 0) {
      modulesWithNegativeOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level})`);
      });
    }

    // 8. Verificar se há módulos com order muito alto
    console.log('\n🔍 8. VERIFICANDO MÓDULOS COM ORDER MUITO ALTO:');
    console.log('-' .repeat(40));
    
    const modulesWithHighOrder = await Module.find({ order: { $gt: 100 } });
    console.log(`📊 Módulos com order > 100: ${modulesWithHighOrder.length}`);
    
    if (modulesWithHighOrder.length > 0) {
      modulesWithHighOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level}) - Order: ${module.order}`);
      });
    }

    // 9. Verificar se há módulos com order duplicado
    console.log('\n🔍 9. VERIFICANDO MÓDULOS COM ORDER DUPLICADO:');
    console.log('-' .repeat(40));
    
    const duplicateOrders = await Module.aggregate([
      { $group: { _id: "$order", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    console.log(`📊 Orders duplicados: ${duplicateOrders.length}`);
    
    if (duplicateOrders.length > 0) {
      duplicateOrders.forEach(dup => {
        console.log(`   Order ${dup._id}: ${dup.count} módulos`);
      });
    }

    // 10. Verificar se há módulos com order undefined
    console.log('\n🔍 10. VERIFICANDO MÓDULOS COM ORDER UNDEFINED:');
    console.log('-' .repeat(40));
    
    const modulesWithUndefinedOrder = await Module.find({ order: undefined });
    console.log(`📊 Módulos com order undefined: ${modulesWithUndefinedOrder.length}`);
    
    if (modulesWithUndefinedOrder.length > 0) {
      modulesWithUndefinedOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level})`);
      });
    }

    // 11. Verificar se há módulos com order NaN
    console.log('\n🔍 11. VERIFICANDO MÓDULOS COM ORDER NaN:');
    console.log('-' .repeat(40));
    
    const modulesWithNaNOrder = await Module.find({ order: NaN });
    console.log(`📊 Módulos com order NaN: ${modulesWithNaNOrder.length}`);
    
    if (modulesWithNaNOrder.length > 0) {
      modulesWithNaNOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level})`);
      });
    }

    // 12. Verificar se há módulos com order Infinity
    console.log('\n🔍 12. VERIFICANDO MÓDULOS COM ORDER INFINITY:');
    console.log('-' .repeat(40));
    
    const modulesWithInfinityOrder = await Module.find({ order: Infinity });
    console.log(`📊 Módulos com order Infinity: ${modulesWithInfinityOrder.length}`);
    
    if (modulesWithInfinityOrder.length > 0) {
      modulesWithInfinityOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level})`);
      });
    }

    // 13. Verificar se há módulos com order -Infinity
    console.log('\n🔍 13. VERIFICANDO MÓDULOS COM ORDER -INFINITY:');
    console.log('-' .repeat(40));
    
    const modulesWithNegativeInfinityOrder = await Module.find({ order: -Infinity });
    console.log(`📊 Módulos com order -Infinity: ${modulesWithNegativeInfinityOrder.length}`);
    
    if (modulesWithNegativeInfinityOrder.length > 0) {
      modulesWithNegativeInfinityOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level})`);
      });
    }

    // 14. Verificar se há módulos com order string
    console.log('\n🔍 14. VERIFICANDO MÓDULOS COM ORDER STRING:');
    console.log('-' .repeat(40));
    
    const modulesWithStringOrder = await Module.find({ order: { $type: "string" } });
    console.log(`📊 Módulos com order string: ${modulesWithStringOrder.length}`);
    
    if (modulesWithStringOrder.length > 0) {
      modulesWithStringOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level}) - Order: "${module.order}"`);
      });
    }

    // 15. Verificar se há módulos com order array
    console.log('\n🔍 15. VERIFICANDO MÓDULOS COM ORDER ARRAY:');
    console.log('-' .repeat(40));
    
    const modulesWithArrayOrder = await Module.find({ order: { $type: "array" } });
    console.log(`📊 Módulos com order array: ${modulesWithArrayOrder.length}`);
    
    if (modulesWithArrayOrder.length > 0) {
      modulesWithArrayOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level}) - Order: [${module.order}]`);
      });
    }

    // 16. Verificar se há módulos com order object
    console.log('\n🔍 16. VERIFICANDO MÓDULOS COM ORDER OBJECT:');
    console.log('-' .repeat(40));
    
    const modulesWithObjectOrder = await Module.find({ order: { $type: "object" } });
    console.log(`📊 Módulos com order object: ${modulesWithObjectOrder.length}`);
    
    if (modulesWithObjectOrder.length > 0) {
      modulesWithObjectOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level}) - Order: ${JSON.stringify(module.order)}`);
      });
    }

    // 17. Verificar se há módulos com order boolean
    console.log('\n🔍 17. VERIFICANDO MÓDULOS COM ORDER BOOLEAN:');
    console.log('-' .repeat(40));
    
    const modulesWithBooleanOrder = await Module.find({ order: { $type: "bool" } });
    console.log(`📊 Módulos com order boolean: ${modulesWithBooleanOrder.length}`);
    
    if (modulesWithBooleanOrder.length > 0) {
      modulesWithBooleanOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level}) - Order: ${module.order}`);
      });
    }

    // 18. Verificar se há módulos com order date
    console.log('\n🔍 18. VERIFICANDO MÓDULOS COM ORDER DATE:');
    console.log('-' .repeat(40));
    
    const modulesWithDateOrder = await Module.find({ order: { $type: "date" } });
    console.log(`📊 Módulos com order date: ${modulesWithDateOrder.length}`);
    
    if (modulesWithDateOrder.length > 0) {
      modulesWithDateOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level}) - Order: ${module.order}`);
      });
    }

    // 19. Verificar se há módulos com order null
    console.log('\n🔍 19. VERIFICANDO MÓDULOS COM ORDER NULL:');
    console.log('-' .repeat(40));
    
    const modulesWithNullOrder2 = await Module.find({ order: { $type: "null" } });
    console.log(`📊 Módulos com order null: ${modulesWithNullOrder2.length}`);
    
    if (modulesWithNullOrder2.length > 0) {
      modulesWithNullOrder2.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level}) - Order: ${module.order}`);
      });
    }

    // 20. Verificar se há módulos com order undefined
    console.log('\n🔍 20. VERIFICANDO MÓDULOS COM ORDER UNDEFINED:');
    console.log('-' .repeat(40));
    
    const modulesWithUndefinedOrder2 = await Module.find({ order: { $type: "undefined" } });
    console.log(`📊 Módulos com order undefined: ${modulesWithUndefinedOrder2.length}`);
    
    if (modulesWithUndefinedOrder2.length > 0) {
      modulesWithUndefinedOrder2.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} (${module.level}) - Order: ${module.order}`);
      });
    }

    console.log('\n🎉 DEBUG DO CONTROLLER CONCLUÍDO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(debugAPIController);
}

module.exports = { debugAPIController };



