#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../src/models/Module');
const Quiz = require('../src/models/Quiz');
const { completeMusicalContent } = require('./completeMusicalContent');

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
    console.log('🚀 Iniciando população COMPLETA do banco com conteúdo musical...\n');
    console.log('📚 Baseado no método CCB MTS - Teoria Musical Progressiva\n');

    // Limpar dados existentes
    await Module.deleteMany({});
    await Quiz.deleteMany({});
    console.log('🧹 Dados antigos removidos\n');

    let totalModules = 0;
    let totalQuizzes = 0;
    let totalQuestions = 0;

    // Processar cada nível
    for (const [level, modules] of Object.entries(completeMusicalContent)) {
      console.log(`📚 Processando nível: ${level.toUpperCase()}`);
      console.log(`   🎯 ${modules.length} módulos encontrados\n`);
      
      for (const moduleData of modules) {
        // Criar módulo
        const module = await Module.create(moduleData);
        console.log(`   ✅ Módulo criado: ${moduleData.title}`);
        console.log(`      📖 Descrição: ${moduleData.description}`);
        console.log(`      🎵 Categoria: ${moduleData.category}`);
        console.log(`      ⭐ Pontos: ${moduleData.points}`);
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
        console.log(`      ⏱️ Tempo limite: 10 minutos`);
        console.log(`      🎯 Pontuação mínima: 70%`);
        console.log(`      🔄 Tentativas: 3\n`);
        totalQuizzes++;
        totalQuestions += moduleData.questions.length;
      }
    }

    console.log('🎉 População COMPLETA concluída com sucesso!');
    console.log('\n📊 Resumo Detalhado:');
    console.log(`   📚 Total de módulos: ${totalModules}`);
    console.log(`   🎯 Total de quizzes: ${totalQuizzes}`);
    console.log(`   ❓ Total de perguntas: ${totalQuestions}`);
    console.log(`   🎵 Níveis processados: ${Object.keys(completeMusicalContent).length}`);
    console.log(`   📈 Média de perguntas por quiz: ${Math.round(totalQuestions / totalQuizzes)}`);
    
    console.log('\n🎼 Estrutura Pedagógica:');
    console.log('   🎯 APRENDIZ: Fundamentos da música');
    console.log('   🎯 VIRTUOSO: Desenvolvimento técnico');
    console.log('   🎯 MAESTRO: Arte e sofisticação');
    
    console.log('\n✨ Características das Perguntas:');
    console.log('   🎵 Lúdicas e engajantes');
    console.log('   📚 Progressão didática');
    console.log('   🎯 Dificuldade adequada por nível');
    console.log('   💡 Explicações educativas');

  } catch (error) {
    console.error('❌ Erro durante a população:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(populateDatabase);
}

module.exports = { populateDatabase };



