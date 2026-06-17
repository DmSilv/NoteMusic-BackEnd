const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/quiz.model');

// Conectar ao banco
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
};

// Função para atualizar manualmente as opções corretas na pergunta sobre crescendo
const manualFix = async () => {
  try {
    console.log('🔧 Iniciando correção manual...');
    
    // Buscar o quiz de propriedades do som
    const quiz = await Quiz.findOne({ title: { $regex: /Propriedades do Som/i } });
    
    if (!quiz) {
      console.log('❌ Quiz não encontrado');
      return;
    }
    
    console.log(`✅ Quiz encontrado: ${quiz.title}`);
    console.log(`   Total de questões: ${quiz.questions.length}`);
    
    // Visualizar todas as questões
    console.log('\n📝 Lista de questões:');
    quiz.questions.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.question}`);
    });
    
    // Procurar a questão específica sobre crescendo
    const crescendoQuestionIdx = quiz.questions.findIndex(q => 
      q.question.includes('Se você está tocando "piano" e quer ficar "forte"'));
    
    if (crescendoQuestionIdx === -1) {
      console.log('\n❌ Questão específica sobre crescendo não encontrada');
      
      // Verificar se há uma questão alternativa sobre crescendo
      const altIdx = quiz.questions.findIndex(q => 
        q.question.includes('crescendo') || (q.question.toLowerCase().includes('forte') && q.question.toLowerCase().includes('piano')));
      
      if (altIdx !== -1) {
        console.log(`✅ Questão alternativa encontrada: "${quiz.questions[altIdx].question}"`);
        
        // Exibir opções
        console.log('\n📋 Opções:');
        quiz.questions[altIdx].options.forEach((o, i) => {
          console.log(`   ${i + 1}. ${o.label} (${o.isCorrect ? '✓' : '✗'})`);
        });
        
        // Corrigir manualmente - definir opção 0 (Crescendo) como correta
        const crescendoIdx = quiz.questions[altIdx].options.findIndex(o => 
          o.label.toLowerCase().includes('crescendo'));
        
        if (crescendoIdx !== -1) {
          // Marcar todas as opções como incorretas primeiro
          quiz.questions[altIdx].options.forEach((o, i) => {
            quiz.questions[altIdx].options[i].isCorrect = false;
          });
          
          // Marcar a opção de crescendo como correta
          quiz.questions[altIdx].options[crescendoIdx].isCorrect = true;
          
          // Verificar se o símbolo está correto
          const crescendoOpt = quiz.questions[altIdx].options[crescendoIdx];
          if (!crescendoOpt.label.includes('<')) {
            // Adicionar o símbolo correto
            quiz.questions[altIdx].options[crescendoIdx].label = 'Crescendo (<)';
          }
          
          await quiz.save();
          console.log(`✅ Questão corrigida! Opção "${quiz.questions[altIdx].options[crescendoIdx].label}" marcada como correta`);
        } else {
          console.log('❌ Nenhuma opção de crescendo encontrada');
        }
      } else {
        console.log('❌ Nenhuma questão sobre crescendo encontrada');
      }
      return;
    }
    
    // Questão encontrada, exibir opções
    console.log(`\n✅ Questão encontrada (${crescendoQuestionIdx + 1}): "${quiz.questions[crescendoQuestionIdx].question}"`);
    console.log('\n📋 Opções:');
    quiz.questions[crescendoQuestionIdx].options.forEach((o, i) => {
      console.log(`   ${i + 1}. ${o.label} (${o.isCorrect ? '✓' : '✗'})`);
    });
    
    // Corrigir manualmente - definir opção 0 (Crescendo) como correta
    // Marcar todas as opções como incorretas primeiro
    quiz.questions[crescendoQuestionIdx].options.forEach((o, i) => {
      quiz.questions[crescendoQuestionIdx].options[i].isCorrect = false;
    });
    
    // Marcar a opção de crescendo como correta (índice 0)
    quiz.questions[crescendoQuestionIdx].options[0].isCorrect = true;
    
    // Verificar se o símbolo está correto
    if (!quiz.questions[crescendoQuestionIdx].options[0].label.includes('<')) {
      quiz.questions[crescendoQuestionIdx].options[0].label = 'Crescendo (<)';
    }
    
    await quiz.save();
    console.log(`\n✅ Correção aplicada! Opção "${quiz.questions[crescendoQuestionIdx].options[0].label}" marcada como correta`);
    
  } catch (error) {
    console.error('❌ Erro ao realizar correção manual:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await manualFix();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























