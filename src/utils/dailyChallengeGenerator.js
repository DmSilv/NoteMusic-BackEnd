/**
 * 🎯 GERADOR DINÂMICO DE DESAFIO DIÁRIO
 * Configuração do dia (quantidade/tempo). O conteúdo preferencial vem do
 * pacote semanal (npm run daily:week); este util só define meta do fallback.
 */

/**
 * Gera configuração do desafio baseada no dia do ano
 * Usa o dia do ano (1-365) para garantir que cada dia tenha um desafio diferente
 */
const generateDailyChallengeConfig = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  // Gerar seed baseado no dia do ano
  const seed = dayOfYear;
  
  // Pacotes leves (~5 perguntas / ~7 min) — alinhados ao gerador semanal
  const configs = [
    { questions: 5, timeMinutes: 7, difficulty: 'facil' },
    { questions: 5, timeMinutes: 7, difficulty: 'medio' },
    { questions: 5, timeMinutes: 8, difficulty: 'facil' },
    { questions: 5, timeMinutes: 8, difficulty: 'medio' },
    { questions: 5, timeMinutes: 7, difficulty: 'medio' },
    { questions: 5, timeMinutes: 9, difficulty: 'dificil' },
    { questions: 5, timeMinutes: 7, difficulty: 'facil' },
    { questions: 5, timeMinutes: 8, difficulty: 'dificil' },
  ];
  
  // Selecionar configuração baseada no seed
  const selectedConfig = configs[seed % configs.length];
  
  console.log(`📅 Desafio Diário - Dia ${dayOfYear} do ano`);
  console.log(`🎯 Configuração: ${selectedConfig.questions} questões, ${selectedConfig.timeMinutes} minutos, dificuldade: ${selectedConfig.difficulty}`);
  
  return {
    ...selectedConfig,
    timeLimit: selectedConfig.timeMinutes * 60, // Converter para segundos
    seed, // Incluir seed para debug
    // Data local (não UTC) — evita virar “amanhã” à noite no Brasil
    date: [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-')
  };
};

/**
 * Obtém informações do desafio de hoje para exibição
 */
const getTodayChallengeInfo = () => {
  const config = generateDailyChallengeConfig();
  
  return {
    questions: config.questions,
    timeMinutes: config.timeMinutes,
    timeLimit: config.timeLimit,
    difficulty: config.difficulty,
    date: config.date
  };
};

/**
 * Gera frase motivacional baseada no dia
 */
const getDailyMotivation = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  const motivations = [
    'Comece o dia aprendendo algo novo!',
    'Desafie seus conhecimentos musicais!',
    'Pratique um pouco a cada dia!',
    'Seu progresso conta muito!',
    'Vamos explorar a teoria musical!',
    'Cada dia é uma nova oportunidade!',
    'Desenvolva suas habilidades!',
    'Aprenda e conquiste seus objetivos!'
  ];
  
  return motivations[dayOfYear % motivations.length];
};

module.exports = {
  generateDailyChallengeConfig,
  getTodayChallengeInfo,
  getDailyMotivation
};
