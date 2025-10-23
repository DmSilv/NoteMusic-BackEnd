/**
 * 🎯 SISTEMA DE GAMIFICAÇÃO REBALANCEADO - NoteMusic
 * 
 * PRINCÍPIO: Progressão baseada na CONCLUSÃO DE MÓDULOS
 * BÔNUS: Apenas desafios diários podem acelerar o progresso
 */

// Constantes do sistema rebalanceado
const GAMIFICATION_CONSTANTS = {
  // 📚 PONTUAÇÃO BASEADA EM MÓDULOS
  MODULE_COMPLETION: {
    APRENDIZ_TO_VIRTUOSO: 2, // 2 módulos completos
    VIRTUOSO_TO_MAESTRO: 4,  // 4 módulos completos (total: 6)
  },
  
  // 🎯 PONTOS POR AÇÃO (REDUZIDOS)
  POINTS: {
    QUIZ_QUESTION: 5,           // Reduzido de 10 para 5
    QUIZ_COMPLETION: 10,        // Reduzido de 25 para 10
    MODULE_COMPLETION: 50,       // Pontos por completar módulo
    DAILY_CHALLENGE_BONUS: 25,  // Reduzido de 50-100 para 25
    STREAK_BONUS: 5,            // Reduzido de 10 para 5
    PERFECT_SCORE_BONUS: 0.1,   // Reduzido de 0.5 para 0.1 (10%)
  },
  
  // 🎓 REQUISITOS DE NÍVEL (BASEADOS EM MÓDULOS)
  LEVEL_REQUIREMENTS: {
    aprendiz: {
      minModules: 0,
      maxModules: 1,
      description: 'Começando a jornada musical'
    },
    virtuoso: {
      minModules: 2,
      maxModules: 5,
      description: 'Desenvolvendo habilidades musicais'
    },
    maestro: {
      minModules: 6,
      maxModules: Infinity,
      description: 'Mestre da teoria musical'
    }
  }
};

/**
 * 🎯 Função para calcular progresso baseado em MÓDULOS COMPLETOS
 */
const calculateModuleBasedProgress = (user) => {
  const completedModules = user.completedModules?.length || 0;
  const totalPoints = user.totalPoints || 0;
  
  console.log('🔍 Calculando progresso baseado em módulos:', {
    level: user.level,
    completedModules,
    totalPoints
  });
  
  switch (user.level) {
    case 'aprendiz':
      // Para ser Virtuoso: precisa completar 2 módulos
      const modulesForVirtuoso = GAMIFICATION_CONSTANTS.MODULE_COMPLETION.APRENDIZ_TO_VIRTUOSO;
      const progressModules = Math.min((completedModules / modulesForVirtuoso) * 100, 100);
      
      return {
        current: 'Aprendiz',
        next: 'Virtuoso',
        percentage: Math.round(progressModules),
        requirements: `Complete ${modulesForVirtuoso} módulos para avançar`,
        modulesProgress: { 
          current: completedModules, 
          required: modulesForVirtuoso, 
          percentage: Math.round(progressModules) 
        },
        pointsProgress: { 
          current: totalPoints, 
          required: 'N/A', 
          percentage: 0,
          note: 'Pontos não determinam progresso de nível'
        },
        canAdvance: completedModules >= modulesForVirtuoso
      };
    
    case 'virtuoso':
      // Para ser Maestro: precisa completar 4 módulos adicionais (total 6)
      const modulesForMaestro = GAMIFICATION_CONSTANTS.MODULE_COMPLETION.VIRTUOSO_TO_MAESTRO;
      const totalModulesNeeded = GAMIFICATION_CONSTANTS.MODULE_COMPLETION.APRENDIZ_TO_VIRTUOSO + modulesForMaestro;
      const progressModulesInt = Math.min((completedModules / totalModulesNeeded) * 100, 100);
      
      return {
        current: 'Virtuoso',
        next: 'Maestro',
        percentage: Math.round(progressModulesInt),
        requirements: `Complete ${totalModulesNeeded} módulos no total para avançar`,
        modulesProgress: { 
          current: completedModules, 
          required: totalModulesNeeded, 
          percentage: Math.round(progressModulesInt) 
        },
        pointsProgress: { 
          current: totalPoints, 
          required: 'N/A', 
          percentage: 0,
          note: 'Pontos não determinam progresso de nível'
        },
        canAdvance: completedModules >= totalModulesNeeded
      };
    
    case 'maestro':
      return {
        current: 'Maestro',
        next: 'Nível Máximo',
        percentage: 100,
        requirements: 'Nível máximo atingido! Parabéns!',
        modulesProgress: { 
          current: completedModules, 
          required: completedModules || 1, 
          percentage: 100 
        },
        pointsProgress: { 
          current: totalPoints, 
          required: totalPoints || 1, 
          percentage: 100 
        },
        canAdvance: false
      };
    
    default:
      console.log('⚠️ Nível não reconhecido:', user.level);
      return {
        current: 'Aprendiz',
        next: 'Virtuoso',
        percentage: 0,
        requirements: `Complete ${GAMIFICATION_CONSTANTS.MODULE_COMPLETION.APRENDIZ_TO_VIRTUOSO} módulos para avançar`,
        modulesProgress: { 
          current: completedModules, 
          required: GAMIFICATION_CONSTANTS.MODULE_COMPLETION.APRENDIZ_TO_VIRTUOSO, 
          percentage: 0 
        },
        pointsProgress: { 
          current: totalPoints, 
          required: 'N/A', 
          percentage: 0,
          note: 'Pontos não determinam progresso de nível'
        },
        canAdvance: false
      };
  }
};

/**
 * 🎯 Função para calcular pontos rebalanceados
 */
const calculateRebalancedPoints = (score, totalQuestions, isDailyChallenge = false, streak = 0) => {
  const POINTS = GAMIFICATION_CONSTANTS.POINTS;
  
  // Pontos base por questões corretas
  const basePoints = score * POINTS.QUIZ_QUESTION;
  
  // Bônus por completar quiz
  const quizCompletionBonus = POINTS.QUIZ_COMPLETION;
  
  // Bônus por desempenho excelente (90%+)
  const percentage = (score / totalQuestions) * 100;
  const performanceBonus = percentage >= 90 ? Math.round(basePoints * POINTS.PERFECT_SCORE_BONUS) : 0;
  
  // Bônus por streak (reduzido)
  const streakBonus = streak >= 3 ? Math.floor(streak / 3) * POINTS.STREAK_BONUS : 0;
  
  // Bônus para desafio diário (único bônus significativo)
  const dailyChallengeBonus = isDailyChallenge ? POINTS.DAILY_CHALLENGE_BONUS : 0;
  
  const totalPoints = basePoints + quizCompletionBonus + performanceBonus + streakBonus + dailyChallengeBonus;
  
  console.log('📊 Pontos rebalanceados:', {
    basePoints,
    quizCompletionBonus,
    performanceBonus,
    streakBonus,
    dailyChallengeBonus,
    totalPoints,
    isDailyChallenge
  });
  
  return {
    basePoints,
    quizCompletionBonus,
    performanceBonus,
    streakBonus,
    dailyChallengeBonus,
    totalPoints
  };
};

/**
 * 🎯 Função para verificar se usuário pode avançar de nível
 */
const canUserAdvanceLevel = (user) => {
  const completedModules = user.completedModules?.length || 0;
  
  switch (user.level) {
    case 'aprendiz':
      return completedModules >= GAMIFICATION_CONSTANTS.MODULE_COMPLETION.APRENDIZ_TO_VIRTUOSO;
    
    case 'virtuoso':
      const totalModulesNeeded = GAMIFICATION_CONSTANTS.MODULE_COMPLETION.APRENDIZ_TO_VIRTUOSO + 
                                 GAMIFICATION_CONSTANTS.MODULE_COMPLETION.VIRTUOSO_TO_MAESTRO;
      return completedModules >= totalModulesNeeded;
    
    case 'maestro':
      return false; // Nível máximo
    
    default:
      return false;
  }
};

/**
 * 🎯 Função para atualizar nível baseado em módulos completos
 */
const updateUserLevelBasedOnModules = (user) => {
  const completedModules = user.completedModules?.length || 0;
  const previousLevel = user.level;
  
  // Determinar novo nível baseado apenas em módulos completos
  if (completedModules >= 6) {
    user.level = 'maestro';
  } else if (completedModules >= 2) {
    user.level = 'virtuoso';
  } else {
    user.level = 'aprendiz';
  }
  
  // Log se houve mudança de nível
  if (previousLevel !== user.level) {
    console.log(`🎉 Usuário ${user.email} avançou de ${previousLevel} para ${user.level}! (${completedModules} módulos completos)`);
  }
  
  return user.level !== previousLevel;
};

module.exports = {
  GAMIFICATION_CONSTANTS,
  calculateModuleBasedProgress,
  calculateRebalancedPoints,
  canUserAdvanceLevel,
  updateUserLevelBasedOnModules
};
