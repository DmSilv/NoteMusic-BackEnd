const QuizAttempt = require('../models/quizAttempt.model');

// ✅ VERIFICAR SE PODE TENTAR NOVAMENTE (COOLDOWN ESPECÍFICO POR QUIZ)
exports.checkQuizAttempt = async (req, res) => {
    try {
        const { quizId, moduleId } = req.params;
        const userId = req.user.id;

        if (!quizId || !moduleId) {
            return res.status(400).json({
                success: false,
                message: 'Quiz ID e Module ID são obrigatórios'
            });
        }

        console.log(`🔍 Verificando tentativa para usuário ${userId} no quiz ${quizId} (módulo ${moduleId})`);

        // ✅ VERIFICAÇÃO ESPECÍFICA POR QUIZ - não afeta outros quizzes
        const attemptStatus = await QuizAttempt.canAttemptQuiz(userId, quizId);

        console.log(`📊 Status da tentativa para quiz ${quizId}:`, attemptStatus);

        // ✅ LOGICA DE NEGÓCIO: Cada quiz tem seu próprio cooldown
        if (attemptStatus.reason === 'cooldown') {
            console.log(`⏰ Quiz ${quizId} em cooldown para usuário ${userId} - ${attemptStatus.timeRemaining}min restantes`);
        } else if (attemptStatus.reason === 'cooldown_expired') {
            console.log(`✅ Cooldown do quiz ${quizId} expirado para usuário ${userId} - pode tentar novamente`);
        } else if (attemptStatus.reason === 'primeira_tentativa') {
            console.log(`🆕 Usuário ${userId} pode fazer quiz ${quizId} pela primeira vez`);
        } else if (attemptStatus.reason === 'segunda_tentativa') {
            console.log(`⚠️ Usuário ${userId} pode fazer quiz ${quizId} pela segunda (última) vez`);
        }

        return res.status(200).json({
            success: true,
            data: attemptStatus
        });

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
        const { quizId, moduleId } = req.body;
        const userId = req.user.id;

        if (!quizId || !moduleId) {
            return res.status(400).json({
                success: false,
                message: 'Quiz ID e Module ID são obrigatórios'
            });
        }

        console.log(`📝 Registrando tentativa para usuário ${userId} no quiz ${quizId} (módulo ${moduleId})`);

        // ✅ REGISTRO ESPECÍFICO POR QUIZ - não afeta outros quizzes
        const result = await QuizAttempt.registerAttempt(userId, quizId, moduleId);

        console.log(`✅ Tentativa registrada para quiz ${quizId}:`, result);

        // ✅ LOGICA DE NEGÓCIO: Cooldown aplicado apenas ao quiz específico
        if (result.cooldownUntil) {
            console.log(`⏰ Cooldown de 30min aplicado ao quiz ${quizId} para usuário ${userId}`);
            console.log(`   Próxima tentativa disponível em: ${result.cooldownUntil}`);
        } else {
            console.log(`✅ Quiz ${quizId} - tentativa ${result.attemptNumber} registrada sem cooldown`);
        }

        return res.status(200).json({
            success: true,
            message: 'Tentativa registrada com sucesso',
            data: result
        });

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
        const userId = req.user.id;
        const { moduleId } = req.query;

        let query = { userId, isActive: true };
        if (moduleId) {
            query.moduleId = moduleId;
        }

        const attempts = await QuizAttempt.find(query)
            .sort({ timestamp: -1 })
            .limit(50);

        console.log(`📊 Histórico de tentativas para usuário ${userId}: ${attempts.length} registros`);

        return res.status(200).json({
            success: true,
            data: attempts
        });

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
        console.log('🧹 Iniciando limpeza automática de tentativas expiradas...');

        const cleanedCount = await QuizAttempt.cleanupExpiredAttempts();

        return res.status(200).json({
            success: true,
            message: `Limpeza concluída: ${cleanedCount} tentativas expiradas foram removidas`,
            cleanedCount
        });

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
        const { quizId, userId } = req.body;
        const adminId = req.user.id;

        // Verificar se é admin (implementar lógica de admin)
        // if (!req.user.isAdmin) {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Acesso negado: apenas administradores'
        //     });
        // }

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: 'Quiz ID é obrigatório'
            });
        }

        let query = { quizId };
        if (userId) {
            query.userId = userId;
        }

        const result = await QuizAttempt.updateMany(
            query,
            { isActive: false }
        );

        console.log(`🔄 Reset de tentativas: ${result.modifiedCount} registros desativados`);

        return res.status(200).json({
            success: true,
            message: `Reset concluído: ${result.modifiedCount} tentativas foram resetadas`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('❌ Erro ao resetar tentativas:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};
