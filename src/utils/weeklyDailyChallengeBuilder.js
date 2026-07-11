const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { shuffleArray, shuffleQuestionOptions } = require('./shuffle');
const {
  validateDailyChallengeQuestion,
  validateDailyPack
} = require('./dailyChallengeQuestionValidator');

const FACTS_PATH = path.join(__dirname, '../data/dailyChallengeFacts.json');
const QUESTIONS_PER_DAY = 5;
const TIME_LIMIT_SECONDS = 7 * 60; // 7 minutos — custo de tempo mais leve

function loadFactsCatalog() {
  const raw = JSON.parse(fs.readFileSync(FACTS_PATH, 'utf8'));
  if (!raw || !Array.isArray(raw.facts) || raw.facts.length === 0) {
    throw new Error('Ficha de fatos do desafio diário está vazia');
  }
  return raw;
}

function startOfWeekMonday(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=domingo
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function weekDateKeys(anchorDate = new Date()) {
  const monday = startOfWeekMonday(anchorDate);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toDateKey(d);
  });
}

function pickTemplate(fact, salt = 0) {
  const templates = Array.isArray(fact.questionTemplates) ? fact.questionTemplates : [];
  if (templates.length === 0) {
    return `Sobre teoria musical: ${fact.fact}`;
  }
  return templates[Math.abs(salt) % templates.length];
}

function buildQuestionFromFact(fact, { questionText, salt = 0 } = {}) {
  const options = shuffleQuestionOptions({
    question: questionText || pickTemplate(fact, salt),
    options: [
      { id: 'A', label: fact.answer, isCorrect: true, explanation: fact.explanation },
      ...fact.distractors.slice(0, 3).map((label, index) => ({
        id: String.fromCharCode(66 + index),
        label,
        isCorrect: false
      }))
    ]
  });

  const candidate = {
    question: options.question,
    options: options.options,
    category: fact.category,
    difficulty: fact.difficulty || 'medio',
    factId: fact.id
  };

  return validateDailyChallengeQuestion(candidate, {
    allowedCategories: new Set([fact.category]),
    fact
  });
}

/**
 * Distribui fatos únicos na semana (7 dias × 5 perguntas),
 * priorizando variedade de categorias.
 */
function allocateFactsForWeek(facts, weekKey) {
  const needed = 7 * QUESTIONS_PER_DAY;
  if (facts.length < needed) {
    throw new Error(`São necessários pelo menos ${needed} fatos; há ${facts.length}`);
  }

  // Seed estável por semana para repetibilidade sem depender da IA
  const seed = weekKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rotated = [...facts];
  for (let i = 0; i < seed % rotated.length; i++) {
    rotated.push(rotated.shift());
  }

  const byCategory = new Map();
  rotated.forEach((fact) => {
    const list = byCategory.get(fact.category) || [];
    list.push(fact);
    byCategory.set(fact.category, list);
  });

  const selected = [];
  const used = new Set();
  const categories = shuffleArray([...byCategory.keys()]);

  while (selected.length < needed) {
    let progressed = false;
    for (const category of categories) {
      if (selected.length >= needed) break;
      const pool = byCategory.get(category) || [];
      const next = pool.find((f) => !used.has(f.id));
      if (next) {
        used.add(next.id);
        selected.push(next);
        progressed = true;
      }
    }
    if (!progressed) break;
  }

  if (selected.length < needed) {
    throw new Error('Não foi possível alocar fatos únicos suficientes para a semana');
  }

  return selected;
}

function buildLocalWeekPack(catalog = loadFactsCatalog(), anchorDate = new Date()) {
  const dates = weekDateKeys(anchorDate);
  const weekKey = dates[0];
  const selectedFacts = allocateFactsForWeek(catalog.facts, weekKey);
  const allowedCategories = new Set(catalog.categories || catalog.facts.map((f) => f.category));

  const days = dates.map((date, dayIndex) => {
    const dayFacts = selectedFacts.slice(
      dayIndex * QUESTIONS_PER_DAY,
      dayIndex * QUESTIONS_PER_DAY + QUESTIONS_PER_DAY
    );

    const questions = dayFacts.map((fact, qIndex) => {
      const built = buildQuestionFromFact(fact, { salt: dayIndex * 10 + qIndex });
      if (!built.ok) {
        throw new Error(`Fato ${fact.id} inválido: ${built.errors.join('; ')}`);
      }
      return built.question;
    });

    const pack = validateDailyPack(questions, { allowedCategories });
    if (!pack.ok) {
      throw new Error(`Pacote ${date} inválido: ${pack.errors.join('; ')}`);
    }

    return {
      date,
      timeLimit: TIME_LIMIT_SECONDS,
      questions: pack.questions,
      source: 'facts-local'
    };
  });

  return {
    weekStart: weekKey,
    weekEnd: dates[6],
    days
  };
}

async function paraphraseQuestionsWithGemini(dayPacks, { apiKey, model }) {
  if (!apiKey) {
    return dayPacks;
  }

  const payloadFacts = dayPacks.flatMap((day) =>
    day.questions.map((q) => ({
      date: day.date,
      factId: q.factId,
      factHint: q.options.find((o) => o.isCorrect)?.explanation || q.question,
      currentQuestion: q.question
    }))
  );

  const prompt = [
    'Você reformula enunciados de quiz de teoria musical do app NoteMusic.',
    'REGRAS OBRIGATÓRIAS:',
    '- NÃO invente teoria nova.',
    '- NÃO mude o sentido do fato.',
    '- NÃO mencione "fato", "IA" ou "template".',
    '- Mantenha pergunta objetiva em português do Brasil.',
    '- Cada item deve continuar testando exatamente o mesmo conhecimento.',
    '- Responda SOMENTE JSON válido no formato:',
    '{"items":[{"factId":"...","question":"..."}]}',
    '',
    'Itens:',
    JSON.stringify(payloadFacts)
  ].join('\n');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await axios.post(
    url,
    {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      timeout: 90000
    }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini não retornou conteúdo');
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Resposta do Gemini não é JSON');
    parsed = JSON.parse(match[0]);
  }

  const byFactId = new Map(
    (parsed.items || []).map((item) => [item.factId, String(item.question || '').trim()])
  );

  return dayPacks.map((day) => {
    const questions = day.questions.map((question) => {
      const rewritten = byFactId.get(question.factId);
      if (!rewritten) return question;

      const candidate = {
        ...question,
        question: rewritten
      };

      // Revalida com o fato original embutido via answer/explanation
      const factLike = {
        id: question.factId,
        category: question.category,
        answer: question.options.find((o) => o.isCorrect)?.label,
        explanation: question.options.find((o) => o.isCorrect)?.explanation,
        keywords: []
      };

      const validated = validateDailyChallengeQuestion(candidate, {
        allowedCategories: new Set([question.category]),
        fact: factLike
      });

      // Se a reformulação falhar validação, mantém o enunciado local
      return validated.ok ? validated.question : question;
    });

    return {
      ...day,
      questions,
      source: 'facts+gemini'
    };
  });
}

async function buildWeeklyDailyChallenges({
  anchorDate = new Date(),
  useGemini = false,
  apiKey = process.env.GEMINI_API_KEY,
  model = process.env.GEMINI_MODEL || 'gemini-flash-latest'
} = {}) {
  const catalog = loadFactsCatalog();
  let pack = buildLocalWeekPack(catalog, anchorDate);

  if (useGemini) {
    try {
      const days = await paraphraseQuestionsWithGemini(pack.days, { apiKey, model });
      pack = { ...pack, days };
    } catch (error) {
      console.warn(`⚠️ Gemini falhou (${error.message}). Mantendo enunciados locais.`);
    }
  }

  return pack;
}

module.exports = {
  QUESTIONS_PER_DAY,
  TIME_LIMIT_SECONDS,
  loadFactsCatalog,
  weekDateKeys,
  buildQuestionFromFact,
  buildLocalWeekPack,
  buildWeeklyDailyChallenges,
  paraphraseQuestionsWithGemini
};
