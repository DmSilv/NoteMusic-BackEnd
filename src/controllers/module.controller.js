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

    const modules = await Module.find(filter)
      .sort({ order: 1 })
      .select('-content.exercises'); // Não enviar exercícios na listagem

    // Para endpoints públicos, não verificar progresso do usuário
    const modulesWithProgress = modules.map(module => ({
      ...module.toObject(),
      isCompleted: false,
      isLocked: false
    }));

    res.json({
      success: true,
      count: modulesWithProgress.length,
      modules: modulesWithProgress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter módulo específico
// @route   GET /api/modules/:id
// @access  Private
exports.getModule = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('prerequisites', 'title order')
      .populate('quizzes', 'title description questions.length');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    // Verificar se usuário completou os pré-requisitos
    const user = await User.findById(req.user.id);
    const completedModuleIds = user.completedModules.map(cm => cm.moduleId.toString());
    
    const hasPrerequisites = module.prerequisites.every(prereq => 
      completedModuleIds.includes(prereq._id.toString())
    );

    if (!hasPrerequisites && module.prerequisites.length > 0) {
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
    next(error);
  }
};

// @desc    Marcar módulo como completo
// @route   POST /api/modules/:id/complete
// @access  Private
exports.completeModule = async (req, res, next) => {
  try {
    const moduleId = req.params.id;
    const user = await User.findById(req.user.id);

    // Verificar se módulo existe
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    // Verificar se já foi completado
    const alreadyCompleted = user.completedModules.some(
      cm => cm.moduleId.toString() === moduleId
    );

    if (alreadyCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Módulo já foi completado'
      });
    }

    // Adicionar módulo aos completados
    user.completedModules.push({
      moduleId,
      completedAt: new Date()
    });

    // Adicionar pontos
    user.totalPoints += module.points;

    // Atualizar progresso semanal
    user.weeklyProgress += 1;

    // Atualizar streak
    user.updateStreak();

    await user.save();

    res.json({
      success: true,
      message: 'Módulo completado com sucesso!',
      pointsEarned: module.points,
      totalPoints: user.totalPoints,
      streak: user.streak
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter categorias disponíveis
// @route   GET /api/modules/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
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
    const moduleCounts = await Module.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

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
    next(error);
  }
};

// @desc    Obter próximo módulo recomendado
// @route   GET /api/modules/next-recommended
// @access  Private
exports.getNextRecommended = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const completedModuleIds = user.completedModules.map(cm => cm.moduleId.toString());

    // Buscar módulos não completados do nível do usuário
    const nextModule = await Module.findOne({
      _id: { $nin: completedModuleIds },
      level: user.level,
      isActive: true
    })
    .sort({ order: 1 })
    .populate('prerequisites', 'title');

    if (!nextModule) {
      // Se completou todos do nível, sugerir próximo nível
      const nextLevelMap = {
        'iniciante': 'intermediario',
        'intermediario': 'avancado',
        'avancado': null
      };

      const nextLevel = nextLevelMap[user.level];
      
      if (nextLevel) {
        const nextLevelModule = await Module.findOne({
          level: nextLevel,
          isActive: true
        }).sort({ order: 1 });

        return res.json({
          success: true,
          message: `Parabéns! Você completou todos os módulos do nível ${user.level}. Que tal avançar para o nível ${nextLevel}?`,
          suggestLevelUp: true,
          nextLevel,
          module: nextLevelModule
        });
      } else {
        return res.json({
          success: true,
          message: 'Parabéns! Você completou todos os módulos disponíveis!',
          allCompleted: true
        });
      }
    }

    res.json({
      success: true,
      module: nextModule
    });
  } catch (error) {
    next(error);
  }
};