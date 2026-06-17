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

const testAppIntegration = async () => {
  try {
    console.log('🧪 TESTE DE INTEGRAÇÃO - APP E BACKEND');
    console.log('=' .repeat(80));

    // 1. Verificar módulos no banco
    console.log('\n📚 1. VERIFICANDO MÓDULOS NO BANCO:');
    console.log('-' .repeat(50));
    
    const modules = await Module.find({}).sort({ level: 1, order: 1 });
    console.log(`📊 Total de módulos: ${modules.length}`);
    
    modules.forEach((module, index) => {
      console.log(`\n${index + 1}. ${module.title}`);
      console.log(`   ID: ${module._id}`);
      console.log(`   Nível: ${module.level}`);
      console.log(`   Categoria: ${module.category}`);
      console.log(`   Ordem: ${module.order}`);
    });

    // 2. Verificar quizzes no banco
    console.log('\n🎯 2. VERIFICANDO QUIZZES NO BANCO:');
    console.log('-' .repeat(50));
    
    const quizzes = await Quiz.find({}).sort({ level: 1 });
    console.log(`📊 Total de quizzes: ${quizzes.length}`);
    
    quizzes.forEach((quiz, index) => {
      console.log(`\n${index + 1}. ${quiz.title}`);
      console.log(`   ID: ${quiz._id}`);
      console.log(`   Módulo ID: ${quiz.moduleId}`);
      console.log(`   Nível: ${quiz.level}`);
      console.log(`   Perguntas: ${quiz.questions ? quiz.questions.length : 0}`);
      console.log(`   Tempo limite: ${quiz.timeLimit}s`);
      console.log(`   Pontuação mínima: ${quiz.passingScore}%`);
    });

    // 3. Verificar correspondência módulo-quiz
    console.log('\n🔗 3. VERIFICANDO CORRESPONDÊNCIA MÓDULO-QUIZ:');
    console.log('-' .repeat(50));
    
    let matchedModules = 0;
    let unmatchedModules = 0;
    
    for (const module of modules) {
      const quiz = await Quiz.findOne({ moduleId: module._id });
      if (quiz) {
        console.log(`✅ ${module.title} → ${quiz.title}`);
        matchedModules++;
      } else {
        console.log(`❌ ${module.title} → NENHUM QUIZ ENCONTRADO`);
        unmatchedModules++;
      }
    }
    
    console.log(`\n📊 RESUMO DA CORRESPONDÊNCIA:`);
    console.log(`   ✅ Módulos com quiz: ${matchedModules}`);
    console.log(`   ❌ Módulos sem quiz: ${unmatchedModules}`);
    console.log(`   📈 Taxa de correspondência: ${modules.length > 0 ? Math.round((matchedModules / modules.length) * 100) : 0}%`);

    // 4. Testar endpoint de busca de quiz por módulo
    console.log('\n🌐 4. TESTANDO ENDPOINT DE BUSCA DE QUIZ:');
    console.log('-' .repeat(50));
    
    const testModule = modules[0];
    if (testModule) {
      console.log(`🔍 Testando busca de quiz para módulo: ${testModule.title}`);
      console.log(`   ID do módulo: ${testModule._id}`);
      
      const quiz = await Quiz.findOne({ moduleId: testModule._id });
      if (quiz) {
        console.log(`✅ Quiz encontrado: ${quiz.title}`);
        console.log(`   Perguntas: ${quiz.questions ? quiz.questions.length : 0}`);
        console.log(`   Estrutura das perguntas:`);
        
        if (quiz.questions && quiz.questions.length > 0) {
          quiz.questions.forEach((question, qIndex) => {
            console.log(`     ${qIndex + 1}. ${question.question}`);
            console.log(`        Opções: ${question.options ? question.options.length : 0}`);
            if (question.options && question.options.length > 0) {
              question.options.forEach((option, oIndex) => {
                console.log(`          ${oIndex + 1}. ${option.label} ${option.isCorrect ? '(CORRETA)' : ''}`);
              });
            }
          });
        }
      } else {
        console.log(`❌ Nenhum quiz encontrado para este módulo`);
      }
    }

    // 5. Verificar estrutura das perguntas
    console.log('\n📝 5. VERIFICANDO ESTRUTURA DAS PERGUNTAS:');
    console.log('-' .repeat(50));
    
    let totalQuestions = 0;
    let questionsWithExplanations = 0;
    let questionsWithCorrectAnswers = 0;
    
    for (const quiz of quizzes) {
      if (quiz.questions && quiz.questions.length > 0) {
        totalQuestions += quiz.questions.length;
        
        quiz.questions.forEach(question => {
          if (question.explanation && question.explanation.trim() !== '') {
            questionsWithExplanations++;
          }
          
          if (question.options && question.options.length > 0) {
            const hasCorrectAnswer = question.options.some(option => option.isCorrect === true);
            if (hasCorrectAnswer) {
              questionsWithCorrectAnswers++;
            }
          }
        });
      }
    }
    
    console.log(`📊 ESTRUTURA DAS PERGUNTAS:`);
    console.log(`   Total de perguntas: ${totalQuestions}`);
    console.log(`   Perguntas com explicação: ${questionsWithExplanations} (${totalQuestions > 0 ? Math.round((questionsWithExplanations / totalQuestions) * 100) : 0}%)`);
    console.log(`   Perguntas com resposta correta: ${questionsWithCorrectAnswers} (${totalQuestions > 0 ? Math.round((questionsWithCorrectAnswers / totalQuestions) * 100) : 0}%)`);

    // 6. Verificar se o app consegue acessar os dados
    console.log('\n📱 6. SIMULANDO ACESSO DO APP:');
    console.log('-' .repeat(50));
    
    // Simular busca de módulos (como o app faria)
    const appModules = await Module.find({}).sort({ level: 1, order: 1 });
    console.log(`📚 Módulos disponíveis para o app: ${appModules.length}`);
    
    // Simular busca de quiz para cada módulo (como o app faria)
    let accessibleQuizzes = 0;
    for (const module of appModules) {
      const quiz = await Quiz.findOne({ moduleId: module._id });
      if (quiz) {
        accessibleQuizzes++;
        console.log(`✅ ${module.title} → Quiz acessível`);
      } else {
        console.log(`❌ ${module.title} → Quiz não acessível`);
      }
    }
    
    console.log(`\n📊 RESUMO DE ACESSIBILIDADE:`);
    console.log(`   Módulos acessíveis: ${appModules.length}`);
    console.log(`   Quizzes acessíveis: ${accessibleQuizzes}`);
    console.log(`   Taxa de acessibilidade: ${appModules.length > 0 ? Math.round((accessibleQuizzes / appModules.length) * 100) : 0}%`);

    // 7. Verificar se há problemas de integração
    console.log('\n⚠️ 7. VERIFICANDO PROBLEMAS DE INTEGRAÇÃO:');
    console.log('-' .repeat(50));
    
    const issues = [];
    
    // Verificar se todos os módulos têm quiz
    for (const module of modules) {
      const quiz = await Quiz.findOne({ moduleId: module._id });
      if (!quiz) {
        issues.push(`Módulo "${module.title}" não tem quiz associado`);
      }
    }
    
    // Verificar se todos os quizzes têm módulo válido
    for (const quiz of quizzes) {
      const module = await Module.findById(quiz.moduleId);
      if (!module) {
        issues.push(`Quiz "${quiz.title}" referencia módulo inexistente`);
      }
    }
    
    // Verificar se há perguntas sem resposta correta
    for (const quiz of quizzes) {
      if (quiz.questions && quiz.questions.length > 0) {
        quiz.questions.forEach((question, qIndex) => {
          if (question.options && question.options.length > 0) {
            const hasCorrectAnswer = question.options.some(option => option.isCorrect === true);
            if (!hasCorrectAnswer) {
              issues.push(`Quiz "${quiz.title}" - Questão ${qIndex + 1} não tem resposta correta`);
            }
          }
        });
      }
    }
    
    if (issues.length === 0) {
      console.log('✅ Nenhum problema de integração encontrado!');
    } else {
      console.log(`❌ ${issues.length} problema(s) encontrado(s):`);
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    console.log('\n🎉 TESTE DE INTEGRAÇÃO CONCLUÍDO!');
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(testAppIntegration);
}

module.exports = { testAppIntegration };



