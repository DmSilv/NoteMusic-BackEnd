const { body } = require('express-validator');

const submitQuizValidation = [
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Respostas devem ser um array'),
  body('answers.*')
    .custom((value) => {
      const numericValue = Number(value);
      if (Number.isInteger(numericValue) && numericValue >= 0) {
        return true;
      }
      throw new Error('Cada resposta deve ser um índice numérico válido');
    }),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Tempo deve ser um número positivo'),
];

module.exports = {
  submitQuizValidation,
};
