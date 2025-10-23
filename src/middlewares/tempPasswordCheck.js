const User = require('../models/User');

/**
 * Middleware para verificar se o usuário está usando uma senha temporária
 * e bloquear acesso a rotas que exigem senha permanente
 */
exports.checkTempPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Se o usuário está com senha temporária, bloquear acesso
    if (user.tempPassword) {
      return res.status(403).json({
        success: false,
        message: 'Você deve alterar sua senha temporária antes de acessar esta funcionalidade.',
        requirePasswordChange: true,
        tempPassword: true
      });
    }

    // Verificar se a senha temporária expirou (24 horas)
    if (user.tempPasswordCreatedAt) {
      const now = new Date();
      const tempPasswordAge = now - user.tempPasswordCreatedAt;
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

      if (tempPasswordAge > twentyFourHours) {
        // Senha temporária expirou, remover flags
        user.tempPassword = false;
        user.tempPasswordCreatedAt = undefined;
        await user.save();
        
        return res.status(401).json({
          success: false,
          message: 'Sua senha temporária expirou. Solicite uma nova recuperação de senha.',
          expired: true
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de verificação de senha temporária:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware para permitir apenas usuários com senhas temporárias
 * (usado na rota de troca de senha temporária)
 */
exports.requireTempPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se é uma senha temporária
    if (!user.tempPassword) {
      return res.status(400).json({
        success: false,
        message: 'Esta rota é apenas para usuários com senhas temporárias.'
      });
    }

    // Verificar se a senha temporária não expirou
    if (user.tempPasswordCreatedAt) {
      const now = new Date();
      const tempPasswordAge = now - user.tempPasswordCreatedAt;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (tempPasswordAge > twentyFourHours) {
        return res.status(401).json({
          success: false,
          message: 'Sua senha temporária expirou. Solicite uma nova recuperação de senha.',
          expired: true
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de verificação de senha temporária:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
