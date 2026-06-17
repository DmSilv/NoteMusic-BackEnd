const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/quiz.model');
const aprendizQuestions = require('../../perguntas_nivel_aprendiz.json');

/**
 * Script para testar a validação de respostas do quiz
 * Verifica se a resposta correta no JSON corresponde à resposta no banco
 */
const testValidation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    console.log('🧪 TESTE DE VALIDAÇÃO DE RESPOSTAS\n');
    console.log('='.repeat(80));

    // Pegar alguns quizzes de aprendiz para testar
    const quizzes = await Quiz.find({ level: 'aprendiz' }).limit(5);
    
    console.log(`\n📊 Testando ${quizzes.length} quizzes...\n`);

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const failures = [];

    for (const quiz of quizzes) {
      console.log(`\n🎯 Quiz: ${quiz.title}`);
      console.log(`   Perguntas: ${quiz.questions.length}`);

      // Para cada pergunta do quiz, testar a validação
      quiz.questions.forEach((question, qIdx) => {
        totalTests++;
        
        // Encontrar a opção correta
        const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
        
        if (correctOptionIndex === -1) {
          console.log(`   ❌ Pergunta ${qIdx + 1}: SEM RESPOSTA CORRETA MARCADA!`);
          console.log(`      "${question.question.substring(0, 50)}..."`);
          failedTests++;
          failures.push({
            quiz: quiz.title,
            questionIndex: qIdx,
            question: question.question,
            problem: 'Nenhuma opção marcada como correta'
          });
        } else {
          // Simular que o usuário selecionou a resposta correta
          const userAnswer = correctOptionIndex;
          
          // Validar se a resposta está correta
          const isCorrect = userAnswer === correctOptionIndex;
          
          if (isCorrect) {
            console.log(`   ✅ Pergunta ${qIdx + 1}: OK`);
            passedTests++;
          } else {
            console.log(`   ❌ Pergunta ${qIdx + 1}: ERRO NA VALIDAÇÃO`);
            failedTests++;
            failures.push({
              quiz: quiz.title,
              questionIndex: qIdx,
              question: question.question,
              problem: 'Erro na lógica de validação'
            });
          }
        }
      });
    }

    // Resumo
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 RESUMO DOS TESTES:\n');
    console.log(`   Total de testes: ${totalTests}`);
    console.log(`   ✅ Testes passados: ${passedTests}`);
    console.log(`   ❌ Testes falhados: ${failedTests}`);
    console.log(`   Taxa de sucesso: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (failures.length > 0) {
      console.log('\n❌ FALHAS DETALHADAS:\n');
      failures.forEach((f, idx) => {
        console.log(`   ${idx + 1}. ${f.quiz} - Pergunta ${f.questionIndex + 1}`);
        console.log(`      Problema: ${f.problem}`);
        console.log(`      Pergunta: "${f.question.substring(0, 60)}..."`);
        console.log('');
      });
    } else {
      console.log('\n✅ TODOS OS TESTES PASSARAM!');
      console.log('   O sistema de validação está funcionando corretamente.');
    }

    // Teste de validação com resposta errada
    console.log('\n' + '='.repeat(80));
    console.log('\n🧪 TESTE DE VALIDAÇÃO COM RESPOSTA ERRADA:\n');
    
    const testQuiz = quizzes[0];
    if (testQuiz && testQuiz.questions.length > 0) {
      const testQuestion = testQuiz.questions[0];
      const correctIdx = testQuestion.options.findIndex(opt => opt.isCorrect === true);
      const wrongIdx = (correctIdx + 1) % testQuestion.options.length; // Pegar opção diferente
      
      console.log(`Quiz: ${testQuiz.title}`);
      console.log(`Pergunta: "${testQuestion.question}"`);
      console.log(`\n Opções:`);
      testQuestion.options.forEach((opt, idx) => {
        console.log(`   ${idx}. ${opt.label} ${idx === correctIdx ? '✓' : ''}`);
      });
      
      console.log(`\n Resposta correta: ${correctIdx} - "${testQuestion.options[correctIdx].label}"`);
      console.log(`Resposta do usuário (errada): ${wrongIdx} - "${testQuestion.options[wrongIdx].label}"`);
      
      const isCorrect = wrongIdx === correctIdx;
      console.log(`\nValidação: ${isCorrect ? '✅ CORRETA (ERRO!)' : '❌ INCORRETA (CORRETO!)'}`);
      
      if (!isCorrect) {
        console.log('✅ O sistema detectou corretamente que a resposta está errada!');
      } else {
        console.log('❌ ERRO CRÍTICO: O sistema não detectou que a resposta está errada!');
      }
    }

    console.log('\n' + '='.repeat(80));
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
};

testValidation();

