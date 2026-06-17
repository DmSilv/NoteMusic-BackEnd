const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const QuizAttempt = require('../models/quizAttempt.model');

// @desc    Solicitar exclusão de conta
// @route   POST /api/auth/delete-account
// @access  Private
exports.requestAccountDeletion = async (req, res, next) => {
  try {
    const { password, reason, confirmation } = req.body;
    const userId = req.user._id;

    // Validações
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Senha é obrigatória para excluir a conta'
      });
    }

    if (!confirmation || confirmation !== 'EXCLUIR CONTA') {
      return res.status(400).json({
        success: false,
        message: 'Confirmação obrigatória. Digite "EXCLUIR CONTA" para confirmar'
      });
    }

    // Buscar usuário com senha
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // Verificar se já tem exclusão solicitada
    if (user.deletionRequested) {
      return res.status(400).json({
        success: false,
        message: 'Exclusão de conta já foi solicitada',
        deletionScheduledFor: user.deletionScheduledFor
      });
    }

    // Solicitar exclusão
    await user.requestAccountDeletion(reason);

    console.log(`🗑️ Exclusão de conta solicitada para: ${user.email} (${user.name})`);
    console.log(`📅 Agendada para: ${user.deletionScheduledFor}`);
    console.log(`📝 Motivo: ${reason || 'Não informado'}`);

    res.json({
      success: true,
      message: 'Solicitação de exclusão realizada com sucesso',
      deletionScheduledFor: user.deletionScheduledFor,
      warning: 'Sua conta será excluída permanentemente em 7 dias. Você pode cancelar a qualquer momento fazendo login novamente.'
    });

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
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (!user.deletionRequested) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma exclusão pendente para cancelar'
      });
    }

    // Cancelar exclusão
    await user.cancelAccountDeletion();

    console.log(`✅ Exclusão de conta cancelada para: ${user.email} (${user.name})`);

    res.json({
      success: true,
      message: 'Exclusão de conta cancelada com sucesso',
      warning: 'Sua conta foi reativada e você pode continuar usando o NoteMusic normalmente.'
    });

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
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const status = {
      deletionRequested: user.deletionRequested,
      deletionRequestedAt: user.deletionRequestedAt,
      deletionScheduledFor: user.deletionScheduledFor,
      deletionReason: user.deletionReason,
      isMarkedForDeletion: user.isMarkedForDeletion(),
      daysRemaining: null
    };

    // Calcular dias restantes
    if (user.deletionScheduledFor) {
      const now = new Date();
      const diffTime = user.deletionScheduledFor - now;
      status.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    res.json({
      success: true,
      status
    });

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
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se deve ser excluído
    if (!user.shouldBeDeleted()) {
      return res.status(400).json({
        success: false,
        message: 'Conta não está marcada para exclusão ou período de graça ainda não expirou'
      });
    }

    console.log(`🗑️ Excluindo conta permanentemente: ${user.email} (${user.name})`);

    // Excluir tentativas de quiz relacionadas
    await QuizAttempt.deleteMany({ userId: userId });

    // Excluir usuário
    await User.findByIdAndDelete(userId);

    console.log(`✅ Conta excluída permanentemente: ${user.email}`);

    res.json({
      success: true,
      message: 'Conta excluída permanentemente'
    });

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
    const pendingDeletions = await User.find({
      deletionRequested: true,
      deletionScheduledFor: { $lte: new Date() }
    }).select('name email deletionRequestedAt deletionScheduledFor deletionReason');

    res.json({
      success: true,
      count: pendingDeletions.length,
      data: pendingDeletions
    });

  } catch (error) {
    console.error('❌ Erro ao listar exclusões pendentes:', error);
    next(error);
  }
};



