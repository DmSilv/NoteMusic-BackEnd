const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
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

// Validações
const submitQuizValidation = [
  body('answers').isArray().withMessage('Respostas devem ser um array'),
  body('answers.*.questionId').notEmpty().withMessage('ID da questão é obrigatório'),
  body('answers.*.answer').notEmpty().withMessage('Resposta é obrigatória'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Tempo deve ser um número positivo')
];

// Rotas públicas (para teste)
router.get('/daily-challenge', getDailyChallenge);
router.get('/daily-challenge-info', getDailyChallengeInfo);
router.get('/:moduleId', getQuiz);
router.get('/module/:moduleId', getQuizByModule);
router.post('/:quizId/submit', submitQuiz);

// Rotas protegidas
router.get('/history', protect, getQuizHistory);
router.get('/stats', protect, getQuizStats);
router.get('/:quizId/completion-status', protect, getQuizCompletionStatus);
router.get('/:quizId/attempts-status', protect, getQuizAttemptsStatus);
router.post('/:quizId/validate/:questionIndex', validateQuestion);
router.post('/:quizId/submit/private', protect, submitQuizPrivate);
router.post('/unlock-daily-challenge', protect, unlockDailyChallenge);

module.exports = router;