const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../src/models/Quiz');
const Module = require('../src/models/Module');

const verificar = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    const moduleId = '68e84ae6ef726eb6954df9ff';
    
    console.log(`🔍 Procurando quiz para módulo: ${moduleId}\n`);
    console.log('='.repeat(80));

    // Tentar encontrar o quiz da mesma forma que o backend faz
    const quiz1 = await Quiz.findOne({ moduleId: moduleId });
    console.log('\n1️⃣ Busca por moduleId (String):');
    console.log(quiz1 ? `   ✅ Encontrado: ${quiz1.title} (ID: ${quiz1._id})` : '   ❌ NÃO encontrado');

    // Tentar com ObjectId
    const quiz2 = await Quiz.findOne({ moduleId: new mongoose.Types.ObjectId(moduleId) });
    console.log('\n2️⃣ Busca por moduleId (ObjectId):');
    console.log(quiz2 ? `   ✅ Encontrado: ${quiz2.title} (ID: ${quiz2._id})` : '   ❌ NÃO encontrado');

    // Buscar TODOS os quizzes que mencionam "Propriedades do Som"
    const allQuizzes = await Quiz.find({ 
      title: { $regex: /Propriedades do Som/i }
    });
    console.log(`\n3️⃣ Todos os quizzes com "Propriedades do Som" no título:`);
    console.log(`   Total: ${allQuizzes.length}`);
    allQuizzes.forEach(q => {
      console.log(`   - ${q.title}`);
      console.log(`     Quiz ID: ${q._id}`);
      console.log(`     Module ID: ${q.moduleId}`);
      console.log(`     Module ID (tipo): ${typeof q.moduleId}`);
      console.log(`     Perguntas: ${q.questions.length}`);
      console.log('');
    });

    // Verificar o módulo
    const module = await Module.findById(moduleId);
    console.log('\n4️⃣ Módulo:');
    if (module) {
      console.log(`   ✅ Encontrado: ${module.title}`);
      console.log(`   ID: ${module._id}`);
      console.log(`   Quizzes associados: ${module.quizzes ? module.quizzes.length : 0}`);
      if (module.quizzes && module.quizzes.length > 0) {
        console.log('   IDs dos quizzes:');
        module.quizzes.forEach(qId => console.log(`      - ${qId}`));
      }
    } else {
      console.log('   ❌ Módulo NÃO encontrado');
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n🔍 DIAGNÓSTICO:');
    
    if (!quiz1 && !quiz2) {
      console.log('   ❌ PROBLEMA: Nenhum quiz encontrado para este módulo!');
      console.log('   O quiz precisa ser criado/recriado.');
    } else if (quiz1) {
      console.log('   ✅ Quiz encontrado com busca por String');
      console.log('   O backend deveria encontrá-lo...');
    } else if (quiz2) {
      console.log('   ⚠️  Quiz encontrado APENAS com ObjectId');
      console.log('   Pode haver problema de tipo no backend');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
};

verificar();

