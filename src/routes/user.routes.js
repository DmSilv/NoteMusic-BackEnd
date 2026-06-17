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
const { isValidEmailDomain, isRespectfulName } = require('../validators/common.validator');

// Validações
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nome não pode ser vazio')
    .isLength({ min: 2, max: 15 })
    .withMessage('Nome deve ter entre 2 e 15 caracteres (apenas primeiro nome)')
    .custom(isRespectfulName)
    .withMessage('Por favor, escolha um nome respeitoso'),
  body('email')
    .optional()
    .isEmail().withMessage('Email deve ter um formato válido')
    .custom(isValidEmailDomain)
    .withMessage('Use um e-mail de provedor válido (Gmail, Outlook, Yahoo, etc.)'),
  body('currentPassword').optional().isLength({ min: 1 }).withMessage('Senha atual é obrigatória para alterar dados'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  body('level').optional().isIn(['aprendiz', 'virtuoso', 'maestro']),
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