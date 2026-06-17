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

// Forçar reset completo do banco
const forceDatabaseReset = async () => {
  try {
    console.log('🔥 FORÇANDO RESET COMPLETO DO BANCO DE DADOS');
    console.log('=' .repeat(60));

    // 1. DROPAR TODAS AS COLEÇÕES
    console.log('\n🗑️ 1. REMOVENDO TODAS AS COLEÇÕES:');
    console.log('-' .repeat(40));
    
    await Quiz.collection.drop().catch(() => console.log('   ℹ️ Coleção Quiz já estava vazia'));
    await Module.collection.drop().catch(() => console.log('   ℹ️ Coleção Module já estava vazia'));
    
    console.log('✅ Todas as coleções removidas');

    // 2. CRIAR NOVOS MÓDULOS COM DADOS FRESCOS
    console.log('\n📚 2. CRIANDO MÓDULOS NOVOS:');
    console.log('-' .repeat(40));
    
    const modules = [
      // APRENDIZ - 8 módulos
      { 
        title: 'Propriedades do Som', 
        description: 'Aprenda sobre frequência, timbre, intensidade e duração', 
        category: 'propriedades-som', 
        level: 'aprendiz', 
        order: 1, 
        points: 50, 
        duration: 15, 
        content: { 
          theory: 'O som possui quatro propriedades principais: altura, timbre, intensidade e duração.',
          examples: [
            { title: 'Altura', description: 'Frequência das ondas sonoras', imageUrl: '', audioUrl: '' },
            { title: 'Timbre', description: 'Característica única de cada instrumento', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Identificar propriedades', description: 'Exercício prático', type: 'pratica' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Notas Musicais', 
        description: 'Domine as 7 notas musicais e o solfejo básico', 
        category: 'solfegio-basico', 
        level: 'aprendiz', 
        order: 2, 
        points: 50, 
        duration: 20, 
        content: { 
          theory: 'As sete notas musicais formam a base da música ocidental.',
          examples: [
            { title: 'Dó', description: 'Primeira nota da escala', imageUrl: '', audioUrl: '' },
            { title: 'Ré', description: 'Segunda nota da escala', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Solfejo básico', description: 'Cantar as notas', type: 'pratica' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Pauta Musical', 
        description: 'Entenda a pauta musical e os diferentes tipos de claves', 
        category: 'solfegio-basico', 
        level: 'aprendiz', 
        order: 3, 
        points: 50, 
        duration: 18, 
        content: { 
          theory: 'A pauta musical é formada por 5 linhas e 4 espaços.',
          examples: [
            { title: 'Clave de Sol', description: 'Para instrumentos agudos', imageUrl: '', audioUrl: '' },
            { title: 'Clave de Fá', description: 'Para instrumentos graves', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Leitura de pauta', description: 'Identificar notas', type: 'teoria' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Figuras de Valor', 
        description: 'Aprenda sobre semibreve, mínima, semínima e outras figuras', 
        category: 'figuras-musicais', 
        level: 'aprendiz', 
        order: 4, 
        points: 50, 
        duration: 25, 
        content: { 
          theory: 'As figuras musicais representam a duração das notas.',
          examples: [
            { title: 'Semibreve', description: '4 tempos', imageUrl: '', audioUrl: '' },
            { title: 'Mínima', description: '2 tempos', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Contagem rítmica', description: 'Praticar valores', type: 'pratica' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Compassos Simples', 
        description: 'Domine os compassos 2/4, 3/4 e 4/4', 
        category: 'compasso-simples', 
        level: 'aprendiz', 
        order: 5, 
        points: 50, 
        duration: 22, 
        content: { 
          theory: 'O compasso divide a música em unidades regulares de tempo.',
          examples: [
            { title: '4/4', description: 'Compasso mais comum', imageUrl: '', audioUrl: '' },
            { title: '3/4', description: 'Compasso de valsa', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Bater compasso', description: 'Praticar divisões', type: 'pratica' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Escalas Maiores', 
        description: 'Aprenda a construir escalas maiores e suas fórmulas', 
        category: 'escalas-maiores', 
        level: 'aprendiz', 
        order: 6, 
        points: 50, 
        duration: 30, 
        content: { 
          theory: 'A escala maior é formada pela sequência tom-tom-semitom-tom-tom-tom-semitom.',
          examples: [
            { title: 'Dó Maior', description: 'Escala sem acidentes', imageUrl: '', audioUrl: '' },
            { title: 'Sol Maior', description: 'Escala com 1 sustenido', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Construir escalas', description: 'Aplicar fórmula', type: 'teoria' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Dinâmica Musical', 
        description: 'Entenda os sinais de dinâmica e expressão', 
        category: 'andamento-dinamica', 
        level: 'aprendiz', 
        order: 7, 
        points: 50, 
        duration: 15, 
        content: { 
          theory: 'A dinâmica musical controla o volume e a intensidade.',
          examples: [
            { title: 'Forte (f)', description: 'Volume alto', imageUrl: '', audioUrl: '' },
            { title: 'Piano (p)', description: 'Volume baixo', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Aplicar dinâmica', description: 'Praticar volumes', type: 'pratica' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Acidentes Musicais', 
        description: 'Domine os acidentes e suas funções', 
        category: 'figuras-musicais', 
        level: 'aprendiz', 
        order: 8, 
        points: 50, 
        duration: 20, 
        content: { 
          theory: 'Os acidentes alteram a altura das notas.',
          examples: [
            { title: 'Sustenido (#)', description: 'Eleva a nota', imageUrl: '', audioUrl: '' },
            { title: 'Bemol (b)', description: 'Abaixa a nota', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Aplicar acidentes', description: 'Modificar notas', type: 'teoria' }
          ]
        }, 
        isActive: true 
      },

      // VIRTUOSO - 6 módulos
      { 
        title: 'Escalas Menores', 
        description: 'Aprenda escalas menores naturais, harmônicas e melódicas', 
        category: 'escalas-maiores', 
        level: 'virtuoso', 
        order: 1, 
        points: 75, 
        duration: 35, 
        content: { 
          theory: 'As escalas menores têm três formas: natural, harmônica e melódica.',
          examples: [
            { title: 'Menor Natural', description: 'Forma básica', imageUrl: '', audioUrl: '' },
            { title: 'Menor Harmônica', description: 'Com 7ª elevada', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Construir escalas menores', description: 'Aplicar fórmulas', type: 'teoria' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Intervalos Musicais', 
        description: 'Domine intervalos consonantes e dissonantes', 
        category: 'intervalos-musicais', 
        level: 'virtuoso', 
        order: 2, 
        points: 75, 
        duration: 40, 
        content: { 
          theory: 'Intervalo é a distância entre duas notas.',
          examples: [
            { title: 'Uníssono', description: 'Mesma nota', imageUrl: '', audioUrl: '' },
            { title: 'Oitava', description: '8 notas de distância', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Identificar intervalos', description: 'Praticar distâncias', type: 'audicao' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Acordes Básicos', 
        description: 'Aprenda tríades maiores, menores e diminutas', 
        category: 'intervalos-musicais', 
        level: 'virtuoso', 
        order: 3, 
        points: 75, 
        duration: 45, 
        content: { 
          theory: 'Acorde é a combinação simultânea de três ou mais notas.',
          examples: [
            { title: 'Tríade Maior', description: 'Tônica, 3ª maior, 5ª justa', imageUrl: '', audioUrl: '' },
            { title: 'Tríade Menor', description: 'Tônica, 3ª menor, 5ª justa', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Construir acordes', description: 'Aplicar intervalos', type: 'teoria' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Modos Gregos', 
        description: 'Explore os 7 modos gregos e suas características', 
        category: 'escalas-maiores', 
        level: 'virtuoso', 
        order: 4, 
        points: 75, 
        duration: 50, 
        content: { 
          theory: 'Os modos gregos são escalas derivadas da escala maior.',
          examples: [
            { title: 'Jônio', description: 'Modo maior natural', imageUrl: '', audioUrl: '' },
            { title: 'Dórico', description: 'Modo menor com 6ª maior', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Aplicar modos', description: 'Criar atmosferas', type: 'pratica' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Síncopa e Contratempo', 
        description: 'Domine ritmos sincopados e contratempos', 
        category: 'sincopa-contratempo', 
        level: 'virtuoso', 
        order: 5, 
        points: 75, 
        duration: 30, 
        content: { 
          theory: 'Síncopa é o deslocamento do acento rítmico.',
          examples: [
            { title: 'Síncopa', description: 'Acento em tempo fraco', imageUrl: '', audioUrl: '' },
            { title: 'Contratempo', description: 'Pausa em tempo forte', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Praticar síncopa', description: 'Deslocar acentos', type: 'pratica' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Articulação Musical', 
        description: 'Aprenda staccato, legato, portato e outras articulações', 
        category: 'articulacao-musical', 
        level: 'virtuoso', 
        order: 6, 
        points: 75, 
        duration: 25, 
        content: { 
          theory: 'Articulação é a forma como as notas são executadas.',
          examples: [
            { title: 'Staccato', description: 'Notas separadas', imageUrl: '', audioUrl: '' },
            { title: 'Legato', description: 'Notas ligadas', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Aplicar articulações', description: 'Variar execução', type: 'pratica' }
          ]
        }, 
        isActive: true 
      },

      // MAESTRO - 5 módulos
      { 
        title: 'Harmonia Avançada', 
        description: 'Domine acordes de sétima, nona e extensões', 
        category: 'expressao-musical', 
        level: 'maestro', 
        order: 1, 
        points: 100, 
        duration: 60, 
        content: { 
          theory: 'Harmonia avançada inclui acordes de sétima e extensões.',
          examples: [
            { title: 'Acorde de 7ª', description: '4 notas simultâneas', imageUrl: '', audioUrl: '' },
            { title: 'Acorde de 9ª', description: '5 notas simultâneas', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Construir harmonia', description: 'Aplicar extensões', type: 'teoria' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Contraponto', 
        description: 'Aprenda as regras do contraponto e fuga', 
        category: 'expressao-musical', 
        level: 'maestro', 
        order: 2, 
        points: 100, 
        duration: 70, 
        content: { 
          theory: 'Contraponto é a arte de combinar melodias independentes.',
          examples: [
            { title: 'Cânone', description: 'Imitação rigorosa', imageUrl: '', audioUrl: '' },
            { title: 'Fuga', description: 'Forma contrapontística', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Escrever contraponto', description: 'Criar linhas independentes', type: 'teoria' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Orquestração', 
        description: 'Aprenda a orquestrar para diferentes instrumentos', 
        category: 'compasso-composto', 
        level: 'maestro', 
        order: 3, 
        points: 100, 
        duration: 80, 
        content: { 
          theory: 'Orquestração é a arte de distribuir material musical.',
          examples: [
            { title: 'Seções orquestrais', description: 'Cordas, madeiras, metais', imageUrl: '', audioUrl: '' },
            { title: 'Tessitura', description: 'Registro de cada instrumento', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Orquestrar peça', description: 'Distribuir vozes', type: 'pratica' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Compasso Composto', 
        description: 'Domine os compassos compostos e suas subdivisões', 
        category: 'compasso-composto', 
        level: 'maestro', 
        order: 4, 
        points: 100, 
        duration: 40, 
        content: { 
          theory: 'Compassos compostos têm subdivisão ternária.',
          examples: [
            { title: '6/8', description: 'Compasso composto binário', imageUrl: '', audioUrl: '' },
            { title: '9/8', description: 'Compasso composto ternário', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Bater compasso composto', description: 'Praticar subdivisões', type: 'pratica' }
          ]
        }, 
        isActive: true 
      },
      { 
        title: 'Modulação', 
        description: 'Aprenda a modular entre diferentes tonalidades', 
        category: 'expressao-musical', 
        level: 'maestro', 
        order: 5, 
        points: 100, 
        duration: 55, 
        content: { 
          theory: 'Modulação é a mudança de tonalidade durante uma peça musical.',
          examples: [
            { title: 'Modulação direta', description: 'Mudança abrupta', imageUrl: '', audioUrl: '' },
            { title: 'Modulação gradual', description: 'Transição suave', imageUrl: '', audioUrl: '' }
          ],
          exercises: [
            { title: 'Criar modulações', description: 'Mudar tonalidades', type: 'teoria' }
          ]
        }, 
        isActive: true 
      }
    ];

    const createdModules = await Module.insertMany(modules);
    console.log(`✅ ${createdModules.length} módulos criados`);

    // 3. CRIAR QUIZZES COM 7 PERGUNTAS CADA
    console.log('\n🎯 3. CRIANDO QUIZZES COM 7 PERGUNTAS CADA:');
    console.log('-' .repeat(40));
    
    const quizzes = [];
    
    createdModules.forEach(module => {
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

    // 4. VERIFICAR RESULTADO
    console.log('\n📊 4. VERIFICAÇÃO FINAL:');
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

    console.log('\n🎉 RESET FORÇADO CONCLUÍDO!');
    console.log('=' .repeat(60));
    console.log('✅ Agora você tem:');
    console.log(`   - ${totalModules} módulos distribuídos em 3 níveis`);
    console.log(`   - ${totalQuizzes} quizzes com perguntas estruturadas`);
    console.log(`   - ${totalQuestions[0]?.total || 0} perguntas no total`);
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante o reset:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Gerar 7 perguntas específicas para cada módulo
const generateQuestionsForModule = (module) => {
  const questions = [];
  
  for (let i = 1; i <= 7; i++) {
    questions.push({
      question: `Pergunta ${i} sobre ${module.title}: Qual é a característica principal deste módulo?`,
      options: [
        { id: 'A', label: 'Conceitos básicos de música', isCorrect: module.level === 'aprendiz', explanation: 'Módulos de nível Aprendiz focam em conceitos básicos.' },
        { id: 'B', label: 'Técnicas intermediárias', isCorrect: module.level === 'virtuoso', explanation: 'Módulos de nível Virtuoso desenvolvem técnicas intermediárias.' },
        { id: 'C', label: 'Conceitos avançados', isCorrect: module.level === 'maestro', explanation: 'Módulos de nível Maestro abordam conceitos avançados.' },
        { id: 'D', label: 'Improvisação livre', isCorrect: false, explanation: 'Este módulo não foca em improvisação livre.' }
      ],
      category: module.category,
      difficulty: module.level === 'aprendiz' ? 'facil' : module.level === 'virtuoso' ? 'medio' : 'dificil',
      points: module.level === 'aprendiz' ? 10 : module.level === 'virtuoso' ? 15 : 20
    });
  }
  
  return questions;
};

if (require.main === module) {
  connectDB().then(forceDatabaseReset);
}

module.exports = { forceDatabaseReset };



