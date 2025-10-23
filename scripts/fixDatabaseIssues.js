const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../src/models/Module');
const Quiz = require('../src/models/Quiz');

const fixDatabaseIssues = async () => {
  try {
    // Conectar ao banco
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');

    console.log('\n🔧 CORRIGINDO PROBLEMAS DO BANCO DE DADOS\n');

    // 1. Corrigir níveis inconsistentes
    console.log('1️⃣ Corrigindo níveis inconsistentes...');
    
    // Dinâmica Musical deve ser virtuoso
    await Module.updateOne(
      { title: 'Dinâmica Musical - Forte e Piano' },
      { level: 'virtuoso' }
    );
    console.log('   ✅ Dinâmica Musical alterado para virtuoso');

    // Síncopa deve ser maestro
    await Module.updateOne(
      { title: 'Síncopa - Ritmo Deslocado' },
      { level: 'maestro' }
    );
    console.log('   ✅ Síncopa alterado para maestro');

    // 2. Criar módulos para categorias vazias
    console.log('\n2️⃣ Criando módulos para categorias vazias...');

    // Propriedades do Som (Aprendiz)
    const propriedadesSom = await Module.create({
      title: 'Propriedades do Som - Altura, Timbre e Intensidade',
      description: 'Aprenda sobre as características fundamentais do som musical',
      category: 'propriedades-som',
      level: 'aprendiz',
      order: 1,
      points: 50,
      content: {
        theory: 'O som possui três propriedades principais: altura (grave/agudo), timbre (qualidade) e intensidade (forte/fraco).',
        examples: [
          { title: 'Altura', description: 'Dó é mais grave que Sol' },
          { title: 'Timbre', description: 'Violino vs Piano' },
          { title: 'Intensidade', description: 'Forte (f) vs Piano (p)' }
        ]
      }
    });
    console.log('   ✅ Módulo "Propriedades do Som" criado');

    // Solfejo Básico (Aprendiz)
    const solfejoBasico = await Module.create({
      title: 'Solfejo Básico - Leitura de Partituras',
      description: 'Desenvolva a leitura musical com solfejo',
      category: 'solfegio-basico',
      level: 'aprendiz',
      order: 2,
      points: 50,
      content: {
        theory: 'Solfejo é a técnica de cantar as notas musicais usando sílabas específicas (Dó, Ré, Mi, Fá, Sol, Lá, Si).',
        examples: [
          { title: 'Escala Maior', description: 'Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó' },
          { title: 'Intervalos', description: 'Dó-Mi (terça), Dó-Sol (quinta)' }
        ]
      }
    });
    console.log('   ✅ Módulo "Solfejo Básico" criado');

    // Articulação Musical (Virtuoso)
    const articulacaoMusical = await Module.create({
      title: 'Articulação Musical - Staccato, Legato e Marcato',
      description: 'Aprenda técnicas de articulação e expressão',
      category: 'articulacao-musical',
      level: 'virtuoso',
      order: 3,
      points: 75,
      content: {
        theory: 'Articulação refere-se à forma como as notas são tocadas: staccato (separado), legato (ligado) e marcato (marcado).',
        examples: [
          { title: 'Staccato', description: 'Notas curtas e separadas' },
          { title: 'Legato', description: 'Notas ligadas suavemente' },
          { title: 'Marcato', description: 'Notas enfatizadas' }
        ]
      }
    });
    console.log('   ✅ Módulo "Articulação Musical" criado');

    // Ritmos Ternários (Virtuoso)
    const ritmoTernarios = await Module.create({
      title: 'Ritmos Ternários - Compassos de 3/8 e 6/8',
      description: 'Explore os compassos ternários e suas aplicações',
      category: 'ritmo-ternarios',
      level: 'virtuoso',
      order: 4,
      points: 75,
      content: {
        theory: 'Ritmos ternários dividem o tempo em grupos de três, criando sensação de balanço e movimento.',
        examples: [
          { title: '3/8', description: 'Três colcheias por compasso' },
          { title: '6/8', description: 'Seis colcheias agrupadas em dois tempos' }
        ]
      }
    });
    console.log('   ✅ Módulo "Ritmos Ternários" criado');

    // 3. Criar quizzes para os novos módulos
    console.log('\n3️⃣ Criando quizzes para os novos módulos...');

    // Quiz para Propriedades do Som
    await Quiz.create({
      title: 'Quiz - Propriedades do Som',
      description: 'Teste seus conhecimentos sobre as propriedades do som',
      moduleId: propriedadesSom._id,
      questions: [
        {
          question: 'Qual das seguintes é uma propriedade do som?',
          options: [
            { id: 'A', label: 'Altura', isCorrect: true },
            { id: 'B', label: 'Cor', isCorrect: false },
            { id: 'C', label: 'Tamanho', isCorrect: false },
            { id: 'D', label: 'Peso', isCorrect: false }
          ],
          category: 'propriedades-som',
          difficulty: 'facil',
          points: 10
        },
        {
          question: 'O que determina se um som é grave ou agudo?',
          options: [
            { id: 'A', label: 'Intensidade', isCorrect: false },
            { id: 'B', label: 'Timbre', isCorrect: false },
            { id: 'C', label: 'Altura', isCorrect: true },
            { id: 'D', label: 'Duração', isCorrect: false }
          ],
          category: 'propriedades-som',
          difficulty: 'facil',
          points: 10
        }
      ],
      level: 'aprendiz',
      type: 'module',
      timeLimit: 300,
      passingScore: 70,
      attempts: 3,
      totalAttempts: 0,
      averageScore: 0
    });
    console.log('   ✅ Quiz "Propriedades do Som" criado');

    // Quiz para Solfejo Básico
    await Quiz.create({
      title: 'Quiz - Solfejo Básico',
      description: 'Teste seus conhecimentos sobre solfejo',
      moduleId: solfejoBasico._id,
      questions: [
        {
          question: 'Qual é a sequência correta do solfejo?',
          options: [
            { id: 'A', label: 'Dó-Ré-Mi-Fá-Sol-Lá-Si', isCorrect: true },
            { id: 'B', label: 'A-B-C-D-E-F-G', isCorrect: false },
            { id: 'C', label: '1-2-3-4-5-6-7', isCorrect: false },
            { id: 'D', label: 'Dó-Mi-Sol-Fá-Lá-Ré-Si', isCorrect: false }
          ],
          category: 'solfegio-basico',
          difficulty: 'facil',
          points: 10
        }
      ],
      level: 'aprendiz',
      type: 'module',
      timeLimit: 300,
      passingScore: 70,
      attempts: 3,
      totalAttempts: 0,
      averageScore: 0
    });
    console.log('   ✅ Quiz "Solfejo Básico" criado');

    // Quiz para Articulação Musical
    await Quiz.create({
      title: 'Quiz - Articulação Musical',
      description: 'Teste seus conhecimentos sobre articulação',
      moduleId: articulacaoMusical._id,
      questions: [
        {
          question: 'O que significa staccato?',
          options: [
            { id: 'A', label: 'Notas ligadas', isCorrect: false },
            { id: 'B', label: 'Notas separadas', isCorrect: true },
            { id: 'C', label: 'Notas enfatizadas', isCorrect: false },
            { id: 'D', label: 'Notas longas', isCorrect: false }
          ],
          category: 'articulacao-musical',
          difficulty: 'medio',
          points: 15
        }
      ],
      level: 'virtuoso',
      type: 'module',
      timeLimit: 300,
      passingScore: 70,
      attempts: 3,
      totalAttempts: 0,
      averageScore: 0
    });
    console.log('   ✅ Quiz "Articulação Musical" criado');

    // Quiz para Ritmos Ternários
    await Quiz.create({
      title: 'Quiz - Ritmos Ternários',
      description: 'Teste seus conhecimentos sobre ritmos ternários',
      moduleId: ritmoTernarios._id,
      questions: [
        {
          question: 'Quantas colcheias tem um compasso de 3/8?',
          options: [
            { id: 'A', label: '2', isCorrect: false },
            { id: 'B', label: '3', isCorrect: true },
            { id: 'C', label: '4', isCorrect: false },
            { id: 'D', label: '6', isCorrect: false }
          ],
          category: 'ritmo-ternarios',
          difficulty: 'medio',
          points: 15
        }
      ],
      level: 'virtuoso',
      type: 'module',
      timeLimit: 300,
      passingScore: 70,
      attempts: 3,
      totalAttempts: 0,
      averageScore: 0
    });
    console.log('   ✅ Quiz "Ritmos Ternários" criado');

    console.log('\n🎉 CORREÇÕES CONCLUÍDAS COM SUCESSO!');
    console.log('\n📊 Resumo das correções:');
    console.log('   ✅ 2 níveis inconsistentes corrigidos');
    console.log('   ✅ 4 módulos criados para categorias vazias');
    console.log('   ✅ 4 quizzes criados para os novos módulos');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

fixDatabaseIssues();







