/**
 * Utilitários para embaralhar a ordem das alternativas de quiz.
 *
 * Problema original: no banco de perguntas (quizQuestionsData.js), a resposta
 * correta estava concentrada na alternativa "B" (~61% das perguntas), porque as
 * opções foram escritas sempre na mesma ordem lógica (ex.: do menor para o maior
 * valor, com a correta quase sempre na segunda posição). Como o app usa a posição
 * (índice 0-based) da alternativa — e não o campo `id` — para exibir a letra
 * (A/B/C/D) e para validar a resposta, isso fazia a resposta certa "parecer"
 * sempre B para quem jogava.
 *
 * A correção embaralha a ordem das alternativas sempre que um quiz é gravado no
 * banco (seed ou atualização de conteúdo), preservando o texto, a explicação e
 * qual alternativa é a correta — só a posição muda. Como a validação sempre lê a
 * ordem que está gravada no próprio documento do quiz, não é preciso alterar a
 * lógica de validação nem o app.
 */

/**
 * Embaralha um array (Fisher-Yates), sem mutar o original.
 */
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Embaralha as alternativas de UMA questão e reatribui os ids A/B/C/D
 * para que continuem correspondendo à posição exibida.
 */
function shuffleQuestionOptions(question) {
  if (!question || !Array.isArray(question.options) || question.options.length < 2) {
    return question;
  }

  const shuffledOptions = shuffleArray(question.options).map((option, index) => ({
    ...option,
    id: String.fromCharCode(65 + index) // 65 = 'A'
  }));

  return { ...question, options: shuffledOptions };
}

/**
 * Embaralha as alternativas de todas as questões de um quiz.
 */
function shuffleQuizQuestions(questions) {
  if (!Array.isArray(questions)) return questions;
  return questions.map(shuffleQuestionOptions);
}

module.exports = { shuffleArray, shuffleQuestionOptions, shuffleQuizQuestions };
