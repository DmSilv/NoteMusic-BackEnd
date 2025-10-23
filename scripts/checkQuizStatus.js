const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../src/models/Quiz');

// Conectar ao banco
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
};

// Função para verificar o status atual dos quizzes
const checkQuizStatus = async () => {
  try {
    const quizzes = await Quiz.find({});
    
    console.log('=' .repeat(80));
    console.log('📊 RELATÓRIO DE STATUS DOS QUIZZES');
    console.log('=' .repeat(80));
    console.log(`\nTotal de quizzes: ${quizzes.length}\n`);
    
    for (const quiz of quizzes) {
      console.log('\n' + '-'.repeat(80));
      console.log(`📖 Quiz: "${quiz.title}"`);
      console.log(`   ID: ${quiz._id}`);
      console.log(`   Nível: ${quiz.level}`);
      console.log(`   Total de questões: ${quiz.questions.length}`);
      console.log('-'.repeat(80));
      
      quiz.questions.forEach((q, idx) => {
        console.log(`\n  ${idx + 1}. ${q.question}`);
        
        // Contar quantas opções corretas
        const correctCount = q.options.filter(opt => opt.isCorrect).length;
        
        if (correctCount === 0) {
          console.log(`     ⚠️  PROBLEMA: Nenhuma opção marcada como correta!`);
        } else if (correctCount > 1) {
          console.log(`     ⚠️  PROBLEMA: ${correctCount} opções marcadas como corretas!`);
        }
        
        q.options.forEach((opt, optIdx) => {
          const marker = opt.isCorrect ? '✅' : '  ';
          console.log(`     ${marker} ${String.fromCharCode(65 + optIdx)}) ${opt.label}`);
        });
        
        if (q.explanation) {
          console.log(`     💡 Explicação: ${q.explanation.substring(0, 100)}...`);
        } else {
          console.log(`     ⚠️  Sem explicação`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Verificação concluída!');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Erro ao verificar quizzes:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await checkQuizStatus();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();

