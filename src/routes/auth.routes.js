const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');

// Validações
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('level').optional().isIn(['iniciante', 'intermediario', 'avancado'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
];

// Rotas públicas
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgotpassword', forgotPassword);

// Rotas privadas
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePasswordValidation, updatePassword);

module.exports = router;