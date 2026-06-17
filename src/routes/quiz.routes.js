const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { submitQuizValidation } = require('../validators/quiz.validator');
const {
  getQuiz,
  getQuizByModule,
  validateQuestion,
  submitQuiz,
  submitQuizPrivate,
  getQuizHistory,
  getDailyChallenge,
  getDailyChallengeInfo,
  getQuizCompletionStatus,
  getQuizAttemptsStatus,
  getQuizStats,
  unlockDailyChallenge
} = require('../controllers/quiz.controller');

// Rotas literais ANTES de parâmetros dinâmicos

router.get('/daily-challenge', getDailyChallenge);
router.get('/daily-challenge-info', getDailyChallengeInfo);

router.get('/history', protect, getQuizHistory);
router.get('/stats', protect, getQuizStats);
router.post('/unlock-daily-challenge', protect, unlockDailyChallenge);
router.get('/module/:moduleId', protect, getQuizByModule);
router.post('/:quizId/submit/private', protect, submitQuizValidation, validate, submitQuizPrivate);

router.get('/:moduleId', protect, getQuiz);
router.get('/:quizId/completion-status', protect, getQuizCompletionStatus);
router.get('/:quizId/attempts-status', protect, getQuizAttemptsStatus);
router.post('/:quizId/validate/:questionIndex', protect, validateQuestion);

if (process.env.NODE_ENV !== 'production') {
  router.post('/:quizId/submit', submitQuizValidation, validate, submitQuiz);
}

module.exports = router;
