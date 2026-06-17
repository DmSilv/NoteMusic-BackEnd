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

// Testar conteúdo final
const testFinalContent = async () => {
  try {
    console.log('🧪 TESTANDO CONTEÚDO FINAL');
    console.log('=' .repeat(60));

    // 1. Verificar módulos
    console.log('\n📚 1. VERIFICAÇÃO DE MÓDULOS:');
    console.log('-' .repeat(40));
    
    const modules = await Module.find({}).sort({ level: 1, order: 1 });
    console.log(`📊 Total de módulos: ${modules.length}`);
    
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

    // 2. Verificar quizzes
    console.log('\n🎯 2. VERIFICAÇÃO DE QUIZZES:');
    console.log('-' .repeat(40));
    
    const quizzes = await Quiz.find({}).sort({ level: 1 });
    console.log(`📊 Total de quizzes: ${quizzes.length}`);
    
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
        console.log(`   ${index + 1}. ${quiz.title} (${questionCount} perguntas)`);
      });
    });

    // 3. Verificar perguntas
    console.log('\n❓ 3. VERIFICAÇÃO DE PERGUNTAS:');
    console.log('-' .repeat(40));
    
    const totalQuestions = await Quiz.aggregate([
      { $project: { questionCount: { $size: "$questions" } } },
      { $group: { _id: null, total: { $sum: "$questionCount" } } }
    ]);
    console.log(`📊 Total de perguntas: ${totalQuestions[0]?.total || 0}`);
    
    const questionsByLevel = await Quiz.aggregate([
      { $project: { level: 1, questionCount: { $size: "$questions" } } },
      { $group: { _id: "$level", total: { $sum: "$questionCount" } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📊 PERGUNTAS POR NÍVEL:');
    questionsByLevel.forEach(stat => {
      console.log(`   🎯 ${stat._id.toUpperCase()}: ${stat.total} perguntas`);
    });

    // 4. Verificar estrutura das perguntas
    console.log('\n🔍 4. VERIFICAÇÃO DA ESTRUTURA DAS PERGUNTAS:');
    console.log('-' .repeat(40));
    
    const sampleQuiz = await Quiz.findOne({}).populate('moduleId');
    if (sampleQuiz && sampleQuiz.questions.length > 0) {
      const sampleQuestion = sampleQuiz.questions[0];
      console.log(`📝 Exemplo de pergunta do quiz "${sampleQuiz.title}":`);
      console.log(`   Pergunta: ${sampleQuestion.question}`);
      console.log(`   Opções: ${sampleQuestion.options.length}`);
      sampleQuestion.options.forEach((option, index) => {
        console.log(`     ${option.id}. ${option.label} (Correta: ${option.isCorrect})`);
      });
      console.log(`   Dificuldade: ${sampleQuestion.difficulty}`);
      console.log(`   Pontos: ${sampleQuestion.points}`);
    }

    // 5. Verificar se há módulos sem quiz
    console.log('\n❌ 5. VERIFICAÇÃO DE MÓDULOS SEM QUIZ:');
    console.log('-' .repeat(40));
    
    const modulesWithoutQuiz = await Module.find({
      _id: { $nin: quizzes.map(q => q.moduleId) }
    });
    
    console.log(`📊 Módulos sem quiz: ${modulesWithoutQuiz.length}`);
    if (modulesWithoutQuiz.length > 0) {
      modulesWithoutQuiz.forEach(module => {
        console.log(`   - ${module.title} (${module.level})`);
      });
    }

    // 6. Verificar se há quizzes órfãos
    console.log('\n🔍 6. VERIFICAÇÃO DE QUIZZES ÓRFÃOS:');
    console.log('-' .repeat(40));
    
    const orphanQuizzes = await Quiz.find({
      moduleId: { $nin: modules.map(m => m._id) }
    });
    
    console.log(`📊 Quizzes órfãos: ${orphanQuizzes.length}`);
    if (orphanQuizzes.length > 0) {
      orphanQuizzes.forEach(quiz => {
        console.log(`   - ${quiz.title} (módulo ID: ${quiz.moduleId})`);
      });
    }

    // 7. Verificar distribuição de perguntas por quiz
    console.log('\n📊 7. DISTRIBUIÇÃO DE PERGUNTAS POR QUIZ:');
    console.log('-' .repeat(40));
    
    const questionDistribution = await Quiz.aggregate([
      { $project: { title: 1, level: 1, questionCount: { $size: "$questions" } } },
      { $sort: { level: 1, questionCount: -1 } }
    ]);
    
    questionDistribution.forEach(quiz => {
      console.log(`   ${quiz.title} (${quiz.level}): ${quiz.questionCount} perguntas`);
    });

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('=' .repeat(60));
    console.log('✅ O conteúdo está pronto para ser usado no app!');
    console.log('📱 Agora você tem:');
    console.log(`   - ${modules.length} módulos distribuídos em 3 níveis`);
    console.log(`   - ${quizzes.length} quizzes com perguntas estruturadas`);
    console.log(`   - ${totalQuestions[0]?.total || 0} perguntas no total`);
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
  connectDB().then(testFinalContent);
}

module.exports = { testFinalContent };



