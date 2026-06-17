require('dotenv').config();
const mongoose = require('mongoose');

// Configuração de conexões
const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/notemusic';

// Se MONGODB_URI não estiver definido, pedir ao usuário
let PRODUCTION_MONGODB_URI = process.env.MONGODB_URI;

// Se não tiver a URL de produção, pedir
if (!PRODUCTION_MONGODB_URI) {
  console.log('⚠️ URL do Railway não encontrada no .env');
  console.log('Por favor, forneça a URL de conexão do MongoDB do Railway.');
  console.log('\nPara verificar, acesse o Railway e copie a variável MONGODB_URI');
  console.log('ou forneça aqui: mongodb://user:pass@hostname:port/database');
  process.exit(1);
}

const Module = require('../../src/models/module.model');
const Quiz = require('../../src/models/quiz.model');

// Conectar aos bancos
let localConnection = null;
let productionConnection = null;

const connectToDatabases = async () => {
  try {
    console.log('🔄 Conectando aos bancos de dados...\n');
    
    // Conectar ao banco local
    console.log('📊 Conectando ao banco LOCAL...');
    localConnection = await mongoose.createConnection(LOCAL_MONGODB_URI);
    console.log('✅ Conectado ao banco LOCAL\n');
    
    // Conectar ao banco de produção
    console.log('📊 Conectando ao banco de PRODUÇÃO (Railway)...');
    productionConnection = await mongoose.createConnection(PRODUCTION_MONGODB_URI);
    console.log('✅ Conectado ao banco de PRODUÇÃO\n');
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    process.exit(1);
  }
};

// Função para analisar banco
const analyzeDatabase = async (connection, name) => {
  const ModuleModel = connection.model('Module', Module.schema);
  
  const totalModules = await ModuleModel.countDocuments();
  const activeModules = await ModuleModel.countDocuments({ isActive: true });
  
  // Distribuição por nível
  const byLevel = await ModuleModel.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  // Distribuição por categoria
  const byCategory = await ModuleModel.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Listar módulos
  const modules = await ModuleModel.find({ isActive: true })
    .sort({ level: 1, order: 1 })
    .select('title category level order');
  
  return {
    name,
    totalModules,
    activeModules,
    byLevel,
    byCategory,
    modules
  };
};

// Comparar resultados
const compareResults = (localData, productionData) => {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPARAÇÃO: BACKEND LOCAL vs BACKEND DE PRODUÇÃO');
  console.log('='.repeat(80) + '\n');
  
  // Comparar total de módulos
  console.log('📈 TOTAL DE MÓDULOS:');
  console.log(`   🏠 LOCAL:      ${localData.activeModules} módulos ativos`);
  console.log(`   ☁️  PRODUÇÃO:   ${productionData.activeModules} módulos ativos`);
  console.log(`   📊 DIFERENÇA:  ${localData.activeModules - productionData.activeModules} módulos a mais no local\n`);
  
  // Comparar por nível
  console.log('🎯 MÓDULOS POR NÍVEL:');
  console.log('   ' + 'Nível'.padEnd(15) + 'Local'.padEnd(10) + 'Produção'.padEnd(12) + 'Diferença');
  console.log('   ' + '-'.repeat(55));
  
  const allLevels = ['aprendiz', 'virtuoso', 'maestro'];
  allLevels.forEach(level => {
    const local = localData.byLevel.find(l => l._id === level)?.count || 0;
    const prod = productionData.byLevel.find(p => p._id === level)?.count || 0;
    const diff = local - prod;
    const symbol = diff > 0 ? '📈' : diff < 0 ? '📉' : '✅';
    console.log(`   ${symbol} ${level.padEnd(13)} ${String(local).padEnd(8)} ${String(prod).padEnd(10)} ${diff > 0 ? '+' : ''}${diff}`);
  });
  console.log();
  
  // Comparar por categoria
  console.log('📚 MÓDULOS POR CATEGORIA:');
  console.log('   ' + 'Categoria'.padEnd(25) + 'Local'.padEnd(10) + 'Produção'.padEnd(12) + 'Diferença');
  console.log('   ' + '-'.repeat(65));
  
  const allCategories = [...new Set([
    ...localData.byCategory.map(c => c._id),
    ...productionData.byCategory.map(c => c._id)
  ])];
  
  allCategories.forEach(category => {
    const local = localData.byCategory.find(c => c._id === category)?.count || 0;
    const prod = productionData.byCategory.find(c => c._id === category)?.count || 0;
    const diff = local - prod;
    const symbol = diff > 0 ? '📈' : diff < 0 ? '📉' : '✅';
    console.log(`   ${symbol} ${category.padEnd(23)} ${String(local).padEnd(8)} ${String(prod).padEnd(10)} ${diff > 0 ? '+' : ''}${diff}`);
  });
  console.log();
  
  // Listar módulos que estão apenas no local
  console.log('🚨 MÓDULOS QUE ESTÃO APENAS NO BACKEND LOCAL:');
  const localTitles = localData.modules.map(m => m.title);
  const prodTitles = productionData.modules.map(m => m.title);
  const onlyInLocal = localData.modules.filter(m => !prodTitles.includes(m.title));
  
  if (onlyInLocal.length === 0) {
    console.log('   ✅ Nenhum módulo faltando!');
  } else {
    console.log(`   ❌ ${onlyInLocal.length} módulo(s) faltando em produção:\n`);
    onlyInLocal.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title}`);
      console.log(`      📌 Nível: ${module.level} | Categoria: ${module.category}\n`);
    });
  }
  
  // Listar módulos que estão apenas na produção
  console.log('\n📋 MÓDULOS QUE ESTÃO APENAS NO BACKEND DE PRODUÇÃO:');
  const onlyInProd = productionData.modules.filter(m => !localTitles.includes(m.title));
  
  if (onlyInProd.length === 0) {
    console.log('   ✅ Nenhum módulo adicional!');
  } else {
    console.log(`   ⚠️  ${onlyInProd.length} módulo(s) adicionais em produção:\n`);
    onlyInProd.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title}`);
      console.log(`      📌 Nível: ${module.level} | Categoria: ${module.category}\n`);
    });
  }
};

// Executar análise
const main = async () => {
  try {
    await connectToDatabases();
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 ANALISANDO BACKEND LOCAL...');
    console.log('='.repeat(80) + '\n');
    const localData = await analyzeDatabase(localConnection, 'LOCAL');
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 ANALISANDO BACKEND DE PRODUÇÃO...');
    console.log('='.repeat(80) + '\n');
    const productionData = await analyzeDatabase(productionConnection, 'PRODUCTION');
    
    // Comparar resultados
    compareResults(localData, productionData);
    
    // Recomendações
    console.log('\n' + '='.repeat(80));
    console.log('💡 RECOMENDAÇÕES');
    console.log('='.repeat(80) + '\n');
    
    const missingModules = localData.activeModules - productionData.activeModules;
    
    if (missingModules > 0) {
      console.log('⚠️  SITUAÇÃO CRÍTICA DETECTADA!');
      console.log(`\n   O backend de produção está com ${missingModules} módulos a menos que o local.\n`);
      console.log('   📌 SOLUÇÃO: Sincronizar o banco de produção com o local.');
      console.log('\n   Para sincronizar, execute:');
      console.log('   ```bash');
      console.log('   cd "Back End"');
      console.log('   node scripts/sync-production-database.js');
      console.log('   ```\n');
    } else if (missingModules < 0) {
      console.log('✅ Produção tem mais módulos que o local (verificar se é intencional)\n');
    } else {
      console.log('✅ Ambos os backends estão sincronizados!\n');
    }
    
  } catch (error) {
    console.error('\n❌ Erro durante a análise:', error);
  } finally {
    // Fechar conexões
    if (localConnection) {
      await localConnection.close();
      console.log('🔌 Desconectado do banco LOCAL');
    }
    if (productionConnection) {
      await productionConnection.close();
      console.log('🔌 Desconectado do banco de PRODUÇÃO');
    }
    process.exit(0);
  }
};

if (require.main === module) {
  main();
}

module.exports = { analyzeDatabase, compareResults };

