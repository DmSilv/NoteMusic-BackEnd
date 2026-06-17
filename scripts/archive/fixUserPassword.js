const mongoose = require('mongoose');
const User = require('../../src/models/user.model');
require('dotenv').config({ path: '../.env' });

const fixUserPassword = async (email, newPassword) => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:', {
      name: user.name,
      email: user.email,
      level: user.level,
      hasPassword: !!user.password
    });

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    console.log('✅ Senha atualizada com sucesso!');

    // Verificar se a senha está funcionando
    const isPasswordValid = await user.comparePassword(newPassword);
    console.log('🔐 Teste de senha:', isPasswordValid ? '✅ Válida' : '❌ Inválida');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Executar
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Uso: node fixUserPassword.js <email> <password>');
  process.exit(1);
}

fixUserPassword(email, password);