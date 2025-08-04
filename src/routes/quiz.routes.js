const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const {
  getQuiz,
  getQuizByModule,
  submitQuiz,
  getQuizHistory,
  getDailyChallenge,
  getDailyChallengePrivate
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
router.get('/:moduleId', getQuiz);
router.post('/:quizId/submit', submitQuiz);

// Rotas protegidas
router.get('/history', protect, getQuizHistory);
router.get('/daily-challenge/private', protect, getDailyChallengePrivate);
router.get('/:moduleId/private', protect, getQuizByModule);
router.post('/:quizId/submit/private', protect, submitQuizValidation, submitQuiz);

module.exports = router;