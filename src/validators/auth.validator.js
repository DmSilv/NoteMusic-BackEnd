const { body } = require('express-validator');
const { isValidEmailDomain, isRespectfulName } = require('./common.validator');

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
  body('level').optional().isIn(['aprendiz', 'virtuoso', 'maestro']),
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .custom(isValidEmailDomain)
    .withMessage('Use um e-mail de provedor válido (Gmail, Outlook, Yahoo, etc.)'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres'),
];

const changeTempPasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres'),
];

const accountDeletionValidation = [
  body('password').notEmpty().withMessage('Senha é obrigatória para excluir a conta'),
  body('confirmation').equals('EXCLUIR CONTA').withMessage('Confirmação obrigatória. Digite "EXCLUIR CONTA" para confirmar'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Motivo deve ter no máximo 500 caracteres'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .custom(isValidEmailDomain)
    .withMessage('Use um e-mail de provedor válido (Gmail, Outlook, Yahoo, etc.)'),
];

const resetPasswordValidation = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .custom(isValidEmailDomain)
    .withMessage('Use um e-mail de provedor válido (Gmail, Outlook, Yahoo, etc.)'),
  body('resetCode')
    .trim()
    .notEmpty().withMessage('Código de verificação é obrigatório')
    .isLength({ min: 6, max: 6 }).withMessage('Código deve ter 6 dígitos')
    .isNumeric().withMessage('Código deve conter apenas números'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('A confirmação da senha não confere'),
];

module.exports = {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  changeTempPasswordValidation,
  accountDeletionValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
