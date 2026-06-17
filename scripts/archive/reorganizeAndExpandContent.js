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

// Criar módulos expandidos com distribuição equilibrada
const createExpandedModules = async () => {
  try {
    console.log('📚 Criando módulos expandidos...');
    
    const modules = [
      // NÍVEL APRENDIZ - 8 módulos
      {
        title: 'Propriedades do Som - Os Pilares da Música',
        description: 'Aprenda sobre frequência, timbre, intensidade e duração do som',
        category: 'propriedades-som',
        level: 'aprendiz',
        order: 1,
        points: 50,
        duration: 15,
        content: {
          theory: 'O som é uma onda mecânica que se propaga através de um meio material. Possui quatro propriedades principais: altura (frequência), timbre, intensidade e duração.',
          examples: [
            { title: 'Timbre Instrumental', description: 'Diferentes instrumentos tocando a mesma nota' },
            { title: 'Dinâmica Musical', description: 'Variação de volume em uma música' },
            { title: 'Duração das Notas', description: 'Notas longas e curtas' }
          ],
          exercises: [
            { title: 'Identificação de Propriedades', description: 'Identificar propriedades do som', type: 'audicao' },
            { title: 'Reconhecimento de Timbre', description: 'Reconhecer timbres instrumentais', type: 'audicao' }
          ]
        },
        isActive: true
      },
      {
        title: 'Notas Musicais e Solfejo - O ABC da Música',
        description: 'Domine as 7 notas musicais e o solfejo básico',
        category: 'solfegio-basico',
        level: 'aprendiz',
        order: 2,
        points: 50,
        duration: 20,
        content: {
          theory: 'As sete notas musicais (Dó, Ré, Mi, Fá, Sol, Lá, Si) formam a base da música ocidental. O solfejo é a técnica de cantar as notas usando sílabas específicas.',
          examples: ['Escala de Dó maior', 'Sequências melódicas simples', 'Exercícios de solfejo'],
          exercises: ['Cantar escalas', 'Identificar notas', 'Solfejo rítmico']
        },
        isActive: true
      },
      {
        title: 'Pauta Musical e Claves - Onde Escrevemos a Música',
        description: 'Entenda a pauta musical e os diferentes tipos de claves',
        category: 'solfegio-basico',
        level: 'aprendiz',
        order: 3,
        points: 50,
        duration: 18,
        content: {
          theory: 'A pauta musical é formada por 5 linhas e 4 espaços onde escrevemos as notas. As claves determinam a altura das notas na pauta.',
          examples: ['Clave de Sol', 'Clave de Fá', 'Posição das notas na pauta'],
          exercises: ['Desenhar pautas', 'Identificar claves', 'Posicionar notas']
        },
        isActive: true
      },
      {
        title: 'Figuras de Valor - A Duração das Notas',
        description: 'Aprenda sobre semibreve, mínima, semínima e outras figuras',
        category: 'figuras-musicais',
        level: 'aprendiz',
        order: 4,
        points: 50,
        duration: 25,
        content: {
          theory: 'As figuras musicais representam a duração das notas. A semibreve vale 4 tempos, a mínima vale 2, a semínima vale 1, e assim por diante.',
          examples: ['Semibreve (4 tempos)', 'Mínima (2 tempos)', 'Semínima (1 tempo)', 'Colcheia (1/2 tempo)'],
          exercises: ['Contar tempos', 'Identificar figuras', 'Criar ritmos']
        },
        isActive: true
      },
      {
        title: 'Compassos Simples - Organizando o Tempo',
        description: 'Domine os compassos 2/4, 3/4 e 4/4',
        category: 'compasso-simples',
        level: 'aprendiz',
        order: 5,
        points: 50,
        duration: 22,
        content: {
          theory: 'O compasso divide a música em unidades regulares de tempo. O numerador indica quantos tempos por compasso, o denominador indica a figura que vale 1 tempo.',
          examples: ['Compasso 4/4 (4 semínimas)', 'Compasso 3/4 (3 semínimas)', 'Compasso 2/4 (2 semínimas)'],
          exercises: ['Bater compassos', 'Identificar tipos', 'Criar padrões rítmicos']
        },
        isActive: true
      },
      {
        title: 'Escalas Maiores - A Base da Harmonia',
        description: 'Aprenda a construir escalas maiores e suas fórmulas',
        category: 'escalas-maiores',
        level: 'aprendiz',
        order: 6,
        points: 50,
        duration: 30,
        content: {
          theory: 'A escala maior é formada pela sequência: tom-tom-semitom-tom-tom-tom-semitom. É a base da harmonia tonal ocidental.',
          examples: ['Escala de Dó maior', 'Escala de Sol maior', 'Fórmula da escala maior'],
          exercises: ['Construir escalas', 'Identificar acidentes', 'Tocar escalas']
        },
        isActive: true
      },
      {
        title: 'Dinâmica Musical - Forte e Piano',
        description: 'Entenda os sinais de dinâmica e expressão',
        category: 'andamento-dinamica',
        level: 'aprendiz',
        order: 7,
        points: 50,
        duration: 15,
        content: {
          theory: 'A dinâmica musical controla o volume e a intensidade. Os principais sinais são: p (piano), f (forte), mf (mezzo forte), mp (mezzo piano).',
          examples: ['pp, p, mp, mf, f, ff', 'Crescendo e diminuendo', 'Sforzando'],
          exercises: ['Aplicar dinâmica', 'Reconhecer sinais', 'Expressar musicalmente']
        },
        isActive: true
      },
      {
        title: 'Acidentes Musicais - Sustenido e Bemol',
        description: 'Domine os acidentes e suas funções',
        category: 'figuras-musicais',
        level: 'aprendiz',
        order: 8,
        points: 50,
        duration: 20,
        content: {
          theory: 'Os acidentes alteram a altura das notas. Sustenido (#) sobe meio tom, bemol (b) desce meio tom, bequadro (♮) cancela acidentes.',
          examples: ['Dó# = Réb', 'Fá# = Solb', 'Acidentes na armadura'],
          exercises: ['Identificar acidentes', 'Aplicar alterações', 'Reconhecer enarmonias']
        },
        isActive: true
      },

      // NÍVEL VIRTUOSO - 6 módulos
      {
        title: 'Escalas Menores - A Expressão Musical',
        description: 'Aprenda escalas menores naturais, harmônicas e melódicas',
        category: 'escalas-maiores',
        level: 'virtuoso',
        order: 1,
        points: 75,
        duration: 35,
        content: {
          theory: 'As escalas menores têm três formas: natural (tom-semitom-tom-tom-semitom-tom-tom), harmônica (7ª elevada) e melódica (6ª e 7ª elevadas na subida).',
          examples: ['Lá menor natural', 'Lá menor harmônica', 'Lá menor melódica'],
          exercises: ['Construir escalas menores', 'Identificar tipos', 'Aplicar em composição']
        },
        isActive: true
      },
      {
        title: 'Intervalos Musicais - A Distância Entre as Notas',
        description: 'Domine intervalos consonantes e dissonantes',
        category: 'intervalos-musicais',
        level: 'virtuoso',
        order: 2,
        points: 75,
        duration: 40,
        content: {
          theory: 'Intervalo é a distância entre duas notas. Classificamos por quantidade (uníssono, 2ª, 3ª, etc.) e qualidade (maior, menor, justo, aumentado, diminuto).',
          examples: ['3ª maior (Dó-Mi)', '5ª justa (Dó-Sol)', '7ª menor (Dó-Sib)'],
          exercises: ['Identificar intervalos', 'Classificar qualidades', 'Tocar intervalos']
        },
        isActive: true
      },
      {
        title: 'Acordes Básicos - A Harmonia em Ação',
        description: 'Aprenda tríades maiores, menores e diminutas',
        category: 'intervalos-musicais',
        level: 'virtuoso',
        order: 3,
        points: 75,
        duration: 45,
        content: {
          theory: 'Acorde é a combinação simultânea de três ou mais notas. A tríade básica é formada por tônica, terça e quinta.',
          examples: ['Dó maior (C-E-G)', 'Lá menor (A-C-E)', 'Si diminuto (B-D-F)'],
          exercises: ['Construir tríades', 'Identificar tipos', 'Tocar progressões']
        },
        isActive: true
      },
      {
        title: 'Modos Gregos - As Cores da Música',
        description: 'Explore os 7 modos gregos e suas características',
        category: 'escalas-maiores',
        level: 'virtuoso',
        order: 4,
        points: 75,
        duration: 50,
        content: {
          theory: 'Os modos gregos são escalas derivadas da escala maior, cada uma com sua característica única: Jônio, Dórico, Frígio, Lídio, Mixolídio, Eólio, Lócrio.',
          examples: ['Modo Dórico (Ré-Dó)', 'Modo Lídio (Fá-Sol)', 'Modo Mixolídio (Sol-Fá)'],
          exercises: ['Construir modos', 'Identificar características', 'Aplicar em improvisação']
        },
        isActive: true
      },
      {
        title: 'Síncopa e Contratempo - Ritmo Avançado',
        description: 'Domine ritmos sincopados e contratempos',
        category: 'sincopa-contratempo',
        level: 'virtuoso',
        order: 5,
        points: 75,
        duration: 30,
        content: {
          theory: 'Síncopa é o deslocamento do acento rítmico. Contratempo é a execução de notas nos tempos fracos.',
          examples: ['Síncopa simples', 'Contratempo básico', 'Padrões complexos'],
          exercises: ['Executar síncopas', 'Criar contratempos', 'Aplicar em composição']
        },
        isActive: true
      },
      {
        title: 'Articulação Musical - Técnicas de Execução',
        description: 'Aprenda staccato, legato, portato e outras articulações',
        category: 'articulacao-musical',
        level: 'virtuoso',
        order: 6,
        points: 75,
        duration: 25,
        content: {
          theory: 'Articulação é a forma como as notas são executadas: staccato (separado), legato (ligado), portato (semi-ligado), tenuto (sustentado).',
          examples: ['Staccato (.)', 'Legato (curva)', 'Portato (ponto e linha)', 'Tenuto (-)'],
          exercises: ['Aplicar articulações', 'Reconhecer sinais', 'Expressar musicalmente']
        },
        isActive: true
      },

      // NÍVEL MAESTRO - 5 módulos
      {
        title: 'Harmonia Avançada - A Orquestração Completa',
        description: 'Domine acordes de sétima, nona e extensões',
        category: 'expressao-musical',
        level: 'maestro',
        order: 1,
        points: 100,
        duration: 60,
        content: {
          theory: 'Harmonia avançada inclui acordes de sétima (maior, menor, dominante, diminuto), nona, décima primeira e décima terceira, além de substituições trítonas.',
          examples: ['Cmaj7 (C-E-G-B)', 'Dm7 (D-F-A-C)', 'G7 (G-B-D-F)', 'Cm7b5 (C-Eb-Gb-Bb)'],
          exercises: ['Construir acordes complexos', 'Aplicar substituições', 'Criar progressões avançadas']
        },
        isActive: true
      },
      {
        title: 'Contraponto - A Arte da Voz Independente',
        description: 'Aprenda as regras do contraponto e fuga',
        category: 'expressao-musical',
        level: 'maestro',
        order: 2,
        points: 100,
        duration: 70,
        content: {
          theory: 'Contraponto é a arte de combinar melodias independentes. Inclui movimento direto, contrário, oblíquo, consonâncias perfeitas e imperfeitas.',
          examples: ['Cânone simples', 'Fuga básica', 'Contraponto a 2 vozes'],
          exercises: ['Escrever contraponto', 'Analisar fugas', 'Criar cânones']
        },
        isActive: true
      },
      {
        title: 'Orquestração - Pintando com Sons',
        description: 'Aprenda a orquestrar para diferentes instrumentos',
        category: 'compasso-composto',
        level: 'maestro',
        order: 3,
        points: 100,
        duration: 80,
        content: {
          theory: 'Orquestração é a arte de distribuir material musical entre diferentes instrumentos, considerando tessitura, timbre, dinâmica e textura.',
          examples: ['Seções da orquestra', 'Tessituras instrumentais', 'Efeitos especiais'],
          exercises: ['Orquestrar melodias', 'Criar texturas', 'Balancear seções']
        },
        isActive: true
      },
      {
        title: 'Compasso Composto - 6/8, 9/8, 12/8',
        description: 'Domine os compassos compostos e suas subdivisões',
        category: 'compasso-composto',
        level: 'maestro',
        order: 4,
        points: 100,
        duration: 40,
        content: {
          theory: 'Compassos compostos têm subdivisão ternária. O numerador indica o número de subdivisões, o denominador indica a figura que vale uma subdivisão.',
          examples: ['6/8 (2 grupos de 3 colcheias)', '9/8 (3 grupos de 3 colcheias)', '12/8 (4 grupos de 3 colcheias)'],
          exercises: ['Bater compassos compostos', 'Identificar subdivisões', 'Criar ritmos complexos']
        },
        isActive: true
      },
      {
        title: 'Modulação - Mudança de Tonalidade',
        description: 'Aprenda a modular entre diferentes tonalidades',
        category: 'expressao-musical',
        level: 'maestro',
        order: 5,
        points: 100,
        duration: 55,
        content: {
          theory: 'Modulação é a mudança de tonalidade durante uma peça musical. Pode ser direta, por acorde pivô, enarmônica ou cromática.',
          examples: ['Modulação por 5ª justa', 'Acorde pivô comum', 'Modulação cromática'],
          exercises: ['Criar modulações', 'Identificar acordes pivô', 'Analisar mudanças tonais']
        },
        isActive: true
      }
    ];

    const createdModules = await Module.insertMany(modules);
    console.log(`✅ ${createdModules.length} módulos criados`);
    
    return createdModules;
  } catch (error) {
    console.error('❌ Erro ao criar módulos:', error);
    throw error;
  }
};

// Criar quizzes com 7 perguntas cada
const createExpandedQuizzes = async (modules) => {
  try {
    console.log('🎯 Criando quizzes expandidos...');
    
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

// Gerar 7 perguntas específicas para cada módulo
const generateQuestionsForModule = (module) => {
  const questions = [];
  
  // Perguntas baseadas no nível e categoria do módulo
  if (module.level === 'aprendiz') {
    questions.push(
      {
        question: `Qual é o principal objetivo do módulo "${module.title}"?`,
        options: [
          'Aprender conceitos básicos de música',
          'Dominar técnicas avançadas',
          'Criar composições complexas',
          'Tocar instrumentos virtuais'
        ],
        correctAnswer: 0,
        explanation: 'Este módulo foca nos conceitos fundamentais da música.',
        difficulty: 'facil'
      },
      {
        question: `Para qual nível este módulo é indicado?`,
        options: ['Aprendiz', 'Virtuoso', 'Maestro', 'Todos os níveis'],
        correctAnswer: 0,
        explanation: 'Este módulo é específico para o nível Aprendiz.',
        difficulty: 'facil'
      },
      {
        question: `Quantos pontos você ganha completando este módulo?`,
        options: ['25 pontos', '50 pontos', '75 pontos', '100 pontos'],
        correctAnswer: 1,
        explanation: `Este módulo vale ${module.points} pontos.`,
        difficulty: 'facil'
      },
      {
        question: `Qual categoria musical este módulo aborda?`,
        options: [
          module.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          'Harmonia avançada',
          'Composição clássica',
          'Improvisação jazz'
        ],
        correctAnswer: 0,
        explanation: `Este módulo pertence à categoria ${module.category}.`,
        difficulty: 'medio'
      },
      {
        question: `Qual é a duração estimada deste módulo?`,
        options: [
          `${module.duration} minutos`,
          '1 hora',
          '2 horas',
          '30 minutos'
        ],
        correctAnswer: 0,
        explanation: `Este módulo tem duração estimada de ${module.duration} minutos.`,
        difficulty: 'facil'
      },
      {
        question: `Este módulo é adequado para iniciantes em música?`,
        options: ['Sim, é básico', 'Não, é avançado', 'Depende do instrumento', 'Apenas para teoria'],
        correctAnswer: 0,
        explanation: 'Como é um módulo de nível Aprendiz, é adequado para iniciantes.',
        difficulty: 'facil'
      },
      {
        question: `Qual habilidade você desenvolverá neste módulo?`,
        options: [
          'Fundamentos musicais',
          'Técnicas virtuosísticas',
          'Composição orquestral',
          'Improvisação complexa'
        ],
        correctAnswer: 0,
        explanation: 'Este módulo desenvolve os fundamentos básicos da música.',
        difficulty: 'medio'
      }
    );
  } else if (module.level === 'virtuoso') {
    questions.push(
      {
        question: `Qual é o nível de complexidade do módulo "${module.title}"?`,
        options: ['Básico', 'Intermediário', 'Avançado', 'Profissional'],
        correctAnswer: 1,
        explanation: 'Este módulo é de nível intermediário (Virtuoso).',
        difficulty: 'medio'
      },
      {
        question: `Para qual nível este módulo é indicado?`,
        options: ['Aprendiz', 'Virtuoso', 'Maestro', 'Todos os níveis'],
        correctAnswer: 1,
        explanation: 'Este módulo é específico para o nível Virtuoso.',
        difficulty: 'facil'
      },
      {
        question: `Quantos pontos você ganha completando este módulo?`,
        options: ['50 pontos', '75 pontos', '100 pontos', '125 pontos'],
        correctAnswer: 1,
        explanation: `Este módulo vale ${module.points} pontos.`,
        difficulty: 'facil'
      },
      {
        question: `Este módulo requer conhecimento prévio?`,
        options: ['Sim, conceitos básicos', 'Não, é independente', 'Apenas teoria', 'Só prática'],
        correctAnswer: 0,
        explanation: 'Módulos Virtuoso requerem conhecimento dos conceitos básicos.',
        difficulty: 'medio'
      },
      {
        question: `Qual é a duração estimada deste módulo?`,
        options: [
          `${module.duration} minutos`,
          '1 hora',
          '2 horas',
          '30 minutos'
        ],
        correctAnswer: 0,
        explanation: `Este módulo tem duração estimada de ${module.duration} minutos.`,
        difficulty: 'facil'
      },
      {
        question: `Este módulo desenvolve habilidades específicas?`,
        options: ['Sim, técnicas intermediárias', 'Não, é geral', 'Apenas teóricas', 'Só práticas'],
        correctAnswer: 0,
        explanation: 'Módulos Virtuoso desenvolvem técnicas e conceitos intermediários.',
        difficulty: 'medio'
      },
      {
        question: `Qual categoria musical este módulo aborda?`,
        options: [
          module.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          'Fundamentos básicos',
          'Composição avançada',
          'Improvisação livre'
        ],
        correctAnswer: 0,
        explanation: `Este módulo pertence à categoria ${module.category}.`,
        difficulty: 'medio'
      }
    );
  } else if (module.level === 'maestro') {
    questions.push(
      {
        question: `Qual é o nível de complexidade do módulo "${module.title}"?`,
        options: ['Básico', 'Intermediário', 'Avançado', 'Profissional'],
        correctAnswer: 2,
        explanation: 'Este módulo é de nível avançado (Maestro).',
        difficulty: 'dificil'
      },
      {
        question: `Para qual nível este módulo é indicado?`,
        options: ['Aprendiz', 'Virtuoso', 'Maestro', 'Todos os níveis'],
        correctAnswer: 2,
        explanation: 'Este módulo é específico para o nível Maestro.',
        difficulty: 'facil'
      },
      {
        question: `Quantos pontos você ganha completando este módulo?`,
        options: ['75 pontos', '100 pontos', '125 pontos', '150 pontos'],
        correctAnswer: 1,
        explanation: `Este módulo vale ${module.points} pontos.`,
        difficulty: 'facil'
      },
      {
        question: `Este módulo requer conhecimento avançado?`,
        options: ['Sim, conceitos complexos', 'Não, é básico', 'Apenas teoria', 'Só prática'],
        correctAnswer: 0,
        explanation: 'Módulos Maestro requerem conhecimento avançado de música.',
        difficulty: 'medio'
      },
      {
        question: `Qual é a duração estimada deste módulo?`,
        options: [
          `${module.duration} minutos`,
          '1 hora',
          '2 horas',
          '30 minutos'
        ],
        correctAnswer: 0,
        explanation: `Este módulo tem duração estimada de ${module.duration} minutos.`,
        difficulty: 'facil'
      },
      {
        question: `Este módulo desenvolve habilidades profissionais?`,
        options: ['Sim, técnicas avançadas', 'Não, é básico', 'Apenas teóricas', 'Só práticas'],
        correctAnswer: 0,
        explanation: 'Módulos Maestro desenvolvem habilidades profissionais avançadas.',
        difficulty: 'dificil'
      },
      {
        question: `Qual categoria musical este módulo aborda?`,
        options: [
          module.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          'Fundamentos básicos',
          'Técnicas intermediárias',
          'Improvisação livre'
        ],
        correctAnswer: 0,
        explanation: `Este módulo pertence à categoria ${module.category}.`,
        difficulty: 'medio'
      }
    );
  }
  
  return questions;
};

// Função principal
const reorganizeAndExpandContent = async () => {
  try {
    console.log('🚀 REORGANIZANDO E EXPANDINDO CONTEÚDO');
    console.log('=' .repeat(60));

    // 1. Limpar dados existentes
    await clearExistingData();

    // 2. Criar módulos expandidos
    const modules = await createExpandedModules();

    // 3. Criar quizzes expandidos
    const quizzes = await createExpandedQuizzes(modules);

    // 4. Verificar resultado
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

    // Distribuição por nível
    const levelStats = await Module.aggregate([
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📈 DISTRIBUIÇÃO POR NÍVEL:');
    levelStats.forEach(stat => {
      console.log(`   🎯 ${stat._id.toUpperCase()}: ${stat.count} módulos`);
    });

    // Perguntas por nível
    const questionsByLevel = await Quiz.aggregate([
      { $project: { level: 1, questionCount: { $size: "$questions" } } },
      { $group: { _id: "$level", total: { $sum: "$questionCount" } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n❓ PERGUNTAS POR NÍVEL:');
    questionsByLevel.forEach(stat => {
      console.log(`   🎯 ${stat._id.toUpperCase()}: ${stat.total} perguntas`);
    });

    console.log('\n🎉 REORGANIZAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a reorganização:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(reorganizeAndExpandContent);
}

module.exports = { reorganizeAndExpandContent };
