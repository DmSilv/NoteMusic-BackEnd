const ModuleService = require('../services/module.service');

// @desc    Listar todos os módulos
// @route   GET /api/modules
// @access  Public
exports.getModules = async (req, res, next) => {
  try {
    const result = await ModuleService.listModules(req.query);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao buscar módulos:', error);
    next(error);
  }
};

// @desc    Obter módulo específico
// @route   GET /api/modules/:id
// @access  Private
exports.getModule = async (req, res, next) => {
  try {
    const result = await ModuleService.getModuleById(req.params.id, req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao buscar módulo específico:', error);
    next(error);
  }
};

// @desc    Marcar módulo como completo (COM VALIDAÇÃO RIGOROSA)
// @route   POST /api/modules/:id/complete
// @access  Private
exports.completeModule = async (req, res, next) => {
  try {
    const result = await ModuleService.completeModule(req.params.id, req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao completar módulo:', error);
    next(error);
  }
};

// @desc    Obter próximo módulo recomendado
// @route   GET /api/modules/next
// @access  Private
exports.getNextModule = async (req, res, next) => {
  try {
    const result = await ModuleService.getNextModule(req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao buscar próximo módulo:', error);
    next(error);
  }
};

// @desc    Obter categorias disponíveis (OTIMIZADO - apenas contagem)
// @route   GET /api/modules/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const result = await ModuleService.getCategories();
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    next(error);
  }
};

// @desc    Obter categorias COM módulos agrupados (OTIMIZADO - UMA única requisição)
// @route   GET /api/modules/categories-with-modules
// @access  Public
exports.getCategoriesWithModules = async (req, res, next) => {
  try {
    const result = await ModuleService.getCategoriesWithModules();
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao buscar categorias com módulos:', error);
    next(error);
  }
};

// @desc    Obter módulos por nível
// @route   GET /api/modules/levels/:level
// @access  Public
exports.getModulesByLevel = async (req, res, next) => {
  try {
    const result = await ModuleService.getModulesByLevel(req.params.level);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(`❌ Erro ao buscar módulos do nível ${req.params.level}:`, error);
    next(error);
  }
};

// @desc    Obter estatísticas de módulos
// @route   GET /api/modules/stats
// @access  Public
exports.getModuleStats = async (req, res, next) => {
  try {
    const result = await ModuleService.getModuleStats();
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de módulos:', error);
    next(error);
  }
};
