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

// Conteúdo completo de teoria musical por níveis
const musicalContent = {
  // NÍVEL APRENDIZ - Fundamentos
  aprendiz: [
    {
      title: 'Propriedades do Som - Os Pilares da Música',
      description: 'Descubra as quatro propriedades fundamentais que definem cada som musical',
      category: 'propriedades-som',
      level: 'aprendiz',
      order: 1,
      points: 50,
      content: {
        theory: 'Todo som musical possui quatro propriedades essenciais: Altura (grave/agudo), Timbre (qualidade sonora), Intensidade (forte/fraco) e Duração (longo/curto).',
        examples: [
          { title: 'Altura', description: 'Dó é mais grave que Sol - como a diferença entre voz de homem e mulher' },
          { title: 'Timbre', description: 'Violino vs Piano - mesmo Dó, sons diferentes' },
          { title: 'Intensidade', description: 'Forte (f) vs Piano (p) - como gritar vs sussurrar' },
          { title: 'Duração', description: 'Semibreve vs Colcheia - como uma palavra longa vs curta' }
        ]
      },
      questions: [
        {
          question: '🎵 Qual das propriedades do som determina se uma nota é grave ou aguda?',
          options: [
            { id: 'A', label: 'Timbre', isCorrect: false },
            { id: 'B', label: 'Altura', isCorrect: true },
            { id: 'C', label: 'Intensidade', isCorrect: false },
            { id: 'D', label: 'Duração', isCorrect: false }
          ],
          explanation: 'A altura é a propriedade que determina se um som é grave (baixo) ou agudo (alto). É como a diferença entre a voz de um homem (grave) e de uma mulher (aguda).',
          difficulty: 'facil',
          points: 10
        },
        {
          question: '🎹 Se você toca a mesma nota Dó no piano e no violino, qual propriedade será diferente?',
          options: [
            { id: 'A', label: 'Altura', isCorrect: false },
            { id: 'B', label: 'Timbre', isCorrect: true },
            { id: 'C', label: 'Intensidade', isCorrect: false },
            { id: 'D', label: 'Duração', isCorrect: false }
          ],
          explanation: 'O timbre é a "cor" do som. Mesmo tocando a mesma nota, cada instrumento tem seu timbre característico - é por isso que reconhecemos se é piano ou violino.',
          difficulty: 'facil',
          points: 10
        },
        {
          question: '🔊 Qual símbolo musical indica que devemos tocar "bem baixinho"?',
          options: [
            { id: 'A', label: 'f (forte)', isCorrect: false },
            { id: 'B', label: 'p (piano)', isCorrect: true },
            { id: 'C', label: 'mf (mezzo forte)', isCorrect: false },
            { id: 'D', label: 'ff (fortíssimo)', isCorrect: false }
          ],
          explanation: 'O "p" significa piano (suave em italiano). A sequência é: pp (pianíssimo), p (piano), mp (mezzo piano), mf (mezzo forte), f (forte), ff (fortíssimo).',
          difficulty: 'medio',
          points: 15
        },
        {
          question: '⏱️ Qual propriedade do som está relacionada ao tempo que a nota dura?',
          options: [
            { id: 'A', label: 'Altura', isCorrect: false },
            { id: 'B', label: 'Timbre', isCorrect: false },
            { id: 'C', label: 'Intensidade', isCorrect: false },
            { id: 'D', label: 'Duração', isCorrect: true }
          ],
          explanation: 'A duração determina quanto tempo uma nota deve ser sustentada. Uma semibreve dura 4 tempos, uma colcheia dura meio tempo.',
          difficulty: 'facil',
          points: 10
        },
        {
          question: '🎼 Se você está tocando "piano" e quer ficar "forte", que símbolo usa?',
          options: [
            { id: 'A', label: 'Crescendo (<)', isCorrect: true },
            { id: 'B', label: 'Diminuendo (>)', isCorrect: false },
            { id: 'C', label: 'Forte (f)', isCorrect: false },
            { id: 'D', label: 'Piano (p)', isCorrect: false }
          ],
          explanation: 'O crescendo (<) indica aumento gradual da intensidade. É como dizer "vamos ficando mais forte aos poucos".',
          difficulty: 'medio',
          points: 15
        }
      ]
    }
  ]
};

const populateDatabase = async () => {
  try {
    console.log('🚀 Iniciando população do banco com conteúdo musical completo...\n');

    // Limpar dados existentes
    await Module.deleteMany({});
    await Quiz.deleteMany({});
    console.log('🧹 Dados antigos removidos\n');

    // Processar cada nível
    for (const [level, modules] of Object.entries(musicalContent)) {
      console.log(`📚 Processando nível: ${level.toUpperCase()}`);
      
      for (const moduleData of modules) {
        // Criar módulo
        const module = await Module.create(moduleData);
        console.log(`   ✅ Módulo criado: ${moduleData.title}`);

        // Criar quiz para o módulo
        const quiz = await Quiz.create({
          title: `Quiz - ${moduleData.title}`,
          description: `Teste seus conhecimentos sobre ${moduleData.title.toLowerCase()}`,
          moduleId: module._id,
          questions: moduleData.questions,
          level: moduleData.level,
          type: 'module',
          timeLimit: 600, // 10 minutos
          passingScore: 70,
          attempts: 3,
          totalAttempts: 0,
          averageScore: 0
        });
        console.log(`   ✅ Quiz criado com ${moduleData.questions.length} perguntas`);
      }
      console.log('');
    }

    console.log('🎉 População concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   📚 Módulos criados: ${await Module.countDocuments()}`);
    console.log(`   🎯 Quizzes criados: ${await Quiz.countDocuments()}`);
    console.log(`   ❓ Total de perguntas: ${await Quiz.aggregate([
      { $unwind: '$questions' },
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0)}`);

  } catch (error) {
    console.error('❌ Erro durante a população:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(populateDatabase);
}

module.exports = { musicalContent, populateDatabase };



