const mongoose = require('mongoose');
const Quiz = require('../models/quiz.model');
const User = require('../models/user.model');
const Module = require('../models/module.model');
const { invalidateCache } = require('../middlewares/cache');
const { USER_LEVELS, POINTS, LIMITS } = require('../utils/constants');
const { calculateRebalancedPoints, GAMIFICATION_CONSTANTS } = require('../utils/gamificationRebalanced');
const { generateDailyChallengeConfig, getTodayChallengeInfo } = require('../utils/dailyChallengeGenerator');
const { shuffleArray, shuffleQuestionOptions } = require('../utils/shuffle');

class QuizService {

static async getQuizCompletionStatus(userId, quizId) {
    

    // ✅ VALIDAÇÃO CRÍTICA: Garantir que estamos buscando o usuário correto
    console.log(`🔍 [COMPLETION-STATUS] Verificando quiz ${quizId} para usuário ${userId}`);
    
    // Buscar usuário SEM cache e garantindo que buscamos pelo ID correto
    const user = await User.findById(userId).select('completedQuizzes email name');
    if (!user) {
      console.error(`❌ [COMPLETION-STATUS] Usuário ${userId} não encontrado no banco`);
      return { status: 404, body: {
        success: false,
        message: 'Usuário não encontrado'
      } };
    }

    // ✅ VALIDAÇÃO DE SEGURANÇA: Verificar se o usuário da requisição corresponde ao usuário do banco
    if (user._id.toString() !== userId.toString()) {
      console.error(`❌ [COMPLETION-STATUS] ERRO CRÍTICO: ID do usuário não corresponde! req.user.id: ${userId}, user._id: ${user._id}`);
      return { status: 500, body: {
        success: false,
        message: 'Erro interno: inconsistência de dados do usuário'
      } };
    }

    // ✅ LOG: Verificar quantos quizzes completados o usuário tem
    const totalCompletedQuizzes = user.completedQuizzes?.length || 0;
    console.log(`📊 [COMPLETION-STATUS] Usuário ${user.email} (${userId}) tem ${totalCompletedQuizzes} quiz(es) completado(s)`);
    
    // Se o usuário não tem quizzes completados, retornar imediatamente
    if (totalCompletedQuizzes === 0) {
      console.log(`✅ [COMPLETION-STATUS] Usuário novo ou sem quizzes completados - retornando NÃO COMPLETO`);
      return { status: 200, body: {
        success: true,
        isCompleted: false,
        completionData: null
      } };
    }

    // ✅ VALIDAÇÃO ROBUSTA: Tentar múltiplas estratégias para encontrar o quiz
    let completedQuiz = null;
    let quizFound = false;
    
    // Estratégia 1: Buscar quiz pelo moduleId (caso o ID fornecido seja um moduleId)
    const quizByModule = await Quiz.findOne({ moduleId: quizId });
    if (quizByModule) {
      quizFound = true;
      // Se encontrou quiz pelo moduleId, verificar usando o _id do quiz
      completedQuiz = user.completedQuizzes.find(cq => {
        if (!cq.quizId) return false;
        return cq.quizId.toString() === quizByModule._id.toString();
      });
      if (completedQuiz) {
        console.log(`✅ [COMPLETION-STATUS] Quiz encontrado por moduleId ${quizId} → quiz._id: ${quizByModule._id} → COMPLETO`);
        console.log(`   📝 Detalhes: passed=${completedQuiz.passed}, percentage=${completedQuiz.percentage || 'N/A'}%`);
      } else {
        console.log(`🔍 [COMPLETION-STATUS] Quiz encontrado por moduleId ${quizId} → quiz._id: ${quizByModule._id} → NÃO COMPLETO`);
      }
    }
    
    // Estratégia 2: Se não encontrou pelo moduleId, tentar buscar diretamente pelo quizId
    if (!completedQuiz) {
      completedQuiz = user.completedQuizzes.find(cq => {
        if (!cq.quizId) return false;
        const quizIdStr = cq.quizId.toString();
        return quizIdStr === quizId;
      });
      
      if (completedQuiz) {
        console.log(`✅ [COMPLETION-STATUS] Quiz encontrado diretamente pelo quizId: ${quizId} → COMPLETO`);
        console.log(`   📝 Detalhes: passed=${completedQuiz.passed}, percentage=${completedQuiz.percentage || 'N/A'}%`);
        quizFound = true;
      } else {
        // Se não encontrou, tentar buscar o quiz no banco para confirmar que existe
        const quizExists = await Quiz.findById(quizId);
        if (quizExists) {
          console.log(`🔍 [COMPLETION-STATUS] Quiz existe no banco (${quizId}) mas não foi completado pelo usuário ${userId}`);
          quizFound = true;
        } else {
          console.log(`⚠️ [COMPLETION-STATUS] Quiz não encontrado no banco: ${quizId}`);
        }
      }
    }

    // ✅ VALIDAÇÃO EXPLÍCITA: Verificar se passou no quiz (apenas quizzes aprovados contam)
    const isCompleted = completedQuiz && completedQuiz.passed === true;
    
    // ✅ LOG DETALHADO para debug
    if (quizFound) {
      console.log(`📊 [COMPLETION-STATUS] Status final para quiz ${quizId} (usuário ${userId}): ${isCompleted ? '✅ COMPLETO' : '❌ NÃO COMPLETO'}`);
      if (completedQuiz && !completedQuiz.passed) {
        console.log(`   ⚠️ Quiz foi feito mas NÃO passou (score: ${completedQuiz.percentage || 'N/A'}%)`);
      }
    } else {
      console.log(`⚠️ [COMPLETION-STATUS] Quiz ${quizId} não encontrado - retornando como não completo por segurança`);
    }

    // ✅ VALIDAÇÃO FINAL: Garantir que não estamos retornando dados de outro usuário
    if (completedQuiz && isCompleted) {
      console.log(`✅ [COMPLETION-STATUS] Validação final: Quiz ${quizId} está COMPLETO para usuário ${userId} (${user.email})`);
    }

    return { status: 200, body: {
      success: true,
      isCompleted,
      completionData: completedQuiz || null
    } };
}

static async getQuizAttemptsStatus(userId, quizId) {
    

    // ✅ VALIDAÇÃO CRÍTICA: Garantir que estamos buscando o usuário correto
    console.log(`🔍 [ATTEMPTS-STATUS] Verificando tentativas do quiz ${quizId} para usuário ${userId}`);
    
    // Buscar usuário SEM cache e garantindo que buscamos pelo ID correto
    const user = await User.findById(userId).select('quizAttempts completedQuizzes email name');
    if (!user) {
      console.error(`❌ [ATTEMPTS-STATUS] Usuário ${userId} não encontrado no banco`);
      return { status: 404, body: {
        success: false,
        message: 'Usuário não encontrado'
      } };
    }

    // ✅ VALIDAÇÃO DE SEGURANÇA: Verificar se o usuário da requisição corresponde ao usuário do banco
    if (user._id.toString() !== userId.toString()) {
      console.error(`❌ [ATTEMPTS-STATUS] ERRO CRÍTICO: ID do usuário não corresponde! req.user.id: ${userId}, user._id: ${user._id}`);
      return { status: 500, body: {
        success: false,
        message: 'Erro interno: inconsistência de dados do usuário'
      } };
    }

    // ✅ LOG: Verificar quantas tentativas o usuário tem
    const totalQuizAttempts = user.quizAttempts?.length || 0;
    console.log(`📊 [ATTEMPTS-STATUS] Usuário ${user.email} (${userId}) tem ${totalQuizAttempts} registro(s) de tentativas`);
    
    // Se o usuário não tem tentativas, retornar imediatamente com valores zerados
    if (totalQuizAttempts === 0) {
      console.log(`✅ [ATTEMPTS-STATUS] Usuário novo ou sem tentativas - retornando valores zerados`);
      const maxAttempts = LIMITS.MAX_QUIZ_ATTEMPTS || 3;
      return { status: 200, body: {
        success: true,
        canAttempt: true,
        attemptsUsed: 0,
        attemptsRemaining: maxAttempts,
        maxAttempts,
        isInCooldown: false,
        cooldownUntil: null,
        hasPassed: false,
        lastAttempt: null
      } };
    }

    // Buscar tentativas para este quiz
    const quizAttempt = user.quizAttempts.find(qa => {
      if (!qa.quizId) return false;
      return qa.quizId.toString() === quizId;
    });

    // ✅ LOG: Verificar se encontrou tentativa para este quiz
    if (quizAttempt) {
      console.log(`📊 [ATTEMPTS-STATUS] Tentativa encontrada para quiz ${quizId}:`);
      console.log(`   attempts: ${quizAttempt.attempts}`);
      console.log(`   isBlocked: ${quizAttempt.isBlocked || false}`);
      console.log(`   cooldownUntil: ${quizAttempt.cooldownUntil || 'null'}`);
    } else {
      console.log(`✅ [ATTEMPTS-STATUS] Nenhuma tentativa encontrada para quiz ${quizId} - usuário pode tentar`);
    }

    const maxAttempts = LIMITS.MAX_QUIZ_ATTEMPTS || 3;
    const attemptsUsed = quizAttempt ? quizAttempt.attempts : 0;
    const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);

    // Verificar se está em cooldown
    const now = new Date();
    const isInCooldown = quizAttempt && quizAttempt.cooldownUntil && quizAttempt.cooldownUntil > now;
    const cooldownUntil = isInCooldown ? quizAttempt.cooldownUntil : null;

    // Verificar se já passou no quiz
    const completedQuiz = user.completedQuizzes.find(cq => {
      if (!cq.quizId) return false;
      return cq.quizId.toString() === quizId && cq.passed === true;
    });
    const hasPassed = !!completedQuiz;

    // ✅ VALIDAÇÃO FINAL: Garantir que não estamos retornando dados de outro usuário
    if (quizAttempt && attemptsUsed > 0) {
      console.log(`✅ [ATTEMPTS-STATUS] Validação final: Quiz ${quizId} tem ${attemptsUsed} tentativa(s) para usuário ${userId} (${user.email})`);
    }

    return { status: 200, body: {
      success: true,
      canAttempt: !isInCooldown && (attemptsRemaining > 0 || hasPassed),
      attemptsUsed,
      attemptsRemaining,
      maxAttempts,
      isInCooldown,
      cooldownUntil,
      hasPassed,
      lastAttempt: quizAttempt ? quizAttempt.lastAttempt : null
    } };
}

static async getQuiz(moduleId) {

    console.log(`🔍 Buscando quiz para módulo: ${moduleId}`);

    // Buscar o quiz pelo módulo
    const quiz = await Quiz.findOne({ moduleId: moduleId });
    
    if (!quiz) {
      console.log(`❌ Quiz não encontrado para módulo: ${moduleId}`);
      return { status: 404, body: {
        success: false,
        message: 'Quiz não encontrado para este módulo'
      } };
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

    return { status: 200, body: {
      success: true,
      quiz: publicQuiz
    } };
}

static async unlockDailyChallenge(userId) {

    
    const user = await User.findById(userId);
    
    if (!user) {
      return { status: 404, body: {
        success: false,
        message: 'Usuário não encontrado'
      } };
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
    
    return { status: 200, body: {
      success: true,
      message: 'Desafio diário desbloqueado com sucesso'
    } };
    
}
static async getQuizByModule(moduleId) {

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
      
      return { status: 404, body: {
        success: false,
        message: 'Quiz não encontrado para este módulo'
      } };
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

    return { status: 200, body: {
      success: true,
      quiz: safeQuiz
    } };
}

static async getDailyChallengeInfo() {
    const config = getTodayChallengeInfo();
    
    return { status: 200, body: {
      success: true,
      config: {
        questions: config.questions,
        timeMinutes: config.timeMinutes,
        difficulty: config.difficulty
      },
      date: config.date
    } };
}

/**
 * Monta (ou reaproveita) o quiz do tipo 'daily-challenge' de hoje, sorteando
 * `count` questões distintas de um pool grande (todas as questões de módulos
 * ativos) e embaralhando as alternativas de cada uma. Isso resolve dois
 * problemas: (1) o desafio diário sempre repetia as mesmas ~5 perguntas fixas
 * (sem rotação); (2) com um pool tão pequeno, a resposta certa acabava
 * concentrada nas mesmas letras (ex.: sempre B).
 */
static async _regenerateDailyChallenge(_existingDoc, config) {
    // Sempre opera no documento DO DIA (semana pré-gerada pode ter 7 docs).
    const existingForToday = await Quiz.findOne({
      type: 'daily-challenge',
      dailyChallengeDate: config.date
    });

    const pool = await Quiz.aggregate([
      { $match: { type: 'module', isActive: true } },
      { $unwind: '$questions' },
      {
        $project: {
          moduleId: 1,
          level: 1,
          question: '$questions'
        }
      }
    ]);

    if (pool.length === 0) {
      return null;
    }

    const count = Math.min(config.questions, pool.length);
    const selected = shuffleArray(pool).slice(0, count);

    const questions = selected.map((item) => {
      const shuffled = shuffleQuestionOptions(item.question);
      return {
        question: shuffled.question,
        options: shuffled.options.map((option) => ({
          id: option.id,
          label: option.label,
          isCorrect: option.isCorrect,
          explanation: option.explanation
        })),
        category: shuffled.category,
        difficulty: shuffled.difficulty || 'medio',
        points: shuffled.points || 15
      };
    });

    const sampleModuleId = selected[0].moduleId;
    const sampleLevel = selected[0].level || 'aprendiz';

    if (existingForToday) {
      existingForToday.questions = questions;
      existingForToday.timeLimit = config.timeLimit;
      existingForToday.dailyChallengeDate = config.date;
      existingForToday.isActive = true;
      existingForToday.moduleId = existingForToday.moduleId || sampleModuleId;
      existingForToday.level = existingForToday.level || sampleLevel;
      await existingForToday.save();
      return existingForToday;
    }

    return await Quiz.create({
      title: 'Desafio Diário de Teoria Musical',
      description: 'Teste seus conhecimentos musicais com o desafio especial de hoje!',
      moduleId: sampleModuleId,
      questions,
      timeLimit: config.timeLimit,
      level: sampleLevel,
      type: 'daily-challenge',
      isActive: true,
      dailyChallengeDate: config.date
    });
}

static async getDailyChallenge() {
    // Obter configuração do dia
    const config = generateDailyChallengeConfig();

    // Preferência: desafio da data de hoje (pacote semanal pré-gerado ou fallback).
    let dailyQuiz = await Quiz.findOne({
      type: 'daily-challenge',
      dailyChallengeDate: config.date
    });

    // Se a semana ainda não foi gerada, monta um desafio do dia a partir do pool
    // de módulos — sem sobrescrever os outros dias da semana.
    if (!dailyQuiz) {
      const regenerated = await this._regenerateDailyChallenge(null, config);
      if (regenerated) {
        dailyQuiz = regenerated;
      } else {
        return { status: 404, body: {
          success: false,
          message: 'Nenhum quiz disponível para desafio diário'
        } };
      }
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
            label: option.label
            // isCorrect NÃO é exposto na API pública — validação só no servidor
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

    return { status: 200, body: {
      success: true,
      dailyChallenge: dailyChallengeQuiz
    } };
}

static async validateQuestion(quizId, questionIndex, selectedAnswer) {
    

    console.log(`🔍 Validando questão ${questionIndex} do quiz ${quizId}`);
    console.log(`📝 Resposta selecionada: ${selectedAnswer} (tipo: ${typeof selectedAnswer})`);

    // Validar entrada
    if (selectedAnswer === undefined || selectedAnswer === null) {
      return { status: 400, body: {
        success: false,
        message: 'Resposta é obrigatória'
      } };
    }

    // Converter para número para garantir comparação consistente
    const selectedAnswerIndex = Number(selectedAnswer);

    // Tratar desafio diário mock (compatibilidade com apps antigos que ainda
    // enviam esse id fixo). Em vez de usar perguntas fixas embutidas no
    // código — que ficavam com a resposta certa quase sempre em B — busca o
    // desafio diário real gravado no banco, que é sorteado e embaralhado.
    if (quizId === 'daily-challenge-mock') {
      // ✅ VALIDAÇÃO: Converter questionIndex para número e validar
      const questionIdx = parseInt(questionIndex);
      
      if (isNaN(questionIdx) || questionIdx < 0) {
        console.error(`❌ Índice de questão inválido: ${questionIndex} (convertido: ${questionIdx})`);
        return { status: 400, body: {
          success: false,
          message: `Índice de questão inválido: ${questionIndex}`
        } };
      }

      const dailyQuiz = await Quiz.findOne({ type: 'daily-challenge' });
      const mockQuestions = dailyQuiz ? dailyQuiz.questions : [];

      // ✅ VALIDAÇÃO ROBUSTA: Verificar se o índice está dentro do array
      if (mockQuestions.length === 0 || questionIdx >= mockQuestions.length) {
        console.error(`❌ Índice de questão ${questionIdx} inválido para desafio diário (max: ${mockQuestions.length - 1})`);
        return { status: 400, body: {
          success: false,
          message: `Índice de questão ${questionIdx} inválido para desafio diário (max: ${mockQuestions.length - 1})`
        } };
      }

      const question = mockQuestions[questionIdx];
      if (!question) {
        console.error(`❌ Questão não encontrada no índice ${questionIdx}`);
        return { status: 400, body: {
          success: false,
          message: `Questão não encontrada no índice ${questionIdx}`
        } };
      }

      const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
      
      // Converter para garantir comparação numérica
      const isCorrect = selectedAnswerIndex === correctOptionIndex;
      
      console.log(`${isCorrect ? '✅' : '❌'} Questão ${questionIndex}: ${isCorrect ? 'Correta' : 'Incorreta'}`);
      console.log(`  Resposta do usuário: ${selectedAnswerIndex} (convertido para número)`);
      console.log(`  Resposta correta: ${correctOptionIndex}`);

      return { status: 200, body: {
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
      } };
    }

    // Buscar o quiz real no banco de dados
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return { status: 404, body: {
        success: false,
        message: 'Quiz não encontrado'
      } };
    }

    // Verificar se a questão existe
    const questionIdx = parseInt(questionIndex);
    if (isNaN(questionIdx) || questionIdx < 0 || questionIdx >= quiz.questions.length) {
      return { status: 400, body: {
        success: false,
        message: 'Índice de questão inválido'
      } };
    }

    const question = quiz.questions[questionIdx];
    
    // Verificar se a opção existe
    if (isNaN(selectedAnswerIndex) || selectedAnswerIndex < 0 || selectedAnswerIndex >= question.options.length) {
      return { status: 400, body: {
        success: false,
        message: 'Opção inválida'
      } };
    }

    // Verificar se a resposta está correta
    const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
    
    // Se não encontrar opção correta, logar erro e retornar erro
    if (correctOptionIndex === -1) {
      console.error(`❌ Erro: Questão ${questionIdx} não tem opção correta definida`);
      return { status: 500, body: {
        success: false,
        message: 'Erro interno: questão mal configurada'
      } };
    }
    
    const isCorrect = selectedAnswerIndex === correctOptionIndex;
    const selectedOption = question.options[selectedAnswerIndex];
    const correctOption = question.options[correctOptionIndex];
    
    console.log(`🔍 Validação da questão ${questionIdx}:`);
    console.log(`  Pergunta: "${question.question.substring(0, 40)}..."`);
    console.log(`  Resposta do usuário: ${selectedAnswerIndex} (${selectedOption.label})`);
    console.log(`  Resposta correta: ${correctOptionIndex} (${correctOption.label})`);
    console.log(`  Resultado: ${isCorrect ? '✅ Correta' : '❌ Incorreta'}`);

    return { status: 200, body: {
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
    } };
}

static async submitQuiz(quizId, { answers, timeSpent }) {
    

    console.log(`📝 Submissão pública de quiz: ${quizId}`);
    console.log(`🕐 Tempo gasto: ${timeSpent}s`);
    console.log(`📋 Respostas:`, answers);

    // Validar entrada
    if (!answers || !Array.isArray(answers)) {
      return { status: 400, body: {
        success: false,
        message: 'Respostas inválidas'
      } };
    }

    // Tratar desafio diário mock (compatibilidade com apps antigos) — usa o
    // desafio diário real gravado no banco em vez de perguntas fixas.
    if (quizId === 'daily-challenge-mock') {
      const dailyQuiz = await Quiz.findOne({ type: 'daily-challenge' });
      const mockQuestions = dailyQuiz ? dailyQuiz.questions : [];

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

      return { status: 200, body: {
        success: true,
        score,
        total: totalQuestions,
        percentage,
        feedback,
        timeSpent: timeSpent || 0,
        isDailyChallenge: true,
        message: 'Desafio diário completado!'
      } };
    }

    // Buscar o quiz real
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return { status: 404, body: {
        success: false,
        message: 'Quiz não encontrado'
      } };
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

    return { status: 200, body: {
      success: true,
      score,
      total: totalQuestions,
      percentage,
      feedback,
      timeSpent: timeSpent || 0,
      message: 'Quiz completado com sucesso!'
    } };

}

static async submitQuizPrivate(userId, quizId, { answers, timeSpent }) {
    
    

    // Validar entrada
    if (!answers || !Array.isArray(answers)) {
      return { status: 400, body: {
        success: false,
        message: 'Respostas inválidas'
      } };
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
        return { status: 404, body: {
          success: false,
          message: 'Usuário não encontrado'
        } };
      }
      
      // Pontuação para desafio diário
      const basePoints = score * 10;
      const dailyBonus = POINTS.DAILY_CHALLENGE_BONUS || 50;
      const totalPoints = basePoints + (passed ? dailyBonus : 0);
      
      // Atualizar pontos do usuário
      user.totalPoints = (user.totalPoints || 0) + totalPoints;
      
      // Marcar como completado (sem quizId para evitar erro de ObjectId)
      user.completedQuizzes.push({
        quizId: null, // Não usar ID mock para evitar erro de ObjectId
        score,
        percentage,
        passed,
        completedAt: new Date(),
        isDailyChallenge: true // Marcar como desafio diário
      });
      
      await user.save();
      
      console.log(`✅ Desafio diário MOCK completo: ${score}/${totalQuestions} (${percentage}%)`);
      console.log(`💰 Pontos ganhos: ${totalPoints} (base: ${basePoints} + bônus: ${dailyBonus})`);
      
      return { status: 200, body: {
        success: true,
        score,
        total: totalQuestions,
        percentage,
        passed,
        pointsEarned: totalPoints,
        totalPoints: user.totalPoints,
        isDailyChallenge: true,
        message: 'Desafio diário completado com sucesso!'
      } };
    }

    // Buscar o quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return { status: 404, body: {
        success: false,
        message: 'Quiz não encontrado'
      } };
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
        return { status: 403, body: {
          success: false,
          message: 'Você já completou o desafio de hoje! Volte amanhã para um novo desafio.',
          nextChallengeTime: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        } };
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
    
    // ✅ AJUSTE PARA QUIZZES PEQUENOS: Mais justo para quizzes com poucas perguntas
    // Se o quiz tem 3-4 perguntas e已达 usuário está muito perto da nota (diferença < 5%),
    // considerar aprovado para evitar frustração
    let adjustedRequiredScore = quiz.passingScore || 70;
    const exactPercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    
    if (totalQuestions <= 4 && exactPercentage > 0) {
        // Se está entre 65% e 70% (margem de tolerância), aprovar
        if (exactPercentage >= 65 && exactPercentage < adjustedRequiredScore && adjustedRequiredScore === 70) {
            adjustedRequiredScore = 65; // Aprovar com 65% em quizzes de 3-4 perguntas
            console.log(`✅ Ajuste aplicado: Quiz pequeno (${totalQuestions} perguntas), aprovando com ${exactPercentage.toFixed(1)}% (margem de tolerância)`);
        }
    }
    
    // Debug: mostrar informações para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Debug Quiz Private Submission:');
      console.log('  Quiz ID:', quizId);
      console.log('  Total Questions:', totalQuestions);
      console.log('  User Answers:', userAnswers);
      console.log('  Correct Answers:', correctAnswers);
      console.log('  Score:', score);
      console.log('  Percentage:', percentage);
      console.log('  Required Score:', adjustedRequiredScore);
    }

    // Gerar feedback
    let feedback = '';
    if (percentage >= 90) {
      feedback = 'Excelente! Você demonstrou um conhecimento excepcional!';
    } else if (percentage >= 70) {
      feedback = 'Muito bom! Continue praticando para melhorar ainda mais!';
    } else if (percentage >= 65) {
      feedback = 'Bom trabalho! Você está no caminho certo!';
    } else if (percentage >= 50) {
      feedback = 'Bom trabalho! Revise o conteúdo para melhorar seu desempenho.';
    } else {
      feedback = 'Continue estudando! A prática leva à perfeição.';
    }

    // Salvar resultado no banco de dados
    const user = await User.findById(userId);
    
    // ✅ USAR O SCORE AJUSTADO PARA QUIZZES PEQUENOS
    const isQuizPassed = percentage >= adjustedRequiredScore;
    console.log(`📊 Nota necessária: ${adjustedRequiredScore}% | Obtida: ${percentage}% | Passou: ${isQuizPassed}`);
    
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

    // ❌ NOVO SISTEMA: Quiz NÃO dá pontos
    // Pontos são dados APENAS ao completar módulos inteiros
    const totalPointsEarned = 0;
    
    console.log('📊 Quiz completado mas SEM pontos (sistema baseado em módulos)');
    console.log('📊 Pontos serão dados ao completar o módulo completo');

    // O nível do usuário é atualizado automaticamente pelo hook pre('save') no modelo User
    // Não precisa chamar função separada
    
    await user.save();

    let moduleCompleted = false;
    let responseTotalPoints = user.totalPoints;
    let responseLevel = user.level;

    if (isQuizPassed && quiz.moduleId && !isDailyChallenge) {
      try {
        const ModuleService = require('./module.service');
        const completeResult = await ModuleService.completeModule(
          quiz.moduleId.toString(),
          userId
        );

        if (completeResult.status === 200) {
          moduleCompleted = true;
          const freshUser = await User.findById(userId);
          if (freshUser) {
            responseTotalPoints = freshUser.totalPoints;
            responseLevel = freshUser.level;
          }
          console.log(`✅ [SUBMIT] Módulo auto-concluído após quiz aprovado: ${quiz.moduleId}`);
        } else {
          console.warn(
            `⚠️ [SUBMIT] Não foi possível auto-concluir módulo: ${completeResult.body?.message}`
          );
        }
      } catch (autoCompleteError) {
        console.warn('⚠️ [SUBMIT] Erro ao auto-concluir módulo:', autoCompleteError.message);
      }
    }

    invalidateCache('/api/gamification');
    console.log('🗑️ [SUBMIT] Cache de gamificação invalidado após quiz');

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

    return { status: 200, body: {
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
      totalPoints: responseTotalPoints,
      level: responseLevel,
      moduleCompleted,
      isDailyChallenge,
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
    } };
}

static async getQuizHistory(userId, { page = 1, limit = 10 } = {}) {
    const { LIMITS } = require('../utils/constants');
    const safeLimit = Math.min(
      Math.max(parseInt(limit, 10) || LIMITS.DEFAULT_PAGE_LIMIT, 1),
      LIMITS.MAX_PAGE_LIMIT
    );
    const safePage = Math.max(parseInt(page, 10) || 1, 1);

    const user = await User.findById(userId)
      .populate('completedQuizzes.quizId', 'title category level');

    if (!user) {
      return { status: 404, body: {
        success: false,
        message: 'Usuário não encontrado'
      } };
    }

    // Ordenar por data (mais recente primeiro) e paginar
    const totalQuizzes = user.completedQuizzes.length;
    const skip = (safePage - 1) * safeLimit;
    
    const paginatedQuizzes = user.completedQuizzes
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(skip, skip + safeLimit);

    return { status: 200, body: {
      success: true,
      quizzes: paginatedQuizzes,
      pagination: {
        currentPage: safePage,
        totalPages: Math.ceil(totalQuizzes / safeLimit) || 0,
        totalQuizzes,
        hasNextPage: safePage < Math.ceil(totalQuizzes / safeLimit),
        hasPrevPage: safePage > 1
      }
    } };
}

static async getQuizStats(userId) {

    const user = await User.findById(userId);
    if (!user) {
      return { status: 404, body: {
        success: false,
        message: 'Usuário não encontrado'
      } };
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

    return { status: 200, body: {
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
    } };
}

}

module.exports = QuizService;
