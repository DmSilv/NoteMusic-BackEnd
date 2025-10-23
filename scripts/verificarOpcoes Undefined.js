const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz');

async function verificarOpcoesUndefined() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');
    
    const todosQuizzes = await Quiz.find({});
    console.log(`📊 Total de quizzes no banco: ${todosQuizzes.length}\n`);
    
    console.log('🔍 Verificando quizzes com opções undefined...\n');
    console.log('='.repeat(80));
    
    let quizzesAfetados = [];
    let totalOpcoesUndefined = 0;
    
    for (const quiz of todosQuizzes) {
      let opcoesUndefinedNesteQuiz = 0;
      
      for (const questao of quiz.questions) {
        for (const opcao of questao.options) {
          if (opcao.text === undefined || opcao.text === null || opcao.text === '') {
            opcoesUndefinedNesteQuiz++;
            totalOpcoesUndefined++;
          }
        }
      }
      
      if (opcoesUndefinedNesteQuiz > 0) {
        quizzesAfetados.push({
          id: quiz._id,
          title: quiz.title,
          category: quiz.category,
          level: quiz.level,
          opcoesAfetadas: opcoesUndefinedNesteQuiz,
          totalQuestoes: quiz.questions.length
        });
      }
    }
    
    if (quizzesAfetados.length === 0) {
      console.log('✅ Nenhum quiz com opções undefined encontrado!\n');
    } else {
      console.log(`❌ ENCONTRADOS ${quizzesAfetados.length} QUIZZES COM OPÇÕES UNDEFINED:\n`);
      
      quizzesAfetados.forEach((quiz, idx) => {
        console.log(`${idx + 1}. "${quiz.title}"`);
        console.log(`   ID: ${quiz.id}`);
        console.log(`   Categoria: ${quiz.category || 'N/A'}`);
        console.log(`   Nível: ${quiz.level}`);
        console.log(`   ⚠️  ${quiz.opcoesAfetadas} opções undefined (${quiz.totalQuestoes} questões)`);
        console.log('');
      });
      
      console.log('='.repeat(80));
      console.log(`📊 TOTAL: ${totalOpcoesUndefined} opções undefined em ${quizzesAfetados.length} quizzes`);
      console.log('='.repeat(80));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado do MongoDB');
  }
}

verificarOpcoesUndefined();

