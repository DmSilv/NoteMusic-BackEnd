const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../../src/models/module.model');
const Quiz = require('../../src/models/quiz.model');

// Conectar ao banco
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
};

// Limpar dados existentes
const clearExistingData = async () => {
  try {
    console.log('🧹 Limpando dados existentes...');
    await Quiz.deleteMany({});
    await Module.deleteMany({});
    console.log('✅ Dados existentes removidos');
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
    throw error;
  }
};

// Criar módulos simples
const createSimpleModules = async () => {
  try {
    console.log('📚 Criando módulos simples...');
    
    const modules = [
      // APRENDIZ - 8 módulos
      { title: 'Propriedades do Som', description: 'Aprenda sobre frequência, timbre, intensidade e duração', category: 'propriedades-som', level: 'aprendiz', order: 1, points: 50, duration: 15, content: { theory: 'O som possui quatro propriedades principais: altura, timbre, intensidade e duração.' }, isActive: true },
      { title: 'Notas Musicais', description: 'Domine as 7 notas musicais e o solfejo básico', category: 'solfegio-basico', level: 'aprendiz', order: 2, points: 50, duration: 20, content: { theory: 'As sete notas musicais formam a base da música ocidental.' }, isActive: true },
      { title: 'Pauta Musical', description: 'Entenda a pauta musical e os diferentes tipos de claves', category: 'solfegio-basico', level: 'aprendiz', order: 3, points: 50, duration: 18, content: { theory: 'A pauta musical é formada por 5 linhas e 4 espaços.' }, isActive: true },
      { title: 'Figuras de Valor', description: 'Aprenda sobre semibreve, mínima, semínima e outras figuras', category: 'figuras-musicais', level: 'aprendiz', order: 4, points: 50, duration: 25, content: { theory: 'As figuras musicais representam a duração das notas.' }, isActive: true },
      { title: 'Compassos Simples', description: 'Domine os compassos 2/4, 3/4 e 4/4', category: 'compasso-simples', level: 'aprendiz', order: 5, points: 50, duration: 22, content: { theory: 'O compasso divide a música em unidades regulares de tempo.' }, isActive: true },
      { title: 'Escalas Maiores', description: 'Aprenda a construir escalas maiores e suas fórmulas', category: 'escalas-maiores', level: 'aprendiz', order: 6, points: 50, duration: 30, content: { theory: 'A escala maior é formada pela sequência tom-tom-semitom-tom-tom-tom-semitom.' }, isActive: true },
      { title: 'Dinâmica Musical', description: 'Entenda os sinais de dinâmica e expressão', category: 'andamento-dinamica', level: 'aprendiz', order: 7, points: 50, duration: 15, content: { theory: 'A dinâmica musical controla o volume e a intensidade.' }, isActive: true },
      { title: 'Acidentes Musicais', description: 'Domine os acidentes e suas funções', category: 'figuras-musicais', level: 'aprendiz', order: 8, points: 50, duration: 20, content: { theory: 'Os acidentes alteram a altura das notas.' }, isActive: true },

      // VIRTUOSO - 6 módulos
      { title: 'Escalas Menores', description: 'Aprenda escalas menores naturais, harmônicas e melódicas', category: 'escalas-maiores', level: 'virtuoso', order: 1, points: 75, duration: 35, content: { theory: 'As escalas menores têm três formas: natural, harmônica e melódica.' }, isActive: true },
      { title: 'Intervalos Musicais', description: 'Domine intervalos consonantes e dissonantes', category: 'intervalos-musicais', level: 'virtuoso', order: 2, points: 75, duration: 40, content: { theory: 'Intervalo é a distância entre duas notas.' }, isActive: true },
      { title: 'Acordes Básicos', description: 'Aprenda tríades maiores, menores e diminutas', category: 'intervalos-musicais', level: 'virtuoso', order: 3, points: 75, duration: 45, content: { theory: 'Acorde é a combinação simultânea de três ou mais notas.' }, isActive: true },
      { title: 'Modos Gregos', description: 'Explore os 7 modos gregos e suas características', category: 'escalas-maiores', level: 'virtuoso', order: 4, points: 75, duration: 50, content: { theory: 'Os modos gregos são escalas derivadas da escala maior.' }, isActive: true },
      { title: 'Síncopa e Contratempo', description: 'Domine ritmos sincopados e contratempos', category: 'sincopa-contratempo', level: 'virtuoso', order: 5, points: 75, duration: 30, content: { theory: 'Síncopa é o deslocamento do acento rítmico.' }, isActive: true },
      { title: 'Articulação Musical', description: 'Aprenda staccato, legato, portato e outras articulações', category: 'articulacao-musical', level: 'virtuoso', order: 6, points: 75, duration: 25, content: { theory: 'Articulação é a forma como as notas são executadas.' }, isActive: true },

      // MAESTRO - 5 módulos
      { title: 'Harmonia Avançada', description: 'Domine acordes de sétima, nona e extensões', category: 'expressao-musical', level: 'maestro', order: 1, points: 100, duration: 60, content: { theory: 'Harmonia avançada inclui acordes de sétima e extensões.' }, isActive: true },
      { title: 'Contraponto', description: 'Aprenda as regras do contraponto e fuga', category: 'expressao-musical', level: 'maestro', order: 2, points: 100, duration: 70, content: { theory: 'Contraponto é a arte de combinar melodias independentes.' }, isActive: true },
      { title: 'Orquestração', description: 'Aprenda a orquestrar para diferentes instrumentos', category: 'compasso-composto', level: 'maestro', order: 3, points: 100, duration: 80, content: { theory: 'Orquestração é a arte de distribuir material musical.' }, isActive: true },
      { title: 'Compasso Composto', description: 'Domine os compassos compostos e suas subdivisões', category: 'compasso-composto', level: 'maestro', order: 4, points: 100, duration: 40, content: { theory: 'Compassos compostos têm subdivisão ternária.' }, isActive: true },
      { title: 'Modulação', description: 'Aprenda a modular entre diferentes tonalidades', category: 'expressao-musical', level: 'maestro', order: 5, points: 100, duration: 55, content: { theory: 'Modulação é a mudança de tonalidade durante uma peça musical.' }, isActive: true }
    ];

    const createdModules = await Module.insertMany(modules);
    console.log(`✅ ${createdModules.length} módulos criados`);
    return createdModules;
  } catch (error) {
    console.error('❌ Erro ao criar módulos:', error);
    throw error;
  }
};

// Criar quizzes com estrutura correta
const createQuizzesWithCorrectStructure = async (modules) => {
  try {
    console.log('🎯 Criando quizzes com estrutura correta...');
    
    const quizzes = [];
    
    modules.forEach(module => {
      const quiz = {
        title: `Quiz - ${module.title}`,
        description: `Teste seus conhecimentos sobre ${module.title.toLowerCase()}`,
        moduleId: module._id,
        level: module.level,
        category: module.category,
        questions: generateQuestionsForModule(module),
        isActive: true
      };
      
      quizzes.push(quiz);
    });

    const createdQuizzes = await Quiz.insertMany(quizzes);
    console.log(`✅ ${createdQuizzes.length} quizzes criados`);
    return createdQuizzes;
  } catch (error) {
    console.error('❌ Erro ao criar quizzes:', error);
    throw error;
  }
};

// Gerar 7 perguntas com estrutura correta
const generateQuestionsForModule = (module) => {
  const questions = [];
  
  for (let i = 1; i <= 7; i++) {
    questions.push({
      question: `Pergunta ${i} sobre ${module.title}: Qual é a característica principal deste módulo?`,
      options: [
        { id: 'A', label: 'Conceitos básicos de música', isCorrect: module.level === 'aprendiz', explanation: 'Módulos de nível Aprendiz focam em conceitos básicos.' },
        { id: 'B', label: 'Técnicas intermediárias', isCorrect: module.level === 'virtuoso', explanation: 'Módulos de nível Virtuoso desenvolvem técnicas intermediárias.' },
        { id: 'C', label: 'Conceitos avançados', isCorrect: module.level === 'maestro', explanation: 'Módulos de nível Maestro abordam conceitos avançados.' },
        { id: 'D', label: 'Improvisação livre', isCorrect: false, explanation: 'Este módulo não foca em improvisação livre.' }
      ],
      category: module.category,
      difficulty: module.level === 'aprendiz' ? 'facil' : module.level === 'virtuoso' ? 'medio' : 'dificil',
      points: module.level === 'aprendiz' ? 10 : module.level === 'virtuoso' ? 15 : 20
    });
  }
  
  return questions;
};

// Função principal
const finalContentFix = async () => {
  try {
    console.log('🚀 CORREÇÃO FINAL DO CONTEÚDO');
    console.log('=' .repeat(60));

    await clearExistingData();
    const modules = await createSimpleModules();
    const quizzes = await createQuizzesWithCorrectStructure(modules);

    console.log('\n📊 RESULTADO FINAL:');
    console.log('-' .repeat(40));
    
    const totalModules = await Module.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalQuestions = await Quiz.aggregate([
      { $project: { questionCount: { $size: "$questions" } } },
      { $group: { _id: null, total: { $sum: "$questionCount" } } }
    ]);

    console.log(`📚 Total de módulos: ${totalModules}`);
    console.log(`🎯 Total de quizzes: ${totalQuizzes}`);
    console.log(`❓ Total de perguntas: ${totalQuestions[0]?.total || 0}`);

    const levelStats = await Module.aggregate([
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📈 DISTRIBUIÇÃO POR NÍVEL:');
    levelStats.forEach(stat => {
      console.log(`   🎯 ${stat._id.toUpperCase()}: ${stat.count} módulos`);
    });

    const questionsByLevel = await Quiz.aggregate([
      { $project: { level: 1, questionCount: { $size: "$questions" } } },
      { $group: { _id: "$level", total: { $sum: "$questionCount" } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n❓ PERGUNTAS POR NÍVEL:');
    questionsByLevel.forEach(stat => {
      console.log(`   🎯 ${stat._id.toUpperCase()}: ${stat.total} perguntas`);
    });

    console.log('\n🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(finalContentFix);
}

module.exports = { finalContentFix };



