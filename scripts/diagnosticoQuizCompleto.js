const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../src/models/Quiz');
const aprendizQuestions = require('../../perguntas_nivel_aprendiz.json');

const diagnosticoCompleto = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    console.log('🔍 DIAGNÓSTICO COMPLETO DOS QUIZZES\n');
    console.log('='.repeat(80));

    // 1. Verificar quantas perguntas existem no JSON
    console.log('\n📊 PERGUNTAS NO JSON:');
    console.log(`   Total de perguntas: ${aprendizQuestions.questions.length}`);
    
    // Agrupar por módulo
    const questionsByModule = {};
    aprendizQuestions.questions.forEach(q => {
      if (!questionsByModule[q.module]) questionsByModule[q.module] = [];
      questionsByModule[q.module].push(q);
    });
    
    console.log(`   Módulos únicos: ${Object.keys(questionsByModule).length}`);
    Object.entries(questionsByModule).forEach(([mod, qs]) => {
      console.log(`      ${mod}: ${qs.length} perguntas`);
    });

    // 2. Verificar quantos quizzes existem no banco
    console.log('\n📚 QUIZZES NO BANCO DE DADOS:');
    const allQuizzes = await Quiz.find({});
    console.log(`   Total de quizzes: ${allQuizzes.length}`);

    // 3. Verificar perguntas em cada quiz
    console.log('\n📝 DETALHAMENTO DOS QUIZZES:');
    let totalQuestionsInDb = 0;
    let quizzesWithProblems = [];

    for (const quiz of allQuizzes) {
      const questionsCount = quiz.questions ? quiz.questions.length : 0;
      totalQuestionsInDb += questionsCount;
      
      console.log(`\n   🎯 Quiz: ${quiz.title}`);
      console.log(`      Nível: ${quiz.level}`);
      console.log(`      Categoria: ${quiz.category}`);
      console.log(`      Perguntas: ${questionsCount}`);

      // Verificar se tem perguntas
      if (questionsCount === 0) {
        quizzesWithProblems.push({
          quiz: quiz.title,
          problema: 'Sem perguntas'
        });
        console.log(`      ⚠️ PROBLEMA: Quiz sem perguntas!`);
      } else if (questionsCount <= 2) {
        quizzesWithProblems.push({
          quiz: quiz.title,
          problema: `Apenas ${questionsCount} perguntas`
        });
        console.log(`      ⚠️ PROBLEMA: Apenas ${questionsCount} perguntas!`);
      }

      // Verificar se as perguntas têm respostas corretas
      let questionsWithoutCorrect = 0;
      let questionsWithMultipleCorrect = 0;
      
      quiz.questions.forEach((q, idx) => {
        const correctOptions = q.options.filter(opt => opt.isCorrect === true);
        
        if (correctOptions.length === 0) {
          questionsWithoutCorrect++;
        } else if (correctOptions.length > 1) {
          questionsWithMultipleCorrect++;
        }
      });

      if (questionsWithoutCorrect > 0) {
        console.log(`      ⚠️ ${questionsWithoutCorrect} perguntas SEM resposta correta marcada`);
        quizzesWithProblems.push({
          quiz: quiz.title,
          problema: `${questionsWithoutCorrect} perguntas sem resposta correta`
        });
      }

      if (questionsWithMultipleCorrect > 0) {
        console.log(`      ⚠️ ${questionsWithMultipleCorrect} perguntas com MÚLTIPLAS respostas corretas`);
        quizzesWithProblems.push({
          quiz: quiz.title,
          problema: `${questionsWithMultipleCorrect} perguntas com múltiplas respostas`
        });
      }

      // Mostrar detalhes de até 3 perguntas
      if (questionsCount > 0) {
        console.log(`\n      📋 Primeiras perguntas:`);
        quiz.questions.slice(0, Math.min(3, questionsCount)).forEach((q, idx) => {
          const correctIdx = q.options.findIndex(opt => opt.isCorrect === true);
          console.log(`         ${idx + 1}. "${q.question.substring(0, 50)}..."`);
          console.log(`            Opções: ${q.options.length}`);
          console.log(`            Resposta correta: índice ${correctIdx}`);
          
          if (correctIdx >= 0) {
            console.log(`            Resposta: "${q.options[correctIdx].label}"`);
          }
        });
      }
    }

    // 4. Resumo final
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 RESUMO DO DIAGNÓSTICO:\n');
    console.log(`   📝 Perguntas no JSON: ${aprendizQuestions.questions.length}`);
    console.log(`   📚 Quizzes no banco: ${allQuizzes.length}`);
    console.log(`   📝 Total de perguntas no banco: ${totalQuestionsInDb}`);
    console.log(`   ⚠️  Quizzes com problemas: ${quizzesWithProblems.length}`);

    if (quizzesWithProblems.length > 0) {
      console.log('\n⚠️  PROBLEMAS IDENTIFICADOS:\n');
      quizzesWithProblems.forEach((p, idx) => {
        console.log(`   ${idx + 1}. ${p.quiz}: ${p.problema}`);
      });
    }

    // 5. Comparar uma pergunta específica do JSON com o banco
    console.log('\n🔍 TESTE DE COMPARAÇÃO (Primeira pergunta):');
    const firstQuestion = aprendizQuestions.questions[0];
    console.log(`\n   NO JSON:`);
    console.log(`      Pergunta: "${firstQuestion.question}"`);
    console.log(`      Opções: ${firstQuestion.options.length}`);
    console.log(`      Resposta correta (índice): ${firstQuestion.correctAnswer}`);
    console.log(`      Opção correta: "${firstQuestion.options[firstQuestion.correctAnswer]}"`);

    // Procurar essa mesma pergunta no banco
    const quizWithQuestion = await Quiz.findOne({ 
      'questions.question': firstQuestion.question 
    });

    if (quizWithQuestion) {
      const questionInDb = quizWithQuestion.questions.find(
        q => q.question === firstQuestion.question
      );
      
      console.log(`\n   NO BANCO DE DADOS:`);
      console.log(`      Pergunta: "${questionInDb.question}"`);
      console.log(`      Opções: ${questionInDb.options.length}`);
      
      const correctIdx = questionInDb.options.findIndex(opt => opt.isCorrect === true);
      console.log(`      Resposta correta (índice): ${correctIdx}`);
      
      if (correctIdx >= 0) {
        console.log(`      Opção correta: "${questionInDb.options[correctIdx].label}"`);
      } else {
        console.log(`      ⚠️ NENHUMA OPÇÃO MARCADA COMO CORRETA!`);
      }

      // Comparar se está correto
      if (correctIdx === firstQuestion.correctAnswer) {
        console.log(`\n   ✅ RESPOSTA CORRETA ESTÁ OK!`);
      } else {
        console.log(`\n   ❌ RESPOSTA CORRETA ESTÁ ERRADA!`);
        console.log(`      Esperado: índice ${firstQuestion.correctAnswer}`);
        console.log(`      Encontrado: índice ${correctIdx}`);
      }
    } else {
      console.log(`\n   ⚠️ Pergunta não encontrada no banco de dados!`);
    }

    console.log('\n' + '='.repeat(80));
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
};

diagnosticoCompleto();

