/**
 * ✅ SCRIPT DE VALIDAÇÃO: Verificar Usuário Master
 * 
 * Este script valida se o usuário master foi criado corretamente
 * e se todos os módulos e quizzes estão completos.
 */

const mongoose = require('mongoose');
const User = require('../../src/models/user.model');
const Module = require('../../src/models/module.model');
const Quiz = require('../../src/models/quiz.model');
require('dotenv').config();

const MASTER_EMAIL = process.env.MASTER_EMAIL || 'master@notemusic.com';

async function validateMasterUser() {
  try {
    console.log('🔍 VALIDAÇÃO DO USUÁRIO MASTER');
    console.log('='.repeat(60));
    console.log();
    
    // 1. Conectar ao banco de dados
    console.log('1️⃣ Conectando ao banco de dados...');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
    console.log();
    
    // 2. Buscar usuário master
    console.log('2️⃣ Buscando usuário master...');
    const masterUser = await User.findOne({ email: MASTER_EMAIL })
      .populate('completedModules.moduleId', 'title level category')
      .populate('completedQuizzes.quizId', 'title');
    
    if (!masterUser) {
      console.error('❌ ERRO: Usuário master não encontrado!');
      console.error(`   Email procurado: ${MASTER_EMAIL}`);
      process.exit(1);
    }
    
    console.log(`✅ Usuário master encontrado: ${masterUser.email}`);
    console.log(`   ID: ${masterUser._id}`);
    console.log(`   Nome: ${masterUser.name}`);
    console.log();
    
    // 3. Validar módulos e quizzes no banco
    console.log('3️⃣ Validando conteúdo educacional no banco...');
    const totalModules = await Module.countDocuments({ isActive: true });
    const totalQuizzes = await Quiz.countDocuments({ isActive: true });
    
    console.log(`   📚 Total de módulos ativos: ${totalModules}`);
    console.log(`   📝 Total de quizzes ativos: ${totalQuizzes}`);
    console.log();
    
    // 4. Validar módulos completados
    console.log('4️⃣ Validando módulos completados...');
    const completedModulesCount = masterUser.completedModules.length;
    console.log(`   ✅ Módulos completados pelo master: ${completedModulesCount}`);
    
    if (completedModulesCount !== totalModules) {
      console.error(`❌ ERRO: Número de módulos incompleto!`);
      console.error(`   Esperado: ${totalModules}`);
      console.error(`   Encontrado: ${completedModulesCount}`);
      process.exit(1);
    }
    
    // Validar que todos os módulos têm IDs válidos
    const invalidModules = masterUser.completedModules.filter(
      cm => !cm.moduleId || !cm.completedAt
    );
    if (invalidModules.length > 0) {
      console.error(`❌ ERRO: ${invalidModules.length} módulo(s) com dados inválidos!`);
      process.exit(1);
    }
    
    console.log('   ✅ Todos os módulos estão completos e válidos');
    console.log();
    
    // 5. Validar quizzes completados
    console.log('5️⃣ Validando quizzes completados...');
    const completedQuizzesCount = masterUser.completedQuizzes.length;
    console.log(`   ✅ Quizzes completados pelo master: ${completedQuizzesCount}`);
    
    if (completedQuizzesCount !== totalQuizzes) {
      console.error(`❌ ERRO: Número de quizzes incompleto!`);
      console.error(`   Esperado: ${totalQuizzes}`);
      console.error(`   Encontrado: ${completedQuizzesCount}`);
      process.exit(1);
    }
    
    // Validar que todos os quizzes foram aprovados (passed = true)
    const failedQuizzes = masterUser.completedQuizzes.filter(
      cq => !cq.passed || cq.percentage !== 100
    );
    if (failedQuizzes.length > 0) {
      console.error(`❌ ERRO: ${failedQuizzes.length} quiz(es) não foram aprovados!`);
      console.error('   Todos os quizzes devem ter passed=true e percentage=100');
      process.exit(1);
    }
    
    // Validar que todos os quizzes têm IDs válidos
    const invalidQuizzes = masterUser.completedQuizzes.filter(
      cq => !cq.quizId || !cq.completedAt
    );
    if (invalidQuizzes.length > 0) {
      console.error(`❌ ERRO: ${invalidQuizzes.length} quiz(es) com dados inválidos!`);
      process.exit(1);
    }
    
    console.log('   ✅ Todos os quizzes estão completos e aprovados');
    console.log();
    
    // 6. Validar pontos e nível
    console.log('6️⃣ Validando pontos e nível...');
    console.log(`   💰 Pontos totais: ${masterUser.totalPoints}`);
    console.log(`   🎯 Nível: ${masterUser.level}`);
    
    if (masterUser.level !== 'maestro') {
      console.error(`❌ ERRO: Nível incorreto!`);
      console.error(`   Esperado: maestro`);
      console.error(`   Encontrado: ${masterUser.level}`);
      process.exit(1);
    }
    
    if (masterUser.totalPoints <= 0) {
      console.error(`❌ ERRO: Pontos totais inválidos!`);
      console.error(`   Encontrado: ${masterUser.totalPoints}`);
      process.exit(1);
    }
    
    console.log('   ✅ Pontos e nível estão corretos');
    console.log();
    
    // 7. Validar que não há tentativas de quiz usadas
    console.log('7️⃣ Validando tentativas de quiz...');
    const quizAttemptsCount = masterUser.quizAttempts.length;
    console.log(`   📊 Tentativas registradas: ${quizAttemptsCount}`);
    
    if (quizAttemptsCount > 0) {
      console.log('   ⚠️ AVISO: Há tentativas registradas (mas isso é aceitável)');
    } else {
      console.log('   ✅ Nenhuma tentativa usada (esperado para usuário master)');
    }
    console.log();
    
    // 8. Validar que há apenas 1 usuário no banco (o master)
    console.log('8️⃣ Validando quantidade de usuários...');
    const totalUsers = await User.countDocuments();
    console.log(`   👥 Total de usuários no banco: ${totalUsers}`);
    
    if (totalUsers !== 1) {
      console.log(`   ⚠️ AVISO: Há ${totalUsers} usuário(s) no banco (esperado: 1)`);
      console.log('   Isso pode ser normal se você criou outros usuários de teste');
    } else {
      console.log('   ✅ Apenas o usuário master existe no banco');
    }
    console.log();
    
    // 9. Resumo final
    console.log('='.repeat(60));
    console.log('✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(60));
    console.log();
    console.log('📊 RESUMO DA VALIDAÇÃO:');
    console.log(`   ✅ Usuário master existe: ${masterUser.email}`);
    console.log(`   ✅ Módulos completados: ${completedModulesCount}/${totalModules}`);
    console.log(`   ✅ Quizzes completados: ${completedQuizzesCount}/${totalQuizzes}`);
    console.log(`   ✅ Todos os quizzes aprovados: ${completedQuizzesCount}`);
    console.log(`   ✅ Pontos totais: ${masterUser.totalPoints}`);
    console.log(`   ✅ Nível: ${masterUser.level}`);
    console.log(`   ✅ Total de usuários: ${totalUsers}`);
    console.log();
    console.log('🎉 O usuário master está configurado corretamente!');
    console.log('   Pronto para commit e deploy.');
    console.log();
    
    // Fechar conexão
    await mongoose.connection.close();
    console.log('✅ Conexão fechada');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERRO NA VALIDAÇÃO:', error);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Executar validação
if (require.main === module) {
  validateMasterUser();
}

module.exports = validateMasterUser;

