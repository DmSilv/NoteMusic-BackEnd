const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Module = require('../models/Module');
const { USER_LEVELS, POINTS, LIMITS } = require('../utils/constants');
const { calculateRebalancedPoints, GAMIFICATION_CONSTANTS } = require('../utils/gamificationRebalanced');

// @desc    Verificar se um quiz foi concluído pelo usuário
// @route   GET /api/quiz/:quizId/completion-status
// @access  Private
exports.getQuizCompletionStatus = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o quiz foi completado
    const completedQuiz = user.completedQuizzes.find(cq => 
      cq.quizId.toString() === quizId
    );

    const isCompleted = completedQuiz && completedQuiz.passed;

    res.json({
      success: true,
      isCompleted,
      completionData: completedQuiz || null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verificar tentativas disponíveis para um quiz
// @route   GET /api/quiz/:quizId/attempts-status
// @access  Private
exports.getQuizAttemptsStatus = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Buscar tentativas para este quiz
    const quizAttempt = user.quizAttempts.find(qa => 
      qa.quizId.toString() === quizId
    );

    const maxAttempts = LIMITS.MAX_QUIZ_ATTEMPTS || 3;
    const attemptsUsed = quizAttempt ? quizAttempt.attempts : 0;
    const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);

    // Verificar se está em cooldown
    const now = new Date();
    const isInCooldown = quizAttempt && quizAttempt.cooldownUntil && quizAttempt.cooldownUntil > now;
    const cooldownUntil = isInCooldown ? quizAttempt.cooldownUntil : null;

    // Verificar se já passou no quiz
    const completedQuiz = user.completedQuizzes.find(cq => 
      cq.quizId.toString() === quizId && cq.passed
    );
    const hasPassed = !!completedQuiz;

    res.json({
      success: true,
      canAttempt: !isInCooldown && (attemptsRemaining > 0 || hasPassed),
      attemptsUsed,
      attemptsRemaining,
      maxAttempts,
      isInCooldown,
      cooldownUntil,
      hasPassed,
      lastAttempt: quizAttempt ? quizAttempt.lastAttempt : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter quiz público (para teste)
// @route   GET /api/quiz/:moduleId
// @access  Public
exports.getQuiz = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    console.log(`🔍 Buscando quiz para módulo: ${moduleId}`);

    // Buscar o quiz pelo módulo
    const quiz = await Quiz.findOne({ moduleId: moduleId });
    
    if (!quiz) {
      console.log(`❌ Quiz não encontrado para módulo: ${moduleId}`);
      return res.status(404).json({
        success: false,
        message: 'Quiz não encontrado para este módulo'
      });
    }

    console.log(`✅ Quiz encontrado: ${quiz.title}`);

    // Retornar apenas os dados públicos necessários
    const publicQuiz = {
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      questions: quiz.questions.map((question, questionIndex) => ({
        _id: question._id || `q_${questionIndex}`,
        question: question.question,
        options: question.options.map((option, optionIndex) => ({
          id: option.id || option._id || `opt_${questionIndex}_${optionIndex}`,
          label: option.label,
          // Não incluir isCorrect na resposta pública
        })),
        explanation: question.explanation,
        category: question.category || quiz.category,
        difficulty: question.difficulty || 'medio',
        points: question.points || 10
      })),
      timeLimit: quiz.timeLimit || 300, // 5 minutos padrão
      passingScore: quiz.passingScore || 70, // ✅ Nota mínima para aprovação
      level: quiz.level,
      type: quiz.type || 'module'
    };

    res.json({
      success: true,
      quiz: publicQuiz
    });
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    next(error);
  }
};

// @desc    Obter quiz pelo módulo (privado)
// @route   GET /api/quiz/module/:moduleId
// @access  Private

// @desc    Desbloquear desafio diário (para fins de desenvolvimento)
// @route   POST /api/quiz/unlock-daily-challenge
// @access  Private
exports.unlockDailyChallenge = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    console.log(`🔓 Desbloqueando desafio diário para usuário ${user.name || user.email}`);
    
    // Remover tentativas de desafio diário
    user.quizAttempts = user.quizAttempts.filter(attempt => {
      return !(
        attempt.quizId.toString().includes('daily') || 
        attempt.isBlocked === true || 
        (attempt.cooldownUntil && attempt.cooldownUntil > new Date())
      );
    });
    
    // Remover conclusões de desafio diário para permitir nova tentativa
    user.completedQuizzes = user.completedQuizzes.filter(quiz => {
      return !quiz.quizId.toString().includes('daily');
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Desafio diário desbloqueado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao desbloquear desafio diário:', error);
    next(error);
  }
};
exports.getQuizByModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    console.log(`🔍 Buscando quiz para módulo: ${moduleId}`);

    // Buscar o quiz pelo módulo (usando ObjectId)
    const objectId = new mongoose.Types.ObjectId(moduleId);
    console.log(`🔍 ObjectId criado: ${objectId}`);
    
    const quiz = await Quiz.findOne({ moduleId: objectId });
    console.log(`🔍 Resultado da busca:`, quiz ? 'Quiz encontrado' : 'Quiz não encontrado');
    
    if (!quiz) {
      console.log(`❌ Quiz não encontrado para módulo: ${moduleId}`);
      
      // Busca alternativa: verificar se há quizzes no banco
      const totalQuizzes = await Quiz.countDocuments();
      console.log(`📊 Total de quizzes no banco: ${totalQuizzes}`);
      
      // Buscar quizzes que referenciam este módulo
      const quizzesWithModule = await Quiz.find({ moduleId: objectId });
      console.log(`📊 Quizzes encontrados para este módulo: ${quizzesWithModule.length}`);
      
      // Listar alguns quizzes para debug
      const sampleQuizzes = await Quiz.find().limit(3).select('title moduleId');
      console.log(`📋 Exemplos de quizzes:`, sampleQuizzes.map(q => ({ title: q.title, moduleId: q.moduleId })));
      
      return res.status(404).json({
        success: false,
        message: 'Quiz não encontrado para este módulo'
      });
    }

    console.log(`✅ Quiz encontrado: ${quiz.title}`);

    // Retornar apenas os dados necessários (sem as respostas corretas)
    const safeQuiz = {
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      questions: quiz.questions.map((question, questionIndex) => ({
        _id: question._id || `q_${questionIndex}`,
        question: question.question,
        options: question.options.map((option, optionIndex) => ({
          id: option.id || option._id || `opt_${questionIndex}_${optionIndex}`,
          label: option.label,
          // Não incluir isCorrect na resposta
        })),
        explanation: question.explanation,
        category: question.category || quiz.category,
        difficulty: question.difficulty || 'medio',
        points: question.points || 10
      })),
      timeLimit: quiz.timeLimit || 300, // 5 minutos padrão
      passingScore: quiz.passingScore || 70, // ✅ Nota mínima para aprovação
      level: quiz.level,
      type: quiz.type || 'module'
    };

    res.json({
      success: true,
      quiz: safeQuiz
    });
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    next(error);
  }
};

// @desc    Obter desafio diário
// @route   GET /api/quiz/daily-challenge
// @access  Public
exports.getDailyChallenge = async (req, res, next) => {
  try {
    // Buscar quiz marcado como desafio diário
    const dailyQuiz = await Quiz.findOne({ 
      type: 'daily-challenge',
      isActive: true 
    });

    if (!dailyQuiz) {
      // Se não houver desafio específico, usar um quiz aleatório
      const randomQuiz = await Quiz.aggregate([
        { $match: { type: { $ne: 'daily-challenge' }, isActive: true } },
        { $sample: { size: 1 } }
      ]);

      if (randomQuiz.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Nenhum quiz disponível para desafio diário'
        });
      }

      const quiz = randomQuiz[0];
      
      // Modificar para criar um desafio diário estruturado
      const dailyChallengeQuiz = {
        id: 'daily-challenge-mock',
        title: 'Desafio Diário',
        description: 'Teste seus conhecimentos musicais com perguntas selecionadas especialmente para hoje!',
        category: quiz.category,
        questions: quiz.questions
          .slice(0, 5)
          .map((question, questionIndex) => {
            // Preservar a pergunta original
            const enhancedQuestion = {
              _id: question._id || `daily_q_${questionIndex}`,
              question: question.question,
              options: question.options.map((option, optionIndex) => ({
                id: option.id || option._id || `daily_opt_${questionIndex}_${optionIndex}`,
                label: option.label,
                isCorrect: option.isCorrect // Preservar a resposta correta para validação
              })),
              explanation: question.explanation || 'Esta questão testa seu conhecimento de teoria musical fundamental.',
              category: question.category || quiz.category,
              difficulty: question.difficulty || 'medio',
              points: question.points || 15 // Mais pontos para desafio diário
            };
            
            // Log detalhado para depuração
            console.log(`📝 Questão ${questionIndex + 1} do desafio:`, {
              pergunta: enhancedQuestion.question.substring(0, 30) + '...',
              categoria: enhancedQuestion.category,
              dificuldade: enhancedQuestion.difficulty,
              pontos: enhancedQuestion.points,
              opcoes: enhancedQuestion.options.length
            });
            
            return enhancedQuestion;
          }),
        timeLimit: 600, // 10 minutos
        level: quiz.level,
        type: 'daily-challenge'
      };

      return res.json({
        success: true,
        dailyChallenge: dailyChallengeQuiz
      });
    }

    // Retornar desafio diário real com estrutura melhorada
    const dailyChallengeQuiz = {
      id: dailyQuiz._id,
      title: dailyQuiz.title || 'Desafio Diário de Teoria Musical',
      description: dailyQuiz.description || 'Teste seus conhecimentos musicais com o desafio especial de hoje!',
      category: dailyQuiz.category,
      questions: dailyQuiz.questions.map((question, questionIndex) => {
        // Enriquecer a pergunta
        const enhancedQuestion = {
          _id: question._id || `daily_real_q_${questionIndex}`,
          question: question.question,
          options: question.options.map((option, optionIndex) => ({
            id: option.id || option._id || `daily_real_opt_${questionIndex}_${optionIndex}`,
            label: option.label,
            isCorrect: option.isCorrect // Preservar para validação
          })),
          explanation: question.explanation || 'Esta questão testa aspectos importantes da teoria musical.',
          category: question.category || dailyQuiz.category,
          difficulty: question.difficulty || 'medio',
          points: question.points || 15
        };
        
        // Log para depuração
        console.log(`📝 Questão ${questionIndex + 1} do desafio real:`, {
          pergunta: enhancedQuestion.question.substring(0, 30) + '...',
          categoria: enhancedQuestion.category,
          dificuldade: enhancedQuestion.difficulty
        });
        
        return enhancedQuestion;
      }),
      timeLimit: dailyQuiz.timeLimit || 600,
      level: dailyQuiz.level,
      type: 'daily-challenge'
    };

    res.json({
      success: true,
      dailyChallenge: dailyChallengeQuiz
    });
  } catch (error) {
    console.error('Erro ao buscar desafio diário:', error);
    next(error);
  }
};

// @desc    Validar resposta de uma questão específica
// @route   POST /api/quiz/:quizId/validate/:questionIndex
// @access  Public
exports.validateQuestion = async (req, res, next) => {
  try {
    const { quizId, questionIndex } = req.params;
    const { selectedAnswer } = req.body;

    console.log(`🔍 Validando questão ${questionIndex} do quiz ${quizId}`);
    console.log(`📝 Resposta selecionada: ${selectedAnswer} (tipo: ${typeof selectedAnswer})`);

    // Validar entrada
    if (selectedAnswer === undefined || selectedAnswer === null) {
      return res.status(400).json({
        success: false,
        message: 'Resposta é obrigatória'
      });
    }

    // Converter para número para garantir comparação consistente
    const selectedAnswerIndex = Number(selectedAnswer);

    // Tratar desafio diário mock
    if (quizId === 'daily-challenge-mock') {
      // Para o mock, usar dados simulados com 5 questões para evitar erro de índice inválido
      const mockQuestions = [
        {
          question: "Qual é a duração de uma semibreve?",
          options: [
            { label: "1 tempo", isCorrect: false },
            { label: "2 tempos", isCorrect: false },
            { label: "4 tempos", isCorrect: true },
            { label: "8 tempos", isCorrect: false }
          ],
          explanation: "A semibreve é a figura musical de maior duração no sistema tradicional, valendo 4 tempos em um compasso quaternário."
        },
        {
          question: "Quantas linhas tem a pauta musical?",
          options: [
            { label: "4 linhas", isCorrect: false },
            { label: "5 linhas", isCorrect: true },
            { label: "6 linhas", isCorrect: false },
            { label: "7 linhas", isCorrect: false }
          ],
          explanation: "A pauta musical tradicional possui 5 linhas e 4 espaços onde são escritas as notas musicais."
        },
        {
          question: "Qual símbolo musical indica que devemos tocar suavemente?",
          options: [
            { label: "f (forte)", isCorrect: false },
            { label: "p (piano)", isCorrect: true },
            { label: "m (mezzo)", isCorrect: false },
            { label: "s (suave)", isCorrect: false }
          ],
          explanation: "O termo 'piano' (p) em italiano significa suave e indica que o trecho deve ser tocado com pouca intensidade."
        },
        {
          question: "Qual é o intervalo entre as notas Dó e Sol?",
          options: [
            { label: "3ª Maior", isCorrect: false },
            { label: "4ª Justa", isCorrect: false },
            { label: "5ª Justa", isCorrect: true },
            { label: "6ª Menor", isCorrect: false }
          ],
          explanation: "O intervalo entre Dó e Sol é uma 5ª Justa, pois contém 5 graus diatônicos (Dó, Ré, Mi, Fá, Sol)."
        },
        {
          question: "Qual a figura musical que vale metade de uma semínima?",
          options: [
            { label: "Mínima", isCorrect: false },
            { label: "Colcheia", isCorrect: true },
            { label: "Semicolcheia", isCorrect: false },
            { label: "Fusa", isCorrect: false }
          ],
          explanation: "A colcheia vale metade do valor de uma semínima. Se a semínima vale um tempo, a colcheia vale meio tempo."
        }
      ];

      const question = mockQuestions[questionIndex];
      if (!question) {
        return res.status(400).json({
          success: false,
          message: 'Índice de questão inválido'
        });
      }

      const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
      
      // Converter para garantir comparação numérica
      const isCorrect = selectedAnswerIndex === correctOptionIndex;
      
      console.log(`${isCorrect ? '✅' : '❌'} Questão ${questionIndex}: ${isCorrect ? 'Correta' : 'Incorreta'}`);
      console.log(`  Resposta do usuário: ${selectedAnswerIndex} (convertido para número)`);
      console.log(`  Resposta correta: ${correctOptionIndex}`);

      return res.json({
        success: true,
        isCorrect,
        selectedAnswer: {
          index: selectedAnswerIndex,
          text: question.options[selectedAnswerIndex].label,
          isCorrect
        },
        correctAnswer: {
          index: correctOptionIndex,
          text: question.options[correctOptionIndex].label
        },
        explanation: question.explanation,
        points: isCorrect ? POINTS.QUIZ_QUESTION : 0
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
    const questionIdx = parseInt(questionIndex);
    if (isNaN(questionIdx) || questionIdx < 0 || questionIdx >= quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Índice de questão inválido'
      });
    }

    const question = quiz.questions[questionIdx];
    
    // Verificar se a opção existe
    if (isNaN(selectedAnswerIndex) || selectedAnswerIndex < 0 || selectedAnswerIndex >= question.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Opção inválida'
      });
    }

    // Verificar se a resposta está correta
    const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
    
    // Se não encontrar opção correta, logar erro e retornar erro
    if (correctOptionIndex === -1) {
      console.error(`❌ Erro: Questão ${questionIdx} não tem opção correta definida`);
      return res.status(500).json({
        success: false,
        message: 'Erro interno: questão mal configurada'
      });
    }
    
    const isCorrect = selectedAnswerIndex === correctOptionIndex;
    const selectedOption = question.options[selectedAnswerIndex];
    const correctOption = question.options[correctOptionIndex];
    
    console.log(`🔍 Validação da questão ${questionIdx}:`);
    console.log(`  Pergunta: "${question.question.substring(0, 40)}..."`);
    console.log(`  Resposta do usuário: ${selectedAnswerIndex} (${selectedOption.label})`);
    console.log(`  Resposta correta: ${correctOptionIndex} (${correctOption.label})`);
    console.log(`  Resultado: ${isCorrect ? '✅ Correta' : '❌ Incorreta'}`);

    res.json({
      success: true,
      isCorrect,
      selectedAnswer: {
        index: selectedAnswerIndex,
        text: selectedOption.label,
        isCorrect
      },
      correctAnswer: {
        index: correctOptionIndex,
        text: correctOption.label
      },
      explanation: selectedOption.explanation || correctOption.explanation || question.explanation || null,
      points: isCorrect ? POINTS.QUIZ_QUESTION : 0
    });
  } catch (error) {
    console.error('❌ Erro ao validar questão:', error);
    next(error);
  }
};

// @desc    Submeter quiz (público)
// @route   POST /api/quiz/:quizId/submit
// @access  Public
exports.submitQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body;

    console.log(`📝 Submissão pública de quiz: ${quizId}`);
    console.log(`🕐 Tempo gasto: ${timeSpent}s`);
    console.log(`📋 Respostas:`, answers);

    // Validar entrada
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Respostas inválidas'
      });
    }

    // Tratar desafio diário mock
    if (quizId === 'daily-challenge-mock') {
      const mockQuestions = [
        {
          question: "Qual é a duração de uma semibreve?",
          options: [
            { label: "1 tempo", isCorrect: false },
            { label: "2 tempos", isCorrect: false },
            { label: "4 tempos", isCorrect: true },
            { label: "8 tempos", isCorrect: false }
          ]
        },
        {
          question: "Quantas linhas tem a pauta musical?",
          options: [
            { label: "4 linhas", isCorrect: false },
            { label: "5 linhas", isCorrect: true },
            { label: "6 linhas", isCorrect: false },
            { label: "7 linhas", isCorrect: false }
          ]
        }
      ];

      let score = 0;
      const totalQuestions = mockQuestions.length;
      
      // Calcular score
      for (let i = 0; i < answers.length && i < totalQuestions; i++) {
        const userAnswer = answers[i];
        const question = mockQuestions[i];
        const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
        
        if (correctOptionIndex !== -1 && userAnswer === correctOptionIndex) {
          score++;
        }
      }

      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      
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

      return res.json({
        success: true,
        score,
        total: totalQuestions,
        percentage,
        feedback,
        timeSpent: timeSpent || 0,
        isDailyChallenge: true,
        message: 'Desafio diário completado!'
      });
    }

    // Buscar o quiz real
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz não encontrado'
      });
    }

    const totalQuestions = quiz.questions.length;

    let score = 0;
    const correctAnswers = [];
    const userAnswers = [];
    
    // Processar cada resposta do usuário (comparar por índice de opção)
    console.log('🔍 INÍCIO DO PROCESSAMENTO DAS RESPOSTAS (submitQuiz):');
    console.log('  Total de questões:', totalQuestions);
    console.log('  Respostas recebidas:', answers);
    
    for (let i = 0; i < answers.length && i < totalQuestions; i++) {
      const userAnswer = Number(answers[i]);
      const question = quiz.questions[i];
      
      console.log(`\n📝 Processando questão ${i + 1} (submitQuiz):`);
      console.log(`  Questão: ${question.question}`);
      console.log(`  Resposta do usuário: ${userAnswer} (tipo: ${typeof userAnswer})`);
      console.log(`  Opções disponíveis:`, question.options.map((opt, optIdx) => ({
        index: optIdx,
        label: opt.label,
        isCorrect: opt.isCorrect
      })));
      
      if (question && question.options && question.options.length > 0) {
        // Encontrar a opção correta para esta questão
        const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
        
        console.log(`  Índice da opção correta: ${correctOptionIndex}`);
        
        // Adicionar às listas para debug
        correctAnswers.push(correctOptionIndex);
        userAnswers.push(userAnswer);
        
        // Verificar se a resposta está correta (comparar índices)
        if (correctOptionIndex !== -1 && userAnswer === correctOptionIndex) {
          score++;
          console.log(`✅ Questão ${i + 1}: CORRETA! Usuário: ${userAnswer}, Correto: ${correctOptionIndex}`);
        } else {
          console.log(`❌ Questão ${i + 1}: INCORRETA! Usuário: ${userAnswer}, Correto: ${correctOptionIndex}`);
          console.log(`  Comparação: ${userAnswer} === ${correctOptionIndex} = ${userAnswer === correctOptionIndex}`);
        }
      } else {
        console.log(`⚠️ Questão ${i + 1}: Estrutura inválida ou sem opções`);
      }
    }
    
    console.log('\n📊 RESUMO DO PROCESSAMENTO (submitQuiz):');
    console.log(`  Score final: ${score}/${totalQuestions}`);
    console.log(`  Respostas do usuário: ${userAnswers}`);
    console.log(`  Respostas corretas: ${correctAnswers}`);

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

    res.json({
      success: true,
      score,
      total: totalQuestions,
      percentage,
      feedback,
      timeSpent: timeSpent || 0,
      message: 'Quiz completado com sucesso!'
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

    // ✅ TRATAR DESAFIO DIÁRIO MOCK (não existe no banco)
    if (quizId === 'daily-challenge-mock') {
      console.log('🌟 Detectado desafio diário MOCK - processando sem buscar no banco');
      
      // Para o mock, processar de forma simplificada
      const totalQuestions = Math.min(answers.length, 5);
      let score = 0;
      
      // Contar respostas corretas (mock sempre valida otimisticamente)
      answers.forEach(answer => {
        if (answer.isCorrect) score++;
      });
      
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      const passed = percentage >= 70; // Critério fixo para desafio diário
      
      // Buscar usuário para atualizar pontos
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      // Pontuação para desafio diário
      const basePoints = score * 10;
      const dailyBonus = POINTS.DAILY_CHALLENGE_BONUS || 50;
      const totalPoints = basePoints + (passed ? dailyBonus : 0);
      
      // Atualizar pontos do usuário
      user.totalPoints = (user.totalPoints || 0) + totalPoints;
      
      // Marcar como completado
      user.completedQuizzes.push({
        quizId: 'daily-challenge-mock',
        score,
        percentage,
        passed,
        completedAt: new Date()
      });
      
      await user.save();
      
      console.log(`✅ Desafio diário MOCK completo: ${score}/${totalQuestions} (${percentage}%)`);
      console.log(`💰 Pontos ganhos: ${totalPoints} (base: ${basePoints} + bônus: ${dailyBonus})`);
      
      return res.json({
        success: true,
        score,
        total: totalQuestions,
        percentage,
        passed,
        pointsEarned: totalPoints,
        totalPoints: user.totalPoints,
        isDailyChallenge: true,
        message: 'Desafio diário completado com sucesso!'
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
    console.log('🔍 INÍCIO DO PROCESSAMENTO DAS RESPOSTAS:');
    console.log('  Total de questões:', totalQuestions);
    console.log('  Respostas recebidas:', answers);
    console.log('  Quiz ID:', quizId);
    console.log('  Quiz encontrado:', quiz.title);
    console.log('  Estrutura do quiz:', JSON.stringify(quiz.questions.map((q, idx) => ({
      index: idx,
      question: q.question,
      options: q.options.map((opt, optIdx) => ({
        index: optIdx,
        label: opt.label,
        isCorrect: opt.isCorrect
      }))
    })), null, 2));
    
    // 🔍 DEBUG: Verificar se o quiz é o mesmo que foi validado
    console.log('🔍 Verificação de consistência do quiz:');
    console.log('  Quiz carregado do banco:');
    quiz.questions.forEach((q, idx) => {
      console.log(`    Questão ${idx + 1}: "${q.question}"`);
      q.options.forEach((opt, optIdx) => {
        console.log(`      Opção ${optIdx}: "${opt.label}" - isCorrect: ${opt.isCorrect}`);
      });
    });
    
    for (let i = 0; i < answers.length && i < totalQuestions; i++) {
      const userAnswer = Number(answers[i]); // Converter para número
      const question = quiz.questions[i];
      
      console.log(`\n📝 Processando questão ${i + 1}:`);
      console.log(`  Questão: ${question.question}`);
      console.log(`  Resposta do usuário (original): ${answers[i]} (tipo: ${typeof answers[i]})`);
      console.log(`  Resposta do usuário (convertida): ${userAnswer} (tipo: ${typeof userAnswer})`);
      console.log(`  Opções disponíveis:`, question.options.map((opt, optIdx) => ({
        index: optIdx,
        label: opt.label,
        isCorrect: opt.isCorrect
      })));
      
      if (question && question.options && question.options.length > 0) {
        const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
        
        console.log(`  Índice da opção correta: ${correctOptionIndex}`);
        
        // Adicionar às listas para debug
        correctAnswers.push(correctOptionIndex);
        userAnswers.push(userAnswer);
        
        // Verificar se a resposta está correta (comparar índices)
        if (correctOptionIndex !== -1 && userAnswer === correctOptionIndex) {
          score++;
          console.log(`✅ Questão ${i + 1}: CORRETA! Usuário: ${userAnswer}, Correto: ${correctOptionIndex}`);
        } else {
          console.log(`❌ Questão ${i + 1}: INCORRETA! Usuário: ${userAnswer}, Correto: ${correctOptionIndex}`);
          console.log(`  Comparação: ${userAnswer} === ${correctOptionIndex} = ${userAnswer === correctOptionIndex}`);
        }
      } else {
        console.log(`⚠️ Questão ${i + 1}: Estrutura inválida ou sem opções`);
      }
    }
    
    console.log('\n📊 RESUMO DO PROCESSAMENTO:');
    console.log(`  Score final: ${score}/${totalQuestions}`);
    console.log(`  Respostas do usuário: ${userAnswers}`);
    console.log(`  Respostas corretas: ${correctAnswers}`);

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
    
    // ✅ USAR O PASSING SCORE DO QUIZ (flexível por nível)
    const requiredScore = quiz.passingScore || 70; // fallback para 70%
    const isQuizPassed = percentage >= requiredScore;
    console.log(`📊 Nota necessária: ${requiredScore}% | Obtida: ${percentage}% | Passou: ${isQuizPassed}`);
    
    // LÓGICA DE BLOQUEIO: Se desempenho excelente (90%+), bloquear o quiz
    const isExcellentPerformance = percentage >= 90;
    const shouldBlockQuiz = isExcellentPerformance;
    
    // Gerenciar tentativas
    let quizAttempt = user.quizAttempts.find(qa => qa.quizId.toString() === quizId);
    
    if (!quizAttempt) {
      // Primeira tentativa
      quizAttempt = {
        quizId: quizId,
        attempts: 1,
        lastAttempt: new Date(),
        isBlocked: shouldBlockQuiz, // Bloquear se performance excelente
        blockedAt: shouldBlockQuiz ? new Date() : null
      };
      user.quizAttempts.push(quizAttempt);
    } else {
      // Incrementar tentativas
      quizAttempt.attempts += 1;
      quizAttempt.lastAttempt = new Date();
      
      // Se performance excelente, bloquear o quiz
      if (isExcellentPerformance && !quizAttempt.isBlocked) {
        quizAttempt.isBlocked = true;
        quizAttempt.blockedAt = new Date();
      }
      
      // ✅ COOLDOWN REDUZIDO: Se não passou e atingiu o limite, definir cooldown de 3h
      if (!isQuizPassed && quizAttempt.attempts >= (LIMITS.MAX_QUIZ_ATTEMPTS || 3)) {
        const cooldownHours = 3; // ✅ 3 horas (permite retentar no mesmo dia após estudar)
        quizAttempt.cooldownUntil = new Date(Date.now() + cooldownHours * 60 * 60 * 1000);
        console.log(`⏰ Cooldown de ${cooldownHours}h ativado. Próxima tentativa em: ${quizAttempt.cooldownUntil}`);
      }
    }
    
    // Adicionar quiz aos completados
    const quizCompletionData = {
      quizId: quizId,
      score: score,
      percentage: Math.round(percentage),
      completedAt: new Date(),
      passed: isQuizPassed
    };
    
    user.completedQuizzes.push(quizCompletionData);

    // Sistema de pontuação REBALANCEADO (baseado em módulos)
    const pointsBreakdown = calculateRebalancedPoints(
      score, 
      totalQuestions, 
      isDailyChallenge, 
      user.streak || 0
    );
    
    const totalPointsEarned = pointsBreakdown.totalPoints;
    
    console.log('📊 Pontos rebalanceados:', pointsBreakdown);
    
    // Adicionar ao total do usuário - garantir que totalPoints existe e é número
    if (typeof user.totalPoints !== 'number' || isNaN(user.totalPoints)) {
      console.log(`⚠️ totalPoints inválido (${user.totalPoints}), resetando para 0`);
      user.totalPoints = 0;
    }
    user.totalPoints += totalPointsEarned;
    console.log(`📊 Pontos do usuário: ${user.totalPoints} (+ ${totalPointsEarned})`);

    // O nível do usuário é atualizado automaticamente pelo hook pre('save') no modelo User
    // Não precisa chamar função separada
    
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
      pointsEarned: totalPointsEarned,
      totalPoints: user.totalPoints,
      isDailyChallenge,
      bonusBreakdown: pointsBreakdown,
      passed: isQuizPassed,
      attempts: {
        current: quizAttempt.attempts,
        remaining: Math.max(0, (LIMITS.MAX_QUIZ_ATTEMPTS || 3) - quizAttempt.attempts),
        maxAttempts: LIMITS.MAX_QUIZ_ATTEMPTS || 3,
        cooldownUntil: quizAttempt.cooldownUntil || null
      },
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
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = await User.findById(userId)
      .populate('completedQuizzes.quizId', 'title category level');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Ordenar por data (mais recente primeiro) e paginar
    const totalQuizzes = user.completedQuizzes.length;
    const skip = (page - 1) * limit;
    
    const paginatedQuizzes = user.completedQuizzes
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(skip, skip + limit);

    res.json({
      success: true,
      quizzes: paginatedQuizzes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalQuizzes / limit),
        totalQuizzes,
        hasNextPage: page < Math.ceil(totalQuizzes / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter estatísticas do usuário em quizzes
// @route   GET /api/quiz/stats
// @access  Private
exports.getQuizStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Calcular estatísticas
    const totalQuizzes = user.completedQuizzes.length;
    const passedQuizzes = user.completedQuizzes.filter(q => q.passed).length;
    const averageScore = totalQuizzes > 0 
      ? user.completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / totalQuizzes
      : 0;
    const averagePercentage = totalQuizzes > 0
      ? user.completedQuizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / totalQuizzes
      : 0;

    // Último quiz completado
    const lastQuiz = user.completedQuizzes.length > 0
      ? user.completedQuizzes[user.completedQuizzes.length - 1]
      : null;

    res.json({
      success: true,
      stats: {
        totalQuizzes,
        passedQuizzes,
        passRate: totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0,
        averageScore: Math.round(averageScore * 10) / 10, // Uma casa decimal
        averagePercentage: Math.round(averagePercentage),
        totalPoints: user.totalPoints,
        lastQuizDate: lastQuiz ? lastQuiz.completedAt : null,
        lastQuizPassed: lastQuiz ? lastQuiz.passed : null
      }
    });
  } catch (error) {
    next(error);
  }
};