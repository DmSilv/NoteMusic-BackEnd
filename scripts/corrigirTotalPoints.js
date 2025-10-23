const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

const corrigir = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    const users = await User.find({});
    console.log(`📊 Total de usuários: ${users.length}\n`);

    let corrigidos = 0;

    for (const user of users) {
      if (typeof user.totalPoints !== 'number' || isNaN(user.totalPoints)) {
        console.log(`⚠️  Usuário ${user.email}: totalPoints inválido (${user.totalPoints})`);
        user.totalPoints = 0;
        await user.save();
        console.log(`✅ Corrigido para 0`);
        corrigidos++;
      }
    }

    console.log(`\n📊 Total de usuários corrigidos: ${corrigidos}`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
};

corrigir();

