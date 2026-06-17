const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../../src/models/Module');
const Quiz = require('../../src/models/Quiz');

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

// Verificar conteúdo do banco
const checkDatabaseContent = async () => {
  try {
    console.log('🔍 VERIFICAÇÃO DO CONTEÚDO DO BANCO');
    console.log('=' .repeat(60));

    // 1. Contar total de módulos
    const totalModules = await Module.countDocuments();
    console.log(`📊 Total de módulos no banco: ${totalModules}`);

    // 2. Listar todos os módulos
    const allModules = await Module.find({}).sort({ level: 1, order: 1 });
    console.log('\n📚 TODOS OS MÓDULOS NO BANCO:');
    console.log('-' .repeat(40));
    
    allModules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (${module.level}) - ${module.category}`);
    });

    // 3. Verificar se há módulos antigos
    const oldTitles = ['As 7 Notas Musicais', 'Figuras de Valor - Duração das Notas', 'Compasso Simples - 2/4, 3/4, 4/4'];
    const oldModules = await Module.find({ title: { $in: oldTitles } });
    
    console.log('\n🔍 VERIFICAÇÃO DE MÓDULOS ANTIGOS:');
    console.log('-' .repeat(40));
    console.log(`📊 Módulos antigos encontrados: ${oldModules.length}`);
    
    if (oldModules.length > 0) {
      console.log('⚠️ PROBLEMA: Há módulos antigos no banco!');
      oldModules.forEach(module => {
        console.log(`   - ${module.title} (${module.level})`);
      });
    }

    // 4. Verificar se há módulos novos
    const newTitles = ['Propriedades do Som', 'Notas Musicais', 'Pauta Musical'];
    const newModules = await Module.find({ title: { $in: newTitles } });
    
    console.log('\n🔍 VERIFICAÇÃO DE MÓDULOS NOVOS:');
    console.log('-' .repeat(40));
    console.log(`📊 Módulos novos encontrados: ${newModules.length}`);
    
    if (newModules.length > 0) {
      console.log('✅ Dados novos encontrados!');
      newModules.forEach(module => {
        console.log(`   - ${module.title} (${module.level})`);
      });
    }

    // 5. Verificar distribuição por nível
    const levelStats = await Module.aggregate([
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📈 DISTRIBUIÇÃO POR NÍVEL:');
    console.log('-' .repeat(40));
    levelStats.forEach(stat => {
      console.log(`   🎯 ${stat._id.toUpperCase()}: ${stat.count} módulos`);
    });

    // 6. Verificar se há problema com isActive
    const activeCount = allModules.filter(m => m.isActive === true).length;
    const inactiveCount = allModules.filter(m => m.isActive === false).length;
    const undefinedCount = allModules.filter(m => m.isActive === undefined).length;
    
    console.log('\n🔍 VERIFICAÇÃO DE isActive:');
    console.log('-' .repeat(40));
    console.log(`📊 Módulos ativos (isActive: true): ${activeCount}`);
    console.log(`📊 Módulos inativos (isActive: false): ${inactiveCount}`);
    console.log(`📊 Módulos sem isActive: ${undefinedCount}`);

    // 7. Verificar se há dados duplicados
    const moduleTitles = allModules.map(m => m.title);
    const uniqueTitles = [...new Set(moduleTitles)];
    
    console.log('\n🔍 VERIFICAÇÃO DE DUPLICATAS:');
    console.log('-' .repeat(40));
    console.log(`📊 Total de módulos: ${allModules.length}`);
    console.log(`📊 Títulos únicos: ${uniqueTitles.length}`);
    
    if (moduleTitles.length !== uniqueTitles.length) {
      console.log('⚠️ PROBLEMA: Há módulos duplicados!');
      const duplicates = moduleTitles.filter((title, index) => moduleTitles.indexOf(title) !== index);
      console.log('Duplicados:', duplicates);
    }

    console.log('\n🎉 VERIFICAÇÃO CONCLUÍDA!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(checkDatabaseContent);
}

module.exports = { checkDatabaseContent };



