const { validationResult } = require('express-validator');
const AuthService = require('../services/auth.service');

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const result = await AuthService.register(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Login do usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const result = await AuthService.login(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const result = await AuthService.getMe(req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar senha
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const result = await AuthService.updatePassword(req.user.id, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout do usuário (limpar sessão)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const result = await AuthService.logout(req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Esqueci minha senha
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const result = await AuthService.forgotPassword(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// @desc    Alterar senha temporária
// @route   POST /api/auth/changetemppassword
// @access  Private
exports.changeTempPassword = async (req, res, next) => {
  try {
    const result = await AuthService.changeTempPassword(req.user.id, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};
