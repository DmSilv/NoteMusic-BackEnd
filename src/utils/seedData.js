// Dados reais de teoria musical baseados no MTS da CCB e outros livros de referência

const modulesData = [
  // Módulos APRENDIZ - Conceitos Fundamentais
  {
    title: 'As 7 Notas Musicais',
    description: 'Conheça as notas musicais básicas: Dó, Ré, Mi, Fá, Sol, Lá, Si.',
    category: 'figuras-musicais',
    level: 'aprendiz',
    order: 1,
    content: {
      theory: `As 7 notas musicais são a base de toda a música ocidental:
      
      DÓ - RÉ - MI - FÁ - SOL - LÁ - SI
      
      Cada nota tem uma altura diferente. Quando cantamos "Dó-Ré-Mi", estamos subindo na escala.
      A sequência se repete: após o Si, volta ao Dó (mais agudo).
      
      Dica: "Dó-Ré-Mi-Fá-Sol-Lá-Si" é como subir uma escada musical!`,
      examples: [
        {
          title: 'Escala Ascendente',
          description: 'Dó → Ré → Mi → Fá → Sol → Lá → Si → Dó',
          imageUrl: '/images/notas-ascendentes.png'
        },
        {
          title: 'Posição no Piano',
          description: 'As teclas brancas do piano seguem a sequência das notas',
          imageUrl: '/images/piano-notas.png'
        }
      ],
      exercises: [
        {
          title: 'Cante as notas em sequência',
          description: 'Pratique cantando: Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó',
          type: 'pratica'
        }
      ]
    },
    duration: 20,
    points: 100
  },
  {
    title: 'Figuras de Valor - Duração das Notas',
    description: 'Aprenda sobre semibreve, mínima, semínima e suas durações.',
    category: 'figuras-musicais',
    level: 'aprendiz',
    order: 2,
    content: {
      theory: `As figuras musicais mostram QUANTO TEMPO cada nota deve durar:
      
      🎵 SEMIBREVE (4 tempos) - A mais longa
      🎵 MÍNIMA (2 tempos) - Metade da semibreve
      🎵 SEMÍNIMA (1 tempo) - Metade da mínima
      🎵 COLCHEIA (1/2 tempo) - Metade da semínima
      
      Dica: É como uma pizza! Semibreve = pizza inteira, mínima = metade, semínima = 1/4, colcheia = 1/8!`,
      examples: [
        {
          title: 'Comparação Visual',
          description: 'Semibreve = 4 semínimas = 8 colcheias',
          imageUrl: '/images/figuras-valor.png'
        },
        {
          title: 'Contagem Rítmica',
          description: '1-2-3-4 (semibreve) | 1-2 (mínima) | 1 (semínima)',
          imageUrl: '/images/contagem-ritmica.png'
        }
      ],
      exercises: [
        {
          title: 'Bata palmas com as figuras',
          description: 'Pratique batendo palmas: 4 tempos, 2 tempos, 1 tempo',
          type: 'pratica'
        }
      ]
    },
    duration: 25,
    points: 100
  },
  {
    title: 'Compasso Simples - 2/4, 3/4, 4/4',
    description: 'Entenda como organizar a música em compassos simples.',
    category: 'compasso-simples',
    level: 'aprendiz',
    order: 3,
    content: {
      theory: `O compasso organiza a música em grupos de tempos:
      
      🎼 2/4 = 2 tempos por compasso (marcha)
      🎼 3/4 = 3 tempos por compasso (valsa)
      🎼 4/4 = 4 tempos por compasso (mais comum)
      
      O número de cima = quantos tempos
      O número de baixo = qual figura vale 1 tempo (4 = semínima)
      
      Dica: 4/4 é como "1-2-3-4, 1-2-3-4" - muito comum no pop e rock!`,
      examples: [
        {
          title: 'Compasso 4/4',
          description: '1-2-3-4 | 1-2-3-4 | (batida forte no 1)',
          imageUrl: '/images/compasso-4-4.png'
        },
        {
          title: 'Compasso 3/4',
          description: '1-2-3 | 1-2-3 | (valsa - batida forte no 1)',
          imageUrl: '/images/compasso-3-4.png'
        }
      ],
      exercises: [
        {
          title: 'Bata o compasso',
          description: 'Pratique batendo: 4/4 = 4 batidas, 3/4 = 3 batidas',
          type: 'pratica'
        }
      ]
    },
    duration: 25,
    points: 100
  },
  {
    title: 'Dinâmica Musical - Forte e Piano',
    description: 'Aprenda sobre volume na música: forte (f) e piano (p).',
    category: 'andamento-dinamica',
    level: 'aprendiz',
    order: 4,
    content: {
      theory: `A dinâmica controla o VOLUME da música:
      
      🔊 FORTE (f) = tocar alto
      🔇 PIANO (p) = tocar suave
      🔉 MEZZO-FORTE (mf) = volume médio
      🔈 MEZZO-PIANO (mp) = volume médio-baixo
      
      Dica: É como o controle de volume da TV! f = volume alto, p = volume baixo!`,
      examples: [
        {
          title: 'Símbolos de Dinâmica',
          description: 'f = forte, p = piano, mf = mezzo-forte, mp = mezzo-piano',
          imageUrl: '/images/dinamica-simbolos.png'
        },
        {
          title: 'Crescendo e Diminuendo',
          description: '< = ficar mais forte, > = ficar mais suave',
          imageUrl: '/images/crescendo-diminuendo.png'
        }
      ],
      exercises: [
        {
          title: 'Pratique dinâmicas',
          description: 'Cante uma música variando o volume: forte, piano, forte',
          type: 'pratica'
        }
      ]
    },
    duration: 20,
    points: 100
  },
  {
    title: 'Sustenido e Bemol - Acidentes',
    description: 'Conheça os acidentes que alteram as notas: # (sustenido) e ♭ (bemol).',
    category: 'figuras-musicais',
    level: 'aprendiz',
    order: 5,
    content: {
      theory: `Os acidentes alteram as notas musicais:
      
      # SUSTENIDO = sobe meio tom (mais agudo)
      ♭ BEMOL = desce meio tom (mais grave)
      ♮ BECQUADRO = cancela o acidente
      
      Exemplos:
      - Fá# = Fá sustenido (meio tom acima do Fá)
      - Si♭ = Si bemol (meio tom abaixo do Si)
      
      Dica: Sustenido = "subir", Bemol = "baixar"!`,
      examples: [
        {
          title: 'Teclas Pretas do Piano',
          description: 'As teclas pretas são as notas com acidentes',
          imageUrl: '/images/piano-acidentes.png'
        },
        {
          title: 'Símbolos dos Acidentes',
          description: '# = sustenido, ♭ = bemol, ♮ = becquadro',
          imageUrl: '/images/simbolos-acidentes.png'
        }
      ],
      exercises: [
        {
          title: 'Identifique acidentes',
          description: 'Encontre sustenidos e bemóis em partituras simples',
          type: 'teoria'
        }
      ]
    },
    duration: 25,
    points: 100
  },
  
  // Módulos VIRTUOSO - Conceitos Intermediários
  {
    title: 'Escala Maior - A Fórmula Mágica',
    description: 'Aprenda a fórmula T-T-S-T-T-T-S para construir qualquer escala maior.',
    category: 'escalas-maiores',
    level: 'virtuoso',
    order: 10,
    content: {
      theory: `Toda escala maior segue a mesma "receita":
      
      🎵 FÓRMULA: T-T-S-T-T-T-S
      T = Tom (2 semitons)
      S = Semiton (1 semiton)
      
      Exemplo - Dó Maior:
      Dó → Ré (T) → Mi (T) → Fá (S) → Sol (T) → Lá (T) → Si (T) → Dó (S)
      
      Dica: É como uma receita de bolo! Sempre a mesma sequência!`,
      examples: [
        {
          title: 'Escala de Sol Maior',
          description: 'Sol-Lá-Si-Dó-Ré-Mi-Fá#-Sol (Fá# = acidente necessário)',
          imageUrl: '/images/escala-sol-maior.png'
        },
        {
          title: 'Escala de Ré Maior',
          description: 'Ré-Mi-Fá#-Sol-Lá-Si-Dó#-Ré (Fá# e Dó# = acidentes)',
          imageUrl: '/images/escala-re-maior.png'
        }
      ],
      exercises: [
        {
          title: 'Construa escalas maiores',
          description: 'Use a fórmula T-T-S-T-T-T-S em diferentes notas',
          type: 'pratica'
        }
      ]
    },
    duration: 30,
    points: 150
  },
  {
    title: 'Intervalos Musicais - Distâncias',
    description: 'Aprenda sobre as distâncias entre as notas: uníssono, segunda, terça, etc.',
    category: 'intervalos-musicais',
    level: 'virtuoso',
    order: 11,
    content: {
      theory: `Intervalos são as DISTÂNCIAS entre duas notas:
      
      🎵 UNÍSSONO = mesma nota (Dó-Dó)
      🎵 SEGUNDA = 1 tom (Dó-Ré)
      🎵 TERÇA = 2 tons (Dó-Mi)
      🎵 QUARTA = 2,5 tons (Dó-Fá)
      🎵 QUINTA = 3,5 tons (Dó-Sol)
      🎵 SEXTA = 4,5 tons (Dó-Lá)
      🎵 SÉTIMA = 5,5 tons (Dó-Si)
      🎵 OITAVA = 6 tons (Dó-Dó)
      
      Dica: É como medir distância entre casas! Cada intervalo tem um "tamanho" diferente!`,
      examples: [
        {
          title: 'Intervalos na Escala de Dó',
          description: 'Dó-Ré (2ª), Dó-Mi (3ª), Dó-Fá (4ª), Dó-Sol (5ª)',
          imageUrl: '/images/intervalos-do-maior.png'
        },
        {
          title: 'Intervalos Consonantes',
          description: '3ª, 4ª, 5ª, 6ª, 8ª = soam bem juntos',
          imageUrl: '/images/intervalos-consonantes.png'
        }
      ],
      exercises: [
        {
          title: 'Identifique intervalos',
          description: 'Ouça pares de notas e identifique o intervalo',
          type: 'audicao'
        }
      ]
    },
    duration: 35,
    points: 150
  },
  {
    title: 'Acordes Básicos - Tríades',
    description: 'Aprenda sobre acordes de 3 notas: maior, menor, aumentado e diminuto.',
    category: 'intervalos-musicais',
    level: 'virtuoso',
    order: 12,
    content: {
      theory: `Tríades são acordes de 3 notas:
      
      🎵 TRÍADE MAIOR = 1ª + 3ª maior + 5ª (Dó-Mi-Sol)
      🎵 TRÍADE MENOR = 1ª + 3ª menor + 5ª (Dó-Mi♭-Sol)
      🎵 TRÍADE AUMENTADA = 1ª + 3ª maior + 5ª aumentada (Dó-Mi-Sol#)
      🎵 TRÍADE DIMINUTA = 1ª + 3ª menor + 5ª diminuta (Dó-Mi♭-Sol♭)
      
      Dica: Maior = alegre, Menor = triste, Aumentado = tenso, Diminuto = misterioso!`,
      examples: [
        {
          title: 'Tríade de Dó Maior',
          description: 'Dó-Mi-Sol = acorde alegre e estável',
          imageUrl: '/images/triade-do-maior.png'
        },
        {
          title: 'Tríade de Lá Menor',
          description: 'Lá-Dó-Mi = acorde triste e melancólico',
          imageUrl: '/images/triade-la-menor.png'
        }
      ],
      exercises: [
        {
          title: 'Construa tríades',
          description: 'Forme tríades maiores e menores em diferentes notas',
          type: 'pratica'
        }
      ]
    },
    duration: 35,
    points: 150
  },
  {
    title: 'Síncopa - Ritmo Deslocado',
    description: 'Aprenda sobre síncopa: quando o acento sai do tempo forte.',
    category: 'sincopa-contratempo',
    level: 'virtuoso',
    order: 13,
    content: {
      theory: `Síncopa é quando o acento musical sai do tempo forte:
      
      🎵 TEMPO FORTE = batida natural (1, 2, 3, 4)
      🎵 SÍNCOPA = acento no tempo fraco (entre as batidas)
      
      Exemplo: "ta-TA-ta-ta" (acento no 2º tempo)
      
      Muito usado em:
      - Jazz
      - Bossa nova
      - Funk
      - Samba
      
      Dica: É como dançar "fora do compasso" propositalmente!`,
      examples: [
        {
          title: 'Síncopa Simples',
          description: 'Acento no tempo fraco cria "swing"',
          imageUrl: '/images/sincopa-simples.png'
        },
        {
          title: 'Síncopa no Samba',
          description: 'Padrão rítmico característico brasileiro',
          imageUrl: '/images/sincopa-samba.png'
        }
      ],
      exercises: [
        {
          title: 'Pratique síncopa',
          description: 'Bata palmas com acentos nos tempos fracos',
          type: 'pratica'
        }
      ]
    },
    duration: 30,
    points: 150
  },
  
  // Módulos MAESTRO - Conceitos Avançados
  {
    title: 'Modulação - Mudança de Tonalidade',
    description: 'Aprenda como mudar de uma tonalidade para outra dentro da mesma música.',
    category: 'sincopa-contratempo',
    level: 'maestro',
    order: 20,
    content: {
      theory: `Modulação é a MUDANÇA DE TONALIDADE dentro da música:
      
      🎵 MODULAÇÃO DIATÔNICA = usa acordes comuns às duas tonalidades
      🎵 MODULAÇÃO CROMÁTICA = usa cromatismo (semitons)
      🎵 MODULAÇÃO ENARMÔNICA = usa equivalências (Fá# = Sol♭)
      
      Exemplo: Dó Maior → Sol Maior (modulação diatônica)
      
      Técnicas:
      - Acorde pivô (comum às duas tonalidades)
      - Dominante da nova tonalidade
      - Modulação direta
      
      Dica: É como mudar de "casa" musical durante a música!`,
      examples: [
        {
          title: 'Modulação Diatônica',
          description: 'Dó Maior → Sol Maior usando acorde Sol como pivô',
          imageUrl: '/images/modulacao-diatonica.png'
        },
        {
          title: 'Acorde Pivô',
          description: 'Acorde que existe nas duas tonalidades',
          imageUrl: '/images/acorde-pivo.png'
        }
      ],
      exercises: [
        {
          title: 'Identifique modulações',
          description: 'Ouça músicas e identifique mudanças de tonalidade',
          type: 'audicao'
        }
      ]
    },
    duration: 40,
    points: 200
  },
  {
    title: 'Acordes de Sétima - Harmonia Avançada',
    description: 'Domine os acordes de 4 notas: maior 7, menor 7, dominante 7 e meio-diminuto.',
    category: 'expressao-musical',
    level: 'maestro',
    order: 21,
    content: {
      theory: `Acordes de sétima são acordes de 4 notas (tríade + 7ª):
      
      🎵 MAIOR 7 = tríade maior + 7ª maior (Dó-Mi-Sol-Si)
      🎵 MENOR 7 = tríade menor + 7ª menor (Dó-Mi♭-Sol-Si♭)
      🎵 DOMINANTE 7 = tríade maior + 7ª menor (Dó-Mi-Sol-Si♭)
      🎵 MEIO-DIMINUTO = tríade diminuta + 7ª menor (Dó-Mi♭-Sol♭-Si♭)
      
      Funções:
      - Maior 7 = tônica (estável)
      - Dominante 7 = tensão (quer resolver)
      - Menor 7 = subdominante (preparatório)
      
      Dica: Dominante 7 é o "motor" da harmonia - sempre quer resolver!`,
      examples: [
        {
          title: 'Acorde Dominante 7',
          description: 'Sol7 (Sol-Si-Ré-Fá) quer resolver em Dó Maior',
          imageUrl: '/images/acorde-dominante-7.png'
        },
        {
          title: 'Progressão II-V-I',
          description: 'Ré menor 7 → Sol 7 → Dó Maior 7 (jazz)',
          imageUrl: '/images/progressao-2-5-1.png'
        }
      ],
      exercises: [
        {
          title: 'Construa acordes de 7ª',
          description: 'Forme diferentes tipos de acordes de sétima',
          type: 'pratica'
        }
      ]
    },
    duration: 45,
    points: 200
  },
  {
    title: 'Compasso Composto - 6/8, 9/8, 12/8',
    description: 'Domine os compassos compostos e suas subdivisões ternárias.',
    category: 'compasso-composto',
    level: 'maestro',
    order: 22,
    content: {
      theory: `Compassos compostos têm subdivisão TERNÁRIA (3 partes):
      
      🎵 6/8 = 2 grupos de 3 colcheias (1-2-3, 4-5-6)
      🎵 9/8 = 3 grupos de 3 colcheias (1-2-3, 4-5-6, 7-8-9)
      🎵 12/8 = 4 grupos de 3 colcheias (1-2-3, 4-5-6, 7-8-9, 10-11-12)
      
      Diferença dos simples:
      - Simples: subdivisão binária (1-2, 1-2-3, 1-2-3-4)
      - Composto: subdivisão ternária (1-2-3, 1-2-3, 1-2-3)
      
      Dica: Compostos têm "swing" natural - como balançar!`,
      examples: [
        {
          title: 'Compasso 6/8',
          description: '1-2-3, 4-5-6 | 1-2-3, 4-5-6 (batida forte no 1 e 4)',
          imageUrl: '/images/compasso-6-8.png'
        },
        {
          title: 'Compasso 9/8',
          description: '1-2-3, 4-5-6, 7-8-9 | (batida forte no 1, 4, 7)',
          imageUrl: '/images/compasso-9-8.png'
        }
      ],
      exercises: [
        {
          title: 'Bata compassos compostos',
          description: 'Pratique batendo: 6/8 = 2 grupos de 3, 9/8 = 3 grupos de 3',
          type: 'pratica'
        }
      ]
    },
    duration: 35,
    points: 200
  }
];

const quizQuestionsData = [
  // Quiz 1: As 7 Notas Musicais (Aprendiz)
  {
    moduleCategory: 'figuras-musicais',
    level: 'aprendiz',
    questions: [
      {
        question: 'Quantas notas musicais existem na escala básica?',
        options: [
          { id: 'A', label: '5 notas', isCorrect: false },
          { id: 'B', label: '6 notas', isCorrect: false },
          { id: 'C', label: '7 notas', isCorrect: true, explanation: 'Existem 7 notas musicais: Dó, Ré, Mi, Fá, Sol, Lá, Si.' },
          { id: 'D', label: '8 notas', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual é a primeira nota da escala musical?',
        options: [
          { id: 'A', label: 'Dó', isCorrect: true, explanation: 'Dó é a primeira nota da escala musical básica.' },
          { id: 'B', label: 'Ré', isCorrect: false },
          { id: 'C', label: 'Mi', isCorrect: false },
          { id: 'D', label: 'Fá', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual é a última nota da escala musical?',
        options: [
          { id: 'A', label: 'Lá', isCorrect: false },
          { id: 'B', label: 'Si', isCorrect: true, explanation: 'Si é a última nota da escala musical básica.' },
          { id: 'C', label: 'Sol', isCorrect: false },
          { id: 'D', label: 'Fá', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  // Quiz 2: Figuras de Valor (Aprendiz)
  {
    moduleCategory: 'figuras-musicais',
    level: 'aprendiz',
    questions: [
      {
        question: 'Qual figura musical dura 4 tempos?',
        options: [
          { id: 'A', label: 'Semibreve', isCorrect: true, explanation: 'A semibreve dura 4 tempos - é a figura mais longa.' },
          { id: 'B', label: 'Mínima', isCorrect: false },
          { id: 'C', label: 'Semínima', isCorrect: false },
          { id: 'D', label: 'Colcheia', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Quantas semínimas cabem em uma semibreve?',
        options: [
          { id: 'A', label: '2 semínimas', isCorrect: false },
          { id: 'B', label: '3 semínimas', isCorrect: false },
          { id: 'C', label: '4 semínimas', isCorrect: true, explanation: 'Uma semibreve (4 tempos) = 4 semínimas (1 tempo cada).' },
          { id: 'D', label: '8 semínimas', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual figura musical dura 1 tempo?',
        options: [
          { id: 'A', label: 'Mínima', isCorrect: false },
          { id: 'B', label: 'Semínima', isCorrect: true, explanation: 'A semínima dura 1 tempo - é a figura mais comum.' },
          { id: 'C', label: 'Colcheia', isCorrect: false },
          { id: 'D', label: 'Semibreve', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  // Quiz 3: Compasso Simples (Aprendiz)
  {
    moduleCategory: 'compasso-simples',
    level: 'aprendiz',
    questions: [
      {
        question: 'O que significa o compasso 4/4?',
        options: [
          { id: 'A', label: '4 compassos', isCorrect: false },
          { id: 'B', label: '4 tempos por compasso', isCorrect: true, explanation: '4/4 significa 4 tempos por compasso - o mais comum na música.' },
          { id: 'C', label: '4 notas', isCorrect: false },
          { id: 'D', label: '4 instrumentos', isCorrect: false }
        ],
        category: 'compasso-simples',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual compasso é usado na valsa?',
        options: [
          { id: 'A', label: '2/4', isCorrect: false },
          { id: 'B', label: '3/4', isCorrect: true, explanation: 'O compasso 3/4 é usado na valsa - 3 tempos por compasso.' },
          { id: 'C', label: '4/4', isCorrect: false },
          { id: 'D', label: '6/8', isCorrect: false }
        ],
        category: 'compasso-simples',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'No compasso 4/4, qual tempo é o mais forte?',
        options: [
          { id: 'A', label: 'Tempo 2', isCorrect: false },
          { id: 'B', label: 'Tempo 3', isCorrect: false },
          { id: 'C', label: 'Tempo 1', isCorrect: true, explanation: 'No compasso 4/4, o tempo 1 é o mais forte (acento principal).' },
          { id: 'D', label: 'Tempo 4', isCorrect: false }
        ],
        category: 'compasso-simples',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  // Quiz 4: Dinâmica Musical (Aprendiz)
  {
    moduleCategory: 'andamento-dinamica',
    level: 'aprendiz',
    questions: [
      {
        question: 'O que significa "f" em música?',
        options: [
          { id: 'A', label: 'Tocar rápido', isCorrect: false },
          { id: 'B', label: 'Tocar forte', isCorrect: true, explanation: '"f" significa forte - tocar com volume alto.' },
          { id: 'C', label: 'Tocar lento', isCorrect: false },
          { id: 'D', label: 'Tocar suave', isCorrect: false }
        ],
        category: 'andamento-dinamica',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'O que significa "p" em música?',
        options: [
          { id: 'A', label: 'Tocar forte', isCorrect: false },
          { id: 'B', label: 'Tocar suave', isCorrect: true, explanation: '"p" significa piano - tocar com volume baixo.' },
          { id: 'C', label: 'Tocar rápido', isCorrect: false },
          { id: 'D', label: 'Tocar lento', isCorrect: false }
        ],
        category: 'andamento-dinamica',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'O que significa "mf" em música?',
        options: [
          { id: 'A', label: 'Muito forte', isCorrect: false },
          { id: 'B', label: 'Mezzo-forte', isCorrect: true, explanation: '"mf" significa mezzo-forte - volume médio-alto.' },
          { id: 'C', label: 'Muito suave', isCorrect: false },
          { id: 'D', label: 'Mezzo-piano', isCorrect: false }
        ],
        category: 'andamento-dinamica',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  // Quiz 5: Escala Maior - Fórmula (Virtuoso)
  {
    moduleCategory: 'escalas-maiores',
    level: 'virtuoso',
    questions: [
      {
        question: 'Qual é a fórmula da escala maior?',
        options: [
          { id: 'A', label: 'T-T-S-T-T-T-S', isCorrect: true, explanation: 'A fórmula da escala maior é: Tom-Tom-Semiton-Tom-Tom-Tom-Semiton.' },
          { id: 'B', label: 'T-S-T-T-S-T-T', isCorrect: false },
          { id: 'C', label: 'S-T-T-S-T-T-T', isCorrect: false },
          { id: 'D', label: 'T-T-T-S-T-T-S', isCorrect: false }
        ],
        category: 'escalas-maiores',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Quantos acidentes tem a escala de Sol maior?',
        options: [
          { id: 'A', label: '0 acidentes', isCorrect: false },
          { id: 'B', label: '1 sustenido (Fá#)', isCorrect: true, explanation: 'A escala de Sol maior tem 1 sustenido: Fá#.' },
          { id: 'C', label: '2 sustenidos', isCorrect: false },
          { id: 'D', label: '1 bemol', isCorrect: false }
        ],
        category: 'escalas-maiores',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Qual é a 3ª nota da escala de Dó maior?',
        options: [
          { id: 'A', label: 'Ré', isCorrect: false },
          { id: 'B', label: 'Mi', isCorrect: true, explanation: 'A 3ª nota da escala de Dó maior é Mi.' },
          { id: 'C', label: 'Fá', isCorrect: false },
          { id: 'D', label: 'Sol', isCorrect: false }
        ],
        category: 'escalas-maiores',
        difficulty: 'medio',
        points: 15
      }
    ]
  },

  // Quiz 6: Intervalos Musicais (Virtuoso)
  {
    moduleCategory: 'intervalos-musicais',
    level: 'virtuoso',
    questions: [
      {
        question: 'Qual é a distância entre Dó e Mi?',
        options: [
          { id: 'A', label: 'Segunda', isCorrect: false },
          { id: 'B', label: 'Terça', isCorrect: true, explanation: 'Dó-Mi é um intervalo de terça (2 tons).' },
          { id: 'C', label: 'Quarta', isCorrect: false },
          { id: 'D', label: 'Quinta', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Qual é a distância entre Dó e Sol?',
        options: [
          { id: 'A', label: 'Quarta', isCorrect: false },
          { id: 'B', label: 'Quinta', isCorrect: true, explanation: 'Dó-Sol é um intervalo de quinta (3,5 tons).' },
          { id: 'C', label: 'Sexta', isCorrect: false },
          { id: 'D', label: 'Sétima', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Qual intervalo é considerado consonante?',
        options: [
          { id: 'A', label: 'Segunda', isCorrect: false },
          { id: 'B', label: 'Terça', isCorrect: true, explanation: 'A terça é um intervalo consonante - soa bem.' },
          { id: 'C', label: 'Sétima', isCorrect: false },
          { id: 'D', label: 'Nona', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'medio',
        points: 15
      }
    ]
  },
  
  // Quiz 7: Acordes de Sétima (Maestro)
  {
    moduleCategory: 'expressao-musical',
    level: 'maestro',
    questions: [
      {
        question: 'Quantas notas tem um acorde de sétima?',
        options: [
          { id: 'A', label: '3 notas', isCorrect: false },
          { id: 'B', label: '4 notas', isCorrect: true, explanation: 'Um acorde de sétima tem 4 notas: 1ª, 3ª, 5ª e 7ª.' },
          { id: 'C', label: '5 notas', isCorrect: false },
          { id: 'D', label: '6 notas', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      },
      {
        question: 'Qual acorde de sétima cria mais tensão?',
        options: [
          { id: 'A', label: 'Maior 7', isCorrect: false },
          { id: 'B', label: 'Dominante 7', isCorrect: true, explanation: 'O acorde dominante 7 cria mais tensão e quer resolver.' },
          { id: 'C', label: 'Menor 7', isCorrect: false },
          { id: 'D', label: 'Meio-diminuto', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      },
      {
        question: 'Qual é a progressão mais comum no jazz?',
        options: [
          { id: 'A', label: 'I-IV-V-I', isCorrect: false },
          { id: 'B', label: 'II-V-I', isCorrect: true, explanation: 'A progressão II-V-I é a mais comum no jazz.' },
          { id: 'C', label: 'I-VI-IV-V', isCorrect: false },
          { id: 'D', label: 'I-V-IV-I', isCorrect: false }
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