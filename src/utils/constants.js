// Constantes do sistema

exports.USER_LEVELS = {
  BEGINNER: 'iniciante',
  INTERMEDIATE: 'intermediario',
  ADVANCED: 'avancado'
};

exports.MODULE_CATEGORIES = {
  SOUND_PROPERTIES: 'propriedades-som',
  MAJOR_SCALES: 'escalas-maiores',
  MUSICAL_FIGURES: 'figuras-musicais',
  TERNARY_RHYTHM: 'ritmo-ternarios',
  SIMPLE_TIME: 'compasso-simples',
  TEMPO_DYNAMICS: 'andamento-dinamica',
  BASIC_SOLFEGE: 'solfegio-basico',
  MUSICAL_ARTICULATION: 'articulacao-musical',
  MUSICAL_INTERVALS: 'intervalos-musicais',
  MUSICAL_EXPRESSION: 'expressao-musical',
  SYNCOPATION: 'sincopa-contratempo',
  COMPOUND_TIME: 'compasso-composto'
};

exports.QUIZ_DIFFICULTY = {
  EASY: 'facil',
  MEDIUM: 'medio',
  HARD: 'dificil'
};

exports.POINTS = {
  MODULE_COMPLETION: 100,
  QUIZ_QUESTION: 10,
  DAILY_CHALLENGE_BONUS: 50,
  STREAK_BONUS: 20,
  PERFECT_SCORE_BONUS: 0.2 // 20% bonus
};

exports.LIMITS = {
  MAX_QUIZ_ATTEMPTS: 3,
  MAX_WEEKLY_GOAL: 20,
  MIN_WEEKLY_GOAL: 1,
  MIN_PASSWORD_LENGTH: 6,
  DEFAULT_PAGE_LIMIT: 10,
  MAX_PAGE_LIMIT: 100
};

exports.TIME_LIMITS = {
  QUIZ_DEFAULT: 300, // 5 minutos em segundos
  DAILY_CHALLENGE: 600, // 10 minutos
  TOKEN_EXPIRY: '7d'
};

exports.MESSAGES = {
  // Auth
  AUTH_SUCCESS: 'Autenticação realizada com sucesso',
  AUTH_FAILED: 'Email ou senha inválidos',
  USER_EXISTS: 'Este email já está cadastrado',
  USER_NOT_FOUND: 'Usuário não encontrado',
  TOKEN_INVALID: 'Token inválido',
  TOKEN_EXPIRED: 'Token expirado',
  
  // Modules
  MODULE_NOT_FOUND: 'Módulo não encontrado',
  MODULE_COMPLETED: 'Módulo completado com sucesso!',
  MODULE_ALREADY_COMPLETED: 'Módulo já foi completado',
  MODULE_LOCKED: 'Você precisa completar os módulos anteriores primeiro',
  
  // Quiz
  QUIZ_NOT_FOUND: 'Quiz não encontrado',
  QUIZ_NO_ATTEMPTS: 'Você já utilizou todas as tentativas para este quiz',
  QUIZ_PASSED: 'Parabéns! Você passou no quiz!',
  QUIZ_FAILED: 'Continue estudando e tente novamente!',
  
  // Progress
  ALL_MODULES_COMPLETED: 'Parabéns! Você completou todos os módulos disponíveis!',
  LEVEL_UP_SUGGESTION: 'Você completou todos os módulos do seu nível. Que tal avançar?',
  
  // General
  OPERATION_SUCCESS: 'Operação realizada com sucesso',
  OPERATION_FAILED: 'Erro ao processar requisição',
  VALIDATION_ERROR: 'Erro de validação',
  SERVER_ERROR: 'Erro interno do servidor',
  NOT_FOUND: 'Recurso não encontrado',
  FORBIDDEN: 'Acesso negado',
  UNAUTHORIZED: 'Não autorizado'
};