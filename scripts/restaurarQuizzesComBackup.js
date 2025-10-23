const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('../src/models/User');
const Module = require('../src/models/Module');
const Quiz = require('../src/models/Quiz');
const { quizQuestionsData } = require('../src/utils/seedData');

// =====================================================
// SCRIPT: RESTAURAR QUIZZES COM BACKUP DE USUÁRIOS
// =====================================================
// Este script:
// 1. Faz backup de TODOS os usuários
// 2. Deleta quizzes corrompidos
// 3. Recria quizzes com dados originais de seedData.js
// 4. Preserva 100% dos dados de usuários

const BACKUP_DIR = path.join(__dirname, 'backups');

async function criarBackupUsuarios() {
  console.log('\n📦 FASE 1: CRIANDO BACKUP DOS USUÁRIOS');
  console.log('='.repeat(80));
  
  // Criar pasta de backups se não existir
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const usuarios = await User.find({});
  console.log(`👥 Encontrados ${usuarios.length} usuários no banco`);
  
  if (usuarios.length === 0) {
    console.log('⚠️  Nenhum usuário encontrado, pulando backup...');
    return null;
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(BACKUP_DIR, `usuarios_backup_${timestamp}.json`);
  
  const backupData = {
    timestamp: new Date().toISOString(),
    totalUsuarios: usuarios.length,
    usuarios: usuarios.map(u => u.toObject())
  };
  
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`✅ Backup salvo em: ${backupFilePath}`);
  console.log(`   Total de bytes: ${fs.statSync(backupFilePath).size}`);
  
  return backupFilePath;
}

async function deletarQuizzesAntigos() {
  console.log('\n🗑️  FASE 2: DELETANDO QUIZZES CORROMPIDOS');
  console.log('='.repeat(80));
  
  const totalQuizzes = await Quiz.countDocuments({});
  console.log(`📊 Total de quizzes no banco: ${totalQuizzes}`);
  
  await Quiz.deleteMany({});
  console.log('✅ Todos os quizzes foram deletados');
  
  // Limpar referências de quizzes nos módulos
  const modulos = await Module.find({});
  for (const modulo of modulos) {
    modulo.quizzes = [];
    await modulo.save();
  }
  console.log('✅ Referências de quizzes removidas dos módulos');
}

async function recriarQuizzes() {
  console.log('\n🔧 FASE 3: RECRIANDO QUIZZES COM DADOS ORIGINAIS');
  console.log('='.repeat(80));
  
  const modulos = await Module.find({});
  console.log(`📚 Total de módulos disponíveis: ${modulos.length}`);
  
  if (modulos.length === 0) {
    console.log('❌ ERRO: Nenhum módulo encontrado! Execute o seed completo primeiro.');
    return false;
  }
  
  let quizzesCriados = 0;
  const moduleIdToQuizCount = new Map();
  
  // Criar quizzes baseados em seedData
  for (const quizData of quizQuestionsData) {
    const module = modulos.find(m => 
      m.category === quizData.moduleCategory && 
      m.level === quizData.level &&
      (moduleIdToQuizCount.get(m._id.toString()) || 0) === 0
    );
    
    if (module) {
      const quiz = await Quiz.create({
        title: `Quiz - ${module.title}`,
        description: `Teste seus conhecimentos sobre ${module.title}`,
        moduleId: module._id,
        questions: quizData.questions,
        level: quizData.level,
        type: 'module',
        timeLimit: 300,
        passingScore: 70,
        attempts: 3,
        totalAttempts: 0,
        averageScore: 0
      });
      
      module.quizzes.push(quiz._id);
      await module.save();
      
      moduleIdToQuizCount.set(module._id.toString(), 1);
      quizzesCriados++;
      console.log(`  ✓ Quiz criado: ${quiz.title} (${quiz.questions.length} questões)`);
    }
  }
  
  // Criar quizzes automáticos para módulos sem quiz
  console.log('\n🔄 Criando quizzes automáticos para módulos restantes...');
  let quizzesAutomaticos = 0;
  
  for (const module of modulos) {
    const existingCount = await Quiz.countDocuments({ moduleId: module._id });
    if (existingCount === 0) {
      const autoQuestions = [
        {
          question: `Qual tema melhor descreve o módulo "${module.title}"?`,
          options: [
            { id: 'A', label: module.category.replace(/-/g, ' '), isCorrect: true },
            { id: 'B', label: 'Ritmo', isCorrect: false },
            { id: 'C', label: 'Instrumentação', isCorrect: false },
            { id: 'D', label: 'História da música', isCorrect: false }
          ],
          category: module.category,
          difficulty: 'facil',
          points: 10
        },
        {
          question: `Este módulo é indicado para qual nível?`,
          options: [
            { id: 'A', label: 'Aprendiz', isCorrect: module.level === 'aprendiz' },
            { id: 'B', label: 'Virtuoso', isCorrect: module.level === 'virtuoso' },
            { id: 'C', label: 'Maestro', isCorrect: module.level === 'maestro' },
            { id: 'D', label: 'Todos', isCorrect: false }
          ],
          category: module.category,
          difficulty: 'facil',
          points: 10
        }
      ];
      
      const quiz = await Quiz.create({
        title: `Quiz - ${module.title}`,
        description: `Avalie seu entendimento sobre ${module.title}`,
        moduleId: module._id,
        questions: autoQuestions,
        level: module.level,
        type: 'module',
        timeLimit: 300,
        passingScore: 70,
        attempts: 3,
        totalAttempts: 0,
        averageScore: 0
      });
      
      module.quizzes.push(quiz._id);
      await module.save();
      quizzesAutomaticos++;
      console.log(`  ➕ Quiz automático criado: ${module.title}`);
    }
  }
  
  console.log(`\n✅ Total de quizzes criados: ${quizzesCriados + quizzesAutomaticos}`);
  console.log(`   - Quizzes de seedData: ${quizzesCriados}`);
  console.log(`   - Quizzes automáticos: ${quizzesAutomaticos}`);
  
  return true;
}

async function validarQuizzes() {
  console.log('\n✅ FASE 4: VALIDANDO QUIZZES CRIADOS');
  console.log('='.repeat(80));
  
  const todosQuizzes = await Quiz.find({});
  console.log(`📊 Total de quizzes no banco: ${todosQuizzes.length}`);
  
  let quizzesValidos = 0;
  let quizzesComProblema = 0;
  
  for (const quiz of todosQuizzes) {
    let temProblema = false;
    
    for (const questao of quiz.questions) {
      for (const opcao of questao.options) {
        if (!opcao.label || opcao.label === 'undefined') {
          temProblema = true;
          break;
        }
      }
      
      const temOpcaoCorreta = questao.options.some(opt => opt.isCorrect === true);
      if (!temOpcaoCorreta) {
        temProblema = true;
        break;
      }
      
      if (temProblema) break;
    }
    
    if (temProblema) {
      quizzesComProblema++;
      console.log(`❌ Quiz com problema: ${quiz.title}`);
    } else {
      quizzesValidos++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`✅ Quizzes válidos: ${quizzesValidos}`);
  console.log(`❌ Quizzes com problema: ${quizzesComProblema}`);
  console.log('='.repeat(80));
  
  return quizzesComProblema === 0;
}

async function restaurarQuizzes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');
    
    console.log('╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(15) + '🔧 RESTAURAÇÃO DE QUIZZES COM BACKUP' + ' '.repeat(27) + '║');
    console.log('╚' + '═'.repeat(78) + '╝');
    
    // Fase 1: Backup
    const backupPath = await criarBackupUsuarios();
    
    // Fase 2: Deletar quizzes corrompidos
    await deletarQuizzesAntigos();
    
    // Fase 3: Recriar quizzes
    const sucesso = await recriarQuizzes();
    
    if (!sucesso) {
      console.log('\n❌ Falha ao recriar quizzes!');
      return;
    }
    
    // Fase 4: Validar
    const todosValidos = await validarQuizzes();
    
    // Relatório Final
    console.log('\n' + '╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(25) + '📊 RELATÓRIO FINAL' + ' '.repeat(33) + '║');
    console.log('╚' + '═'.repeat(78) + '╝');
    
    const usuarios = await User.countDocuments({});
    const modulos = await Module.countDocuments({});
    const quizzes = await Quiz.countDocuments({});
    
    console.log(`\n✅ Usuários preservados: ${usuarios}`);
    console.log(`✅ Módulos preservados: ${modulos}`);
    console.log(`✅ Quizzes restaurados: ${quizzes}`);
    
    if (backupPath) {
      console.log(`\n💾 Backup dos usuários salvo em:`);
      console.log(`   ${backupPath}`);
    }
    
    if (todosValidos) {
      console.log('\n✨ SUCESSO! Todos os quizzes foram restaurados corretamente!');
      console.log('🎉 Seu app está pronto para uso!');
    } else {
      console.log('\n⚠️  ATENÇÃO: Alguns quizzes ainda têm problemas.');
      console.log('   Execute o script de validação para mais detalhes.');
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado do MongoDB');
  }
}

// Executar
restaurarQuizzes();

