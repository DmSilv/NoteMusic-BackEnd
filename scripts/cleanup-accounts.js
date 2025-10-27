/**
 * 🗑️ Script de Limpeza Automática - Contas Marcadas para Exclusão
 * Este script deve ser executado diariamente para excluir contas que expiraram o período de graça
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');
const QuizAttempt = require('../src/models/quizAttempt.model');

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error);
    process.exit(1);
  }
};

// Função principal de limpeza
const cleanupExpiredAccounts = async () => {
  try {
    console.log('🔍 Iniciando limpeza de contas expiradas...');
    
    // Buscar contas que devem ser excluídas
    const accountsToDelete = await User.find({
      deletionRequested: true,
      deletionScheduledFor: { $lte: new Date() }
    });

    console.log(`📊 Encontradas ${accountsToDelete.length} contas para exclusão`);

    if (accountsToDelete.length === 0) {
      console.log('✅ Nenhuma conta para excluir');
      return;
    }

    // Excluir cada conta
    for (const user of accountsToDelete) {
      try {
        console.log(`🗑️ Excluindo conta: ${user.email} (${user.name})`);
        
        // Excluir tentativas de quiz relacionadas
        const deletedAttempts = await QuizAttempt.deleteMany({ userId: user._id });
        console.log(`   📝 Excluídas ${deletedAttempts.deletedCount} tentativas de quiz`);
        
        // Excluir usuário
        await User.findByIdAndDelete(user._id);
        
        console.log(`   ✅ Conta excluída: ${user.email}`);
        
        // Log detalhado para auditoria
        console.log(`   📋 Detalhes da exclusão:`);
        console.log(`      - Nome: ${user.name}`);
        console.log(`      - Email: ${user.email}`);
        console.log(`      - Nível: ${user.level}`);
        console.log(`      - Pontos: ${user.totalPoints}`);
        console.log(`      - Motivo: ${user.deletionReason || 'Não informado'}`);
        console.log(`      - Solicitado em: ${user.deletionRequestedAt}`);
        console.log(`      - Agendado para: ${user.deletionScheduledFor}`);
        
      } catch (error) {
        console.error(`❌ Erro ao excluir conta ${user.email}:`, error);
      }
    }

    console.log(`🎉 Limpeza concluída! ${accountsToDelete.length} contas excluídas`);

  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
  }
};

// Função para listar contas marcadas para exclusão (para monitoramento)
const listPendingDeletions = async () => {
  try {
    console.log('📋 Listando contas marcadas para exclusão...');
    
    const pendingDeletions = await User.find({
      deletionRequested: true,
      deletionScheduledFor: { $gt: new Date() }
    }).select('name email deletionRequestedAt deletionScheduledFor deletionReason');

    console.log(`📊 ${pendingDeletions.length} contas aguardando exclusão:`);
    
    pendingDeletions.forEach((user, index) => {
      const daysRemaining = Math.ceil((user.deletionScheduledFor - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      📅 Exclusão em: ${daysRemaining} dias`);
      console.log(`      📝 Motivo: ${user.deletionReason || 'Não informado'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao listar exclusões pendentes:', error);
  }
};

// Função principal
const main = async () => {
  const command = process.argv[2];
  
  await connectDB();
  
  switch (command) {
    case 'cleanup':
      await cleanupExpiredAccounts();
      break;
    case 'list':
      await listPendingDeletions();
      break;
    default:
      console.log('📋 Comandos disponíveis:');
      console.log('   node cleanup-accounts.js cleanup  - Excluir contas expiradas');
      console.log('   node cleanup-accounts.js list     - Listar exclusões pendentes');
      break;
  }
  
  await mongoose.disconnect();
  console.log('👋 Desconectado do MongoDB');
};

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  cleanupExpiredAccounts,
  listPendingDeletions
};



