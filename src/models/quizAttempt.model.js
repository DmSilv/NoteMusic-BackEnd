const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: String,
        required: true
    },
    moduleId: {
        type: String,
        required: true
    },
    attemptNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 2
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    cooldownUntil: {
        type: Date,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        required: true,
        // Expira automaticamente após 24 horas
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
}, {
    timestamps: true
});

// ✅ ÍNDICES para performance
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ userId: 1, moduleId: 1 });
quizAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ✅ MÉTODO para verificar se pode tentar novamente
quizAttemptSchema.statics.canAttemptQuiz = async function(userId, quizId) {
    try {
        const now = new Date();
        
        // Buscar tentativa mais recente para este quiz
        const latestAttempt = await this.findOne({
            userId,
            quizId,
            isActive: true
        }).sort({ timestamp: -1 });
        
        if (!latestAttempt) {
            // Primeira tentativa - permitir
            return {
                canAttempt: true,
                attemptNumber: 1,
                reason: 'primeira_tentativa'
            };
        }
        
        // Se já tentou 2 vezes, verificar cooldown
        if (latestAttempt.attemptNumber >= 2) {
            if (latestAttempt.cooldownUntil && now < latestAttempt.cooldownUntil) {
                const timeRemaining = Math.ceil((latestAttempt.cooldownUntil - now) / (1000 * 60));
                return {
                    canAttempt: false,
                    attemptNumber: latestAttempt.attemptNumber,
                    reason: 'cooldown',
                    timeRemaining,
                    cooldownUntil: latestAttempt.cooldownUntil
                };
            } else {
                // Cooldown expirado - resetar para primeira tentativa
                return {
                    canAttempt: true,
                    attemptNumber: 1,
                    reason: 'cooldown_expired'
                };
            }
        }
        
        // Segunda tentativa - permitir
        return {
            canAttempt: true,
            attemptNumber: latestAttempt.attemptNumber + 1,
            reason: 'segunda_tentativa'
        };
        
    } catch (error) {
        console.error('Erro ao verificar tentativa:', error);
        return {
            canAttempt: false,
            reason: 'error',
            error: error.message
        };
    }
};

// ✅ MÉTODO para registrar nova tentativa
quizAttemptSchema.statics.registerAttempt = async function(userId, quizId, moduleId) {
    try {
        const canAttempt = await this.canAttemptQuiz(userId, quizId);
        
        if (!canAttempt.canAttempt) {
            throw new Error(`Não pode tentar: ${canAttempt.reason}`);
        }
        
        // Desativar tentativas anteriores para este quiz
        await this.updateMany(
            { userId, quizId, isActive: true },
            { isActive: false }
        );
        
        // Calcular cooldown se for segunda tentativa
        let cooldownUntil = null;
        if (canAttempt.attemptNumber === 2) {
            cooldownUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
        }
        
        // Criar nova tentativa
        const newAttempt = new this({
            userId,
            quizId,
            moduleId,
            attemptNumber: canAttempt.attemptNumber,
            cooldownUntil
        });
        
        await newAttempt.save();
        
        return {
            success: true,
            attemptNumber: canAttempt.attemptNumber,
            cooldownUntil,
            reason: canAttempt.reason
        };
        
    } catch (error) {
        console.error('Erro ao registrar tentativa:', error);
        throw error;
    }
};

// ✅ MÉTODO para limpar tentativas expiradas
quizAttemptSchema.statics.cleanupExpiredAttempts = async function() {
    try {
        const now = new Date();
        
        // Desativar tentativas com cooldown expirado
        const result = await this.updateMany(
            {
                cooldownUntil: { $lt: now },
                isActive: true
            },
            {
                isActive: false
            }
        );
        
        console.log(`🧹 Limpeza automática: ${result.modifiedCount} tentativas expiradas`);
        return result.modifiedCount;
        
    } catch (error) {
        console.error('Erro na limpeza automática:', error);
        return 0;
    }
};

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
