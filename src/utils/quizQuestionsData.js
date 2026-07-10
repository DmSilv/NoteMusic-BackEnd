/**
 * Banco pedagógico de quizzes — múltipla escolha em texto.
 *
 * Níveis do app: aprendiz (iniciante) | virtuoso (intermediário) | maestro (avançado)
 * Vinculação: moduleTitle (seed) ou moduleTitles (aliases do banco expandido)
 *
 * Campos extras (habilidade, referenciaTeorica) documentados em comentários —
 * o schema MongoDB usa: question, options[], category, difficulty, points.
 */

const quizQuestionsData = [
  // ─── APRENDIZ (iniciante) ───────────────────────────────────────────────

  {
    moduleTitle: 'As 7 Notas Musicais',
    moduleTitles: ['Notas Musicais - Fundamentos', 'Notação Musical Básica'],
    level: 'aprendiz',
    // habilidade: nomes das notas | leitura de pauta (clave de sol)
    questions: [
      {
        question: 'Quantas notas musicais formam a escala natural básica (Dó a Si)?',
        options: [
          { id: 'A', label: '5 notas', isCorrect: false },
          { id: 'B', label: '6 notas', isCorrect: false },
          { id: 'C', label: '7 notas', isCorrect: true, explanation: 'A escala natural básica tem 7 notas: Dó, Ré, Mi, Fá, Sol, Lá e Si.' },
          { id: 'D', label: '8 notas', isCorrect: false }
        ],
        category: 'solfegio-basico',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual nota vem imediatamente depois de Dó na escala natural?',
        options: [
          { id: 'A', label: 'Si', isCorrect: false },
          { id: 'B', label: 'Ré', isCorrect: true, explanation: 'Na escala natural, a sequência ascendente após Dó é Ré.' },
          { id: 'C', label: 'Mi', isCorrect: false },
          { id: 'D', label: 'Lá', isCorrect: false }
        ],
        category: 'solfegio-basico',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual nota vem imediatamente antes de Si na escala natural?',
        options: [
          { id: 'A', label: 'Sol', isCorrect: false },
          { id: 'B', label: 'Lá', isCorrect: true, explanation: 'Na escala natural, Lá vem imediatamente antes de Si.' },
          { id: 'C', label: 'Fá', isCorrect: false },
          { id: 'D', label: 'Ré', isCorrect: false }
        ],
        category: 'solfegio-basico',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  {
    moduleTitle: 'Figuras de Valor - Duração das Notas',
    moduleTitles: ['Figuras Rítmicas - Introdução', 'Duração do Som - Fundamentos'],
    level: 'aprendiz',
    // habilidade: figuras rítmicas e duração
    questions: [
      {
        question: 'Qual figura musical dura 4 tempos no compasso 4/4?',
        options: [
          { id: 'A', label: 'Semibreve', isCorrect: true, explanation: 'A semibreve dura 4 tempos — é a figura de maior duração no sistema básico.' },
          { id: 'B', label: 'Mínima', isCorrect: false },
          { id: 'C', label: 'Semínima', isCorrect: false },
          { id: 'D', label: 'Colcheia', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Quantas semínimas cabem no valor de uma semibreve?',
        options: [
          { id: 'A', label: '2 semínimas', isCorrect: false },
          { id: 'B', label: '3 semínimas', isCorrect: false },
          { id: 'C', label: '4 semínimas', isCorrect: true, explanation: 'Uma semibreve vale 4 tempos; cada semínima vale 1 tempo. Portanto, cabem 4 semínimas.' },
          { id: 'D', label: '8 semínimas', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual figura musical vale metade de uma semínima?',
        options: [
          { id: 'A', label: 'Mínima', isCorrect: false },
          { id: 'B', label: 'Colcheia', isCorrect: true, explanation: 'A colcheia vale metade da semínima: se a semínima vale 1 tempo, a colcheia vale meio tempo.' },
          { id: 'C', label: 'Semicolcheia', isCorrect: false },
          { id: 'D', label: 'Semibreve', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  {
    moduleTitle: 'Compasso Simples - 2/4, 3/4, 4/4',
    moduleTitles: ['Compassos Simples - Binários e Ternários', 'Fórmulas de Compasso - Introdução'],
    level: 'aprendiz',
    // habilidade: compasso simples
    questions: [
      {
        question: 'No compasso 4/4, o que o número superior indica?',
        options: [
          { id: 'A', label: '4 compassos na música', isCorrect: false },
          { id: 'B', label: '4 tempos por compasso', isCorrect: true, explanation: 'No compasso 4/4, o número de cima indica que há 4 tempos em cada compasso.' },
          { id: 'C', label: '4 notas por compasso', isCorrect: false },
          { id: 'D', label: '4 instrumentos tocando', isCorrect: false }
        ],
        category: 'compasso-simples',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual compasso é tradicionalmente usado na valsa?',
        options: [
          { id: 'A', label: '2/4', isCorrect: false },
          { id: 'B', label: '3/4', isCorrect: true, explanation: 'A valsa usa o compasso 3/4, com três tempos por compasso e acento no primeiro tempo.' },
          { id: 'C', label: '4/4', isCorrect: false },
          { id: 'D', label: '6/8', isCorrect: false }
        ],
        category: 'compasso-simples',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'No compasso 4/4, em qual tempo costuma cair o acento principal?',
        options: [
          { id: 'A', label: 'Tempo 2', isCorrect: false },
          { id: 'B', label: 'Tempo 3', isCorrect: false },
          { id: 'C', label: 'Tempo 1', isCorrect: true, explanation: 'No compasso 4/4, o tempo 1 recebe o acento principal (batida forte).' },
          { id: 'D', label: 'Tempo 4', isCorrect: false }
        ],
        category: 'compasso-simples',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  {
    moduleTitle: 'Dinâmica Musical - Forte e Piano',
    moduleTitles: ['Intensidade Sonora - Fundamentos'],
    level: 'aprendiz',
    // habilidade: dinâmica básica
    questions: [
      {
        question: 'O que indica o símbolo "f" na partitura?',
        options: [
          { id: 'A', label: 'Tocar rápido', isCorrect: false },
          { id: 'B', label: 'Tocar forte (alto)', isCorrect: true, explanation: '"f" significa forte — o trecho deve ser tocado com volume alto.' },
          { id: 'C', label: 'Tocar lento', isCorrect: false },
          { id: 'D', label: 'Tocar suave', isCorrect: false }
        ],
        category: 'andamento-dinamica',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'O que indica o símbolo "p" na partitura?',
        options: [
          { id: 'A', label: 'Tocar forte', isCorrect: false },
          { id: 'B', label: 'Tocar piano (suave)', isCorrect: true, explanation: '"p" significa piano — o trecho deve ser tocado com volume baixo.' },
          { id: 'C', label: 'Tocar rápido', isCorrect: false },
          { id: 'D', label: 'Tocar lento', isCorrect: false }
        ],
        category: 'andamento-dinamica',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'O que significa "mf" em dinâmica musical?',
        options: [
          { id: 'A', label: 'Muito forte', isCorrect: false },
          { id: 'B', label: 'Mezzo-forte (médio-forte)', isCorrect: true, explanation: '"mf" significa mezzo-forte — volume médio-alto, entre piano e forte.' },
          { id: 'C', label: 'Muito suave', isCorrect: false },
          { id: 'D', label: 'Mezzo-piano', isCorrect: false }
        ],
        category: 'andamento-dinamica',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  {
    moduleTitle: 'Sustenido e Bemol - Acidentes',
    moduleTitles: ['Tons e Semitons - Conceitos'],
    level: 'aprendiz',
    // habilidade: acidentes musicais
    questions: [
      {
        question: 'O que o símbolo ♯ (sustenido) faz com uma nota?',
        options: [
          { id: 'A', label: 'Abaixa meio tom', isCorrect: false },
          { id: 'B', label: 'Sobe meio tom', isCorrect: true, explanation: 'O sustenido eleva a nota em meio tom, tornando-a mais aguda.' },
          { id: 'C', label: 'Dobra a duração da nota', isCorrect: false },
          { id: 'D', label: 'Cancela o acidente anterior', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'O que o símbolo ♭ (bemol) faz com uma nota?',
        options: [
          { id: 'A', label: 'Sobe meio tom', isCorrect: false },
          { id: 'B', label: 'Abaixa meio tom', isCorrect: true, explanation: 'O bemol abaixa a nota em meio tom, tornando-a mais grave.' },
          { id: 'C', label: 'Mantém a nota natural', isCorrect: false },
          { id: 'D', label: 'Aumenta o volume', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Para que serve o becquadro (♮) na partitura?',
        options: [
          { id: 'A', label: 'Tornar a nota sustenida', isCorrect: false },
          { id: 'B', label: 'Cancelar um acidente e voltar à nota natural', isCorrect: true, explanation: 'O becquadro cancela um sustenido ou bemol anterior, restaurando a nota natural.' },
          { id: 'C', label: 'Indicar pausa', isCorrect: false },
          { id: 'D', label: 'Indicar repetição', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  {
    moduleTitle: 'Claves Musicais - Introdução',
    level: 'aprendiz',
    questions: [
      {
        question: 'Para que serve uma clave musical na pauta?',
        options: [
          { id: 'A', label: 'Indicar o andamento da música', isCorrect: false },
          { id: 'B', label: 'Definir qual nota corresponde às linhas e espaços da pauta', isCorrect: true, explanation: 'A clave indica a altura das notas — define qual nota cada linha ou espaço representa.' },
          { id: 'C', label: 'Mostrar a intensidade do som', isCorrect: false },
          { id: 'D', label: 'Marcar repetições de compasso', isCorrect: false }
        ],
        category: 'solfegio-basico',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual clave é mais usada para instrumentos agudos como violino e flauta?',
        options: [
          { id: 'A', label: 'Clave de Fá', isCorrect: false },
          { id: 'B', label: 'Clave de Dó', isCorrect: false },
          { id: 'C', label: 'Clave de Sol', isCorrect: true, explanation: 'A clave de Sol é a mais comum para instrumentos de registro agudo, como violino e flauta.' },
          { id: 'D', label: 'Clave de Ut', isCorrect: false }
        ],
        category: 'solfegio-basico',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Na clave de Sol, qual nota fica na segunda linha da pauta?',
        options: [
          { id: 'A', label: 'Sol', isCorrect: true, explanation: 'Na clave de Sol, a segunda linha da pauta representa a nota Sol.' },
          { id: 'B', label: 'Fá', isCorrect: false },
          { id: 'C', label: 'Ré', isCorrect: false },
          { id: 'D', label: 'Lá', isCorrect: false }
        ],
        category: 'solfegio-basico',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  {
    moduleTitle: 'Altura do Som - Fundamentos',
    level: 'aprendiz',
    questions: [
      {
        question: 'O que determina se um som é grave ou agudo?',
        options: [
          { id: 'A', label: 'A velocidade do som', isCorrect: false },
          { id: 'B', label: 'A frequência do som', isCorrect: true, explanation: 'Quanto maior a frequência, mais agudo é o som; quanto menor, mais grave.' },
          { id: 'C', label: 'A intensidade do som', isCorrect: false },
          { id: 'D', label: 'O tempo de duração', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual destas opções representa a nota mais aguda?',
        options: [
          { id: 'A', label: 'Dó central', isCorrect: false },
          { id: 'B', label: 'Lá grave', isCorrect: false },
          { id: 'C', label: 'Sol, mais agudo que Dó central', isCorrect: true, explanation: 'Sol em registro mais agudo soa acima de Dó central — é a opção mais aguda entre as listadas.' },
          { id: 'D', label: 'Mi grave', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Como chamamos a propriedade do som que nos permite distinguir um som grave de um agudo?',
        options: [
          { id: 'A', label: 'Timbre', isCorrect: false },
          { id: 'B', label: 'Altura', isCorrect: true, explanation: 'A altura é a propriedade que diferencia sons graves dos agudos.' },
          { id: 'C', label: 'Volume', isCorrect: false },
          { id: 'D', label: 'Duração', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  // ─── VIRTUOSO (intermediário) ───────────────────────────────────────────

  {
    moduleTitle: 'Escala Maior - A Fórmula Mágica',
    moduleTitles: ['Escalas Maiores - Todas as Tonalidades', 'Escalas Maiores - Dó, Sol, Fá'],
    level: 'virtuoso',
    // habilidade: escalas maiores e armaduras
    questions: [
      {
        question: 'Qual é a sequência de intervalos que forma uma escala maior?',
        options: [
          { id: 'A', label: 'T-T-S-T-T-T-S', isCorrect: true, explanation: 'A escala maior segue: Tom-Tom-Semiton-Tom-Tom-Tom-Semiton (T = tom, S = semitom).' },
          { id: 'B', label: 'T-S-T-T-S-T-T', isCorrect: false },
          { id: 'C', label: 'S-T-T-S-T-T-T', isCorrect: false },
          { id: 'D', label: 'T-T-T-S-T-T-S', isCorrect: false }
        ],
        category: 'escalas-maiores',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Uma música em Sol maior possui qual acidente na armadura de clave?',
        options: [
          { id: 'A', label: 'Fá sustenido', isCorrect: true, explanation: 'A tonalidade de Sol maior possui um sustenido na armadura: Fá sustenido.' },
          { id: 'B', label: 'Si bemol', isCorrect: false },
          { id: 'C', label: 'Dó sustenido', isCorrect: false },
          { id: 'D', label: 'Mi bemol', isCorrect: false }
        ],
        category: 'escalas-maiores',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Quantos acidentes possui a armadura de clave de Dó maior?',
        options: [
          { id: 'A', label: 'Nenhum acidente', isCorrect: true, explanation: 'Dó maior não possui acidentes na armadura — todas as notas são naturais.' },
          { id: 'B', label: '1 sustenido', isCorrect: false },
          { id: 'C', label: '2 sustenidos', isCorrect: false },
          { id: 'D', label: '1 bemol', isCorrect: false }
        ],
        category: 'escalas-maiores',
        difficulty: 'medio',
        points: 15
      }
    ]
  },

  {
    moduleTitle: 'Intervalos Musicais - Distâncias',
    moduleTitles: ['Intervalos Musicais - Classificação Completa', 'Tons e Semitons - Aplicação Prática'],
    level: 'virtuoso',
    // habilidade: intervalos
    questions: [
      {
        question: 'Qual é o intervalo entre as notas Dó e Mi?',
        options: [
          { id: 'A', label: 'Segunda', isCorrect: false },
          { id: 'B', label: 'Terça', isCorrect: true, explanation: 'De Dó até Mi há três graus diatônicos (Dó-Ré-Mi), formando um intervalo de terça.' },
          { id: 'C', label: 'Quarta', isCorrect: false },
          { id: 'D', label: 'Quinta', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Qual é o intervalo entre as notas Dó e Sol?',
        options: [
          { id: 'A', label: 'Quarta', isCorrect: false },
          { id: 'B', label: 'Quinta', isCorrect: true, explanation: 'De Dó até Sol há cinco graus diatônicos, formando um intervalo de quinta justa.' },
          { id: 'C', label: 'Sexta', isCorrect: false },
          { id: 'D', label: 'Sétima', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Qual destes intervalos é uma terça consonante na música tonal?',
        options: [
          { id: 'A', label: 'Segunda menor', isCorrect: false },
          { id: 'B', label: 'Terça maior', isCorrect: true, explanation: 'A terça maior é um intervalo consonante — soa estável na música tonal.' },
          { id: 'C', label: 'Sétima menor', isCorrect: false },
          { id: 'D', label: 'Segunda aumentada', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'medio',
        points: 15
      }
    ]
  },

  {
    moduleTitle: 'Acordes Básicos - Tríades',
    moduleTitles: ['Tríades - Aumentadas e Diminutas', 'Formação de Acordes - Tétrades'],
    level: 'virtuoso',
    // habilidade: tríades
    questions: [
      {
        question: 'Qual é a principal diferença entre tríade aumentada e tríade diminuta?',
        options: [
          { id: 'A', label: 'Aumentada tem quinta aumentada; diminuta tem terça e quinta menores', isCorrect: true, explanation: 'Na tríade aumentada a quinta é aumentada; na diminuta, terça e quinta são menores.' },
          { id: 'B', label: 'Aumentada tem quatro notas; diminuta tem três', isCorrect: false },
          { id: 'C', label: 'Aumentada é sempre maior que diminuta em volume', isCorrect: false },
          { id: 'D', label: 'Não há diferença prática entre elas', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'O acorde formado pelas notas Dó-Mi-Sol é de qual tipo?',
        options: [
          { id: 'A', label: 'Tríade maior', isCorrect: true, explanation: 'Dó-Mi-Sol é uma tríade maior: terça maior (Dó-Mi) e quinta justa (Dó-Sol).' },
          { id: 'B', label: 'Tríade menor', isCorrect: false },
          { id: 'C', label: 'Tríade diminuta', isCorrect: false },
          { id: 'D', label: 'Tríade aumentada', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Qual intervalo entre a tônica e a terça define uma tríade menor?',
        options: [
          { id: 'A', label: 'Terça maior', isCorrect: false },
          { id: 'B', label: 'Terça menor', isCorrect: true, explanation: 'Na tríade menor, a terça acima da tônica é menor (3 semitons), conferindo sonoridade mais fechada.' },
          { id: 'C', label: 'Quarta justa', isCorrect: false },
          { id: 'D', label: 'Quinta aumentada', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'medio',
        points: 15
      }
    ]
  },

  {
    moduleTitle: 'Síncopa - Ritmo Deslocado',
    moduleTitles: ['Pulsação e Tempo - Subdivisões', 'Pulsação e Tempo - Fundamentos'],
    level: 'virtuoso',
    // habilidade: síncopa e ritmo
    questions: [
      {
        question: 'O que é síncopa na música?',
        options: [
          { id: 'A', label: 'Acento deslocado para um tempo fraco', isCorrect: true, explanation: 'Síncopa ocorre quando o acento cai em tempo normalmente fraco, deslocando a pulsação esperada.' },
          { id: 'B', label: 'Mudança de tonalidade', isCorrect: false },
          { id: 'C', label: 'Repetição de um compasso', isCorrect: false },
          { id: 'D', label: 'Aumento gradual de volume', isCorrect: false }
        ],
        category: 'sincopa-contratempo',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'Em um compasso 4/4, a síncopa costuma deslocar o acento para:',
        options: [
          { id: 'A', label: 'O tempo 1', isCorrect: false },
          { id: 'B', label: 'Tempos fracos ou subdivisões entre os tempos', isCorrect: true, explanation: 'A síncopa desloca o acento para tempos fracos (2, 3, 4) ou para o "e" entre os tempos.' },
          { id: 'C', label: 'O final da peça', isCorrect: false },
          { id: 'D', label: 'A armadura de clave', isCorrect: false }
        ],
        category: 'sincopa-contratempo',
        difficulty: 'medio',
        points: 15
      },
      {
        question: 'A síncopa é comum em quais estilos musicais?',
        options: [
          { id: 'A', label: 'Apenas música erudita do século XVIII', isCorrect: false },
          { id: 'B', label: 'Jazz, samba, bossa nova e funk', isCorrect: true, explanation: 'A síncopa é amplamente usada em jazz, samba, bossa nova e funk para criar groove e swing.' },
          { id: 'C', label: 'Apenas música coral sem ritmo', isCorrect: false },
          { id: 'D', label: 'Somente escalas cromáticas', isCorrect: false }
        ],
        category: 'sincopa-contratempo',
        difficulty: 'medio',
        points: 15
      }
    ]
  },

  // ─── MAESTRO (avançado) ─────────────────────────────────────────────────

  {
    moduleTitle: 'Modulação - Mudança de Tonalidade',
    moduleTitles: ['Funções Harmônicas - Substituições', 'Cadências - Deceptiva e Suspensiva'],
    moduleLevels: ['virtuoso'],
    level: 'maestro',
    // habilidade: modulação
    questions: [
      {
        question: 'O que é modulação musical?',
        options: [
          { id: 'A', label: 'Mudança de tonalidade dentro da mesma peça', isCorrect: true, explanation: 'Modulação é a passagem de uma tonalidade para outra no decorrer da música.' },
          { id: 'B', label: 'Mudança de instrumento no meio da obra', isCorrect: false },
          { id: 'C', label: 'Repetição do mesmo acorde', isCorrect: false },
          { id: 'D', label: 'Aumento de velocidade', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      },
      {
        question: 'Um acorde que pertence a duas tonalidades e facilita a transição entre elas é chamado de:',
        options: [
          { id: 'A', label: 'Acorde pivô', isCorrect: true, explanation: 'O acorde pivô é comum a duas tonalidades e serve de ponte na modulação.' },
          { id: 'B', label: 'Acorde diminuto', isCorrect: false },
          { id: 'C', label: 'Acorde de passagem', isCorrect: false },
          { id: 'D', label: 'Acorde de grau II', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      },
      {
        question: 'A modulação de Dó maior para Sol maior é um exemplo de modulação:',
        options: [
          { id: 'A', label: 'Para a dominante (tom vizinho)', isCorrect: true, explanation: 'Sol maior é a dominante de Dó maior — modulação para o tom da dominante é muito comum.' },
          { id: 'B', label: 'Cromática distante sem relação', isCorrect: false },
          { id: 'C', label: 'Apenas de compasso', isCorrect: false },
          { id: 'D', label: 'De dinâmica', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      }
    ]
  },

  {
    moduleTitle: 'Acordes de Sétima - Harmonia Avançada',
    moduleTitles: ['Harmonia Avançada'],
    level: 'maestro',
    // habilidade: acordes de sétima e cadências
    questions: [
      {
        question: 'Quantas notas formam um acorde de sétima?',
        options: [
          { id: 'A', label: '3 notas', isCorrect: false },
          { id: 'B', label: '4 notas', isCorrect: true, explanation: 'O acorde de sétima adiciona a 7ª à tríade: tônica, terça, quinta e sétima.' },
          { id: 'C', label: '5 notas', isCorrect: false },
          { id: 'D', label: '6 notas', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      },
      {
        question: 'Qual tipo de acorde de sétima cria maior tensão harmônica e tende a resolver na tônica?',
        options: [
          { id: 'A', label: 'Maior com sétima maior', isCorrect: false },
          { id: 'B', label: 'Dominante com sétima menor (V7)', isCorrect: true, explanation: 'O acorde dominante 7 (V7) cria tensão forte e resolve naturalmente para a tônica (I).' },
          { id: 'C', label: 'Menor com sétima menor', isCorrect: false },
          { id: 'D', label: 'Tríade maior simples', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      },
      {
        question: 'Em uma cadência perfeita na tonalidade de Dó maior, quais graus costumam aparecer no final da frase?',
        options: [
          { id: 'A', label: 'V - I', isCorrect: true, explanation: 'A cadência perfeita (autêntica) vai do acorde dominante (V) para a tônica (I), ex.: Sol7 → Dó.' },
          { id: 'B', label: 'IV - I', isCorrect: false },
          { id: 'C', label: 'II - V', isCorrect: false },
          { id: 'D', label: 'VI - IV', isCorrect: false }
        ],
        category: 'expressao-musical',
        difficulty: 'dificil',
        points: 20
      }
    ]
  },

  {
    moduleTitle: 'Compasso Composto - 6/8, 9/8, 12/8',
    moduleTitles: ['Compassos Compostos - Aplicação', 'Compassos Compostos - Introdução'],
    moduleLevels: ['virtuoso', 'aprendiz'],
    level: 'maestro',
    // habilidade: compasso composto
    questions: [
      {
        question: 'O compasso 6/8 pertence a qual categoria?',
        options: [
          { id: 'A', label: 'Compasso simples', isCorrect: false },
          { id: 'B', label: 'Compasso composto', isCorrect: true, explanation: '6/8 é compasso composto: cada tempo é dividido em três partes (subdivisão ternária).' },
          { id: 'C', label: 'Compasso livre', isCorrect: false },
          { id: 'D', label: 'Compasso irregular', isCorrect: false }
        ],
        category: 'compasso-composto',
        difficulty: 'dificil',
        points: 20
      },
      {
        question: 'No compasso 6/8, quantos grupos de três colcheias formam os tempos principais?',
        options: [
          { id: 'A', label: '1 grupo', isCorrect: false },
          { id: 'B', label: '2 grupos', isCorrect: true, explanation: '6/8 tem 6 colcheias por compasso, agrupadas em 2 tempos de 3 colcheias cada (1-2-3, 4-5-6).' },
          { id: 'C', label: '3 grupos', isCorrect: false },
          { id: 'D', label: '4 grupos', isCorrect: false }
        ],
        category: 'compasso-composto',
        difficulty: 'dificil',
        points: 20
      },
      {
        question: 'Qual é a principal diferença entre compasso simples e compasso composto?',
        options: [
          { id: 'A', label: 'O compasso simples usa subdivisão binária; o composto usa ternária', isCorrect: true, explanation: 'No simples, cada tempo divide em 2; no composto, cada tempo divide em 3 (ex.: 6/8, 9/8).' },
          { id: 'B', label: 'O compasso simples não tem acentos', isCorrect: false },
          { id: 'C', label: 'O compasso composto não usa colcheias', isCorrect: false },
          { id: 'D', label: 'Não há diferença prática', isCorrect: false }
        ],
        category: 'compasso-composto',
        difficulty: 'dificil',
        points: 20
      }
    ]
  },

  {
    moduleTitle: 'Pauta Musical - Introdução',
    level: 'aprendiz',
    questions: [
      {
        question: 'O que são as linhas suplementares na pauta musical?',
        options: [
          { id: 'A', label: 'Linhas extras desenhadas acima ou abaixo da pauta para notas muito agudas ou graves', isCorrect: true, explanation: 'Linhas suplementares estendem a pauta quando as notas ficam fora das 5 linhas padrão.' },
          { id: 'B', label: 'Linhas que indicam mudança de compasso', isCorrect: false },
          { id: 'C', label: 'Linhas que mostram a dinâmica', isCorrect: false },
          { id: 'D', label: 'Linhas que marcam repetições', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Em qual direção lemos as notas na pauta musical?',
        options: [
          { id: 'A', label: 'De cima para baixo', isCorrect: false },
          { id: 'B', label: 'Da esquerda para a direita', isCorrect: true, explanation: 'A leitura musical segue o tempo: da esquerda para a direita na pauta.' },
          { id: 'C', label: 'Da direita para a esquerda', isCorrect: false },
          { id: 'D', label: 'De baixo para cima', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Na clave de sol, qual nota ocupa o primeiro espaço da pauta (de baixo para cima)?',
        options: [
          { id: 'A', label: 'Fá', isCorrect: true, explanation: 'O primeiro espaço da pauta na clave de sol corresponde à nota Fá.' },
          { id: 'B', label: 'Mi', isCorrect: false },
          { id: 'C', label: 'Lá', isCorrect: false },
          { id: 'D', label: 'Ré', isCorrect: false }
        ],
        category: 'figuras-musicais',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  {
    moduleTitle: 'Propriedades do Som',
    level: 'aprendiz',
    questions: [
      {
        question: 'Qual propriedade do som determina se uma nota é grave ou aguda?',
        options: [
          { id: 'A', label: 'Timbre', isCorrect: false },
          { id: 'B', label: 'Altura', isCorrect: true, explanation: 'A altura indica se o som é grave (baixo) ou agudo (alto).' },
          { id: 'C', label: 'Intensidade', isCorrect: false },
          { id: 'D', label: 'Duração', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Se a mesma nota é tocada no piano e no violino, qual propriedade diferencia os dois sons?',
        options: [
          { id: 'A', label: 'Altura', isCorrect: false },
          { id: 'B', label: 'Timbre', isCorrect: true, explanation: 'O timbre é a "cor" do som — cada instrumento tem timbre característico.' },
          { id: 'C', label: 'Compasso', isCorrect: false },
          { id: 'D', label: 'Armadura de clave', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual propriedade do som está relacionada ao tempo que a nota dura?',
        options: [
          { id: 'A', label: 'Intensidade', isCorrect: false },
          { id: 'B', label: 'Duração', isCorrect: true, explanation: 'A duração define quanto tempo a nota é sustentada (semibreve, semínima, etc.).' },
          { id: 'C', label: 'Altura', isCorrect: false },
          { id: 'D', label: 'Timbre', isCorrect: false }
        ],
        category: 'propriedades-som',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  {
    moduleTitle: 'Tríades - Maiores e Menores',
    level: 'aprendiz',
    questions: [
      {
        question: 'Quantas notas formam uma tríade?',
        options: [
          { id: 'A', label: '2 notas', isCorrect: false },
          { id: 'B', label: '3 notas', isCorrect: true, explanation: 'Tríade = três notas: tônica, terça e quinta.' },
          { id: 'C', label: '4 notas', isCorrect: false },
          { id: 'D', label: '5 notas', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'O acorde Dó-Mi-Sol é de qual tipo?',
        options: [
          { id: 'A', label: 'Tríade maior', isCorrect: true, explanation: 'Dó-Mi-Sol tem terça maior e quinta justa — tríade maior.' },
          { id: 'B', label: 'Tríade menor', isCorrect: false },
          { id: 'C', label: 'Tríade diminuta', isCorrect: false },
          { id: 'D', label: 'Tríade aumentada', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Qual tríade costuma soar mais melancólica?',
        options: [
          { id: 'A', label: 'Tríade maior', isCorrect: false },
          { id: 'B', label: 'Tríade menor', isCorrect: true, explanation: 'A tríade menor tem terça menor e costuma transmitir sonoridade mais fechada.' },
          { id: 'C', label: 'Tríade aumentada', isCorrect: false },
          { id: 'D', label: 'Tríade duplicada', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'facil',
        points: 10
      }
    ]
  },

  {
    moduleTitle: 'Cadências - Autêntica e Plagal',
    level: 'aprendiz',
    questions: [
      {
        question: 'O que é uma cadência na música?',
        options: [
          { id: 'A', label: 'Uma sequência de notas ascendentes', isCorrect: false },
          { id: 'B', label: 'Um final de frase que dá sensação de conclusão ou repouso', isCorrect: true, explanation: 'Cadência é a progressão harmônica que encerra uma frase musical com sensação de fechamento.' },
          { id: 'C', label: 'Uma mudança de instrumento', isCorrect: false },
          { id: 'D', label: 'Um aumento gradual de velocidade', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'A cadência mais comum no final de hinos e corais transmite sensação de:',
        options: [
          { id: 'A', label: 'Suspense e continuação', isCorrect: false },
          { id: 'B', label: 'Repouso e conclusão', isCorrect: true, explanation: 'A cadência final costuma dar sensação de que a frase ou a música chegou ao fim.' },
          { id: 'C', label: 'Mudança de tonalidade', isCorrect: false },
          { id: 'D', label: 'Aumento de volume', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'facil',
        points: 10
      },
      {
        question: 'Na música, o acorde que costuma "preparar o final" de uma frase é geralmente:',
        options: [
          { id: 'A', label: 'O primeiro acorde da música', isCorrect: false },
          { id: 'B', label: 'O penúltimo acorde, antes do acorde final', isCorrect: true, explanation: 'O penúltimo acorde prepara a resolução para o acorde final, criando sensação de conclusão.' },
          { id: 'C', label: 'Sempre o mesmo em todas as músicas', isCorrect: false },
          { id: 'D', label: 'O acorde mais grave da peça', isCorrect: false }
        ],
        category: 'intervalos-musicais',
        difficulty: 'facil',
        points: 10
      }
    ]
  }
];

/** Perguntas do desafio diário — mix pedagógico iniciante/intermediário */
const dailyChallengeQuestions = [
  {
    question: 'Na clave de sol, qual nota fica na segunda linha da pauta?',
    options: [
      { id: 'A', label: 'Sol', isCorrect: true, explanation: 'Na clave de sol, a segunda linha representa a nota Sol.' },
      { id: 'B', label: 'Fá', isCorrect: false },
      { id: 'C', label: 'Ré', isCorrect: false },
      { id: 'D', label: 'Lá', isCorrect: false }
    ],
    category: 'solfegio-basico',
    difficulty: 'facil',
    points: 10
  },
  {
    question: 'Qual figura musical dura 4 tempos no compasso 4/4?',
    options: [
      { id: 'A', label: 'Semibreve', isCorrect: true, explanation: 'A semibreve vale 4 tempos no compasso 4/4.' },
      { id: 'B', label: 'Mínima', isCorrect: false },
      { id: 'C', label: 'Semínima', isCorrect: false },
      { id: 'D', label: 'Colcheia', isCorrect: false }
    ],
    category: 'figuras-musicais',
    difficulty: 'facil',
    points: 10
  },
  {
    question: 'Qual é o intervalo entre as notas Dó e Sol?',
    options: [
      { id: 'A', label: 'Quarta', isCorrect: false },
      { id: 'B', label: 'Quinta', isCorrect: true, explanation: 'Dó-Sol é um intervalo de quinta justa.' },
      { id: 'C', label: 'Terça', isCorrect: false },
      { id: 'D', label: 'Sexta', isCorrect: false }
    ],
    category: 'intervalos-musicais',
    difficulty: 'medio',
    points: 15
  },
  {
    question: 'Uma música em Sol maior possui qual acidente na armadura de clave?',
    options: [
      { id: 'A', label: 'Fá sustenido', isCorrect: true, explanation: 'Sol maior tem Fá sustenido na armadura.' },
      { id: 'B', label: 'Si bemol', isCorrect: false },
      { id: 'C', label: 'Dó sustenido', isCorrect: false },
      { id: 'D', label: 'Mi bemol', isCorrect: false }
    ],
    category: 'escalas-maiores',
    difficulty: 'medio',
    points: 15
  },
  {
    question: 'O que indica o símbolo "p" na partitura?',
    options: [
      { id: 'A', label: 'Tocar forte', isCorrect: false },
      { id: 'B', label: 'Tocar piano (suave)', isCorrect: true, explanation: '"p" indica piano — tocar com volume baixo.' },
      { id: 'C', label: 'Tocar rápido', isCorrect: false },
      { id: 'D', label: 'Pausa', isCorrect: false }
    ],
    category: 'andamento-dinamica',
    difficulty: 'facil',
    points: 10
  }
];

module.exports = {
  quizQuestionsData,
  dailyChallengeQuestions
};
