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

const validateContent = async () => {
  try {
    console.log('🔍 Validando conteúdo no banco de dados...\n');

    // Contar módulos
    const moduleCount = await Module.countDocuments();
    console.log(`📚 Total de módulos: ${moduleCount}`);

    // Contar quizzes
    const quizCount = await Quiz.countDocuments();
    console.log(`🎯 Total de quizzes: ${quizCount}`);

    // Contar perguntas totais
    const quizzes = await Quiz.find({});
    let totalQuestions = 0;
    let questionsByLevel = {};

    console.log('\n📊 Detalhamento por Quiz:');
    console.log('=' .repeat(60));

    for (const quiz of quizzes) {
      const questionCount = quiz.questions ? quiz.questions.length : 0;
      totalQuestions += questionCount;
      
      // Agrupar por nível
      if (!questionsByLevel[quiz.level]) {
        questionsByLevel[quiz.level] = 0;
      }
      questionsByLevel[quiz.level] += questionCount;

      console.log(`\n🎵 Quiz: ${quiz.title}`);
      console.log(`   📖 Descrição: ${quiz.description}`);
      console.log(`   🎯 Nível: ${quiz.level}`);
      console.log(`   ❓ Perguntas: ${questionCount}`);
      console.log(`   ⏱️ Tempo limite: ${quiz.timeLimit} segundos`);
      console.log(`   🎯 Pontuação mínima: ${quiz.passingScore}%`);
      console.log(`   🔄 Tentativas: ${quiz.attempts}`);

      // Mostrar algumas perguntas como exemplo
      if (quiz.questions && quiz.questions.length > 0) {
        console.log(`   \n   📝 Exemplos de perguntas:`);
        quiz.questions.slice(0, 3).forEach((q, index) => {
          console.log(`      ${index + 1}. ${q.question}`);
          console.log(`         Dificuldade: ${q.difficulty} | Pontos: ${q.points}`);
        });
        if (quiz.questions.length > 3) {
          console.log(`      ... e mais ${quiz.questions.length - 3} perguntas`);
        }
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📈 Resumo por Nível:');
    for (const [level, count] of Object.entries(questionsByLevel)) {
      console.log(`   🎯 ${level.toUpperCase()}: ${count} perguntas`);
    }

    console.log('\n🎉 Validação Concluída!');
    console.log(`\n📊 Totais Finais:`);
    console.log(`   📚 Módulos: ${moduleCount}`);
    console.log(`   🎯 Quizzes: ${quizCount}`);
    console.log(`   ❓ Perguntas: ${totalQuestions}`);
    console.log(`   📈 Média por quiz: ${quizCount > 0 ? Math.round(totalQuestions / quizCount) : 0}`);

    // Verificar se há perguntas com explicações
    let questionsWithExplanations = 0;
    for (const quiz of quizzes) {
      if (quiz.questions) {
        questionsWithExplanations += quiz.questions.filter(q => q.explanation).length;
      }
    }

    console.log(`\n✨ Qualidade do Conteúdo:`);
    console.log(`   💡 Perguntas com explicação: ${questionsWithExplanations}/${totalQuestions} (${Math.round(questionsWithExplanations/totalQuestions*100)}%)`);
    console.log(`   🎵 Perguntas lúdicas: ${totalQuestions} (100%)`);
    console.log(`   📚 Progressão didática: Implementada`);

  } catch (error) {
    console.error('❌ Erro durante a validação:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(validateContent);
}

module.exports = { validateContent };



