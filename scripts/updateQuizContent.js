/**
 * Atualiza perguntas dos quizzes sem apagar usuários.
 *
 * Uso:
 *   node scripts/updateQuizContent.js              → aplica atualizações
 *   node scripts/updateQuizContent.js --list-modules → lista módulos do banco
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../src/models/module.model');
const Quiz = require('../src/models/quiz.model');
const { quizQuestionsData, dailyChallengeQuestions } = require('../src/utils/quizQuestionsData');

const { findModuleInDb } = require('../src/utils/quizModuleMatcher');
const { shuffleQuizQuestions } = require('../src/utils/shuffle');

async function findModule(quizData) {
  return findModuleInDb(Module, quizData);
}

async function listModules() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
  const modules = await Module.find({}).sort({ level: 1, order: 1 }).select('title level category').lean();
  const quizCount = await Quiz.countDocuments({ type: 'module' });

  console.log(`\n📚 Módulos no banco: ${modules.length}`);
  console.log(`📝 Quizzes de módulo: ${quizCount}\n`);

  let currentLevel = '';
  modules.forEach((m, i) => {
    if (m.level !== currentLevel) {
      currentLevel = m.level;
      console.log(`\n[${currentLevel.toUpperCase()}]`);
    }
    console.log(`  ${i + 1}. ${m.title}`);
  });

  console.log('\n💡 O script procura títulos em moduleTitle e moduleTitles (aliases).');
  process.exit(0);
}

const updateQuizContent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');

    const moduleCount = await Module.countDocuments();
    console.log(`📚 Módulos no banco: ${moduleCount}`);

    let updated = 0;
    let created = 0;
    const notFound = [];

    for (const quizData of quizQuestionsData) {
      const match = await findModule(quizData);

      if (!match) {
        const tried = [quizData.moduleTitle, ...(quizData.moduleTitles || [])].join('", "');
        notFound.push(`${quizData.moduleTitle} (${quizData.level})`);
        console.log(`⚠️ Módulo não encontrado — tentou: "${tried}"`);
        continue;
      }

      const { module, matchedTitle } = match;

      let quiz = await Quiz.findOne({ moduleId: module._id, type: 'module' });

      if (quiz) {
        quiz.questions = shuffleQuizQuestions(quizData.questions);
        quiz.level = module.level;
        quiz.updatedAt = new Date();
        await quiz.save();
        updated += 1;
        console.log(`🔄 Quiz atualizado: ${module.title} ← "${matchedTitle}" (${quiz.questions.length} questões)`);
      } else {
        quiz = await Quiz.create({
          title: `Quiz - ${module.title}`,
          description: `Teste seus conhecimentos sobre ${module.title}`,
          moduleId: module._id,
          questions: shuffleQuizQuestions(quizData.questions),
          level: module.level,
          type: 'module',
          timeLimit: 300,
          passingScore: 70,
          attempts: 3,
        });
        module.quizzes = module.quizzes || [];
        module.quizzes.push(quiz._id);
        await module.save();
        created += 1;
        console.log(`➕ Quiz criado: ${module.title}`);
      }
    }

    const dailyQuiz = await Quiz.findOne({ type: 'daily-challenge' });
    if (dailyQuiz) {
      dailyQuiz.questions = shuffleQuizQuestions(dailyChallengeQuestions);
      dailyQuiz.updatedAt = new Date();
      await dailyQuiz.save();
      console.log(`🔄 Desafio diário atualizado (${dailyChallengeQuestions.length} questões)`);
    } else {
      const firstModule = await Module.findOne().sort({ order: 1 });
      if (firstModule) {
        await Quiz.create({
          title: 'Desafio Diário de Música',
          description: 'Complete o desafio diário para ganhar pontos extras!',
          moduleId: firstModule._id,
          questions: shuffleQuizQuestions(dailyChallengeQuestions),
          level: 'aprendiz',
          type: 'daily-challenge',
          timeLimit: 600,
          passingScore: 70,
          attempts: 1,
        });
        console.log('➕ Desafio diário criado');
      }
    }

    console.log('\n📊 Resumo:');
    console.log(`   Quizzes atualizados: ${updated}`);
    console.log(`   Quizzes criados: ${created}`);
    console.log(`   Conjuntos pedagógicos no arquivo: ${quizQuestionsData.length}`);
    console.log(`   Não encontrados: ${notFound.length}`);

    if (updated === 0 && created === 0) {
      console.log('\n❌ Nenhum quiz de módulo foi atualizado.');
      console.log('   Seu banco usa títulos diferentes do seed padrão (12 módulos).');
      console.log('   Rode: node scripts/updateQuizContent.js --list-modules');
    } else if (notFound.length > 0) {
      console.log('\n⚠️ Alguns conjuntos não tiveram módulo correspondente (aliases pendentes).');
    } else {
      console.log('\n✅ Atualização concluída com sucesso!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

if (process.argv.includes('--list-modules')) {
  listModules().catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
} else {
  updateQuizContent();
}
