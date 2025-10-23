const User = require('../models/User');
const GamificationService = require('../services/gamification.service');

// @desc    Obter estatísticas básicas (público/mock)
// @route   GET /api/gamification/stats
// @access  Public
exports.getStats = async (req, res, next) => {
  try {
    console.log('🔍 getStats chamado, usuário autenticado:', !!req.user);
    console.log('🔍 req.user:', req.user);
    
    // Buscar dados reais se o usuário estiver autenticado
    if (req.user) {
      console.log('👤 Buscando dados reais para usuário:', req.user.id);
      console.log('👤 Dados do usuário na requisição:', {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        level: req.user.level
      });
      
      const user = await User.findById(req.user.id)
        .populate('completedModules.moduleId', 'title category points')
        .populate('completedQuizzes.quizId', 'title');

      if (!user) {
        console.log('❌ Usuário não encontrado no banco');
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      console.log('✅ Usuário encontrado:', {
        id: user._id,
        name: user.name,
        level: user.level,
        totalPoints: user.totalPoints,
        streak: user.streak
      });

      const stats = calculateUserStats(user);
      
      console.log('📊 Estatísticas calculadas:', {
        level: stats.level,
        totalPoints: stats.totalPoints,
        streak: stats.streak,
        levelProgress: stats.levelProgress
      });
      
      return res.json({
        success: true,
        stats
      });
    }

    console.log('📱 Usuário não autenticado, retornando dados mock');
    
    // Retornar estatísticas mock para usuários não autenticados
    const mockStats = {
      level: 'Aprendiz',
      progress: 0,
      streak: 0,
      achievements: [],
      challenges: [],
      totalModules: 16, // Atualizado para 16 módulos
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

    res.json({
      success: true,
      stats: mockStats
    });
  } catch (error) {
    console.error('❌ Erro em getStats:', error);
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
  
  // ✅ CALCULAR TAXA DE APROVAÇÃO CORRETAMENTE usando o campo 'passed'
  const passedQuizzes = user.completedQuizzes.filter(q => q.passed === true).length;
  const quizPassRate = totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0;
  
  console.log(`📊 Taxa de aprovação: ${passedQuizzes}/${totalQuizzes} = ${quizPassRate}%`);
  
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
  
  console.log('🔍 Calculando progresso para usuário:', {
    level: user.level,
    completedModules,
    totalPoints
  });
  
  switch (user.level) {
    case 'aprendiz':
      const progressModules = Math.min((completedModules / 2) * 100, 100);
      const progressPoints = Math.min((totalPoints / 150) * 100, 100);
      const maxProgress = Math.max(progressModules, progressPoints);
      
      return {
        current: 'Aprendiz',
        next: 'Virtuoso',
        percentage: Math.round(maxProgress),
        requirements: 'Complete 2 módulos OU ganhe 150 pontos',
        modulesProgress: { current: completedModules, required: 2, percentage: Math.round(progressModules) },
        pointsProgress: { current: totalPoints, required: 150, percentage: Math.round(progressPoints) }
      };
    
    case 'virtuoso':
      const progressModulesInt = Math.min((completedModules / 4) * 100, 100);
      const progressPointsInt = Math.min((totalPoints / 300) * 100, 100);
      const maxProgressInt = Math.max(progressModulesInt, progressPointsInt);
      
      return {
        current: 'Virtuoso',
        next: 'Maestro',
        percentage: Math.round(maxProgressInt),
        requirements: 'Complete 4 módulos OU ganhe 300 pontos',
        modulesProgress: { current: completedModules, required: 4, percentage: Math.round(progressModulesInt) },
        pointsProgress: { current: totalPoints, required: 300, percentage: Math.round(progressPointsInt) }
      };
    
    case 'maestro':
      return {
        current: 'Maestro',
        next: 'Nível Máximo',
        percentage: 100,
        requirements: 'Nível máximo atingido! Parabéns!',
        modulesProgress: { current: completedModules, required: completedModules || 1, percentage: 100 },
        pointsProgress: { current: totalPoints, required: totalPoints || 1, percentage: 100 }
      };
    
    default:
      console.log('⚠️ Nível não reconhecido:', user.level);
      return {
        current: 'Aprendiz',
        next: 'Virtuoso',
        percentage: 0,
        requirements: 'Complete 3 módulos OU ganhe 300 pontos',
        modulesProgress: { current: completedModules, required: 3, percentage: 0 },
        pointsProgress: { current: totalPoints, required: 300, percentage: 0 }
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
    'aprendiz': 'Aprendiz',
    'virtuoso': 'Virtuoso', 
    'maestro': 'Maestro'
  };
  return names[level] || 'Aprendiz';
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

// @desc    Obter progresso de conclusão de módulos por nível
// @route   GET /api/gamification/module-progress
// @access  Private
exports.getModuleProgress = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Buscar módulos do nível atual do usuário ou todos os níveis acessíveis
    const Module = require('../models/Module');
    
    // Definir quais níveis buscar baseado no nível do usuário
    let levelQuery = {};
    
    if (user.level === 'maestro') {
      // Se o usuário é Maestro, buscar todos os níveis
      levelQuery = { level: { $in: ['aprendiz', 'virtuoso', 'maestro'] } };
    } else if (user.level === 'virtuoso') {
      // Se o usuário é Virtuoso, buscar níveis Aprendiz e Virtuoso
      levelQuery = { level: { $in: ['aprendiz', 'virtuoso'] } };
    } else {
      // Se o usuário é Aprendiz, buscar apenas nível Aprendiz
      levelQuery = { level: 'aprendiz' };
    }
    
    console.log(`🔍 Buscando módulos para progresso com filtro:`, levelQuery);
    
    const modulesInLevel = await Module.find({ 
      ...levelQuery,
      isActive: true 
    }).select('_id title quizzes');

    // Buscar quizzes completados do usuário
    const completedQuizIds = user.completedQuizzes
      .filter(cq => cq.passed)
      .map(cq => cq.quizId.toString());

    // Calcular módulos completados (todos os quizzes do módulo foram concluídos)
    let completedModulesCount = 0;
    const moduleProgress = modulesInLevel.map(module => {
      const moduleQuizIds = module.quizzes.map(quiz => quiz.toString());
      const completedQuizzesInModule = moduleQuizIds.filter(quizId => 
        completedQuizIds.includes(quizId)
      );
      
      const isCompleted = moduleQuizIds.length > 0 && 
        completedQuizzesInModule.length === moduleQuizIds.length;
      
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

    // Tratamento especial para usuário Maestro
    let responseData = {
      success: true,
      level: user.level,
      totalModules: modulesInLevel.length,
      completedModules: completedModulesCount,
      progress: `${completedModulesCount}/${modulesInLevel.length}`,
      moduleDetails: moduleProgress
    };

    // Se o usuário é Maestro e não há módulos no nível atual, mostrar mensagem especial
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

    res.json(responseData);

  } catch (error) {
    console.error('❌ Erro em getModuleProgress:', error);
    next(error);
  }
};

// @desc    Verificar conclusão de módulos por categoria
// @route   GET /api/gamification/category-completion
// @access  Private
exports.getCategoryCompletion = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const { level } = req.query; // Nível filtrado (opcional)

    // Buscar módulos do nível especificado ou de todos os níveis acessíveis ao usuário
    const Module = require('../models/Module');
    
    // Definir quais níveis buscar
    let levelQuery = {};
    
    if (level) {
      // Se um nível específico foi solicitado, usar apenas esse
      levelQuery = { level };
    } else if (user.level === 'maestro') {
      // Se o usuário é Maestro, buscar todos os níveis
      levelQuery = { level: { $in: ['aprendiz', 'virtuoso', 'maestro'] } };
    } else if (user.level === 'virtuoso') {
      // Se o usuário é Virtuoso, buscar níveis Aprendiz e Virtuoso
      levelQuery = { level: { $in: ['aprendiz', 'virtuoso'] } };
    } else {
      // Se o usuário é Aprendiz, buscar apenas nível Aprendiz
      levelQuery = { level: 'aprendiz' };
    }
    
    console.log(`🔍 Buscando módulos com filtro:`, levelQuery);
    
    const modulesInLevel = await Module.find({ 
      ...levelQuery,
      isActive: true 
    }).select('_id title category quizzes');

    // Buscar quizzes completados do usuário
    const completedQuizIds = user.completedQuizzes
      .filter(cq => cq.passed)
      .map(cq => cq.quizId.toString());

    // Agrupar módulos por categoria e verificar conclusão
    const categoryCompletion = {};
    
    modulesInLevel.forEach(module => {
      const category = module.category;
      
      if (!categoryCompletion[category]) {
        categoryCompletion[category] = {
          category,
          totalModules: 0,
          completedModules: 0,
          modules: []
        };
      }
      
      const moduleQuizIds = module.quizzes.map(quiz => quiz.toString());
      const completedQuizzesInModule = moduleQuizIds.filter(quizId => 
        completedQuizIds.includes(quizId)
      );
      
      const isCompleted = moduleQuizIds.length > 0 && 
        completedQuizzesInModule.length === moduleQuizIds.length;
      
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

    // Converter para array
    const result = Object.values(categoryCompletion).map(cat => ({
      ...cat,
      isFullyCompleted: cat.completedModules === cat.totalModules && cat.totalModules > 0
    }));

    // Usar o nível do filtro ou o nível do usuário para a resposta
    const responseLevel = level || user.level;
    
    res.json({
      success: true,
      level: responseLevel,
      categoryCompletion: result
    });

  } catch (error) {
    console.error('❌ Erro em getCategoryCompletion:', error);
    next(error);
  }
};