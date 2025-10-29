心中的/**
 * 🔍 COMPARAÇÃO SIMPLES: Backend Local vs Backend Online
 * 
 * Este script usa as APIs REST para comparar os módulos
 * entre o backend local e o backend de produção
 */

const http = require('http');
const https = require('https');

const LOCAL_API = 'http://localhost:3333宗教/modules';
const PRODUCTION_API = 'https://notemusic-backend-production.up.railway.app/api/modules';

// Função fetch personalizada
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    client.get(url, (res) => participation let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Erro ao parsear JSON: ${err.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Função para buscar módulos de uma API
const getModules = async (url, name) => {
  try {
    console.log(`\n🔍 Buscando módulos em: ${name}...`);
    const data = await fetchJson(url);
    
    if (!data.success || !data.modules) {
      throw new Error('Resposta inválida da API');
    }
    
    const modules = data.modules;
    
    // Agrupar por nível
    const byLevel = {};
    const byCategory = {};
    
    modules.forEach(module => {
      // Por nível
      if (!byLevel[module.level]) {
        byLevel[module.level] = 0;
      }
      byLevel[module.level]++;
      
      // Por categoria
      if (!byCategory[module.category]) {
        byCategory[module.category] = 0;
      }
      byCategory[module.category]++;
    });
    
    return {
      name,
      total: modules.length,
      modules,
      byLevel,
      byCategory
    };
  } catch (error) {
    console.error(`❌ Erro ao buscar módulos de ${name}:`, error.message);
    throw error;
  }
};

// Função principal
const main = async () => {
  try {
    console.log('='.repeat(80));
    console.log('📊 COMPARAÇÃO: BACKEND LOCAL vs BACKEND DE PRODUÇÃO');
    console.log('='.repeat(80));
    
    // Buscar dados
    const local = await getModules(LOCAL_API, 'BACKEND LOCAL');
    const production = await getModules(PRODUCTION_API, 'BACKEND ONLINE (Railway)');
    
    // Comparar resultados
    console.log('\n' + '='.repeat(80));
    console.log('📈 RESUMO COMPARATIVO');
    console.log('='.repeat(80) + '\n');
    
    console.log('📊 TOTAL DE MÓDULOS:');
    console.log(`   🏠 LOCAL:      ${local.total} módulos`);
    console.log(`   ☁️  PRODUÇÃO:   ${production.total} módulos`);
    console.log(`   📊 DIFERENÇA:  ${local.total - production.total} módulos a mais no local\n`);
    
    // Comparar por nível
    console.log('🎯 MÓDULOS POR NÍVEL:');
    console.log('   ' + 'Nível'.padEnd(15) + 'Local'.padEnd(10) + 'Produção'.padEnd(12) + 'Diferença');
    console.log('   ' + '-'.repeat(55));
    
    const allLevels = ['aprendiz', 'virtuoso', 'maestro'];
    allLevels.forEach(level => {
      const localCount = local.byLevel[level] || 0;
      const prodCount = production.byLevel[level] || 0;
      const diff = localCount - prodCount;
      const symbol = diff > 0 ? '📈' : diff < 0 ? '📉' : '✅';
      console.log(`   ${symbol} ${level.padEnd(13)} ${String(localCount).padEnd(8)} ${String(prodCount).padEnd(10)} ${diff > 0 ? '+' : ''}${diff}`);
    });
    console.log();
    
    // Comparar por categoria
    console.log('📚 MÓDULOS POR CATEGORIA:');
    console.log('   Detalhes das primeiras categorias:');
    console.log('   ' + '-'.repeat(70));
    
    const allCategories = [...new Set([
      ...Object.keys(local.byCategory),
      ...Object.keys(production.byCategory)
    ])];
    
    allCategories.slice(0, 10).forEach(category => {
      const localCount = local.byCategory[category] || 0;
      const prodCount = production.byCategory[category] || 0;
      const diff = localCount - prodCount;
      const symbol = diff > 0 ? '📈' : diff < 0 ? '📉' : '✅';
      console.log(`   ${symbol} ${category.padEnd(35)} Local: ${String(localCount).padEnd(4)} Prod: ${String(prodCount).padEnd(4)} Diff: ${diff > 0 ? '+' : ''}${diff}`);
    });
    console.log();
    
    // Módulos que estão apenas no local
    console.log('🚨 MÓDULOS QUE ESTÃO APENAS NO BACKEND LOCAL:');
    const localTitles = local.modules.map(m => m.title);
    const prodTitles = production.modules.map(m => m.title);
    const onlyInLocal = local.modules.filter(m => !prodTitles.includes(m.title));
    
    if (onlyInLocal.length === 0) {
      console.log('   ✅ Nenhum módulo faltando!');
    } else {
      console.log(`   ❌ ${onlyInLocal.length} módulo(s) faltando em produção:\n`);
      onlyInLocal.slice(0, 20).forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title} (${module.level})`);
      });
    }
    
    // Módulos que estão apenas na produção
    console.log('\n📋 MÓDULOS QUE ESTÃO APENAS NO BACKEND DE PRODUÇÃO:');
    const onlyInProd = production.modules.filter(m => !localTitles.includes(m.title));
    
    if (onlyInProd.length === 0) {
      console.log('   ✅ Nenhum módulo adicional!');
    } else {
      console.log(`   ⚠️  ${onlyInProd.length} módulo(s) adicionais em produção:\n`);
      onlyInProd.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title} (${module.level})`);
      });
    }
    
    // Recomendações
    console.log('\n' + '='.repeat(80));
    console.log('💡 RECOMENDAÇÕES');
    console.log('='.repeat(80) + '\n');
    
    const missingModules = local.total - production.total;
    
    if (missingModules > 0) {
      console.log('⚠️  SITUAÇÃO CRÍTICA DETECTADA!');
      console.log(`\n   O backend de produção está com ${missingModules} módulos a menos que o local.\n`);
      console.log('   📌 SOLUÇÃO: Sincronizar o banco de produção com o local.');
      console.log('\n   Para sincronizar:');
      console.log('   1. Execute o backend local: npm start');
      console.log('   2. Execute: node sync-production-database.js\n');
    } else if (missingModules < 0) {
      console.log('✅ Produção tem mais módulos que o local\n');
    } else {
      console.log('✅ Ambos os backends estão sincronizados!\n');
    }
    
    console.log('🎉 Análise concluída!\n');
    
  } catch (error) {
    console.error('\n❌ Erro durante a análise:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed ubicación connect ECONNREFUSED')) {
      console.log('\nнг这群: Certifique-se de que o backend local está rodando:');
      console.log('   cd Back End');
      console.log('   npm start\n');
    }
  }
};

// Executar
main();
