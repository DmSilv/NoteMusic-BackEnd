const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../../src/models/Module');
const Quiz = require('../../src/models/Quiz');

// Conectar ao banco
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic';
    console.log(`🔌 Conectando ao MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');
    
    // Verificar informações da conexão
    const connection = mongoose.connection;
    console.log(`📊 Database: ${connection.db.databaseName}`);
    console.log(`🌐 Host: ${connection.host}`);
    console.log(`🔌 Port: ${connection.port}`);
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
};

const checkDatabaseConnection = async () => {
  try {
    console.log('🔍 VERIFICAÇÃO DE CONEXÃO E DADOS');
    console.log('=' .repeat(60));

    // 1. Contar módulos
    const totalModules = await Module.countDocuments();
    console.log(`📚 Total de módulos: ${totalModules}`);

    // 2. Contar quizzes
    const totalQuizzes = await Quiz.countDocuments();
    console.log(`🎯 Total de quizzes: ${totalQuizzes}`);

    // 3. Contar perguntas
    const totalQuestions = await Quiz.aggregate([
      { $project: { questionCount: { $size: "$questions" } } },
      { $group: { _id: null, total: { $sum: "$questionCount" } } }
    ]);
    console.log(`❓ Total de perguntas: ${totalQuestions[0]?.total || 0}`);

    // 4. Listar os primeiros 5 módulos
    console.log('\n📋 PRIMEIROS 5 MÓDULOS:');
    console.log('-' .repeat(40));
    
    const modules = await Module.find({}).sort({ createdAt: -1 }).limit(5);
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title}`);
      console.log(`   ID: ${module._id}`);
      console.log(`   Nível: ${module.level}`);
      console.log(`   Criado: ${module.createdAt}`);
      console.log('');
    });

    // 5. Verificar se há módulos com títulos específicos
    console.log('\n🔍 VERIFICAÇÃO DE MÓDULOS ESPECÍFICOS:');
    console.log('-' .repeat(40));
    
    const specificModules = [
      'Propriedades do Som - Os Pilares da Música',
      'Notas Musicais e Solfejo - O ABC da Música',
      'Pauta Musical e Claves - Onde Escrevemos a Música',
      'Harmonia Avançada - A Orquestração Completa',
      'Contraponto - A Arte da Voz Independente'
    ];
    
    for (const title of specificModules) {
      const module = await Module.findOne({ title });
      if (module) {
        console.log(`✅ Encontrado: ${title}`);
        console.log(`   ID: ${module._id}`);
        console.log(`   Nível: ${module.level}`);
        console.log(`   Criado: ${module.createdAt}`);
      } else {
        console.log(`❌ NÃO encontrado: ${title}`);
      }
    }

    // 6. Verificar se há módulos duplicados
    console.log('\n🔍 VERIFICAÇÃO DE DUPLICATAS:');
    console.log('-' .repeat(40));
    
    const duplicateTitles = await Module.aggregate([
      { $group: { _id: "$title", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicateTitles.length > 0) {
      console.log('❌ Módulos duplicados encontrados:');
      duplicateTitles.forEach(dup => {
        console.log(`   - ${dup._id}: ${dup.count} ocorrências`);
      });
    } else {
      console.log('✅ Nenhum módulo duplicado encontrado');
    }

    // 7. Verificar se há módulos com diferentes datas de criação
    console.log('\n📅 VERIFICAÇÃO DE DATAS DE CRIAÇÃO:');
    console.log('-' .repeat(40));
    
    const creationDates = await Module.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    creationDates.forEach(date => {
      console.log(`📅 ${date._id}: ${date.count} módulos`);
    });

    console.log('\n🎉 VERIFICAÇÃO CONCLUÍDA!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  connectDB().then(checkDatabaseConnection);
}

module.exports = { checkDatabaseConnection };



