const ALLOWED_DIFFICULTIES = new Set(['facil', 'medio', 'dificil']);
const OPTION_IDS = ['A', 'B', 'C', 'D'];

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Valida uma pergunta do desafio diário gerada a partir da ficha de fatos.
 * Retorna { ok: true, question } ou { ok: false, errors: string[] }.
 */
function validateDailyChallengeQuestion(raw, { allowedCategories, fact } = {}) {
  const errors = [];

  if (!raw || typeof raw !== 'object') {
    return { ok: false, errors: ['pergunta inválida'] };
  }

  const questionText = String(raw.question || '').trim();
  if (questionText.length < 15 || questionText.length > 180) {
    errors.push('enunciado fora do tamanho permitido (15-180)');
  }

  if (!Array.isArray(raw.options) || raw.options.length !== 4) {
    errors.push('deve ter exatamente 4 opções');
  }

  const category = String(raw.category || '').trim();
  if (allowedCategories && !allowedCategories.has(category)) {
    errors.push(`categoria não permitida: ${category}`);
  }

  const difficulty = String(raw.difficulty || '').trim();
  if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
    errors.push(`dificuldade inválida: ${difficulty}`);
  }

  const options = Array.isArray(raw.options) ? raw.options : [];
  const labels = options.map((o) => normalizeText(o && o.label));
  if (new Set(labels.filter(Boolean)).size !== labels.filter(Boolean).length) {
    errors.push('opções duplicadas');
  }

  const correct = options.filter((o) => o && o.isCorrect === true);
  if (correct.length !== 1) {
    errors.push('deve ter exatamente 1 resposta correta');
  }

  options.forEach((option, index) => {
    const expectedId = OPTION_IDS[index];
    if (!option || String(option.id) !== expectedId) {
      errors.push(`opção ${index} deve ter id ${expectedId}`);
    }
    if (!option || !String(option.label || '').trim()) {
      errors.push(`opção ${expectedId} sem texto`);
    }
  });

  if (fact) {
    if (category && category !== fact.category) {
      errors.push('categoria diferente do fato');
    }
    if (correct[0] && normalizeText(correct[0].label) !== normalizeText(fact.answer)) {
      errors.push('resposta correta não bate com o fato');
    }

    const keywords = Array.isArray(fact.keywords) ? fact.keywords : [];
    if (keywords.length > 0) {
      const haystack = normalizeText(questionText);
      const hit = keywords.some((kw) => haystack.includes(normalizeText(kw)));
      if (!hit) {
        errors.push('enunciado não referencia palavras-chave do fato');
      }
    }
  }

  if (errors.length) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    question: {
      question: questionText,
      options: options.map((option, index) => ({
        id: OPTION_IDS[index],
        label: String(option.label).trim(),
        isCorrect: option.isCorrect === true,
        explanation:
          option.isCorrect === true
            ? String(option.explanation || fact?.explanation || '').trim() || undefined
            : undefined
      })),
      category,
      difficulty,
      points: Number(raw.points) || (difficulty === 'dificil' ? 20 : difficulty === 'medio' ? 15 : 10),
      factId: fact?.id || raw.factId || undefined
    }
  };
}

function validateDailyPack(questions, context = {}) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { ok: false, errors: ['pacote vazio'], questions: [] };
  }

  const validated = [];
  const allErrors = [];

  questions.forEach((item, index) => {
    const result = validateDailyChallengeQuestion(item, context);
    if (!result.ok) {
      allErrors.push(`q${index + 1}: ${result.errors.join('; ')}`);
      return;
    }
    validated.push(result.question);
  });

  const uniqueTexts = new Set(validated.map((q) => normalizeText(q.question)));
  if (uniqueTexts.size !== validated.length) {
    allErrors.push('perguntas duplicadas no pacote do dia');
  }

  if (allErrors.length) {
    return { ok: false, errors: allErrors, questions: validated };
  }

  return { ok: true, errors: [], questions: validated };
}

module.exports = {
  validateDailyChallengeQuestion,
  validateDailyPack,
  normalizeText,
  ALLOWED_DIFFICULTIES,
  OPTION_IDS
};
