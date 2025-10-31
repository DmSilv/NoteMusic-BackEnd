const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');
const {
  getStats,
  getAchievements,
  getChallenges,
  getDetailedStats,
  getLeaderboard,
  getLevelProgress,
  getModuleProgress,
  getCategoryCompletion
} = require('../controllers/gamification.controller');

// Rotas protegidas (com cache - TTL menor pois dados são específicos do usuário)
router.get('/stats', protect, cacheMiddleware(60), getStats); // Cache de 1 minuto (dados do usuário mudam frequentemente)
router.get('/achievements', protect, cacheMiddleware(120), getAchievements); // Cache de 2 minutos
router.get('/challenges', protect, cacheMiddleware(120), getChallenges); // Cache de 2 minutos
router.get('/stats/detailed', protect, cacheMiddleware(60), getDetailedStats); // Cache de 1 minuto
router.get('/leaderboard', protect, cacheMiddleware(180), getLeaderboard); // Cache de 3 minutos
router.get('/level-progress', protect, cacheMiddleware(120), getLevelProgress); // Cache de 2 minutos
router.get('/module-progress', protect, cacheMiddleware(120), getModuleProgress); // Cache de 2 minutos
router.get('/category-completion', protect, cacheMiddleware(120), getCategoryCompletion); // Cache de 2 minutos

module.exports = router;