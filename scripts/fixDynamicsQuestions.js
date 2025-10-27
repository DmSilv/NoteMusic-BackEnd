const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../src/models/Quiz');

// Conhecimento musical correto sobre dinâmicas
const CORRECT_DYNAMICS = {
  // Símbolos de intensidade fraca
  weak: {
    symbols: ['p', 'piano', 'pp', 'pianíssimo', 'pianissimo', 'ppp'],
    description: 'Piano (p) significa tocar com pouca intensidade/suave/fraco'
  },
  // Símbolos de intensidade forte
  strong: {
    symbols: ['f', 'forte', 'ff', 'fortíssimo', 'fortissimo', 'fff'],
    description: 'Forte (f) significa tocar com muita intensidade/forte'
  },
  // INCORRETO: Alto não é símbolo de dinâmica musical
  incorrect: {
    symbols: ['alto', 'a'],
    description: 'Alto NÃO é um símbolo de dinâmica musical válido'
  }
};

// Função para normalizar texto
function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

// Função para verificar se uma pergunta é sobre dinâmica (intensidade)
function isDynamicsQuestion(question) {
  const normalizedQuestion = normalizeText(question.question);
  
  const keywords = [
    'intensidade',
    'piano',
    'forte',
    'dinâmica',
    'fraco',
    'pouca intensidade',
    'muita intensidade',
    'som fraco',
    'som forte',
    'tocada com pouca',
    'tocado com pouca'
  ];
  
  return keywords.some(keyword => normalizedQuestion.includes(normalizeText(keyword)));
}

// Função para corrigir uma pergunta de dinâmica
function fixDynamicsQuestion(question, questionIndex) {
  const normalizedQuestion = normalizeText(question.question);
  let wasFixed = false;
  let fixDetails = [];
  
  // Verificar se a pergunta menciona "pouca intensidade" ou termos similares
  const isWeakIntensityQuestion = 
    normalizedQuestion.includes('pouca intensidade') ||
    normalizedQuestion.includes('som fraco') ||
    normalizedQuestion.includes('suave') ||
    normalizedQuestion.includes('tocada com pouca') ||
    normalizedQuestion.includes('tocado com pouca');
  
  // Verificar se a pergunta menciona "muita intensidade" ou termos similares
  const isStrongIntensityQuestion = 
    normalizedQuestion.includes('muita intensidade') ||
    normalizedQuestion.includes('som forte') ||
    normalizedQuestion.includes('intenso');
  
  if (isWeakIntensityQuestion) {
    // Buscar opções
    let pianoOptionIndex = -1;
    let forteOptionIndex = -1;
    let altoOptionIndex = -1;
    
    question.options.forEach((opt, idx) => {
      const normalizedLabel = normalizeText(opt.label);
      
      if (normalizedLabel.includes('piano') || normalizedLabel.match(/\bp\b/)) {
        pianoOptionIndex = idx;
      }
      if (normalizedLabel.includes('forte') || normalizedLabel.match(/\bf\b/)) {
        forteOptionIndex = idx;
      }
      if (normalizedLabel.includes('alto') || normalizedLabel.match(/\ba\b/)) {
        altoOptionIndex = idx;
      }
    });
    
    // Verificar qual está marcada como correta
    const currentCorrectIndex = question.options.findIndex(opt => opt.isCorrect === true);
    
    // Se "Alto" estiver marcado como correto, CORRIGIR!
    if (altoOptionIndex !== -1 && currentCorrectIndex === altoOptionIndex) {
      fixDetails.push('🚨 ERRO CRÍTICO: "Alto" estava marcado como correto!');
      
      // Marcar todas como incorretas primeiro
      question.options.forEach(opt => opt.isCorrect = false);
      
      // Marcar Piano como correto
      if (pianoOptionIndex !== -1) {
        question.options[pianoOptionIndex].isCorrect = true;
        question.options[pianoOptionIndex].explanation = 
          'Piano (p) é o símbolo que indica que a nota deve ser tocada com pouca intensidade, de forma suave.';
        fixDetails.push(`✅ "Piano" (opção ${pianoOptionIndex}) marcado como correto`);
        wasFixed = true;
      } else {
        fixDetails.push('⚠️ Opção "Piano" não encontrada para marcar como correta');
      }
    }
    
    // Verificar se Piano está corretamente marcado
    if (pianoOptionIndex !== -1 && currentCorrectIndex !== pianoOptionIndex) {
      fixDetails.push(`⚠️ Resposta correta deveria ser "Piano" (opção ${pianoOptionIndex})`);
      question.options.forEach(opt => opt.isCorrect = false);
      question.options[pianoOptionIndex].isCorrect = true;
      question.options[pianoOptionIndex].explanation = 
        'Piano (p) é o símbolo que indica que a nota deve ser tocada com pouca intensidade, de forma suave.';
      wasFixed = true;
      fixDetails.push('✅ Corrigido para "Piano"');
    }
  }
  
  if (isStrongIntensityQuestion) {
    // Similar para perguntas sobre som forte
    let forteOptionIndex = -1;
    
    question.options.forEach((opt, idx) => {
      const normalizedLabel = normalizeText(opt.label);
      if (normalizedLabel.includes('forte') || normalizedLabel.match(/\bf\b/)) {
        forteOptionIndex = idx;
      }
    });
    
    const currentCorrectIndex = question.options.findIndex(opt => opt.isCorrect === true);
    
    if (forteOptionIndex !== -1 && currentCorrectIndex !== forteOptionIndex) {
      fixDetails.push(`⚠️ Resposta correta deveria ser "Forte" (opção ${forteOptionIndex})`);
      question.options.forEach(opt => opt.isCorrect = false);
      question.options[forteOptionIndex].isCorrect = true;
      question.options[forteOptionIndex].explanation = 
        'Forte (f) é o símbolo que indica que a nota deve ser tocada com muita intensidade.';
      wasFixed = true;
      fixDetails.push('✅ Corrigido para "Forte"');
    }
  }
  
  return { wasFixed, fixDetails };
}

// Função principal
async function fixDynamicsQuestions() {
  try {
    console.log('🎵 CORREÇÃO DE PERGUNTAS DE DINÂMICA MUSICAL');
    console.log('=' .repeat(80));
    console.log('');
    console.log('⚠️  PROBLEMA REPORTADO:');
    console.log('   Pergunta sobre "pouca intensidade"');
    console.log('   Usuário marcou: P (piano) ✅ CORRETO');
    console.log('   App validou como: A (alto) ❌ INCORRETO');
    console.log('');
    console.log('🎯 Este script vai corrigir esse e outros erros similares');
    console.log('');
    
    // Conectar ao MongoDB
    console.log('📡 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado!\n');
    
    // Estatísticas
    const stats = {
      totalQuizzes: 0,
      totalQuestions: 0,
      dynamicsQuestions: 0,
      questionsFixed: 0,
      quizzesSaved: 0
    };
    
    const problemsFound = [];
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({ isActive: true });
    console.log(`📚 Encontrados ${quizzes.length} quizzes ativos\n`);
    
    for (const quiz of quizzes) {
      stats.totalQuizzes++;
      let quizModified = false;
      const quizProblems = [];
      
      // Processar cada pergunta
      for (let i = 0; i < quiz.questions.length; i++) {
        stats.totalQuestions++;
        const question = quiz.questions[i];
        
        // Verificar se é pergunta de dinâmica
        if (isDynamicsQuestion(question)) {
          stats.dynamicsQuestions++;
          
          const { wasFixed, fixDetails } = fixDynamicsQuestion(question, i);
          
          if (wasFixed) {
            quizModified = true;
            stats.questionsFixed++;
            
            quizProblems.push({
              questionIndex: i + 1,
              questionText: question.question,
              fixes: fixDetails,
              options: question.options.map((opt, idx) => ({
                index: idx,
                label: opt.label,
                isCorrect: opt.isCorrect
              }))
            });
          }
        }
      }
      
      // Se o quiz foi modificado, salvar
      if (quizModified) {
        problemsFound.push({
          quizTitle: quiz.title,
          quizLevel: quiz.level,
          problems: quizProblems
        });
        
        try {
          await quiz.save();
          stats.quizzesSaved++;
          console.log(`✅ ${quiz.title} - ${quizProblems.length} pergunta(s) corrigida(s)`);
        } catch (saveError) {
          console.error(`❌ Erro ao salvar ${quiz.title}: ${saveError.message}`);
        }
      }
    }
    
    // Relatório detalhado
    if (problemsFound.length > 0) {
      console.log('\n');
      console.log('═'.repeat(80));
      console.log('📋 DETALHES DAS CORREÇÕES');
      console.log('═'.repeat(80));
      console.log('');
      
      problemsFound.forEach(quiz => {
        console.log(`\n📝 ${quiz.quizTitle} (${quiz.quizLevel})`);
        console.log('');
        
        quiz.problems.forEach(problem => {
          console.log(`   Pergunta ${problem.questionIndex}:`);
          console.log(`   "${problem.questionText}"`);
          console.log('');
          console.log('   Correções aplicadas:');
          problem.fixes.forEach(fix => {
            console.log(`      ${fix}`);
          });
          console.log('');
          console.log('   Opções após correção:');
          problem.options.forEach(opt => {
            const marker = opt.isCorrect ? '✅' : '  ';
            console.log(`      ${marker} [${opt.index}] ${opt.label}`);
          });
          console.log('   ' + '-'.repeat(76));
        });
      });
    }
    
    // Resumo final
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('📊 RESUMO FINAL');
    console.log('═'.repeat(80));
    console.log(`\nTotal de quizzes verificados: ${stats.totalQuizzes}`);
    console.log(`Total de perguntas verificadas: ${stats.totalQuestions}`);
    console.log(`Perguntas sobre dinâmica encontradas: ${stats.dynamicsQuestions}`);
    console.log(`Perguntas corrigidas: ${stats.questionsFixed}`);
    console.log(`Quizzes salvos com correções: ${stats.quizzesSaved}`);
    console.log('');
    
    if (stats.questionsFixed === 0) {
      console.log('✅ Nenhum erro encontrado em perguntas de dinâmica!');
    } else {
      console.log(`✅ SUCESSO! ${stats.questionsFixed} pergunta(s) de dinâmica corrigida(s)!`);
      console.log('');
      console.log('🎯 Próximos passos:');
      console.log('   1. Reiniciar o servidor backend');
      console.log('   2. Fechar o app mobile completamente');
      console.log('   3. Testar a pergunta novamente');
      console.log('   4. Resposta "P (piano)" deve ser validada como correta ✅');
    }
    
    // Fechar conexão
    await mongoose.connection.close();
    console.log('\n🔌 Conexão com MongoDB encerrada.');
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Executar
console.log('\n');
fixDynamicsQuestions();

















