const http = require('http');

const API_BASE_URL = 'http://localhost:3333';

const makeRequest = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3333,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const debugCategoryGrouping = async () => {
  try {
    console.log('🔍 DEBUG DO AGRUPAMENTO DE CATEGORIAS');
    console.log('=' .repeat(60));

    // 1. Buscar todos os módulos
    const response = await makeRequest('/modules');
    
    if (response.data.modules && Array.isArray(response.data.modules)) {
      const modules = response.data.modules;
      console.log(`📊 Total de módulos: ${modules.length}`);
      
      // 2. Filtrar apenas módulos do nível Maestro
      const maestroModules = modules.filter(module => 
        module.level === 'maestro' || module.level === 'Maestro'
      );
      
      console.log(`\n🎯 MÓDULOS DO NÍVEL MAESTRO: ${maestroModules.length}`);
      console.log('-' .repeat(50));
      
      maestroModules.forEach((module, index) => {
        console.log(`${index + 1}. ${module.title}`);
        console.log(`   Categoria: ${module.category}`);
        console.log(`   Nível: ${module.level}`);
      });
      
      // 3. Simular o agrupamento por categoria (como no frontend)
      console.log('\n📂 AGRUPAMENTO POR CATEGORIA (SIMULANDO FRONTEND):');
      console.log('-' .repeat(60));
      
      const modulesByCategory = modules.reduce((acc, module) => {
        const category = module.category || 'geral';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(module);
        return acc;
      }, {});
      
      // 4. Converter para array de categorias (como no frontend)
      const categories = Object.entries(modulesByCategory).map(([category, categoryModules]) => {
        return {
          name: category,
          modules: categoryModules
        };
      });
      
      console.log(`📋 Total de categorias: ${categories.length}`);
      
      // 5. Simular a função getCategoryLevel para cada categoria
      const getCategoryLevel = (category) => {
        if (!category?.modules || category.modules.length === 0) {
          return 'aprendiz';
        }
        
        const levelCounts = {
          'aprendiz': 0,
          'virtuoso': 0,
          'maestro': 0
        };
        
        category.modules.forEach((module) => {
          if (module?.level) {
            levelCounts[module.level.toLowerCase()]++;
          }
        });
        
        // Determinar nível dominante
        if (levelCounts.maestro > levelCounts.virtuoso && levelCounts.maestro > levelCounts.aprendiz) {
          return 'maestro';
        } else if (levelCounts.virtuoso > levelCounts.aprendiz) {
          return 'virtuoso';
        }
        
        return 'aprendiz';
      };
      
      // 6. Aplicar filtro de nível Maestro
      console.log('\n🎯 APLICANDO FILTRO DE NÍVEL MAESTRO:');
      console.log('-' .repeat(50));
      
      const maestroCategories = categories.filter((category) => {
        if (!category || !category.modules || category.modules.length === 0) {
          return false;
        }
        
        const categoryLevel = getCategoryLevel(category);
        console.log(`📁 Categoria: ${category.name}`);
        console.log(`   Módulos: ${category.modules.length}`);
        console.log(`   Nível determinado: ${categoryLevel}`);
        console.log(`   Módulos por nível:`);
        
        const levelCounts = {
          'aprendiz': 0,
          'virtuoso': 0,
          'maestro': 0
        };
        
        category.modules.forEach((module) => {
          if (module?.level) {
            levelCounts[module.level.toLowerCase()]++;
          }
        });
        
        Object.entries(levelCounts).forEach(([level, count]) => {
          if (count > 0) {
            console.log(`     - ${level}: ${count} módulo(s)`);
          }
        });
        
        console.log(`   Incluído no filtro Maestro: ${categoryLevel === 'maestro'}`);
        console.log('');
        
        return categoryLevel === 'maestro';
      });
      
      console.log(`\n📊 RESULTADO FINAL:`);
      console.log(`🎯 Categorias do nível Maestro: ${maestroCategories.length}`);
      
      maestroCategories.forEach((category, index) => {
        console.log(`\n${index + 1}. ${category.name}`);
        console.log(`   Módulos: ${category.modules.length}`);
        category.modules.forEach((module, moduleIndex) => {
          console.log(`     ${moduleIndex + 1}. ${module.title} (${module.level})`);
        });
      });
      
    } else {
      console.log(`❌ Estrutura inválida:`, response.data);
    }

    console.log('\n🎉 DEBUG CONCLUÍDO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  debugCategoryGrouping();
}

module.exports = { debugCategoryGrouping };



