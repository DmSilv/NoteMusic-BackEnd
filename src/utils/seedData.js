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
  }
];

const quizQuestionsData = [
  // Quiz Iniciante
  {
    moduleCategory: 'propriedades-som',
    level: 'iniciante',
    questions: [
      {
        question: 'Qual das seguintes NÃO é uma propriedade fundamental do som?',
        options: [
          { id: 'A', label: 'Frequência', isCorrect: false },
          { id: 'B', label: 'Timbre', isCorrect: false },
          { id: 'C', label: 'Cor', isCorrect: true, explanation: 'Cor não é uma propriedade do som, mas sim da luz.' },
          { id: 'D', label: 'Intensidade', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'O que determina se um som é grave ou agudo?',
        options: [
          { id: 'A', label: 'Intensidade', isCorrect: false },
          { id: 'B', label: 'Frequência', isCorrect: true, explanation: 'A frequência determina a altura do som (grave ou agudo).' },
          { id: 'C', label: 'Timbre', isCorrect: false },
          { id: 'D', label: 'Duração', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'facil',
        points: 10
      }
    ]
  },
  
  // Quiz Intermediário
  {
    moduleCategory: 'escalas-maiores',
    level: 'intermediario',
    questions: [
      {
        question: 'Qual é a fórmula de intervalos de uma escala maior?',
        options: [
          { id: 'A', label: 'T-T-T-S-T-T-S', isCorrect: false },
          { id: 'B', label: 'T-T-S-T-T-T-S', isCorrect: true, explanation: 'Esta é a fórmula correta: Tom-Tom-Semitom-Tom-Tom-Tom-Semitom.' },
          { id: 'C', label: 'T-S-T-T-S-T-T', isCorrect: false },
          { id: 'D', label: 'S-T-T-S-T-T-T', isCorrect: false }
        ],
        category: 'escalas-maiores',
        difficulty: 'medio',
        points: 15
      }
    ]
  }
];

module.exports = {
  modulesData,
  quizQuestionsData
};