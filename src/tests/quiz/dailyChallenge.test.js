const mongoose = require('mongoose');
const Quiz = require('../../models/quiz.model');
const QuizService = require('../../services/quiz.service');

/**
 * Cria várias questões de módulo espalhadas em quizzes diferentes, para
 * simular o pool real do qual o desafio diário sorteia perguntas.
 */
async function seedModuleQuizzes(totalQuestions = 40) {
  const moduleId = new mongoose.Types.ObjectId();
  const questions = Array.from({ length: totalQuestions }, (_, i) => ({
    question: `Pergunta número ${i}?`,
    options: [
      { id: 'A', label: 'Opção A', isCorrect: true },
      { id: 'B', label: 'Opção B', isCorrect: false },
      { id: 'C', label: 'Opção C', isCorrect: false },
      { id: 'D', label: 'Opção D', isCorrect: false },
    ],
    category: 'teste',
    difficulty: 'facil',
    points: 10,
  }));

  const chunkSize = 5;
  for (let i = 0; i < questions.length; i += chunkSize) {
    await Quiz.create({
      title: `Quiz módulo ${i / chunkSize}`,
      description: 'desc',
      moduleId,
      questions: questions.slice(i, i + chunkSize),
      level: 'aprendiz',
      type: 'module',
      isActive: true,
    });
  }
}

describe('QuizService.getDailyChallenge — geração dinâmica', () => {
  it('gera o desafio embaralhando as alternativas e NÃO expõe isCorrect na API', async () => {
    await seedModuleQuizzes();

    const result = await QuizService.getDailyChallenge();

    expect(result.status).toBe(200);
    const { dailyChallenge } = result.body;
    expect(dailyChallenge.questions.length).toBeGreaterThan(0);
    dailyChallenge.questions.forEach((q) => {
      expect(q.options).toHaveLength(4);
      q.options.forEach((o) => {
        expect(o.isCorrect).toBeUndefined();
      });
    });

    // Gabarito permanece apenas no banco (para validação no submit)
    const stored = await Quiz.findOne({ type: 'daily-challenge' });
    expect(stored.questions[0].options.some((o) => o.isCorrect === true)).toBe(true);
  });

  it('mantém o mesmo conjunto de perguntas ao chamar novamente no mesmo dia', async () => {
    await seedModuleQuizzes();

    const first = await QuizService.getDailyChallenge();
    const second = await QuizService.getDailyChallenge();

    expect(String(second.body.dailyChallenge.id)).toBe(String(first.body.dailyChallenge.id));
    expect(second.body.dailyChallenge.questions.map((q) => q.question)).toEqual(
      first.body.dailyChallenge.questions.map((q) => q.question)
    );
  });

  it('sorteia um novo conjunto quando o desafio salvo é de um dia anterior', async () => {
    await seedModuleQuizzes();

    const first = await QuizService.getDailyChallenge();

    // Simula a "virada do dia": o desafio salvo passa a ser de uma data
    // diferente da configuração atual, forçando a regeneração.
    await Quiz.updateOne(
      { type: 'daily-challenge' },
      { $set: { dailyChallengeDate: 'dia-anterior' } }
    );

    const second = await QuizService.getDailyChallenge();

    const firstQuestions = first.body.dailyChallenge.questions.map((q) => q.question).sort();
    const secondQuestions = second.body.dailyChallenge.questions.map((q) => q.question).sort();
    expect(secondQuestions).not.toEqual(firstQuestions);
  });

  it('distribui a resposta correta de forma equilibrada entre A/B/C/D ao longo de várias regenerações', async () => {
    await seedModuleQuizzes(60);

    const positionCounts = [0, 0, 0, 0];
    for (let day = 0; day < 20; day++) {
      await Quiz.updateOne(
        { type: 'daily-challenge' },
        { $set: { dailyChallengeDate: `dia-simulado-${day}` } }
      );
      const result = await QuizService.getDailyChallenge();
      result.body.dailyChallenge.questions.forEach((q) => {
        const idx = q.options.findIndex((o) => o.isCorrect);
        if (idx >= 0 && idx < 4) positionCounts[idx]++;
      });
    }

    const total = positionCounts.reduce((a, b) => a + b, 0);
    positionCounts.forEach((count) => {
      expect(count).toBeLessThan(total * 0.45);
      expect(count).toBeGreaterThan(0);
    });
  });

  it('retorna 404 quando não há nenhuma questão de módulo disponível', async () => {
    const result = await QuizService.getDailyChallenge();

    expect(result.status).toBe(404);
    expect(result.body.success).toBe(false);
  });
});
