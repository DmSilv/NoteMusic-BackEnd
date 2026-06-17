require('dotenv').config();
const mongoose = require('mongoose');

const LOCAL_MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic';
const RAILWAY_MONGODB_URI = process.env.MONGODB_URI_PRODUCTION || process.env.RAILWAY_MONGODB_URI;

if (!RAILWAY_MONGODB_URI) {
  console.error('❌ Defina MONGODB_URI_PRODUCTION ou RAILWAY_MONGODB_URI no .env');
  process.exit(1);
}

const Module = require('../../src/models/Module');
const Quiz = require('../../src/models/Quiz');

async function exportarEImportar() {
  try {
    console.log('🔄 EXPORTAR E IMPORTAR MÓDULOS');
    console.log('=' .repeat(60));
    console.log();
    
    // 1. Conectar ao banco LOCAL
    console.log('1️⃣ Conectando ao banco LOCAL...');
    const localConn = await mongoose.createConnection(LOCAL_MONGODB_URI);
    const LocalModule = localConn.model('Module', Module.schema);
    const LocalQuiz = localConn.model('Quiz', Quiz.schema);
    console.log('✅ Conectado ao banco LOCAL');
    console.log();
    
    // 2. Buscar TODOS os módulos do banco local
    console.log('2️⃣ Buscando módulos do banco LOCAL...');
    const modules = await LocalModule.find({ isActive: true }).lean();
    console.log(`✅ Encontrados ${modules.length} módulos no banco local`);
    console.log();
    
    // 3. Conectar ao banco RAILWAY
    console.log('3️⃣ Conectando ao banco RAILWAY...');
    const railwayConn = await mongoose.createConnection(RAILWAY_MONGODB_URI);
    const RailwayModule = railwayConn.model('Module', Module.schema);
    const RailwayQuiz = railwayConn.model('Quiz', Quiz.schema);
    console.log('✅ Conectado ao banco RAILWAY');
    console.log();
    
    // 4. Limpar banco do Railway
    console.log('4️⃣ Limpando banco do Railway...');
    await RailwayQuiz.deleteMany({});
    await RailwayModule.deleteMany({});
    console.log('✅ Banco do Railway limpo');
    console.log();
    
    // 5. Importar módulos e quizzes para o Railway
    console.log('5️⃣ Importando módulos para o Railway...');
    let modulesImported = 0;
    let quizzesImported = 0;
    
    for (const mod of modules) {
      // Buscar quizzes do módulo no banco local
      const quizzes = await LocalQuiz.find({ moduleId: mod._id }).lean();
      
      // Remover _id para criar novos
      const { _id, ...moduleData } = mod;
      const newModule = await RailwayModule.create(moduleData);
      modulesImported++;
      
      console.log(`   ✅ Módulo: ${newModule.title} (${quizzes.length} quizzes)`);
      
      // Importar quizzes
      const quizIds = [];
      for (const quiz of quizzes) {
        const { _id: quizId, module: oldModuleId, ...quizData } = quiz;
        const newQuiz = await RailwayQuiz.create({
          ...quizData,
          moduleId: newModule._id
        });
        quizIds.push(newQuiz._id);
        quizzesImported++;
        console.log(`      ✅ Quiz importado`);
      }
      
      // Atualizar módulo com referências aos quizzes
      if (quizIds.length > 0) {
        newModule.quizzes = quizIds;
        await newModule.save();
      }
    }
    
    console.log();
    console.log('🎉 IMPORTAÇÃO CONCLUÍDA!');
    console.log('=' .repeat(60));
    console.log(`📚 Módulos importados: ${modulesImported}`);
    console.log(`🎯 Quizzes importados: ${quizzesImported}`);
    console.log('=' .repeat(60));
    
    // Fechar conexões
    await localConn.close();
    await railwayConn.close();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

exportarEImportar();

