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

const fixModuleOrders = async () => {
  try {
    console.log('🔧 CORRIGINDO ORDERS DOS MÓDULOS');
    console.log('=' .repeat(60));

    // 1. Buscar todos os módulos
    const modules = await Module.find({}).sort({ level: 1, createdAt: 1 });
    console.log(`📚 Total de módulos encontrados: ${modules.length}`);

    // 2. Agrupar por nível
    const levelGroups = {
      aprendiz: [],
      virtuoso: [],
      maestro: []
    };

    modules.forEach(module => {
      if (levelGroups[module.level]) {
        levelGroups[module.level].push(module);
      }
    });

    console.log('\n📊 MÓDULOS POR NÍVEL:');
    Object.entries(levelGroups).forEach(([level, levelModules]) => {
      console.log(`   🎯 ${level.toUpperCase()}: ${levelModules.length} módulos`);
    });

    // 3. Corrigir orders por nível
    let globalOrder = 1;

    for (const [level, levelModules] of Object.entries(levelGroups)) {
      console.log(`\n🔧 Corrigindo orders para nível: ${level.toUpperCase()}`);
      
      for (let i = 0; i < levelModules.length; i++) {
        const module = levelModules[i];
        const newOrder = globalOrder;
        
        console.log(`   ${i + 1}. ${module.title}`);
        console.log(`      Order atual: ${module.order} → Novo order: ${newOrder}`);
        
        await Module.findByIdAndUpdate(module._id, { order: newOrder });
        globalOrder++;
      }
    }

    // 4. Verificar se a correção funcionou
    console.log('\n✅ VERIFICAÇÃO PÓS-CORREÇÃO:');
    console.log('-' .repeat(40));
    
    const correctedModules = await Module.find({}).sort({ order: 1 });
    console.log(`📚 Total de módulos após correção: ${correctedModules.length}`);
    
    // Verificar se há orders duplicados
    const duplicateOrders = await Module.aggregate([
      { $group: { _id: "$order", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    if (duplicateOrders.length > 0) {
      console.log('❌ Ainda há orders duplicados:');
      duplicateOrders.forEach(dup => {
        console.log(`   Order ${dup._id}: ${dup.count} módulos`);
      });
    } else {
      console.log('✅ Nenhum order duplicado encontrado');
    }

    // 5. Listar módulos com orders corrigidos
    console.log('\n📋 MÓDULOS COM ORDERS CORRIGIDOS:');
    console.log('-' .repeat(40));
    
    correctedModules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (${module.level}) - Order: ${module.order}`);
    });

    console.log('\n🎉 CORREÇÃO DE ORDERS CONCLUÍDA!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(fixModuleOrders);
}

module.exports = { fixModuleOrders };



