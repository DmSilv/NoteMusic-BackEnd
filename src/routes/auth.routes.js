const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  changeTempPassword
} = require('../controllers/auth.controller');
const {
  requestAccountDeletion,
  cancelAccountDeletion,
  getDeletionStatus
} = require('../controllers/accountDeletion.controller');
const { protect } = require('../middlewares/auth');
const { checkTempPassword, requireTempPassword } = require('../middlewares/tempPasswordCheck');
const { isValidEmailDomain, isRespectfulName } = require('../validators/common.validator');

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

const accountDeletionValidation = [
  body('password').notEmpty().withMessage('Senha é obrigatória para excluir a conta'),
  body('confirmation').equals('EXCLUIR CONTA').withMessage('Confirmação obrigatória. Digite "EXCLUIR CONTA" para confirmar'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Motivo deve ter no máximo 500 caracteres')
];

// Rotas públicas
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgotpassword', forgotPassword);

// Rotas privadas
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/updatepassword', protect, checkTempPassword, updatePasswordValidation, updatePassword);
router.post('/changetemppassword', protect, requireTempPassword, changeTempPasswordValidation, changeTempPassword);

// Rotas de exclusão de conta
router.post('/delete-account', protect, accountDeletionValidation, requestAccountDeletion);
router.post('/cancel-deletion', protect, cancelAccountDeletion);
router.get('/deletion-status', protect, getDeletionStatus);

// Rotas administrativas (para futuro)
// router.delete('/delete-account/:userId', protect, permanentlyDeleteAccount);
// router.get('/pending-deletions', protect, getPendingDeletions);

module.exports = router;