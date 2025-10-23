const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  changeTempPassword
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');
const { checkTempPassword, requireTempPassword } = require('../middlewares/tempPasswordCheck');

// ✅ Lista de domínios de email válidos
const VALID_EMAIL_DOMAINS = [
  // Gmail
  'gmail.com', 'googlemail.com',
  // Microsoft
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  // Yahoo
  'yahoo.com', 'yahoo.com.br', 'ymail.com',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // Outros provedores
  'protonmail.com', 'proton.me', 'aol.com', 'zoho.com',
  // Brasileiros
  'uol.com.br', 'bol.com.br', 'terra.com.br',
  // Educacionais
  'edu', 'edu.br', 'ac.uk', 'edu.au'
];

// ✅ Lista de palavras inapropriadas
const INAPPROPRIATE_WORDS = [
  'porra', 'merda', 'caralho', 'puta', 'fdp', 'pqp', 'vsf', 'krl', 'crl',
  'cu', 'bosta', 'buceta', 'pica', 'pau', 'viado', 'bicha', 'puto',
  'idiota', 'burro', 'babaca', 'imbecil', 'cretino', 'otario', 'otário',
  'vagabundo', 'safado', 'desgraça', 'desgraca', 'lixo',
  'sexo', 'porn', 'xxx', 'nude', 'pelad',
  'maconha', 'cocaina', 'crack', 'droga',
  'fuck', 'shit', 'bitch', 'ass', 'dick', 'cock', 'damn',
  'admin', 'teste', 'test', 'null', 'undefined'
];

// ✅ Validador customizado de domínio de email
const isValidEmailDomain = (email) => {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  
  return VALID_EMAIL_DOMAINS.some(validDomain => {
    return domain === validDomain || domain.endsWith('.' + validDomain);
  });
};

// ✅ Validador de nome respeitoso
const isRespectfulName = (name) => {
  const nameLower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return !INAPPROPRIATE_WORDS.some(word => {
    const wordPattern = new RegExp(`\\b${word}\\b|${word}`, 'i');
    return wordPattern.test(nameLower);
  });
};

// Validações
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 15 })
    .withMessage('Nome deve ter entre 2 e 15 caracteres (apenas primeiro nome)')
    .custom(isRespectfulName)
    .withMessage('Por favor, escolha um nome respeitoso'),
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .custom(isValidEmailDomain)
    .withMessage('Use um e-mail de provedor válido (Gmail, Outlook, Yahoo, etc.)'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('level').optional().isIn(['aprendiz', 'virtuoso', 'maestro'])
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .custom(isValidEmailDomain)
    .withMessage('Use um e-mail de provedor válido (Gmail, Outlook, Yahoo, etc.)'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
];

const changeTempPasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
];

// Rotas públicas
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgotpassword', forgotPassword);

// Rotas privadas
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, checkTempPassword, updatePasswordValidation, updatePassword);
router.post('/changetemppassword', protect, requireTempPassword, changeTempPasswordValidation, changeTempPassword);

module.exports = router;