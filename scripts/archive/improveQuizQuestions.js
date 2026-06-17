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

// Melhorar as perguntas dos quizzes
const improveQuizQuestions = async () => {
  try {
    console.log('🔍 Analisando quizzes para melhorias...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    let totalQuestionsImproved = 0;
    let quizzesUpdated = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Analisando quiz: ${quiz.title}`);
      let quizModified = false;
      
      // Para cada questão
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        
        // Verificar se a questão precisa de melhorias
        let needsImprovement = false;
        let improvements = [];
        
        // 1. Verificar se a questão tem um texto claro
        if (!question.question || question.question.length < 10) {
          needsImprovement = true;
          improvements.push('Texto da pergunta muito curto ou ausente');
        }
        
        // 2. Verificar se a pergunta termina com ponto de interrogação
        if (question.question && !question.question.endsWith('?')) {
          needsImprovement = true;
          improvements.push('Falta ponto de interrogação');
          quiz.questions[i].question = question.question + '?';
        }
        
        // 3. Verificar se há opções suficientes (pelo menos 3)
        if (!question.options || question.options.length < 3) {
          needsImprovement = true;
          improvements.push('Menos de 3 opções');
        }
        
        // 4. Verificar se há pelo menos uma opção correta
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
          needsImprovement = true;
          improvements.push(`${correctOptions.length === 0 ? 'Nenhuma' : 'Múltiplas'} opções corretas`);
        }
        
        // 5. Verificar se há explicação
        if (!question.explanation || question.explanation.length < 20) {
          needsImprovement = true;
          improvements.push('Explicação ausente ou muito curta');
        }
        
        // 6. Verificar se as opções têm textos claros
        const shortOptions = question.options.filter(opt => !opt.label || opt.label.length < 3);
        if (shortOptions.length > 0) {
          needsImprovement = true;
          improvements.push(`${shortOptions.length} opções com texto muito curto`);
        }
        
        // 7. Verificar se há opções duplicadas
        const optionTexts = question.options.map(opt => opt.label);
        const uniqueOptions = new Set(optionTexts);
        if (uniqueOptions.size !== optionTexts.length) {
          needsImprovement = true;
          improvements.push('Opções duplicadas');
        }
        
        // Registrar melhorias necessárias
        if (needsImprovement) {
          console.log(`   ⚠️ Questão ${i+1} precisa de melhorias: ${improvements.join(', ')}`);
          quizModified = true;
          totalQuestionsImproved++;
        } else {
          console.log(`   ✅ Questão ${i+1} está bem estruturada`);
        }
      }
      
      // Salvar alterações se o quiz foi modificado
      if (quizModified) {
        await quiz.save();
        console.log(`✅ Quiz atualizado: ${quiz.title}`);
        quizzesUpdated++;
      } else {
        console.log(`✅ Quiz já está bem estruturado: ${quiz.title}`);
      }
    }
    
    console.log('\n📊 Resumo das melhorias:');
    console.log(`   Total de quizzes verificados: ${quizzes.length}`);
    console.log(`   Questões que precisavam de melhorias: ${totalQuestionsImproved}`);
    console.log(`   Quizzes atualizados: ${quizzesUpdated}`);
    
  } catch (error) {
    console.error('❌ Erro ao melhorar quizzes:', error);
  }
};

// Adicionar mais variedade às perguntas
const addVarietyToQuestions = async () => {
  try {
    console.log('\n🎨 Adicionando variedade às perguntas...');
    
    // Lista de prefixos para perguntas
    const questionPrefixes = [
      "Na teoria musical, ",
      "De acordo com os princípios da música, ",
      "Em termos de notação musical, ",
      "Considerando os conceitos básicos, ",
      "No contexto da harmonia musical, ",
      "Analisando a estrutura musical, "
    ];
    
    // Lista de emojis relacionados à música
    const musicEmojis = ["🎵", "🎶", "🎹", "🎼", "🎸", "🎺", "🥁", "🎻"];
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    let totalQuestionsModified = 0;
    let quizzesUpdated = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Adicionando variedade ao quiz: ${quiz.title}`);
      let quizModified = false;
      
      // Para cada questão
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        const originalQuestion = question.question;
        
        // Verificar se a questão já começa com emoji
        const startsWithEmoji = /^[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/u.test(originalQuestion);
        
        // Se não começa com emoji e não é muito longa, adicionar variedade
        if (!startsWithEmoji && originalQuestion.length < 70) {
          // Escolher aleatoriamente um emoji e um prefixo
          const randomEmoji = musicEmojis[Math.floor(Math.random() * musicEmojis.length)];
          const randomPrefix = questionPrefixes[Math.floor(Math.random() * questionPrefixes.length)];
          
          // Verificar se a pergunta já começa com algum dos prefixos
          const hasPrefix = questionPrefixes.some(prefix => originalQuestion.startsWith(prefix));
          
          // Criar nova pergunta com emoji e possivelmente um prefixo
          let newQuestion = `${randomEmoji} `;
          
          // Se não tem prefixo e a primeira letra é maiúscula, adicionar um prefixo
          if (!hasPrefix && /^[A-Z]/.test(originalQuestion)) {
            // Tornar a primeira letra minúscula para o prefixo
            const firstLowercase = originalQuestion.charAt(0).toLowerCase() + originalQuestion.slice(1);
            newQuestion += randomPrefix + firstLowercase;
          } else {
            newQuestion += originalQuestion;
          }
          
          // Atualizar a questão
          quiz.questions[i].question = newQuestion;
          console.log(`   ✅ Questão ${i+1} modificada com variedade`);
          quizModified = true;
          totalQuestionsModified++;
        } else {
          console.log(`   ℹ️ Questão ${i+1} já tem boa variedade`);
        }
      }
      
      // Salvar alterações se o quiz foi modificado
      if (quizModified) {
        await quiz.save();
        console.log(`✅ Quiz atualizado com variedade: ${quiz.title}`);
        quizzesUpdated++;
      }
    }
    
    console.log('\n📊 Resumo da adição de variedade:');
    console.log(`   Total de quizzes verificados: ${quizzes.length}`);
    console.log(`   Questões modificadas: ${totalQuestionsModified}`);
    console.log(`   Quizzes atualizados: ${quizzesUpdated}`);
    
  } catch (error) {
    console.error('❌ Erro ao adicionar variedade às perguntas:', error);
  }
};

// Verificar a distribuição das respostas corretas
const checkAnswerDistribution = async () => {
  try {
    console.log('\n📊 Verificando distribuição das respostas corretas...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    
    // Inicializar contadores
    const distribution = {0: 0, 1: 0, 2: 0, 3: 0};
    let totalQuestions = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Analisando quiz: ${quiz.title}`);
      
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
        
        console.log(`   Questão ${i+1}: Resposta correta na opção ${correctIndex + 1}`);
      }
    }
    
    console.log('\n📊 Distribuição das respostas corretas:');
    for (let i = 0; i < 4; i++) {
      const percentage = (distribution[i] / totalQuestions * 100).toFixed(1);
      console.log(`   Opção ${i + 1}: ${distribution[i]} questões (${percentage}%)`);
    }
    
    // Verificar se há desequilíbrio significativo
    const idealPercentage = 25; // 25% para cada opção em uma distribuição ideal
    const threshold = 10; // Considerar desequilíbrio se diferença > 10%
    
    let hasImbalance = false;
    for (let i = 0; i < 4; i++) {
      const percentage = (distribution[i] / totalQuestions * 100);
      if (Math.abs(percentage - idealPercentage) > threshold) {
        hasImbalance = true;
      }
    }
    
    if (hasImbalance) {
      console.log('\n⚠️ Há desequilíbrio na distribuição das respostas corretas. Considere redistribuir para evitar padrões previsíveis.');
    } else {
      console.log('\n✅ A distribuição das respostas corretas está equilibrada.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar distribuição das respostas:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    
    // Melhorar as perguntas dos quizzes
    await improveQuizQuestions();
    
    // Adicionar variedade às perguntas
    await addVarietyToQuestions();
    
    // Verificar a distribuição das respostas corretas
    await checkAnswerDistribution();
    
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























