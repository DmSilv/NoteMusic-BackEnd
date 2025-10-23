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

const analyzeCurrentContent = async () => {
  try {
    console.log('🔍 ANÁLISE COMPLETA DO CONTEÚDO ATUAL');
    console.log('=' .repeat(60));

    // 1. Análise de módulos
    console.log('\n📚 1. ANÁLISE DE MÓDULOS:');
    console.log('-' .repeat(40));
    
    const modules = await Module.find({}).sort({ level: 1, order: 1 });
    console.log(`📊 Total de módulos: ${modules.length}`);
    
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
        console.log(`   ${index + 1}. ${module.title}`);
        console.log(`      ID: ${module._id}`);
        console.log(`      Categoria: ${module.category}`);
        console.log(`      Ordem: ${module.order}`);
      });
    });

    // 2. Análise de quizzes
    console.log('\n🎯 2. ANÁLISE DE QUIZZES:');
    console.log('-' .repeat(40));
    
    const quizzes = await Quiz.find({}).sort({ level: 1 });
    console.log(`📊 Total de quizzes: ${quizzes.length}`);
    
    // Agrupar por nível
    const quizLevelGroups = {};
    quizzes.forEach(quiz => {
      if (!quizLevelGroups[quiz.level]) {
        quizLevelGroups[quiz.level] = [];
      }
      quizLevelGroups[quiz.level].push(quiz);
    });
    
    Object.entries(quizLevelGroups).forEach(([level, levelQuizzes]) => {
      console.log(`\n🎯 ${level.toUpperCase()}: ${levelQuizzes.length} quizzes`);
      levelQuizzes.forEach((quiz, index) => {
        const questionCount = quiz.questions ? quiz.questions.length : 0;
        console.log(`   ${index + 1}. ${quiz.title}`);
        console.log(`      ID: ${quiz._id}`);
        console.log(`      Módulo ID: ${quiz.moduleId}`);
        console.log(`      Perguntas: ${questionCount}`);
        console.log(`      Categoria: ${quiz.category}`);
      });
    });

    // 3. Análise de perguntas
    console.log('\n❓ 3. ANÁLISE DE PERGUNTAS:');
    console.log('-' .repeat(40));
    
    const totalQuestions = await Quiz.aggregate([
      { $project: { questionCount: { $size: "$questions" } } },
      { $group: { _id: null, total: { $sum: "$questionCount" } } }
    ]);
    console.log(`📊 Total de perguntas: ${totalQuestions[0]?.total || 0}`);
    
    // Perguntas por nível
    const questionsByLevel = await Quiz.aggregate([
      { $project: { level: 1, questionCount: { $size: "$questions" } } },
      { $group: { _id: "$level", total: { $sum: "$questionCount" } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📊 PERGUNTAS POR NÍVEL:');
    questionsByLevel.forEach(stat => {
      console.log(`   🎯 ${stat._id.toUpperCase()}: ${stat.total} perguntas`);
    });

    // 4. Verificar distribuição de perguntas por quiz
    console.log('\n📊 4. DISTRIBUIÇÃO DE PERGUNTAS POR QUIZ:');
    console.log('-' .repeat(40));
    
    const questionDistribution = await Quiz.aggregate([
      { $project: { title: 1, level: 1, questionCount: { $size: "$questions" } } },
      { $sort: { level: 1, questionCount: -1 } }
    ]);
    
    questionDistribution.forEach(quiz => {
      console.log(`   ${quiz.title} (${quiz.level}): ${quiz.quiz.questionCount} perguntas`);
    });

    // 5. Verificar se há quizzes com poucas perguntas
    console.log('\n⚠️ 5. QUIZZES COM POUCAS PERGUNTAS:');
    console.log('-' .repeat(40));
    
    const quizzesWithFewQuestions = await Quiz.find({
      $expr: { $lt: [{ $size: "$questions" }, 5] }
    });
    
    console.log(`📊 Quizzes com menos de 5 perguntas: ${quizzesWithFewQuestions.length}`);
    quizzesWithFewQuestions.forEach(quiz => {
      const questionCount = quiz.questions ? quiz.questions.length : 0;
      console.log(`   - ${quiz.title} (${quiz.level}): ${questionCount} perguntas`);
    });

    // 6. Verificar se há quizzes com muitas perguntas
    console.log('\n📈 6. QUIZZES COM MUITAS PERGUNTAS:');
    console.log('-' .repeat(40));
    
    const quizzesWithManyQuestions = await Quiz.find({
      $expr: { $gt: [{ $size: "$questions" }, 10] }
    });
    
    console.log(`📊 Quizzes com mais de 10 perguntas: ${quizzesWithManyQuestions.length}`);
    quizzesWithManyQuestions.forEach(quiz => {
      const questionCount = quiz.questions ? quiz.questions.length : 0;
      console.log(`   - ${quiz.title} (${quiz.level}): ${questionCount} perguntas`);
    });

    // 7. Verificar duplicação de perguntas
    console.log('\n🔍 7. VERIFICAÇÃO DE DUPLICAÇÃO:');
    console.log('-' .repeat(40));
    
    const allQuestions = await Quiz.aggregate([
      { $unwind: "$questions" },
      { $group: { _id: "$questions.question", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    console.log(`📊 Perguntas duplicadas: ${allQuestions.length}`);
    if (allQuestions.length > 0) {
      console.log('   Primeiras 5 perguntas duplicadas:');
      allQuestions.slice(0, 5).forEach((q, index) => {
        console.log(`   ${index + 1}. "${q._id}" (${q.count} vezes)`);
      });
    }

    // 8. Verificar se há módulos sem quiz
    console.log('\n❌ 8. MÓDULOS SEM QUIZ:');
    console.log('-' .repeat(40));
    
    const modulesWithoutQuiz = await Module.find({
      _id: { $nin: quizzes.map(q => q.moduleId) }
    });
    
    console.log(`📊 Módulos sem quiz: ${modulesWithoutQuiz.length}`);
    modulesWithoutQuiz.forEach(module => {
      console.log(`   - ${module.title} (${module.level})`);
    });

    // 9. Verificar se há quizzes órfãos
    console.log('\n🔍 9. QUIZZES ÓRFÃOS:');
    console.log('-' .repeat(40));
    
    const orphanQuizzes = await Quiz.find({
      moduleId: { $nin: modules.map(m => m._id) }
    });
    
    console.log(`📊 Quizzes órfãos: ${orphanQuizzes.length}`);
    orphanQuizzes.forEach(quiz => {
      console.log(`   - ${quiz.title} (módulo ID: ${quiz.moduleId})`);
    });

    console.log('\n🎉 ANÁLISE CONCLUÍDA!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a análise:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(analyzeCurrentContent);
}

module.exports = { analyzeCurrentContent };
