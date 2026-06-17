const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../../src/models/module.model');
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

/**
 * Corrigir a questão específica sobre símbolo de crescendo
 */
const fixCrescendoQuestion = async () => {
  try {
    console.log('\n🔍 Localizando e corrigindo a questão sobre crescendo...');
    
    // Buscar o quiz sobre propriedades do som
    const quiz = await Quiz.findOne({ title: { $regex: /.*propriedades do som.*/i } });
    
    if (!quiz) {
      console.log('❌ Quiz sobre propriedades do som não encontrado');
      return;
    }
    
    console.log(`✅ Quiz encontrado: ${quiz.title}`);
    
    // Procurar a questão específica sobre crescendo
    let crescendoQuestion = null;
    let questionIndex = -1;
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (q.question.includes('Se você está tocando "piano" e quer ficar "forte"')) {
        crescendoQuestion = q;
        questionIndex = i;
        break;
      }
    }
    
    // Segunda tentativa, com critérios mais amplos
    if (!crescendoQuestion) {
      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        if (q.question.toLowerCase().includes('crescendo') || 
            (q.question.toLowerCase().includes('forte') && q.question.toLowerCase().includes('piano'))) {
          crescendoQuestion = q;
          questionIndex = i;
          break;
        }
      }
    }
    
    if (!crescendoQuestion) {
      console.log('❌ Questão sobre crescendo não encontrada');
      return;
    }
    
    console.log(`✅ Questão encontrada: "${crescendoQuestion.question}"`);
    
    // Verificar e corrigir as opções
    const options = crescendoQuestion.options;
    let correctOptionIndex = -1;
    let needsUpdate = false;
    
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      
      // Verificar se esta é a opção de crescendo
      if (option.label.toLowerCase().includes('crescendo')) {
        console.log(`   Opção encontrada: "${option.label}" (${option.isCorrect ? 'Correta' : 'Incorreta'})`);
        
        // Verificar se o símbolo está correto
          if (option.label.includes('<') || option.label.toLowerCase() === 'crescendo') {
            console.log('   ✅ Opção correta para crescendo encontrada');
            correctOptionIndex = i;
            
            // Verificar se a opção está marcada corretamente
            if (!option.isCorrect) {
              console.log('   ⚠️ Opção não está marcada como correta, corrigindo...');
              quiz.questions[questionIndex].options[i].isCorrect = true;
              needsUpdate = true;
            }
            
            // Adicionar o símbolo se estiver faltando
            if (!option.label.includes('<') && !option.label.includes('>')) {
              console.log('   ⚠️ Adicionando símbolo faltante');
              quiz.questions[questionIndex].options[i].label = `${option.label} (<)`;
              needsUpdate = true;
            }
          } 
        else if (option.label.includes('>')) {
          console.log('   ⚠️ Símbolo incorreto para crescendo: >, corrigindo...');
          quiz.questions[questionIndex].options[i].label = option.label.replace('>', '<');
          if (!option.isCorrect) {
            quiz.questions[questionIndex].options[i].isCorrect = true;
          }
          needsUpdate = true;
          correctOptionIndex = i;
        }
      }
      
      // Verificar se esta é a opção de diminuendo
      else if (option.label.toLowerCase().includes('diminuendo')) {
        console.log(`   Opção encontrada: "${option.label}" (${option.isCorrect ? 'Correta' : 'Incorreta'})`);
        
        // Verificar se o símbolo está correto
        if (option.label.includes('>')) {
          console.log('   ✅ Símbolo correto para diminuendo: >');
          
          // Se estiver marcada como correta, verificar se a pergunta é sobre diminuendo
          if (option.isCorrect && !crescendoQuestion.question.toLowerCase().includes('diminuendo')) {
            console.log('   ⚠️ Opção marcada incorretamente como correta, corrigindo...');
            quiz.questions[questionIndex].options[i].isCorrect = false;
            needsUpdate = true;
          }
        } 
        else if (option.label.includes('<')) {
          console.log('   ⚠️ Símbolo incorreto para diminuendo: <, corrigindo...');
          quiz.questions[questionIndex].options[i].label = option.label.replace('<', '>');
          needsUpdate = true;
        }
      }
      
      // Verificar outras opções que possam estar incorretamente marcadas como corretas
      else if (option.isCorrect) {
        console.log(`   ⚠️ Opção incorreta marcada como correta: "${option.label}", corrigindo...`);
        quiz.questions[questionIndex].options[i].isCorrect = false;
        needsUpdate = true;
      }
    }
    
    // Salvar alterações se necessário
    if (needsUpdate) {
      await quiz.save();
      console.log('✅ Questão atualizada com sucesso!');
    } else {
      console.log('✅ Questão já está correta, nenhuma alteração necessária');
    }
    
    // Verificar se a questão tem uma opção correta marcada
    if (correctOptionIndex === -1) {
      console.log('⚠️ Nenhuma opção correta encontrada para esta questão');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir questão sobre crescendo:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await fixCrescendoQuestion();
    console.log('\n✨ Correção concluída!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();
