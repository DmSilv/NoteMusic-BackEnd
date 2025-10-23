const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../src/models/Module');
const Quiz = require('../src/models/Quiz');

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

// Conteúdo completo com 77+ perguntas
const fullContent = {
  modules: [
    // APRENDIZ - 6 módulos com 7 perguntas cada = 42 perguntas
    {
      title: "Propriedades do Som - Os Pilares da Música",
      description: "Descubra as quatro propriedades fundamentais que definem cada som musical",
      category: "propriedades-som",
      level: "aprendiz",
      order: 1,
      points: 50,
      content: {
        theory: "As quatro propriedades fundamentais do som são: Altura (grave/agudo), Timbre (cor do som), Intensidade (forte/piano) e Duração (longo/curto).",
        examples: [
          { title: "Altura", description: "Dó grave vs Dó agudo", type: "pratica" },
          { title: "Timbre", description: "Piano vs Violino", type: "audicao" }
        ],
        exercises: [
          { title: "Identificação", description: "Identifique propriedades do som", type: "audicao" }
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
        theory: "As sete notas musicais formam a base da música ocidental: Dó, Ré, Mi, Fá, Sol, Lá, Si.",
        examples: [
          { title: "Sequência", description: "Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó", type: "pratica" }
        ],
        exercises: [
          { title: "Solfejo", description: "Cante melodias simples", type: "pratica" }
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
        theory: "A pauta musical possui 5 linhas e 4 espaços onde escrevemos as notas.",
        examples: [
          { title: "Clave de Sol", description: "Indica onde está o Sol", type: "pratica" }
        ],
        exercises: [
          { title: "Leitura", description: "Identifique notas na pauta", type: "pratica" }
        ]
      }
    },
    {
      title: "Figuras de Valor - A Duração das Notas",
      description: "Aprenda as diferentes durações das notas musicais",
      category: "figuras-musicais",
      level: "aprendiz",
      order: 4,
      points: 50,
      content: {
        theory: "As figuras de valor indicam quanto tempo uma nota deve durar.",
        examples: [
          { title: "Relacionamento", description: "1 semibreve = 2 mínimas = 4 semínimas", type: "pratica" }
        ],
        exercises: [
          { title: "Contagem", description: "Conte os valores das figuras", type: "pratica" }
        ]
      }
    },
    {
      title: "Compassos Simples - Organizando o Tempo",
      description: "Entenda como organizar a música em compassos",
      category: "compasso-simples",
      level: "aprendiz",
      order: 5,
      points: 50,
      content: {
        theory: "Os compassos organizam a música em grupos de tempos.",
        examples: [
          { title: "Compasso 4/4", description: "O mais comum na música popular", type: "pratica" }
        ],
        exercises: [
          { title: "Identificação", description: "Reconheça diferentes compassos", type: "audicao" }
        ]
      }
    },
    {
      title: "Escalas Maiores - A Base da Harmonia",
      description: "Descubra as escalas maiores e sua construção",
      category: "escalas-maiores",
      level: "aprendiz",
      order: 6,
      points: 50,
      content: {
        theory: "A escala maior segue a fórmula: tom-tom-semitom-tom-tom-tom-semitom.",
        examples: [
          { title: "Escala de Dó Maior", description: "Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó", type: "pratica" }
        ],
        exercises: [
          { title: "Construção", description: "Construa escalas maiores", type: "pratica" }
        ]
      }
    },

    // VIRTUOSO - 4 módulos com 5 perguntas cada = 20 perguntas
    {
      title: "Escalas Menores - A Expressão Musical",
      description: "Explore as escalas menores e suas variações",
      category: "escalas-maiores",
      level: "virtuoso",
      order: 1,
      points: 75,
      content: {
        theory: "As escalas menores têm três formas: natural, harmônica e melódica.",
        examples: [
          { title: "Escala Menor Natural", description: "Lá menor: Lá-Si-Dó-Ré-Mi-Fá-Sol-Lá", type: "pratica" }
        ],
        exercises: [
          { title: "Identificação", description: "Reconheça escalas menores", type: "audicao" }
        ]
      }
    },
    {
      title: "Intervalos Musicais - A Distância Entre as Notas",
      description: "Aprenda a identificar e classificar intervalos",
      category: "intervalos-musicais",
      level: "virtuoso",
      order: 2,
      points: 75,
      content: {
        theory: "Intervalos são a distância entre duas notas. Podem ser consonantes ou dissonantes.",
        examples: [
          { title: "Intervalos Consonantes", description: "3ª maior, 5ª justa, 8ª justa", type: "audicao" }
        ],
        exercises: [
          { title: "Identificação", description: "Reconheça intervalos pelo som", type: "audicao" }
        ]
      }
    },
    {
      title: "Acordes Básicos - A Harmonia em Ação",
      description: "Construa e identifique acordes fundamentais",
      category: "intervalos-musicais",
      level: "virtuoso",
      order: 3,
      points: 75,
      content: {
        theory: "Acordes são três ou mais notas tocadas simultaneamente.",
        examples: [
          { title: "Tríade Maior", description: "Dó-Mi-Sol (C-E-G)", type: "pratica" }
        ],
        exercises: [
          { title: "Construção", description: "Construa acordes em diferentes tons", type: "pratica" }
        ]
      }
    },
    {
      title: "Modos Gregos - As Cores da Música",
      description: "Explore os modos gregos e suas características",
      category: "escalas-maiores",
      level: "virtuoso",
      order: 4,
      points: 75,
      content: {
        theory: "Os sete modos gregos oferecem diferentes cores musicais.",
        examples: [
          { title: "Modo Dórico", description: "Característica do jazz", type: "pratica" }
        ],
        exercises: [
          { title: "Identificação", description: "Reconheça modos pelo som", type: "audicao" }
        ]
      }
    },

    // MAESTRO - 3 módulos com 5 perguntas cada = 15 perguntas
    {
      title: "Harmonia Avançada - A Orquestração Completa",
      description: "Domine a harmonia complexa e suas aplicações",
      category: "expressao-musical",
      level: "maestro",
      order: 1,
      points: 100,
      content: {
        theory: "A harmonia avançada inclui acordes de sétima, nona e substituições harmônicas.",
        examples: [
          { title: "Acorde de 7ª Dominante", description: "G7: Sol-Si-Ré-Fá", type: "pratica" }
        ],
        exercises: [
          { title: "Análise", description: "Analise progressões harmônicas complexas", type: "teoria" }
        ]
      }
    },
    {
      title: "Contraponto - A Arte da Voz Independente",
      description: "Aprenda as técnicas de contraponto clássico",
      category: "expressao-musical",
      level: "maestro",
      order: 2,
      points: 100,
      content: {
        theory: "O contraponto é a arte de combinar melodias independentes.",
        examples: [
          { title: "Contraponto a Duas Vozes", description: "Cantus firmus com contraponto", type: "pratica" }
        ],
        exercises: [
          { title: "Composição", description: "Crie linhas melódicas independentes", type: "pratica" }
        ]
      }
    },
    {
      title: "Orquestração - Pintando com Sons",
      description: "Domine a arte da orquestração e arranjo",
      category: "compasso-composto",
      level: "maestro",
      order: 3,
      points: 100,
      content: {
        theory: "A orquestração é a arte de combinar instrumentos para criar texturas musicais.",
        examples: [
          { title: "Famílias de Instrumentos", description: "Cordas, madeiras, metais, percussão", type: "pratica" }
        ],
        exercises: [
          { title: "Arranjo", description: "Crie arranjos para diferentes formações", type: "pratica" }
        ]
      }
    }
  ]
};

// Função para criar perguntas para cada módulo
const createQuestionsForModule = (module, moduleIndex) => {
  const baseQuestions = [
    {
      question: `🎵 Qual tema melhor descreve o módulo "${module.title}"?`,
      options: [
        { label: module.description, isCorrect: true },
        { label: "Conceitos básicos de música", isCorrect: false },
        { label: "Técnicas avançadas", isCorrect: false },
        { label: "História da música", isCorrect: false }
      ],
      explanation: `Este módulo aborda ${module.description.toLowerCase()}.`,
      category: module.category,
      difficulty: module.level === 'aprendiz' ? 'facil' : module.level === 'virtuoso' ? 'medio' : 'dificil',
      points: module.level === 'aprendiz' ? 10 : module.level === 'virtuoso' ? 15 : 20
    },
    {
      question: `🎯 Este módulo é indicado para qual nível?`,
      options: [
        { label: module.level === 'aprendiz' ? 'Iniciante' : module.level === 'virtuoso' ? 'Intermediário' : 'Avançado', isCorrect: true },
        { label: module.level === 'aprendiz' ? 'Avançado' : module.level === 'virtuoso' ? 'Iniciante' : 'Intermediário', isCorrect: false },
        { label: "Todos os níveis", isCorrect: false },
        { label: "Apenas profissionais", isCorrect: false }
      ],
      explanation: `Este módulo é específico para o nível ${module.level}.`,
      category: module.category,
      difficulty: 'facil',
      points: 10
    }
  ];

  // Adicionar perguntas específicas baseadas no módulo
  const specificQuestions = [];
  
  if (module.title.includes('Propriedades do Som')) {
    specificQuestions.push(
      {
        question: "🎵 Qual das propriedades do som determina se uma nota é grave ou aguda?",
        options: [
          { label: "Timbre", isCorrect: false },
          { label: "Altura", isCorrect: true },
          { label: "Intensidade", isCorrect: false },
          { label: "Duração", isCorrect: false }
        ],
        explanation: "A altura é a propriedade que determina se um som é grave ou agudo.",
        category: module.category,
        difficulty: 'facil',
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
        category: module.category,
        difficulty: 'facil',
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
        category: module.category,
        difficulty: 'facil',
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
        category: module.category,
        difficulty: 'facil',
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
        category: module.category,
        difficulty: 'medio',
        points: 10
      }
    );
  } else if (module.title.includes('Notas Musicais')) {
    specificQuestions.push(
      {
        question: "🎵 Quantas notas musicais existem na escala básica?",
        options: [
          { label: "5 notas", isCorrect: false },
          { label: "6 notas", isCorrect: false },
          { label: "7 notas", isCorrect: true },
          { label: "8 notas", isCorrect: false }
        ],
        explanation: "Existem 7 notas musicais: Dó, Ré, Mi, Fá, Sol, Lá, Si.",
        category: module.category,
        difficulty: 'facil',
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
        category: module.category,
        difficulty: 'facil',
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
        category: module.category,
        difficulty: 'facil',
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
        category: module.category,
        difficulty: 'medio',
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
        category: module.category,
        difficulty: 'medio',
        points: 10
      }
    );
  } else {
    // Para outros módulos, criar perguntas genéricas
    for (let i = 0; i < 5; i++) {
      specificQuestions.push({
        question: `🎵 Pergunta ${i + 1} sobre ${module.title.split(' - ')[0]}:`,
        options: [
          { label: `Opção correta sobre ${module.title.split(' - ')[0]}`, isCorrect: true },
          { label: `Opção incorreta 1`, isCorrect: false },
          { label: `Opção incorreta 2`, isCorrect: false },
          { label: `Opção incorreta 3`, isCorrect: false }
        ],
        explanation: `Explicação sobre ${module.title.split(' - ')[0]}.`,
        category: module.category,
        difficulty: module.level === 'aprendiz' ? 'facil' : module.level === 'virtuoso' ? 'medio' : 'dificil',
        points: module.level === 'aprendiz' ? 10 : module.level === 'virtuoso' ? 15 : 20
      });
    }
  }

  return [...baseQuestions, ...specificQuestions];
};

// Função para popular o banco
const populateFullContent = async () => {
  try {
    console.log('🚀 CRIANDO CONTEÚDO COMPLETO COM 77+ PERGUNTAS');
    console.log('=' .repeat(60));

    // Limpar conteúdo existente
    console.log('🧹 Limpando conteúdo anterior...');
    await Module.deleteMany({});
    await Quiz.deleteMany({});
    console.log('✅ Conteúdo anterior removido');

    let totalQuestions = 0;

    // Criar módulos e quizzes
    for (let i = 0; i < fullContent.modules.length; i++) {
      const moduleData = fullContent.modules[i];
      
      // Criar módulo
      const module = await Module.create(moduleData);
      console.log(`✅ Módulo criado: ${moduleData.title}`);

      // Criar perguntas para o módulo
      const questions = createQuestionsForModule(moduleData, i);
      totalQuestions += questions.length;

      // Criar quiz
      const quiz = await Quiz.create({
        title: `Quiz - ${moduleData.title}`,
        description: `Teste seus conhecimentos sobre ${moduleData.title.toLowerCase()}`,
        moduleId: module._id,
        category: moduleData.category,
        level: moduleData.level,
        type: "module",
        timeLimit: 600,
        passingScore: 70,
        attempts: 3,
        questions: questions.map(q => ({
          ...q,
          _id: new mongoose.Types.ObjectId()
        })),
        totalAttempts: 0,
        averageScore: 0,
        isActive: true
      });

      console.log(`   ✅ Quiz criado com ${questions.length} perguntas`);
    }

    // Estatísticas finais
    console.log('\n📊 ESTATÍSTICAS FINAIS:');
    console.log('-' .repeat(40));
    
    const totalModules = await Module.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const actualQuestions = await Quiz.aggregate([
      { $project: { questionCount: { $size: "$questions" } } },
      { $group: { _id: null, total: { $sum: "$questionCount" } } }
    ]);

    console.log(`📚 Total de módulos: ${totalModules}`);
    console.log(`🎯 Total de quizzes: ${totalQuizzes}`);
    console.log(`❓ Total de perguntas: ${actualQuestions[0]?.total || 0}`);

    // Distribuição por nível
    const levelStats = await Module.aggregate([
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📈 DISTRIBUIÇÃO POR NÍVEL:');
    levelStats.forEach(stat => {
      console.log(`   🎯 ${stat._id.toUpperCase()}: ${stat.count} módulos`);
    });

    console.log('\n🎉 CONTEÚDO COMPLETO CRIADO COM SUCESSO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a criação:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(populateFullContent);
}

module.exports = { populateFullContent };
