/**
 * Embaralha a posição das alternativas de TODOS os quizzes já gravados no banco,
 * independente da origem (quizQuestionsData.js, fallback automático do seed, ou
 * inseridos manualmente). Não apaga nem altera usuários/progresso — só reordena
 * as alternativas de cada questão, preservando texto, explicação e qual delas é
 * a correta.
 *
 * Uso:
 *   node scripts/maintenance/shuffleAllQuizOptions.js            → aplica e salva
 *   node scripts/maintenance/shuffleAllQuizOptions.js --dry-run  → só mostra o relatório antes/depois
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/quiz.model');
const { shuffleQuizQuestions } = require('../../src/utils/shuffle');

function tallyPositions(quizzes) {
  const counts = [0, 0, 0, 0];
  let total = 0;
  quizzes.forEach((quiz) => {
    quiz.questions.forEach((q) => {
      const idx = q.options.findIndex((o) => o.isCorrect);
      if (idx >= 0 && idx < 4) {
        counts[idx]++;
        total++;
      }
    });
  });
  return { counts, total };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
  console.log('✅ Conectado ao MongoDB');

  const quizzes = await Quiz.find({});
  console.log(`📚 Quizzes encontrados: ${quizzes.length}`);

  const before = tallyPositions(quizzes);
  console.log('\n📊 Distribuição ANTES (A/B/C/D):', before.counts, `(total: ${before.total})`);

  if (dryRun) {
    console.log('\n🔎 --dry-run: nenhuma alteração foi salva.');
    await mongoose.disconnect();
    return;
  }

  let updatedCount = 0;
  for (const quiz of quizzes) {
    quiz.questions = shuffleQuizQuestions(quiz.questions.map((q) => q.toObject()));
    quiz.updatedAt = new Date();
    await quiz.save();
    updatedCount++;
  }

  const after = tallyPositions(await Quiz.find({}));
  console.log(`\n✅ ${updatedCount} quizzes atualizados.`);
  console.log('📊 Distribuição DEPOIS (A/B/C/D):', after.counts, `(total: ${after.total})`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
