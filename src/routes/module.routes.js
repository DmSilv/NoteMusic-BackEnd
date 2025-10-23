const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getModules,
  getModule,
  completeModule,
  getCategories,
  getNextModule,
  getModulesByLevel,
  getModuleStats
} = require('../controllers/module.controller');

// Rotas públicas
router.get('/', getModules);
router.get('/categories', getCategories);
router.get('/stats', getModuleStats);
router.get('/levels/:level', getModulesByLevel);

// Rotas protegidas
router.get('/next', protect, getNextModule);
router.get('/:id', protect, getModule);
router.post('/:id/complete', protect, completeModule);

module.exports = router;