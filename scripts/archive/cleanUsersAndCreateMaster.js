/**
 * ⚠️ SCRIPT CRÍTICO: Limpar Usuários e Criar Usuário Master
 * 
 * Este script:
 * 1. Remove TODOS os usuários do banco de dados
 * 2. Mantém módulos e quizzes intactos
 * 3. Cria um usuário master com tudo completo
 * 
 * ⚠️ ATENÇÃO: Este script é DESTRUTIVO!
 * Execute apenas se tiver certeza absoluta.
 */

const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Module = require('../../src/models/Module');
const Quiz = require('../../src/models/Quiz');
require('dotenv').config();

// ✅ CONFIGURAÇÃO DE SEGURANÇA
const CONFIRM_DELETE = process.env.CONFIRM_DELETE === 'true'; // Deve ser 'true' para executar
const MASTER_EMAIL = process.env.MASTER_EMAIL || 'master@notemusic.com';
const MASTER_PASSWORD = process.env.MASTER_PASSWORD;
const MASTER_NAME = process.env.MASTER_NAME || 'Master';

// ✅ VALIDAÇÃO DE SEGURANÇA
if (!CONFIRM_DELETE) {
  console.error('❌ SEGURANÇA: CONFIRM_DELETE não está definido como "true"');
  console.error('   Para executar este script, defina: CONFIRM_DELETE=true');
  console.error('   Exemplo: CONFIRM_DELETE=true node scripts/cleanUsersAndCreateMaster.js');
  process.exit(1);
}

if (!MASTER_PASSWORD) {
  console.error('❌ Defina MASTER_PASSWORD no .env');
  process.exit(1);
}

async function cleanUsersAndCreateMaster() {
  try {
    console.log('🔒 SCRIPT DE LIMPEZA E CRIAÇÃO DE USUÁRIO MASTER');
    console.log('='.repeat(60));
    console.log();
    
    // 1. Conectar ao banco de dados
    console.log('1️⃣ Conectando ao banco de dados...');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
    console.log();
    
    // 2. ✅ VALIDAÇÃO: Verificar se há módulos e quizzes
    console.log('2️⃣ Validando conteúdo educacional...');
    const modulesCount = await Module.countDocuments({ isActive: true });
    const quizzesCount = await Quiz.countDocuments({ isActive: true });
    
    if (modulesCount === 0) {
      console.error('❌ ERRO: Nenhum módulo encontrado no banco!');
      console.error('   Não é seguro continuar sem módulos.');
      process.exit(1);
    }
    
    if (quizzesCount === 0) {
      console.error('❌ ERRO: Nenhum quiz encontrado no banco!');
      console.error('   Não é seguro continuar sem quizzes.');
      process.exit(1);
    }
    
    console.log(`✅ Encontrados ${modulesCount} módulos e ${quizzesCount} quizzes`);
    console.log('   ✅ Conteúdo educacional está seguro');
    console.log();
    
    // 3. ✅ VALIDAÇÃO: Contar usuários antes de deletar
    console.log('3️⃣ Contando usuários existentes...');
    const usersCount = await User.countDocuments();
    console.log(`📊 Total de usuários no banco: ${usersCount}`);
    
    if (usersCount === 0) {
      console.log('ℹ️ Nenhum usuário encontrado. Pulando limpeza.');
    } else {
      console.log(`⚠️ ATENÇÃO: ${usersCount} usuário(s) serão DELETADOS!`);
    }
    console.log();
    
    // 4. ✅ SEGURANÇA: Verificar se usuário master já existe
    console.log('4️⃣ Verificando se usuário master já existe...');
    const existingMaster = await User.findOne({ email: MASTER_EMAIL });
    if (existingMaster) {
      console.log(`⚠️ Usuário master já existe: ${MASTER_EMAIL}`);
      console.log('   Será deletado e recriado.');
    }
    console.log();
    
    // 5. ✅ LIMPEZA: Deletar TODOS os usuários
    console.log('5️⃣ Limpando usuários do banco...');
    if (usersCount > 0) {
      const deleteResult = await User.deleteMany({});
      console.log(`✅ ${deleteResult.deletedCount} usuário(s) deletado(s) com sucesso`);
    } else {
      console.log('ℹ️ Nenhum usuário para deletar');
    }
    console.log();
    
    // 6. ✅ BUSCAR: Todos os módulos e quizzes ativos
    console.log('6️⃣ Buscando módulos e quizzes para completar...');
    const allModules = await Module.find({ isActive: true })
      .populate('quizzes')
      .sort({ order: 1 });
    
    const allQuizzes = await Quiz.find({ isActive: true });
    
    console.log(`✅ Encontrados ${allModules.length} módulos e ${allQuizzes.length} quizzes`);
    console.log();
    
    // 7. ✅ CRIAR: Usuário master
    console.log('7️⃣ Criando usuário master...');
    const masterUser = await User.create({
      name: MASTER_NAME,
      email: MASTER_EMAIL,
      password: MASTER_PASSWORD,
      level: 'maestro',
      completedModules: [],
      completedQuizzes: [],
      quizAttempts: [],
      totalPoints: 0,
      points: 0,
      streak: 0,
      weeklyProgress: 0
    });
    
    console.log(`✅ Usuário master criado: ${masterUser.email} (${masterUser._id})`);
    console.log();
    
    // 8. ✅ COMPLETAR: Todos os módulos e quizzes
    console.log('8️⃣ Completando todos os módulos e quizzes para o usuário master...');
    let modulesCompleted = 0;
    let quizzesCompleted = 0;
    let totalPointsEarned = 0;
    
    // ✅ IMPORTAR CONSTANTES DE PONTOS
    const { GAMIFICATION_CONSTANTS } = require('../../src/utils/gamificationRebalanced');
    
    for (const module of allModules) {
      // Verificar se módulo tem quizzes
      const moduleQuizzes = module.quizzes || [];
      
      if (moduleQuizzes.length === 0) {
        console.log(`⚠️ Módulo "${module.title}" não tem quizzes - pulando`);
        continue;
      }
      
      // ✅ Completar todos os quizzes do módulo PRIMEIRO (antes de completar o módulo)
      const moduleQuizIds = [];
      for (const quiz of moduleQuizzes) {
        // Verificar se quiz existe e está ativo
        const quizDoc = await Quiz.findById(quiz._id || quiz);
        if (!quizDoc || !quizDoc.isActive) {
          console.log(`⚠️ Quiz inválido ou inativo para módulo "${module.title}" - pulando`);
          continue;
        }
        
        // Adicionar quiz aos completados (com nota alta - 100%)
        masterUser.completedQuizzes.push({
          quizId: quizDoc._id,
          score: quizDoc.questions.length, // Score máximo (todas corretas)
          percentage: 100, // 100% de acerto
          passed: true, // ✅ IMPORTANTE: passed = true para contar como aprovado
          completedAt: new Date()
        });
        
        moduleQuizIds.push(quizDoc._id.toString());
        quizzesCompleted++;
      }
      
      // ✅ VALIDAÇÃO: Só completar módulo se TODOS os quizzes foram completados
      if (moduleQuizIds.length === 0) {
        console.log(`⚠️ Módulo "${module.title}" não tem quizzes válidos - pulando módulo`);
        continue;
      }
      
      // ✅ Adicionar módulo aos completados (após completar todos os quizzes)
      masterUser.completedModules.push({
        moduleId: module._id,
        completedAt: new Date()
      });
      
      // ✅ Calcular pontos baseado no nível do módulo (usando constantes)
      let modulePoints = 0;
      if (module.level === 'aprendiz') {
        modulePoints = GAMIFICATION_CONSTANTS?.POINTS?.MODULE_COMPLETION_APRENDIZ || 50;
      } else if (module.level === 'virtuoso') {
        modulePoints = GAMIFICATION_CONSTANTS?.POINTS?.MODULE_COMPLETION_VIRTUOSO || 100;
      } else if (module.level === 'maestro') {
        modulePoints = GAMIFICATION_CONSTANTS?.POINTS?.MODULE_COMPLETION_MAESTRO || 150;
      }
      
      totalPointsEarned += modulePoints;
      modulesCompleted++;
      
      console.log(`   ✅ Módulo "${module.title}" (${module.level}): ${moduleQuizIds.length} quiz(es) completado(s), +${modulePoints} pontos`);
    }
    
    // Atualizar pontos totais
    masterUser.totalPoints = totalPointsEarned;
    masterUser.level = 'maestro'; // Garantir nível maestro
    
    // 9. ✅ SALVAR: Usuário master com tudo completo
    console.log('9️⃣ Salvando usuário master com progresso completo...');
    await masterUser.save();
    
    console.log(`✅ Usuário master configurado com sucesso!`);
    console.log();
    
    // 10. ✅ VALIDAÇÃO FINAL: Verificar dados salvos
    console.log('🔟 Validando dados salvos...');
    const savedMaster = await User.findById(masterUser._id)
      .populate('completedModules.moduleId', 'title level')
      .populate('completedQuizzes.quizId', 'title');
    
    console.log(`✅ Validação final:`);
    console.log(`   📚 Módulos completados: ${savedMaster.completedModules.length}`);
    console.log(`   📝 Quizzes completados: ${savedMaster.completedQuizzes.length}`);
    console.log(`   💰 Pontos totais: ${savedMaster.totalPoints}`);
    console.log(`   🎯 Nível: ${savedMaster.level}`);
    console.log();
    
    // 11. ✅ RESUMO FINAL
    console.log('='.repeat(60));
    console.log('✅ PROCESSO CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log();
    console.log('📊 RESUMO:');
    console.log(`   👥 Usuários deletados: ${usersCount}`);
    console.log(`   ✅ Usuário master criado: ${MASTER_EMAIL}`);
    console.log(`   📚 Módulos completados: ${modulesCompleted}`);
    console.log(`   📝 Quizzes completados: ${quizzesCompleted}`);
    console.log(`   💰 Pontos totais: ${totalPointsEarned}`);
    console.log(`   🎯 Nível: maestro`);
    console.log();
    console.log('🔑 CREDENCIAIS DO USUÁRIO MASTER:');
    console.log(`   Email: ${MASTER_EMAIL}`);
    console.log(`   Senha: ${MASTER_PASSWORD}`);
    console.log();
    console.log('⚠️ IMPORTANTE:');
    console.log('   - Módulos e quizzes foram MANTIDOS intactos');
    console.log('   - Apenas usuários foram deletados');
    console.log('   - Usuário master tem acesso completo ao app');
    console.log();
    
    // Fechar conexão
    await mongoose.connection.close();
    console.log('✅ Conexão fechada');
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  cleanUsersAndCreateMaster();
}

module.exports = cleanUsersAndCreateMaster;

