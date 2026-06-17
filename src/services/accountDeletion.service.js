const User = require('../models/user.model');
const QuizAttempt = require('../models/quizAttempt.model');

class AccountDeletionService {
  static async requestDeletion(userId, { password, reason, confirmation }) {
    if (!password) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Senha é obrigatória para excluir a conta'
        }
      };
    }

    if (!confirmation || confirmation !== 'EXCLUIR CONTA') {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Confirmação obrigatória. Digite "EXCLUIR CONTA" para confirmar'
        }
      };
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Usuário não encontrado'
        }
      };
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return {
        status: 401,
        body: {
          success: false,
          message: 'Senha incorreta'
        }
      };
    }

    if (user.deletionRequested) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Exclusão de conta já foi solicitada',
          deletionScheduledFor: user.deletionScheduledFor
        }
      };
    }

    await user.requestAccountDeletion(reason);

    console.log(`🗑️ Exclusão de conta solicitada para: ${user.email} (${user.name})`);
    console.log(`📅 Agendada para: ${user.deletionScheduledFor}`);
    console.log(`📝 Motivo: ${reason || 'Não informado'}`);

    return {
      status: 200,
      body: {
        success: true,
        message: 'Solicitação de exclusão realizada com sucesso',
        deletionScheduledFor: user.deletionScheduledFor,
        warning:
          'Sua conta será excluída permanentemente em 7 dias. Você pode cancelar a qualquer momento fazendo login novamente.'
      }
    };
  }

  static async cancelDeletion(userId) {
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Usuário não encontrado'
        }
      };
    }

    if (!user.deletionRequested) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Nenhuma exclusão pendente para cancelar'
        }
      };
    }

    await user.cancelAccountDeletion();

    console.log(`✅ Exclusão de conta cancelada para: ${user.email} (${user.name})`);

    return {
      status: 200,
      body: {
        success: true,
        message: 'Exclusão de conta cancelada com sucesso',
        warning: 'Sua conta foi reativada e você pode continuar usando o NoteMusic normalmente.'
      }
    };
  }

  static async getDeletionStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Usuário não encontrado'
        }
      };
    }

    const status = {
      deletionRequested: user.deletionRequested,
      deletionRequestedAt: user.deletionRequestedAt,
      deletionScheduledFor: user.deletionScheduledFor,
      deletionReason: user.deletionReason,
      isMarkedForDeletion: user.isMarkedForDeletion(),
      daysRemaining: null
    };

    if (user.deletionScheduledFor) {
      const now = new Date();
      const diffTime = user.deletionScheduledFor - now;
      status.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      status: 200,
      body: {
        success: true,
        status
      }
    };
  }

  static async permanentlyDeleteAccount(userId) {
    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Usuário não encontrado'
        }
      };
    }

    if (!user.shouldBeDeleted()) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Conta não está marcada para exclusão ou período de graça ainda não expirou'
        }
      };
    }

    console.log(`🗑️ Excluindo conta permanentemente: ${user.email} (${user.name})`);

    await QuizAttempt.deleteMany({ userId });

    await User.findByIdAndDelete(userId);

    console.log(`✅ Conta excluída permanentemente: ${user.email}`);

    return {
      status: 200,
      body: {
        success: true,
        message: 'Conta excluída permanentemente'
      }
    };
  }

  static async getPendingDeletions() {
    const pendingDeletions = await User.find({
      deletionRequested: true,
      deletionScheduledFor: { $lte: new Date() }
    }).select('name email deletionRequestedAt deletionScheduledFor deletionReason');

    return {
      status: 200,
      body: {
        success: true,
        count: pendingDeletions.length,
        data: pendingDeletions
      }
    };
  }
}

module.exports = AccountDeletionService;
