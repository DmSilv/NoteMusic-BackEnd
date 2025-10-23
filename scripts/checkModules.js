const mongoose = require('mongoose');
const Module = require('../src/models/Module');
require('dotenv').config();

const checkModules = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os módulos
    const modules = await Module.find({});
    console.log(`📚 Módulos encontrados: ${modules.length}`);
    
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title}`);
      console.log(`   Categoria: ${module.category}`);
      console.log(`   Nível: ${module.level}`);
      console.log(`   Ativo: ${module.isActive}`);
      console.log(`   Quizzes: ${module.quizzes?.length || 0}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkModules();





