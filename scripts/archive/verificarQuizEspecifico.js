const mongoose = require('mongoose');
const Quiz = require('../../src/models/Quiz');

async function verificarQuizEspecifico() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');
    
    // ID do quiz que está falhando no frontend
    const quizId = '68e84ae6ef726eb6954dfa05';
    
    console.log(`🔍 Procurando quiz com ID: ${quizId}\n`);
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      console.log('❌ Quiz não encontrado no banco de dados!');
      console.log('\n📋 Listando todos os quizzes disponíveis:\n');
      
      const todosQuizzes = await Quiz.find({});
      todosQuizzes.forEach((q, idx) => {
        console.log(`${idx + 1}. ${q.title}`);
        console.log(`   ID: ${q._id}`);
        console.log(`   Questões: ${q.questions.length}`);
        console.log(`   Categoria: ${q.category}`);
        console.log('');
      });
      return;
    }
    
    console.log('✅ Quiz encontrado!');
    console.log(`📋 Título: ${quiz.title}`);
    console.log(`🏷️  Categoria: ${quiz.category}`);
    console.log(`🎯 Nível: ${quiz.level}`);
    console.log(`📝 Total de questões: ${quiz.questions.length}\n`);
    
    console.log('='.repeat(80));
    console.log('🔍 ANÁLISE DAS QUESTÕES:');
    console.log('='.repeat(80));
    
    let questoesComProblema = 0;
    
    quiz.questions.forEach((q, idx) => {
      console.log(`\n📌 Questão ${idx + 1}:`);
      console.log(`   Pergunta: "${q.question}"`);
      console.log(`   Categoria: ${q.category || 'N/A'}`);
      console.log(`   Opções:`);
      
      let temOpcaoCorreta = false;
      q.options.forEach((opt, i) => {
        const marcador = opt.isCorrect ? '✅' : '  ';
        console.log(`      ${marcador} ${i}. ${opt.text}`);
        if (opt.isCorrect) temOpcaoCorreta = true;
      });
      
      if (!temOpcaoCorreta) {
        console.log(`   ⚠️  PROBLEMA: Nenhuma opção marcada como correta!`);
        questoesComProblema++;
      }
      
      if (q.explanation) {
        console.log(`   💡 Explicação: "${q.explanation}"`);
      } else {
        console.log(`   ⚠️  Sem explicação`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO:');
    console.log('='.repeat(80));
    console.log(`✅ Questões OK: ${quiz.questions.length - questoesComProblema}`);
    console.log(`⚠️  Questões com problema: ${questoesComProblema}`);
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado do MongoDB');
  }
}

verificarQuizEspecifico();

