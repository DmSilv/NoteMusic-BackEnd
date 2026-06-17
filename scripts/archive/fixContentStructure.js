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

// Criar módulos com estrutura correta
const createModulesWithCorrectStructure = async () => {
  try {
    console.log('📚 Criando módulos com estrutura correta...');
    
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
          examples: [
            { title: 'Escala de Dó Maior', description: 'Sequência completa das 7 notas' },
            { title: 'Sílabas do Solfejo', description: 'Dó, Ré, Mi, Fá, Sol, Lá, Si' },
            { title: 'Exercícios Práticos', description: 'Cantar escalas ascendentes e descendentes' }
          ],
          exercises: [
            { title: 'Cantar Escalas', description: 'Praticar solfejo com escalas', type: 'pratica' },
            { title: 'Identificar Notas', description: 'Reconhecer notas por nome', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Clave de Sol', description: 'Usada para instrumentos agudos' },
            { title: 'Clave de Fá', description: 'Usada para instrumentos graves' },
            { title: 'Posição das Notas', description: 'Como as notas se posicionam na pauta' }
          ],
          exercises: [
            { title: 'Desenhar Pautas', description: 'Criar pautas musicais', type: 'pratica' },
            { title: 'Identificar Claves', description: 'Reconhecer tipos de claves', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Semibreve', description: '4 tempos - nota mais longa' },
            { title: 'Mínima', description: '2 tempos - metade da semibreve' },
            { title: 'Semínima', description: '1 tempo - unidade básica' },
            { title: 'Colcheia', description: '1/2 tempo - metade da semínima' }
          ],
          exercises: [
            { title: 'Contar Tempos', description: 'Praticar contagem rítmica', type: 'pratica' },
            { title: 'Identificar Figuras', description: 'Reconhecer valores das notas', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Compasso 4/4', description: '4 semínimas por compasso' },
            { title: 'Compasso 3/4', description: '3 semínimas por compasso' },
            { title: 'Compasso 2/4', description: '2 semínimas por compasso' }
          ],
          exercises: [
            { title: 'Bater Compassos', description: 'Praticar marcação de compasso', type: 'pratica' },
            { title: 'Identificar Tipos', description: 'Reconhecer tipos de compasso', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Escala de Dó Maior', description: 'C-D-E-F-G-A-B-C (sem acidentes)' },
            { title: 'Escala de Sol Maior', description: 'G-A-B-C-D-E-F#-G (1 sustenido)' },
            { title: 'Fórmula da Escala', description: 'T-T-ST-T-T-T-ST' }
          ],
          exercises: [
            { title: 'Construir Escalas', description: 'Criar escalas maiores', type: 'pratica' },
            { title: 'Identificar Acidentes', description: 'Reconhecer sustenidos e bemóis', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Sinais Básicos', description: 'pp, p, mp, mf, f, ff' },
            { title: 'Crescendo', description: 'Aumento gradual do volume' },
            { title: 'Diminuendo', description: 'Diminuição gradual do volume' }
          ],
          exercises: [
            { title: 'Aplicar Dinâmica', description: 'Usar sinais dinâmicos', type: 'pratica' },
            { title: 'Reconhecer Sinais', description: 'Identificar símbolos dinâmicos', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Sustenido', description: 'Dó# = Réb (enarmonia)' },
            { title: 'Bemol', description: 'Fá# = Solb (enarmonia)' },
            { title: 'Bequadro', description: 'Cancela acidentes anteriores' }
          ],
          exercises: [
            { title: 'Identificar Acidentes', description: 'Reconhecer símbolos', type: 'teoria' },
            { title: 'Aplicar Alterações', description: 'Usar acidentes em notas', type: 'pratica' }
          ]
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
          examples: [
            { title: 'Lá Menor Natural', description: 'A-B-C-D-E-F-G-A' },
            { title: 'Lá Menor Harmônica', description: 'A-B-C-D-E-F-G#-A' },
            { title: 'Lá Menor Melódica', description: 'A-B-C-D-E-F#-G#-A (subida)' }
          ],
          exercises: [
            { title: 'Construir Escalas Menores', description: 'Criar escalas menores', type: 'pratica' },
            { title: 'Identificar Tipos', description: 'Reconhecer formas de escala', type: 'teoria' }
          ]
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
          examples: [
            { title: '3ª Maior', description: 'Dó-Mi (2 tons)' },
            { title: '5ª Justa', description: 'Dó-Sol (3,5 tons)' },
            { title: '7ª Menor', description: 'Dó-Sib (5 tons)' }
          ],
          exercises: [
            { title: 'Identificar Intervalos', description: 'Reconhecer distâncias', type: 'audicao' },
            { title: 'Classificar Qualidades', description: 'Determinar tipos de intervalo', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Dó Maior', description: 'C-E-G (tríade maior)' },
            { title: 'Lá Menor', description: 'A-C-E (tríade menor)' },
            { title: 'Si Diminuto', description: 'B-D-F (tríade diminuta)' }
          ],
          exercises: [
            { title: 'Construir Tríades', description: 'Criar acordes básicos', type: 'pratica' },
            { title: 'Identificar Tipos', description: 'Reconhecer qualidades', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Modo Dórico', description: 'Ré-Dó (2ª menor, 6ª menor)' },
            { title: 'Modo Lídio', description: 'Fá-Sol (4ª aumentada)' },
            { title: 'Modo Mixolídio', description: 'Sol-Fá (7ª menor)' }
          ],
          exercises: [
            { title: 'Construir Modos', description: 'Criar escalas modais', type: 'pratica' },
            { title: 'Identificar Características', description: 'Reconhecer sons modais', type: 'audicao' }
          ]
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
          examples: [
            { title: 'Síncopa Simples', description: 'Acento no tempo fraco' },
            { title: 'Contratempo Básico', description: 'Notas nos tempos fracos' },
            { title: 'Padrões Complexos', description: 'Combinações rítmicas' }
          ],
          exercises: [
            { title: 'Executar Síncopas', description: 'Praticar ritmos sincopados', type: 'pratica' },
            { title: 'Criar Contratempos', description: 'Desenvolver padrões rítmicos', type: 'pratica' }
          ]
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
          examples: [
            { title: 'Staccato', description: 'Notas curtas e separadas (.)' },
            { title: 'Legato', description: 'Notas ligadas (curva)' },
            { title: 'Portato', description: 'Semi-ligado (ponto e linha)' }
          ],
          exercises: [
            { title: 'Aplicar Articulações', description: 'Usar diferentes articulações', type: 'pratica' },
            { title: 'Reconhecer Sinais', description: 'Identificar símbolos', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Cmaj7', description: 'C-E-G-B (acorde de 7ª maior)' },
            { title: 'Dm7', description: 'D-F-A-C (acorde de 7ª menor)' },
            { title: 'G7', description: 'G-B-D-F (acorde de 7ª dominante)' }
          ],
          exercises: [
            { title: 'Construir Acordes Complexos', description: 'Criar acordes de 7ª', type: 'pratica' },
            { title: 'Aplicar Substituições', description: 'Usar substituições trítonas', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Cânone Simples', description: 'Imitação a 2 vozes' },
            { title: 'Fuga Básica', description: 'Sujeito, resposta, contrasujeito' },
            { title: 'Contraponto a 2 Vozes', description: 'Regras básicas' }
          ],
          exercises: [
            { title: 'Escrever Contraponto', description: 'Criar linhas independentes', type: 'pratica' },
            { title: 'Analisar Fugas', description: 'Estudar obras contrapontísticas', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Seções da Orquestra', description: 'Cordas, madeiras, metais, percussão' },
            { title: 'Tessituras Instrumentais', description: 'Registros de cada instrumento' },
            { title: 'Efeitos Especiais', description: 'Técnicas orquestrais' }
          ],
          exercises: [
            { title: 'Orquestrar Melodias', description: 'Distribuir material musical', type: 'pratica' },
            { title: 'Criar Texturas', description: 'Desenvolver camadas sonoras', type: 'pratica' }
          ]
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
          examples: [
            { title: '6/8', description: '2 grupos de 3 colcheias' },
            { title: '9/8', description: '3 grupos de 3 colcheias' },
            { title: '12/8', description: '4 grupos de 3 colcheias' }
          ],
          exercises: [
            { title: 'Bater Compassos Compostos', description: 'Praticar marcação', type: 'pratica' },
            { title: 'Identificar Subdivisões', description: 'Reconhecer grupos ternários', type: 'teoria' }
          ]
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
          examples: [
            { title: 'Modulação por 5ª Justa', description: 'Dó maior → Sol maior' },
            { title: 'Acorde Pivô Comum', description: 'Usar acorde comum às duas tonalidades' },
            { title: 'Modulação Cromática', description: 'Mudança por semitom' }
          ],
          exercises: [
            { title: 'Criar Modulações', description: 'Desenvolver mudanças tonais', type: 'pratica' },
            { title: 'Identificar Acordes Pivô', description: 'Reconhecer acordes comuns', type: 'teoria' }
          ]
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
const fixContentStructure = async () => {
  try {
    console.log('🚀 CORRIGINDO ESTRUTURA DO CONTEÚDO');
    console.log('=' .repeat(60));

    // 1. Limpar dados existentes
    await clearExistingData();

    // 2. Criar módulos com estrutura correta
    const modules = await createModulesWithCorrectStructure();

    // 3. Criar quizzes com estrutura correta
    const quizzes = await createQuizzesWithCorrectStructure(modules);

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

    console.log('\n🎉 ESTRUTURA CORRIGIDA COM SUCESSO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(fixContentStructure);
}

module.exports = { fixContentStructure };



