/**
 * 🧪 TESTE DE COMPARAÇÃO BACKEND LOCAL vs ONLINE
 * 
 * Este script compara os módulos do nível Aprendiz
 * entre o backend local e online (Railway)
 */

const axios = require('axios');

// URLs dos backends
const LOCAL_API = 'http://localhost:3333/api';
const ONLINE_API = 'https://notemusic-backend-production.up.railway.app/api';

// Função para buscar módulos
async function getModules(apiUrl, label) {
  try {
    console.log(`\n🔍 Buscando módulos de: ${label}`);
    console.log(`📍 URL: ${apiUrl}`);
    
    // Buscar módulos do nível Aprendiz
    const response = await axios.get(`${apiUrl}/modules`, {
      params: {
        level: 'aprendiz',
        isActive: true
      }
    });

    const modules = response.data.modules || [];
    const count = response.data.count || 0;

    console.log(`✅ Encontrados: ${count} módulos`);

    // Agrupar por categoria
    const byCategory = {};
    modules.forEach(module => {
      const category = module.category || 'sem-categoria';
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push({
        title: module.title,
        id: module._id,
        hasQuiz: module.quizzes && module.quizzes.length > 0,
        quizCount: module.quizzes?.length || 0
      });
    });

    console.log(`\n📊 Distribuição por categoria:`);
    Object.keys(byCategory).sort().forEach(cat => {
      console.log(`   ${cat}: ${byCategory[cat].length} módulos`);
      byCategory[cat].forEach(mod => {
        console.log(`      - ${mod.title} (quiz: ${mod.hasQuiz ? '✅' : '❌'}, ${mod.quizCount} quiz(es))`);
      });
    });

    return {
      total: count,
      modules,
      byCategory
    };

  } catch (error) {
    console.error(`❌ Erro ao buscar módulos de ${label}:`, error.message);
    return {
      total: 0,
      modules: [],
      byCategory: {},
      error: error.message
    };
  }
}

// Função para comparar resultados
function compareResults(local, online) {
  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('📊 COMPARAÇÃO DETALHADA');
  console.log('═══════════════════════════════════════════════════\n');

  // Total de módulos
  console.log(`📦 Total de módulos:`);
  console.log(`   Local: ${local.total}`);
  console.log(`   Online: ${online.total}`);
  console.log(`   Diferença: ${local.total - online.total}`);
  
  if (local.total > online.total) {
    console.log(`   ⚠️ ATENÇÃO: Backend local tem ${local.total - online.total} módulos A MAIS!`);
  } else if (online.total > local.total) {
    console.log(`   ⚠️ ATENÇÃO: Backend online tem ${online.total - local.total} módulos A MAIS!`);
  } else {
    console.log(`   ✅ Quantidade de módulos é igual`);
  }

  // Comparar categorias
  console.log(`\n📂 Comparação por categoria:`);
  
  const allCategories = new Set([
    ...Object.keys(local.byCategory),
    ...Object.keys(online.byCategory)
  ]);

  allCategories.forEach(cat => {
    const localCount = local.byCategory[cat]?.length || 0;
    const onlineCount = online.byCategory[cat]?.length || 0;
    const diff = localCount - onlineCount;

    if (diff !== 0) {
      console.log(`\n   🚨 ${cat}:`);
      console.log(`      Local: ${localCount}`);
      console.log(`      Online: ${onlineCount}`);
      console.log(`      Diferença: ${diff > 0 ? `+${diff} a mais no local` : `${diff} a menos no local`}`);

      // Mostrar módulos que estão em um mas não no outro
      if (diff > 0) {
        console.log(`      ❌ Módulos faltando no ONLINE:`);
        local.byCategory[cat]?.forEach(mod => {
          const existsInOnline = online.byCategory[cat]?.some(om => om.title === mod.title);
          if (!existsInOnline) {
            console.log(`         - ${mod.title} (ID: ${mod.id})`);
          }
        });
      } else {
        console.log(`      ❌ Módulos faltando no LOCAL:`);
        online.byCategory[cat]?.forEach(mod => {
          const existsInLocal = local.byCategory[cat]?.some(lm => lm.title === mod.title);
          if (!existsInLocal) {
            console.log(`         - ${mod.title} (ID: ${mod.id})`);
          }
        });
      }
    } else {
      console.log(`   ✅ ${cat}: ${localCount} módulos (igual)`);
    }
  });

  // Comparar títulos de módulos
  console.log(`\n\n📝 Títulos de módulos (local vs online):`);
  const localTitles = new Set(local.modules.map(m => m.title));
  const onlineTitles = new Set(online.modules.map(m => m.title));

  const onlyLocal = [...localTitles].filter(t => !onlineTitles.has(t));
  const onlyOnline = [...onlineTitles].filter(t => !localTitles.has(t));

  if (onlyLocal.length > 0) {
    console.log(`\n   ❌ Módulos APENAS no LOCAL:`);
    onlyLocal.forEach(title => console.log(`      - ${title}`));
  }

  if (onlyOnline.length > 0) {
    console.log(`\n   ❌ Módulos APENAS no ONLINE:`);
    onlyOnline.forEach(title => console.log(`      - ${title}`));
  }

  if (onlyLocal.length === 0 && onlyOnline.length === 0) {
    console.log(`   ✅ Todos os módulos existem em ambos os backends`);
  }
}

// Função principal
async function runTest() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🧪 TESTE DE COMPARAÇÃO BACKEND LOCAL vs ONLINE');
  console.log('═══════════════════════════════════════════════════');
  console.log('Nível: Aprendiz');
  console.log('═══════════════════════════════════════════════════\n');

  // Verificar se backends estão rodando
  console.log('🔍 Verificando conectividade...\n');

  const local = await getModules(LOCAL_API, 'BACKEND LOCAL');
  const online = await getModules(ONLINE_API, 'BACKEND ONLINE (Railway)');

  // Mostrar erros de conexão
  if (local.error) {
    console.log('\n⚠️ Backend local não está rodando!');
    console.log('   Execute: cd Back\\ End && npm run dev');
  }

  if (online.error) {
    console.log('\n⚠️ Backend online não está acessível!');
  }

  // Comparar resultados
  if (!local.error && !online.error) {
    compareResults(local, online);
  }

  // Resumo final
  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('📋 RESUMO FINAL');
  console.log('═══════════════════════════════════════════════════\n');

  console.log(`Backend Local:`);
  console.log(`   Total de módulos Aprendiz: ${local.total}`);
  console.log(`   Categorias: ${Object.keys(local.byCategory).length}`);
  console.log(`   Status: ${local.error ? '❌ Erro' : '✅ OK'}`);

  console.log(`\nBackend Online (Railway):`);
  console.log(`   Total de módulos Aprendiz: ${online.total}`);
  console.log(`   Categorias: ${Object.keys(online.byCategory).length}`);
  console.log(`   Status: ${online.error ? '❌ Erro' : '✅ OK'}`);

  if (!local.error && !online.error && local.total !== online.total) {
    console.log(`\n🚨 PROBLEMA DETECTADO:`);
    console.log(`   Os backends têm quantidades diferentes de módulos!`);
    console.log(`   Isso pode causar inconsistências no app.`);
  }

  console.log('\n');
}

// Executar teste
runTest().catch(error => {
  console.error('❌ Erro fatal:', error);
});



