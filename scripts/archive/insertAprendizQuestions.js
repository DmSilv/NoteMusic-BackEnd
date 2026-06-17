const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../../src/models/module.model');
const Quiz = require('../../src/models/quiz.model');

// Importar as perguntas do JSON
const aprendizQuestions = require('../../perguntas_nivel_aprendiz.json');

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
    difficulty: 'facil', // Aprendiz = fácil
    points: 10 // Pontos padrão para nível aprendiz
  }));
};

// Função para criar ou atualizar módulos aprendiz
const createOrUpdateAprendizModules = async () => {
  try {
    console.log('🎯 Criando/atualizando módulos aprendiz...\n');

    // Agrupar perguntas por módulo
    const questionsByModule = {};
    
    aprendizQuestions.questions.forEach(q => {
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
        level: 'aprendiz'
      });

      if (existingModule) {
        console.log(`   ✅ Módulo existente encontrado: ${existingModule.title}`);
        totalModulesUpdated++;
      } else {
        // Criar novo módulo
        const moduleData = {
          title: `${moduleName} - Nível Aprendiz`,
          description: `Aprenda os fundamentos de ${moduleName.toLowerCase()} no nível aprendiz`,
          category: category,
          level: 'aprendiz',
          order: Object.keys(questionsByModule).indexOf(moduleName) + 1,
          points: 50,
          duration: 30, // 30 minutos para nível aprendiz
          content: {
            theory: `Conteúdo introdutório sobre ${moduleName.toLowerCase()} para iniciantes.`,
            examples: [
              {
                title: 'Exemplo Básico',
                description: `Exemplo prático de ${moduleName.toLowerCase()}`,
                imageUrl: '',
                audioUrl: ''
              }
            ],
            exercises: [
              {
                title: 'Exercício Inicial',
                description: `Prática básica de ${moduleName.toLowerCase()}`,
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
          timeLimit: 600, // 10 minutos para nível aprendiz
          passingScore: 60, // 60% para passar no nível aprendiz
          attempts: 3,
          updatedAt: new Date()
        });
        console.log(`   ✅ Quiz atualizado com ${quizQuestions.length} perguntas`);
        totalQuizzesUpdated++;
      } else {
        // Criar novo quiz
        const quizData = {
          title: `Quiz Aprendiz - ${moduleName}`,
          description: `Teste básico sobre ${moduleName.toLowerCase()} para nível aprendiz`,
          moduleId: existingModule._id,
          questions: quizQuestions,
          level: 'aprendiz',
          type: 'module',
          timeLimit: 600, // 10 minutos
          passingScore: 60, // 60% para passar
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
const insertAprendizQuestions = async () => {
  try {
    console.log('🚀 INSERINDO PERGUNTAS DO NÍVEL APRENDIZ');
    console.log('=' .repeat(60));
    console.log(`📊 Total de perguntas no JSON: ${aprendizQuestions.questions.length}`);
    console.log(`📚 Módulos identificados: ${Object.keys(moduleMapping).length}`);
    console.log('');

    // Criar/atualizar módulos e quizzes
    const results = await createOrUpdateAprendizModules();

    // Estatísticas finais
    console.log('🎉 INSERÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=' .repeat(60));
    console.log('📊 RESUMO:');
    console.log(`   📚 Módulos criados: ${results.modulesCreated}`);
    console.log(`   🔄 Módulos atualizados: ${results.modulesUpdated}`);
    console.log(`   🎯 Quizzes criados: ${results.quizzesCreated}`);
    console.log(`   🔄 Quizzes atualizados: ${results.quizzesUpdated}`);
    console.log(`   📝 Total de perguntas processadas: ${aprendizQuestions.questions.length}`);

    // Verificar resultado no banco
    console.log('\n🔍 VERIFICAÇÃO NO BANCO:');
    const totalModules = await Module.countDocuments({ level: 'aprendiz' });
    const totalQuizzes = await Quiz.countDocuments({ level: 'aprendiz' });
    const totalQuestions = await Quiz.aggregate([
      { $match: { level: 'aprendiz' } },
      { $project: { questionCount: { $size: "$questions" } } },
      { $group: { _id: null, total: { $sum: "$questionCount" } } }
    ]);

    console.log(`   📚 Módulos aprendiz no banco: ${totalModules}`);
    console.log(`   🎯 Quizzes aprendiz no banco: ${totalQuizzes}`);
    console.log(`   📝 Total de perguntas aprendiz: ${totalQuestions[0]?.total || 0}`);

  } catch (error) {
    console.error('❌ Erro durante a inserção:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB()
    .then(() => insertAprendizQuestions())
    .then(() => {
      console.log('\n✅ Processo concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { insertAprendizQuestions, connectDB };





















