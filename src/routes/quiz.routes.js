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

// Validação alinhada ao formato do frontend: { answers: number[], timeSpent?: number }
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

// ⚠️ Rotas literais DEVEM vir ANTES de rotas com parâmetros dinâmicos (/:id)
// Caso contrário, Express trata "history" e "stats" como IDs de módulo

// Rotas públicas
router.get('/daily-challenge', getDailyChallenge);
router.get('/daily-challenge-info', getDailyChallengeInfo);
router.get('/module/:moduleId', getQuizByModule);

// Rotas protegidas — literais primeiro
router.get('/history', protect, getQuizHistory);
router.get('/stats', protect, getQuizStats);
router.post('/unlock-daily-challenge', protect, unlockDailyChallenge);
router.post('/:quizId/submit/private', protect, submitQuizValidation, validate, submitQuizPrivate);

// Rotas com parâmetros dinâmicos — por último
router.get('/:moduleId', getQuiz);
router.get('/:quizId/completion-status', protect, getQuizCompletionStatus);
router.get('/:quizId/attempts-status', protect, getQuizAttemptsStatus);
router.post('/:quizId/submit', submitQuizValidation, validate, submitQuiz);
router.post('/:quizId/validate/:questionIndex', validateQuestion);

module.exports = router;
