const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../src/models/Quiz');

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

// Equilibrar a distribuição das respostas corretas
const balanceAnswerDistribution = async () => {
  try {
    console.log('🔍 Analisando distribuição atual das respostas corretas...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    // Inicializar contadores
    const distribution = {0: 0, 1: 0, 2: 0, 3: 0};
    let totalQuestions = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      // Para cada questão
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        totalQuestions++;
        
        // Encontrar o índice da opção correta
        const correctIndex = question.options.findIndex(opt => opt.isCorrect);
        
        // Incrementar o contador para este índice
        if (correctIndex >= 0 && correctIndex < 4) {
          distribution[correctIndex]++;
        }
      }
    }
    
    console.log('\n📊 Distribuição atual das respostas corretas:');
    for (let i = 0; i < 4; i++) {
      const percentage = (distribution[i] / totalQuestions * 100).toFixed(1);
      console.log(`   Opção ${i + 1}: ${distribution[i]} questões (${percentage}%)`);
    }
    
    // Calcular a distribuição ideal
    const idealCount = Math.ceil(totalQuestions / 4); // Quantas questões deveriam ter cada opção
    
    console.log('\n🎯 Distribuição ideal:');
    console.log(`   Cada opção deveria ter aproximadamente ${idealCount} questões (25%)`);
    
    // Determinar quais opções precisam de mais ou menos questões
    const needsMore = [];
    const needsLess = [];
    
    for (let i = 0; i < 4; i++) {
      const diff = idealCount - distribution[i];
      if (diff > 0) {
        needsMore.push({index: i, diff});
      } else if (diff < 0) {
        needsLess.push({index: i, diff: -diff});
      }
    }
    
    console.log('\n🔄 Ajustes necessários:');
    needsMore.forEach(item => {
      console.log(`   Opção ${item.index + 1} precisa de +${item.diff} questões`);
    });
    needsLess.forEach(item => {
      console.log(`   Opção ${item.index + 1} precisa de -${item.diff} questões`);
    });
    
    // Realizar o balanceamento
    console.log('\n🔧 Realizando balanceamento...');
    
    let quizzesModified = 0;
    let questionsModified = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      let quizModified = false;
      
      // Para cada questão
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        
        // Encontrar o índice da opção correta
        const currentCorrectIndex = question.options.findIndex(opt => opt.isCorrect);
        
        // Verificar se esta questão precisa ser modificada
        if (needsLess.length > 0 && needsMore.length > 0) {
          const currentIndexNeedsLess = needsLess.findIndex(item => item.index === currentCorrectIndex);
          
          if (currentIndexNeedsLess !== -1) {
            // Esta questão tem uma opção correta que precisa ser reduzida
            const targetIndex = needsMore[0].index;
            
            // Verificar se a questão tem opção no índice alvo
            if (question.options.length > targetIndex) {
              console.log(`   Movendo resposta correta da opção ${currentCorrectIndex + 1} para a opção ${targetIndex + 1} na questão ${i + 1} do quiz "${quiz.title}"`);
              
              // Marcar a opção atual como incorreta
              quiz.questions[i].options[currentCorrectIndex].isCorrect = false;
              
              // Marcar a nova opção como correta
              quiz.questions[i].options[targetIndex].isCorrect = true;
              
              // Atualizar contadores
              needsLess[currentIndexNeedsLess].diff--;
              if (needsLess[currentIndexNeedsLess].diff === 0) {
                needsLess.splice(currentIndexNeedsLess, 1);
              }
              
              needsMore[0].diff--;
              if (needsMore[0].diff === 0) {
                needsMore.splice(0, 1);
              }
              
              quizModified = true;
              questionsModified++;
            }
          }
        }
      }
      
      // Salvar alterações se o quiz foi modificado
      if (quizModified) {
        await quiz.save();
        console.log(`✅ Quiz atualizado: ${quiz.title}`);
        quizzesModified++;
      }
    }
    
    console.log('\n📊 Resumo do balanceamento:');
    console.log(`   Quizzes modificados: ${quizzesModified}`);
    console.log(`   Questões modificadas: ${questionsModified}`);
    
    // Verificar a nova distribuição
    if (questionsModified > 0) {
      console.log('\n🔍 Verificando nova distribuição...');
      
      // Reinicializar contadores
      const newDistribution = {0: 0, 1: 0, 2: 0, 3: 0};
      
      // Buscar quizzes atualizados
      const updatedQuizzes = await Quiz.find({});
      
      // Para cada quiz
      for (const quiz of updatedQuizzes) {
        // Para cada questão
        for (let i = 0; i < quiz.questions.length; i++) {
          const question = quiz.questions[i];
          
          // Encontrar o índice da opção correta
          const correctIndex = question.options.findIndex(opt => opt.isCorrect);
          
          // Incrementar o contador para este índice
          if (correctIndex >= 0 && correctIndex < 4) {
            newDistribution[correctIndex]++;
          }
        }
      }
      
      console.log('\n📊 Nova distribuição das respostas corretas:');
      for (let i = 0; i < 4; i++) {
        const percentage = (newDistribution[i] / totalQuestions * 100).toFixed(1);
        console.log(`   Opção ${i + 1}: ${newDistribution[i]} questões (${percentage}%)`);
      }
      
      // Verificar se ainda há desequilíbrio significativo
      const idealPercentage = 25; // 25% para cada opção em uma distribuição ideal
      const threshold = 10; // Considerar desequilíbrio se diferença > 10%
      
      let hasImbalance = false;
      for (let i = 0; i < 4; i++) {
        const percentage = (newDistribution[i] / totalQuestions * 100);
        if (Math.abs(percentage - idealPercentage) > threshold) {
          hasImbalance = true;
        }
      }
      
      if (hasImbalance) {
        console.log('\n⚠️ Ainda há desequilíbrio na distribuição das respostas corretas. Considere executar este script novamente.');
      } else {
        console.log('\n✅ A distribuição das respostas corretas agora está equilibrada.');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao equilibrar distribuição das respostas:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    
    // Equilibrar a distribuição das respostas corretas
    await balanceAnswerDistribution();
    
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();

























