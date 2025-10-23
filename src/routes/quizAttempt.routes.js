const express = require('express');
const router = express.Router();
const quizAttemptController = require('../controllers/quizAttempt.controller');
const { protect } = require('../middlewares/auth');

// ✅ APLICAR MIDDLEWARE DE AUTENTICAÇÃO em todas as rotas
router.use(protect);

// ✅ VERIFICAR SE PODE TENTAR NOVAMENTE
// GET /api/quiz-attempts/check/:quizId/:moduleId
router.get('/check/:quizId/:moduleId', quizAttemptController.checkQuizAttempt);

// ✅ REGISTRAR NOVA TENTATIVA
// POST /api/quiz-attempts/register
router.post('/register', quizAttemptController.registerQuizAttempt);

// ✅ OBTER HISTÓRICO DE TENTATIVAS
// GET /api/quiz-attempts/history?moduleId=optional
router.get('/history', quizAttemptController.getQuizAttempts);

// ✅ LIMPEZA AUTOMÁTICA (pode ser chamada por cron job)
// POST /api/quiz-attempts/cleanup
router.post('/cleanup', quizAttemptController.cleanupExpiredAttempts);

// ✅ RESETAR TENTATIVAS (ADMIN)
// POST /api/quiz-attempts/reset
router.post('/reset', quizAttemptController.resetQuizAttempts);

module.exports = router;
