const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

const createOrUpdateUser = async () => {
  try {
    // Conectar ao banco
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário
    let user = await User.findOne({ email: 'danielmingoranse84@gmail.com' });
    
    if (!user) {
      console.log('👤 Usuário não encontrado, criando novo usuário...');
      
      // Criar novo usuário
      user = new User({
        name: 'Daniel',
        email: 'danielmingoranse84@gmail.com',
        password: 'daniel250900',
        level: 'maestro',
        totalPoints: 3000,
        streak: 30,
        weeklyProgress: 10,
        weeklyGoal: 10
      });

      await user.save();
      console.log('✅ Usuário criado com sucesso!');
    } else {
      console.log('👤 Usuário encontrado, atualizando...');
      console.log(`   Nome: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nível atual: ${user.level}`);
      console.log(`   Pontos atuais: ${user.totalPoints || 0}`);

      // Atualizar para nível Maestro e redefinir senha de teste
      user.level = 'maestro';
      user.totalPoints = 3000;
      user.streak = 30;
      user.weeklyProgress = 10;
      user.weeklyGoal = 10;
      user.password = 'daniel250900';
      user.isActive = true;

      await user.save();
      console.log('✅ Usuário atualizado com sucesso!');
    }

    console.log('\n📊 Dados finais do usuário:');
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nível: ${user.level}`);
    console.log(`   Pontos: ${user.totalPoints}`);
    console.log(`   Streak: ${user.streak}`);
    console.log(`   Progresso semanal: ${user.weeklyProgress}/${user.weeklyGoal}`);
    console.log('\n🔐 Credenciais de login (app):');
    console.log('   Email: danielmingoranse84@gmail.com');
    console.log('   Senha: daniel250900');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

createOrUpdateUser();







