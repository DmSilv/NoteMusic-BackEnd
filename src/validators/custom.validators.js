const { body, param, query } = require('express-validator');
const { USER_LEVELS, MODULE_CATEGORIES, LIMITS } = require('../utils/constants');

// Validações reutilizáveis

exports.validateEmail = () => 
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido');

exports.validatePassword = () =>
  body('password')
    .isLength({ min: LIMITS.MIN_PASSWORD_LENGTH })
    .withMessage(`Senha deve ter no mínimo ${LIMITS.MIN_PASSWORD_LENGTH} caracteres`)
    .matches(/\d/)
    .withMessage('Senha deve conter pelo menos um número');

exports.validateLevel = () =>
  body('level')
    .optional()
    .isIn(Object.values(USER_LEVELS))
    .withMessage('Nível inválido');

exports.validateCategory = () =>
  query('category')
    .optional()
    .isIn(Object.values(MODULE_CATEGORIES))
    .withMessage('Categoria inválida');

exports.validatePagination = () => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: LIMITS.MAX_PAGE_LIMIT })
    .withMessage(`Limite deve ser entre 1 e ${LIMITS.MAX_PAGE_LIMIT}`)
];

exports.validateObjectId = (field) =>
  param(field)
    .isMongoId()
    .withMessage('ID inválido');

exports.validateWeeklyGoal = () =>
  body('weeklyGoal')
    .optional()
    .isInt({ min: LIMITS.MIN_WEEKLY_GOAL, max: LIMITS.MAX_WEEKLY_GOAL })
    .withMessage(`Meta semanal deve ser entre ${LIMITS.MIN_WEEKLY_GOAL} e ${LIMITS.MAX_WEEKLY_GOAL}`);

exports.sanitizeName = () =>
  body('name')
    .trim()
    .escape()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres');