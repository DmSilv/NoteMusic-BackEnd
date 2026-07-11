const {
  validateDailyChallengeQuestion
} = require('../../utils/dailyChallengeQuestionValidator');
const {
  buildLocalWeekPack,
  buildQuestionFromFact,
  loadFactsCatalog,
  QUESTIONS_PER_DAY
} = require('../../utils/weeklyDailyChallengeBuilder');

describe('weeklyDailyChallengeBuilder', () => {
  it('monta a semana com 7 dias e 5 perguntas válidas por dia', () => {
    const pack = buildLocalWeekPack();

    expect(pack.days).toHaveLength(7);
    pack.days.forEach((day) => {
      expect(day.questions).toHaveLength(QUESTIONS_PER_DAY);
      expect(day.timeLimit).toBe(7 * 60);
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      day.questions.forEach((q) => {
        expect(q.options).toHaveLength(4);
        expect(q.options.filter((o) => o.isCorrect)).toHaveLength(1);
        expect(q.factId).toBeTruthy();
      });
    });
  });

  it('não repete o mesmo fato dentro da semana', () => {
    const pack = buildLocalWeekPack();
    const factIds = pack.days.flatMap((day) => day.questions.map((q) => q.factId));
    expect(new Set(factIds).size).toBe(factIds.length);
  });

  it('rejeita pergunta cuja resposta não bate com o fato', () => {
    const catalog = loadFactsCatalog();
    const fact = catalog.facts[0];
    const built = buildQuestionFromFact(fact);
    expect(built.ok).toBe(true);

    const tampered = {
      ...built.question,
      options: built.question.options.map((option) => ({
        ...option,
        isCorrect: !option.isCorrect
      }))
    };

    const result = validateDailyChallengeQuestion(tampered, {
      allowedCategories: new Set([fact.category]),
      fact
    });
    expect(result.ok).toBe(false);
  });
});
