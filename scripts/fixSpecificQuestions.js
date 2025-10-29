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

// Corrigir as questões específicas que o script automático não conseguiu resolver
const fixSpecificQuestions = async () => {
  try {
    console.log('🔧 Iniciando correção manual de questões específicas...');
    
    // PARTE 1: Corrigir as questões sobre intervalos musicais (Fá-Si e 1º-5º graus)
    const intervalosQuiz = await Quiz.findOne({ title: { $regex: /Intervalos Musicais/i } });
    
    if (intervalosQuiz) {
      console.log('✅ Quiz de intervalos musicais encontrado');
      
      // Questão 1: Intervalo entre Fá e Si
      const faSiQuestion = intervalosQuiz.questions.find(q => 
        q.question.includes('Fá e Si'));
      
      if (faSiQuestion) {
        // Encontrar o índice da questão
        const questionIndex = intervalosQuiz.questions.findIndex(q => q === faSiQuestion);
        console.log(`✅ Questão "Fá e Si" encontrada (índice: ${questionIndex})`);
        
        // Verificar opções
        const options = faSiQuestion.options;
        options.forEach((opt, i) => {
          console.log(`   Opção ${i+1}: ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
        });
        
        // Encontrar a opção "4ª aumentada"
        const correctOptionIndex = options.findIndex(opt => 
          opt.label.toLowerCase().includes('4ª aumentada') || 
          opt.label.toLowerCase().includes('4ª aum') ||
          opt.label.toLowerCase().includes('trítono'));
        
        if (correctOptionIndex !== -1) {
          console.log(`✅ Opção correta encontrada: "${options[correctOptionIndex].label}"`);
          
          // Marcar todas como incorretas primeiro
          for (let i = 0; i < options.length; i++) {
            intervalosQuiz.questions[questionIndex].options[i].isCorrect = false;
          }
          
          // Marcar a correta
          intervalosQuiz.questions[questionIndex].options[correctOptionIndex].isCorrect = true;
          
          console.log('✅ Questão "Fá e Si" corrigida');
        }
      }
      
      // Questão 2: Intervalo entre 1º e 5º graus
      const grausQuestion = intervalosQuiz.questions.find(q => 
        q.question.includes('1º e o 5º graus'));
      
      if (grausQuestion) {
        // Encontrar o índice da questão
        const questionIndex = intervalosQuiz.questions.findIndex(q => q === grausQuestion);
        console.log(`✅ Questão "1º e 5º graus" encontrada (índice: ${questionIndex})`);
        
        // Verificar opções
        const options = grausQuestion.options;
        options.forEach((opt, i) => {
          console.log(`   Opção ${i+1}: ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
        });
        
        // Encontrar a opção "5ª justa"
        const correctOptionIndex = options.findIndex(opt => 
          opt.label.toLowerCase().includes('5ª justa') || 
          opt.label.toLowerCase().includes('5ª j'));
        
        if (correctOptionIndex !== -1) {
          console.log(`✅ Opção correta encontrada: "${options[correctOptionIndex].label}"`);
          
          // Marcar todas como incorretas primeiro
          for (let i = 0; i < options.length; i++) {
            intervalosQuiz.questions[questionIndex].options[i].isCorrect = false;
          }
          
          // Marcar a correta
          intervalosQuiz.questions[questionIndex].options[correctOptionIndex].isCorrect = true;
          
          console.log('✅ Questão "1º e 5º graus" corrigida');
        }
      }
      
      // Salvar o quiz de intervalos
      await intervalosQuiz.save();
      console.log('✅ Quiz de intervalos musicais salvo com sucesso');
    }
    
    // PARTE 2: Corrigir figura musical (propriedades do som)
    const propSomQuiz = await Quiz.findOne({ title: { $regex: /Propriedades do Som/i } });
    
    if (propSomQuiz) {
      console.log('\n✅ Quiz de propriedades do som encontrado');
      
      // Questão: Figura musical de maior duração
      const figuraQuestion = propSomQuiz.questions.find(q => 
        q.question.includes('figura musical') && q.question.includes('maior duração'));
      
      if (figuraQuestion) {
        // Encontrar o índice da questão
        const questionIndex = propSomQuiz.questions.findIndex(q => q === figuraQuestion);
        console.log(`✅ Questão sobre figura musical encontrada (índice: ${questionIndex})`);
        
        // Verificar opções
        const options = figuraQuestion.options;
        options.forEach((opt, i) => {
          console.log(`   Opção ${i+1}: ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
        });
        
        // Encontrar a opção "Semibreve"
        const correctOptionIndex = options.findIndex(opt => 
          opt.label.toLowerCase().includes('semibreve'));
        
        if (correctOptionIndex !== -1) {
          console.log(`✅ Opção correta encontrada: "${options[correctOptionIndex].label}"`);
          
          // Marcar todas como incorretas primeiro
          for (let i = 0; i < options.length; i++) {
            propSomQuiz.questions[questionIndex].options[i].isCorrect = false;
          }
          
          // Marcar a correta
          propSomQuiz.questions[questionIndex].options[correctOptionIndex].isCorrect = true;
          
          // Adicionar explicação se não existir
          if (!propSomQuiz.questions[questionIndex].explanation || 
              propSomQuiz.questions[questionIndex].explanation.trim() === '') {
            propSomQuiz.questions[questionIndex].explanation = 
              "A semibreve é a figura musical de maior duração no sistema tradicional, valendo 4 tempos em um compasso quaternário.";
            console.log('   ✏️ Adicionada explicação');
          }
          
          console.log('✅ Questão sobre figura musical corrigida');
        }
      }
      
      // Salvar o quiz de propriedades do som
      await propSomQuiz.save();
      console.log('✅ Quiz de propriedades do som salvo com sucesso');
    }
    
    console.log('\n✅ Correções específicas concluídas');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir questões específicas:', error);
  }
};

// Função para verificar a correção das respostas
const verifyCorrectAnswers = async () => {
  try {
    console.log('\n🔍 Verificando se todas as questões têm uma opção correta marcada...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes`);
    
    let totalQuestionsWithoutCorrect = 0;
    
    // Verificar cada quiz
    for (const quiz of quizzes) {
      console.log(`\n📝 Quiz: ${quiz.title}`);
      
      // Verificar cada questão
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        
        // Contar opções corretas
        const correctCount = question.options.filter(opt => opt.isCorrect).length;
        
        // Log baseado no resultado
        if (correctCount === 0) {
          console.log(`❌ Questão ${i+1} sem resposta correta: "${question.question.substring(0, 40)}..."`);
          totalQuestionsWithoutCorrect++;
        } else if (correctCount > 1) {
          console.log(`⚠️ Questão ${i+1} com ${correctCount} respostas corretas: "${question.question.substring(0, 40)}..."`);
        } else {
          console.log(`✅ Questão ${i+1}: "${question.question.substring(0, 40)}..." - OK`);
        }
      }
    }
    
    console.log('\n📊 Resumo da verificação:');
    console.log(`   Total de questões sem resposta correta: ${totalQuestionsWithoutCorrect}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar respostas corretas:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    
    // Corrigir questões específicas
    await fixSpecificQuestions();
    
    // Verificar se todas as questões têm uma resposta correta
    await verifyCorrectAnswers();
    
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























