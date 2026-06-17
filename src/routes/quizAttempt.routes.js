const express = require('express');
const router = express.Router();
const quizAttemptController = require('../controllers/quizAttempt.controller');
const { protect } = require('../middlewares/auth');
const requireAdminSecret = require('../middlewares/adminSecret');

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

// Limpeza automática (admin / cron)
router.post('/cleanup', requireAdminSecret, quizAttemptController.cleanupExpiredAttempts);

// Resetar tentativas (admin)
router.post('/reset', requireAdminSecret, quizAttemptController.resetQuizAttempts);

module.exports = router;
