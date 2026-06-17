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

// Debug do problema do banco
const debugDatabaseIssue = async () => {
  try {
    console.log('🔍 DEBUG DO PROBLEMA DO BANCO DE DADOS');
    console.log('=' .repeat(60));

    // 1. Verificar quantos módulos existem
    console.log('\n📚 1. VERIFICAÇÃO DE MÓDULOS:');
    console.log('-' .repeat(40));
    
    const totalModules = await Module.countDocuments();
    console.log(`📊 Total de módulos no banco: ${totalModules}`);
    
    const modules = await Module.find({}).sort({ level: 1, order: 1 });
    console.log(`📊 Módulos encontrados: ${modules.length}`);
    
    // Verificar se há módulos duplicados
    const moduleTitles = modules.map(m => m.title);
    const uniqueTitles = [...new Set(moduleTitles)];
    console.log(`📊 Títulos únicos: ${uniqueTitles.length}`);
    
    if (moduleTitles.length !== uniqueTitles.length) {
      console.log('⚠️ PROBLEMA: Há módulos duplicados!');
      const duplicates = moduleTitles.filter((title, index) => moduleTitles.indexOf(title) !== index);
      console.log('Duplicados:', duplicates);
    }

    // 2. Verificar quantos quizzes existem
    console.log('\n🎯 2. VERIFICAÇÃO DE QUIZZES:');
    console.log('-' .repeat(40));
    
    const totalQuizzes = await Quiz.countDocuments();
    console.log(`📊 Total de quizzes no banco: ${totalQuizzes}`);
    
    const quizzes = await Quiz.find({}).sort({ level: 1 });
    console.log(`📊 Quizzes encontrados: ${quizzes.length}`);
    
    // Verificar se há quizzes duplicados
    const quizTitles = quizzes.map(q => q.title);
    const uniqueQuizTitles = [...new Set(quizTitles)];
    console.log(`📊 Títulos únicos: ${uniqueQuizTitles.length}`);
    
    if (quizTitles.length !== uniqueQuizTitles.length) {
      console.log('⚠️ PROBLEMA: Há quizzes duplicados!');
      const duplicates = quizTitles.filter((title, index) => quizTitles.indexOf(title) !== index);
      console.log('Duplicados:', duplicates);
    }

    // 3. Verificar total de perguntas
    console.log('\n❓ 3. VERIFICAÇÃO DE PERGUNTAS:');
    console.log('-' .repeat(40));
    
    const totalQuestions = await Quiz.aggregate([
      { $project: { questionCount: { $size: "$questions" } } },
      { $group: { _id: null, total: { $sum: "$questionCount" } } }
    ]);
    console.log(`📊 Total de perguntas no banco: ${totalQuestions[0]?.total || 0}`);

    // 4. Verificar se há dados antigos
    console.log('\n🔍 4. VERIFICAÇÃO DE DADOS ANTIGOS:');
    console.log('-' .repeat(40));
    
    // Procurar por módulos com títulos antigos
    const oldModules = await Module.find({
      title: { $in: ['As 7 Notas Musicais', 'Figuras de Valor - Duração das Notas', 'Compasso Simples - 2/4, 3/4, 4/4'] }
    });
    
    console.log(`📊 Módulos com títulos antigos: ${oldModules.length}`);
    if (oldModules.length > 0) {
      console.log('⚠️ PROBLEMA: Há módulos antigos no banco!');
      oldModules.forEach(module => {
        console.log(`   - ${module.title} (${module.level})`);
      });
    }

    // 5. Verificar se há dados novos
    console.log('\n🆕 5. VERIFICAÇÃO DE DADOS NOVOS:');
    console.log('-' .repeat(40));
    
    const newModules = await Module.find({
      title: { $in: ['Propriedades do Som - Os Pilares da Música', 'Notas Musicais e Solfejo - O ABC da Música', 'Pauta Musical e Claves - Onde Escrevemos a Música'] }
    });
    
    console.log(`📊 Módulos com títulos novos: ${newModules.length}`);
    if (newModules.length > 0) {
      console.log('✅ Dados novos encontrados!');
      newModules.forEach(module => {
        console.log(`   - ${module.title} (${module.level})`);
      });
    }

    // 6. Verificar se há problema de conexão
    console.log('\n🔌 6. VERIFICAÇÃO DE CONEXÃO:');
    console.log('-' .repeat(40));
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Nome do banco: ${dbName}`);
    console.log(`📊 Host: ${mongoose.connection.host}`);
    console.log(`📊 Port: ${mongoose.connection.port}`);

    // 7. Listar todos os módulos
    console.log('\n📋 7. LISTA COMPLETA DE MÓDULOS:');
    console.log('-' .repeat(40));
    
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (${module.level}) - ${module.category}`);
    });

    // 8. Listar todos os quizzes
    console.log('\n📋 8. LISTA COMPLETA DE QUIZZES:');
    console.log('-' .repeat(40));
    
    quizzes.forEach((quiz, index) => {
      const questionCount = quiz.questions ? quiz.questions.length : 0;
      console.log(`${index + 1}. ${quiz.title} (${quiz.level}) - ${questionCount} perguntas`);
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
  connectDB().then(debugDatabaseIssue);
}

module.exports = { debugDatabaseIssue };



