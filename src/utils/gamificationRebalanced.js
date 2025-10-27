/**
 * 🎯 SISTEMA DE GAMIFICAÇÃO REBALANCEADO - NoteMusic
 * 
 * PRINCÍPIO: Progressão baseada na CONCLUSÃO DE MÓDULOS
 * BÔNUS: Apenas desafios diários podem acelerar o progresso
 */

// Constantes do sistema rebalanceado
const GAMIFICATION_CONSTANTS = {
  // 📚 PROGRESSÃO BASEADA EM MÓDULOS COMPLETOS (será calculado dinamicamente)
  MODULE_COMPLETION: {
    APRENDIZ_TO_VIRTUOSO: 16,  // 75% de 22 módulos Aprendiz (dinâmico)
    VIRTUOSO_TO_MAESTRO: 32,   // 75% de 42 módulos total Aprendiz+Virtuoso (dinâmico)
  },
  
  // 🎯 PONTOS POR AÇÃO (FOCADOS EM MÓDULOS)
  POINTS: {
    QUIZ_QUESTION: 0,           // Quiz NÃO dá pontos
    QUIZ_COMPLETION: 0,         // Quiz NÃO dá pontos
    MODULE_COMPLETION_APRENDIZ: 50,    // Pontos por completar módulo APRENDIZ
    MODULE_COMPLETION_VIRTUOSO: 100,   // Pontos por completar módulo VIRTUOSO
    MODULE_COMPLETION_MAESTRO: 150,    // Pontos por completar módulo MAESTRO
    DAILY_CHALLENGE_BONUS: 25,  // Bônus para desafio diário
    STREAK_BONUS: 0,            // Não usa mais streak bonus
    PERFECT_SCORE_BONUS: 0,     // Não usa mais
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
      maxModules: 4,
      description: 'Desenvolvendo habilidades musicais'
    },
    maestro: {
      minModules: 5,
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
      // Para ser Maestro: precisa completar 5 módulos no total
      const modulesForMaestro = GAMIFICATION_CONSTANTS.MODULE_COMPLETION.VIRTUOSO_TO_MAESTRO;
      const progressModulesInt = Math.min((completedModules / modulesForMaestro) * 100, 100);
      
      return {
        current: 'Virtuoso',
        next: 'Maestro',
        percentage: Math.round(progressModulesInt),
        requirements: `Complete ${modulesForMaestro} módulos no total para avançar`,
        modulesProgress: { 
          current: completedModules, 
          required: modulesForMaestro, 
          percentage: Math.round(progressModulesInt) 
        },
        pointsProgress: { 
          current: totalPoints, 
          required: 'N/A', 
          percentage: 0,
          note: 'Pontos não determinam progresso de nível'
        },
        canAdvance: completedModules >= modulesForMaestro
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
 * 🎯 Função para obter requisitos dinâmicos baseados nos módulos disponíveis
 */
const getDynamicRequirements = async () => {
  try {
    // Buscar contagem de módulos por nível
    const countsByLevel = await Module.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);
    
    // Criar mapa de contagens
    const modulesByLevel = {};
    countsByLevel.forEach(item => {
      modulesByLevel[item._id] = item.count;
    });
    
    const aprendizCount = modulesByLevel.aprendiz || 22;
    const virtuosoCount = modulesByLevel.virtuoso || 20;
    const maestroCount = modulesByLevel.maestro || 0;
    
    console.log('📊 Módulos disponíveis:', {
      aprendiz: aprendizCount,
      virtuoso: virtuosoCount,
      maestro: maestroCount
    });
    
    // Calcular requisitos: 75% de cada nível
    const requiredAprendizToVirtuoso = Math.ceil(aprendizCount * 0.75);
    const totalAprendizVirtuoso = aprendizCount + virtuosoCount;
    const requiredVirtuosoToMaestro = Math.ceil(totalAprendizVirtuoso * 0.75);
    
    console.log('🎯 Requisitos calculados:', {
      'Aprendiz -> Virtuoso': `${requiredAprendizToVirtuoso}/${aprendizCount} módulos Aprendiz (75%)`,
      'Virtuoso -> Maestro': `${requiredVirtuosoToMaestro}/${totalAprendizVirtuoso} módulos total (75%)`
    });
    
    return {
      requiredAprendizToVirtuoso,
      requiredVirtuosoToMaestro,
      totalModulesByLevel: {
        aprendiz: aprendizCount,
        virtuoso: virtuosoCount,
        maestro: maestroCount
      }
    };
  } catch (error) {
    console.error('❌ Erro ao calcular requisitos dinâmicos:', error);
    // Valores fallback se houver erro
    return {
      requiredAprendizToVirtuoso: 16,
      requiredVirtuosoToMaestro: 32,
      totalModulesByLevel: {
        aprendiz: 22,
        virtuoso: 20,
        maestro: 0
      }
    };
  }
};

/**
 * 🎯 Função para calcular progresso baseado em MÓDULOS COMPLETOS (com requisitos dinâmicos)
 */
const calculateModuleBasedProgressWithDynamic = async (user) => {
  const requirements = await getDynamicRequirements();
  const completedModules = user.completedModules?.length || 0;
  
  // Sobrescrever constantes com valores dinâmicos
  GAMIFICATION_CONSTANTS.MODULE_COMPLETION.APRENDIZ_TO_VIRTUOSO = requirements.requiredAprendizToVirtuoso;
  GAMIFICATION_CONSTANTS.MODULE_COMPLETION.VIRTUOSO_TO_MAESTRO = requirements.requiredVirtuosoToMaestro;
  
  // Usar função existente com constantes atualizadas
  return calculateModuleBasedProgress(user);
};

/**
 * 🎯 Função para calcular pontos NOVO SISTEMA (QUIZ NÃO DÁ PONTOS)
 */
const calculateRebalancedPoints = (score, totalQuestions, isDailyChallenge = false, streak = 0) => {
  // NOVO SISTEMA: Quiz NÃO dá pontos
  // Pontos vêm APENAS de completar módulos
  const totalPoints = 0;
  
  console.log('📊 Quiz completado mas SEM pontos (sistema baseado em módulos)');
  
  return {
    basePoints: 0,
    quizCompletionBonus: 0,
    performanceBonus: 0,
    streakBonus: 0,
    dailyChallengeBonus: 0,
    totalPoints: 0,
    note: 'Pontos serão dados ao completar o módulo'
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
      return completedModules >= GAMIFICATION_CONSTANTS.MODULE_COMPLETION.VIRTUOSO_TO_MAESTRO;
    
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
  // PROGRESSÃO: Aprendiz(0-1) -> Virtuoso(2-4) -> Maestro(5+)
  if (completedModules >= 5) {
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
  calculateModuleBasedProgressWithDynamic,
  calculateRebalancedPoints,
  canUserAdvanceLevel,
  updateUserLevelBasedOnModules,
  getDynamicRequirements
};



