const AccountDeletionService = require('../services/accountDeletion.service');

// @desc    Solicitar exclusão de conta
// @route   POST /api/auth/delete-account
// @access  Private
exports.requestAccountDeletion = async (req, res, next) => {
  try {
    const result = await AccountDeletionService.requestDeletion(req.user._id, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao solicitar exclusão de conta:', error);
    next(error);
  }
};

// @desc    Cancelar exclusão de conta
// @route   POST /api/auth/cancel-deletion
// @access  Private
exports.cancelAccountDeletion = async (req, res, next) => {
  try {
    const result = await AccountDeletionService.cancelDeletion(req.user._id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao cancelar exclusão de conta:', error);
    next(error);
  }
};

// @desc    Verificar status de exclusão
// @route   GET /api/auth/deletion-status
// @access  Private
exports.getDeletionStatus = async (req, res, next) => {
  try {
    const result = await AccountDeletionService.getDeletionStatus(req.user._id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao verificar status de exclusão:', error);
    next(error);
  }
};

// @desc    Excluir conta permanentemente (admin)
// @route   DELETE /api/auth/delete-account/:userId
// @access  Private (Admin)
exports.permanentlyDeleteAccount = async (req, res, next) => {
  try {
    const result = await AccountDeletionService.permanentlyDeleteAccount(req.params.userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao excluir conta permanentemente:', error);
    next(error);
  }
};

// @desc    Listar contas marcadas para exclusão (admin)
// @route   GET /api/auth/pending-deletions
// @access  Private (Admin)
exports.getPendingDeletions = async (req, res, next) => {
  try {
    const result = await AccountDeletionService.getPendingDeletions();
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao listar exclusões pendentes:', error);
    next(error);
  }
};
