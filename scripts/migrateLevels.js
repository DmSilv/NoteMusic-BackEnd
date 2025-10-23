const mongoose = require('mongoose');
const User = require('../src/models/User');
const Module = require('../src/models/Module');

// Mapear níveis antigos para novos
const levelMap = {
  'iniciante': 'aprendiz',
  'intermediario': 'virtuoso',
  'avancado': 'maestro'
};

async function migrateLevels() {
  try {
    // Conectar ao banco
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🔄 Iniciando migração de níveis...');

    // Migrar níveis de usuários
    const users = await User.find({});
    console.log(`📊 Encontrados ${users.length} usuários para migrar`);

    for (const user of users) {
      const oldLevel = user.level;
      const newLevel = levelMap[oldLevel] || 'aprendiz';
      
      if (oldLevel !== newLevel) {
        user.level = newLevel;
        await user.save();
        console.log(`✅ Usuário ${user.name}: ${oldLevel} → ${newLevel}`);
      }
    }

    // Migrar níveis de módulos
    const modules = await Module.find({});
    console.log(`📊 Encontrados ${modules.length} módulos para migrar`);

    for (const module of modules) {
      const oldLevel = module.level;
      const newLevel = levelMap[oldLevel] || 'aprendiz';
      
      if (oldLevel !== newLevel) {
        module.level = newLevel;
        await module.save();
        console.log(`✅ Módulo ${module.title}: ${oldLevel} → ${newLevel}`);
      }
    }

    console.log('✅ Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

// Executar migração
migrateLevels();

