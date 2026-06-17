const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/Quiz');

const simpleFixAnswers = async () => {
  try {
    console.log('🔧 SCRIPT SIMPLIFICADO DE CORREÇÃO\n');
    
    // Conectar ao MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic';
    console.log('📡 Conectando ao MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado!\n');

    // Buscar TODOS os quizzes
    console.log('🔍 Buscando todos os quizzes...');
    const allQuizzes = await Quiz.find({});
    console.log(`📊 Total de quizzes encontrados: ${allQuizzes.length}\n`);

    let totalProblems = 0;
    let totalFixed = 0;

    // Verificar cada quiz
    for (const quiz of allQuizzes) {
      console.log(`\n📚 Quiz: ${quiz.title} (${quiz.level})`);
      console.log(`   Perguntas: ${quiz.questions.length}`);
      
      let quizHasProblems = false;
      
      // Verificar cada pergunta
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        const correctOptions = question.options.filter(opt => opt.isCorrect === true);
        
        if (correctOptions.length === 0) {
          console.log(`   ❌ Pergunta ${i + 1}: SEM resposta correta!`);
          console.log(`      "${question.question.substring(0, 50)}..."`);
          totalProblems++;
          quizHasProblems = true;
          
          // Tentar corrigir baseado na explicação
          // A opção com explicação geralmente é a correta
          const optionWithExplanation = question.options.findIndex(opt => opt.explanation && opt.explanation.length > 0);
          
          if (optionWithExplanation >= 0) {
            question.options[optionWithExplanation].isCorrect = true;
            console.log(`      🔧 CORRIGIDO: Marcando opção ${optionWithExplanation} (${question.options[optionWithExplanation].id}) como correta`);
            totalFixed++;
          } else {
            console.log(`      ⚠️  NÃO FOI POSSÍVEL CORRIGIR AUTOMATICAMENTE`);
          }
        } else if (correctOptions.length > 1) {
          console.log(`   ⚠️  Pergunta ${i + 1}: ${correctOptions.length} respostas marcadas como corretas!`);
          totalProblems++;
          quizHasProblems = true;
          
          // Corrigir: manter apenas a primeira como correta
          question.options.forEach((opt, idx) => {
            const firstCorrectIndex = question.options.findIndex(o => o.isCorrect);
            opt.isCorrect = (idx === firstCorrectIndex);
          });
          console.log(`      🔧 CORRIGIDO: Mantendo apenas primeira opção correta`);
          totalFixed++;
        }
      }
      
      // Salvar quiz se teve problemas
      if (quizHasProblems) {
        try {
          await quiz.save();
          console.log(`   ✅ Quiz salvo com correções`);
        } catch (saveError) {
          console.error(`   ❌ Erro ao salvar: ${saveError.message}`);
        }
      } else {
        console.log(`   ✅ Quiz OK - nenhum problema encontrado`);
      }
    }

    // Resumo
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 RESUMO FINAL:');
    console.log(`   Total de quizzes verificados: ${allQuizzes.length}`);
    console.log(`   Total de problemas encontrados: ${totalProblems}`);
    console.log(`   Total de problemas corrigidos: ${totalFixed}`);
    
    if (totalProblems === 0) {
      console.log('\n✅ Nenhum problema encontrado! Todos os quizzes estão corretos.');
    } else if (totalFixed === totalProblems) {
      console.log('\n✅ Todos os problemas foram corrigidos com sucesso!');
    } else {
      console.log('\n⚠️  Alguns problemas não puderam ser corrigidos automaticamente.');
      console.log('   Verifique manualmente os quizzes problemáticos.');
    }

    await mongoose.connection.close();
    console.log('\n🔌 Conexão encerrada.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Executar
simpleFixAnswers();





















