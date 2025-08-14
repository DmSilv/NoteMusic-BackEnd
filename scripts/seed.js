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
      level: 'iniciante',
      totalPoints: 0,
      weeklyGoal: 5,
      weeklyProgress: 0
    });

    // Criar módulos
    console.log('📚 Criando módulos...');
    const createdModules = [];
    for (const moduleData of modulesData) {
      const module = await Module.create(moduleData);
      createdModules.push(module);
      console.log(`  ✓ Módulo criado: ${module.title} (${module.level})`);
    }

    // Criar quizzes baseados em seedData (por categoria/nível)
    console.log('📝 Criando quizzes...');
    const moduleIdToQuizCount = new Map();
    for (const quizData of quizQuestionsData) {
      // Encontrar o primeiro módulo correspondente por categoria e nível que ainda não recebeu quiz
      const module = createdModules.find(m => 
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

        // Atualizar módulo com referência ao quiz
        module.quizzes.push(quiz._id);
        await module.save();

        moduleIdToQuizCount.set(module._id.toString(), 1);
        console.log(`  ✓ Quiz criado: ${quiz.title} (${quiz.questions.length} questões)`);
      } else {
        console.log(`  ⚠️ Módulo não encontrado para quiz: ${quizData.moduleCategory} - ${quizData.level}`);
      }
    }

    // Garantir que CADA módulo tenha pelo menos 1 quiz
    console.log('🔁 Garantindo que todos os módulos tenham um quiz...');
    for (const module of createdModules) {
      const existingCount = await Quiz.countDocuments({ moduleId: module._id });
      if (existingCount === 0) {
        // Gerar um quiz simples automaticamente com base no conteúdo do módulo
        const autoQuestions = [
          {
            question: `Qual tema melhor descreve o módulo "${module.title}"?`,
            options: [
              { id: 'A', label: module.category.replace(/-/g, ' '), isCorrect: true },
              { id: 'B', label: 'Ritmo', isCorrect: false },
              { id: 'C', label: 'Instrumentação aleatória', isCorrect: false },
              { id: 'D', label: 'História da música', isCorrect: false }
            ],
            category: module.category,
            difficulty: 'facil',
            points: 10
          },
          {
            question: `Este módulo é indicado para qual nível?`,
            options: [
              { id: 'A', label: 'iniciante', isCorrect: module.level === 'iniciante' },
              { id: 'B', label: 'intermediario', isCorrect: module.level === 'intermediario' },
              { id: 'C', label: 'avancado', isCorrect: module.level === 'avancado' },
              { id: 'D', label: 'todos', isCorrect: false }
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
        console.log(`  ➕ Quiz gerado automaticamente para módulo: ${module.title}`);
      }
    }

    // Criar quiz de desafio diário
    console.log('🎯 Criando quiz de desafio diário...');
    const dailyChallengeQuiz = await Quiz.create({
      title: 'Desafio Diário de Música',
      description: 'Complete o desafio diário para ganhar pontos extras!',
      moduleId: createdModules[0]._id, // Usar primeiro módulo como referência
      questions: [
        {
          question: 'Qual instrumento é conhecido como "rei dos instrumentos"?',
          options: [
            { id: 'A', label: 'Piano', isCorrect: false },
            { id: 'B', label: 'Violino', isCorrect: false },
            { id: 'C', label: 'Órgão', isCorrect: true, explanation: 'O órgão é tradicionalmente conhecido como o "rei dos instrumentos".' },
            { id: 'D', label: 'Guitarra', isCorrect: false }
          ],
          category: 'daily',
          difficulty: 'facil',
          points: 10
        },
        {
          question: 'Qual é a nota musical mais alta?',
          options: [
            { id: 'A', label: 'Dó', isCorrect: false },
            { id: 'B', label: 'Ré', isCorrect: false },
            { id: 'C', label: 'Mi', isCorrect: false },
            { id: 'D', label: 'Si', isCorrect: true, explanation: 'Si é a nota mais alta na escala musical básica.' }
          ],
          category: 'daily',
          difficulty: 'facil',
          points: 10
        }
      ],
      level: 'iniciante',
      type: 'daily-challenge',
      timeLimit: 600, // 10 minutos para desafio diário
      passingScore: 70,
      attempts: 1, // Apenas uma tentativa por dia
      totalAttempts: 0,
      averageScore: 0
    });

    console.log(`  ✓ Quiz de desafio diário criado: ${dailyChallengeQuiz.title}`);

    // Criar quiz de teste para a API
    console.log('🧪 Criando quiz de teste...');
    const testQuiz = await Quiz.create({
      title: 'Quiz de Teste',
      description: 'Quiz para testar o sistema',
      moduleId: createdModules[0]._id,
      questions: [
        {
          question: 'Qual é a nota musical mais alta?',
          options: [
            { id: 'A', label: 'Dó', isCorrect: false },
            { id: 'B', label: 'Ré', isCorrect: false },
            { id: 'C', label: 'Mi', isCorrect: false },
            { id: 'D', label: 'Si', isCorrect: true, explanation: 'Si é a nota mais alta na escala musical básica.' }
          ],
          category: 'test',
          difficulty: 'facil',
          points: 10
        },
        {
          question: 'Quantas notas tem uma escala maior?',
          options: [
            { id: 'A', label: '5 notas', isCorrect: false },
            { id: 'B', label: '6 notas', isCorrect: false },
            { id: 'C', label: '7 notas', isCorrect: true, explanation: 'Uma escala maior tem 7 notas: Dó, Ré, Mi, Fá, Sol, Lá, Si.' },
            { id: 'D', label: '8 notas', isCorrect: false }
          ],
          category: 'test',
          difficulty: 'facil',
          points: 10
        },
        {
          question: 'O que significa "forte" em música?',
          options: [
            { id: 'A', label: 'Volume alto', isCorrect: true, explanation: '"Forte" (f) indica que a música deve ser tocada com volume alto.' },
            { id: 'B', label: 'Volume baixo', isCorrect: false },
            { id: 'C', label: 'Velocidade rápida', isCorrect: false },
            { id: 'D', label: 'Velocidade lenta', isCorrect: false }
          ],
          category: 'test',
          difficulty: 'facil',
          points: 10
        }
      ],
      level: 'iniciante',
      type: 'module',
      timeLimit: 300,
      passingScore: 70,
      attempts: 3,
      totalAttempts: 0,
      averageScore: 0
    });

    console.log(`  ✓ Quiz de teste criado: ${testQuiz.title}`);

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   Módulos criados: ${createdModules.length}`);
    console.log(`   Quizzes criados: ${quizQuestionsData.length + 2}`); // +2 para desafio diário e teste
    console.log(`   Usuário de teste criado: 1`);
    
    console.log('\n📧 Usuário de teste:');
    console.log('   Email: teste@notemusic.com');
    console.log('   Senha: senha123');
    console.log('   Nível: iniciante');
    
    console.log('\n🎵 Módulos disponíveis:');
    createdModules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title} (${module.level})`);
    });

    console.log('\n🧪 Quiz de teste disponível:');
    console.log(`   ID: ${testQuiz._id}`);
    console.log(`   Título: ${testQuiz.title}`);
    console.log(`   Questões: ${testQuiz.questions.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
};

// Executar seed
seedDatabase();