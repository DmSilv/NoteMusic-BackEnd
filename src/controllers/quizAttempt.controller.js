const QuizAttemptService = require('../services/quizAttempt.service');

// ✅ VERIFICAR SE PODE TENTAR NOVAMENTE (COOLDOWN ESPECÍFICO POR QUIZ)
exports.checkQuizAttempt = async (req, res) => {
  try {
    const { quizId, moduleId } = req.params;
    const result = await QuizAttemptService.checkAttempt(req.user.id, quizId, moduleId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao verificar tentativa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// ✅ REGISTRAR NOVA TENTATIVA
exports.registerQuizAttempt = async (req, res) => {
  try {
    const result = await QuizAttemptService.registerAttempt(req.user.id, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao registrar tentativa:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ OBTER HISTÓRICO DE TENTATIVAS
exports.getQuizAttempts = async (req, res) => {
  try {
    const result = await QuizAttemptService.getHistory(req.user.id, req.query);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao buscar tentativas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// ✅ LIMPEZA AUTOMÁTICA DE TENTATIVAS EXPIRADAS
exports.cleanupExpiredAttempts = async (req, res) => {
  try {
    const result = await QuizAttemptService.cleanupExpired();
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro na limpeza automática:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro na limpeza automática',
      error: error.message
    });
  }
};

// ✅ RESETAR TENTATIVAS PARA UM QUIZ (ADMIN)
exports.resetQuizAttempts = async (req, res) => {
  try {
    const result = await QuizAttemptService.resetAttempts(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao resetar tentativas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};
