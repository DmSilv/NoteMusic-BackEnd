const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');
const Module = require('../src/models/Module');
const Quiz = require('../src/models/Quiz');
const { modulesData, quizQuestionsData } = require('../src/utils/seedData');

const seedDatabase = async () => {
  try {
    // Conectar ao banco
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');

    // Limpar dados existentes (CUIDADO em produção!)
    console.log('🧹 Limpando dados existentes...');
    await User.deleteMany({});
    await Module.deleteMany({});
    await Quiz.deleteMany({});

    // Criar usuário de teste
    console.log('👤 Criando usuário de teste...');
    const testUser = await User.create({
      name: 'Usuário Teste',
      email: 'teste@notemusic.com',
      password: 'senha123', // O middleware do Mongoose vai fazer o hash
      level: 'iniciante'
    });

    // Criar módulos
    console.log('📚 Criando módulos...');
    const createdModules = [];
    for (const moduleData of modulesData) {
      const module = await Module.create(moduleData);
      createdModules.push(module);
      console.log(`  ✓ Módulo criado: ${module.title}`);
    }

    // Criar quizzes
    console.log('📝 Criando quizzes...');
    for (const quizData of quizQuestionsData) {
      // Encontrar módulo correspondente
      const module = createdModules.find(m => 
        m.category === quizData.moduleCategory && 
        m.level === quizData.level
      );

      if (module) {
        const quiz = await Quiz.create({
          title: `Quiz - ${module.title}`,
          description: `Teste seus conhecimentos sobre ${module.title}`,
          moduleId: module._id,
          questions: quizData.questions,
          level: quizData.level,
          timeLimit: 300,
          passingScore: 70,
          attempts: 3
        });

        // Atualizar módulo com referência ao quiz
        module.quizzes.push(quiz._id);
        await module.save();

        console.log(`  ✓ Quiz criado: ${quiz.title}`);
      }
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📧 Usuário de teste:');
    console.log('   Email: teste@notemusic.com');
    console.log('   Senha: senha123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
};

// Executar seed
seedDatabase();