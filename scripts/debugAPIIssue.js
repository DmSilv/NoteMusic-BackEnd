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

// Debug do problema da API
const debugAPIIssue = async () => {
  try {
    console.log('🔍 DEBUG DO PROBLEMA DA API');
    console.log('=' .repeat(60));

    // 1. Verificar dados no banco
    console.log('\n📚 1. VERIFICAÇÃO DIRETA NO BANCO:');
    console.log('-' .repeat(40));
    
    const totalModules = await Module.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalQuestions = await Quiz.aggregate([
      { $project: { questionCount: { $size: "$questions" } } },
      { $group: { _id: null, total: { $sum: "$questionCount" } } }
    ]);

    console.log(`📊 Total de módulos no banco: ${totalModules}`);
    console.log(`📊 Total de quizzes no banco: ${totalQuizzes}`);
    console.log(`📊 Total de perguntas no banco: ${totalQuestions[0]?.total || 0}`);

    // 2. Simular a consulta exata da API
    console.log('\n🔍 2. SIMULANDO CONSULTA DA API:');
    console.log('-' .repeat(40));
    
    const filter = { isActive: true };
    const modules = await Module.find(filter)
      .sort({ order: 1 })
      .select('-content.exercises');

    console.log(`📊 Módulos retornados pela consulta: ${modules.length}`);
    
    // Listar os módulos
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (${module.level}) - ${module.category}`);
    });

    // 3. Verificar se há dados antigos
    console.log('\n🔍 3. VERIFICAÇÃO DE DADOS ANTIGOS:');
    console.log('-' .repeat(40));
    
    const oldTitles = ['As 7 Notas Musicais', 'Figuras de Valor - Duração das Notas', 'Compasso Simples - 2/4, 3/4, 4/4'];
    const oldModules = await Module.find({ title: { $in: oldTitles } });
    
    console.log(`📊 Módulos com títulos antigos: ${oldModules.length}`);
    if (oldModules.length > 0) {
      console.log('⚠️ PROBLEMA: Há módulos antigos no banco!');
      oldModules.forEach(module => {
        console.log(`   - ${module.title} (${module.level})`);
      });
    }

    // 4. Verificar se há dados novos
    console.log('\n🔍 4. VERIFICAÇÃO DE DADOS NOVOS:');
    console.log('-' .repeat(40));
    
    const newTitles = ['Propriedades do Som', 'Notas Musicais', 'Pauta Musical'];
    const newModules = await Module.find({ title: { $in: newTitles } });
    
    console.log(`📊 Módulos com títulos novos: ${newModules.length}`);
    if (newModules.length > 0) {
      console.log('✅ Dados novos encontrados!');
      newModules.forEach(module => {
        console.log(`   - ${module.title} (${module.level})`);
      });
    }

    // 5. Verificar se há problema de conexão
    console.log('\n🔍 5. VERIFICAÇÃO DE CONEXÃO:');
    console.log('-' .repeat(40));
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Nome do banco: ${dbName}`);
    console.log(`📊 Host: ${mongoose.connection.host}`);
    console.log(`📊 Port: ${mongoose.connection.port}`);

    // 6. Verificar se há dados duplicados
    console.log('\n🔍 6. VERIFICAÇÃO DE DADOS DUPLICADOS:');
    console.log('-' .repeat(40));
    
    const allModules = await Module.find({});
    const moduleTitles = allModules.map(m => m.title);
    const uniqueTitles = [...new Set(moduleTitles)];
    
    console.log(`📊 Total de módulos: ${allModules.length}`);
    console.log(`📊 Títulos únicos: ${uniqueTitles.length}`);
    
    if (moduleTitles.length !== uniqueTitles.length) {
      console.log('⚠️ PROBLEMA: Há módulos duplicados!');
      const duplicates = moduleTitles.filter((title, index) => moduleTitles.indexOf(title) !== index);
      console.log('Duplicados:', duplicates);
    }

    // 7. Verificar se há problema com isActive
    console.log('\n🔍 7. VERIFICAÇÃO DE isActive:');
    console.log('-' .repeat(40));
    
    const activeCount = allModules.filter(m => m.isActive === true).length;
    const inactiveCount = allModules.filter(m => m.isActive === false).length;
    const undefinedCount = allModules.filter(m => m.isActive === undefined).length;
    
    console.log(`📊 Módulos ativos (isActive: true): ${activeCount}`);
    console.log(`📊 Módulos inativos (isActive: false): ${inactiveCount}`);
    console.log(`📊 Módulos sem isActive: ${undefinedCount}`);

    // 8. Listar todos os módulos com seus status
    console.log('\n📋 8. LISTA COMPLETA COM STATUS:');
    console.log('-' .repeat(40));
    
    allModules.forEach((module, index) => {
      const status = module.isActive === true ? '✅' : module.isActive === false ? '❌' : '❓';
      console.log(`${index + 1}. ${status} ${module.title} (${module.level}) - isActive: ${module.isActive}`);
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
  connectDB().then(debugAPIIssue);
}

module.exports = { debugAPIIssue };