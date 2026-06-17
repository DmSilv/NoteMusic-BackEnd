const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/Quiz');
const Module = require('../../src/models/Module');

/**
 * Script para deletar o quiz genérico "Propriedades do Som"
 * que contém apenas perguntas genéricas (meta-informação)
 * 
 * Os quizzes corretos de ALTURA, INTENSIDADE, TIMBRE e DURAÇÃO
 * já existem no banco e estão funcionando corretamente.
 */
const deletarQuizGenerico = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    console.log('🗑️  DELETANDO QUIZ GENÉRICO "PROPRIEDADES DO SOM"\n');
    console.log('='.repeat(80));

    // Buscar o quiz problemático
    const quizProblematico = await Quiz.findOne({ 
      title: { $regex: /^Quiz - Propriedades do Som$/i }
    });

    if (!quizProblematico) {
      console.log('ℹ️  Quiz genérico não encontrado. Pode já ter sido deletado.');
      process.exit(0);
    }

    console.log(`\n📋 Quiz encontrado:`);
    console.log(`   Título: ${quizProblematico.title}`);
    console.log(`   ID: ${quizProblematico._id}`);
    console.log(`   Nível: ${quizProblematico.level}`);
    console.log(`   Perguntas: ${quizProblematico.questions.length}`);

    // Mostrar as perguntas antes de deletar
    console.log(`\n📝 Perguntas que serão removidas:`);
    quizProblematico.questions.forEach((q, idx) => {
      console.log(`   ${idx + 1}. "${q.question.substring(0, 60)}..."`);
    });

    // Verificar se é realmente o quiz genérico
    const hasGenericQuestions = quizProblematico.questions.some(q => 
      q.question.includes('módulo') && q.question.includes('descreve')
    );

    if (!hasGenericQuestions) {
      console.log('\n⚠️  ATENÇÃO: Este quiz não parece ser o genérico!');
      console.log('   Cancelando operação por segurança.');
      process.exit(1);
    }

    // Buscar o módulo associado
    const module = await Module.findById(quizProblematico.moduleId);
    if (module) {
      console.log(`\n📚 Módulo associado: ${module.title}`);
    }

    // Deletar o quiz
    console.log(`\n🗑️  Deletando quiz...`);
    await Quiz.findByIdAndDelete(quizProblematico._id);
    console.log(`✅ Quiz deletado com sucesso!`);

    // Se houver módulo associado, remover a referência ao quiz
    if (module) {
      console.log(`\n🔄 Removendo referência do quiz no módulo...`);
      await Module.findByIdAndUpdate(module._id, {
        $pull: { quizzes: quizProblematico._id }
      });
      console.log(`✅ Referência removida!`);
    }

    // Verificar quantos quizzes de aprendiz restaram
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 QUIZZES DE APRENDIZ APÓS REMOÇÃO:\n');
    
    const remainingQuizzes = await Quiz.find({ level: 'aprendiz' });
    console.log(`Total: ${remainingQuizzes.length} quizzes\n`);
    
    remainingQuizzes.forEach(quiz => {
      console.log(`✅ ${quiz.title} - ${quiz.questions.length} perguntas`);
    });

    // Verificar se os quizzes de propriedades do som corretos existem
    console.log('\n' + '='.repeat(80));
    console.log('\n🔍 VERIFICANDO QUIZZES CORRETOS DE PROPRIEDADES DO SOM:\n');
    
    const propriedadesSomQuizzes = ['ALTURA', 'INTENSIDADE', 'TIMBRE', 'DURAÇÃO'];
    
    for (const prop of propriedadesSomQuizzes) {
      const quiz = await Quiz.findOne({ 
        title: { $regex: new RegExp(prop, 'i') },
        level: 'aprendiz'
      });
      
      if (quiz) {
        console.log(`✅ ${prop}: Quiz encontrado com ${quiz.questions.length} perguntas`);
      } else {
        console.log(`❌ ${prop}: Quiz NÃO encontrado!`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ OPERAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('   O quiz genérico foi removido.');
    console.log('   Os quizzes corretos de ALTURA, INTENSIDADE, TIMBRE e DURAÇÃO');
    console.log('   permanecem no banco de dados.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
};

deletarQuizGenerico();

