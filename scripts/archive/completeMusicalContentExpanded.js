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

// Dados expandidos para todos os níveis
const expandedMusicalContent = {
  modules: [
    // ===== NÍVEL APRENDIZ (Fundamentos) =====
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
          },
          {
            title: "Timbre",
            description: "Piano vs Violino tocando a mesma nota",
            type: "audicao"
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
        theory: "As sete notas musicais formam a base da música ocidental: Dó, Ré, Mi, Fá, Sol, Lá, Si. O solfejo é a técnica de cantar essas notas usando sílabas específicas, desenvolvendo a audição interna e a leitura musical.",
        examples: [
          {
            title: "Escala Ascendente",
            description: "Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó",
            type: "pratica"
          },
          {
            title: "Escala Descendente",
            description: "Dó-Si-Lá-Sol-Fá-Mi-Ré-Dó",
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
      category: "leitura-musical",
      level: "aprendiz",
      order: 3,
      points: 50,
      content: [
        "A pauta musical: 5 linhas e 4 espaços",
        "Clave de Sol e posicionamento das notas",
        "Linhas e espaços suplementares",
        "Exercícios de leitura de notas"
      ]
    },
    {
      title: "Figuras de Valor - A Duração das Notas",
      description: "Aprenda as diferentes durações das notas musicais",
      category: "ritmo-basico",
      level: "aprendiz",
      order: 4,
      points: 50,
      content: [
        "Semibreve, mínima, semínima, colcheia",
        "Relacionamento entre as figuras",
        "Pausas e seus valores",
        "Exercícios de leitura rítmica"
      ]
    },
    {
      title: "Compassos Simples - Organizando o Tempo",
      description: "Entenda como organizar a música em compassos",
      category: "compassos-basicos",
      level: "aprendiz",
      order: 5,
      points: 50,
      content: [
        "Compasso quaternário (4/4)",
        "Compasso ternário (3/4)",
        "Compasso binário (2/4)",
        "Barras de compasso e repetição"
      ]
    },
    {
      title: "Escalas Maiores - A Base da Harmonia",
      description: "Descubra as escalas maiores e sua construção",
      category: "escalas-basicas",
      level: "aprendiz",
      order: 6,
      points: 50,
      content: [
        "Fórmula da escala maior",
        "Escala de Dó maior",
        "Escalas maiores com sustenidos",
        "Exercícios de construção de escalas"
      ]
    },

    // ===== NÍVEL VIRTUOSO (Intermediário) =====
    {
      title: "Escalas Menores - A Expressão Musical",
      description: "Explore as escalas menores e suas variações",
      category: "escalas-avancadas",
      level: "virtuoso",
      order: 1,
      points: 75,
      content: [
        "Escala menor natural, harmônica e melódica",
        "Fórmulas das escalas menores",
        "Escalas menores relativas",
        "Aplicação prática nas composições"
      ]
    },
    {
      title: "Intervalos Musicais - A Distância Entre as Notas",
      description: "Aprenda a identificar e classificar intervalos",
      category: "harmonia-intermediaria",
      level: "virtuoso",
      order: 2,
      points: 75,
      content: [
        "Classificação de intervalos por número e qualidade",
        "Intervalos consonantes e dissonantes",
        "Inversão de intervalos",
        "Exercícios de identificação auditiva"
      ]
    },
    {
      title: "Acordes Básicos - A Harmonia em Ação",
      description: "Construa e identifique acordes fundamentais",
      category: "harmonia-pratica",
      level: "virtuoso",
      order: 3,
      points: 75,
      content: [
        "Tríades maiores, menores, aumentadas e diminutas",
        "Inversões de acordes",
        "Acordes de sétima",
        "Progressões harmônicas básicas"
      ]
    },
    {
      title: "Modos Gregos - As Cores da Música",
      description: "Explore os modos gregos e suas características",
      category: "modos-musicais",
      level: "virtuoso",
      order: 4,
      points: 75,
      content: [
        "Os sete modos gregos",
        "Características de cada modo",
        "Aplicação prática na composição",
        "Exercícios de identificação modal"
      ]
    },
    {
      title: "Ritmos Complexos - Além do Básico",
      description: "Domine ritmos mais elaborados e sincopados",
      category: "ritmo-avancado",
      level: "virtuoso",
      order: 5,
      points: 75,
      content: [
        "Síncope e contratempo",
        "Compassos compostos",
        "Polirritmia básica",
        "Exercícios de coordenação rítmica"
      ]
    },
    {
      title: "Formas Musicais - A Estrutura da Música",
      description: "Entenda as principais formas musicais",
      category: "analise-musical",
      level: "virtuoso",
      order: 6,
      points: 75,
      content: [
        "Forma binária e ternária",
        "Rondó e variações",
        "Sonata e sinfonia",
        "Análise de obras clássicas"
      ]
    },

    // ===== NÍVEL MAESTRO (Avançado) =====
    {
      title: "Harmonia Avançada - A Orquestração Completa",
      description: "Domine a harmonia complexa e suas aplicações",
      category: "harmonia-avancada",
      level: "maestro",
      order: 1,
      points: 100,
      content: [
        "Acordes de nona, décima primeira e décima terceira",
        "Substituições harmônicas",
        "Modulação e modulação enarmônica",
        "Análise harmônica de obras complexas"
      ]
    },
    {
      title: "Contraponto - A Arte da Voz Independente",
      description: "Aprenda as técnicas de contraponto clássico",
      category: "contraponto",
      level: "maestro",
      order: 2,
      points: 100,
      content: [
        "Contraponto a duas vozes",
        "Espécies de contraponto",
        "Contraponto a três e quatro vozes",
        "Exercícios de composição contrapontística"
      ]
    },
    {
      title: "Orquestração - Pintando com Sons",
      description: "Domine a arte da orquestração e arranjo",
      category: "orquestracao",
      level: "maestro",
      order: 3,
      points: 100,
      content: [
        "Famílias de instrumentos",
        "Tessitura e registros",
        "Técnicas de arranjo",
        "Análise de partituras orquestrais"
      ]
    },
    {
      title: "Análise Musical Profissional - Decifrando a Música",
      description: "Torne-se um analista musical experiente",
      category: "analise-profissional",
      level: "maestro",
      order: 4,
      points: 100,
      content: [
        "Análise formal e harmônica avançada",
        "Identificação de estilos e períodos",
        "Análise de obras contemporâneas",
        "Técnicas de análise comparativa"
      ]
    },
    {
      title: "Composição Avançada - Criando Obras Próprias",
      description: "Desenvolva sua própria linguagem musical",
      category: "composicao-avancada",
      level: "maestro",
      order: 5,
      points: 100,
      content: [
        "Técnicas de composição contemporânea",
        "Uso de tecnologia na composição",
        "Desenvolvimento de temas e motivos",
        "Projeto de composição final"
      ]
    }
  ],

  quizzes: [
    // ===== QUIZZES APRENDIZ =====
    {
      title: "Quiz - Propriedades do Som - Os Pilares da Música",
      description: "Teste seus conhecimentos sobre as propriedades fundamentais do som",
      moduleId: null, // Será preenchido dinamicamente
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
          explanation: "A altura é a propriedade que determina se um som é grave ou agudo. Sons graves têm frequência baixa, sons agudos têm frequência alta.",
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
          explanation: "O timbre é a 'cor' do som, que permite distinguir diferentes instrumentos tocando a mesma nota.",
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
          explanation: "O símbolo 'p' (piano) indica que devemos tocar suavemente, com pouca intensidade.",
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
          explanation: "O crescendo (<) indica um aumento gradual da intensidade, de piano para forte.",
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
          explanation: "Fortíssimo (ff) é mais intenso que forte (f). A sequência é: pp < p < mf < f < ff.",
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
          explanation: "O timbre é a 'impressão digital' de cada instrumento, permitindo identificá-los mesmo tocando a mesma nota.",
          category: "propriedades-som",
          difficulty: "facil",
          points: 10
        }
      ]
    },
    {
      title: "Quiz - Notas Musicais e Solfejo - O ABC da Música",
      description: "Teste seu conhecimento sobre as notas musicais e solfejo",
      moduleId: null,
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
  ]
};

// Função para popular o banco com conteúdo expandido
const populateExpandedContent = async () => {
  try {
    console.log('🚀 INICIANDO POPULAÇÃO EXPANDIDA DO CONTEÚDO MUSICAL');
    console.log('=' .repeat(80));

    // Limpar conteúdo existente
    console.log('🧹 Limpando conteúdo existente...');
    await Module.deleteMany({});
    await Quiz.deleteMany({});
    console.log('✅ Conteúdo anterior removido');

    // Inserir módulos
    console.log('\n📚 Inserindo módulos...');
    const insertedModules = await Module.insertMany(expandedMusicalContent.modules);
    console.log(`✅ ${insertedModules.length} módulos inseridos`);

    // Criar quizzes e associar aos módulos
    console.log('\n🎯 Criando quizzes...');
    const quizzesToInsert = [];

    for (const module of insertedModules) {
      // Encontrar o quiz correspondente
      const quizTemplate = expandedMusicalContent.quizzes.find(q => 
        q.title.includes(module.title.split(' - ')[0])
      );

      if (quizTemplate) {
        const quiz = {
          ...quizTemplate,
          moduleId: module._id,
          title: `Quiz - ${module.title}`,
          description: `Teste seus conhecimentos sobre ${module.title.toLowerCase()}`,
          category: module.category,
          level: module.level,
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
    }

    // Inserir quizzes
    const insertedQuizzes = await Quiz.insertMany(quizzesToInsert);
    console.log(`✅ ${insertedQuizzes.length} quizzes inseridos`);

    // Estatísticas finais
    console.log('\n📊 ESTATÍSTICAS FINAIS:');
    console.log('-' .repeat(50));
    
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

    console.log('\n🎉 POPULAÇÃO EXPANDIDA CONCLUÍDA COM SUCESSO!');
    console.log('=' .repeat(80));

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
  connectDB().then(populateExpandedContent);
}

module.exports = { populateExpandedContent, expandedMusicalContent };
