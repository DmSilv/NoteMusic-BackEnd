/**
 * Calculadora de tempo para quizzes
 * Calcula o tempo limite baseado no número de questões
 */

/**
 * Calcula o tempo limite para um quiz baseado no número de questões
 * @param {number} numberOfQuestions - Número de questões no quiz
 * @returns {number} Tempo limite em segundos
 */
const calculateQuizTimeLimit = (numberOfQuestions) => {
  // Regra: 2 minutos por questão, com mínimo de 3 minutos
  // Mínimo: 3 questões = 180 segundos (3 minutos)
  // Máximo: 15 questões = 1800 segundos (30 minutos)
  
  const minutesPerQuestion = 2;
  const minTimeSeconds = 180; // 3 minutos mínimo
  const maxTimeSeconds = 1800; // 30 minutos máximo
  
  let calculatedTime = numberOfQuestions * minutesPerQuestion * 60; // Converter para segundos
  
  // Garantir limites mínimo e máximo
  if (calculatedTime < minTimeSeconds) {
    calculatedTime = minTimeSeconds;
  } else if (calculatedTime > maxTimeSeconds) {
    calculatedTime = maxTimeSeconds;
  }
  
  return calculatedTime;
};

/**
 * Calcula o tempo limite sugerido baseado no número de questões
 * Retorna uma descrição legível para humanos
 * @param {number} numberOfQuestions - Número de questões no quiz
 * @returns {string} Descrição do tempo (ex: "8 minutos")
 */
const getTimeDescription = (numberOfQuestions) => {
  const seconds = calculateQuizTimeLimit(numberOfQuestions);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes === 1) {
    return '1 minuto';
  }
  
  return `${minutes} minutos`;
};

/**
 * Obtém tempo limite do quiz (calcula se não existir)
 * @param {object} quiz - Objeto do quiz
 * @returns {number} Tempo limite em segundos
 */
const getQuizTimeLimit = (quiz) => {
  if (quiz.timeLimit && quiz.timeLimit > 0) {
    return quiz.timeLimit;
  }
  
  // Se não tem timeLimit definido, calcular baseado no número de questões
  const questionCount = quiz.questions ? quiz.questions.length : 3;
  return calculateQuizTimeLimit(questionCount);
};

module.exports = {
  calculateQuizTimeLimit,
  getTimeDescription,
  getQuizTimeLimit
};





