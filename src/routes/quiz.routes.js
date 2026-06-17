const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
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

const submitQuizValidation = [
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Respostas devem ser um array'),
  body('answers.*')
    .custom((value) => {
      const numericValue = Number(value);
      if (Number.isInteger(numericValue) && numericValue >= 0) {
        return true;
      }
      throw new Error('Cada resposta deve ser um índice numérico válido');
    }),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Tempo deve ser um número positivo'),
];

// Rotas literais ANTES de parâmetros dinâmicos

// Públicas — desafio diário (sem respostas corretas expostas)
router.get('/daily-challenge', getDailyChallenge);
router.get('/daily-challenge-info', getDailyChallengeInfo);

// Protegidas — literais
router.get('/history', protect, getQuizHistory);
router.get('/stats', protect, getQuizStats);
router.post('/unlock-daily-challenge', protect, unlockDailyChallenge);
router.get('/module/:moduleId', protect, getQuizByModule);
router.post('/:quizId/submit/private', protect, submitQuizValidation, validate, submitQuizPrivate);

// Parametrizadas — por último
router.get('/:moduleId', protect, getQuiz);
router.get('/:quizId/completion-status', protect, getQuizCompletionStatus);
router.get('/:quizId/attempts-status', protect, getQuizAttemptsStatus);
router.post('/:quizId/validate/:questionIndex', protect, validateQuestion);

// Submit público legado — apenas em desenvolvimento (app usa /submit/private)
if (process.env.NODE_ENV !== 'production') {
  router.post('/:quizId/submit', submitQuizValidation, validate, submitQuiz);
}

module.exports = router;
