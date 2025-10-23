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

const checkDatabaseDirectly = async () => {
  try {
    console.log('🔍 VERIFICAÇÃO DIRETA DO BANCO DE DADOS');
    console.log('=' .repeat(60));

    // 1. Contar módulos
    const totalModules = await Module.countDocuments();
    console.log(`📚 Total de módulos no banco: ${totalModules}`);

    // 2. Contar quizzes
    const totalQuizzes = await Quiz.countDocuments();
    console.log(`🎯 Total de quizzes no banco: ${totalQuizzes}`);

    // 3. Contar perguntas
    const totalQuestions = await Quiz.aggregate([
      { $project: { questionCount: { $size: "$questions" } } },
      { $group: { _id: null, total: { $sum: "$questionCount" } } }
    ]);
    console.log(`❓ Total de perguntas no banco: ${totalQuestions[0]?.total || 0}`);

    // 4. Listar todos os módulos
    console.log('\n📋 TODOS OS MÓDULOS NO BANCO:');
    console.log('-' .repeat(40));
    
    const modules = await Module.find({}).sort({ level: 1, order: 1 });
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title}`);
      console.log(`   ID: ${module._id}`);
      console.log(`   Nível: ${module.level}`);
      console.log(`   Categoria: ${module.category}`);
      console.log(`   Ordem: ${module.order}`);
      console.log(`   Pontos: ${module.points}`);
      console.log(`   Ativo: ${module.isActive}`);
      console.log(`   Criado: ${module.createdAt}`);
      console.log('');
    });

    // 5. Listar todos os quizzes
    console.log('\n🎯 TODOS OS QUIZZES NO BANCO:');
    console.log('-' .repeat(40));
    
    const quizzes = await Quiz.find({}).sort({ level: 1 });
    quizzes.forEach((quiz, index) => {
      console.log(`${index + 1}. ${quiz.title}`);
      console.log(`   ID: ${quiz._id}`);
      console.log(`   Módulo ID: ${quiz.moduleId}`);
      console.log(`   Nível: ${quiz.level}`);
      console.log(`   Categoria: ${quiz.category}`);
      console.log(`   Perguntas: ${quiz.questions ? quiz.questions.length : 0}`);
      console.log(`   Ativo: ${quiz.isActive}`);
      console.log(`   Criado: ${quiz.createdAt}`);
      console.log('');
    });

    // 6. Verificar distribuição por nível
    console.log('\n📊 DISTRIBUIÇÃO POR NÍVEL:');
    console.log('-' .repeat(40));
    
    const levelStats = await Module.aggregate([
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    levelStats.forEach(stat => {
      console.log(`🎯 ${stat._id.toUpperCase()}: ${stat.count} módulos`);
    });

    // 7. Verificar se há módulos duplicados
    console.log('\n🔍 VERIFICAÇÃO DE DUPLICATAS:');
    console.log('-' .repeat(40));
    
    const duplicateTitles = await Module.aggregate([
      { $group: { _id: "$title", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicateTitles.length > 0) {
      console.log('❌ Módulos duplicados encontrados:');
      duplicateTitles.forEach(dup => {
        console.log(`   - ${dup._id}: ${dup.count} ocorrências`);
      });
    } else {
      console.log('✅ Nenhum módulo duplicado encontrado');
    }

    // 8. Verificar se há quizzes duplicados
    const duplicateQuizTitles = await Quiz.aggregate([
      { $group: { _id: "$title", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicateQuizTitles.length > 0) {
      console.log('❌ Quizzes duplicados encontrados:');
      duplicateQuizTitles.forEach(dup => {
        console.log(`   - ${dup._id}: ${dup.count} ocorrências`);
      });
    } else {
      console.log('✅ Nenhum quiz duplicado encontrado');
    }

    console.log('\n🎉 VERIFICAÇÃO DO BANCO CONCLUÍDA!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(checkDatabaseDirectly);
}

module.exports = { checkDatabaseDirectly };



