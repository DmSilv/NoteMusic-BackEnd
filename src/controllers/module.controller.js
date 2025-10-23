const Module = require('../models/Module');
const User = require('../models/User');

// @desc    Listar todos os módulos
// @route   GET /api/modules
// @access  Public
exports.getModules = async (req, res, next) => {
  try {
    const { category, level, isActive = true } = req.query;
    
    // Construir filtro
    const filter = { isActive };
    if (category) filter.category = category;
    if (level) filter.level = level;

    console.log(`🔍 Executando query de módulos com filtro:`, filter);

    // Forçar consulta fresca ao banco de dados
    const modules = await Module.find(filter)
      .sort({ order: 1 })
      .select('-content.exercises') // Não enviar exercícios na listagem
      .lean(); // Usar lean() para melhor performance

    console.log(`📊 Módulos encontrados: ${modules.length}`);
    
    // Distribuição por nível para log
    const modulesByLevel = {};
    modules.forEach(module => {
      if (!modulesByLevel[module.level]) {
        modulesByLevel[module.level] = [];
      }
      modulesByLevel[module.level].push(module);
    });

    console.log('📈 Distribuição por nível:');
    Object.keys(modulesByLevel).forEach(level => {
      console.log(`   🎯 ${level.toUpperCase()}: ${modulesByLevel[level].length} módulos`);
    });

    // Para endpoints públicos, não verificar progresso do usuário
    const modulesWithProgress = modules.map(module => ({
      ...module,
      isCompleted: false,
      isLocked: false
    }));

    res.json({
      success: true,
      count: modulesWithProgress.length,
      modules: modulesWithProgress
    });
  } catch (error) {
    console.error('❌ Erro ao buscar módulos:', error);
    next(error);
  }
};

// @desc    Obter módulo específico
// @route   GET /api/modules/:id
// @access  Private
exports.getModule = async (req, res, next) => {
  try {
    console.log(`🔍 Buscando módulo com ID: ${req.params.id}`);
    
    const module = await Module.findById(req.params.id)
      .populate('prerequisites', 'title order')
      .populate('quizzes', 'title description questions.length');

    if (!module) {
      console.log(`❌ Módulo não encontrado: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    console.log(`✅ Módulo encontrado: ${module.title}`);

    // Verificar se usuário completou os pré-requisitos
    const user = await User.findById(req.user.id);
    const completedModuleIds = user.completedModules.map(cm => cm.moduleId.toString());
    
    const hasPrerequisites = module.prerequisites.every(prereq => 
      completedModuleIds.includes(prereq._id.toString())
    );

    if (!hasPrerequisites && module.prerequisites.length > 0) {
      console.log(`❌ Pré-requisitos não atendidos para módulo: ${module.title}`);
      return res.status(403).json({
        success: false,
        message: 'Você precisa completar os módulos anteriores primeiro',
        prerequisites: module.prerequisites
      });
    }

    // Verificar se já foi completado
    const isCompleted = completedModuleIds.includes(module._id.toString());

    res.json({
      success: true,
      module: {
        ...module.toObject(),
        isCompleted,
        userCanAccess: hasPrerequisites || module.prerequisites.length === 0
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar módulo específico:', error);
    next(error);
  }
};

// @desc    Marcar módulo como completo
// @route   POST /api/modules/:id/complete
// @access  Private
exports.completeModule = async (req, res, next) => {
  try {
    const moduleId = req.params.id;
    console.log(`🔍 Marcando módulo como completo: ${moduleId}`);
    
    // Verificar se o módulo existe
    const module = await Module.findById(moduleId);
    if (!module) {
      console.log(`❌ Módulo não encontrado: ${moduleId}`);
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    // Verificar se o usuário já completou este módulo
    const user = await User.findById(req.user.id);
    const alreadyCompleted = user.completedModules.some(
      cm => cm.moduleId.toString() === moduleId
    );

    if (alreadyCompleted) {
      console.log(`ℹ️ Módulo já foi completado pelo usuário: ${moduleId}`);
      return res.status(200).json({
        success: true,
        message: 'Módulo já foi completado anteriormente'
      });
    }

    // Adicionar à lista de módulos completados
    user.completedModules.push({
      moduleId,
      completedAt: new Date()
    });

    // Adicionar pontos ao usuário
    user.points += module.points || 0;
    
    await user.save();
    console.log(`✅ Módulo marcado como completo: ${module.title}`);

    res.status(200).json({
      success: true,
      message: 'Módulo marcado como completo',
      points: module.points,
      totalPoints: user.points
    });
  } catch (error) {
    console.error('❌ Erro ao completar módulo:', error);
    next(error);
  }
};

// @desc    Obter próximo módulo recomendado
// @route   GET /api/modules/next
// @access  Private
exports.getNextModule = async (req, res, next) => {
  try {
    console.log(`🔍 Buscando próximo módulo recomendado para usuário: ${req.user.id}`);
    
    // Buscar usuário com seus módulos completados
    const user = await User.findById(req.user.id);
    const completedModuleIds = user.completedModules.map(cm => cm.moduleId.toString());

    // Buscar todos os módulos ativos do nível do usuário
    const modules = await Module.find({ 
      level: user.level,
      isActive: true 
    }).sort({ order: 1 });

    // Encontrar o primeiro módulo não completado
    const nextModule = modules.find(module => 
      !completedModuleIds.includes(module._id.toString())
    );

    if (!nextModule) {
      console.log(`ℹ️ Nenhum módulo pendente encontrado para o nível: ${user.level}`);
      return res.json({
        success: true,
        message: 'Todos os módulos deste nível foram completados',
        hasNextModule: false
      });
    }

    console.log(`✅ Próximo módulo recomendado: ${nextModule.title}`);
    res.json({
      success: true,
      hasNextModule: true,
      module: {
        ...nextModule.toObject(),
        isCompleted: false
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar próximo módulo:', error);
    next(error);
  }
};

// Função auxiliar para obter nome do nível
const getNivelName = (level) => {
  const names = {
    'aprendiz': 'Aprendiz',
    'virtuoso': 'Virtuoso',
    'maestro': 'Maestro'
  };
  return names[level] || level;
};

// @desc    Obter categorias disponíveis
// @route   GET /api/modules/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    console.log('🔍 Buscando categorias disponíveis');
    
    const categories = [
      {
        id: 'propriedades-som',
        name: 'Propriedades do Som',
        description: 'Aprenda sobre frequência, timbre, intensidade e duração',
        icon: 'sound-wave'
      },
      {
        id: 'escalas-maiores',
        name: 'Escalas Maiores',
        description: 'Domine as escalas maiores e seus padrões',
        icon: 'piano'
      },
      {
        id: 'figuras-musicais',
        name: 'Figuras Musicais',
        description: 'Entenda as notas e seus valores',
        icon: 'music-note'
      },
      {
        id: 'ritmo-ternarios',
        name: 'Ritmos Ternários',
        description: 'Explore os compassos ternários',
        icon: 'metronome'
      },
      {
        id: 'compasso-simples',
        name: 'Compasso Simples',
        description: 'Compreenda os compassos simples',
        icon: 'drum'
      },
      {
        id: 'andamento-dinamica',
        name: 'Andamento e Dinâmica',
        description: 'Velocidade e intensidade na música',
        icon: 'speedometer'
      },
      {
        id: 'solfegio-basico',
        name: 'Solfejo Básico',
        description: 'Desenvolva a leitura musical',
        icon: 'microphone'
      },
      {
        id: 'articulacao-musical',
        name: 'Articulação Musical',
        description: 'Técnicas de execução e expressão',
        icon: 'hand'
      },
      {
        id: 'intervalos-musicais',
        name: 'Intervalos Musicais',
        description: 'Distâncias entre as notas',
        icon: 'ruler'
      },
      {
        id: 'expressao-musical',
        name: 'Expressão Musical',
        description: 'Interpretação e sentimento',
        icon: 'heart'
      },
      {
        id: 'sincopa-contratempo',
        name: 'Síncopa e Contratempo',
        description: 'Ritmos sincopados e contratempos',
        icon: 'shuffle'
      },
      {
        id: 'compasso-composto',
        name: 'Compasso Composto',
        description: 'Compassos compostos e suas divisões',
        icon: 'layers'
      }
    ];

    // Contar módulos por categoria
    console.log('🔍 Contando módulos por categoria');
    const moduleCounts = await Module.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    console.log('📊 Contagem de módulos por categoria:', moduleCounts);

    const categoriesWithCount = categories.map(cat => {
      const count = moduleCounts.find(mc => mc._id === cat.id);
      return {
        ...cat,
        moduleCount: count ? count.count : 0
      };
    });

    res.json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    next(error);
  }
};

// @desc    Obter módulos por nível
// @route   GET /api/modules/levels/:level
// @access  Public
exports.getModulesByLevel = async (req, res, next) => {
  try {
    const { level } = req.params;
    console.log(`🔍 Buscando módulos do nível: ${level}`);
    
    if (!['aprendiz', 'virtuoso', 'maestro'].includes(level)) {
      console.log(`❌ Nível inválido: ${level}`);
      return res.status(400).json({
        success: false,
        message: 'Nível inválido. Use: aprendiz, virtuoso ou maestro'
      });
    }
    
    const modules = await Module.find({ 
      level, 
      isActive: true 
    })
    .sort({ order: 1 })
    .select('-content.exercises');
    
    console.log(`📊 Módulos encontrados para o nível ${level}: ${modules.length}`);
    
    res.json({
      success: true,
      count: modules.length,
      modules: modules.map(module => ({
        ...module.toObject(),
        isCompleted: false,
        isLocked: false
      }))
    });
  } catch (error) {
    console.error(`❌ Erro ao buscar módulos do nível ${req.params.level}:`, error);
    next(error);
  }
};

// @desc    Obter estatísticas de módulos
// @route   GET /api/modules/stats
// @access  Public
exports.getModuleStats = async (req, res, next) => {
  try {
    console.log('🔍 Buscando estatísticas de módulos');
    
    // Contar módulos por nível
    const levelStats = await Module.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Contar total de módulos
    const totalModules = await Module.countDocuments({ isActive: true });
    
    // Formatar estatísticas
    const stats = {
      total: totalModules,
      byLevel: levelStats.map(stat => ({
        level: stat._id,
        levelName: getNivelName(stat._id),
        count: stat.count
      }))
    };
    
    console.log('📊 Estatísticas de módulos:', stats);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de módulos:', error);
    next(error);
  }
};