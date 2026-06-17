const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');

// Gerar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    // Validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, level } = req.body;

    // Verificar se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está cadastrado'
      });
    }

    // ✅ VALIDAÇÃO CRÍTICA: Garantir que novo usuário começa com arrays vazios
    // Criar usuário explicitamente com arrays vazios para evitar herança de dados
    const user = await User.create({
      name,
      email,
      password,
      level: level || 'aprendiz',
      completedModules: [], // ✅ Garantir array vazio
      completedQuizzes: [], // ✅ Garantir array vazio
      quizAttempts: [], // ✅ Garantir array vazio
      totalPoints: 0, // ✅ Garantir pontos zerados
      points: 0,
      streak: 0,
      weeklyProgress: 0
    });

    // ✅ VALIDAÇÃO PÓS-CRIAÇÃO: Verificar se o usuário foi criado corretamente
    const createdUser = await User.findById(user._id).select('completedModules completedQuizzes quizAttempts totalPoints');
    if (createdUser.completedModules.length > 0 || createdUser.completedQuizzes.length > 0 || createdUser.quizAttempts.length > 0 || createdUser.totalPoints > 0) {
      console.error(`❌ [REGISTER] ERRO CRÍTICO: Novo usuário ${user.email} foi criado com dados existentes!`);
      console.error(`   completedModules: ${createdUser.completedModules.length}`);
      console.error(`   completedQuizzes: ${createdUser.completedQuizzes.length}`);
      console.error(`   quizAttempts: ${createdUser.quizAttempts.length}`);
      console.error(`   totalPoints: ${createdUser.totalPoints}`);
      
      // Corrigir forçando arrays vazios
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

    // Gerar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login do usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    // Validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Verificar se usuário existe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    // Verificar senha
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    // Verificar se conta está ativa
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Sua conta foi desativada. Entre em contato com o suporte.'
      });
    }

    // ✅ VALIDAÇÃO CRÍTICA: Verificar se o usuário tem dados inconsistentes
    // Buscar usuário novamente para garantir dados atualizados
    const freshUser = await User.findById(user._id).select('completedModules completedQuizzes quizAttempts totalPoints email name createdAt');
    
    // ✅ LOG: Verificar dados do usuário antes do login
    console.log(`🔍 [LOGIN] Verificando dados do usuário ${freshUser.email} (${freshUser._id}):`);
    console.log(`   completedModules: ${freshUser.completedModules?.length || 0}`);
    console.log(`   completedQuizzes: ${freshUser.completedQuizzes?.length || 0}`);
    console.log(`   quizAttempts: ${freshUser.quizAttempts?.length || 0}`);
    console.log(`   totalPoints: ${freshUser.totalPoints || 0}`);
    
    // Se o usuário foi criado recentemente (menos de 1 minuto) e tem dados, pode ser um problema
    const userAge = Date.now() - new Date(freshUser.createdAt).getTime();
    const isNewUser = userAge < 60000; // Menos de 1 minuto
    
    if (isNewUser && (freshUser.completedModules?.length > 0 || freshUser.completedQuizzes?.length > 0 || freshUser.quizAttempts?.length > 0)) {
      console.error(`❌ [LOGIN] ERRO CRÍTICO: Usuário novo ${freshUser.email} tem dados existentes!`);
      console.error(`   Idade da conta: ${Math.round(userAge / 1000)}s`);
      console.error(`   completedModules: ${freshUser.completedModules.length}`);
      console.error(`   completedQuizzes: ${freshUser.completedQuizzes.length}`);
      console.error(`   quizAttempts: ${freshUser.quizAttempts.length}`);
      
      // Corrigir forçando arrays vazios para novos usuários
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

    // Atualizar streak
    freshUser.updateStreak();
    await freshUser.save();
    
    // ✅ Limpar cache relacionado a este usuário após login
    const { invalidateCache } = require('../middlewares/cache');
    invalidateCache(`.*${freshUser._id}.*`);
    console.log(`🗑️ [LOGIN] Cache limpo para usuário ${freshUser._id}`);

    // Gerar token
    const token = generateToken(freshUser._id);

    // Verificar se está usando senha temporária
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

    // Se for senha temporária, adicionar aviso
    if (user.tempPassword) {
      responseData.warning = 'Você está usando uma senha temporária. É obrigatório alterá-la antes de continuar.';
      responseData.requirePasswordChange = true;
    }

    res.json(responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('completedModules.moduleId', 'title category')
      .populate('completedQuizzes.quizId', 'title');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar senha
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Verificar senha atual
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Senha atualizada com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout do usuário (limpar sessão)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Log de logout para auditoria
    console.log(`👋 Usuário ${user.email} fez logout`);

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Esqueci minha senha
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validar email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Não existe usuário com este email'
      });
    }

    // ✅ VALIDAÇÃO: Verificar se a conta está desativada/marcada para exclusão
    if (user.deletionRequested) {
      return res.status(403).json({
        success: false,
        message: 'Esta conta foi desativada e está marcada para exclusão. Não é possível recuperar a senha. Entre em contato com o suporte para mais informações.',
        accountStatus: 'deactivated',
        deletionScheduledFor: user.deletionScheduledFor,
        daysRemaining: user.daysRemaining
      });
    }

    // Gerar senha temporária segura (12 caracteres com números, letras e símbolos)
    const generateSecurePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
      let result = '';
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    const tempPassword = generateSecurePassword();
    
    // Atualizar senha do usuário com a temporária
    user.password = tempPassword;
    user.tempPassword = true; // Marcar como senha temporária
    user.tempPasswordCreatedAt = new Date();
    
    await user.save();

    try {
      // Enviar email com senha temporária
      const emailResult = await emailService.sendPasswordResetEmail(
        email, 
        tempPassword, 
        user.name
      );

      console.log(`✅ Email de recuperação enviado para: ${email}`);
      
      res.json({
        success: true,
        message: 'Senha temporária enviada para seu email. Verifique sua caixa de entrada (e spam) e use-a para fazer login.',
        expiresIn: '24 horas',
        // Em desenvolvimento, retornar preview URL para teste
        previewUrl: process.env.NODE_ENV === 'development' ? emailResult.previewUrl : undefined
      });
    } catch (emailError) {
      console.error('Erro no envio de email:', emailError);
      
      // ✅ Se falhar no envio, apenas retornar erro (não reverter - usuário ainda pode usar senha antiga)
      // Não tentamos reverter porque causaria erro de validação do Mongoose
      
      return res.status(500).json({
        success: false,
        message: 'Erro no envio do email. Por favor, tente novamente. Se o problema persistir, entre em contato com o suporte.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Alterar senha temporária
// @route   POST /api/auth/changetemppassword
// @access  Private
exports.changeTempPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se a senha atual é a temporária
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Verificar se é uma senha temporária
    if (!user.tempPassword) {
      return res.status(400).json({
        success: false,
        message: 'Esta não é uma senha temporária. Use a rota de alteração de senha normal.'
      });
    }

    // Validar nova senha
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    // Atualizar senha e remover flag de temporária
    user.password = newPassword;
    user.tempPassword = false;
    user.tempPasswordCreatedAt = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Senha alterada com sucesso! Sua conta agora está segura.'
    });
  } catch (error) {
    next(error);
  }
};