const { validationResult } = require('express-validator');
const UserService = require('../services/user.service');

// @desc    Obter dados básicos do usuário (público)
// @route   GET /api/users/basic-info
// @access  Public
exports.getBasicInfo = async (req, res, next) => {
  try {
    const result = UserService.getBasicInfo();
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Obter perfil do usuário
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const result = await UserService.getProfile(req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const result = await UserService.updateProfile(req.user.id, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Obter progresso do usuário
// @route   GET /api/users/progress
// @access  Private
exports.getProgress = async (req, res, next) => {
  try {
    const result = await UserService.getProgress(req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Obter ranking de usuários
// @route   GET /api/users/ranking
// @access  Private
exports.getRanking = async (req, res, next) => {
  try {
    const result = await UserService.getRanking(req.user.id, req.user.totalPoints, req.query);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar configurações de notificação
// @route   PUT /api/users/notifications
// @access  Private
exports.updateNotifications = async (req, res, next) => {
  try {
    const result = await UserService.updateNotifications(req.user.id, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};
