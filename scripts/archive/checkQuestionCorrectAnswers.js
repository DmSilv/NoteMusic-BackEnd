const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/quiz.model');

const checkCorrectAnswers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    // Buscar todos os quizzes
    const quizzes = await Quiz.find({ level: { $in: ['aprendiz', 'virtuoso'] } }).limit(5);
    
    console.log('🔍 VERIFICANDO RESPOSTAS CORRETAS NOS QUIZZES\n');
    console.log('=' .repeat(70));
    
    let totalQuestions = 0;
    let questionsWithCorrect = 0;
    let questionsWithMultipleCorrect = 0;
    let questionsWithoutCorrect = 0;

    for (const quiz of quizzes) {
      console.log(`\n📚 Quiz: ${quiz.title}`);
      console.log(`   Nível: ${quiz.level}`);
      console.log(`   Total de perguntas: ${quiz.questions.length}\n`);

      quiz.questions.forEach((question, index) => {
        totalQuestions++;
        const correctOptions = question.options.filter(opt => opt.isCorrect === true);
        
        console.log(`   Pergunta ${index + 1}: ${question.question.substring(0, 50)}...`);
        console.log(`   Opções:`);
        
        question.options.forEach((option, optIndex) => {
          const marker = option.isCorrect ? '✅' : '  ';
          console.log(`     ${marker} [${option.id}] ${option.label.substring(0, 40)}...`);
        });

        if (correctOptions.length === 0) {
          console.log(`   ❌ ERRO: Nenhuma opção correta!`);
          questionsWithoutCorrect++;
        } else if (correctOptions.length > 1) {
          console.log(`   ⚠️  AVISO: ${correctOptions.length} opções marcadas como corretas!`);
          questionsWithMultipleCorrect++;
        } else {
          console.log(`   ✅ OK: 1 opção correta (${correctOptions[0].id})`);
          questionsWithCorrect++;
        }
        console.log('');
      });
      
      console.log('-'.repeat(70));
    }

    console.log('\n📊 RESUMO GERAL:');
    console.log('=' .repeat(70));
    console.log(`Total de perguntas verificadas: ${totalQuestions}`);
    console.log(`✅ Perguntas corretas: ${questionsWithCorrect} (${((questionsWithCorrect/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`⚠️  Perguntas com múltiplas corretas: ${questionsWithMultipleCorrect}`);
    console.log(`❌ Perguntas sem resposta correta: ${questionsWithoutCorrect}`);

    if (questionsWithoutCorrect > 0 || questionsWithMultipleCorrect > 0) {
      console.log('\n⚠️  PROBLEMAS ENCONTRADOS!');
      console.log('   Recomenda-se corrigir as perguntas problemáticas.');
    } else {
      console.log('\n✅ Todas as perguntas estão corretas!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

checkCorrectAnswers();





















