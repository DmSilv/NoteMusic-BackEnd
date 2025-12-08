/**
 * ⚠️ SCRIPT DE SEGURANÇA: Limpar Apenas Usuários
 * 
 * Este script APENAS remove usuários, sem criar usuário master.
 * Use este script se quiser apenas limpar usuários.
 * 
 * ⚠️ ATENÇÃO: Este script é DESTRUTIVO!
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');
const Module = require('../src/models/Module');
const Quiz = require('../src/models/Quiz');
require('dotenv').config();

// ✅ CONFIGURAÇÃO DE SEGURANÇA
const CONFIRM_DELETE = process.env.CONFIRM_DELETE === 'true';

if (!CONFIRM_DELETE) {
  console.error('❌ SEGURANÇA: CONFIRM_DELETE não está definido como "true"');
  console.error('   Para executar: CONFIRM_DELETE=true node scripts/cleanUsersOnly.js');
  process.exit(1);
}

async function cleanUsersOnly() {
  try {
    console.log('🔒 LIMPEZA DE USUÁRIOS');
    console.log('='.repeat(60));
    console.log();
    
    // Conectar ao banco
    console.log('1️⃣ Conectando ao banco de dados...');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado');
    console.log();
    
    // Validar conteúdo
    console.log('2️⃣ Validando conteúdo educacional...');
    const modulesCount = await Module.countDocuments({ isActive: true });
    const quizzesCount = await Quiz.countDocuments({ isActive: true });
    
    if (modulesCount === 0 || quizzesCount === 0) {
      console.error('❌ ERRO: Conteúdo educacional não encontrado!');
      process.exit(1);
    }
    
    console.log(`✅ ${modulesCount} módulos e ${quizzesCount} quizzes encontrados`);
    console.log('   ✅ Conteúdo educacional está seguro');
    console.log();
    
    // Contar usuários
    console.log('3️⃣ Contando usuários...');
    const usersCount = await User.countDocuments();
    console.log(`📊 Total de usuários: ${usersCount}`);
    console.log();
    
    if (usersCount === 0) {
      console.log('ℹ️ Nenhum usuário para deletar.');
      await mongoose.connection.close();
      return;
    }
    
    // Deletar usuários
    console.log('4️⃣ Deletando usuários...');
    const deleteResult = await User.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} usuário(s) deletado(s)`);
    console.log();
    
    // Validação final
    console.log('5️⃣ Validação final...');
    const remainingUsers = await User.countDocuments();
    const remainingModules = await Module.countDocuments({ isActive: true });
    const remainingQuizzes = await Quiz.countDocuments({ isActive: true });
    
    console.log(`✅ Usuários restantes: ${remainingUsers}`);
    console.log(`✅ Módulos restantes: ${remainingModules}`);
    console.log(`✅ Quizzes restantes: ${remainingQuizzes}`);
    console.log();
    
    console.log('✅ Limpeza concluída com sucesso!');
    console.log('⚠️ Módulos e quizzes foram MANTIDOS intactos');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ ERRO:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanUsersOnly();
}

module.exports = cleanUsersOnly;

