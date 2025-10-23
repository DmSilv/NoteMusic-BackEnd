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

// Função para encontrar e corrigir TODAS as perguntas sobre crescendo
const fixAllCrescendoQuestions = async () => {
  try {
    console.log('\n🔍 Buscando TODAS as perguntas sobre crescendo/dinâmica...\n');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📚 Total de quizzes encontrados: ${quizzes.length}\n`);
    
    let totalFixed = 0;
    
    for (const quiz of quizzes) {
      console.log(`\n📖 Analisando quiz: "${quiz.title}"`);
      let quizModified = false;
      
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        const questionText = question.question.toLowerCase();
        
        // Detectar perguntas sobre crescendo de várias formas
        const isCrescendoQuestion = 
          questionText.includes('crescendo') ||
          questionText.includes('símbolo') && (questionText.includes('<') || questionText.includes('>')) ||
          (questionText.includes('o que significa') && questionText.includes('princípios da música'));
        
        if (isCrescendoQuestion) {
          console.log(`\n  🎯 Questão ${i + 1} detectada:`);
          console.log(`     "${question.question}"\n`);
          
          // Mostrar opções atuais
          console.log('     Opções atuais:');
          question.options.forEach((opt, idx) => {
            const status = opt.isCorrect ? '✅ CORRETA' : '❌';
            console.log(`     ${idx}. ${opt.label} ${status}`);
          });
          
          // LÓGICA DE CORREÇÃO
          let correctIndex = -1;
          
          // Encontrar a opção correta baseada no conteúdo
          for (let j = 0; j < question.options.length; j++) {
            const optLabel = question.options[j].label.toLowerCase();
            
            // Crescendo = Aumentar intensidade
            if (
              optLabel.includes('aumentar') && 
              (optLabel.includes('intensidade') || optLabel.includes('volume')) &&
              optLabel.includes('gradualmente')
            ) {
              correctIndex = j;
              break;
            }
          }
          
          // Se não encontrou por conteúdo, procurar por palavras-chave
          if (correctIndex === -1) {
            for (let j = 0; j < question.options.length; j++) {
              const optLabel = question.options[j].label.toLowerCase();
              
              if (
                (optLabel.includes('crescendo') && optLabel.includes('<')) ||
                (optLabel.includes('aumentar') && optLabel.includes('intensidade'))
              ) {
                correctIndex = j;
                break;
              }
            }
          }
          
          if (correctIndex !== -1) {
            // Marcar todas como incorretas primeiro
            question.options.forEach((opt, idx) => {
              quiz.questions[i].options[idx].isCorrect = false;
            });
            
            // Marcar a opção correta
            quiz.questions[i].options[correctIndex].isCorrect = true;
            
            // Atualizar explicação
            quiz.questions[i].explanation = "O crescendo (<) é uma indicação de dinâmica que orienta o músico a aumentar gradualmente a intensidade (volume) do som. É diferente de altura (que seria mudar de nota). Seu oposto é o diminuendo ou decrescendo (>), que indica redução gradual da intensidade.";
            
            quizModified = true;
            totalFixed++;
            
            console.log(`\n     ✅ CORRIGIDO! Opção correta: "${quiz.questions[i].options[correctIndex].label}"`);
          } else {
            console.log(`     ⚠️ Não foi possível identificar automaticamente a opção correta`);
            console.log(`     Por favor, verifique manualmente esta questão.`);
          }
        }
      }
      
      // Salvar o quiz se foi modificado
      if (quizModified) {
        await quiz.save();
        console.log(`\n  💾 Quiz salvo com correções`);
      }
    }
    
    console.log(`\n\n🎉 Correção concluída!`);
    console.log(`📊 Total de questões corrigidas: ${totalFixed}`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir questões:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await fixAllCrescendoQuestions();
    
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();

