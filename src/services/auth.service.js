const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('./email.service');
const { invalidateCache } = require('../middlewares/cache');

const GENERIC_RESET_MESSAGE =
  'Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.';

class AuthService {
  static getResetPasswordExpiresMinutes() {
    const parsed = parseInt(process.env.RESET_PASSWORD_EXPIRES_MIN, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 15;
  }

  static hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static generateResetCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  static buildGenericResetResponse(extra = {}) {
    return {
      status: 200,
      body: {
        success: true,
        message: GENERIC_RESET_MESSAGE,
        ...extra
      }
    };
  }

  static generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  static async register({ name, email, password, level }) {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Este email já está cadastrado'
        }
      };
    }

    const user = await User.create({
      name,
      email,
      password,
      level: level || 'aprendiz',
      completedModules: [],
      completedQuizzes: [],
      quizAttempts: [],
      totalPoints: 0,
      points: 0,
      streak: 0,
      weeklyProgress: 0
    });

    const createdUser = await User.findById(user._id).select(
      'completedModules completedQuizzes quizAttempts totalPoints'
    );
    if (
      createdUser.completedModules.length > 0 ||
      createdUser.completedQuizzes.length > 0 ||
      createdUser.quizAttempts.length > 0 ||
      createdUser.totalPoints > 0
    ) {
      console.error(`❌ [REGISTER] ERRO CRÍTICO: Novo usuário ${user.email} foi criado com dados existentes!`);
      console.error(`   completedModules: ${createdUser.completedModules.length}`);
      console.error(`   completedQuizzes: ${createdUser.completedQuizzes.length}`);
      console.error(`   quizAttempts: ${createdUser.quizAttempts.length}`);
      console.error(`   totalPoints: ${createdUser.totalPoints}`);

      createdUser.completedModules = [];
      createdUser.completedQuizzes = [];
      createdUser.quizAttempts = [];
      createdUser.totalPoints = 0;
      createdUser.points = 0;
      await createdUser.save();
      console.log(`✅ [REGISTER] Dados corrigidos para novo usuário ${user.email}`);
    } else {
      console.log(`✅ [REGISTER] Novo usuário ${user.email} criado corretamente com arrays vazios`);
      console.log(`   ✅ completedModules: ${createdUser.completedModules.length}`);
      console.log(`   ✅ completedQuizzes: ${createdUser.completedQuizzes.length}`);
      console.log(`   ✅ quizAttempts: ${createdUser.quizAttempts.length}`);
      console.log(`   ✅ totalPoints: ${createdUser.totalPoints}`);
    }

    const token = AuthService.generateToken(user._id);

    return {
      status: 201,
      body: {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          level: user.level
        }
      }
    };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return {
        status: 401,
        body: {
          success: false,
          message: 'Email ou senha inválidos'
        }
      };
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return {
        status: 401,
        body: {
          success: false,
          message: 'Email ou senha inválidos'
        }
      };
    }

    // Senha temporária legada (fluxo antigo) — bloquear se expirada
    if (user.tempPassword && user.tempPasswordCreatedAt) {
      const tempPasswordAge = Date.now() - new Date(user.tempPasswordCreatedAt).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (tempPasswordAge > twentyFourHours) {
        return {
          status: 401,
          body: {
            success: false,
            message: 'Sua senha temporária expirou. Solicite uma nova recuperação de senha.',
            code: 'TEMP_PASSWORD_EXPIRED'
          }
        };
      }
    }

    if (!user.isActive) {
      return {
        status: 401,
        body: {
          success: false,
          message: 'Sua conta foi desativada. Entre em contato com o suporte.'
        }
      };
    }

    const freshUser = await User.findById(user._id).select(
      'completedModules completedQuizzes quizAttempts totalPoints email name createdAt level streak tempPassword'
    );

    console.log(`🔍 [LOGIN] Verificando dados do usuário ${freshUser.email} (${freshUser._id}):`);
    console.log(`   completedModules: ${freshUser.completedModules?.length || 0}`);
    console.log(`   completedQuizzes: ${freshUser.completedQuizzes?.length || 0}`);
    console.log(`   quizAttempts: ${freshUser.quizAttempts?.length || 0}`);
    console.log(`   totalPoints: ${freshUser.totalPoints || 0}`);

    const userAge = Date.now() - new Date(freshUser.createdAt).getTime();
    const isNewUser = userAge < 60000;

    if (
      isNewUser &&
      (freshUser.completedModules?.length > 0 ||
        freshUser.completedQuizzes?.length > 0 ||
        freshUser.quizAttempts?.length > 0)
    ) {
      console.error(`❌ [LOGIN] ERRO CRÍTICO: Usuário novo ${freshUser.email} tem dados existentes!`);
      console.error(`   Idade da conta: ${Math.round(userAge / 1000)}s`);
      console.error(`   completedModules: ${freshUser.completedModules.length}`);
      console.error(`   completedQuizzes: ${freshUser.completedQuizzes.length}`);
      console.error(`   quizAttempts: ${freshUser.quizAttempts.length}`);

      freshUser.completedModules = [];
      freshUser.completedQuizzes = [];
      freshUser.quizAttempts = [];
      freshUser.totalPoints = 0;
      freshUser.points = 0;
      await freshUser.save();
      console.log(`✅ [LOGIN] Dados corrigidos para usuário ${freshUser.email}`);
      console.log(`   ✅ completedModules: ${freshUser.completedModules.length}`);
      console.log(`   ✅ completedQuizzes: ${freshUser.completedQuizzes.length}`);
      console.log(`   ✅ quizAttempts: ${freshUser.quizAttempts.length}`);
      console.log(`   ✅ totalPoints: ${freshUser.totalPoints}`);
    }

    freshUser.updateStreak();
    await freshUser.save();

    invalidateCache(`.*${freshUser._id}.*`);
    console.log(`🗑️ [LOGIN] Cache limpo para usuário ${freshUser._id}`);

    const token = AuthService.generateToken(freshUser._id);

    const responseData = {
      success: true,
      token,
      user: {
        id: freshUser._id,
        name: freshUser.name,
        email: freshUser.email,
        level: freshUser.level,
        streak: freshUser.streak,
        tempPassword: freshUser.tempPassword || false
      }
    };

    if (user.tempPassword) {
      responseData.warning =
        'Você está usando uma senha temporária. É obrigatório alterá-la antes de continuar.';
      responseData.requirePasswordChange = true;
    }

    return {
      status: 200,
      body: responseData
    };
  }

  static async getMe(userId) {
    const user = await User.findById(userId)
      .populate('completedModules.moduleId', 'title category')
      .populate('completedQuizzes.quizId', 'title');

    return {
      status: 200,
      body: {
        success: true,
        user
      }
    };
  }

  static async updatePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select('+password');

    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return {
        status: 401,
        body: {
          success: false,
          message: 'Senha atual incorreta'
        }
      };
    }

    user.password = newPassword;
    await user.save();

    return {
      status: 200,
      body: {
        success: true,
        message: 'Senha atualizada com sucesso'
      }
    };
  }

  static async logout(userId) {
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

    console.log(`👋 Usuário ${user.email} fez logout`);

    return {
      status: 200,
      body: {
        success: true,
        message: 'Logout realizado com sucesso'
      }
    };
  }

  static async forgotPassword({ email }) {
    if (!email) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Email é obrigatório'
        }
      };
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Resposta genérica — evita enumeração de usuários
    if (!user || !user.isActive || user.deletionRequested) {
      return AuthService.buildGenericResetResponse();
    }

    const resetCode = AuthService.generateResetCode();
    const expiresMinutes = AuthService.getResetPasswordExpiresMinutes();

    // Invalida solicitações anteriores ao sobrescrever token e expiração
    user.resetPasswordToken = AuthService.hashResetToken(resetCode);
    user.resetPasswordExpires = new Date(Date.now() + expiresMinutes * 60 * 1000);
    user.tempPassword = false;
    user.tempPasswordCreatedAt = undefined;

    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendPasswordResetEmail(
        normalizedEmail,
        resetCode,
        user.name,
        expiresMinutes
      );

      return AuthService.buildGenericResetResponse({
        expiresInMinutes: expiresMinutes
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Erro no envio de email de recuperação:', emailError.message);

      return {
        status: 503,
        body: {
          success: false,
          message:
            'Não foi possível enviar o e-mail no momento. Tente novamente em alguns minutos.',
          code: 'EMAIL_SEND_FAILED'
        }
      };
    }
  }

  static async resetPassword({ email, resetCode, newPassword, confirmPassword }) {
    if (!email || !resetCode || !newPassword) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'E-mail, código e nova senha são obrigatórios'
        }
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'A confirmação da senha não confere',
          code: 'PASSWORDS_DONT_MATCH'
        }
      };
    }

    if (newPassword.length < 6) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Nova senha deve ter pelo menos 6 caracteres',
          code: 'WEAK_PASSWORD'
        }
      };
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+resetPasswordToken +resetPasswordExpires +password'
    );

    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Código inválido ou expirado. Solicite uma nova recuperação de senha.',
          code: 'INVALID_RESET_TOKEN'
        }
      };
    }

    if (user.resetPasswordExpires.getTime() < Date.now()) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return {
        status: 400,
        body: {
          success: false,
          message: 'O código expirou. Solicite uma nova recuperação de senha.',
          code: 'RESET_TOKEN_EXPIRED'
        }
      };
    }

    const hashedCode = AuthService.hashResetToken(String(resetCode).trim());
    if (hashedCode !== user.resetPasswordToken) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Código inválido ou expirado. Solicite uma nova recuperação de senha.',
          code: 'INVALID_RESET_TOKEN'
        }
      };
    }

    user.password = newPassword;
    user.tempPassword = false;
    user.tempPasswordCreatedAt = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return {
      status: 200,
      body: {
        success: true,
        message: 'Senha redefinida com sucesso. Faça login com sua nova senha.'
      }
    };
  }

  static async changeTempPassword(userId, { currentPassword, newPassword }) {
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

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return {
        status: 401,
        body: {
          success: false,
          message: 'Senha atual incorreta'
        }
      };
    }

    if (!user.tempPassword) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Esta não é uma senha temporária. Use a rota de alteração de senha normal.'
        }
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Nova senha deve ter pelo menos 6 caracteres'
        }
      };
    }

    user.password = newPassword;
    user.tempPassword = false;
    user.tempPasswordCreatedAt = undefined;

    await user.save();

    return {
      status: 200,
      body: {
        success: true,
        message: 'Senha alterada com sucesso! Sua conta agora está segura.'
      }
    };
  }
}

module.exports = AuthService;
