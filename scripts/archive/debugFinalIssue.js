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

// Debug final do problema
const debugFinalIssue = async () => {
  try {
    console.log('🔍 DEBUG FINAL DO PROBLEMA');
    console.log('=' .repeat(60));

    // 1. Verificar se há múltiplas bases de dados
    console.log('\n📊 1. VERIFICANDO CONEXÃO E BASE DE DADOS:');
    console.log('-' .repeat(40));
    
    const dbName = mongoose.connection.db.databaseName;
    const host = mongoose.connection.host;
    const port = mongoose.connection.port;
    
    console.log(`📊 Nome do banco: ${dbName}`);
    console.log(`📊 Host: ${host}`);
    console.log(`📊 Port: ${port}`);

    // 2. Verificar se há dados antigos ainda no banco
    console.log('\n🔍 2. VERIFICANDO DADOS ANTIGOS:');
    console.log('-' .repeat(40));
    
    const oldTitles = ['As 7 Notas Musicais', 'Figuras de Valor - Duração das Notas', 'Compasso Simples - 2/4, 3/4, 4/4'];
    const oldModules = await Module.find({ title: { $in: oldTitles } });
    
    console.log(`📊 Módulos antigos encontrados: ${oldModules.length}`);
    
    if (oldModules.length > 0) {
      console.log('⚠️ PROBLEMA: Ainda há módulos antigos no banco!');
      oldModules.forEach(module => {
        console.log(`   - ${module.title} (${module.level}) - ID: ${module._id}`);
      });
    }

    // 3. Verificar se há dados novos
    console.log('\n🔍 3. VERIFICANDO DADOS NOVOS:');
    console.log('-' .repeat(40));
    
    const newTitles = ['Propriedades do Som', 'Notas Musicais', 'Pauta Musical'];
    const newModules = await Module.find({ title: { $in: newTitles } });
    
    console.log(`📊 Módulos novos encontrados: ${newModules.length}`);
    
    if (newModules.length > 0) {
      console.log('✅ Dados novos encontrados!');
      newModules.forEach(module => {
        console.log(`   - ${module.title} (${module.level}) - ID: ${module._id}`);
      });
    }

    // 4. Verificar se há problema com isActive
    console.log('\n🔍 4. VERIFICANDO isActive:');
    console.log('-' .repeat(40));
    
    const allModules = await Module.find({});
    const activeCount = allModules.filter(m => m.isActive === true).length;
    const inactiveCount = allModules.filter(m => m.isActive === false).length;
    const undefinedCount = allModules.filter(m => m.isActive === undefined).length;
    
    console.log(`📊 Total de módulos: ${allModules.length}`);
    console.log(`📊 Módulos ativos (isActive: true): ${activeCount}`);
    console.log(`📊 Módulos inativos (isActive: false): ${inactiveCount}`);
    console.log(`📊 Módulos sem isActive: ${undefinedCount}`);

    // 5. Simular exatamente a query da API
    console.log('\n🔍 5. SIMULANDO QUERY DA API:');
    console.log('-' .repeat(40));
    
    const filter = { isActive: true };
    const modules = await Module.find(filter)
      .sort({ order: 1 })
      .select('-content.exercises')
      .lean();

    console.log(`📊 Módulos retornados pela query: ${modules.length}`);
    
    // Listar os módulos retornados
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title} (${module.level}) - ${module.category}`);
    });

    // 6. Verificar se há problema com cache do Mongoose
    console.log('\n🔍 6. VERIFICANDO CACHE DO MONGOOSE:');
    console.log('-' .repeat(40));
    
    // Limpar cache do Mongoose
    mongoose.models = {};
    mongoose.modelSchemas = {};
    
    console.log('✅ Cache do Mongoose limpo');

    // 7. Verificar se há problema com índices
    console.log('\n🔍 7. VERIFICANDO ÍNDICES:');
    console.log('-' .repeat(40));
    
    const indexes = await Module.collection.getIndexes();
    console.log('📊 Índices da coleção Module:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`   - ${indexName}: ${JSON.stringify(indexes[indexName])}`);
    });

    // 8. Forçar uma consulta sem cache
    console.log('\n🔍 8. CONSULTA FORÇADA SEM CACHE:');
    console.log('-' .repeat(40));
    
    const freshModules = await Module.find({})
      .sort({ order: 1 })
      .lean();
    
    console.log(`📊 Módulos encontrados (consulta fresca): ${freshModules.length}`);
    
    // Distribuição por nível
    const modulesByLevel = {};
    freshModules.forEach(module => {
      if (!modulesByLevel[module.level]) {
        modulesByLevel[module.level] = [];
      }
      modulesByLevel[module.level].push(module);
    });

    console.log('\n📈 DISTRIBUIÇÃO POR NÍVEL (consulta fresca):');
    Object.keys(modulesByLevel).forEach(level => {
      console.log(`   🎯 ${level.toUpperCase()}: ${modulesByLevel[level].length} módulos`);
    });

    console.log('\n🎉 DEBUG FINAL CONCLUÍDO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(debugFinalIssue);
}

module.exports = { debugFinalIssue };



