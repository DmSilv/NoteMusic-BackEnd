const QuizService = require('../services/quiz.service');

exports.getQuizCompletionStatus = async (req, res, next) => {
  try {
    const result = await QuizService.getQuizCompletionStatus(req.user.id, req.params.quizId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ [COMPLETION-STATUS] Erro ao verificar status de conclusão:', error);
    next(error);
  }
};

exports.getQuizAttemptsStatus = async (req, res, next) => {
  try {
    const result = await QuizService.getQuizAttemptsStatus(req.user.id, req.params.quizId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ [ATTEMPTS-STATUS] Erro ao verificar status de tentativas:', error);
    next(error);
  }
};

exports.getQuiz = async (req, res, next) => {
  try {
    const result = await QuizService.getQuiz(req.params.moduleId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    next(error);
  }
};

exports.unlockDailyChallenge = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const result = await QuizService.unlockDailyChallenge(req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Erro ao desbloquear desafio diário:', error);
    next(error);
  }
};

exports.getQuizByModule = async (req, res, next) => {
  try {
    const result = await QuizService.getQuizByModule(req.params.moduleId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    next(error);
  }
};

exports.getDailyChallengeInfo = async (req, res, next) => {
  try {
    const result = await QuizService.getDailyChallengeInfo();
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao obter info do desafio diário:', error);
    next(error);
  }
};

exports.getDailyChallenge = async (req, res, next) => {
  try {
    const result = await QuizService.getDailyChallenge();
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Erro ao buscar desafio diário:', error);
    next(error);
  }
};

exports.validateQuestion = async (req, res, next) => {
  try {
    const result = await QuizService.validateQuestion(
      req.params.quizId,
      req.params.questionIndex,
      req.body.selectedAnswer
    );
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('❌ Erro ao validar questão:', error);
    next(error);
  }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const result = await QuizService.submitQuiz(req.params.quizId, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

exports.submitQuizPrivate = async (req, res, next) => {
  try {
    const result = await QuizService.submitQuizPrivate(req.user.id, req.params.quizId, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

exports.getQuizHistory = async (req, res, next) => {
  try {
    const result = await QuizService.getQuizHistory(req.user.id, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    });
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

exports.getQuizStats = async (req, res, next) => {
  try {
    const result = await QuizService.getQuizStats(req.user.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};
