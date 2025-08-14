// Dados de exemplo para popular o banco de dados

const modulesData = [
  // Módulos Iniciante
  {
    title: 'Introdução às Propriedades do Som',
    description: 'Aprenda os conceitos fundamentais do som: frequência, timbre, intensidade e duração.',
    category: 'propriedades-som',
    level: 'iniciante',
    order: 1,
    content: {
      theory: `O som é uma onda mecânica que se propaga através de um meio. 
      As quatro propriedades fundamentais do som são:
      1. Frequência (altura): determina se o som é grave ou agudo
      2. Intensidade (volume): determina se o som é forte ou fraco
      3. Timbre: qualidade que distingue sons de mesma altura e intensidade
      4. Duração: tempo que o som permanece audível`,
      examples: [
        {
          title: 'Frequência',
          description: 'A nota Lá (A4) vibra a 440Hz',
          imageUrl: '/images/frequency.png'
        }
      ],
      exercises: [
        {
          title: 'Identifique sons graves e agudos',
          description: 'Ouça os exemplos e classifique-os',
          type: 'audicao'
        }
      ]
    },
    duration: 30,
    points: 100
  },
  {
    title: 'Notas Musicais Básicas',
    description: 'Conheça as 7 notas musicais e suas características.',
    category: 'figuras-musicais',
    level: 'iniciante',
    order: 2,
    content: {
      theory: `As notas musicais são: Dó, Ré, Mi, Fá, Sol, Lá, Si.
      Elas representam diferentes frequências sonoras e formam a base de toda a música ocidental.`,
      examples: [
        {
          title: 'Escala de Dó Maior',
          description: 'A escala mais básica da música',
          imageUrl: '/images/c-major-scale.png'
        }
      ],
      exercises: [
        {
          title: 'Memorize as notas',
          description: 'Pratique a sequência das notas musicais',
          type: 'teoria'
        }
      ]
    },
    duration: 25,
    points: 100
  },
  {
    title: 'Instrumentos da Orquestra - Cordas',
    description: 'Conheça a família das cordas: violino, viola, violoncelo e contrabaixo.',
    category: 'propriedades-som',
    level: 'iniciante',
    order: 3,
    content: {
      theory: `A família das cordas é o coração da orquestra sinfônica.
      Os instrumentos de corda produzem som através da vibração de cordas tensionadas.
      
      Principais instrumentos:
      - Violino: Som agudo e brilhante
      - Viola: Som médio e morno
      - Violoncelo: Som médio-grave e expressivo
      - Contrabaixo: Som grave e profundo`,
      examples: [
        {
          title: 'Posição na Orquestra',
          description: 'As cordas ficam na frente, formando a base harmônica',
          imageUrl: '/images/string-section.png'
        }
      ],
      exercises: [
        {
          title: 'Identifique instrumentos de corda',
          description: 'Ouça diferentes instrumentos e identifique-os',
          type: 'audicao'
        }
      ]
    },
    duration: 35,
    points: 120
  },
  
  // Módulos Intermediário
  {
    title: 'Escalas Maiores - Estrutura e Formação',
    description: 'Entenda como são formadas as escalas maiores usando a fórmula T-T-S-T-T-T-S.',
    category: 'escalas-maiores',
    level: 'intermediario',
    order: 10,
    content: {
      theory: `Uma escala maior é formada por uma sequência específica de tons (T) e semitons (S).
      A fórmula é: T-T-S-T-T-T-S
      Exemplo em Dó Maior: Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó`,
      examples: [
        {
          title: 'Escala de Sol Maior',
          description: 'Sol-Lá-Si-Dó-Ré-Mi-Fá#-Sol',
          imageUrl: '/images/g-major-scale.png'
        }
      ],
      exercises: [
        {
          title: 'Construa escalas maiores',
          description: 'Aplique a fórmula em diferentes notas',
          type: 'pratica'
        }
      ]
    },
    duration: 40,
    points: 150
  },
  {
    title: 'Instrumentos de Sopro - Madeiras',
    description: 'Explore a família das madeiras: flauta, clarinete, oboé e fagote.',
    category: 'andamento-dinamica',
    level: 'intermediario',
    order: 11,
    content: {
      theory: `Os instrumentos de sopro de madeira são essenciais para a cor e expressão da orquestra.
      
      Características principais:
      - Flauta: Som límpido e fluido
      - Clarinete: Som versátil e expressivo
      - Oboé: Som nasal e penetrante
      - Fagote: Som grave e rico
      
      Técnicas importantes:
      - Respiração diafragmática
      - Articulação com a língua
      - Controle de dinâmica`,
      examples: [
        {
          title: 'Respiração Circular',
          description: 'Técnica para manter o som contínuo',
          imageUrl: '/images/breathing-technique.png'
        }
      ],
      exercises: [
        {
          title: 'Pratique respiração diafragmática',
          description: 'Exercícios para fortalecer o diafragma',
          type: 'pratica'
        }
      ]
    },
    duration: 45,
    points: 180
  },
  {
    title: 'Harmonia Funcional Básica',
    description: 'Aprenda sobre acordes principais, progressões e cadências.',
    category: 'intervalos-musicais',
    level: 'intermediario',
    order: 12,
    content: {
      theory: `A harmonia funcional é a base da música tonal.
      
      Acordes principais (tríades):
      - I (tônica): Estável e conclusivo
      - IV (subdominante): Preparatório
      - V (dominante): Tensional e direcional
      
      Progressões comuns:
      - I-IV-V-I (cadência perfeita)
      - I-VI-IV-V (progressão pop)
      - II-V-I (cadência jazz)`,
      examples: [
        {
          title: 'Cadência Perfeita',
          description: 'A progressão mais conclusiva da música',
          imageUrl: '/images/perfect-cadence.png'
        }
      ],
      exercises: [
        {
          title: 'Identifique progressões',
          description: 'Ouça e identifique diferentes progressões harmônicas',
          type: 'audicao'
        }
      ]
    },
    duration: 50,
    points: 200
  },
  
  // Módulos Avançado
  {
    title: 'Síncopa e Contratempo Avançado',
    description: 'Domine ritmos sincopados complexos e suas aplicações em diferentes estilos.',
    category: 'sincopa-contratempo',
    level: 'avancado',
    order: 20,
    content: {
      theory: `A síncopa é o deslocamento do acento natural do compasso.
      O contratempo enfatiza os tempos fracos.
      Ambos são essenciais para criar interesse rítmico e são fundamentais no jazz, bossa nova e música popular.`,
      examples: [
        {
          title: 'Síncopa Brasileira',
          description: 'Padrão rítmico comum na música brasileira',
          imageUrl: '/images/brazilian-syncopation.png'
        }
      ],
      exercises: [
        {
          title: 'Execute ritmos sincopados',
          description: 'Pratique com metrônomo',
          type: 'pratica'
        }
      ]
    },
    duration: 50,
    points: 200
  },
  {
    title: 'Orquestração e Arranjo',
    description: 'Aprenda a escrever para diferentes instrumentos e criar arranjos orquestrais.',
    category: 'expressao-musical',
    level: 'avancado',
    order: 21,
    content: {
      theory: `A orquestração é a arte de distribuir a música entre os instrumentos da orquestra.
      
      Princípios fundamentais:
      - Registro: Cada instrumento tem sua melhor tessitura
      - Cor: Combinações de instrumentos criam cores únicas
      - Equilíbrio: Distribuição adequada de vozes
      - Transparência: Evitar sobreposições desnecessárias
      
      Técnicas avançadas:
      - Doublings (duplicações)
      - Divisi (divisão de vozes)
      - Muting (abafamento)
      - Special effects (efeitos especiais)`,
      examples: [
        {
          title: 'Seção de Cordas',
          description: 'Como dividir e organizar as vozes das cordas',
          imageUrl: '/images/string-divisi.png'
        },
        {
          title: 'Combinações de Madeiras',
          description: 'Cores únicas criadas por diferentes combinações',
          imageUrl: '/images/woodwind-combinations.png'
        }
      ],
      exercises: [
        {
          title: 'Arranje uma melodia simples',
          description: 'Pratique orquestrando uma melodia para diferentes instrumentos',
          type: 'pratica'
        },
        {
          title: 'Analise partituras orquestrais',
          description: 'Estude como grandes compositores orquestraram suas obras',
          type: 'teoria'
        }
      ]
    },
    duration: 60,
    points: 250
  },
  {
    title: 'Análise Musical Avançada',
    description: 'Desenvolva habilidades analíticas para entender a estrutura e forma musical.',
    category: 'compasso-composto',
    level: 'avancado',
    order: 22,
    content: {
      theory: `A análise musical é fundamental para compreender a arquitetura da música.
      
      Elementos de análise:
      - Forma: Estrutura geral da peça (A-B-A, Sonata, Rondo)
      - Harmonia: Progressões e relações entre acordes
      - Melodia: Linhas temáticas e desenvolvimento
      - Ritmo: Padrões rítmicos e métrica
      - Textura: Densidade e organização das vozes
      
      Técnicas analíticas:
      - Redução harmônica
      - Análise motivica
      - Análise formal
      - Análise estilística`,
      examples: [
        {
          title: 'Forma Sonata',
          description: 'Estrutura clássica com exposição, desenvolvimento e recapitulação',
          imageUrl: '/images/sonata-form.png'
        },
        {
          title: 'Desenvolvimento Temático',
          description: 'Como Beethoven desenvolve seus temas',
          imageUrl: '/images/theme-development.png'
        }
      ],
      exercises: [
        {
          title: 'Analise uma sonata clássica',
          description: 'Identifique a forma e estrutura de uma sonata',
          type: 'teoria'
        },
        {
          title: 'Reduza uma peça orquestral',
          description: 'Simplifique uma obra complexa para piano',
          type: 'pratica'
        }
      ]
    },
    duration: 70,
    points: 300
  }
];

const quizQuestionsData = [
  // Quiz 1: Propriedades do Som (Iniciante)
  {
    moduleCategory: 'propriedades-som',
    level: 'iniciante',
    questions: [
      {
        question: 'Qual propriedade do som determina se uma nota é aguda ou grave?',
        options: [
          { id: 'A', label: 'Timbre', isCorrect: false },
          { id: 'B', label: 'Frequência', isCorrect: true, explanation: 'A frequência determina a altura do som. Sons de alta frequência são agudos, sons de baixa frequência são graves.' },
          { id: 'C', label: 'Intensidade', isCorrect: false },
          { id: 'D', label: 'Duração', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'O que significa "piano" (p) em música?',
        options: [
          { id: 'A', label: 'Tocar rápido', isCorrect: false },
          { id: 'B', label: 'Tocar suave', isCorrect: true, explanation: 'Piano (p) significa tocar com volume suave ou baixo.' },
          { id: 'C', label: 'Tocar alto', isCorrect: false },
          { id: 'D', label: 'Tocar lento', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual instrumento produz o som mais grave?',
        options: [
          { id: 'A', label: 'Flauta', isCorrect: false },
          { id: 'B', label: 'Violino', isCorrect: false },
          { id: 'C', label: 'Trompete', isCorrect: false },
          { id: 'D', label: 'Contrabaixo', isCorrect: true, explanation: 'O contrabaixo é o instrumento de cordas que produz os sons mais graves da orquestra.' }
        ],
        category: 'propriedades-som',
        difficulty: 'medio',
        points: 15
      }
    ]
  },

  // Quiz 2: Notas Musicais (Iniciante)
  {
    moduleCategory: 'figuras-musicais',
    level: 'iniciante',
    questions: [
      {
        question: 'Quantas notas tem uma escala maior natural?',
        options: [
          { id: 'A', label: '5 notas', isCorrect: false },
          { id: 'B', label: '6 notas', isCorrect: false },
          { id: 'C', label: '7 notas', isCorrect: true, explanation: 'Uma escala maior natural tem 7 notas: Dó, Ré, Mi, Fá, Sol, Lá, Si.' },
          { id: 'D', label: '8 notas', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual é a nota mais alta na escala musical básica?',
        options: [
          { id: 'A', label: 'Dó', isCorrect: false },
          { id: 'B', label: 'Ré', isCorrect: false },
          { id: 'C', label: 'Mi', isCorrect: false },
          { id: 'D', label: 'Si', isCorrect: true, explanation: 'Si é a nota mais alta na escala musical básica de Dó maior.' }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  // Quiz 3: Escalas Maiores (Intermediário)
  {
    moduleCategory: 'escalas-maiores',
    level: 'intermediario',
    questions: [
      {
        question: 'Qual é a fórmula para construir uma escala maior?',
        options: [
          { id: 'A', label: 'T-T-S-T-T-T-S', isCorrect: true, explanation: 'A fórmula da escala maior é: Tom-Tom-Semiton-Tom-Tom-Tom-Semiton (T-T-S-T-T-T-S).' },
          { id: 'B', label: 'T-S-T-T-S-T-T', isCorrect: false },
          { id: 'C', label: 'S-T-T-S-T-T-T', isCorrect: false },
          { id: 'D', label: 'T-T-T-S-T-T-S', isCorrect: false }
        ],
        category: 'escalas-maiores',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Quantos acidentes (sustenidos/bemóis) tem a escala de Sol maior?',
        options: [
          { id: 'A', label: '0 acidentes', isCorrect: false },
          { id: 'B', label: '1 sustenido (Fá#)', isCorrect: true, explanation: 'A escala de Sol maior tem 1 sustenido: Fá#.' },
          { id: 'C', label: '2 sustenidos', isCorrect: false },
          { id: 'D', label: '1 bemol (Si♭)', isCorrect: false }
        ],
        category: 'escalas-maiores',
        difficulty: 'medio',
        points: 15
      }
    ]
  },

  // Quiz 4: Instrumentos de Sopro (Intermediário)
  {
    moduleCategory: 'propriedades-som',
    level: 'intermediario',
    questions: [
      {
        question: 'Qual família de instrumentos de sopro usa palhetas?',
        options: [
          { id: 'A', label: 'Metais', isCorrect: false },
          { id: 'B', label: 'Madeiras', isCorrect: true, explanation: 'Os instrumentos de madeira usam palhetas (como clarinete e oboé) ou não têm palhetas (como flauta).' },
          { id: 'C', label: 'Percussão', isCorrect: false },
          { id: 'D', label: 'Cordas', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Qual instrumento de sopro é conhecido como "rainha dos instrumentos"?',
        options: [
          { id: 'A', label: 'Flauta', isCorrect: true, explanation: 'A flauta é conhecida como a "rainha dos instrumentos" por sua versatilidade e expressividade.' },
          { id: 'B', label: 'Clarinete', isCorrect: false },
          { id: 'C', label: 'Oboé', isCorrect: false },
          { id: 'D', label: 'Fagote', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'medio',
        points: 15
      }
    ]
  },

  // Quiz 5: Orquestração (Avançado)
  {
    moduleCategory: 'expressao-musical',
    level: 'avancado',
    questions: [
      {
        question: 'O que significa "divisi" na orquestração?',
        options: [
          { id: 'A', label: 'Tocar em uníssono', isCorrect: false },
          { id: 'B', label: 'Dividir a seção em partes', isCorrect: true, explanation: 'Divisi significa dividir uma seção de instrumentos para tocar partes diferentes.' },
          { id: 'C', label: 'Tocar mais forte', isCorrect: false },
          { id: 'D', label: 'Tocar mais suave', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      },
      {
        question: 'Qual técnica de orquestração cria um efeito de eco?',
        options: [
          { id: 'A', label: 'Tremolo', isCorrect: false },
          { id: 'B', label: 'Glissando', isCorrect: false },
          { id: 'C', label: 'Echo', isCorrect: true, explanation: 'A técnica de echo na orquestração cria um efeito de reverberação ou repetição.' },
          { id: 'D', label: 'Pizzicato', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      }
    ]
  },

  // Quiz 6: Análise Musical (Avançado)
  {
    moduleCategory: 'expressao-musical',
    level: 'avancado',
    questions: [
      {
        question: 'O que é uma "cadência perfeita" na harmonia?',
        options: [
          { id: 'A', label: 'Progressão V-I', isCorrect: true, explanation: 'Uma cadência perfeita é a progressão harmônica V-I, que cria uma sensação de conclusão.' },
          { id: 'B', label: 'Progressão I-IV', isCorrect: false },
          { id: 'C', label: 'Progressão ii-V', isCorrect: false },
          { id: 'D', label: 'Progressão I-V', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      },
      {
        question: 'Qual é a função da dominante (V) na harmonia funcional?',
        options: [
          { id: 'A', label: 'Estabilidade', isCorrect: false },
          { id: 'B', label: 'Tensão que resolve para a tônica', isCorrect: true, explanation: 'A dominante (V) cria tensão que naturalmente resolve para a tônica (I).' },
          { id: 'C', label: 'Modulação', isCorrect: false },
          { id: 'D', label: 'Repouso', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      }
    ]
  }
];

module.exports = {
  modulesData,
  quizQuestionsData
};