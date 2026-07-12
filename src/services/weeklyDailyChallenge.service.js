const Quiz = require('../models/quiz.model');
const Module = require('../models/module.model');
const {
  buildWeeklyDailyChallenges,
  weekDateKeys
} = require('../utils/weeklyDailyChallengeBuilder');

async function resolveModuleId() {
  const anyModule = await Module.findOne({ isActive: { $ne: false } }).select('_id');
  if (anyModule) return anyModule._id;

  const anyQuiz = await Quiz.findOne({ type: 'module', isActive: true }).select('moduleId');
  if (anyQuiz?.moduleId) return anyQuiz.moduleId;

  throw new Error('Nenhum módulo encontrado para vincular o desafio diário');
}

async function upsertDayChallenge({ date, questions, timeLimit, moduleId, source }) {
  const payload = {
    title: 'Desafio Diário de Teoria Musical',
    description: 'Prática diária com perguntas do currículo NoteMusic.',
    moduleId,
    questions,
    timeLimit,
    level: 'aprendiz',
    type: 'daily-challenge',
    isActive: true,
    dailyChallengeDate: date,
    updatedAt: new Date()
  };

  const existing = await Quiz.findOne({ type: 'daily-challenge', dailyChallengeDate: date });
  if (existing) {
    existing.set(payload);
    await existing.save();
    return { date, id: existing._id, action: 'updated', source };
  }

  try {
    const created = await Quiz.create(payload);
    return { date, id: created._id, action: 'created', source };
  } catch (error) {
    if (error && error.code === 11000) {
      const raced = await Quiz.findOne({ type: 'daily-challenge', dailyChallengeDate: date });
      if (raced) {
        return { date, id: raced._id, action: 'created', source };
      }
    }
    throw error;
  }
}

function shouldUseGemini() {
  if (!process.env.GEMINI_API_KEY) return false;
  if (process.env.DAILY_WEEK_USE_GEMINI === '0') return false;
  // default: usa Gemini quando a chave existe
  return true;
}

/**
 * Gera e grava os 7 dias da semana de `anchorDate`.
 * @param {{ anchorDate?: Date, useGemini?: boolean, onlyMissing?: boolean }} options
 */
async function generateAndPersistWeeklyChallenges(options = {}) {
  const anchorDate = options.anchorDate || new Date();
  const useGemini = options.useGemini ?? shouldUseGemini();
  const onlyMissing = options.onlyMissing === true;

  const dates = weekDateKeys(anchorDate);
  let targetDays = dates;

  if (onlyMissing) {
    const existing = await Quiz.find({
      type: 'daily-challenge',
      dailyChallengeDate: { $in: dates }
    }).select('dailyChallengeDate');

    const present = new Set(existing.map((doc) => doc.dailyChallengeDate));
    targetDays = dates.filter((date) => !present.has(date));

    if (targetDays.length === 0) {
      return {
        skipped: true,
        reason: 'week-already-complete',
        weekStart: dates[0],
        weekEnd: dates[6],
        results: []
      };
    }
  }

  const pack = await buildWeeklyDailyChallenges({
    anchorDate,
    useGemini,
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-flash-latest'
  });

  const daysToPersist = onlyMissing
    ? pack.days.filter((day) => targetDays.includes(day.date))
    : pack.days;

  const moduleId = await resolveModuleId();
  const results = [];

  for (const day of daysToPersist) {
    const result = await upsertDayChallenge({
      date: day.date,
      questions: day.questions,
      timeLimit: day.timeLimit,
      moduleId,
      source: day.source
    });
    results.push(result);
  }

  const legacy = await Quiz.deleteMany({
    type: 'daily-challenge',
    $or: [{ dailyChallengeDate: null }, { dailyChallengeDate: { $exists: false } }]
  });

  return {
    skipped: false,
    weekStart: pack.weekStart,
    weekEnd: pack.weekEnd,
    useGemini,
    results,
    legacyRemoved: legacy.deletedCount || 0
  };
}

module.exports = {
  generateAndPersistWeeklyChallenges,
  shouldUseGemini,
  resolveModuleId,
  upsertDayChallenge
};
