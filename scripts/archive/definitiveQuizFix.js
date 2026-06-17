const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/Quiz');

// Importar JSONs originais
const aprendizQuestions = require('../../perguntas_nivel_aprendiz.json');
const virtuosoQuestions = require('../../perguntas_nivel_virtuoso.json');

// Criar mapa de perguntas originais para busca rápida
const originalQuestionsMap = new Map();

// Normalizar texto para comparação (remover espaços extras, pontuação, etc)
function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .replace(/\s+/g, ' ');   // Remove espaços múltiplos
}

// Preparar mapa de perguntas originais
function prepareOriginalQuestionsMap() {
  console.log('📋 Preparando mapa de perguntas originais...\n');
  
  // Adicionar perguntas aprendiz
  aprendizQuestions.questions.forEach(q => {
    const normalizedQuestion = normalizeText(q.question);
    originalQuestionsMap.set(normalizedQuestion, {
      level: 'aprendiz',
      correctAnswerIndex: q.correctAnswer,
      question: q.question,
      options: q.options,
      explanation: q.explanation
    });
  });
  
  // Adicionar perguntas virtuoso
  virtuosoQuestions.questions.forEach(q => {
    const normalizedQuestion = normalizeText(q.question);
    originalQuestionsMap.set(normalizedQuestion, {
      level: 'virtuoso',
      correctAnswerIndex: q.correctAnswer,
      question: q.question,
      options: q.options,
      explanation: q.explanation
    });
  });
  
  console.log(`✅ Mapa preparado com ${originalQuestionsMap.size} perguntas originais\n`);
}

// Função para corrigir uma pergunta
function fixQuestion(question, questionIndex, quizLevel) {
  const normalizedQuestion = normalizeText(question.question);
  const originalQuestion = originalQuestionsMap.get(normalizedQuestion);
  
  let wasFixed = false;
  let fixDetails = [];
  
  // Verificar se todas as opções têm isCorrect definido como Boolean
  question.options.forEach((opt, idx) => {
    if (typeof opt.isCorrect !== 'boolean') {
      opt.isCorrect = false;
      wasFixed = true;
      fixDetails.push(`Opção ${idx} convertida para boolean`);
    }
  });
  
  // Contar quantas opções estão marcadas como corretas
  const correctCount = question.options.filter(opt => opt.isCorrect === true).length;
  
  if (correctCount === 0) {
    fixDetails.push('NENHUMA resposta correta');
    
    // Tentar usar pergunta original
    if (originalQuestion && originalQuestion.level === quizLevel) {
      const correctIdx = originalQuestion.correctAnswerIndex;
      if (correctIdx >= 0 && correctIdx < question.options.length) {
        question.options.forEach((opt, idx) => {
          opt.isCorrect = (idx === correctIdx);
        });
        // Adicionar explicação na opção correta
        question.options[correctIdx].explanation = originalQuestion.explanation;
        wasFixed = true;
        fixDetails.push(`Corrigido usando JSON original (opção ${correctIdx})`);
      }
    } else {
      // Fallback: usar a opção que tem explicação
      let fixedByExplanation = false;
      for (let i = 0; i < question.options.length; i++) {
        if (question.options[i].explanation && question.options[i].explanation.trim().length > 20) {
          question.options[i].isCorrect = true;
          wasFixed = true;
          fixedByExplanation = true;
          fixDetails.push(`Corrigido por explicação (opção ${i})`);
          break;
        }
      }
      
      if (!fixedByExplanation) {
        fixDetails.push('⚠️ NÃO FOI POSSÍVEL CORRIGIR AUTOMATICAMENTE');
      }
    }
  } else if (correctCount > 1) {
    fixDetails.push(`${correctCount} respostas marcadas como corretas`);
    
    // Tentar usar pergunta original
    if (originalQuestion && originalQuestion.level === quizLevel) {
      const correctIdx = originalQuestion.correctAnswerIndex;
      question.options.forEach((opt, idx) => {
        opt.isCorrect = (idx === correctIdx);
      });
      // Adicionar explicação na opção correta
      question.options[correctIdx].explanation = originalQuestion.explanation;
      wasFixed = true;
      fixDetails.push(`Corrigido usando JSON original (opção ${correctIdx})`);
    } else {
      // Fallback: manter apenas a primeira
      let firstCorrect = question.options.findIndex(opt => opt.isCorrect);
      question.options.forEach((opt, idx) => {
        opt.isCorrect = (idx === firstCorrect);
      });
      wasFixed = true;
      fixDetails.push(`Mantida apenas primeira opção correta (${firstCorrect})`);
    }
  }
  
  return { wasFixed, fixDetails };
}

// Função principal
async function definitiveQuizFix() {
  try {
    console.log('🔧 CORREÇÃO DEFINITIVA DOS QUIZZES');
    console.log('=' .repeat(80));
    console.log('');
    
    // Conectar ao MongoDB
    console.log('📡 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado!\n');
    
    // Preparar mapa de perguntas originais
    prepareOriginalQuestionsMap();
    
    // Estatísticas
    const stats = {
      totalQuizzes: 0,
      totalQuestions: 0,
      questionsFixed: 0,
      quizzesSaved: 0,
      errors: 0
    };
    
    // Processar cada nível
    for (const level of ['aprendiz', 'virtuoso']) {
      console.log('═'.repeat(80));
      console.log(`📚 PROCESSANDO NÍVEL: ${level.toUpperCase()}`);
      console.log('═'.repeat(80));
      console.log('');
      
      // Buscar todos os quizzes deste nível
      const quizzes = await Quiz.find({ level, isActive: true });
      console.log(`Encontrados ${quizzes.length} quizzes ativos\n`);
      
      for (const quiz of quizzes) {
        stats.totalQuizzes++;
        console.log(`\n📝 Quiz: ${quiz.title}`);
        console.log(`   ID: ${quiz._id}`);
        console.log(`   Perguntas: ${quiz.questions.length}`);
        
        let quizModified = false;
        const quizProblems = [];
        
        // Processar cada pergunta
        for (let i = 0; i < quiz.questions.length; i++) {
          stats.totalQuestions++;
          const question = quiz.questions[i];
          
          const { wasFixed, fixDetails } = fixQuestion(question, i, level);
          
          if (wasFixed) {
            quizModified = true;
            stats.questionsFixed++;
            quizProblems.push({
              questionIndex: i + 1,
              questionText: question.question.substring(0, 60),
              fixes: fixDetails
            });
          }
        }
        
        // Mostrar problemas encontrados e corrigidos
        if (quizProblems.length > 0) {
          console.log(`\n   ⚠️  Problemas encontrados e corrigidos: ${quizProblems.length}`);
          quizProblems.forEach(problem => {
            console.log(`\n   Pergunta ${problem.questionIndex}: "${problem.questionText}..."`);
            problem.fixes.forEach(fix => {
              console.log(`      🔧 ${fix}`);
            });
          });
          
          // Salvar quiz modificado
          try {
            await quiz.save();
            stats.quizzesSaved++;
            console.log(`\n   ✅ Quiz salvo com ${quizProblems.length} correções`);
          } catch (saveError) {
            stats.errors++;
            console.error(`\n   ❌ Erro ao salvar quiz: ${saveError.message}`);
          }
        } else {
          console.log(`   ✅ Nenhum problema encontrado`);
        }
        
        console.log('   ' + '-'.repeat(76));
      }
    }
    
    // Resumo final
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('📊 RESUMO FINAL DA CORREÇÃO');
    console.log('═'.repeat(80));
    console.log(`\nTotal de quizzes processados: ${stats.totalQuizzes}`);
    console.log(`Total de perguntas verificadas: ${stats.totalQuestions}`);
    console.log(`Perguntas corrigidas: ${stats.questionsFixed}`);
    console.log(`Quizzes salvos com correções: ${stats.quizzesSaved}`);
    console.log(`Erros durante o processo: ${stats.errors}`);
    
    if (stats.questionsFixed === 0) {
      console.log('\n✅ PERFEITO! Todos os quizzes estavam corretos!');
    } else {
      console.log(`\n✅ SUCESSO! ${stats.questionsFixed} perguntas foram corrigidas!`);
      console.log('\n🎯 Próximos passos:');
      console.log('   1. Reiniciar o servidor backend');
      console.log('   2. Fechar completamente o app mobile');
      console.log('   3. Testar os quizzes novamente');
    }
    
    if (stats.errors > 0) {
      console.log(`\n⚠️  ATENÇÃO: ${stats.errors} erros ocorreram. Verifique os logs acima.`);
    }
    
    // Fechar conexão
    await mongoose.connection.close();
    console.log('\n🔌 Conexão com MongoDB encerrada.');
    console.log('');
    
    process.exit(stats.errors > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Executar
console.log('\n');
definitiveQuizFix();





















