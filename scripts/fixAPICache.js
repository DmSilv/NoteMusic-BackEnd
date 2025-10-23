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

// Corrigir problema de cache da API
const fixAPICache = async () => {
  try {
    console.log('🔧 CORRIGINDO PROBLEMA DE CACHE DA API');
    console.log('=' .repeat(60));

    // 1. Verificar estado atual
    console.log('\n📊 1. VERIFICANDO ESTADO ATUAL:');
    console.log('-' .repeat(40));
    
    const modules = await Module.find({});
    const quizzes = await Quiz.find({});
    
    console.log(`📚 Total de módulos: ${modules.length}`);
    console.log(`🎯 Total de quizzes: ${quizzes.length}`);
    
    // 2. Modificar todos os módulos para forçar atualização
    console.log('\n🔄 2. FORÇANDO ATUALIZAÇÃO DOS MÓDULOS:');
    console.log('-' .repeat(40));
    
    // Atualizar o campo updatedAt de todos os módulos
    const updateModulesResult = await Module.updateMany(
      {},
      { $set: { updatedAt: new Date() } }
    );
    
    console.log(`✅ ${updateModulesResult.modifiedCount} módulos atualizados`);
    
    // 3. Modificar todos os quizzes para forçar atualização
    console.log('\n🔄 3. FORÇANDO ATUALIZAÇÃO DOS QUIZZES:');
    console.log('-' .repeat(40));
    
    const updateQuizzesResult = await Quiz.updateMany(
      {},
      { $set: { updatedAt: new Date() } }
    );
    
    console.log(`✅ ${updateQuizzesResult.modifiedCount} quizzes atualizados`);
    
    // 4. Verificar se há módulos antigos e remover
    console.log('\n🔍 4. VERIFICANDO MÓDULOS ANTIGOS:');
    console.log('-' .repeat(40));
    
    const oldTitles = ['As 7 Notas Musicais', 'Figuras de Valor - Duração das Notas', 'Compasso Simples - 2/4, 3/4, 4/4'];
    const oldModules = await Module.find({ title: { $in: oldTitles } });
    
    console.log(`📊 Módulos antigos encontrados: ${oldModules.length}`);
    
    if (oldModules.length > 0) {
      console.log('⚠️ Removendo módulos antigos...');
      
      // Remover módulos antigos
      const deleteModulesResult = await Module.deleteMany({ title: { $in: oldTitles } });
      console.log(`✅ ${deleteModulesResult.deletedCount} módulos antigos removidos`);
      
      // Remover quizzes associados
      const oldModuleIds = oldModules.map(m => m._id);
      const deleteQuizzesResult = await Quiz.deleteMany({ moduleId: { $in: oldModuleIds } });
      console.log(`✅ ${deleteQuizzesResult.deletedCount} quizzes antigos removidos`);
    }
    
    // 5. Verificar novamente o estado
    console.log('\n📊 5. VERIFICANDO ESTADO FINAL:');
    console.log('-' .repeat(40));
    
    const finalModules = await Module.find({});
    const finalQuizzes = await Quiz.find({});
    
    console.log(`📚 Total de módulos: ${finalModules.length}`);
    console.log(`🎯 Total de quizzes: ${finalQuizzes.length}`);
    
    // Distribuição por nível
    const modulesByLevel = {};
    finalModules.forEach(module => {
      if (!modulesByLevel[module.level]) {
        modulesByLevel[module.level] = [];
      }
      modulesByLevel[module.level].push(module);
    });
    
    console.log('\n📈 DISTRIBUIÇÃO POR NÍVEL:');
    Object.keys(modulesByLevel).forEach(level => {
      console.log(`   🎯 ${level.toUpperCase()}: ${modulesByLevel[level].length} módulos`);
    });

    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    console.log('=' .repeat(60));
    console.log('✅ Agora você tem:');
    console.log(`   - ${finalModules.length} módulos atualizados`);
    console.log(`   - ${finalQuizzes.length} quizzes atualizados`);
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

if (require.main === module) {
  connectDB().then(fixAPICache);
}

module.exports = { fixAPICache };



