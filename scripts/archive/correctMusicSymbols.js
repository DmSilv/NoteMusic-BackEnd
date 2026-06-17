const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../../src/models/Module');
const Quiz = require('../../src/models/Quiz');

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
 * Função para verificar e corrigir conteúdos de perguntas no banco de dados
 * Especificamente corrige a questão do crescendo/diminuendo
 */
const checkAndCorrectQuestions = async () => {
  try {
    console.log('🔍 Verificando todas as perguntas sobre crescendo/diminuendo no banco de dados...');
    
    // Buscar quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Total de quizzes encontrados: ${quizzes.length}`);
    
    let totalQuestionsChecked = 0;
    let questionsFixed = 0;
    
    // Para cada quiz, verificar questões sobre crescendo/diminuendo
    for (const quiz of quizzes) {
      let quizModified = false;
      
      // Verificar cada questão
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        totalQuestionsChecked++;
        
        // Verificar se é uma questão sobre crescendo/diminuendo
        const isCrescendoQuestion = 
          question.question.includes('crescendo') || 
          question.question.includes('Crescendo') ||
          question.question.toLowerCase().includes('forte') ||
          question.question.toLowerCase().includes('piano') || 
          question.question.toLowerCase().includes('intensidade');
        
        if (isCrescendoQuestion) {
          console.log(`\n⚠️ Questão potencial encontrada (Quiz: ${quiz.title}):`);
          console.log(`   Pergunta: ${question.question}`);
          
          // Verificar opções
          let foundCorrection = false;
          for (let j = 0; j < question.options.length; j++) {
            const option = question.options[j];
            
            // Verificar se a opção menciona crescendo ou diminuendo
            if (option.label.includes('Crescendo') || option.label.includes('crescendo') || 
                option.label.includes('Diminuendo') || option.label.includes('diminuendo')) {
              
              console.log(`   Opção: ${option.label} (${option.isCorrect ? 'Correta' : 'Incorreta'})`);
              
              // Verificar se o crescendo e diminuendo estão corretos
              if (option.label.includes('Crescendo (<)') && !option.isCorrect) {
                console.log('   ⚠️ Erro encontrado! Crescendo (<) está marcado como incorreto quando deveria ser correto');
                quiz.questions[i].options[j].isCorrect = true;
                foundCorrection = true;
              }
              else if (option.label.includes('Crescendo (>)')) {
                console.log('   ⚠️ Erro encontrado! Crescendo está com o símbolo errado (> em vez de <)');
                quiz.questions[i].options[j].label = option.label.replace('Crescendo (>)', 'Crescendo (<)');
                foundCorrection = true;
              }
              else if (option.label.includes('Diminuendo (<)')) {
                console.log('   ⚠️ Erro encontrado! Diminuendo está com o símbolo errado (< em vez de >)');
                quiz.questions[i].options[j].label = option.label.replace('Diminuendo (<)', 'Diminuendo (>)');
                foundCorrection = true;
              }
            }
          }
          
          if (foundCorrection) {
            questionsFixed++;
            quizModified = true;
          }
        }
      }
      
      // Salvar quiz se foi modificado
      if (quizModified) {
        await quiz.save();
        console.log(`✅ Quiz "${quiz.title}" atualizado com correções`);
      }
    }
    
    console.log('\n📊 Resumo da verificação:');
    console.log(`   Total de quizzes verificados: ${quizzes.length}`);
    console.log(`   Total de questões verificadas: ${totalQuestionsChecked}`);
    console.log(`   Questões corrigidas: ${questionsFixed}`);
    
    if (questionsFixed === 0) {
      console.log('✅ Não foram encontrados erros na simbologia musical das questões!');
    } else {
      console.log(`✅ ${questionsFixed} questões foram corrigidas com sucesso!`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar e corrigir questões:', error);
  }
};

/**
 * Verificar a consistência das perguntas e respostas
 */
const checkResponseConsistency = async () => {
  try {
    console.log('\n🔍 Verificando consistência entre perguntas e respostas...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    
    let totalQuestions = 0;
    let totalNoCorrectAnswer = 0;
    let totalMultipleCorrectAnswers = 0;
    let fixedQuestions = 0;
    
    for (const quiz of quizzes) {
      let quizModified = false;
      
      // Para cada pergunta no quiz
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        totalQuestions++;
        
        // Verificar quantas respostas corretas existem
        const correctOptions = question.options.filter(opt => opt.isCorrect === true);
        const correctCount = correctOptions.length;
        
        if (correctCount === 0) {
          console.log(`\n⚠️ ERRO: Questão sem resposta correta (Quiz: ${quiz.title}):`);
          console.log(`   Pergunta: ${question.question}`);
          totalNoCorrectAnswer++;
          
          // Tentar determinar a resposta correta com base em dicas
          const questionText = question.question.toLowerCase();
          const explanation = question.explanation?.toLowerCase() || '';
          
          // Para cada opção, avaliar se poderia ser a resposta correta
          let bestOptionIndex = -1;
          let bestOptionScore = -1;
          
          for (let j = 0; j < question.options.length; j++) {
            const option = question.options[j];
            let score = 0;
            const optionText = option.label.toLowerCase();
            
            // Verificar se a opção tem palavras-chave que correspondem à pergunta ou explicação
            if ((questionText.includes('altura') || explanation.includes('altura')) && optionText.includes('altura')) score += 2;
            if ((questionText.includes('intensidade') || explanation.includes('intensidade')) && optionText.includes('intensidade')) score += 2;
            if ((questionText.includes('timbre') || explanation.includes('timbre')) && optionText.includes('timbre')) score += 2;
            if ((questionText.includes('duração') || explanation.includes('duração')) && optionText.includes('duração')) score += 2;
            
            // Se a pergunta é sobre sons graves/agudos, a resposta provavelmente é altura
            if ((questionText.includes('grave') || questionText.includes('agudo')) && optionText.includes('altura')) score += 3;
            
            // Se a pergunta é sobre forte/suave, a resposta provavelmente é intensidade
            if ((questionText.includes('forte') || questionText.includes('suave') || questionText.includes('piano')) && 
                (optionText.includes('intensidade') || optionText.includes('forte') || optionText.includes('piano'))) score += 3;
            
            // Se a pergunta é sobre diferenças entre instrumentos, a resposta provavelmente é timbre
            if ((questionText.includes('instrumento') || questionText.includes('violino') || questionText.includes('piano')) && 
                optionText.includes('timbre')) score += 3;
            
            // Se a pergunta é sobre tempo/duração, a resposta provavelmente é duração
            if ((questionText.includes('tempo') || questionText.includes('dura')) && optionText.includes('duração')) score += 3;
            
            if (score > bestOptionScore) {
              bestOptionScore = score;
              bestOptionIndex = j;
            }
          }
          
          // Se encontramos uma opção com alta pontuação, marcar como correta
          if (bestOptionIndex >= 0 && bestOptionScore >= 2) {
            console.log(`   ✅ Provável resposta correta: "${question.options[bestOptionIndex].label}" (pontuação: ${bestOptionScore})`);
            quiz.questions[i].options[bestOptionIndex].isCorrect = true;
            fixedQuestions++;
            quizModified = true;
          } else {
            console.log(`   ❌ Não foi possível determinar a resposta correta automaticamente`);
          }
        }
        else if (correctCount > 1) {
          console.log(`\n⚠️ AVISO: Questão com ${correctCount} respostas corretas (Quiz: ${quiz.title}):`);
          console.log(`   Pergunta: ${question.question}`);
          totalMultipleCorrectAnswers++;
          
          // Se não é uma questão de múltipla escolha, deixar apenas a primeira resposta correta
          const explanation = question.explanation?.toLowerCase() || '';
          if (!explanation.includes('múltipla') && !explanation.includes('multipla') && 
              !questionText.includes('múltipla') && !questionText.includes('multipla')) {
            
            let foundCorrect = false;
            for (let j = 0; j < question.options.length; j++) {
              if (quiz.questions[i].options[j].isCorrect) {
                if (foundCorrect) {
                  console.log(`   ✅ Desabilitando resposta extra: "${question.options[j].label}"`);
                  quiz.questions[i].options[j].isCorrect = false;
                  quizModified = true;
                  fixedQuestions++;
                } else {
                  console.log(`   ✅ Mantendo resposta correta: "${question.options[j].label}"`);
                  foundCorrect = true;
                }
              }
            }
          }
        }
      }
      
      // Salvar quiz se modificado
      if (quizModified) {
        await quiz.save();
        console.log(`✅ Quiz "${quiz.title}" atualizado com correções de consistência`);
      }
    }
    
    console.log('\n📊 Resumo da verificação de consistência:');
    console.log(`   Total de questões verificadas: ${totalQuestions}`);
    console.log(`   Questões sem resposta correta: ${totalNoCorrectAnswer}`);
    console.log(`   Questões com múltiplas respostas corretas: ${totalMultipleCorrectAnswers}`);
    console.log(`   Questões corrigidas: ${fixedQuestions}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar consistência de respostas:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    
    // Verificar e corrigir questões com símbolos incorretos
    await checkAndCorrectQuestions();
    
    // Verificar consistência de perguntas/respostas
    await checkResponseConsistency();
    
    console.log('\n✨ Verificação e correção concluídas!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























