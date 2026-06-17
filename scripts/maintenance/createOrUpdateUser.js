const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../../src/models/user.model');

const DEV_EMAIL = process.env.DEV_USER_EMAIL;
const DEV_PASSWORD = process.env.DEV_USER_PASSWORD;
const DEV_NAME = process.env.DEV_USER_NAME || 'Dev User';

const createOrUpdateUser = async () => {
  try {
    if (!DEV_EMAIL || !DEV_PASSWORD) {
      console.error('❌ Defina DEV_USER_EMAIL e DEV_USER_PASSWORD no .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');

    let user = await User.findOne({ email: DEV_EMAIL });

    if (!user) {
      console.log('👤 Usuário não encontrado, criando...');
      user = new User({
        name: DEV_NAME,
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
        level: 'maestro',
        totalPoints: 3000,
        streak: 30,
        weeklyProgress: 10,
        weeklyGoal: 10,
      });
      await user.save();
      console.log('✅ Usuário criado com sucesso!');
    } else {
      console.log('👤 Usuário encontrado, atualizando...');
      user.level = 'maestro';
      user.totalPoints = 3000;
      user.streak = 30;
      user.weeklyProgress = 10;
      user.weeklyGoal = 10;
      user.password = DEV_PASSWORD;
      user.isActive = true;
      await user.save();
      console.log('✅ Usuário atualizado com sucesso!');
    }

    console.log('\n📊 Dados finais:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Nível: ${user.level}`);
    console.log(`   Pontos: ${user.totalPoints}`);
    console.log('\n🔐 Use as credenciais definidas em DEV_USER_EMAIL / DEV_USER_PASSWORD');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

createOrUpdateUser();
