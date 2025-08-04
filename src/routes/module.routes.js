const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getModules,
  getModule,
  completeModule,
  getCategories,
  getNextRecommended
} = require('../controllers/module.controller');

// Rotas públicas
router.get('/', getModules);
router.get('/categories', getCategories);

// Rotas protegidas
router.get('/next-recommended', protect, getNextRecommended);
router.get('/:id', protect, getModule);
router.post('/:id/complete', protect, completeModule);

module.exports = router;