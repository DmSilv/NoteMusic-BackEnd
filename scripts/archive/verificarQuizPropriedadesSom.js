const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/Quiz');
const Module = require('../../src/models/Module');

const verificarQuiz = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    console.log('🔍 VERIFICANDO QUIZ "PROPRIEDADES DO SOM"\n');
    console.log('='.repeat(80));

    // Buscar o quiz problemático
    const quizProblematico = await Quiz.findOne({ 
      title: { $regex: /Propriedades do Som/i }
    });

    if (!quizProblematico) {
      console.log('❌ Quiz não encontrado!');
      process.exit(1);
    }

    console.log(`\n📋 Quiz encontrado: ${quizProblematico.title}`);
    console.log(`   ID: ${quizProblematico._id}`);
    console.log(`   Nível: ${quizProblematico.level}`);
    console.log(`   Módulo ID: ${quizProblematico.moduleId}`);
    console.log(`   Perguntas: ${quizProblematico.questions.length}`);

    console.log('\n📝 PERGUNTAS ATUAIS NO BANCO:\n');
    quizProblematico.questions.forEach((q, idx) => {
      console.log(`${idx + 1}. "${q.question}"`);
      console.log(`   Opções: ${q.options.length}`);
      q.options.forEach((opt, optIdx) => {
        const correct = opt.isCorrect ? ' ✓' : '';
        console.log(`      ${optIdx}. ${opt.label}${correct}`);
      });
      console.log('');
    });

    // Buscar todos os quizzes de aprendiz para ver se há mais problemas
    console.log('\n' + '='.repeat(80));
    console.log('\n📚 TODOS OS QUIZZES DE APRENDIZ:\n');
    
    const allAprendizQuizzes = await Quiz.find({ level: 'aprendiz' });
    
    for (const quiz of allAprendizQuizzes) {
      const hasGenericQuestions = quiz.questions.some(q => 
        q.question.includes('módulo') && 
        q.question.includes('descreve')
      );
      
      const status = hasGenericQuestions ? '⚠️' : '✅';
      console.log(`${status} ${quiz.title} - ${quiz.questions.length} perguntas`);
      
      if (hasGenericQuestions) {
        console.log(`   PROBLEMA: Contém perguntas genéricas!`);
      }
    }

    console.log('\n' + '='.repeat(80));
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
};

verificarQuiz();

