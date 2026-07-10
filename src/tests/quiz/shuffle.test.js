const { shuffleQuestionOptions, shuffleQuizQuestions } = require('../../utils/shuffle');
const { quizQuestionsData } = require('../../utils/quizQuestionsData');

describe('shuffle utils', () => {
  const baseQuestion = {
    question: 'Pergunta de teste?',
    options: [
      { id: 'A', label: 'Opção 1', isCorrect: false },
      { id: 'B', label: 'Opção 2', isCorrect: true, explanation: 'Explicação' },
      { id: 'C', label: 'Opção 3', isCorrect: false },
      { id: 'D', label: 'Opção 4', isCorrect: false }
    ],
    category: 'teste',
    difficulty: 'facil',
    points: 10
  };

  it('preserva todas as alternativas e qual delas é a correta', () => {
    const shuffled = shuffleQuestionOptions(baseQuestion);

    expect(shuffled.options).toHaveLength(4);
    const correct = shuffled.options.find((o) => o.isCorrect);
    expect(correct.label).toBe('Opção 2');
    expect(correct.explanation).toBe('Explicação');

    const labels = shuffled.options.map((o) => o.label).sort();
    expect(labels).toEqual(['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4']);
  });

  it('reatribui os ids A/B/C/D de acordo com a nova posição', () => {
    const shuffled = shuffleQuestionOptions(baseQuestion);
    shuffled.options.forEach((option, index) => {
      expect(option.id).toBe(String.fromCharCode(65 + index));
    });
  });

  it('não altera perguntas com menos de 2 alternativas', () => {
    const question = { question: 'X?', options: [{ id: 'A', label: 'Única', isCorrect: true }] };
    expect(shuffleQuestionOptions(question)).toEqual(question);
  });

  it('embaralha todas as questões de um quiz', () => {
    const questions = [baseQuestion, { ...baseQuestion, question: 'Segunda pergunta?' }];
    const shuffled = shuffleQuizQuestions(questions);

    expect(shuffled).toHaveLength(2);
    shuffled.forEach((q) => {
      expect(q.options.find((o) => o.isCorrect).label).toBe('Opção 2');
    });
  });

  it('distribui a posição da resposta correta de forma equilibrada no banco real de perguntas', () => {
    // Repete o embaralhamento várias vezes para reduzir a chance de um teste
    // "flaky" por causa da aleatoriedade de uma única rodada.
    const positionCounts = [0, 0, 0, 0];
    const ROUNDS = 30;

    for (let round = 0; round < ROUNDS; round++) {
      for (const set of quizQuestionsData) {
        for (const question of set.questions) {
          const shuffled = shuffleQuestionOptions(question);
          const idx = shuffled.options.findIndex((o) => o.isCorrect);
          if (idx >= 0 && idx < 4) positionCounts[idx]++;
        }
      }
    }

    const total = positionCounts.reduce((a, b) => a + b, 0);
    const expectedPerPosition = total / 4;

    // Nenhuma posição deve concentrar mais de ~40% das respostas corretas
    // (antes da correção, a posição B concentrava ~61%).
    positionCounts.forEach((count) => {
      expect(count).toBeLessThan(total * 0.4);
      expect(count).toBeGreaterThan(0);
    });
    // Sanity check: a distribuição está perto do esperado (25% cada)
    positionCounts.forEach((count) => {
      expect(Math.abs(count - expectedPerPosition)).toBeLessThan(expectedPerPosition);
    });
  });
});
