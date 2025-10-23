const mongoose = require('mongoose');
const Module = require('../src/models/Module');
require('dotenv').config();

const fixModuleLevels = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Mapear níveis antigos para novos
    const levelMapping = {
      'iniciante': 'aprendiz',
      'intermediario': 'virtuoso',
      'avancado': 'maestro'
    };

    // Buscar todos os módulos
    const modules = await Module.find({});
    console.log(`📚 Módulos encontrados: ${modules.length}`);
    
    for (const module of modules) {
      const oldLevel = module.level;
      const newLevel = levelMapping[oldLevel];
      
      if (newLevel && newLevel !== oldLevel) {
        console.log(`🔄 Atualizando ${module.title}: ${oldLevel} → ${newLevel}`);
        module.level = newLevel;
        await module.save();
      } else {
        console.log(`✅ ${module.title} já está com nível correto: ${oldLevel}`);
      }
    }

    console.log('✅ Atualização concluída!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

fixModuleLevels();





