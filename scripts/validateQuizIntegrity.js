const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../src/models/Quiz');

// Função para validar integridade de uma pergunta
function validateQuestionIntegrity(question, questionIndex) {
  const issues = [];
  
  // Verificar se há opções
  if (!question.options || question.options.length === 0) {
    issues.push('❌ Nenhuma opção disponível');
    return issues;
  }
  
  // Verificar tipos de isCorrect
  const typeIssues = question.options
    .map((opt, idx) => ({idx, type: typeof opt.isCorrect, value: opt.isCorrect}))
    .filter(x => x.type !== 'boolean');
  
  if (typeIssues.length > 0) {
    typeIssues.forEach(issue => {
      issues.push(`⚠️  Opção ${issue.idx}: isCorrect é ${issue.type} (${issue.value}) ao invés de boolean`);
    });
  }
  
  // Contar quantas opções estão marcadas como corretas
  const correctOptions = question.options
    .map((opt, idx) => ({idx, isCorrect: opt.isCorrect}))
    .filter(x => x.isCorrect === true);
  
  if (correctOptions.length === 0) {
    issues.push('🚨 CRÍTICO: Nenhuma opção marcada como correta');
  } else if (correctOptions.length > 1) {
    issues.push(`🚨 CRÍTICO: ${correctOptions.length} opções marcadas como corretas: [${correctOptions.map(x => x.idx).join(', ')}]`);
  }
  
  return issues;
}

// Função principal
async function validateQuizIntegrity() {
  try {
    console.log('🔍 VALIDAÇÃO DE INTEGRIDADE DOS QUIZZES');
    console.log('=' .repeat(80));
    console.log('');
    
    // Conectar ao MongoDB
    console.log('📡 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado!\n');
    
    // Estatísticas
    const stats = {
      totalQuizzes: 0,
      totalQuestions: 0,
      questionsWithIssues: 0,
      criticalIssues: 0,
      typeIssues: 0,
      noCorrectAnswer: 0,
      multipleCorrectAnswers: 0
    };
    
    const problemQuizzes = [];
    
    // Processar cada nível
    for (const level of ['aprendiz', 'virtuoso']) {
      console.log('═'.repeat(80));
      console.log(`📚 NÍVEL: ${level.toUpperCase()}`);
      console.log('═'.repeat(80));
      console.log('');
      
      // Buscar todos os quizzes deste nível
      const quizzes = await Quiz.find({ level, isActive: true });
      console.log(`Encontrados ${quizzes.length} quizzes ativos\n`);
      
      for (const quiz of quizzes) {
        stats.totalQuizzes++;
        
        const quizProblems = [];
        
        // Processar cada pergunta
        for (let i = 0; i < quiz.questions.length; i++) {
          stats.totalQuestions++;
          const question = quiz.questions[i];
          const issues = validateQuestionIntegrity(question, i);
          
          if (issues.length > 0) {
            stats.questionsWithIssues++;
            
            // Classificar problemas
            issues.forEach(issue => {
              if (issue.includes('CRÍTICO')) stats.criticalIssues++;
              if (issue.includes('type')) stats.typeIssues++;
              if (issue.includes('Nenhuma opção marcada')) stats.noCorrectAnswer++;
              if (issue.includes('opções marcadas como corretas')) stats.multipleCorrectAnswers++;
            });
            
            quizProblems.push({
              questionIndex: i + 1,
              questionText: question.question.substring(0, 60),
              issues: issues
            });
          }
        }
        
        // Se o quiz tem problemas, adicionar à lista
        if (quizProblems.length > 0) {
          problemQuizzes.push({
            quizId: quiz._id,
            title: quiz.title,
            level: quiz.level,
            totalQuestions: quiz.questions.length,
            problemQuestions: quizProblems
          });
          
          console.log(`⚠️  ${quiz.title}`);
          console.log(`   ID: ${quiz._id}`);
          console.log(`   Problemas em ${quizProblems.length}/${quiz.questions.length} perguntas`);
          console.log('');
        }
      }
    }
    
    // Relatório detalhado dos problemas
    if (problemQuizzes.length > 0) {
      console.log('\n');
      console.log('═'.repeat(80));
      console.log('📋 DETALHES DOS PROBLEMAS ENCONTRADOS');
      console.log('═'.repeat(80));
      console.log('');
      
      problemQuizzes.forEach(quiz => {
        console.log(`\n📝 ${quiz.title} (${quiz.level})`);
        console.log(`   ID: ${quiz.quizId}`);
        console.log(`   Perguntas com problemas: ${quiz.problemQuestions.length}/${quiz.totalQuestions}`);
        console.log('');
        
        quiz.problemQuestions.forEach(problem => {
          console.log(`   Pergunta ${problem.questionIndex}: "${problem.questionText}..."`);
          problem.issues.forEach(issue => {
            console.log(`      ${issue}`);
          });
          console.log('');
        });
        
        console.log('   ' + '-'.repeat(76));
      });
    }
    
    // Resumo final
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('📊 RESUMO DA VALIDAÇÃO');
    console.log('═'.repeat(80));
    console.log(`\nTotal de quizzes verificados: ${stats.totalQuizzes}`);
    console.log(`Total de perguntas verificadas: ${stats.totalQuestions}`);
    console.log(`Perguntas com problemas: ${stats.questionsWithIssues}`);
    console.log('');
    console.log('Tipos de problemas encontrados:');
    console.log(`  • Problemas críticos: ${stats.criticalIssues}`);
    console.log(`  • Problemas de tipo (isCorrect não boolean): ${stats.typeIssues}`);
    console.log(`  • Sem resposta correta: ${stats.noCorrectAnswer}`);
    console.log(`  • Múltiplas respostas corretas: ${stats.multipleCorrectAnswers}`);
    console.log('');
    
    if (stats.questionsWithIssues === 0) {
      console.log('✅ EXCELENTE! Nenhum problema encontrado!');
      console.log('   Todos os quizzes estão corretamente configurados.');
    } else {
      console.log(`⚠️  ATENÇÃO: ${stats.questionsWithIssues} perguntas precisam de correção!`);
      console.log('');
      console.log('🎯 Próximo passo:');
      console.log('   Execute o script de correção:');
      console.log('   node scripts/definitiveQuizFix.js');
    }
    
    // Fechar conexão
    await mongoose.connection.close();
    console.log('\n🔌 Conexão com MongoDB encerrada.');
    console.log('');
    
    process.exit(stats.questionsWithIssues > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Executar
console.log('\n');
validateQuizIntegrity();





















