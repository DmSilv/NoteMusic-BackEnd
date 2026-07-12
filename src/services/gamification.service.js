const User = require('../models/user.model');
const Module = require('../models/module.model');
const { calculateModuleBasedProgress } = require('../utils/gamificationRebalanced');

const getLevelName = (level) => {
  const names = {
    aprendiz: 'Aprendiz',
    virtuoso: 'Virtuoso',
    maestro: 'Maestro'
  };
  return names[level] || 'Aprendiz';
};

const formatCategoryName = (category) => {
  if (!category) return null;

  const names = {
    'propriedades-som': 'Propriedades do Som',
    'escalas-maiores': 'Escalas Maiores',
    'figuras-musicais': 'Figuras Musicais',
    'expressao-musical': 'Expressão Musical'
  };

  return names[category] || category;
};

const getNextAchievement = (user) => {
  const completedModules = user.completedModules.length;
  const streak = user.streak || 0;

  if (completedModules === 0) return 'Complete seu primeiro módulo';
  if (completedModules < 3) return 'Complete 3 módulos para avançar de nível';
  if (streak < 3) return 'Mantenha um streak de 3 dias';
  if (completedModules < 5) return 'Complete 5 módulos';
  if (streak < 7) return 'Mantenha um streak de 7 dias';
  return 'Continue estudando para novas conquistas!';
};

const buildLevelProgress = (user) => {
  const progress = calculateModuleBasedProgress(user);

  if (progress.pointsProgress) {
    progress.pointsProgress = {
      current: 0,
      required: 0,
      percentage: 0,
      note: 'Progresso baseado apenas em módulos completos'
    };
  }

  return progress;
};

class GamificationService {
  // Verificar conquistas do usuário
  static checkAchievements(user) {
    const achievements = [];
    
    // Conquista por primeiro módulo
    if (user.completedModules.length >= 1) {
      achievements.push({
        id: 'first_module',
        name: 'Primeiro Passo',
        description: 'Complete seu primeiro módulo',
        icon: '🎯',
        points: 50,
        unlockedAt: user.completedModules[0].completedAt
      });
    }
    
    // Conquista por streak de 7 dias
    if (user.streak >= 7) {
      achievements.push({
        id: 'week_streak',
        name: 'Consistente',
        description: 'Mantenha um streak de 7 dias',
        icon: '🔥',
        points: 100,
        unlockedAt: new Date()
      });
    }
    
    // Conquista por 5 módulos
    if (user.completedModules.length >= 5) {
      achievements.push({
        id: 'five_modules',
        name: 'Aprendiz Dedicado',
        description: 'Complete 5 módulos',
        icon: '📚',
        points: 200,
        unlockedAt: new Date()
      });
    }
    
    // Conquista por 1000 pontos
    if (user.totalPoints >= 1000) {
      achievements.push({
        id: 'thousand_points',
        name: 'Pontuador',
        description: 'Alcance 1000 pontos',
        icon: '⭐',
        points: 300,
        unlockedAt: new Date()
      });
    }
    
    return achievements;
  }
  
  // Gerar desafios personalizados
  static generatePersonalizedChallenges(user) {
    const challenges = [];
    
    // Desafio de módulos
    const moduleChallenge = {
      id: 'weekly_modules',
      title: 'Módulos da Semana',
      description: 'Complete 3 módulos esta semana',
      type: 'modules',
      target: 3,
      progress: user.completedModules.filter(m => {
        const date = new Date(m.completedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date > weekAgo;
      }).length,
      reward: 150,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    
    // Desafio de quizzes
    const quizChallenge = {
      id: 'weekly_quizzes',
      title: 'Quizzes da Semana',
      description: 'Complete 5 quizzes esta semana',
      type: 'quizzes',
      target: 5,
      progress: user.completedQuizzes.filter(q => {
        const date = new Date(q.completedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date > weekAgo;
      }).length,
      reward: 100,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    
    // Desafio de streak
    const streakChallenge = {
      id: 'maintain_streak',
      title: 'Mantenha o Streak',
      description: 'Mantenha um streak de 10 dias',
      type: 'streak',
      target: 10,
      progress: user.streak,
      reward: 200,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    };
    
    challenges.push(moduleChallenge, quizChallenge, streakChallenge);
    
    return challenges;
  }
  
  // Calcular estatísticas do usuário
  static calculateUserStats(user) {
    const totalModules = user.completedModules.length;
    const totalQuizzes = user.completedQuizzes.length;
    
    // Calcular progresso geral
    const progress = totalModules > 0 ? (totalModules / 12) * 100 : 0; // 12 módulos totais
    
    // Calcular nível baseado nos pontos
    const level = this.calculateLevel(user.totalPoints);
    
    // Calcular média de pontuação dos quizzes
    const quizScores = user.completedQuizzes.map(q => q.score || 0);
    const averageScore = quizScores.length > 0 
      ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length 
      : 0;
    
    return {
      level,
      progress: Math.round(progress),
      totalModules,
      completedModules: totalModules,
      totalQuizzes,
      averageScore: Math.round(averageScore),
      streak: user.streak,
      totalPoints: user.totalPoints
    };
  }
  
  // Calcular progresso de nível
  static calculateLevelProgress(totalPoints) {
    const levels = {
      aprendiz: { min: 0, max: 999 },
      virtuoso: { min: 1000, max: 2999 },
      maestro: { min: 3000, max: Infinity }
    };
    
    let currentLevel = 'aprendiz';
    let nextLevel = 'virtuoso';
    
    // Determinar nível atual
    if (totalPoints >= levels.virtuoso.min) {
      currentLevel = 'virtuoso';
      nextLevel = 'maestro';
    }
    if (totalPoints >= levels.maestro.min) {
      currentLevel = 'maestro';
      nextLevel = null;
    }
    
    // Calcular progresso para o próximo nível
    const currentLevelInfo = levels[currentLevel];
    const nextLevelInfo = nextLevel ? levels[nextLevel] : null;
    
    let percentage = 0;
    if (nextLevelInfo) {
      const range = nextLevelInfo.min - currentLevelInfo.min;
      const progress = totalPoints - currentLevelInfo.min;
      percentage = Math.min(Math.round((progress / range) * 100), 100);
    } else {
      percentage = 100; // Nível máximo
    }
    
    return {
      currentLevel,
      nextLevel,
      percentage,
      pointsToNext: nextLevelInfo ? nextLevelInfo.min - totalPoints : 0
    };
  }
  
  // Calcular nível baseado nos pontos
  static calculateLevel(totalPoints) {
    if (totalPoints < 1000) return 'Aprendiz';
    if (totalPoints < 3000) return 'Virtuoso';
    return 'Maestro';
  }
  
  // Atualizar progresso semanal
  static async updateWeeklyProgress(userId) {
    const user = await User.findById(userId);
    if (!user) return;
    
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Contar módulos completados na semana (quiz do módulo aprovado/concluído).
    // Meta semanal = módulos; não soma quizzes avulsos para evitar contagem dupla.
    const weeklyModules = user.completedModules.filter(m => 
      new Date(m.completedAt) > lastWeek
    ).length;
    
    user.weeklyProgress = weeklyModules;
    user.lastActivityDate = now;
    
    await user.save();
    
    return {
      weeklyProgress: user.weeklyProgress,
      weeklyGoal: user.weeklyGoal,
      percentage: Math.round((user.weeklyProgress / user.weeklyGoal) * 100)
    };
  }
  
  // Atualizar streak do usuário
  static async updateStreak(userId) {
    const user = await User.findById(userId);
    if (!user) return;
    
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Se o usuário já tem atividade hoje, não precisa atualizar
    if (user.lastActivityDate && 
        user.lastActivityDate.toDateString() === now.toDateString()) {
      return user.streak;
    }
    
    // Se a última atividade foi ontem, incrementar streak
    if (user.lastActivityDate && 
        user.lastActivityDate.toDateString() === yesterday.toDateString()) {
      user.streak += 1;
    } else {
      // Se passou mais de um dia, resetar streak
      user.streak = 1;
    }
    
    user.lastActivityDate = now;
    await user.save();
    
    return user.streak;
  }

  static getMockStats() {
    return {
      level: 'Aprendiz',
      progress: 0,
      streak: 0,
      achievements: [],
      challenges: [],
      totalModules: 16,
      completedModules: 0,
      weeklyGoal: 5,
      weeklyProgress: 0,
      nextAchievement: 'Complete seu primeiro módulo',
      totalPoints: 0,
      averageScorePercentage: 0,
      bestCategory: null,
      currentStreak: 0,
      longestStreak: 0,
      totalStudyDays: 0,
      quizPassRate: 0,
      levelProgress: {
        current: 'Aprendiz',
        next: 'Virtuoso',
        percentage: 0,
        requirements: 'Complete 3 módulos OU ganhe 300 pontos',
        pointsProgress: { current: 0, required: 300 },
        modulesProgress: { current: 0, required: 3 }
      },
      weeklyProgressDetail: {
        current: 0,
        goal: 5,
        percentage: 0
      },
      recentActivity: {
        lastStudyDate: null,
        modulesLast7Days: 0,
        quizzesLast7Days: 0
      }
    };
  }

  static buildDashboardStats(user) {
    const completedModules = user.completedModules.length;
    const totalQuizzes = user.completedQuizzes.length;
    const totalModules = 43;
    const progress =
      completedModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    const currentStreak = user.streak || 0;
    const longestStreak = Math.max(currentStreak, user.longestStreak || 0);

    const quizScores = user.completedQuizzes.map((q) => q.score || 0);
    const averageScore =
      quizScores.length > 0
        ? Math.round(
            (quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length) * 10
          )
        : 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const modulesLast7Days = user.completedModules.filter(
      (m) => new Date(m.completedAt) > weekAgo
    ).length;

    const quizzesLast7Days = user.completedQuizzes.filter(
      (q) => new Date(q.completedAt) > weekAgo
    ).length;

    const categoryStats = {};
    user.completedModules.forEach((cm) => {
      if (cm.moduleId && cm.moduleId.category) {
        categoryStats[cm.moduleId.category] = (categoryStats[cm.moduleId.category] || 0) + 1;
      }
    });

    const bestCategory =
      Object.keys(categoryStats).length > 0
        ? Object.keys(categoryStats).reduce((a, b) =>
            categoryStats[a] > categoryStats[b] ? a : b
          )
        : null;

    const levelProgress = buildLevelProgress(user);

    const passedQuizzes = user.completedQuizzes.filter((q) => q.passed === true).length;
    const quizPassRate =
      totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0;

    console.log(`📊 Taxa de aprovação: ${passedQuizzes}/${totalQuizzes} = ${quizPassRate}%`);

    const weeklyGoal = user.weeklyGoal || 5;
    // Source of truth: módulos concluídos nos últimos 7 dias (não o campo stale weeklyProgress)
    const weeklyProgress = modulesLast7Days;

    return {
      level: getLevelName(user.level),
      progress,
      streak: currentStreak,
      achievements: [],
      challenges: [],
      totalModules,
      completedModules,
      weeklyGoal,
      weeklyProgress,
      nextAchievement: getNextAchievement(user),
      totalPoints: user.totalPoints || 0,
      averageScorePercentage: averageScore,
      bestCategory: formatCategoryName(bestCategory),
      currentStreak,
      longestStreak,
      totalStudyDays: Math.max(currentStreak, user.completedModules.length),
      quizPassRate,
      levelProgress,
      weeklyProgressDetail: {
        current: weeklyProgress,
        goal: weeklyGoal,
        percentage: Math.round((weeklyProgress / weeklyGoal) * 100)
      },
      recentActivity: {
        lastStudyDate: user.lastActivityDate,
        modulesLast7Days,
        quizzesLast7Days
      }
    };
  }

  static async getStats(userId) {
    if (!userId) {
      console.log('📱 Usuário não autenticado, retornando dados mock');
      return {
        status: 200,
        body: {
          success: true,
          stats: GamificationService.getMockStats()
        }
      };
    }

    console.log('👤 Buscando dados reais para usuário:', userId);

    const user = await User.findById(userId)
      .select(
        'completedModules completedQuizzes streak totalPoints level weeklyProgress weeklyGoal lastActivityDate longestStreak name email'
      )
      .populate({
        path: 'completedModules.moduleId',
        select: 'title category points level',
        options: { lean: true }
      })
      .populate({
        path: 'completedQuizzes.quizId',
        select: 'title',
        options: { lean: true }
      })
      .lean();

    if (!user) {
      console.log('❌ Usuário não encontrado no banco');
      return {
        status: 404,
        body: {
          success: false,
          message: 'Usuário não encontrado'
        }
      };
    }

    console.log('✅ Usuário encontrado:', {
      id: user._id,
      name: user.name,
      level: user.level,
      totalPoints: user.totalPoints,
      streak: user.streak
    });

    const stats = GamificationService.buildDashboardStats(user);

    console.log('📊 Estatísticas calculadas:', {
      level: stats.level,
      totalPoints: stats.totalPoints,
      streak: stats.streak,
      levelProgress: stats.levelProgress
    });

    return {
      status: 200,
      body: {
        success: true,
        stats
      }
    };
  }

  static async getAchievements(userId) {
    const user = await User.findById(userId)
      .populate('completedModules.moduleId', 'title category')
      .populate('completedQuizzes.quizId', 'title');

    const achievements = GamificationService.checkAchievements(user);

    return {
      status: 200,
      body: {
        success: true,
        achievements,
        totalAchievements: achievements.length,
        totalPoints: achievements.reduce((sum, ach) => sum + ach.points, 0)
      }
    };
  }

  static async getChallenges(userId) {
    const user = await User.findById(userId)
      .populate('completedModules.moduleId')
      .populate('completedQuizzes.quizId');

    const challenges = GamificationService.generatePersonalizedChallenges(user);

    return {
      status: 200,
      body: {
        success: true,
        challenges,
        activeChallenges: challenges.filter((c) => c.progress < 100).length
      }
    };
  }

  static async getDetailedStats(userId) {
    const user = await User.findById(userId)
      .populate('completedModules.moduleId', 'title category points')
      .populate('completedQuizzes.quizId', 'title');

    const stats = GamificationService.calculateUserStats(user);

    const extraStats = {
      ...stats,
      currentStreak: user.streak,
      totalPoints: user.totalPoints,
      weeklyProgress: {
        current: user.weeklyProgress,
        goal: user.weeklyGoal,
        percentage: (user.weeklyProgress / user.weeklyGoal) * 100
      },
      recentActivity: {
        lastStudyDate: user.lastActivityDate,
        modulesLast7Days: user.completedModules.filter((m) => {
          const date = new Date(m.completedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date > weekAgo;
        }).length,
        quizzesLast7Days: user.completedQuizzes.filter((q) => {
          const date = new Date(q.completedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date > weekAgo;
        }).length
      }
    };

    return {
      status: 200,
      body: {
        success: true,
        stats: extraStats
      }
    };
  }

  static async getLeaderboard(userId, userTotalPoints, userStreak, { period = 'all', limit = 10 } = {}) {
    const { LIMITS } = require('../utils/constants');
    const safeLimit = Math.min(
      Math.max(parseInt(limit, 10) || LIMITS.DEFAULT_PAGE_LIMIT, 1),
      LIMITS.MAX_PAGE_LIMIT
    );

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'week': {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        dateFilter = { lastActivityDate: { $gte: weekAgo } };
        break;
      }
      case 'month': {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        dateFilter = { lastActivityDate: { $gte: monthAgo } };
        break;
      }
      default:
        break;
    }

    const [topByPoints, topByStreak, userPointsCount, userStreakCount] = await Promise.all([
      User.find({ isActive: true, ...dateFilter })
        .select('name totalPoints level')
        .sort({ totalPoints: -1 })
        .limit(safeLimit)
        .lean(),
      User.find({ isActive: true, streak: { $gt: 0 } })
        .select('name streak level')
        .sort({ streak: -1 })
        .limit(safeLimit)
        .lean(),
      User.countDocuments({
        isActive: true,
        totalPoints: { $gt: userTotalPoints || 0 },
        ...dateFilter
      }),
      User.countDocuments({
        isActive: true,
        streak: { $gt: userStreak || 0 }
      })
    ]);

    return {
      status: 200,
      body: {
        success: true,
        leaderboard: {
          byPoints: {
            top: topByPoints,
            userRank: userPointsCount + 1
          },
          byStreak: {
            top: topByStreak,
            userRank: userStreakCount + 1
          }
        },
        period
      }
    };
  }

  static async getLevelProgress(userId) {
    const user = await User.findById(userId);
    const levelProgress = GamificationService.calculateLevelProgress(user.totalPoints);

    const nextLevelRewards = {
      virtuoso: [
        'Acesso a módulos intermediários',
        'Novos desafios semanais',
        'Badge de Músico Virtuoso'
      ],
      maestro: [
        'Acesso a todos os módulos',
        'Desafios especiais de IA',
        'Badge de Mestre Musical',
        'Certificado de conclusão'
      ]
    };

    return {
      status: 200,
      body: {
        success: true,
        levelProgress: {
          ...levelProgress,
          rewards: levelProgress.nextLevel ? nextLevelRewards[levelProgress.nextLevel] : []
        }
      }
    };
  }

  static async getModuleProgress(userId) {
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Usuário não encontrado'
        }
      };
    }

    let levelQuery = {};

    if (user.level === 'maestro') {
      levelQuery = { level: { $in: ['aprendiz', 'virtuoso', 'maestro'] } };
    } else if (user.level === 'virtuoso') {
      levelQuery = { level: { $in: ['aprendiz', 'virtuoso'] } };
    } else {
      levelQuery = { level: 'aprendiz' };
    }

    console.log(`🔍 Buscando módulos para progresso com filtro:`, levelQuery);

    const modulesInLevel = await Module.find({
      ...levelQuery,
      isActive: true
    }).select('_id title quizzes');

    const completedQuizIds = user.completedQuizzes
      .filter((cq) => cq.passed)
      .map((cq) => cq.quizId.toString());

    let completedModulesCount = 0;
    const moduleProgress = modulesInLevel.map((module) => {
      const moduleQuizIds = module.quizzes.map((quiz) => quiz.toString());
      const completedQuizzesInModule = moduleQuizIds.filter((quizId) =>
        completedQuizIds.includes(quizId)
      );

      const isCompleted =
        moduleQuizIds.length > 0 && completedQuizzesInModule.length === moduleQuizIds.length;

      if (isCompleted) {
        completedModulesCount++;
      }

      return {
        moduleId: module._id,
        title: module.title,
        totalQuizzes: moduleQuizIds.length,
        completedQuizzes: completedQuizzesInModule.length,
        isCompleted
      };
    });

    let responseData = {
      success: true,
      level: user.level,
      totalModules: modulesInLevel.length,
      completedModules: completedModulesCount,
      progress: `${completedModulesCount}/${modulesInLevel.length}`,
      moduleDetails: moduleProgress
    };

    if (user.level === 'maestro' && modulesInLevel.length === 0) {
      responseData = {
        success: true,
        level: 'Maestro',
        totalModules: 0,
        completedModules: 0,
        progress: '0/0',
        moduleDetails: [],
        message: 'Parabéns! Você atingiu o nível máximo. Todos os módulos foram concluídos!'
      };
    }

    return {
      status: 200,
      body: responseData
    };
  }

  static async getCategoryCompletion(userId, { level } = {}) {
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Usuário não encontrado'
        }
      };
    }

    let levelQuery = {};

    if (level) {
      levelQuery = { level };
    } else if (user.level === 'maestro') {
      levelQuery = { level: { $in: ['aprendiz', 'virtuoso', 'maestro'] } };
    } else if (user.level === 'virtuoso') {
      levelQuery = { level: { $in: ['aprendiz', 'virtuoso'] } };
    } else {
      levelQuery = { level: 'aprendiz' };
    }

    console.log(`🔍 Buscando módulos com filtro:`, levelQuery);

    const modulesInLevel = await Module.find({
      ...levelQuery,
      isActive: true
    }).select('_id title category quizzes');

    const completedQuizIds = user.completedQuizzes
      .filter((cq) => cq.passed)
      .map((cq) => cq.quizId.toString());

    const categoryCompletion = {};

    modulesInLevel.forEach((module) => {
      const category = module.category;

      if (!categoryCompletion[category]) {
        categoryCompletion[category] = {
          category,
          totalModules: 0,
          completedModules: 0,
          modules: []
        };
      }

      const moduleQuizIds = module.quizzes.map((quiz) => quiz.toString());
      const completedQuizzesInModule = moduleQuizIds.filter((quizId) =>
        completedQuizIds.includes(quizId)
      );

      const isCompleted =
        moduleQuizIds.length > 0 && completedQuizzesInModule.length === moduleQuizIds.length;

      categoryCompletion[category].totalModules++;
      if (isCompleted) {
        categoryCompletion[category].completedModules++;
      }

      categoryCompletion[category].modules.push({
        moduleId: module._id,
        title: module.title,
        isCompleted,
        totalQuizzes: moduleQuizIds.length,
        completedQuizzes: completedQuizzesInModule.length
      });
    });

    const result = Object.values(categoryCompletion).map((cat) => ({
      ...cat,
      isFullyCompleted: cat.completedModules === cat.totalModules && cat.totalModules > 0
    }));

    const responseLevel = level || user.level;

    return {
      status: 200,
      body: {
        success: true,
        level: responseLevel,
        categoryCompletion: result
      }
    };
  }
}

module.exports = GamificationService;
