const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
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

// Rota protegida - precisa de autenticação
router.get('/stats', protect, getStats);

// Rotas protegidas
router.get('/achievements', protect, getAchievements);
router.get('/challenges', protect, getChallenges);
router.get('/stats/detailed', protect, getDetailedStats);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/level-progress', protect, getLevelProgress);
router.get('/module-progress', protect, getModuleProgress);
router.get('/category-completion', protect, getCategoryCompletion);

module.exports = router;