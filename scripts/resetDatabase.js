const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../src/models/Module');
const Quiz = require('../src/models/Quiz');
const User = require('../src/models/User');

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

// Limpar o banco de dados
const resetDatabase = async () => {
  try {
    console.log('🔄 Iniciando processo de reset do banco de dados...');
    
    // Remover apenas os dados de módulos e quizzes
    // (mantendo usuários e apenas limpando suas referências a módulos/quizzes)
    await Module.deleteMany({});
    await Quiz.deleteMany({});
    
    // Atualizar usuários - limpar referências a módulos e quizzes
    await User.updateMany({}, {
      $set: {
        completedModules: [],
        completedQuizzes: [],
        quizAttempts: []
      }
    });
    
    console.log('✅ Banco de dados limpo com sucesso! Usuários mantidos, mas progresso resetado.');
    return true;
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    return false;
  }
};

// Estrutura de conteúdo musical por níveis e categorias
const musicalContent = {
  // NÍVEL APRENDIZ - Fundamentos da Música
  aprendiz: [
    {
      title: 'Propriedades do Som',
      description: 'Compreenda as quatro propriedades fundamentais que caracterizam cada som musical',
      category: 'propriedades-som',
      level: 'aprendiz',
      order: 1,
      points: 50,
      content: {
        theory: 'Todo som musical possui quatro propriedades essenciais que determinam suas características:\n\n1. Altura: determina se um som é grave ou agudo, relacionada à frequência das ondas sonoras\n2. Timbre: qualidade sonora que diferencia instrumentos mesmo tocando a mesma nota\n3. Intensidade: volume do som (forte ou fraco)\n4. Duração: tempo que o som permanece audível',
        examples: [
          { 
            title: 'Altura', 
            description: 'Notas graves (como Dó2) têm frequências mais baixas, enquanto notas agudas (como Dó5) têm frequências mais altas' 
          },
          { 
            title: 'Timbre', 
            description: 'É possível distinguir um violino de um piano mesmo tocando a mesma nota devido ao timbre característico' 
          },
          { 
            title: 'Intensidade', 
            description: 'Na partitura, indicações como pp (pianíssimo) ou ff (fortíssimo) indicam a intensidade' 
          },
          { 
            title: 'Duração', 
            description: 'Representada por figuras musicais como semibreve (4 tempos), mínima (2 tempos), semínima (1 tempo)' 
          }
        ]
      },
      questions: [
        {
          question: 'Qual propriedade do som determina se uma nota é grave ou aguda?',
          options: [
            { id: 'A', label: 'Intensidade', isCorrect: false },
            { id: 'B', label: 'Altura', isCorrect: true },
            { id: 'C', label: 'Timbre', isCorrect: false },
            { id: 'D', label: 'Duração', isCorrect: false }
          ],
          explanation: 'A altura é a propriedade relacionada à frequência da onda sonora e determina se um som é percebido como grave (baixa frequência) ou agudo (alta frequência).',
          difficulty: 'facil',
          points: 10
        },
        {
          question: 'O que diferencia o som de um violino e um piano tocando a mesma nota?',
          options: [
            { id: 'A', label: 'Altura', isCorrect: false },
            { id: 'B', label: 'Duração', isCorrect: false },
            { id: 'C', label: 'Timbre', isCorrect: true },
            { id: 'D', label: 'Intensidade', isCorrect: false }
          ],
          explanation: 'O timbre é a "cor do som" que permite identificar a fonte sonora. Mesmo quando dois instrumentos tocam a mesma nota (mesma altura), seus timbres diferentes permitem que os distinguamos.',
          difficulty: 'facil',
          points: 10
        },
        {
          question: 'Qual símbolo musical indica que uma nota deve ser tocada com pouca intensidade?',
          options: [
            { id: 'A', label: 'p (piano)', isCorrect: true },
            { id: 'B', label: 'f (forte)', isCorrect: false },
            { id: 'C', label: 'a (alto)', isCorrect: false },
            { id: 'D', label: 'm (mezzo)', isCorrect: false }
          ],
          explanation: 'O símbolo "p" vem do italiano "piano" e indica que a nota deve ser tocada suavemente, com pouca intensidade.',
          difficulty: 'medio',
          points: 15
        },
        {
          question: 'Qual figura musical representa a maior duração em um compasso simples?',
          options: [
            { id: 'A', label: 'Semínima', isCorrect: false },
            { id: 'B', label: 'Mínima', isCorrect: false },
            { id: 'C', label: 'Semibreve', isCorrect: true },
            { id: 'D', label: 'Colcheia', isCorrect: false }
          ],
          explanation: 'A semibreve é a figura de maior duração, valendo 4 tempos em um compasso simples quaternário.',
          difficulty: 'facil',
          points: 10
        },
        {
          question: 'O que significa o símbolo de crescendo (<) na partitura?',
          options: [
            { id: 'A', label: 'Diminuir gradualmente a intensidade', isCorrect: false },
            { id: 'B', label: 'Aumentar gradualmente a intensidade', isCorrect: true },
            { id: 'C', label: 'Aumentar gradualmente a altura', isCorrect: false },
            { id: 'D', label: 'Diminuir gradualmente o andamento', isCorrect: false }
          ],
          explanation: 'O crescendo (<) indica que o músico deve aumentar gradualmente a intensidade do som, indo do mais suave para o mais forte.',
          difficulty: 'medio',
          points: 15
        }
      ]
    },
    {
      title: 'Notação Musical Básica',
      description: 'Aprenda a ler e escrever os símbolos básicos utilizados na música ocidental',
      category: 'figuras-musicais',
      level: 'aprendiz',
      order: 2,
      points: 50,
      content: {
        theory: 'A notação musical é o sistema de escrita que representa graficamente os sons musicais. Os elementos básicos incluem o pentagrama (pauta musical), as notas musicais, as claves, as figuras de duração e os compassos.',
        examples: [
          { 
            title: 'Pentagrama', 
            description: 'Conjunto de cinco linhas e quatro espaços onde as notas são escritas' 
          },
          { 
            title: 'Clave de Sol', 
            description: 'Determina que a nota Sol está localizada na segunda linha do pentagrama' 
          },
          { 
            title: 'Figuras de duração', 
            description: 'Semibreve (4 tempos), mínima (2 tempos), semínima (1 tempo), colcheia (1/2 tempo)' 
          }
        ]
      },
      questions: [
        {
          question: 'Quantas linhas possui um pentagrama padrão?',
          options: [
            { id: 'A', label: '4 linhas', isCorrect: false },
            { id: 'B', label: '5 linhas', isCorrect: true },
            { id: 'C', label: '6 linhas', isCorrect: false },
            { id: 'D', label: '7 linhas', isCorrect: false }
          ],
          explanation: 'O pentagrama padrão utilizado na notação musical ocidental possui exatamente 5 linhas horizontais paralelas e equidistantes, com 4 espaços entre elas.',
          difficulty: 'facil',
          points: 10
        },
        {
          question: 'Em uma partitura com clave de Sol, onde se localiza a nota Sol?',
          options: [
            { id: 'A', label: 'Na primeira linha', isCorrect: false },
            { id: 'B', label: 'No primeiro espaço', isCorrect: false },
            { id: 'C', label: 'Na segunda linha', isCorrect: true },
            { id: 'D', label: 'No segundo espaço', isCorrect: false }
          ],
          explanation: 'A clave de Sol indica que a nota Sol está localizada na segunda linha do pentagrama. É por isso que o símbolo da clave de Sol circunda esta linha.',
          difficulty: 'medio',
          points: 15
        },
        {
          question: 'Quantos tempos vale uma mínima?',
          options: [
            { id: 'A', label: '1 tempo', isCorrect: false },
            { id: 'B', label: '2 tempos', isCorrect: true },
            { id: 'C', label: '3 tempos', isCorrect: false },
            { id: 'D', label: '4 tempos', isCorrect: false }
          ],
          explanation: 'A mínima vale 2 tempos em um compasso simples. É metade do valor de uma semibreve (4 tempos) e o dobro de uma semínima (1 tempo).',
          difficulty: 'facil',
          points: 10
        },
        {
          question: 'Qual figura musical representa a metade da duração de uma semínima?',
          options: [
            { id: 'A', label: 'Mínima', isCorrect: false },
            { id: 'B', label: 'Colcheia', isCorrect: true },
            { id: 'C', label: 'Semicolcheia', isCorrect: false },
            { id: 'D', label: 'Fusa', isCorrect: false }
          ],
          explanation: 'A colcheia representa metade da duração de uma semínima. Se a semínima vale 1 tempo, a colcheia vale 1/2 tempo.',
          difficulty: 'medio',
          points: 15
        },
        {
          question: 'O que indica a fração 4/4 no início de uma partitura?',
          options: [
            { id: 'A', label: 'O andamento da música', isCorrect: false },
            { id: 'B', label: 'A tonalidade da música', isCorrect: false },
            { id: 'C', label: 'A fórmula de compasso', isCorrect: true },
            { id: 'D', label: 'O número de compassos', isCorrect: false }
          ],
          explanation: 'A fração 4/4 indica a fórmula de compasso, onde o numerador (4) representa o número de tempos por compasso e o denominador (4) indica que a semínima é a unidade de tempo.',
          difficulty: 'medio',
          points: 15
        }
      ]
    }
  ],
  
  // NÍVEL VIRTUOSO - Conhecimentos Intermediários
  virtuoso: [
    {
      title: 'Intervalos Musicais',
      description: 'Compreenda as distâncias entre as notas e como elas afetam a melodia e harmonia',
      category: 'intervalos-musicais',
      level: 'virtuoso',
      order: 1,
      points: 75,
      content: {
        theory: 'Um intervalo musical é a distância entre duas notas. Os intervalos são classificados pela sua distância (2ª, 3ª, 4ª, etc.) e pela sua qualidade (maior, menor, justo, aumentado, diminuto).',
        examples: [
          { 
            title: 'Intervalo de 2ª', 
            description: 'Dó-Ré (2ª maior), Mi-Fá (2ª menor)' 
          },
          { 
            title: 'Intervalo de 3ª', 
            description: 'Dó-Mi (3ª maior), Ré-Fá (3ª menor)' 
          },
          { 
            title: 'Intervalo de 5ª', 
            description: 'Dó-Sol (5ª justa), Si-Fá (5ª diminuta)' 
          }
        ]
      },
      questions: [
        {
          question: 'Qual é o intervalo entre as notas Dó e Mi?',
          options: [
            { id: 'A', label: '2ª maior', isCorrect: false },
            { id: 'B', label: '3ª maior', isCorrect: true },
            { id: 'C', label: '3ª menor', isCorrect: false },
            { id: 'D', label: '4ª justa', isCorrect: false }
          ],
          explanation: 'O intervalo entre Dó e Mi é uma 3ª maior, pois abrange três graus da escala (Dó, Ré, Mi) e contém 2 tons de distância.',
          difficulty: 'medio',
          points: 15
        },
        {
          question: 'Qual intervalo é considerado "consonância perfeita"?',
          options: [
            { id: 'A', label: '2ª maior', isCorrect: false },
            { id: 'B', label: '3ª menor', isCorrect: false },
            { id: 'C', label: '5ª justa', isCorrect: true },
            { id: 'D', label: '7ª maior', isCorrect: false }
          ],
          explanation: 'Os intervalos de uníssono, 4ª justa, 5ª justa e oitava são considerados consonâncias perfeitas, produzindo sons estáveis e agradáveis quando tocados juntos.',
          difficulty: 'medio',
          points: 15
        },
        {
          question: 'Quantos tons tem um intervalo de 3ª menor?',
          options: [
            { id: 'A', label: '1 tom', isCorrect: false },
            { id: 'B', label: '1,5 tons', isCorrect: true },
            { id: 'C', label: '2 tons', isCorrect: false },
            { id: 'D', label: '2,5 tons', isCorrect: false }
          ],
          explanation: 'Um intervalo de 3ª menor contém 1,5 tons (ou 3 semitons). Por exemplo, entre Lá e Dó há 1,5 tons de distância.',
          difficulty: 'dificil',
          points: 20
        },
        {
          question: 'Qual é o intervalo entre as notas Fá e Si?',
          options: [
            { id: 'A', label: '4ª justa', isCorrect: false },
            { id: 'B', label: '4ª aumentada', isCorrect: true },
            { id: 'C', label: '5ª diminuta', isCorrect: false },
            { id: 'D', label: '5ª justa', isCorrect: false }
          ],
          explanation: 'O intervalo entre Fá e Si é uma 4ª aumentada (também conhecido como trítono). Contém 3 tons de distância e é tradicionalmente considerado dissonante.',
          difficulty: 'dificil',
          points: 20
        },
        {
          question: 'Na escala maior, qual é o intervalo formado entre o 1º e o 5º graus?',
          options: [
            { id: 'A', label: '4ª justa', isCorrect: false },
            { id: 'B', label: '5ª diminuta', isCorrect: false },
            { id: 'C', label: '5ª justa', isCorrect: true },
            { id: 'D', label: '5ª aumentada', isCorrect: false }
          ],
          explanation: 'Na escala maior, o intervalo entre o 1º e o 5º graus é sempre uma 5ª justa. Por exemplo, em Dó maior: Dó (1º) e Sol (5º) formam uma 5ª justa.',
          difficulty: 'medio',
          points: 15
        }
      ]
    }
  ],
  
  // NÍVEL MAESTRO - Conhecimentos Avançados
  maestro: [
    {
      title: 'Harmonia Avançada',
      description: 'Explore progressões harmônicas complexas e técnicas de modulação',
      category: 'expressao-musical',
      level: 'maestro',
      order: 1,
      points: 100,
      content: {
        theory: 'A harmonia avançada estuda as relações entre acordes, progressões não-diatônicas, empréstimos modais, modulações e técnicas de rearmonização que expandem as possibilidades expressivas da música.',
        examples: [
          { 
            title: 'Acordes de empréstimo modal', 
            description: 'Uso de acordes de tonalidades paralelas, como um acorde menor IV em uma tonalidade maior' 
          },
          { 
            title: 'Modulação por acorde pivô', 
            description: 'Um acorde comum a duas tonalidades que serve como ponte para a modulação' 
          },
          { 
            title: 'Progressões com substituição tritônica', 
            description: 'Substituição de um acorde dominante pelo acorde localizado um trítono acima' 
          }
        ]
      },
      questions: [
        {
          question: 'O que é uma modulação por acorde pivô?',
          options: [
            { id: 'A', label: 'Uma mudança abrupta de tonalidade sem preparação', isCorrect: false },
            { id: 'B', label: 'Uma modulação que utiliza um acorde comum a duas tonalidades', isCorrect: true },
            { id: 'C', label: 'Uma progressão que retorna à tonalidade original', isCorrect: false },
            { id: 'D', label: 'Uma modulação que usa exclusivamente acordes diminutos', isCorrect: false }
          ],
          explanation: 'A modulação por acorde pivô é uma técnica de transição harmônica que utiliza um acorde comum a duas tonalidades para realizar uma mudança suave de um centro tonal para outro.',
          difficulty: 'dificil',
          points: 20
        },
        {
          question: 'Qual destas é uma característica do empréstimo modal?',
          options: [
            { id: 'A', label: 'Uso exclusivo de acordes da escala maior', isCorrect: false },
            { id: 'B', label: 'Substituição da dominante por um acorde diminuto', isCorrect: false },
            { id: 'C', label: 'Uso de acordes de modos paralelos na mesma tonalidade', isCorrect: true },
            { id: 'D', label: 'Modulação para uma tonalidade distante', isCorrect: false }
          ],
          explanation: 'O empréstimo modal consiste em utilizar acordes derivados de modos paralelos (que compartilham a mesma tônica) dentro de uma tonalidade. Por exemplo, usar o IV menor em uma tonalidade maior (emprestado do modo eólio/menor).',
          difficulty: 'dificil',
          points: 20
        },
        {
          question: 'Qual acorde é a substituição tritônica de G7?',
          options: [
            { id: 'A', label: 'C7', isCorrect: false },
            { id: 'B', label: 'D7', isCorrect: false },
            { id: 'C', label: 'Db7', isCorrect: true },
            { id: 'D', label: 'B7', isCorrect: false }
          ],
          explanation: 'A substituição tritônica substitui um acorde dominante por outro localizado um trítono (3 tons) de distância. O trítono de G é Db, então Db7 é a substituição tritônica de G7. Ambos compartilham as notas guia (terça e sétima).',
          difficulty: 'dificil',
          points: 20
        },
        {
          question: 'Qual progressão representa uma cadência plagal com empréstimo modal em Dó maior?',
          options: [
            { id: 'A', label: 'C - G - C', isCorrect: false },
            { id: 'B', label: 'C - Fm - C', isCorrect: true },
            { id: 'C', label: 'C - G7 - Am', isCorrect: false },
            { id: 'D', label: 'C - Dm - G7 - C', isCorrect: false }
          ],
          explanation: 'Uma cadência plagal é a progressão IV-I. Com empréstimo modal em Dó maior, usamos Fm (iv menor, emprestado do modo eólio) em vez de F (IV maior), resultando na progressão C - Fm - C.',
          difficulty: 'dificil',
          points: 20
        },
        {
          question: 'Qual técnica de harmonização utiliza acordes com notas não pertencentes à escala?',
          options: [
            { id: 'A', label: 'Harmonização diatônica', isCorrect: false },
            { id: 'B', label: 'Paralelismo', isCorrect: false },
            { id: 'C', label: 'Harmonização cromática', isCorrect: true },
            { id: 'D', label: 'Cadência autêntica', isCorrect: false }
          ],
          explanation: 'A harmonização cromática utiliza acordes que contêm notas não pertencentes à escala principal da tonalidade, criando maior tensão harmônica e possibilidades expressivas expandidas.',
          difficulty: 'dificil',
          points: 20
        }
      ]
    }
  ]
};

// Popular o banco de dados com o conteúdo estruturado
const populateDatabase = async () => {
  try {
    console.log('🚀 Iniciando população do banco com conteúdo musical estruturado...\n');
    
    // Para cada nível
    let totalModules = 0;
    let totalQuizzes = 0;
    let totalQuestions = 0;
    
    for (const [level, modules] of Object.entries(musicalContent)) {
      console.log(`📚 Processando nível: ${level.toUpperCase()}`);
      
      for (const moduleData of modules) {
        // Criar módulo
        const moduleDoc = await Module.create({
          title: moduleData.title,
          description: moduleData.description,
          category: moduleData.category,
          level: moduleData.level,
          order: moduleData.order,
          points: moduleData.points,
          content: moduleData.content,
          duration: 30, // Duração padrão em minutos
          isActive: true
        });
        
        totalModules++;
        console.log(`   ✅ Módulo criado: ${moduleData.title}`);

        // Criar quiz para o módulo
        const quizDoc = await Quiz.create({
          title: `Quiz - ${moduleData.title}`,
          description: `Teste seus conhecimentos sobre ${moduleData.title.toLowerCase()}`,
          moduleId: moduleDoc._id,
          questions: moduleData.questions,
          level: moduleData.level,
          category: moduleData.category,
          type: 'module',
          timeLimit: 600, // 10 minutos
          passingScore: 70,
          attempts: 3,
          totalAttempts: 0,
          averageScore: 0,
          isActive: true
        });
        
        totalQuizzes++;
        totalQuestions += moduleData.questions.length;
        
        console.log(`   ✅ Quiz criado com ${moduleData.questions.length} perguntas`);
        
        // Atualizar o módulo com referência ao quiz
        await Module.findByIdAndUpdate(moduleDoc._id, {
          $push: { quizzes: quizDoc._id }
        });
      }
      console.log('');
    }

    console.log('🎉 População concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   📚 Módulos criados: ${totalModules}`);
    console.log(`   🎯 Quizzes criados: ${totalQuizzes}`);
    console.log(`   ❓ Total de perguntas: ${totalQuestions}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    return false;
  }
};

// Criar um desafio diário
const createDailyChallenge = async () => {
  try {
    console.log('🎯 Criando desafio diário...');
    
    // Obter questões aleatórias de quizzes existentes
    const allQuizzes = await Quiz.find({ type: 'module', isActive: true });
    
    if (allQuizzes.length === 0) {
      console.log('❌ Não há quizzes disponíveis para criar o desafio diário');
      return false;
    }
    
    // Coletar questões de todos os quizzes
    let allQuestions = [];
    allQuizzes.forEach(quiz => {
      const quizQuestions = quiz.questions.map(q => ({
        ...q.toObject(),
        sourceQuiz: quiz.title,
        category: q.category || quiz.category
      }));
      allQuestions = [...allQuestions, ...quizQuestions];
    });
    
    // Embaralhar e selecionar 5 questões aleatórias
    allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = allQuestions.slice(0, 5);
    
     // Criar o quiz de desafio diário
     // Primeiro módulo como referência (exigido pelo esquema)
     const refModule = await Module.findOne();
     
     await Quiz.create({
       title: 'Desafio Diário de Teoria Musical',
       description: 'Teste seus conhecimentos musicais com perguntas variadas selecionadas especialmente para hoje!',
       moduleId: refModule._id, // Referência obrigatória a um módulo
       questions: selectedQuestions,
       level: 'aprendiz', // Acessível a todos os níveis
       type: 'daily-challenge',
       timeLimit: 600, // 10 minutos
       passingScore: 60,
       isActive: true
     });
    
    console.log('✅ Desafio diário criado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar desafio diário:', error);
    return false;
  }
};

// Executar o reset e recriação do banco
const main = async () => {
  try {
    await connectDB();
    
    // Perguntar se deseja prosseguir
    console.log('\n⚠️  ATENÇÃO: Esta operação irá RESETAR todo o conteúdo educacional do banco de dados!');
    console.log('Os dados dos usuários serão mantidos, mas seu progresso será resetado.\n');
    
    // O reset requer confirmação manual ao executar o script
    console.log('Para continuar, edite este script e defina CONFIRM_RESET como true');
    
    const CONFIRM_RESET = true; // Altere para true para confirmar o reset
    
    if (!CONFIRM_RESET) {
      console.log('\n❌ Operação cancelada. Nenhuma alteração foi feita.');
      process.exit(0);
    }
    
    // Resetar banco de dados
    const resetSuccess = await resetDatabase();
    if (!resetSuccess) {
      console.error('❌ Falha ao resetar o banco de dados. Operação abortada.');
      process.exit(1);
    }
    
    // Recriar conteúdo
    const populateSuccess = await populateDatabase();
    if (!populateSuccess) {
      console.error('❌ Falha ao popular o banco de dados. Operação parcialmente concluída.');
      process.exit(1);
    }
    
    // Criar desafio diário
    await createDailyChallenge();
    
    console.log('\n✨ Processo concluído com sucesso! O banco de dados foi resetado e populado com novo conteúdo.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
};

// Iniciar o processo
main();
