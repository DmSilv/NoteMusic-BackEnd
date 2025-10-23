const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Obter dados básicos do usuário (público)
// @route   GET /api/users/basic-info
// @access  Public
exports.getBasicInfo = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Dados básicos disponíveis',
      defaultUser: {
        name: 'Usuário',
        level: 'Aprendiz',
        progress: 0,
        streak: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter perfil do usuário
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('completedModules.moduleId', 'title category level')
      .populate('completedQuizzes.quizId', 'title moduleId');

    // Calcular estatísticas
    const stats = {
      totalModulesCompleted: user.completedModules.length,
      totalQuizzesCompleted: user.completedQuizzes.length,
      averageQuizScore: user.completedQuizzes.length > 0
        ? user.completedQuizzes.reduce((acc, quiz) => acc + quiz.score, 0) / user.completedQuizzes.length
        : 0,
      currentStreak: user.streak,
      totalPoints: user.totalPoints,
      weeklyProgress: `${user.weeklyProgress}/${user.weeklyGoal}`
    };

    res.json({
      success: true,
      user,
      stats
    });
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

    const { name, email, currentPassword, newPassword, level, weeklyGoal, notifications } = req.body;
    
    // Buscar usuário atual
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Se tentando alterar email ou senha, verificar senha atual
    if ((email && email !== user.email) || newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual é obrigatória para alterar email ou senha'
        });
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }
    }

    // Verificar se email já está em uso
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está sendo usado por outro usuário'
        });
      }
    }

    const fieldsToUpdate = {
      name,
      email,
      level,
      weeklyGoal,
      notifications
    };

    // Se tem nova senha, incluir no update
    if (newPassword) {
      fieldsToUpdate.password = newPassword;
    }

    // Remover campos undefined
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    // Remover senha da resposta
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter progresso do usuário
// @route   GET /api/users/progress
// @access  Private
exports.getProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'completedModules.moduleId',
        select: 'title category points'
      });

    // Agrupar por categoria
    const progressByCategory = {};
    const categories = [
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

    categories.forEach(category => {
      const modulesInCategory = user.completedModules.filter(
        item => item.moduleId && item.moduleId.category === category
      );
      
      progressByCategory[category] = {
        completed: modulesInCategory.length,
        lastCompleted: modulesInCategory.length > 0 
          ? modulesInCategory[modulesInCategory.length - 1].completedAt
          : null
      };
    });

    res.json({
      success: true,
      progress: {
        totalModulesCompleted: user.completedModules.length,
        totalPoints: user.totalPoints,
        currentLevel: user.level,
        progressByCategory
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter ranking de usuários
// @route   GET /api/users/ranking
// @access  Private
exports.getRanking = async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const topUsers = await User.find({ isActive: true })
      .select('name totalPoints level streak')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalUsers = await User.countDocuments({ isActive: true });

    // Posição do usuário atual
    const userPosition = await User.countDocuments({
      isActive: true,
      totalPoints: { $gt: req.user.totalPoints }
    }) + 1;

    res.json({
      success: true,
      ranking: topUsers,
      userPosition,
      totalUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar configurações de notificação
// @route   PUT /api/users/notifications
// @access  Private
exports.updateNotifications = async (req, res, next) => {
  try {
    const { email, push } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'notifications.email': email,
        'notifications.push': push
      },
      { new: true }
    );

    res.json({
      success: true,
      notifications: user.notifications
    });
  } catch (error) {
    next(error);
  }
};