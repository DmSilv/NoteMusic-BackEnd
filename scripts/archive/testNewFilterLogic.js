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

const testNewFilterLogic = async () => {
  try {
    console.log('🧪 TESTE DA NOVA LÓGICA DE FILTRO');
    console.log('=' .repeat(60));

    // 1. Buscar todos os módulos
    const response = await makeRequest('/modules');
    
    if (response.data.modules && Array.isArray(response.data.modules)) {
      const modules = response.data.modules;
      console.log(`📊 Total de módulos: ${modules.length}`);
      
      // 2. Simular agrupamento por categoria (como no frontend)
      const modulesByCategory = modules.reduce((acc, module) => {
        const category = module.category || 'geral';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(module);
        return acc;
      }, {});
      
      const categories = Object.entries(modulesByCategory).map(([category, categoryModules]) => {
        return {
          name: category,
          modules: categoryModules
        };
      });
      
      console.log(`📋 Total de categorias: ${categories.length}`);
      
      // 3. Testar nova lógica de filtro para nível Maestro
      console.log('\n🎯 TESTANDO NOVA LÓGICA DE FILTRO PARA NÍVEL MAESTRO:');
      console.log('-' .repeat(60));
      
      const selectedLevel = 'maestro';
      const categoryMap = new Map();
      
      categories.forEach((category) => {
        if (!category || !category.modules || category.modules.length === 0) {
          return;
        }
        
        // Filtrar módulos do nível selecionado
        const modulesOfLevel = category.modules.filter((module) => {
          return module.level === selectedLevel;
        });
        
        if (modulesOfLevel.length > 0) {
          // Se já existe uma categoria com esse nome, adicionar os módulos
          if (categoryMap.has(category.name)) {
            const existingCategory = categoryMap.get(category.name);
            existingCategory.modules = [...existingCategory.modules, ...modulesOfLevel];
          } else {
            // Criar nova categoria com apenas os módulos do nível selecionado
            categoryMap.set(category.name, {
              name: category.name,
              modules: modulesOfLevel
            });
          }
        }
      });
      
      // Converter Map para array
      const filtered = Array.from(categoryMap.values());
      
      console.log(`\n📊 RESULTADO FINAL:`);
      console.log(`🎯 Categorias do nível Maestro: ${filtered.length}`);
      
      filtered.forEach((category, index) => {
        console.log(`\n${index + 1}. ${category.name}`);
        console.log(`   Módulos: ${category.modules.length}`);
        category.modules.forEach((module, moduleIndex) => {
          console.log(`     ${moduleIndex + 1}. ${module.title} (${module.level})`);
        });
      });
      
      // 4. Testar para outros níveis também
      console.log('\n🎯 TESTANDO PARA OUTROS NÍVEIS:');
      console.log('-' .repeat(60));
      
      const levels = ['aprendiz', 'virtuoso', 'maestro'];
      
      levels.forEach(level => {
        const levelCategoryMap = new Map();
        
        categories.forEach((category) => {
          if (!category || !category.modules || category.modules.length === 0) {
            return;
          }
          
          const modulesOfLevel = category.modules.filter((module) => {
            return module.level === level;
          });
          
          if (modulesOfLevel.length > 0) {
            if (levelCategoryMap.has(category.name)) {
              const existingCategory = levelCategoryMap.get(category.name);
              existingCategory.modules = [...existingCategory.modules, ...modulesOfLevel];
            } else {
              levelCategoryMap.set(category.name, {
                name: category.name,
                modules: modulesOfLevel
              });
            }
          }
        });
        
        const levelFiltered = Array.from(levelCategoryMap.values());
        console.log(`\n🎯 ${level.toUpperCase()}: ${levelFiltered.length} categorias`);
        
        levelFiltered.forEach((category, index) => {
          console.log(`   ${index + 1}. ${category.name} (${category.modules.length} módulos)`);
        });
      });
      
    } else {
      console.log(`❌ Estrutura inválida:`, response.data);
    }

    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  testNewFilterLogic();
}

module.exports = { testNewFilterLogic };



