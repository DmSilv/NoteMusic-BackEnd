const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../../src/models/user.model');

const updateUserToMaestro = async () => {
  try {
    // Conectar ao banco
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário
    const user = await User.findOne({ email: 'danielmingoranse84@gmail.com' });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      process.exit(1);
    }

    console.log('👤 Usuário encontrado:');
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nível atual: ${user.level}`);
    console.log(`   Pontos atuais: ${user.totalPoints || 0}`);

    // Atualizar para nível Maestro
    user.level = 'maestro';
    user.totalPoints = 3000; // Pontos suficientes para Maestro
    user.streak = 30; // Streak alto
    user.weeklyProgress = 10; // Progresso semanal alto
    user.weeklyGoal = 10;

    await user.save();

    console.log('\n✅ Usuário atualizado para Maestro!');
    console.log(`   Novo nível: ${user.level}`);
    console.log(`   Novos pontos: ${user.totalPoints}`);
    console.log(`   Streak: ${user.streak}`);
    console.log(`   Progresso semanal: ${user.weeklyProgress}/${user.weeklyGoal}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

updateUserToMaestro();







