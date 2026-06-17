const QuizAttempt = require('../models/quizAttempt.model');

class QuizAttemptService {
  static async checkAttempt(userId, quizId, moduleId) {
    if (!quizId || !moduleId) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Quiz ID e Module ID são obrigatórios'
        }
      };
    }

    console.log(`🔍 Verificando tentativa para usuário ${userId} no quiz ${quizId} (módulo ${moduleId})`);

    const attemptStatus = await QuizAttempt.canAttemptQuiz(userId, quizId);

    console.log(`📊 Status da tentativa para quiz ${quizId}:`, attemptStatus);

    if (attemptStatus.reason === 'cooldown') {
      console.log(
        `⏰ Quiz ${quizId} em cooldown para usuário ${userId} - ${attemptStatus.timeRemaining}min restantes`
      );
    } else if (attemptStatus.reason === 'cooldown_expired') {
      console.log(`✅ Cooldown do quiz ${quizId} expirado para usuário ${userId} - pode tentar novamente`);
    } else if (attemptStatus.reason === 'primeira_tentativa') {
      console.log(`🆕 Usuário ${userId} pode fazer quiz ${quizId} pela primeira vez`);
    } else if (attemptStatus.reason === 'segunda_tentativa') {
      console.log(`⚠️ Usuário ${userId} pode fazer quiz ${quizId} pela segunda (última) vez`);
    }

    return {
      status: 200,
      body: {
        success: true,
        data: attemptStatus
      }
    };
  }

  static async registerAttempt(userId, { quizId, moduleId }) {
    if (!quizId || !moduleId) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Quiz ID e Module ID são obrigatórios'
        }
      };
    }

    console.log(`📝 Registrando tentativa para usuário ${userId} no quiz ${quizId} (módulo ${moduleId})`);

    const result = await QuizAttempt.registerAttempt(userId, quizId, moduleId);

    console.log(`✅ Tentativa registrada para quiz ${quizId}:`, result);

    if (result.cooldownUntil) {
      console.log(`⏰ Cooldown de 30min aplicado ao quiz ${quizId} para usuário ${userId}`);
      console.log(`   Próxima tentativa disponível em: ${result.cooldownUntil}`);
    } else {
      console.log(`✅ Quiz ${quizId} - tentativa ${result.attemptNumber} registrada sem cooldown`);
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'Tentativa registrada com sucesso',
        data: result
      }
    };
  }

  static async getHistory(userId, { moduleId } = {}) {
    const query = { userId, isActive: true };
    if (moduleId) {
      query.moduleId = moduleId;
    }

    const attempts = await QuizAttempt.find(query).sort({ timestamp: -1 }).limit(50);

    console.log(`📊 Histórico de tentativas para usuário ${userId}: ${attempts.length} registros`);

    return {
      status: 200,
      body: {
        success: true,
        data: attempts
      }
    };
  }

  static async cleanupExpired() {
    console.log('🧹 Iniciando limpeza automática de tentativas expiradas...');

    const cleanedCount = await QuizAttempt.cleanupExpiredAttempts();

    return {
      status: 200,
      body: {
        success: true,
        message: `Limpeza concluída: ${cleanedCount} tentativas expiradas foram removidas`,
        cleanedCount
      }
    };
  }

  static async resetAttempts({ quizId, userId }) {
    if (!quizId) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Quiz ID é obrigatório'
        }
      };
    }

    const query = { quizId };
    if (userId) {
      query.userId = userId;
    }

    const result = await QuizAttempt.updateMany(query, { isActive: false });

    console.log(`🔄 Reset de tentativas: ${result.modifiedCount} registros desativados`);

    return {
      status: 200,
      body: {
        success: true,
        message: `Reset concluído: ${result.modifiedCount} tentativas foram resetadas`,
        modifiedCount: result.modifiedCount
      }
    };
  }
}

module.exports = QuizAttemptService;
