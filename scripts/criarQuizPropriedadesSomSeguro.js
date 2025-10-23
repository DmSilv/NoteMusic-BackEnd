const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../src/models/Quiz');
const Module = require('../src/models/Module');
const aprendizQuestions = require('../../perguntas_nivel_aprendiz.json');

/**
 * Script SEGURO para criar quiz do módulo "Propriedades do Som"
 * Usa perguntas reais do JSON, não meta-informação
 */
const criarQuizSeguro = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    console.log('🔧 CRIANDO QUIZ PARA MÓDULO "PROPRIEDADES DO SOM"\n');
    console.log('='.repeat(80));

    // Buscar o módulo "Propriedades do Som"
    const module = await Module.findOne({ 
      title: { $regex: /Propriedades do Som/i },
      level: 'aprendiz'
    });

    if (!module) {
      console.log('❌ Módulo "Propriedades do Som" não encontrado!');
      process.exit(1);
    }

    console.log(`\n📚 Módulo encontrado: ${module.title}`);
    console.log(`   ID: ${module._id}`);

    // Verificar se já existe quiz
    const existingQuiz = await Quiz.findOne({ moduleId: module._id });
    
    if (existingQuiz) {
      console.log(`\n⚠️  Quiz já existe para este módulo!`);
      console.log(`   Título: ${existingQuiz.title}`);
      console.log(`   Perguntas: ${existingQuiz.questions.length}`);
      console.log('\nSaindo sem fazer alterações...');
      process.exit(0);
    }

    // Pegar perguntas de ALTURA, INTENSIDADE, TIMBRE (1 de cada = 3 perguntas)
    const alturaQ = aprendizQuestions.questions.find(q => q.module === 'ALTURA');
    const intensidadeQ = aprendizQuestions.questions.find(q => q.module === 'INTENSIDADE');
    const timbreQ = aprendizQuestions.questions.find(q => q.module === 'TIMBRE');

    if (!alturaQ || !intensidadeQ || !timbreQ) {
      console.log('❌ Não foi possível encontrar perguntas no JSON!');
      process.exit(1);
    }

    console.log('\n📝 Perguntas selecionadas do JSON:');
    console.log(`   1. ALTURA: "${alturaQ.question.substring(0, 50)}..."`);
    console.log(`   2. INTENSIDADE: "${intensidadeQ.question.substring(0, 50)}..."`);
    console.log(`   3. TIMBRE: "${timbreQ.question.substring(0, 50)}..."`);

    // Converter perguntas para formato do quiz
    const convertToQuizFormat = (q) => ({
      question: q.question,
      options: q.options.map((option, index) => ({
        id: String.fromCharCode(97 + index), // a, b, c, d
        label: option,
        isCorrect: index === q.correctAnswer,
        explanation: index === q.correctAnswer ? q.explanation : ''
      })),
      category: q.module,
      difficulty: 'facil',
      points: 10
    });

    const quizQuestions = [
      convertToQuizFormat(alturaQ),
      convertToQuizFormat(intensidadeQ),
      convertToQuizFormat(timbreQ)
    ];

    // Criar o quiz
    const quizData = {
      title: `Quiz - Propriedades do Som`,
      description: `Teste introdutório sobre as propriedades fundamentais do som: altura, intensidade e timbre`,
      moduleId: module._id,
      questions: quizQuestions,
      level: 'aprendiz',
      category: 'propriedades-som',
      type: 'module',
      timeLimit: 600, // 10 minutos
      passingScore: 60, // 60% para passar
      attempts: 3,
      totalAttempts: 0,
      averageScore: 0,
      isActive: true
    };

    console.log('\n🆕 Criando novo quiz...');
    const newQuiz = await Quiz.create(quizData);
    console.log(`✅ Quiz criado com sucesso!`);
    console.log(`   ID: ${newQuiz._id}`);
    console.log(`   Perguntas: ${newQuiz.questions.length}`);

    // Atualizar módulo com referência ao quiz
    console.log('\n🔗 Associando quiz ao módulo...');
    await Module.findByIdAndUpdate(module._id, {
      $addToSet: { quizzes: newQuiz._id }
    });
    console.log('✅ Associação concluída!');

    // Verificar resultado
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 VERIFICAÇÃO FINAL:\n');
    
    const allQuizzes = await Quiz.find({ level: 'aprendiz' });
    console.log(`Total de quizzes de aprendiz: ${allQuizzes.length}`);
    
    const allModules = await Module.find({ level: 'aprendiz' });
    console.log(`Total de módulos de aprendiz: ${allModules.length}`);

    if (allQuizzes.length === allModules.length) {
      console.log('\n✅ PERFEITO! Todos os módulos têm quiz agora!');
    } else {
      console.log(`\n⚠️  Ainda falta ${allModules.length - allQuizzes.length} quiz(zes)`);
    }

    // Mostrar o quiz criado
    console.log('\n📋 QUIZ CRIADO:\n');
    console.log(`Título: ${newQuiz.title}`);
    console.log(`Perguntas:`);
    newQuiz.questions.forEach((q, idx) => {
      const correctIdx = q.options.findIndex(opt => opt.isCorrect);
      console.log(`\n${idx + 1}. ${q.question}`);
      q.options.forEach((opt, optIdx) => {
        const marker = optIdx === correctIdx ? ' ✓' : '';
        console.log(`   ${optIdx}. ${opt.label}${marker}`);
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ OPERAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('   O módulo "Propriedades do Som" agora tem um quiz funcional.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
};

criarQuizSeguro();

