const User = require('../models/User');
const GamificationService = require('../services/gamification.service');

// @desc    Obter estatísticas básicas (público/mock)
// @route   GET /api/gamification/stats
// @access  Public
exports.getStats = async (req, res, next) => {
  try {
    // Buscar dados reais se o usuário estiver autenticado
    if (req.user) {
      const user = await User.findById(req.user.id)
        .populate('completedModules.moduleId', 'title category points')
        .populate('completedQuizzes.quizId', 'title');

      const stats = calculateUserStats(user);
      
      return res.json({
        success: true,
        stats
      });
    }

    // Retornar estatísticas mock para usuários não autenticados
    const mockStats = {
      level: 'Iniciante',
      progress: 0,
      streak: 0,
      achievements: [],
      challenges: [],
      totalModules: 9, // Número real de módulos
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
        current: 'Iniciante',
        next: 'Intermediário',
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

    res.json({
      success: true,
      stats: mockStats
    });
  } catch (error) {
    next(error);
  }
};

// Função para calcular estatísticas reais do usuário
const calculateUserStats = (user) => {
  const completedModules = user.completedModules.length;
  const totalQuizzes = user.completedQuizzes.length;
  
  // Calcular progresso geral baseado nos módulos completados
  const totalModules = 9; // Total de módulos disponíveis
  const progress = completedModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  
  // Calcular streak atual e máximo
  const currentStreak = user.streak || 0;
  const longestStreak = Math.max(currentStreak, user.longestStreak || 0);
  
  // Calcular média de pontuação dos quizzes
  const quizScores = user.completedQuizzes.map(q => q.score || 0);
  const averageScore = quizScores.length > 0 
    ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length * 10) // Multiplicar por 10 para porcentagem
    : 0;
  
  // Calcular atividade recente (últimos 7 dias)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const modulesLast7Days = user.completedModules.filter(m => 
    new Date(m.completedAt) > weekAgo
  ).length;
  
  const quizzesLast7Days = user.completedQuizzes.filter(q => 
    new Date(q.completedAt) > weekAgo
  ).length;
  
  // Determinar melhor categoria
  const categoryStats = {};
  user.completedModules.forEach(cm => {
    if (cm.moduleId && cm.moduleId.category) {
      categoryStats[cm.moduleId.category] = (categoryStats[cm.moduleId.category] || 0) + 1;
    }
  });
  
  const bestCategory = Object.keys(categoryStats).length > 0 
    ? Object.keys(categoryStats).reduce((a, b) => categoryStats[a] > categoryStats[b] ? a : b)
    : null;
  
  // Calcular progresso de nível
  const levelProgress = calculateLevelProgress(user);
  
  // Calcular taxa de aprovação em quizzes (assumindo 70% como nota de aprovação)
  const passedQuizzes = user.completedQuizzes.filter(q => (q.score || 0) >= 7).length;
  const quizPassRate = totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0;
  
  return {
    level: getLevelName(user.level),
    progress,
    streak: currentStreak,
    achievements: [], // TODO: Implementar conquistas
    challenges: [], // TODO: Implementar desafios
    totalModules,
    completedModules,
    weeklyGoal: user.weeklyGoal || 5,
    weeklyProgress: user.weeklyProgress || 0,
    nextAchievement: getNextAchievement(user),
    totalPoints: user.totalPoints || 0,
    averageScorePercentage: averageScore,
    bestCategory: formatCategoryName(bestCategory),
    currentStreak,
    longestStreak,
    totalStudyDays: Math.max(currentStreak, user.completedModules.length), // Estimativa
    quizPassRate,
    levelProgress,
    weeklyProgressDetail: {
      current: user.weeklyProgress || 0,
      goal: user.weeklyGoal || 5,
      percentage: Math.round(((user.weeklyProgress || 0) / (user.weeklyGoal || 5)) * 100)
    },
    recentActivity: {
      lastStudyDate: user.lastActivityDate,
      modulesLast7Days,
      quizzesLast7Days
    }
  };
};

// Função auxiliar para calcular progresso de nível
const calculateLevelProgress = (user) => {
  const completedModules = user.completedModules.length;
  const totalPoints = user.totalPoints || 0;
  
  switch (user.level) {
    case 'iniciante':
      const progressModules = Math.min((completedModules / 3) * 100, 100);
      const progressPoints = Math.min((totalPoints / 300) * 100, 100);
      const maxProgress = Math.max(progressModules, progressPoints);
      
      return {
        current: 'Iniciante',
        next: 'Intermediário',
        percentage: Math.round(maxProgress),
        requirements: 'Complete 3 módulos OU ganhe 300 pontos',
        modulesProgress: { current: completedModules, required: 3 },
        pointsProgress: { current: totalPoints, required: 300 }
      };
    
    case 'intermediario':
      const progressModulesInt = Math.min((completedModules / 6) * 100, 100);
      const progressPointsInt = Math.min((totalPoints / 600) * 100, 100);
      const maxProgressInt = Math.max(progressModulesInt, progressPointsInt);
      
      return {
        current: 'Intermediário',
        next: 'Avançado',
        percentage: Math.round(maxProgressInt),
        requirements: 'Complete 6 módulos OU ganhe 600 pontos',
        modulesProgress: { current: completedModules, required: 6 },
        pointsProgress: { current: totalPoints, required: 600 }
      };
    
    case 'avancado':
      return {
        current: 'Avançado',
        next: 'Mestre (em breve)',
        percentage: 100,
        requirements: 'Nível máximo atingido!',
        modulesProgress: { current: completedModules, required: completedModules },
        pointsProgress: { current: totalPoints, required: totalPoints }
      };
    
    default:
      return {
        current: 'Iniciante',
        next: 'Intermediário',
        percentage: 0,
        requirements: 'Complete 3 módulos OU ganhe 300 pontos'
      };
  }
};

// Função auxiliar para obter próxima conquista
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

// Função auxiliar para obter nome do nível
const getLevelName = (level) => {
  const names = {
    'iniciante': 'Iniciante',
    'intermediario': 'Intermediário', 
    'avancado': 'Avançado'
  };
  return names[level] || 'Iniciante';
};

// Função auxiliar para formatar nome da categoria
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

// @desc    Obter conquistas do usuário
// @route   GET /api/gamification/achievements
// @access  Private
exports.getAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('completedModules.moduleId', 'title category')
      .populate('completedQuizzes.quizId', 'title');

    const achievements = GamificationService.checkAchievements(user);
    
    // TODO: Salvar conquistas desbloqueadas no banco
    
    res.json({
      success: true,
      achievements,
      totalAchievements: achievements.length,
      totalPoints: achievements.reduce((sum, ach) => sum + ach.points, 0)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter desafios personalizados
// @route   GET /api/gamification/challenges
// @access  Private
exports.getChallenges = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('completedModules.moduleId')
      .populate('completedQuizzes.quizId');

    const challenges = GamificationService.generatePersonalizedChallenges(user);
    
    res.json({
      success: true,
      challenges,
      activeChallenges: challenges.filter(c => c.progress < 100).length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter estatísticas detalhadas
// @route   GET /api/gamification/stats
// @access  Private
exports.getDetailedStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('completedModules.moduleId', 'title category points')
      .populate('completedQuizzes.quizId', 'title');

    const stats = GamificationService.calculateUserStats(user);
    
    // Adicionar informações extras
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
        modulesLast7Days: user.completedModules.filter(m => {
          const date = new Date(m.completedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date > weekAgo;
        }).length,
        quizzesLast7Days: user.completedQuizzes.filter(q => {
          const date = new Date(q.completedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date > weekAgo;
        }).length
      }
    };

    res.json({
      success: true,
      stats: extraStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { period = 'all', limit = 10 } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        dateFilter = { lastActivityDate: { $gte: weekAgo } };
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        dateFilter = { lastActivityDate: { $gte: monthAgo } };
        break;
      // 'all' não precisa de filtro
    }

    // Top usuários por pontos
    const topByPoints = await User.find({ isActive: true, ...dateFilter })
      .select('name totalPoints level')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    // Top usuários por streak
    const topByStreak = await User.find({ isActive: true, streak: { $gt: 0 } })
      .select('name streak level')
      .sort({ streak: -1 })
      .limit(parseInt(limit));

    // Posição do usuário atual
    const userPointsRank = await User.countDocuments({
      isActive: true,
      totalPoints: { $gt: req.user.totalPoints },
      ...dateFilter
    }) + 1;

    const userStreakRank = await User.countDocuments({
      isActive: true,
      streak: { $gt: req.user.streak }
    }) + 1;

    res.json({
      success: true,
      leaderboard: {
        byPoints: {
          top: topByPoints,
          userRank: userPointsRank
        },
        byStreak: {
          top: topByStreak,
          userRank: userStreakRank
        }
      },
      period
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter progresso de nível
// @route   GET /api/gamification/level-progress
// @access  Private
exports.getLevelProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const levelProgress = GamificationService.calculateLevelProgress(user.totalPoints);
    
    // Adicionar recompensas do próximo nível
    const nextLevelRewards = {
      intermediario: [
        'Acesso a módulos intermediários',
        'Novos desafios semanais',
        'Badge de Músico Intermediário'
      ],
      avancado: [
        'Acesso a todos os módulos',
        'Desafios especiais de IA',
        'Badge de Mestre Musical',
        'Certificado de conclusão'
      ]
    };

    res.json({
      success: true,
      levelProgress: {
        ...levelProgress,
        rewards: levelProgress.nextLevel ? nextLevelRewards[levelProgress.nextLevel] : []
      }
    });
  } catch (error) {
    next(error);
  }
};