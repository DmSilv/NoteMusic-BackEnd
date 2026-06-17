const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../../src/models/User');

// Conectar ao banco
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
};

// Desbloquear desafio diário para um usuário específico
const unlockSpecificUser = async (email) => {
  try {
    console.log(`🔄 Desbloqueando desafio diário para usuário: ${email}`);
    
    // Buscar o usuário pelo email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ Usuário não encontrado: ${email}`);
      return false;
    }
    
    console.log(`✅ Usuário encontrado: ${user.name || user.email}`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Level: ${user.level}`);
    console.log(`   Total Points: ${user.totalPoints}`);
    
    // Verificar tentativas de quiz
    const attemptsBefore = user.quizAttempts.length;
    console.log(`   Quiz Attempts: ${attemptsBefore}`);
    
    // Remover tentativas de desafio diário e bloqueios
    const initialAttempts = user.quizAttempts.length;
    
    user.quizAttempts = user.quizAttempts.filter(attempt => {
      const isDaily = attempt.quizId.toString().indexOf('daily') !== -1;
      const isBlocked = attempt.isBlocked === true;
      const inCooldown = attempt.cooldownUntil && attempt.cooldownUntil > new Date();
      
      // Manter apenas se NÃO for desafio diário E NÃO estiver bloqueado E NÃO estiver em cooldown
      return !(isDaily || isBlocked || inCooldown);
    });
    
    const removedAttempts = initialAttempts - user.quizAttempts.length;
    
    // Remover conclusões de desafio diário
    const initialCompletions = user.completedQuizzes.length;
    
    user.completedQuizzes = user.completedQuizzes.filter(quiz => {
      return !quiz.quizId.toString().includes('daily');
    });
    
    const removedCompletions = initialCompletions - user.completedQuizzes.length;
    
    // Salvar alterações
    await user.save();
    
    console.log(`✅ Removidas ${removedAttempts} tentativas de quiz`);
    console.log(`✅ Removidas ${removedCompletions} completions de quiz`);
    console.log(`✅ Desafio diário desbloqueado com sucesso para: ${email}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao desbloquear desafio diário:', error);
    return false;
  }
};

// Executar desbloqueio para o usuário específico
const main = async () => {
  try {
    await connectDB();
    
    const userEmail = 'usuario@usuario.com';
    await unlockSpecificUser(userEmail);
    
    console.log('\n✨ Processo concluído.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
};

// Iniciar o processo
main();





























