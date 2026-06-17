const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../../src/models/Module');

const checkDistribution = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    // Buscar todos os módulos aprendiz
    const aprendizModules = await Module.find({ level: 'aprendiz', isActive: true });
    
    console.log('📊 DISTRIBUIÇÃO DE MÓDULOS APRENDIZ POR CATEGORIA:\n');
    console.log('=' .repeat(60));
    
    const byCategory = {};
    aprendizModules.forEach(m => {
      if (!byCategory[m.category]) {
        byCategory[m.category] = [];
      }
      byCategory[m.category].push(m.title);
    });

    Object.keys(byCategory).sort().forEach(cat => {
      console.log(`\n📁 Categoria: ${cat}`);
      console.log(`   Total de módulos: ${byCategory[cat].length}`);
      byCategory[cat].forEach(title => {
        console.log(`   - ${title}`);
      });
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n📈 RESUMO GERAL:`);
    console.log(`   Total de categorias: ${Object.keys(byCategory).length}`);
    console.log(`   Total de módulos: ${aprendizModules.length}`);
    
    // Verificar categorias com poucos módulos
    console.log(`\n⚠️  CATEGORIAS COM POUCOS MÓDULOS (menos de 3):`);
    Object.keys(byCategory).forEach(cat => {
      if (byCategory[cat].length < 3) {
        console.log(`   ❌ ${cat}: apenas ${byCategory[cat].length} módulo(s)`);
      }
    });

    // Buscar módulos virtuoso para comparação
    console.log('\n' + '='.repeat(60));
    const virtuosoModules = await Module.find({ level: 'virtuoso', isActive: true });
    
    console.log('\n📊 DISTRIBUIÇÃO DE MÓDULOS VIRTUOSO POR CATEGORIA:\n');
    
    const byCategoryVirtuoso = {};
    virtuosoModules.forEach(m => {
      if (!byCategoryVirtuoso[m.category]) {
        byCategoryVirtuoso[m.category] = [];
      }
      byCategoryVirtuoso[m.category].push(m.title);
    });

    Object.keys(byCategoryVirtuoso).sort().forEach(cat => {
      console.log(`\n📁 Categoria: ${cat}`);
      console.log(`   Total de módulos: ${byCategoryVirtuoso[cat].length}`);
      byCategoryVirtuoso[cat].forEach(title => {
        console.log(`   - ${title}`);
      });
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n📈 RESUMO VIRTUOSO:`);
    console.log(`   Total de categorias: ${Object.keys(byCategoryVirtuoso).length}`);
    console.log(`   Total de módulos: ${virtuosoModules.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

checkDistribution();





















