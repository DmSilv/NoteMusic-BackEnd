const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');
const {
  getModules,
  getModule,
  completeModule,
  getCategories,
  getNextModule,
  getModulesByLevel,
  getModuleStats
} = require('../controllers/module.controller');

// Rotas públicas (com cache para melhor performance)
router.get('/', cacheMiddleware(180), getModules); // Cache de 3 minutos
router.get('/categories', cacheMiddleware(300), getCategories); // Cache de 5 minutos (raramente muda)
router.get('/stats', cacheMiddleware(300), getModuleStats); // Cache de 5 minutos
router.get('/levels/:level', cacheMiddleware(180), getModulesByLevel); // Cache de 3 minutos

// Rotas protegidas
router.get('/next', protect, getNextModule);
router.get('/:id', protect, getModule);
router.post('/:id/complete', protect, completeModule);

module.exports = router;