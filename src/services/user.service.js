const User = require('../models/user.model');

const PROGRESS_CATEGORIES = [
  'propriedades-som',
  'escalas-maiores',
  'figuras-musicais',
  'ritmo-ternarios',
  'compasso-simples',
  'andamento-dinamica',
  'solfegio-basico',
  'articulacao-musical',
  'intervalos-musicais',
  'expressao-musical',
  'sincopa-contratempo',
  'compasso-composto'
];

class UserService {
  static getBasicInfo() {
    return {
      status: 200,
      body: {
        success: true,
        message: 'Dados básicos disponíveis',
        defaultUser: {
          name: 'Usuário',
          level: 'Aprendiz',
          progress: 0,
          streak: 0
        }
      }
    };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId)
      .populate('completedModules.moduleId', 'title category level')
      .populate('completedQuizzes.quizId', 'title moduleId');

    const stats = {
      totalModulesCompleted: user.completedModules.length,
      totalQuizzesCompleted: user.completedQuizzes.length,
      averageQuizScore:
        user.completedQuizzes.length > 0
          ? user.completedQuizzes.reduce((acc, quiz) => acc + quiz.score, 0) /
            user.completedQuizzes.length
          : 0,
      currentStreak: user.streak,
      totalPoints: user.totalPoints,
      weeklyProgress: `${user.weeklyProgress}/${user.weeklyGoal}`
    };

    return {
      status: 200,
      body: {
        success: true,
        user,
        stats
      }
    };
  }

  static async updateProfile(userId, data) {
    // `level` NÃO é aceito do cliente (mass assignment) — só regras de negócio no servidor.
    const { name, email, currentPassword, newPassword, weeklyGoal, notifications } = data;

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

    if ((email && email !== user.email) || newPassword) {
      if (!currentPassword) {
        return {
          status: 400,
          body: {
            success: false,
            message: 'Senha atual é obrigatória para alterar email ou senha'
          }
        };
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return {
          status: 400,
          body: {
            success: false,
            message: 'Senha atual incorreta'
          }
        };
      }
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          status: 400,
          body: {
            success: false,
            message: 'Este email já está sendo usado por outro usuário'
          }
        };
      }
      user.email = email;
    }

    if (name !== undefined) user.name = name;
    if (weeklyGoal !== undefined) user.weeklyGoal = weeklyGoal;
    if (notifications !== undefined) user.notifications = notifications;

    // Usar save() para disparar pre('save') do bcrypt — findByIdAndUpdate NÃO hasheia.
    if (newPassword) {
      user.password = newPassword;
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return {
      status: 200,
      body: {
        success: true,
        message: 'Perfil atualizado com sucesso',
        user: userResponse
      }
    };
  }

  static async getProgress(userId) {
    const user = await User.findById(userId).populate({
      path: 'completedModules.moduleId',
      select: 'title category points'
    });

    const progressByCategory = {};

    PROGRESS_CATEGORIES.forEach((category) => {
      const modulesInCategory = user.completedModules.filter(
        (item) => item.moduleId && item.moduleId.category === category
      );

      progressByCategory[category] = {
        completed: modulesInCategory.length,
        lastCompleted:
          modulesInCategory.length > 0
            ? modulesInCategory[modulesInCategory.length - 1].completedAt
            : null
      };
    });

    return {
      status: 200,
      body: {
        success: true,
        progress: {
          totalModulesCompleted: user.completedModules.length,
          totalPoints: user.totalPoints,
          currentLevel: user.level,
          progressByCategory
        }
      }
    };
  }

  static async getRanking(userId, userTotalPoints, { limit = 10, offset = 0 } = {}) {
    const { LIMITS } = require('../utils/constants');
    const safeLimit = Math.min(
      Math.max(parseInt(limit, 10) || LIMITS.DEFAULT_PAGE_LIMIT, 1),
      LIMITS.MAX_PAGE_LIMIT
    );
    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const topUsers = await User.find({ isActive: true })
      .select('name totalPoints level streak')
      .sort({ totalPoints: -1 })
      .limit(safeLimit)
      .skip(safeOffset);

    const totalUsers = await User.countDocuments({ isActive: true });

    const userPosition =
      (await User.countDocuments({
        isActive: true,
        totalPoints: { $gt: userTotalPoints }
      })) + 1;

    return {
      status: 200,
      body: {
        success: true,
        ranking: topUsers,
        userPosition,
        totalUsers
      }
    };
  }

  static async updateNotifications(userId, { email, push }) {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        'notifications.email': email,
        'notifications.push': push
      },
      { new: true }
    );

    return {
      status: 200,
      body: {
        success: true,
        notifications: user.notifications
      }
    };
  }
}

module.exports = UserService;
