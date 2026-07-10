/**
 * Cria ou atualiza 3 usuários fictícios para teste local (um por nível).
 * Não apaga módulos, quizzes nem outros usuários.
 *
 * Uso: npm run seed:test-users
 */
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../../src/models/user.model');

const TEST_USERS = [
  {
    name: 'Ana Basica',
    email: 'notemusicaprendiz@gmail.com',
    password: 'aprendiz123',
    level: 'aprendiz',
    label: 'Básico (Aprendiz)',
  },
  {
    name: 'Bruno Medio',
    email: 'notemusicvirtuoso@gmail.com',
    password: 'virtuoso123',
    level: 'virtuoso',
    label: 'Intermediário (Virtuoso)',
  },
  {
    name: 'Carlos Avanc',
    email: 'notemusicmaestro@gmail.com',
    password: 'maestro123',
    level: 'maestro',
    label: 'Avançado (Maestro)',
  },
];

const LEGACY_TEST_EMAILS = [
  'teste.aprendiz@notemusic.dev',
  'teste.virtuoso@notemusic.dev',
  'teste.maestro@notemusic.dev',
  'notemusic.aprendiz@gmail.com',
  'notemusic.virtuoso@gmail.com',
  'notemusic.maestro@gmail.com',
];

async function upsertTestUser({ name, email, password, level, label }) {
  let user = await User.findOne({ email }).select('+password');

  if (user) {
    user.name = name;
    user.password = password;
    user.isActive = true;
    user.deletionRequested = false;
    user.deletionRequestedAt = null;
    user.deletionScheduledFor = null;
    await user.save();
    await User.updateOne({ _id: user._id }, { $set: { level } });
    user = await User.findById(user._id);
    console.log(`🔄 Atualizado: ${label}`);
  } else {
    user = await User.create({
      name,
      email,
      password,
      completedModules: [],
      completedQuizzes: [],
      quizAttempts: [],
      totalPoints: 0,
      points: 0,
      streak: 0,
      weeklyProgress: 0,
      weeklyGoal: 5,
      isActive: true,
    });
    // O pre-save recalcula level por módulos; forçamos o nível de teste via update direto.
    await User.updateOne({ _id: user._id }, { $set: { level } });
    user = await User.findById(user._id);
    console.log(`✅ Criado: ${label}`);
  }

  return user;
}

async function seedTestUsers() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic';
    await mongoose.connect(uri);
    console.log('✅ Conectado ao MongoDB');

    const legacyRemoved = await User.deleteMany({ email: { $in: LEGACY_TEST_EMAILS } });
    if (legacyRemoved.deletedCount > 0) {
      console.log(`🧹 Removidos ${legacyRemoved.deletedCount} usuário(s) de teste com e-mails .dev (incompatíveis com login)\n`);
    }

    console.log('👤 Criando/atualizando usuários de teste por nível...\n');

    const results = [];
    for (const testUser of TEST_USERS) {
      const user = await upsertTestUser(testUser);
      results.push({ ...testUser, id: user._id, savedLevel: user.level });
    }

    console.log('\n🎉 Usuários de teste prontos!\n');
    console.log('='.repeat(60));
    console.log('CREDENCIAIS (somente desenvolvimento local)');
    console.log('='.repeat(60));

    for (const item of results) {
      console.log(`\n📌 ${item.label}`);
      console.log(`   Nível:  ${item.savedLevel}`);
      console.log(`   E-mail: ${item.email}`);
      console.log(`   Senha:  ${item.password}`);
    }

    console.log('\n' + '='.repeat(60));
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedTestUsers();
}

module.exports = { seedTestUsers, TEST_USERS };
