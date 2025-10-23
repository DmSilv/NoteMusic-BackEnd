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
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nome não pode ser vazio')
    .isLength({ min: 2, max: 15 })
    .withMessage('Nome deve ter entre 2 e 15 caracteres (apenas primeiro nome)')
    .custom((name) => {
      // ✅ Filtro de palavras inapropriadas
      const inappropriateWords = ['porra', 'merda', 'caralho', 'puta', 'fdp', 'pqp', 'vsf', 'krl', 'crl', 'cu', 'bosta', 'buceta', 'pica', 'pau', 'viado', 'bicha', 'puto', 'idiota', 'burro', 'babaca', 'imbecil', 'cretino', 'otario', 'otário', 'vagabundo', 'safado', 'desgraça', 'desgraca', 'lixo', 'sexo', 'porn', 'xxx', 'nude', 'pelad', 'maconha', 'cocaina', 'crack', 'droga', 'fuck', 'shit', 'bitch', 'ass', 'dick', 'cock', 'admin', 'teste', 'test'];
      const nameLower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const hasInappropriate = inappropriateWords.some(word => {
        const wordPattern = new RegExp(`\\b${word}\\b|${word}`, 'i');
        return wordPattern.test(nameLower);
      });
      if (hasInappropriate) {
        throw new Error('Por favor, escolha um nome respeitoso');
      }
      return true;
    }),
  body('email')
    .optional()
    .isEmail().withMessage('Email deve ter um formato válido')
    .custom((email) => {
      // ✅ Validação de domínio (mesma lista do auth.routes.js)
      const VALID_DOMAINS = ['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'yahoo.com', 'yahoo.com.br', 'ymail.com', 'icloud.com', 'me.com', 'mac.com', 'protonmail.com', 'proton.me', 'aol.com', 'zoho.com', 'uol.com.br', 'bol.com.br', 'terra.com.br', 'edu', 'edu.br', 'ac.uk', 'edu.au'];
      const domain = email.toLowerCase().split('@')[1];
      if (!domain || !VALID_DOMAINS.some(validDomain => domain === validDomain || domain.endsWith('.' + validDomain))) {
        throw new Error('Use um e-mail de provedor válido (Gmail, Outlook, Yahoo, etc.)');
      }
      return true;
    }),
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