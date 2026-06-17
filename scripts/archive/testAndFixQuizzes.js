const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/quiz.model');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}\n${'='.repeat(70)}\n${msg}\n${'='.repeat(70)}${colors.reset}`)
};

async function testAndFixQuizzes() {
  try {
    log.title('🔍 TESTE E CORREÇÃO DE QUIZZES');
    
    // Conectar
    log.info('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    log.success('Conectado ao MongoDB\n');

    // Estatísticas
    const stats = {
      total: 0,
      withProblems: 0,
      withoutCorrect: 0,
      withMultipleCorrect: 0,
      fixed: 0
    };

    // Buscar quizzes por nível
    for (const level of ['aprendiz', 'virtuoso']) {
      log.title(`📚 NÍVEL: ${level.toUpperCase()}`);
      
      const quizzes = await Quiz.find({ level, isActive: true });
      log.info(`Encontrados ${quizzes.length} quizzes ativos`);

      for (const quiz of quizzes) {
        stats.total++;
        console.log(`\n📝 ${quiz.title}`);
        
        let quizModified = false;
        let quizProblems = [];

        // Analisar cada pergunta
        for (let i = 0; i < quiz.questions.length; i++) {
          const question = quiz.questions[i];
          const correctOptions = question.options.filter(opt => opt.isCorrect === true);

          // Problema: nenhuma resposta correta
          if (correctOptions.length === 0) {
            stats.withoutCorrect++;
            quizProblems.push(`Pergunta ${i + 1}: sem resposta correta`);
            
            // Tentar corrigir
            // Estratégia 1: A opção com explicação preenchida
            let fixed = false;
            for (let j = 0; j < question.options.length; j++) {
              if (question.options[j].explanation && question.options[j].explanation.trim().length > 10) {
                question.options[j].isCorrect = true;
                log.success(`   Corrigido: marcando opção ${j} (${question.options[j].id}) como correta`);
                stats.fixed++;
                quizModified = true;
                fixed = true;
                break;
              }
            }
            
            if (!fixed) {
              log.error(`   Não foi possível corrigir automaticamente a pergunta ${i + 1}`);
            }
          }
          // Problema: múltiplas respostas corretas
          else if (correctOptions.length > 1) {
            stats.withMultipleCorrect++;
            quizProblems.push(`Pergunta ${i + 1}: ${correctOptions.length} respostas corretas`);
            
            // Corrigir: manter apenas a primeira
            let kept = false;
            for (let j = 0; j < question.options.length; j++) {
              if (question.options[j].isCorrect && !kept) {
                kept = true; // Manter esta
              } else {
                question.options[j].isCorrect = false; // Remover outras
              }
            }
            log.warning(`   Corrigido: mantendo apenas primeira resposta correta`);
            stats.fixed++;
            quizModified = true;
          }
        }

        // Resumo do quiz
        if (quizProblems.length > 0) {
          stats.withProblems++;
          log.warning(`Problemas encontrados: ${quizProblems.length}`);
          quizProblems.forEach(p => console.log(`   - ${p}`));
          
          if (quizModified) {
            await quiz.save();
            log.success('Quiz salvo com correções');
          }
        } else {
          log.success('Nenhum problema encontrado');
        }
      }
    }

    // Resumo Final
    log.title('📊 RESUMO FINAL');
    console.log(`Total de quizzes analisados: ${stats.total}`);
    console.log(`Quizzes com problemas: ${stats.withProblems}`);
    console.log(`Perguntas sem resposta correta: ${stats.withoutCorrect}`);
    console.log(`Perguntas com múltiplas corretas: ${stats.withMultipleCorrect}`);
    console.log(`Total de correções aplicadas: ${stats.fixed}`);
    
    if (stats.withProblems === 0) {
      log.success('\nTodos os quizzes estão perfeitos! 🎉');
    } else if (stats.fixed > 0) {
      log.success(`\n${stats.fixed} problemas foram corrigidos! ✨`);
    } else {
      log.error('\nAlguns problemas não puderam ser corrigidos automaticamente');
    }

    await mongoose.connection.close();
    log.info('\nConexão encerrada');
    process.exit(0);

  } catch (error) {
    log.error(`Erro fatal: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Executar
testAndFixQuizzes();





















