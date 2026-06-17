const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../../src/models/Module');
const Quiz = require('../../src/models/Quiz');

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

// Módulos expandidos
const modules = [
  // APRENDIZ
  {
    title: "Propriedades do Som - Os Pilares da Música",
    description: "Descubra as quatro propriedades fundamentais que definem cada som musical",
    category: "propriedades-som",
    level: "aprendiz",
    order: 1,
    points: 50,
    content: {
      theory: "As quatro propriedades fundamentais do som são: Altura (grave/agudo), Timbre (cor do som), Intensidade (forte/piano) e Duração (longo/curto). Cada uma dessas propriedades contribui para a identidade única de cada som musical.",
      examples: [
        {
          title: "Altura",
          description: "Dó grave vs Dó agudo - mesma nota, alturas diferentes",
          type: "pratica"
        }
      ],
      exercises: [
        {
          title: "Identificação de Propriedades",
          description: "Escute diferentes sons e identifique suas propriedades",
          type: "audicao"
        }
      ]
    }
  },
  {
    title: "Notas Musicais e Solfejo - O ABC da Música",
    description: "Aprenda as sete notas musicais e como cantá-las corretamente",
    category: "solfegio-basico",
    level: "aprendiz",
    order: 2,
    points: 50,
    content: {
      theory: "As sete notas musicais formam a base da música ocidental: Dó, Ré, Mi, Fá, Sol, Lá, Si. O solfejo é a técnica de cantar essas notas usando sílabas específicas.",
      examples: [
        {
          title: "Escala Ascendente",
          description: "Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó",
          type: "pratica"
        }
      ],
      exercises: [
        {
          title: "Solfejo Melódico",
          description: "Cante melodias simples usando as notas musicais",
          type: "pratica"
        }
      ]
    }
  },
  {
    title: "Pauta Musical e Claves - Onde Escrevemos a Música",
    description: "Conheça a pauta musical, as claves e como posicionar as notas",
    category: "solfegio-basico",
    level: "aprendiz",
    order: 3,
    points: 50,
    content: {
      theory: "A pauta musical possui 5 linhas e 4 espaços onde escrevemos as notas. A clave de Sol indica onde está o Sol e nos ajuda a posicionar todas as outras notas.",
      examples: [
        {
          title: "Clave de Sol",
          description: "A clave de Sol se posiciona na segunda linha da pauta",
          type: "pratica"
        }
      ],
      exercises: [
        {
          title: "Leitura de Notas",
          description: "Identifique notas na pauta musical",
          type: "pratica"
        }
      ]
    }
  },
  {
    title: "Figuras de Valor - A Duração das Notas",
    description: "Aprenda as diferentes durações das notas musicais",
    category: "solfegio-basico",
    level: "aprendiz",
    order: 4,
    points: 50,
    content: {
      theory: "As figuras de valor indicam quanto tempo uma nota deve durar. As principais são: semibreve (4 tempos), mínima (2 tempos), semínima (1 tempo) e colcheia (1/2 tempo).",
      examples: [
        {
          title: "Relacionamento das Figuras",
          description: "1 semibreve = 2 mínimas = 4 semínimas = 8 colcheias",
          type: "pratica"
        }
      ],
      exercises: [
        {
          title: "Contagem Rítmica",
          description: "Conte os valores das figuras musicais",
          type: "pratica"
        }
      ]
    }
  },
  {
    title: "Compassos Simples - Organizando o Tempo",
    description: "Entenda como organizar a música em compassos",
    category: "solfegio-basico",
    level: "aprendiz",
    order: 5,
    points: 50,
    content: {
      theory: "Os compassos organizam a música em grupos de tempos. O compasso 4/4 tem 4 tempos, o 3/4 tem 3 tempos e o 2/4 tem 2 tempos. A barra de compasso separa cada grupo.",
      examples: [
        {
          title: "Compasso 4/4",
          description: "O mais comum na música popular",
          type: "pratica"
        }
      ],
      exercises: [
        {
          title: "Identificação de Compassos",
          description: "Reconheça diferentes tipos de compasso",
          type: "audicao"
        }
      ]
    }
  },
  {
    title: "Escalas Maiores - A Base da Harmonia",
    description: "Descubra as escalas maiores e sua construção",
    category: "solfegio-basico",
    level: "aprendiz",
    order: 6,
    points: 50,
    content: {
      theory: "A escala maior segue a fórmula: tom-tom-semitom-tom-tom-tom-semitom. A escala de Dó maior é a mais simples, usando apenas as teclas brancas do piano.",
      examples: [
        {
          title: "Escala de Dó Maior",
          description: "Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó",
          type: "pratica"
        }
      ],
      exercises: [
        {
          title: "Construção de Escalas",
          description: "Construa escalas maiores em diferentes tons",
          type: "pratica"
        }
      ]
    }
  },

  // VIRTUOSO
  {
    title: "Escalas Menores - A Expressão Musical",
    description: "Explore as escalas menores e suas variações",
    category: "solfegio-basico",
    level: "virtuoso",
    order: 1,
    points: 75,
    content: {
      theory: "As escalas menores têm três formas: natural, harmônica e melódica. Cada uma tem características específicas que influenciam o caráter musical.",
      examples: [
        {
          title: "Escala Menor Natural",
          description: "Lá menor natural: Lá-Si-Dó-Ré-Mi-Fá-Sol-Lá",
          type: "pratica"
        }
      ],
      exercises: [
        {
          title: "Identificação de Escalas",
          description: "Reconheça diferentes tipos de escalas menores",
          type: "audicao"
        }
      ]
    }
  },
  {
    title: "Intervalos Musicais - A Distância Entre as Notas",
    description: "Aprenda a identificar e classificar intervalos",
    category: "solfegio-basico",
    level: "virtuoso",
    order: 2,
    points: 75,
    content: {
      theory: "Intervalos são a distância entre duas notas. Podem ser consonantes (agradáveis) ou dissonantes (tensas). A classificação inclui o número (2ª, 3ª, 4ª, etc.) e a qualidade (maior, menor, justa, etc.).",
      examples: [
        {
          title: "Intervalos Consonantes",
          description: "3ª maior, 5ª justa, 8ª justa",
          type: "audicao"
        }
      ],
      exercises: [
        {
          title: "Identificação de Intervalos",
          description: "Reconheça intervalos pelo som",
          type: "audicao"
        }
      ]
    }
  },
  {
    title: "Acordes Básicos - A Harmonia em Ação",
    description: "Construa e identifique acordes fundamentais",
    category: "solfegio-basico",
    level: "virtuoso",
    order: 3,
    points: 75,
    content: {
      theory: "Acordes são três ou mais notas tocadas simultaneamente. As tríades básicas são: maior, menor, aumentada e diminuta. Cada uma tem um caráter específico.",
      examples: [
        {
          title: "Tríade Maior",
          description: "Dó-Mi-Sol (C-E-G)",
          type: "pratica"
        }
      ],
      exercises: [
        {
          title: "Construção de Acordes",
          description: "Construa acordes em diferentes tons",
          type: "pratica"
        }
      ]
    }
  },

  // MAESTRO
  {
    title: "Harmonia Avançada - A Orquestração Completa",
    description: "Domine a harmonia complexa e suas aplicações",
    category: "solfegio-basico",
    level: "maestro",
    order: 1,
    points: 100,
    content: {
      theory: "A harmonia avançada inclui acordes de sétima, nona, substituições harmônicas e modulações. Essas técnicas criam riqueza e complexidade musical.",
      examples: [
        {
          title: "Acorde de 7ª Dominante",
          description: "G7: Sol-Si-Ré-Fá",
          type: "pratica"
        }
      ],
      exercises: [
        {
          title: "Análise Harmônica",
          description: "Analise progressões harmônicas complexas",
          type: "teoria"
        }
      ]
    }
  },
  {
    title: "Contraponto - A Arte da Voz Independente",
    description: "Aprenda as técnicas de contraponto clássico",
    category: "solfegio-basico",
    level: "maestro",
    order: 2,
    points: 100,
    content: {
      theory: "O contraponto é a arte de combinar melodias independentes. Desenvolve-se através de espécies que vão da mais simples à mais complexa.",
      examples: [
        {
          title: "Contraponto a Duas Vozes",
          description: "Cantus firmus com contraponto",
          type: "pratica"
        }
      ],
      exercises: [
        {
          title: "Composição Contrapontística",
          description: "Crie linhas melódicas independentes",
          type: "pratica"
        }
      ]
    }
  }
];

// Quizzes correspondentes
const quizzes = [
  // APRENDIZ
  {
    title: "Quiz - Propriedades do Som",
    description: "Teste seus conhecimentos sobre as propriedades do som",
    level: "aprendiz",
    type: "module",
    timeLimit: 600,
    passingScore: 70,
    attempts: 3,
    questions: [
      {
        question: "🎵 Qual das propriedades do som determina se uma nota é grave ou aguda?",
        options: [
          { label: "Timbre", isCorrect: false },
          { label: "Altura", isCorrect: true },
          { label: "Intensidade", isCorrect: false },
          { label: "Duração", isCorrect: false }
        ],
        explanation: "A altura é a propriedade que determina se um som é grave ou agudo.",
        category: "propriedades-som",
        difficulty: "facil",
        points: 10
      },
      {
        question: "🎹 Se você toca a mesma nota Dó no piano e no violino, qual propriedade será diferente?",
        options: [
          { label: "Altura", isCorrect: false },
          { label: "Timbre", isCorrect: true },
          { label: "Intensidade", isCorrect: false },
          { label: "Duração", isCorrect: false }
        ],
        explanation: "O timbre é a 'cor' do som, que permite distinguir diferentes instrumentos.",
        category: "propriedades-som",
        difficulty: "facil",
        points: 10
      },
      {
        question: "🔊 Qual símbolo musical indica que devemos tocar 'bem baixinho'?",
        options: [
          { label: "f (forte)", isCorrect: false },
          { label: "p (piano)", isCorrect: true },
          { label: "mf (mezzo forte)", isCorrect: false },
          { label: "ff (fortíssimo)", isCorrect: false }
        ],
        explanation: "O símbolo 'p' (piano) indica que devemos tocar suavemente.",
        category: "propriedades-som",
        difficulty: "facil",
        points: 10
      },
      {
        question: "⏱️ Qual propriedade do som está relacionada ao tempo que a nota dura?",
        options: [
          { label: "Altura", isCorrect: false },
          { label: "Timbre", isCorrect: false },
          { label: "Intensidade", isCorrect: false },
          { label: "Duração", isCorrect: true }
        ],
        explanation: "A duração é a propriedade que determina quanto tempo uma nota musical deve ser sustentada.",
        category: "propriedades-som",
        difficulty: "facil",
        points: 10
      },
      {
        question: "🎼 Se você está tocando 'piano' e quer ficar 'forte', que símbolo usa?",
        options: [
          { label: "Crescendo (<)", isCorrect: true },
          { label: "Diminuendo (>)", isCorrect: false },
          { label: "Forte (f)", isCorrect: false },
          { label: "Piano (p)", isCorrect: false }
        ],
        explanation: "O crescendo (<) indica um aumento gradual da intensidade.",
        category: "propriedades-som",
        difficulty: "medio",
        points: 10
      },
      {
        question: "🎵 Qual é a diferença entre 'forte' e 'fortíssimo'?",
        options: [
          { label: "Forte é mais suave que fortíssimo", isCorrect: true },
          { label: "Forte é mais alto que fortíssimo", isCorrect: false },
          { label: "Não há diferença", isCorrect: false },
          { label: "Forte é mais grave que fortíssimo", isCorrect: false }
        ],
        explanation: "Fortíssimo (ff) é mais intenso que forte (f).",
        category: "propriedades-som",
        difficulty: "medio",
        points: 10
      },
      {
        question: "🎶 Qual propriedade permite distinguir um violino de um piano tocando a mesma nota?",
        options: [
          { label: "Altura", isCorrect: false },
          { label: "Timbre", isCorrect: true },
          { label: "Intensidade", isCorrect: false },
          { label: "Duração", isCorrect: false }
        ],
        explanation: "O timbre é a 'impressão digital' de cada instrumento.",
        category: "propriedades-som",
        difficulty: "facil",
        points: 10
      }
    ]
  },
  {
    title: "Quiz - Notas Musicais e Solfejo",
    description: "Teste seu conhecimento sobre as notas musicais",
    level: "aprendiz",
    type: "module",
    timeLimit: 600,
    passingScore: 70,
    attempts: 3,
    questions: [
      {
        question: "🎵 Quantas notas musicais existem na escala básica?",
        options: [
          { label: "5 notas", isCorrect: false },
          { label: "6 notas", isCorrect: false },
          { label: "7 notas", isCorrect: true },
          { label: "8 notas", isCorrect: false }
        ],
        explanation: "Existem 7 notas musicais: Dó, Ré, Mi, Fá, Sol, Lá, Si.",
        category: "solfegio-basico",
        difficulty: "facil",
        points: 10
      },
      {
        question: "🎼 Qual é a sequência correta das notas musicais?",
        options: [
          { label: "Dó, Ré, Mi, Fá, Sol, Lá, Si", isCorrect: true },
          { label: "A, B, C, D, E, F, G", isCorrect: false },
          { label: "1, 2, 3, 4, 5, 6, 7", isCorrect: false },
          { label: "Dó, Mi, Ré, Fá, Sol, Si, Lá", isCorrect: false }
        ],
        explanation: "A sequência tradicional das notas musicais é: Dó, Ré, Mi, Fá, Sol, Lá, Si.",
        category: "solfegio-basico",
        difficulty: "facil",
        points: 10
      },
      {
        question: "🎶 Qual nota vem depois de Fá na escala?",
        options: [
          { label: "Mi", isCorrect: false },
          { label: "Sol", isCorrect: true },
          { label: "Lá", isCorrect: false },
          { label: "Si", isCorrect: false }
        ],
        explanation: "Na escala musical, depois de Fá vem Sol.",
        category: "solfegio-basico",
        difficulty: "facil",
        points: 10
      },
      {
        question: "🎵 O que é solfejo?",
        options: [
          { label: "Tocar instrumentos", isCorrect: false },
          { label: "Cantar as notas musicais", isCorrect: true },
          { label: "Escrever música", isCorrect: false },
          { label: "Tocar piano", isCorrect: false }
        ],
        explanation: "Solfejo é a técnica de cantar as notas musicais usando os nomes Dó, Ré, Mi, Fá, Sol, Lá, Si.",
        category: "solfegio-basico",
        difficulty: "medio",
        points: 10
      },
      {
        question: "🎼 Qual nota está no meio da escala musical?",
        options: [
          { label: "Mi", isCorrect: false },
          { label: "Fá", isCorrect: true },
          { label: "Sol", isCorrect: false },
          { label: "Lá", isCorrect: false }
        ],
        explanation: "Fá é a quarta nota da escala de 7 notas, estando no meio da sequência.",
        category: "solfegio-basico",
        difficulty: "medio",
        points: 10
      },
      {
        question: "🎶 Qual é a diferença entre Dó e Dó#?",
        options: [
          { label: "Dó# é mais grave que Dó", isCorrect: false },
          { label: "Dó# é mais agudo que Dó", isCorrect: true },
          { label: "Não há diferença", isCorrect: false },
          { label: "Dó# é mais longo que Dó", isCorrect: false }
        ],
        explanation: "O sustenido (#) eleva a nota em meio tom, tornando Dó# mais agudo que Dó.",
        category: "solfegio-basico",
        difficulty: "medio",
        points: 10
      },
      {
        question: "🎵 Quantas vezes a sequência Dó-Ré-Mi aparece em uma oitava?",
        options: [
          { label: "Uma vez", isCorrect: true },
          { label: "Duas vezes", isCorrect: false },
          { label: "Três vezes", isCorrect: false },
          { label: "Sete vezes", isCorrect: false }
        ],
        explanation: "A sequência completa Dó-Ré-Mi-Fá-Sol-Lá-Si aparece uma vez em cada oitava.",
        category: "solfegio-basico",
        difficulty: "facil",
        points: 10
      }
    ]
  }
];

// Função para popular o banco
const populateContent = async () => {
  try {
    console.log('🚀 POPULANDO CONTEÚDO EXPANDIDO');
    console.log('=' .repeat(60));

    // Limpar conteúdo existente
    console.log('🧹 Limpando conteúdo anterior...');
    await Module.deleteMany({});
    await Quiz.deleteMany({});
    console.log('✅ Conteúdo anterior removido');

    // Inserir módulos
    console.log('\n📚 Inserindo módulos...');
    const insertedModules = await Module.insertMany(modules);
    console.log(`✅ ${insertedModules.length} módulos inseridos`);

    // Criar e inserir quizzes
    console.log('\n🎯 Criando quizzes...');
    const quizzesToInsert = [];

    for (let i = 0; i < insertedModules.length; i++) {
      const module = insertedModules[i];
      const quizTemplate = quizzes[i % quizzes.length]; // Reutilizar quizzes existentes

      const quiz = {
        title: `Quiz - ${module.title}`,
        description: `Teste seus conhecimentos sobre ${module.title.toLowerCase()}`,
        moduleId: module._id,
        category: module.category,
        level: module.level,
        type: "module",
        timeLimit: quizTemplate.timeLimit,
        passingScore: quizTemplate.passingScore,
        attempts: quizTemplate.attempts,
        questions: quizTemplate.questions.map(q => ({
          ...q,
          _id: new mongoose.Types.ObjectId()
        })),
        totalAttempts: 0,
        averageScore: 0,
        isActive: true
      };

      quizzesToInsert.push(quiz);
    }

    const insertedQuizzes = await Quiz.insertMany(quizzesToInsert);
    console.log(`✅ ${insertedQuizzes.length} quizzes inseridos`);

    // Estatísticas finais
    console.log('\n📊 ESTATÍSTICAS FINAIS:');
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

    console.log('\n🎉 POPULAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a população:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(populateContent);
}

module.exports = { populateContent };



