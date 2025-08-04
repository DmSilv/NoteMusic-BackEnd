const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const {
  getBasicInfo,
  getProfile,
  updateProfile,
  getProgress,
  getRanking,
  updateNotifications
} = require('../controllers/user.controller');

// Validações
const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
  body('email').optional().isEmail().withMessage('Email deve ter um formato válido'),
  body('currentPassword').optional().isLength({ min: 1 }).withMessage('Senha atual é obrigatória para alterar dados'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  body('level').optional().isIn(['iniciante', 'intermediario', 'avancado']),
  body('weeklyGoal').optional().isInt({ min: 1, max: 20 }).withMessage('Meta semanal deve ser entre 1 e 20')
];

// Rota pública
router.get('/basic-info', getBasicInfo);

// Rotas protegidas
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.get('/progress', protect, getProgress);
router.get('/ranking', protect, getRanking);
router.put('/notifications', protect, updateNotifications);

module.exports = router;