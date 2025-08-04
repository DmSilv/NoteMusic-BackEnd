const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getStats,
  getAchievements,
  getChallenges,
  getDetailedStats,
  getLeaderboard,
  getLevelProgress
} = require('../controllers/gamification.controller');

// Rota pública
router.get('/stats', getStats);

// Rotas protegidas
router.get('/achievements', protect, getAchievements);
router.get('/challenges', protect, getChallenges);
router.get('/stats/detailed', protect, getDetailedStats);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/level-progress', protect, getLevelProgress);

module.exports = router;