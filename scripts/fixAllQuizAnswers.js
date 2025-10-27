const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../src/models/Quiz');

// Importar os JSONs originais
const aprendizQuestions = require('../../perguntas_nivel_aprendiz.json');
const virtuosoQuestions = require('../../perguntas_nivel_virtuoso.json');

const fixAllAnswers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    console.log('🔧 CORRIGINDO TODAS AS RESPOSTAS DOS QUIZZES\n');
    console.log('=' .repeat(70));

    // Combinar todas as perguntas
    const allQuestions = {
      aprendiz: aprendizQuestions.questions,
      virtuoso: virtuosoQuestions.questions
    };

    let totalQuizzesUpdated = 0;
    let totalQuestionsFixed = 0;

    // Processar cada nível
    for (const [level, questions] of Object.entries(allQuestions)) {
      console.log(`\n📚 Processando nível: ${level.toUpperCase()}`);
      console.log('-'.repeat(70));

      // Buscar todos os quizzes deste nível
      const quizzes = await Quiz.find({ level, isActive: true });
      console.log(`Encontrados ${quizzes.length} quizzes\n`);

      for (const quiz of quizzes) {
        console.log(`\n🎯 Quiz: ${quiz.title}`);
        let quizModified = false;

        // Para cada pergunta do quiz
        quiz.questions.forEach((question, qIndex) => {
          // Encontrar a pergunta correspondente no JSON original
          const originalQuestion = questions.find(q => 
            q.question.trim().toLowerCase() === question.question.trim().toLowerCase()
          );

          if (originalQuestion) {
            // Verificar se as opções estão corretas
            const correctIndex = originalQuestion.correctAnswer;
            
            // Verificar atual
            const currentCorrectIndex = question.options.findIndex(opt => opt.isCorrect === true);
            
            if (currentCorrectIndex !== correctIndex) {
              console.log(`   ⚠️  Corrigindo pergunta ${qIndex + 1}:`);
              console.log(`      Antes: opção correta era índice ${currentCorrectIndex}`);
              console.log(`      Depois: opção correta é índice ${correctIndex}`);
              
              // Corrigir todas as opções
              question.options.forEach((opt, optIndex) => {
                opt.isCorrect = (optIndex === correctIndex);
                // Manter a explicação apenas na opção correta
                if (optIndex === correctIndex) {
                  opt.explanation = originalQuestion.explanation;
                } else {
                  opt.explanation = '';
                }
              });
              
              quizModified = true;
              totalQuestionsFixed++;
            }
          }
        });

        if (quizModified) {
          await quiz.save();
          console.log(`   ✅ Quiz atualizado com sucesso`);
          totalQuizzesUpdated++;
        } else {
          console.log(`   ℹ️  Quiz já estava correto`);
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📊 RESUMO FINAL:');
    console.log(`   Quizzes atualizados: ${totalQuizzesUpdated}`);
    console.log(`   Perguntas corrigidas: ${totalQuestionsFixed}`);
    
    if (totalQuestionsFixed > 0) {
      console.log('\n✅ Todas as respostas foram corrigidas!');
      console.log('   Agora os quizzes devem funcionar corretamente.');
    } else {
      console.log('\n✅ Todos os quizzes já estavam corretos!');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
};

fixAllAnswers();

















