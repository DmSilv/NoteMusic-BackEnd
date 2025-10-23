const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../src/models/Module');
const Quiz = require('../src/models/Quiz');

// Importar as perguntas do JSON
const virtuosoQuestions = require('../../perguntas_nivel_virtuoso.json');

// Mapeamento dos módulos do JSON para as categorias do banco
const moduleMapping = {
  'ALTURA': 'propriedades-som',
  'INTENSIDADE': 'propriedades-som', 
  'TIMBRE': 'propriedades-som',
  'DURAÇÃO': 'propriedades-som',
  'PAUTA OU PENTAGRAMA': 'figuras-musicais',
  'CLAVES': 'figuras-musicais',
  'NOTAS MUSICAIS': 'figuras-musicais',
  'FIGURAS MUSICAIS': 'figuras-musicais',
  'PULSAÇÃO E TEMPO': 'ritmo-ternarios',
  'FÓRMULAS DE COMPASSO': 'compasso-simples',
  'COMPASSOS SIMPLES': 'compasso-simples',
  'COMPASSOS COMPOSTOS': 'compasso-composto',
  'TONS E SEMITONS': 'intervalos-musicais',
  'INTERVALOS MUSICAIS': 'intervalos-musicais',
  'ESCALAS MAIORES': 'escalas-maiores',
  'ESCALAS MENORES': 'escalas-maiores',
  'FORMAÇÃO DE ACORDES': 'intervalos-musicais',
  'TRÍADES': 'intervalos-musicais',
  'FUNÇÕES HARMÔNICAS': 'intervalos-musicais',
  'CADÊNCIAS': 'intervalos-musicais'
};

// Conectar ao banco
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

// Função para converter perguntas do JSON para o formato do banco
const convertQuestionsToQuizFormat = (questions) => {
  return questions.map(q => ({
    question: q.question,
    options: q.options.map((option, index) => ({
      id: String.fromCharCode(97 + index), // a, b, c, d
      label: option,
      isCorrect: index === q.correctAnswer,
      explanation: index === q.correctAnswer ? q.explanation : ''
    })),
    category: q.module,
    difficulty: 'dificil', // Virtuoso = difícil
    points: 15 // Pontos mais altos para nível virtuoso
  }));
};

// Função para criar ou atualizar módulos virtuoso
const createOrUpdateVirtuosoModules = async () => {
  try {
    console.log('🎯 Criando/atualizando módulos virtuoso...\n');

    // Agrupar perguntas por módulo
    const questionsByModule = {};
    
    virtuosoQuestions.questions.forEach(q => {
      if (!questionsByModule[q.module]) {
        questionsByModule[q.module] = [];
      }
      questionsByModule[q.module].push(q);
    });

    let totalModulesCreated = 0;
    let totalModulesUpdated = 0;
    let totalQuizzesCreated = 0;
    let totalQuizzesUpdated = 0;

    // Processar cada módulo
    for (const [moduleName, questions] of Object.entries(questionsByModule)) {
      const category = moduleMapping[moduleName];
      
      if (!category) {
        console.log(`⚠️ Categoria não mapeada para módulo: ${moduleName}`);
        continue;
      }

      console.log(`📚 Processando módulo: ${moduleName}`);
      console.log(`   🎵 Categoria: ${category}`);
      console.log(`   📝 Perguntas: ${questions.length}`);

      // Verificar se módulo já existe
      let existingModule = await Module.findOne({
        title: { $regex: new RegExp(moduleName, 'i') },
        level: 'virtuoso'
      });

      if (existingModule) {
        console.log(`   ✅ Módulo existente encontrado: ${existingModule.title}`);
        totalModulesUpdated++;
      } else {
        // Criar novo módulo
        const moduleData = {
          title: `${moduleName} - Nível Virtuoso`,
          description: `Aprofunde seus conhecimentos sobre ${moduleName.toLowerCase()} no nível virtuoso`,
          category: category,
          level: 'virtuoso',
          order: Object.keys(questionsByModule).indexOf(moduleName) + 1,
          points: 100,
          duration: 45, // 45 minutos para nível virtuoso
          content: {
            theory: `Conteúdo avançado sobre ${moduleName.toLowerCase()} para músicos virtuosos.`,
            examples: [
              {
                title: 'Exemplo Prático',
                description: `Aplicação prática de ${moduleName.toLowerCase()}`,
                imageUrl: '',
                audioUrl: ''
              }
            ],
            exercises: [
              {
                title: 'Exercício Avançado',
                description: `Prática avançada de ${moduleName.toLowerCase()}`,
                type: 'pratica'
              }
            ]
          },
          isActive: true
        };

        existingModule = await Module.create(moduleData);
        console.log(`   ✅ Novo módulo criado: ${existingModule.title}`);
        totalModulesCreated++;
      }

      // Converter perguntas para formato do quiz
      const quizQuestions = convertQuestionsToQuizFormat(questions);

      // Verificar se quiz já existe para este módulo
      let existingQuiz = await Quiz.findOne({
        moduleId: existingModule._id
      });

      if (existingQuiz) {
        // Atualizar quiz existente
        await Quiz.findByIdAndUpdate(existingQuiz._id, {
          questions: quizQuestions,
          timeLimit: 900, // 15 minutos para nível virtuoso
          passingScore: 75, // 75% para passar no nível virtuoso
          attempts: 3,
          updatedAt: new Date()
        });
        console.log(`   ✅ Quiz atualizado com ${quizQuestions.length} perguntas`);
        totalQuizzesUpdated++;
      } else {
        // Criar novo quiz
        const quizData = {
          title: `Quiz Virtuoso - ${moduleName}`,
          description: `Teste avançado sobre ${moduleName.toLowerCase()} para nível virtuoso`,
          moduleId: existingModule._id,
          questions: quizQuestions,
          level: 'virtuoso',
          type: 'module',
          timeLimit: 900, // 15 minutos
          passingScore: 75, // 75% para passar
          attempts: 3,
          totalAttempts: 0,
          averageScore: 0,
          isActive: true
        };

        const newQuiz = await Quiz.create(quizData);
        console.log(`   ✅ Novo quiz criado com ${quizQuestions.length} perguntas`);

        // Atualizar módulo com referência ao quiz
        await Module.findByIdAndUpdate(existingModule._id, {
          $addToSet: { quizzes: newQuiz._id }
        });
        totalQuizzesCreated++;
      }

      console.log('');
    }

    return {
      modulesCreated: totalModulesCreated,
      modulesUpdated: totalModulesUpdated,
      quizzesCreated: totalQuizzesCreated,
      quizzesUpdated: totalQuizzesUpdated
    };

  } catch (error) {
    console.error('❌ Erro ao criar/atualizar módulos:', error);
    throw error;
  }
};

// Função principal
const insertVirtuosoQuestions = async () => {
  try {
    console.log('🚀 INSERINDO PERGUNTAS DO NÍVEL VIRTUOSO');
    console.log('=' .repeat(60));
    console.log(`📊 Total de perguntas no JSON: ${virtuosoQuestions.questions.length}`);
    console.log(`📚 Módulos identificados: ${Object.keys(moduleMapping).length}`);
    console.log('');

    // Criar/atualizar módulos e quizzes
    const results = await createOrUpdateVirtuosoModules();

    // Estatísticas finais
    console.log('🎉 INSERÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=' .repeat(60));
    console.log('📊 RESUMO:');
    console.log(`   📚 Módulos criados: ${results.modulesCreated}`);
    console.log(`   🔄 Módulos atualizados: ${results.modulesUpdated}`);
    console.log(`   🎯 Quizzes criados: ${results.quizzesCreated}`);
    console.log(`   🔄 Quizzes atualizados: ${results.quizzesUpdated}`);
    console.log(`   📝 Total de perguntas processadas: ${virtuosoQuestions.questions.length}`);

    // Verificar resultado no banco
    console.log('\n🔍 VERIFICAÇÃO NO BANCO:');
    const totalModules = await Module.countDocuments({ level: 'virtuoso' });
    const totalQuizzes = await Quiz.countDocuments({ level: 'virtuoso' });
    const totalQuestions = await Quiz.aggregate([
      { $match: { level: 'virtuoso' } },
      { $project: { questionCount: { $size: "$questions" } } },
      { $group: { _id: null, total: { $sum: "$questionCount" } } }
    ]);

    console.log(`   📚 Módulos virtuoso no banco: ${totalModules}`);
    console.log(`   🎯 Quizzes virtuoso no banco: ${totalQuizzes}`);
    console.log(`   📝 Total de perguntas virtuoso: ${totalQuestions[0]?.total || 0}`);

  } catch (error) {
    console.error('❌ Erro durante a inserção:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB()
    .then(() => insertVirtuosoQuestions())
    .then(() => {
      console.log('\n✅ Processo concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { insertVirtuosoQuestions, connectDB };

