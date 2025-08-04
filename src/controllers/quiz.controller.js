const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Module = require('../models/Module');

// @desc    Obter quiz público (para teste)
// @route   GET /api/quiz/:moduleId
// @access  Public
exports.getQuiz = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    // Quiz mock para teste
    const mockQuiz = {
      id: moduleId,
      title: 'Quiz de Teste',
      description: 'Quiz para testar o sistema',
      category: 'test',
      questions: [
        {
          questionText: 'Qual é a nota musical mais alta?',
          options: [
            { optionText: 'Dó', isCorrect: false },
            { optionText: 'Ré', isCorrect: false },
            { optionText: 'Mi', isCorrect: false },
            { optionText: 'Si', isCorrect: true }
          ],
          explanation: 'Si é a nota mais alta na escala musical básica.'
        },
        {
          questionText: 'Quantas notas tem uma escala maior?',
          options: [
            { optionText: '5 notas', isCorrect: false },
            { optionText: '6 notas', isCorrect: false },
            { optionText: '7 notas', isCorrect: true },
            { optionText: '8 notas', isCorrect: false }
          ],
          explanation: 'Uma escala maior tem 7 notas: Dó, Ré, Mi, Fá, Sol, Lá, Si.'
        },
        {
          questionText: 'O que significa "forte" em música?',
          options: [
            { optionText: 'Volume alto', isCorrect: true },
            { optionText: 'Volume baixo', isCorrect: false },
            { optionText: 'Velocidade rápida', isCorrect: false },
            { optionText: 'Velocidade lenta', isCorrect: false }
          ],
          explanation: '"Forte" (f) indica que a música deve ser tocada com volume alto.'
        }
      ],
      level: 'iniciante',
      type: 'test'
    };

    res.json({
      success: true,
      ...mockQuiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter quiz de um módulo
// @route   GET /api/quiz/:moduleId
// @access  Private
exports.getQuizByModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    // Verificar se módulo existe
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    // Buscar quiz do módulo
    const quiz = await Quiz.findOne({ moduleId, isActive: true })
      .select('-questions.isCorrect -questions.explanation'); // Não enviar respostas

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Este módulo não possui quiz disponível'
      });
    }

    // Verificar tentativas do usuário
    const user = await User.findById(req.user.id);
    const previousAttempts = user.completedQuizzes.filter(
      cq => cq.quizId.toString() === quiz._id.toString()
    );

    const attemptsRemaining = quiz.attempts - previousAttempts.length;

    if (attemptsRemaining <= 0) {
      return res.status(403).json({
        success: false,
        message: 'Você já utilizou todas as tentativas para este quiz',
        previousAttempts: previousAttempts.map(attempt => ({
          score: attempt.score,
          completedAt: attempt.completedAt
        }))
      });
    }

    // Embaralhar questões
    const shuffledQuestions = quiz.questions
      .sort(() => Math.random() - 0.5)
      .map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options.map(opt => ({
          id: opt.id,
          label: opt.label
        })).sort(() => Math.random() - 0.5), // Embaralhar opções também
        category: q.category,
        difficulty: q.difficulty,
        points: q.points
      }));

    res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: shuffledQuestions,
        totalQuestions: shuffledQuestions.length,
        totalPoints: quiz.calculateTotalPoints(),
        attemptsRemaining,
        previousAttempts: previousAttempts.map(attempt => ({
          score: attempt.score,
          completedAt: attempt.completedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submeter quiz (público para teste)
// @route   POST /api/quiz/:quizId/submit
// @access  Public
exports.submitQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body;

    // Validar entrada
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Respostas inválidas'
      });
    }

    // Calcular score (mock)
    const totalQuestions = 3; // Quiz mock tem 3 questões
    let score = 0;
    
    // Respostas corretas do quiz mock
    const correctAnswers = [3, 2, 0]; // Si, 7 notas, Volume alto
    
    for (let i = 0; i < answers.length && i < correctAnswers.length; i++) {
      if (answers[i] === correctAnswers[i]) {
        score++;
      }
    }

    const percentage = (score / totalQuestions) * 100;
    
    let feedback = '';
    if (percentage >= 90) {
      feedback = 'Excelente! Você demonstrou um conhecimento excepcional!';
    } else if (percentage >= 70) {
      feedback = 'Muito bom! Continue praticando para melhorar ainda mais!';
    } else if (percentage >= 50) {
      feedback = 'Bom trabalho! Revise o conteúdo para melhorar seu desempenho.';
    } else {
      feedback = 'Continue estudando! A prática leva à perfeição.';
    }

    res.json({
      success: true,
      score,
      total: totalQuestions,
      percentage,
      feedback,
      timeSpent: timeSpent || 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter histórico de quizzes
// @route   GET /api/quiz/history
// @access  Private
exports.getQuizHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'completedQuizzes.quizId',
        select: 'title moduleId',
        populate: {
          path: 'moduleId',
          select: 'title category'
        }
      });

    const history = user.completedQuizzes
      .filter(cq => cq.quizId) // Filtrar quizzes deletados
      .map(cq => ({
        quizTitle: cq.quizId.title,
        moduleTitle: cq.quizId.moduleId?.title,
        category: cq.quizId.moduleId?.category,
        score: cq.score,
        completedAt: cq.completedAt
      }))
      .sort((a, b) => b.completedAt - a.completedAt);

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter quiz do dia (desafio diário)
// @route   GET /api/quiz/daily-challenge
// @access  Public
exports.getDailyChallenge = async (req, res, next) => {
  try {
    // Retornar desafio mock para teste
    const mockChallenge = {
      id: 'daily-' + new Date().toISOString().split('T')[0],
      title: 'Desafio Diário de Música',
      description: 'Complete o desafio diário para ganhar pontos extras!',
      category: 'daily',
      questions: [
        {
          questionText: 'Qual instrumento é conhecido como "rei dos instrumentos"?',
          options: [
            { optionText: 'Piano', isCorrect: false },
            { optionText: 'Violino', isCorrect: false },
            { optionText: 'Órgão', isCorrect: true },
            { optionText: 'Guitarra', isCorrect: false }
          ],
          explanation: 'O órgão é tradicionalmente conhecido como o "rei dos instrumentos".'
        }
      ],
      level: 'iniciante',
      type: 'daily-challenge',
      bonusPoints: 50,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    };

    res.json({
      success: true,
      ...mockChallenge
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter quiz do dia (desafio diário) - versão autenticada
// @route   GET /api/quiz/daily-challenge/private
// @access  Private
exports.getDailyChallengePrivate = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Simular quiz do dia baseado na data atual
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Buscar quizzes do nível do usuário
    const availableQuizzes = await Quiz.find({ 
      level: user.level, 
      isActive: true 
    });

    if (availableQuizzes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum desafio disponível para seu nível'
      });
    }

    // Selecionar quiz baseado no seed do dia
    const quizIndex = seed % availableQuizzes.length;
    const dailyQuiz = availableQuizzes[quizIndex];

    // Verificar se já foi completado hoje
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    const completedToday = user.completedQuizzes.some(cq => 
      cq.quizId.toString() === dailyQuiz._id.toString() &&
      cq.completedAt >= todayStart &&
      cq.completedAt <= todayEnd
    );

    res.json({
      success: true,
      dailyChallenge: {
        available: !completedToday,
        quiz: completedToday ? null : {
          _id: dailyQuiz._id,
          title: `Desafio do Dia: ${dailyQuiz.title}`,
          description: 'Complete o desafio diário para ganhar pontos extras!',
          bonusPoints: 50,
          expiresAt: todayEnd
        },
        message: completedToday 
          ? 'Você já completou o desafio de hoje! Volte amanhã.'
          : 'Novo desafio diário disponível!'
      }
    });
  } catch (error) {
    next(error);
  }
};