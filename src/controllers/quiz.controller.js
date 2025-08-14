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
// @route   GET /api/quiz/:moduleId/private
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
      .select('-questions.options.isCorrect -questions.options.explanation'); // Manter estrutura mas ocultar respostas corretas

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

    // Manter a ordem original de questões e opções para alinhar com a correção por índice
    const shuffledQuestions = quiz.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        // isCorrect e explanation serão adicionados apenas na validação individual
      })),
      category: q.category,
      difficulty: q.difficulty,
      points: q.points,
      explanation: q.explanation
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

// @desc    Validar resposta de questão individual
// @route   POST /api/quiz/:quizId/validate-question
// @access  Private
exports.validateQuestion = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { questionIndex, selectedAnswer } = req.body;

    // Validar entrada
    if (typeof questionIndex !== 'number' || typeof selectedAnswer !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos'
      });
    }

    // Verificar se é quiz mock do desafio diário
    if (quizId === 'daily-challenge-mock') {
      console.log(`🧪 Validando questão ${questionIndex} do quiz mock`);
      
      // Respostas corretas para o quiz mock
      const mockQuestions = [
        {
          question: 'Quantas notas musicais existem no sistema ocidental?',
          options: [
            { id: 'A', label: '5 notas', isCorrect: false },
            { id: 'B', label: '7 notas', isCorrect: false },
            { id: 'C', label: '12 notas', isCorrect: true },
            { id: 'D', label: '10 notas', isCorrect: false }
          ],
          explanation: 'No sistema musical ocidental, temos 12 semitons: Dó, Dó#, Ré, Ré#, Mi, Fá, Fá#, Sol, Sol#, Lá, Lá#, Si.',
          points: 10
        },
        {
          question: 'Qual é a nota que fica entre Fá e Lá?',
          options: [
            { id: 'A', label: 'Mi', isCorrect: false },
            { id: 'B', label: 'Sol', isCorrect: true },
            { id: 'C', label: 'Si', isCorrect: false },
            { id: 'D', label: 'Ré', isCorrect: false }
          ],
          explanation: 'A sequência das notas é: Dó, Ré, Mi, Fá, Sol, Lá, Si. Portanto, Sol fica entre Fá e Lá.',
          points: 10
        }
      ];

      // Verificar se a questão existe no mock
      if (questionIndex < 0 || questionIndex >= mockQuestions.length) {
        return res.status(400).json({
          success: false,
          message: 'Índice de questão inválido'
        });
      }

      const question = mockQuestions[questionIndex];
      
      // Verificar se a opção existe
      if (selectedAnswer < 0 || selectedAnswer >= question.options.length) {
        return res.status(400).json({
          success: false,
          message: 'Opção inválida'
        });
      }

      // Verificar se a resposta está correta
      const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
      const isCorrect = selectedAnswer === correctOptionIndex;
      const selectedOption = question.options[selectedAnswer];
      const correctOption = question.options[correctOptionIndex];

      console.log(`${isCorrect ? '✅' : '❌'} Questão ${questionIndex}: ${isCorrect ? 'Correta' : 'Incorreta'}`);

      return res.json({
        success: true,
        isCorrect,
        selectedAnswer: {
          index: selectedAnswer,
          text: selectedOption.label,
          isCorrect
        },
        correctAnswer: {
          index: correctOptionIndex,
          text: correctOption.label
        },
        explanation: question.explanation,
        points: isCorrect ? question.points : 0
      });
    }

    // Buscar o quiz real no banco de dados
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz não encontrado'
      });
    }

    // Verificar se a questão existe
    if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Índice de questão inválido'
      });
    }

    const question = quiz.questions[questionIndex];
    
    // Verificar se a opção existe
    if (selectedAnswer < 0 || selectedAnswer >= question.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Opção inválida'
      });
    }

    // Verificar se a resposta está correta
    const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
    const isCorrect = selectedAnswer === correctOptionIndex;
    const selectedOption = question.options[selectedAnswer];
    const correctOption = question.options[correctOptionIndex];

    res.json({
      success: true,
      isCorrect,
      selectedAnswer: {
        index: selectedAnswer,
        text: selectedOption.label,
        isCorrect
      },
      correctAnswer: {
        index: correctOptionIndex,
        text: correctOption.label
      },
      explanation: selectedOption.explanation || correctOption.explanation || question.explanation || null,
      points: isCorrect ? question.points || 10 : 0
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

    // Verificar se é um desafio diário mock
    if (quizId === 'daily-challenge-mock') {
      // Processar desafio diário mock
      const totalQuestions = 2; // Quiz mock tem 2 questões
      let score = 0;
      
      // Respostas corretas do quiz mock: Órgão (2), Si (3)
      const correctAnswers = [2, 3];
      
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

      return res.json({
        success: true,
        score,
        total: totalQuestions,
        percentage: Math.round(percentage),
        feedback,
        timeSpent: timeSpent || 0,
        isDailyChallenge: true,
        message: 'Desafio diário completado! Este é um quiz de demonstração.'
      });
    }

    // Buscar o quiz real para correção
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz não encontrado'
      });
    }

    // Calcular score real baseado nas respostas corretas do quiz
    const totalQuestions = quiz.questions.length;
    let score = 0;
    const correctAnswers = [];
    const userAnswers = [];
    
    // Processar cada resposta do usuário (comparar por índice de opção)
    for (let i = 0; i < answers.length && i < totalQuestions; i++) {
      const userAnswer = Number(answers[i]);
      const question = quiz.questions[i];
      
      if (question && question.options && question.options.length > 0) {
        // Encontrar a opção correta para esta questão
        const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
        
        // Adicionar às listas para debug
        correctAnswers.push(correctOptionIndex);
        userAnswers.push(userAnswer);
        
        // Verificar se a resposta está correta (comparar índices)
        if (correctOptionIndex !== -1 && userAnswer === correctOptionIndex) {
          score++;
        }
      }
    }

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    
    // Debug: mostrar informações para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Debug Quiz Submission:');
      console.log('  Quiz ID:', quizId);
      console.log('  Total Questions:', totalQuestions);
      console.log('  User Answers:', userAnswers);
      console.log('  Correct Answers:', correctAnswers);
      console.log('  Score:', score);
      console.log('  Percentage:', percentage);
      console.log('  Questions:', quiz.questions.map((q, idx) => ({
        index: idx,
        question: q.question,
        options: q.options.map((opt, optIdx) => ({
          index: optIdx,
          label: opt.label,
          isCorrect: opt.isCorrect
        }))
      })));
    }

    // Gerar feedback baseado no desempenho
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

    // Preparar detalhes das respostas para o usuário
    const answerDetails = quiz.questions.map((question, index) => {
      const userAnswer = userAnswers[index] !== undefined ? Number(userAnswers[index]) : -1;
      const isCorrect = userAnswer === Number(correctAnswers[index]);
      
      return {
        questionIndex: index,
        userAnswer: userAnswer !== -1 ? question.options[userAnswer]?.label : 'Não respondida',
        correctAnswer: question.options[Number(correctAnswers[index])] ?.label,
        isCorrect,
        explanation: question.explanation || 'Sem explicação disponível'
      };
    });

    res.json({
      success: true,
      score,
      total: totalQuestions,
      percentage: Math.round(percentage),
      feedback,
      timeSpent: timeSpent || 0,
      answerDetails,
      correctAnswers: correctAnswers,
      userAnswers: userAnswers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submeter quiz (versão autenticada)
// @route   POST /api/quiz/:quizId/submit/private
// @access  Private
exports.submitQuizPrivate = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.id;

    // Validar entrada
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Respostas inválidas'
      });
    }

    // Buscar o quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz não encontrado'
      });
    }

    // Verificar se é um desafio diário
    const isDailyChallenge = quiz.type === 'daily-challenge';
    
    // Se for desafio diário, verificar se já foi completado hoje
    if (isDailyChallenge) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
      
      const user = await User.findById(userId);
      const completedToday = user.completedQuizzes.some(cq => 
        cq.quizId.toString() === quizId &&
        new Date(cq.completedAt) >= todayStart &&
        new Date(cq.completedAt) <= todayEnd
      );

      if (completedToday) {
        return res.status(403).json({
          success: false,
          message: 'Você já completou o desafio de hoje! Volte amanhã para um novo desafio.',
          nextChallengeTime: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        });
      }
    }

    // Calcular score
    const totalQuestions = quiz.questions.length;
    let score = 0;
    const correctAnswers = [];
    const userAnswers = [];
    
    // Processar cada resposta do usuário
    for (let i = 0; i < answers.length && i < totalQuestions; i++) {
      const userAnswer = answers[i];
      const question = quiz.questions[i];
      
      if (question && question.options && question.options.length > 0) {
        const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
        
        // Adicionar às listas para debug
        correctAnswers.push(correctOptionIndex);
        userAnswers.push(userAnswer);
        
        // Verificar se a resposta está correta (comparar índices)
        if (correctOptionIndex !== -1 && userAnswer === correctOptionIndex) {
          score++;
        }
      }
    }

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    
    // Debug: mostrar informações para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Debug Quiz Private Submission:');
      console.log('  Quiz ID:', quizId);
      console.log('  Total Questions:', totalQuestions);
      console.log('  User Answers:', userAnswers);
      console.log('  Correct Answers:', correctAnswers);
      console.log('  Score:', score);
      console.log('  Percentage:', percentage);
    }

    // Gerar feedback
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

    // Salvar resultado no banco de dados
    const user = await User.findById(userId);
    
    // Adicionar quiz aos completados
    user.completedQuizzes.push({
      quizId: quizId,
      score: score,
      completedAt: new Date()
    });

    // Adicionar pontos baseados no desempenho
    const basePoints = quiz.points || 100;
    const pointsEarned = Math.round((score / totalQuestions) * basePoints);
    user.totalPoints += pointsEarned;

    // Se for desafio diário, adicionar bônus
    let bonusPoints = 0;
    if (isDailyChallenge) {
      bonusPoints = 50;
      user.totalPoints += bonusPoints;
    }

    await user.save();

    // Atualizar estatísticas do quiz
    quiz.totalAttempts += 1;
    const newAverage = ((quiz.averageScore * (quiz.totalAttempts - 1)) + percentage) / quiz.totalAttempts;
    quiz.averageScore = Math.round(newAverage);
    await quiz.save();

    // Preparar detalhes das respostas
    const answerDetails = quiz.questions.map((question, index) => {
      const userAnswer = userAnswers[index] !== undefined ? userAnswers[index] : -1;
      const isCorrect = userAnswer === correctAnswers[index];
      
      return {
        questionIndex: index,
        userAnswer: userAnswer !== -1 ? question.options[userAnswer]?.label : 'Não respondida',
        correctAnswer: question.options[correctAnswers[index]]?.label,
        isCorrect,
        explanation: question.explanation || 'Sem explicação disponível'
      };
    });

    res.json({
      success: true,
      score,
      total: totalQuestions,
      percentage: Math.round(percentage),
      feedback,
      timeSpent: timeSpent || 0,
      answerDetails,
      correctAnswers: correctAnswers,
      userAnswers: userAnswers,
      pointsEarned: pointsEarned + bonusPoints,
      totalPoints: user.totalPoints,
      isDailyChallenge,
      bonusPoints,
      message: isDailyChallenge 
        ? 'Desafio diário completado com sucesso! Volte amanhã para um novo desafio.'
        : 'Quiz completado com sucesso!'
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
    console.log('🔍 Buscando desafio diário...');
    
    // Buscar um quiz de desafio diário ativo
    const dailyQuiz = await Quiz.findOne({ 
      type: 'daily-challenge', 
      isActive: true 
    });
    
    if (!dailyQuiz) {
      console.log('⚠️ Nenhum quiz de desafio diário encontrado. Criando quiz mock...');
      
      // Retornar quiz mock funcional (sem respostas corretas expostas)
      const mockChallenge = {
        id: 'daily-challenge-mock',
        title: 'Desafio Diário - Demo',
        description: 'Complete o desafio musical do dia!',
        category: 'daily-challenge',
        questions: [
          {
            question: 'Quantas notas musicais existem no sistema ocidental?',
            options: [
              { id: 'A', label: '5 notas' },
              { id: 'B', label: '7 notas' },
              { id: 'C', label: '12 notas' },
              { id: 'D', label: '10 notas' }
            ],
            category: 'teoria-musical',
            difficulty: 'facil',
            points: 10
          },
          {
            question: 'Qual é a nota que fica entre Fá e Lá?',
            options: [
              { id: 'A', label: 'Mi' },
              { id: 'B', label: 'Sol' },
              { id: 'C', label: 'Si' },
              { id: 'D', label: 'Ré' }
            ],
            category: 'teoria-musical',
            difficulty: 'facil',
            points: 10
          }
        ],
        timeLimit: 300,
        totalQuestions: 2,
        type: 'daily-challenge'
      };
      
      return res.json({
        success: true,
        quiz: mockChallenge
      });
    }

    console.log(`✅ Quiz de desafio diário encontrado: ${dailyQuiz.title}`);

    // Mapear quiz real removendo informações sensíveis
    const safeQuiz = {
      id: dailyQuiz._id,
      title: dailyQuiz.title,
      description: dailyQuiz.description,
      category: dailyQuiz.category || 'daily-challenge',
      questions: dailyQuiz.questions.map(q => ({
        question: q.question,
        options: q.options.map(opt => ({
          id: opt.id,
          label: opt.label
          // Não incluir isCorrect e explanation para manter segurança
        })),
        category: q.category,
        difficulty: q.difficulty,
        points: q.points
      })),
      timeLimit: dailyQuiz.timeLimit || 300,
      totalQuestions: dailyQuiz.questions.length,
      type: 'daily-challenge'
    };

    res.json({
      success: true,
      quiz: safeQuiz
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
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    
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
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const quizIndex = seed % availableQuizzes.length;
    const dailyQuiz = availableQuizzes[quizIndex];

    // Verificar se já foi completado hoje
    const completedToday = user.completedQuizzes.some(cq => 
      cq.quizId.toString() === dailyQuiz._id.toString() &&
      new Date(cq.completedAt) >= todayStart &&
      new Date(cq.completedAt) <= todayEnd
    );

    if (completedToday) {
      return res.json({
        success: true,
        dailyChallenge: {
          available: false,
          quiz: null,
          message: 'Você já completou o desafio de hoje! Volte amanhã para um novo desafio.',
          nextChallengeTime: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
          completedAt: user.completedQuizzes.find(cq => 
            cq.quizId.toString() === dailyQuiz._id.toString() &&
            new Date(cq.completedAt) >= todayStart &&
            new Date(cq.completedAt) <= todayEnd
          )?.completedAt,
          score: user.completedQuizzes.find(cq => 
            cq.quizId.toString() === dailyQuiz._id.toString() &&
            new Date(cq.completedAt) >= todayStart &&
            new Date(cq.completedAt) <= todayEnd
          )?.score
        }
      });
    }

    // Preparar quiz do dia
    const dailyChallengeQuiz = {
      _id: dailyQuiz._id,
      title: `Desafio do Dia: ${dailyQuiz.title}`,
      description: 'Complete o desafio diário para ganhar pontos extras! Este desafio pode ser feito apenas uma vez por dia.',
      bonusPoints: 50,
      expiresAt: todayEnd,
      isDailyChallenge: true,
      type: 'daily-challenge',
      questions: dailyQuiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options.map(opt => ({
          id: opt.id,
          label: opt.label
        })),
        category: q.category,
        difficulty: q.difficulty,
        points: q.points
      })),
      totalQuestions: dailyQuiz.questions.length,
      timeLimit: dailyQuiz.timeLimit || 600, // 10 minutos para desafio diário
      level: dailyQuiz.level
    };

    res.json({
      success: true,
      dailyChallenge: {
        available: true,
        quiz: dailyChallengeQuiz,
        message: 'Novo desafio diário disponível! Complete-o para ganhar pontos extras.',
        expiresAt: todayEnd,
        isDailyChallenge: true,
        warning: '⚠️ ATENÇÃO: Este desafio pode ser feito apenas uma vez por dia!'
      }
    });
  } catch (error) {
    next(error);
  }
};