const mongoose = require('mongoose');
require('dotenv').config();

const QuizAttempt = require('../src/models/quizAttempt.model');
const User = require('../src/models/User');
const Module = require('../src/models/Module');

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic';
  let moduleId = process.env.MODULE_ID;
  const userEmail = process.env.USER_EMAIL; // opcional
  const moduleTitle = process.env.MODULE_TITLE; // opcional

  if (!moduleId && !moduleTitle) {
    console.error('❌ Defina MODULE_ID ou MODULE_TITLE no ambiente');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    let usersFilter = {};
    if (userEmail) {
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        console.error('❌ Usuário não encontrado para o email informado');
        process.exit(2);
      }
      usersFilter = { _id: user._id };
      console.log(`👤 Alvo: ${user.email} (${user._id})`);
    }

    // Resolver moduleId por título/categoria se necessário
    if (!moduleId && moduleTitle) {
      const regex = new RegExp(moduleTitle, 'i');
      const found = await Module.findOne({ $or: [ { title: regex }, { category: regex } ] });
      if (!found) {
        console.error('❌ Módulo não encontrado por título/categoria:', moduleTitle);
        process.exit(3);
      }
      moduleId = found._id.toString();
      console.log(`📦 Módulo resolvido: ${found.title} (${moduleId})`);
    }

    // 1) Remover tentativas (QuizAttempt) para o módulo (escopo: usuário ou todos)
    const userIds = userEmail ? (await User.find(usersFilter)).map(u => u._id) : undefined;
    const attemptsQuery = userIds ? { moduleId, userId: { $in: userIds } } : { moduleId };
    const delAttempts = await QuizAttempt.deleteMany(attemptsQuery);
    console.log(`🧹 Tentativas removidas: ${delAttempts.deletedCount}`);

    // 2) Limpar conclusão do quiz no usuário (completedQuizzes com quizId == moduleId)
    const userUpdateFilter = userIds ? { _id: { $in: userIds } } : {};
    const pullUpdate = { $pull: { completedQuizzes: { quizId: moduleId } } };
    const updUsers = await User.updateMany(userUpdateFilter, pullUpdate);
    console.log(`♻️ Usuários atualizados (remoção de conclusão): ${updUsers.modifiedCount}`);

    // 3) Opcional: limpar estrutura de quizAttempts embutida no User (se existir)
    const pullAttempts = { $pull: { quizAttempts: { quizId: moduleId } } };
    const updUsersAttempts = await User.updateMany(userUpdateFilter, pullAttempts);
    console.log(`♻️ Usuários atualizados (remoção de quizAttempts embutido): ${updUsersAttempts.modifiedCount}`);

    console.log('🎉 Reset concluído com sucesso para o módulo:', moduleId);
  } catch (err) {
    console.error('❌ Erro ao executar reset:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };


