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

const generateReport = async () => {
  try {
    console.log('📊 RELATÓRIO DETALHADO - CONTEÚDO MUSICAL');
    console.log('=' .repeat(80));
    console.log('📅 Data: ' + new Date().toLocaleDateString('pt-BR'));
    console.log('🎵 Baseado no método CCB MTS - Teoria Musical Progressiva');
    console.log('=' .repeat(80));

    // Buscar todos os módulos e quizzes
    const modules = await Module.find({}).sort({ level: 1, order: 1 });
    const quizzes = await Quiz.find({});

    // Agrupar por nível
    const contentByLevel = {};
    
    for (const module of modules) {
      if (!contentByLevel[module.level]) {
        contentByLevel[module.level] = {
          modules: [],
          totalQuizzes: 0,
          totalQuestions: 0
        };
      }
      
      // Encontrar quiz correspondente
      const quiz = quizzes.find(q => q.moduleId.toString() === module._id.toString());
      
      const moduleInfo = {
        title: module.title,
        description: module.description,
        category: module.category,
        order: module.order,
        points: module.points,
        quizCount: quiz ? 1 : 0,
        questionCount: quiz ? (quiz.questions ? quiz.questions.length : 0) : 0,
        timeLimit: quiz ? quiz.timeLimit : 0,
        passingScore: quiz ? quiz.passingScore : 0
      };
      
      contentByLevel[module.level].modules.push(moduleInfo);
      contentByLevel[module.level].totalQuizzes += moduleInfo.quizCount;
      contentByLevel[module.level].totalQuestions += moduleInfo.questionCount;
    }

    // Gerar relatório por nível
    for (const [level, data] of Object.entries(contentByLevel)) {
      console.log(`\n🎯 NÍVEL: ${level.toUpperCase()}`);
      console.log('-' .repeat(60));
      console.log(`📚 Total de módulos: ${data.modules.length}`);
      console.log(`🎯 Total de quizzes: ${data.totalQuizzes}`);
      console.log(`❓ Total de perguntas: ${data.totalQuestions}`);
      console.log(`📈 Média de perguntas por quiz: ${data.totalQuizzes > 0 ? Math.round(data.totalQuestions / data.totalQuizzes) : 0}`);
      
      console.log('\n📋 DETALHAMENTO POR MÓDULO:');
      console.log('-' .repeat(60));
      
      data.modules.forEach((module, index) => {
        console.log(`\n${index + 1}. ${module.title}`);
        console.log(`   📖 Descrição: ${module.description}`);
        console.log(`   🏷️ Categoria: ${module.category}`);
        console.log(`   📊 Ordem: ${module.order}`);
        console.log(`   ⭐ Pontos: ${module.points}`);
        console.log(`   🎯 Quizzes: ${module.quizCount}`);
        console.log(`   ❓ Perguntas: ${module.questionCount}`);
        console.log(`   ⏱️ Tempo limite: ${module.timeLimit} segundos (${Math.round(module.timeLimit/60)} min)`);
        console.log(`   🎯 Pontuação mínima: ${module.passingScore}%`);
      });
    }

    // Resumo geral
    console.log('\n' + '=' .repeat(80));
    console.log('📊 RESUMO GERAL');
    console.log('=' .repeat(80));
    
    const totalModules = modules.length;
    const totalQuizzes = quizzes.length;
    const totalQuestions = quizzes.reduce((sum, quiz) => sum + (quiz.questions ? quiz.questions.length : 0), 0);
    
    console.log(`📚 Total de módulos: ${totalModules}`);
    console.log(`🎯 Total de quizzes: ${totalQuizzes}`);
    console.log(`❓ Total de perguntas: ${totalQuestions}`);
    console.log(`📈 Média de perguntas por quiz: ${totalQuizzes > 0 ? Math.round(totalQuestions / totalQuizzes) : 0}`);
    console.log(`📈 Média de quizzes por módulo: ${totalModules > 0 ? Math.round(totalQuizzes / totalModules) : 0}`);
    
    // Distribuição por nível
    console.log('\n📊 DISTRIBUIÇÃO POR NÍVEL:');
    console.log('-' .repeat(40));
    for (const [level, data] of Object.entries(contentByLevel)) {
      const percentage = totalModules > 0 ? Math.round((data.modules.length / totalModules) * 100) : 0;
      console.log(`🎯 ${level.toUpperCase()}: ${data.modules.length} módulos (${percentage}%)`);
    }

    // Status de implementação
    console.log('\n✅ STATUS DE IMPLEMENTAÇÃO:');
    console.log('-' .repeat(40));
    console.log(`🎯 APRENDIZ: ${contentByLevel.aprendiz ? '✅ Implementado' : '❌ Não implementado'}`);
    console.log(`🎯 VIRTUOSO: ${contentByLevel.virtuoso ? '✅ Implementado' : '❌ Não implementado'}`);
    console.log(`🎯 MAESTRO: ${contentByLevel.maestro ? '✅ Implementado' : '❌ Não implementado'}`);

    console.log('\n🎉 Relatório gerado com sucesso!');
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Erro durante a geração do relatório:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(generateReport);
}

module.exports = { generateReport };



