const User = require('../models/User');
const GamificationService = require('../services/gamification.service');

// @desc    Obter estatísticas básicas (público/mock)
// @route   GET /api/gamification/stats
// @access  Public
exports.getStats = async (req, res, next) => {
  try {
    // Retornar estatísticas mock para teste
    const mockStats = {
      level: 'Aprendiz',
      progress: 0,
      streak: 0,
      achievements: [],
      challenges: [],
      totalModules: 12,
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
        next: 'Intermediário',
        percentage: 0
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