const { body } = require('express-validator');
const { isValidEmailDomain, isRespectfulName } = require('./common.validator');

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
  // level não é aceito do cliente — evita mass assignment / escalação de progresso
  body('weeklyGoal').optional().isInt({ min: 1, max: 20 }).withMessage('Meta semanal deve ser entre 1 e 20'),
];

module.exports = {
  updateProfileValidation,
};
