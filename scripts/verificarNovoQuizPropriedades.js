const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz');

async function verificarNovoQuiz() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');
    
    // Procurar o quiz de Propriedades do Som
    const quiz = await Quiz.findOne({ title: 'Quiz - Propriedades do Som' });
    
    if (!quiz) {
      console.log('❌ Quiz "Propriedades do Som" não encontrado!');
      return;
    }
    
    console.log('✅ Quiz encontrado!');
    console.log(`📋 Título: ${quiz.title}`);
    console.log(`🆔 ID: ${quiz._id}`);
    console.log(`🏷️  Categoria: ${quiz.category || 'N/A'}`);
    console.log(`🎯 Nível: ${quiz.level}`);
    console.log(`📝 Total de questões: ${quiz.questions.length}\n`);
    
    console.log('='.repeat(80));
    console.log('🔍 ANÁLISE DAS QUESTÕES E OPÇÕES:');
    console.log('='.repeat(80));
    
    let todasOpcoesOk = true;
    
    quiz.questions.forEach((q, idx) => {
      console.log(`\n📌 Questão ${idx + 1}:`);
      console.log(`   Pergunta: "${q.question}"`);
      console.log(`   Opções:`);
      
      let temOpcaoCorreta = false;
      q.options.forEach((opt, i) => {
        const marcador = opt.isCorrect ? '✅' : '  ';
        const textoOpcao = opt.label || opt.text || 'undefined';
        console.log(`      ${marcador} ${opt.id || i}. ${textoOpcao}`);
        
        if (opt.isCorrect) temOpcaoCorreta = true;
        if (!opt.label && !opt.text) todasOpcoesOk = false;
      });
      
      if (!temOpcaoCorreta) {
        console.log(`   ⚠️  PROBLEMA: Nenhuma opção marcada como correta!`);
        todasOpcoesOk = false;
      }
      
      if (q.explanation) {
        console.log(`   💡 Explicação: "${q.explanation}"`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    if (todasOpcoesOk) {
      console.log('✅ PERFEITO! Todas as opções têm texto correto!');
    } else {
      console.log('❌ PROBLEMA: Algumas opções ainda estão undefined!');
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado do MongoDB');
  }
}

verificarNovoQuiz();

