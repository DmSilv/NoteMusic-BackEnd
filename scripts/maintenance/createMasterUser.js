/**
 * ✅ SCRIPT SEGURO: Criar Usuário Master
 * 
 * Este script cria um usuário master com tudo completo.
 * Pode ser executado independentemente (não deleta nada).
 */

const mongoose = require('mongoose');
const User = require('../../src/models/user.model');
const Module = require('../../src/models/module.model');
const Quiz = require('../../src/models/quiz.model');
require('dotenv').config();

// ✅ CONFIGURAÇÃO
const MASTER_EMAIL = process.env.MASTER_EMAIL || 'master@notemusic.com';
const MASTER_PASSWORD = process.env.MASTER_PASSWORD;
const MASTER_NAME = process.env.MASTER_NAME || 'Master';

async function createMasterUser() {
  try {
    if (!MASTER_PASSWORD) {
      console.error('❌ Defina MASTER_PASSWORD no .env antes de executar este script');
      process.exit(1);
    }

    console.log('👑 CRIAÇÃO DE USUÁRIO MASTER');
    console.log('='.repeat(60));
    console.log();
    
    // Conectar ao banco
    console.log('1️⃣ Conectando ao banco de dados...');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado');
    console.log();
    
    // Verificar se já existe
    console.log('2️⃣ Verificando se usuário master já existe...');
    const existingMaster = await User.findOne({ email: MASTER_EMAIL });
    if (existingMaster) {
      console.log(`⚠️ Usuário master já existe: ${MASTER_EMAIL}`);
      console.log('   Opções:');
      console.log('   1. Deletar e recriar (use cleanUsersAndCreateMaster.js)');
      console.log('   2. Atualizar progresso do usuário existente');
      console.log();
      
      const updateExisting = process.env.UPDATE_EXISTING === 'true';
      if (!updateExisting) {
        console.log('ℹ️ Para atualizar usuário existente, use: UPDATE_EXISTING=true');
        await mongoose.connection.close();
        return;
      }
      
      // Atualizar usuário existente
      console.log('🔄 Atualizando usuário existente...');
      await updateUserProgress(existingMaster);
      await mongoose.connection.close();
      return;
    }
    
    // Buscar módulos e quizzes
    console.log('3️⃣ Buscando módulos e quizzes...');
    const allModules = await Module.find({ isActive: true })
      .populate('quizzes')
      .sort({ order: 1 });
    
    const allQuizzes = await Quiz.find({ isActive: true });
    
    console.log(`✅ Encontrados ${allModules.length} módulos e ${allQuizzes.length} quizzes`);
    console.log();
    
    // Criar usuário master
    console.log('4️⃣ Criando usuário master...');
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
    
    console.log(`✅ Usuário master criado: ${masterUser.email}`);
    console.log();
    
    // Completar tudo
    console.log('5️⃣ Completando módulos e quizzes...');
    const progress = await completeAllProgress(masterUser, allModules, allQuizzes);
    
    // Salvar
    console.log('6️⃣ Salvando progresso...');
    await masterUser.save();
    
    // Validação final
    console.log('7️⃣ Validação final...');
    const savedMaster = await User.findById(masterUser._id);
    
    console.log();
    console.log('='.repeat(60));
    console.log('✅ USUÁRIO MASTER CRIADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log();
    console.log('📊 RESUMO:');
    console.log(`   👤 Email: ${MASTER_EMAIL}`);
    console.log(`   🔑 Senha: ${MASTER_PASSWORD}`);
    console.log(`   📚 Módulos completados: ${progress.modulesCompleted}`);
    console.log(`   📝 Quizzes completados: ${progress.quizzesCompleted}`);
    console.log(`   💰 Pontos totais: ${progress.totalPoints}`);
    console.log(`   🎯 Nível: maestro`);
    console.log();
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ ERRO:', error);
    process.exit(1);
  }
}

async function completeAllProgress(user, modules, quizzes) {
  const { GAMIFICATION_CONSTANTS } = require('../../src/utils/gamificationRebalanced');
  
  let modulesCompleted = 0;
  let quizzesCompleted = 0;
  let totalPoints = 0;
  
  for (const module of modules) {
    const moduleQuizzes = module.quizzes || [];
    
    if (moduleQuizzes.length === 0) {
      console.log(`⚠️ Módulo "${module.title}" sem quizzes - pulando`);
      continue;
    }
    
    // ✅ Completar quizzes do módulo PRIMEIRO
    const moduleQuizIds = [];
    for (const quiz of moduleQuizzes) {
      const quizDoc = await Quiz.findById(quiz._id || quiz);
      if (!quizDoc || !quizDoc.isActive) continue;
      
      user.completedQuizzes.push({
        quizId: quizDoc._id,
        score: quizDoc.questions.length,
        percentage: 100,
        passed: true, // ✅ IMPORTANTE: passed = true
        completedAt: new Date()
      });
      
      moduleQuizIds.push(quizDoc._id.toString());
      quizzesCompleted++;
    }
    
    // ✅ Só completar módulo se tem quizzes válidos
    if (moduleQuizIds.length === 0) {
      console.log(`⚠️ Módulo "${module.title}" sem quizzes válidos - pulando módulo`);
      continue;
    }
    
    // ✅ Completar módulo (após completar quizzes)
    user.completedModules.push({
      moduleId: module._id,
      completedAt: new Date()
    });
    
    // ✅ Calcular pontos usando constantes
    let modulePoints = 0;
    if (module.level === 'aprendiz') {
      modulePoints = GAMIFICATION_CONSTANTS?.POINTS?.MODULE_COMPLETION_APRENDIZ || 50;
    } else if (module.level === 'virtuoso') {
      modulePoints = GAMIFICATION_CONSTANTS?.POINTS?.MODULE_COMPLETION_VIRTUOSO || 100;
    } else if (module.level === 'maestro') {
      modulePoints = GAMIFICATION_CONSTANTS?.POINTS?.MODULE_COMPLETION_MAESTRO || 150;
    }
    
    totalPoints += modulePoints;
    modulesCompleted++;
  }
  
  user.totalPoints = totalPoints;
  user.level = 'maestro';
  
  return { modulesCompleted, quizzesCompleted, totalPoints };
}

async function updateUserProgress(user) {
  console.log('🔄 Atualizando progresso do usuário existente...');
  
  // Limpar progresso existente
  user.completedModules = [];
  user.completedQuizzes = [];
  user.quizAttempts = [];
  user.totalPoints = 0;
  
  // Buscar módulos e quizzes
  const allModules = await Module.find({ isActive: true })
    .populate('quizzes')
    .sort({ order: 1 });
  
  // Completar tudo
  const progress = await completeAllProgress(user, allModules, []);
  await user.save();
  
  console.log(`✅ Progresso atualizado:`);
  console.log(`   📚 Módulos: ${progress.modulesCompleted}`);
  console.log(`   📝 Quizzes: ${progress.quizzesCompleted}`);
  console.log(`   💰 Pontos: ${progress.totalPoints}`);
}

if (require.main === module) {
  createMasterUser();
}

module.exports = createMasterUser;

