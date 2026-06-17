const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('./email.service');
const { invalidateCache } = require('../middlewares/cache');

class AuthService {
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

    const user = await User.findOne({ email });
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Não existe usuário com este email'
        }
      };
    }

    if (user.deletionRequested) {
      return {
        status: 403,
        body: {
          success: false,
          message:
            'Esta conta foi desativada e está marcada para exclusão. Não é possível recuperar a senha. Entre em contato com o suporte para mais informações.',
          accountStatus: 'deactivated',
          deletionScheduledFor: user.deletionScheduledFor,
          daysRemaining: user.daysRemaining
        }
      };
    }

    const generateSecurePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
      let result = '';
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const tempPassword = generateSecurePassword();

    user.password = tempPassword;
    user.tempPassword = true;
    user.tempPasswordCreatedAt = new Date();

    await user.save();

    try {
      const emailResult = await emailService.sendPasswordResetEmail(email, tempPassword, user.name);

      console.log(`✅ Email de recuperação enviado para: ${email}`);

      return {
        status: 200,
        body: {
          success: true,
          message:
            'Senha temporária enviada para seu email. Verifique sua caixa de entrada (e spam) e use-a para fazer login.',
          expiresIn: '24 horas',
          previewUrl: process.env.NODE_ENV === 'development' ? emailResult.previewUrl : undefined
        }
      };
    } catch (emailError) {
      console.error('Erro no envio de email:', emailError);

      return {
        status: 500,
        body: {
          success: false,
          message:
            'Erro no envio do email. Por favor, tente novamente. Se o problema persistir, entre em contato com o suporte.'
        }
      };
    }
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
