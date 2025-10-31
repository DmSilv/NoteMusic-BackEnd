const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');
const {
  getModules,
  getModule,
  completeModule,
  getCategories,
  getCategoriesWithModules,
  getNextModule,
  getModulesByLevel,
  getModuleStats
} = require('../controllers/module.controller');

// ⚠️ IMPORTANTE: Rotas específicas DEVEM vir ANTES de rotas com parâmetros dinâmicos (/:id)
// Caso contrário, o Express faz match com :id primeiro

// Rotas públicas (com cache para melhor performance)
router.get('/', cacheMiddleware(180), getModules); // Cache de 3 minutos
router.get('/categories', cacheMiddleware(300), getCategories); // Cache de 5 minutos (raramente muda)
router.get('/categories-with-modules', cacheMiddleware(180), getCategoriesWithModules); // Cache de 3 minutos - OTIMIZADO
router.get('/stats', cacheMiddleware(300), getModuleStats); // Cache de 5 minutos
router.get('/levels/:level', cacheMiddleware(180), getModulesByLevel); // Cache de 3 minutos

// Rotas protegidas (específicas primeiro)
router.get('/next', protect, getNextModule);

// Rotas com parâmetros dinâmicos (DEVEM vir por último)
router.get('/:id', protect, getModule);
router.post('/:id/complete', protect, completeModule);

module.exports = router;