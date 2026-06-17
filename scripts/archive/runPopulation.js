#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../../src/models/module.model');
const Quiz = require('../../src/models/quiz.model');
const { musicalContent } = require('./musicalContentData');

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

const populateDatabase = async () => {
  try {
    console.log('🚀 Iniciando população do banco com conteúdo musical completo...\n');

    // Limpar dados existentes
    await Module.deleteMany({});
    await Quiz.deleteMany({});
    console.log('🧹 Dados antigos removidos\n');

    let totalModules = 0;
    let totalQuizzes = 0;
    let totalQuestions = 0;

    // Processar cada nível
    for (const [level, modules] of Object.entries(musicalContent)) {
      console.log(`📚 Processando nível: ${level.toUpperCase()}`);
      
      for (const moduleData of modules) {
        // Criar módulo
        const module = await Module.create(moduleData);
        console.log(`   ✅ Módulo criado: ${moduleData.title}`);
        totalModules++;

        // Criar quiz para o módulo
        const quiz = await Quiz.create({
          title: `Quiz - ${moduleData.title}`,
          description: `Teste seus conhecimentos sobre ${moduleData.title.toLowerCase()}`,
          moduleId: module._id,
          questions: moduleData.questions,
          level: moduleData.level,
          type: 'module',
          timeLimit: 600, // 10 minutos
          passingScore: 70,
          attempts: 3,
          totalAttempts: 0,
          averageScore: 0
        });
        console.log(`   ✅ Quiz criado com ${moduleData.questions.length} perguntas`);
        totalQuizzes++;
        totalQuestions += moduleData.questions.length;
      }
      console.log('');
    }

    console.log('🎉 População concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   📚 Módulos criados: ${totalModules}`);
    console.log(`   🎯 Quizzes criados: ${totalQuizzes}`);
    console.log(`   ❓ Total de perguntas: ${totalQuestions}`);
    console.log(`   🎵 Níveis processados: ${Object.keys(musicalContent).length}`);

  } catch (error) {
    console.error('❌ Erro durante a população:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(populateDatabase);
}

module.exports = { populateDatabase };



