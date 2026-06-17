const GamificationService = require('../services/gamification.service');

// @desc    Obter estatísticas básicas (público/mock)
// @route   GET /api/gamification/stats
// @access  Public
exports.getStats = async (req, res, next) => {
  try {
    console.log('🔍 getStats chamado, usuário autenticado:', !!req.user);
    console.log('🔍 req.user:', req.user);

    const result = await GamificationService.getStats(req.user?.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro em getStats:', error);
    next(error);
  }
};

// @desc    Obter conquistas do usuário
// @route   GET /api/gamification/achievements
// @access  Private
exports.getAchievements = async (req, res, next) => {
  try {
    const result = await GamificationService.getAchievements(req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Obter desafios personalizados
// @route   GET /api/gamification/challenges
// @access  Private
exports.getChallenges = async (req, res, next) => {
  try {
    const result = await GamificationService.getChallenges(req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Obter estatísticas detalhadas
// @route   GET /api/gamification/stats/detailed
// @access  Private
exports.getDetailedStats = async (req, res, next) => {
  try {
    const result = await GamificationService.getDetailedStats(req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Obter leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res, next) => {
  try {
    const result = await GamificationService.getLeaderboard(
      req.user.id,
      req.user.totalPoints,
      req.user.streak,
      req.query
    );
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Obter progresso de nível
// @route   GET /api/gamification/level-progress
// @access  Private
exports.getLevelProgress = async (req, res, next) => {
  try {
    const result = await GamificationService.getLevelProgress(req.user.id);
    return res.status(result.status).json(result.body);
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

    const result = await GamificationService.getModuleProgress(req.user.id);
    return res.status(result.status).json(result.body);
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

    const result = await GamificationService.getCategoryCompletion(req.user.id, req.query);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro em getCategoryCompletion:', error);
    next(error);
  }
};
