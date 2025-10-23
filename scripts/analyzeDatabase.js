const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');
const Module = require('../src/models/Module');
const Quiz = require('../src/models/Quiz');

const analyzeDatabase = async () => {
  try {
    // Conectar ao banco
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');

    console.log('\n📊 ANÁLISE DO BANCO DE DADOS\n');

    // 1. Análise de Usuários
    console.log('👥 USUÁRIOS:');
    const users = await User.find({});
    console.log(`   Total de usuários: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Nível: ${user.level}`);
    });

    // 2. Análise de Módulos por Categoria e Nível
    console.log('\n📚 MÓDULOS POR CATEGORIA E NÍVEL:');
    const modules = await Module.find({});
    console.log(`   Total de módulos: ${modules.length}`);
    
    const modulesByCategory = {};
    const modulesByLevel = {};
    
    modules.forEach(module => {
      // Por categoria
      if (!modulesByCategory[module.category]) {
        modulesByCategory[module.category] = [];
      }
      modulesByCategory[module.category].push(module);
      
      // Por nível
      if (!modulesByLevel[module.level]) {
        modulesByLevel[module.level] = [];
      }
      modulesByLevel[module.level].push(module);
    });

    console.log('\n   Por Categoria:');
    Object.keys(modulesByCategory).forEach(category => {
      const categoryModules = modulesByCategory[category];
      const levels = [...new Set(categoryModules.map(m => m.level))];
      console.log(`   📁 ${category}: ${categoryModules.length} módulos - Níveis: ${levels.join(', ')}`);
      categoryModules.forEach(module => {
        console.log(`      - ${module.title} (${module.level})`);
      });
    });

    console.log('\n   Por Nível:');
    Object.keys(modulesByLevel).forEach(level => {
      const levelModules = modulesByLevel[level];
      console.log(`   🎯 ${level}: ${levelModules.length} módulos`);
    });

    // 3. Análise de Quizzes
    console.log('\n🧩 QUIZZES:');
    const quizzes = await Quiz.find({});
    console.log(`   Total de quizzes: ${quizzes.length}`);
    
    const quizzesByModule = {};
    const quizzesByLevel = {};
    
    quizzes.forEach(quiz => {
      // Por módulo
      if (quiz.moduleId) {
        if (!quizzesByModule[quiz.moduleId.toString()]) {
          quizzesByModule[quiz.moduleId.toString()] = [];
        }
        quizzesByModule[quiz.moduleId.toString()].push(quiz);
      }
      
      // Por nível
      if (!quizzesByLevel[quiz.level]) {
        quizzesByLevel[quiz.level] = [];
      }
      quizzesByLevel[quiz.level].push(quiz);
    });

    console.log('\n   Por Nível:');
    Object.keys(quizzesByLevel).forEach(level => {
      const levelQuizzes = quizzesByLevel[level];
      console.log(`   🎯 ${level}: ${levelQuizzes.length} quizzes`);
    });

    // 4. Análise de Módulos SEM Quizzes
    console.log('\n❌ MÓDULOS SEM QUIZZES:');
    const modulesWithoutQuizzes = modules.filter(module => 
      !quizzesByModule[module._id.toString()]
    );
    
    if (modulesWithoutQuizzes.length === 0) {
      console.log('   ✅ Todos os módulos têm quizzes!');
    } else {
      console.log(`   ⚠️ ${modulesWithoutQuizzes.length} módulos sem quizzes:`);
      modulesWithoutQuizzes.forEach(module => {
        console.log(`      - ${module.title} (${module.category} - ${module.level})`);
      });
    }

    // 5. Análise de Categorias SEM Módulos
    console.log('\n📂 CATEGORIAS SEM MÓDULOS:');
    const allCategories = [
      'propriedades-som', 'escalas-maiores', 'figuras-musicais', 
      'expressao-musical', 'solfegio-basico', 'compasso-simples',
      'andamento-dinamica', 'articulacao-musical', 'intervalos-musicais',
      'sincopa-contratempo', 'compasso-composto', 'ritmo-ternarios'
    ];
    
    const categoriesWithoutModules = allCategories.filter(category => 
      !modulesByCategory[category]
    );
    
    if (categoriesWithoutModules.length === 0) {
      console.log('   ✅ Todas as categorias têm módulos!');
    } else {
      console.log(`   ⚠️ ${categoriesWithoutModules.length} categorias sem módulos:`);
      categoriesWithoutModules.forEach(category => {
        console.log(`      - ${category}`);
      });
    }

    // 6. Análise de Consistência de Níveis
    console.log('\n🔄 CONSISTÊNCIA DE NÍVEIS:');
    const inconsistentModules = modules.filter(module => {
      const expectedLevel = getExpectedLevel(module.category);
      return expectedLevel && module.level !== expectedLevel;
    });
    
    if (inconsistentModules.length === 0) {
      console.log('   ✅ Todos os módulos têm níveis consistentes!');
    } else {
      console.log(`   ⚠️ ${inconsistentModules.length} módulos com níveis inconsistentes:`);
      inconsistentModules.forEach(module => {
        const expectedLevel = getExpectedLevel(module.category);
        console.log(`      - ${module.title}: Atual(${module.level}) vs Esperado(${expectedLevel})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

// Função para determinar o nível esperado baseado na categoria
const getExpectedLevel = (category) => {
  const levelMap = {
    // APRENDIZ
    'propriedades-som': 'aprendiz',
    'solfegio-basico': 'aprendiz',
    'figuras-musicais': 'aprendiz',
    'compasso-simples': 'aprendiz',
    
    // VIRTUOSO
    'escalas-maiores': 'virtuoso',
    'ritmo-ternarios': 'virtuoso',
    'andamento-dinamica': 'virtuoso',
    'articulacao-musical': 'virtuoso',
    'intervalos-musicais': 'virtuoso',
    
    // MAESTRO
    'sincopa-contratempo': 'maestro',
    'compasso-composto': 'maestro',
    'expressao-musical': 'maestro'
  };
  
  return levelMap[category];
};

analyzeDatabase();










