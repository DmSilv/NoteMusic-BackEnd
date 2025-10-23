const mongoose = require('mongoose');
const QuizAttempt = require('../src/models/quizAttempt.model');
require('dotenv').config();

// Conectar ao banco de dados
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
        console.log('✅ Conectado ao MongoDB');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}

// Função principal de limpeza
async function cleanupExpiredAttempts() {
    try {
        console.log('🧹 Iniciando limpeza automática de tentativas expiradas...');
        
        const now = new Date();
        
        // Buscar tentativas com cooldown expirado
        const expiredAttempts = await QuizAttempt.find({
            cooldownUntil: { $lt: now },
            isActive: true
        });
        
        console.log(`📊 Encontradas ${expiredAttempts.length} tentativas expiradas`);
        
        if (expiredAttempts.length > 0) {
            // Desativar tentativas expiradas
            const result = await QuizAttempt.updateMany(
                {
                    cooldownUntil: { $lt: now },
                    isActive: true
                },
                {
                    isActive: false
                }
            );
            
            console.log(`✅ ${result.modifiedCount} tentativas foram desativadas`);
            
            // Log detalhado das tentativas limpas
            expiredAttempts.forEach(attempt => {
                console.log(`  - Quiz: ${attempt.quizId}, Usuário: ${attempt.userId}, Tentativa: ${attempt.attemptNumber}`);
            });
        } else {
            console.log('✨ Nenhuma tentativa expirada encontrada');
        }
        
        // Limpar tentativas antigas (mais de 24 horas)
        const oldAttempts = await QuizAttempt.find({
            createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            isActive: false
        });
        
        if (oldAttempts.length > 0) {
            const deleteResult = await QuizAttempt.deleteMany({
                createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                isActive: false
            });
            
            console.log(`🗑️ ${deleteResult.deletedCount} tentativas antigas foram removidas`);
        }
        
        console.log('🎉 Limpeza concluída com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante a limpeza:', error);
    } finally {
        // Fechar conexão
        await mongoose.connection.close();
        console.log('🔌 Conexão com MongoDB fechada');
    }
}

// Executar limpeza
if (require.main === module) {
    connectDB()
        .then(() => cleanupExpiredAttempts())
        .catch(console.error);
}

module.exports = { cleanupExpiredAttempts };
