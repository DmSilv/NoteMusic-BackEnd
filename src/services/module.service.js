const Module = require('../models/module.model');
const User = require('../models/user.model');
const { GAMIFICATION_CONSTANTS } = require('../utils/gamificationRebalanced');
const { invalidateCache } = require('../middlewares/cache');

const CATEGORY_DEFINITIONS = [
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

const getNivelName = (level) => {
  const names = {
    aprendiz: 'Aprendiz',
    virtuoso: 'Virtuoso',
    maestro: 'Maestro'
  };
  return names[level] || level;
};

const computeQuizTimeLimit = (module) => {
  let quizTimeLimit = null;

  if (module.quizzes && module.quizzes.length > 0) {
    const quiz = module.quizzes[0];
    if (quiz.timeLimit && quiz.timeLimit > 0) {
      quizTimeLimit = quiz.timeLimit;
    } else if (quiz.questions && quiz.questions.length > 0) {
      quizTimeLimit = quiz.questions.length * 2 * 60;
    }
  } else if (module.quizzes && module.quizzes._id) {
    const quiz = module.quizzes;
    if (quiz.timeLimit && quiz.timeLimit > 0) {
      quizTimeLimit = quiz.timeLimit;
    } else if (quiz.questions && quiz.questions.length > 0) {
      quizTimeLimit = quiz.questions.length * 2 * 60;
    }
  }

  return quizTimeLimit;
};

class ModuleService {
  static async listModules({ category, level, isActive = true } = {}) {
    const filter = { isActive };
    if (category) filter.category = category;
    if (level) filter.level = level;

    console.log(`🔍 [GET-MODULES] Executando query com filtro:`, filter);

    const modules = await Module.find(filter)
      .sort({ order: 1 })
      .select('_id title description category level order quizzes')
      .populate({
        path: 'quizzes',
        select: 'timeLimit',
        options: { lean: true }
      })
      .lean();

    console.log(`📊 Módulos encontrados: ${modules.length}`);

    const modulesByLevel = {};
    modules.forEach((module) => {
      if (!modulesByLevel[module.level]) {
        modulesByLevel[module.level] = [];
      }
      modulesByLevel[module.level].push(module);
    });

    console.log('📈 Distribuição por nível:');
    Object.keys(modulesByLevel).forEach((lvl) => {
      console.log(`   🎯 ${lvl.toUpperCase()}: ${modulesByLevel[lvl].length} módulos`);
    });

    const modulesWithProgress = modules.map((module) => ({
      ...module,
      quizTimeLimit: computeQuizTimeLimit(module),
      isCompleted: false,
      isLocked: false
    }));

    return {
      status: 200,
      body: {
        success: true,
        count: modulesWithProgress.length,
        modules: modulesWithProgress
      }
    };
  }

  static async getModuleById(moduleId, userId) {
    console.log(`🔍 Buscando módulo com ID: ${moduleId}`);

    const module = await Module.findById(moduleId)
      .populate('prerequisites', 'title order')
      .populate('quizzes', 'title description questions.length');

    if (!module) {
      console.log(`❌ Módulo não encontrado: ${moduleId}`);
      return {
        status: 404,
        body: {
          success: false,
          message: 'Módulo não encontrado'
        }
      };
    }

    console.log(`✅ Módulo encontrado: ${module.title}`);

    const user = await User.findById(userId).select('completedModules').lean();
    const completedModuleIds = (user?.completedModules || [])
      .map((cm) => cm.moduleId?.toString())
      .filter(Boolean);

    const hasPrerequisites = module.prerequisites.every((prereq) =>
      completedModuleIds.includes(prereq._id.toString())
    );

    if (!hasPrerequisites && module.prerequisites.length > 0) {
      console.log(`❌ Pré-requisitos não atendidos para módulo: ${module.title}`);
      return {
        status: 403,
        body: {
          success: false,
          message: 'Você precisa completar os módulos anteriores primeiro',
          prerequisites: module.prerequisites
        }
      };
    }

    const isCompleted = completedModuleIds.includes(module._id.toString());

    return {
      status: 200,
      body: {
        success: true,
        module: {
          ...module.toObject(),
          isCompleted,
          userCanAccess: hasPrerequisites || module.prerequisites.length === 0
        }
      }
    };
  }

  static async completeModule(moduleId, userId) {
    console.log(`🔍 Marcando módulo como completo: ${moduleId}`);

    const module = await Module.findById(moduleId).populate('quizzes');
    if (!module) {
      console.log(`❌ Módulo não encontrado: ${moduleId}`);
      return {
        status: 404,
        body: {
          success: false,
          message: 'Módulo não encontrado'
        }
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Usuário não encontrado'
        }
      };
    }

    const alreadyCompleted = user.completedModules.some((cm) => cm.moduleId.toString() === moduleId);

    if (alreadyCompleted) {
      console.log(`ℹ️ Módulo já foi completado pelo usuário: ${moduleId}`);
      return {
        status: 200,
        body: {
          success: true,
          message: 'Módulo já foi completado anteriormente'
        }
      };
    }

    const moduleQuizIds = module.quizzes.map((quiz) => quiz._id.toString());
    const completedQuizIds = user.completedQuizzes
      .filter((cq) => cq.passed)
      .map((cq) => cq.quizId.toString());

    const completedQuizzesInModule = moduleQuizIds.filter((quizId) =>
      completedQuizIds.includes(quizId)
    );

    console.log(`🔍 Validação de conclusão do módulo "${module.title}":`);
    console.log(`   Quizzes no módulo: ${moduleQuizIds.length}`);
    console.log(`   Quizzes completados pelo usuário: ${completedQuizzesInModule.length}`);
    console.log(`   IDs dos quizzes: ${moduleQuizIds}`);
    console.log(`   IDs completados: ${completedQuizzesInModule}`);

    if (moduleQuizIds.length === 0) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Este módulo não possui quizzes para completar'
        }
      };
    }

    if (completedQuizzesInModule.length !== moduleQuizIds.length) {
      const missingQuizzes = moduleQuizIds.filter(
        (quizId) => !completedQuizzesInModule.includes(quizId)
      );

      console.log(`❌ Módulo não pode ser completado. Quizzes faltando: ${missingQuizzes.length}`);

      return {
        status: 400,
        body: {
          success: false,
          message: `Você precisa completar todos os quizzes deste módulo primeiro. Faltam ${missingQuizzes.length} quiz(es).`,
          missingQuizzes: missingQuizzes.length,
          totalQuizzes: moduleQuizIds.length,
          completedQuizzes: completedQuizzesInModule.length
        }
      };
    }

    user.completedModules.push({
      moduleId,
      completedAt: new Date()
    });

    let moduleCompletionPoints = 0;
    if (module.level === 'aprendiz') {
      moduleCompletionPoints = GAMIFICATION_CONSTANTS.POINTS.MODULE_COMPLETION_APRENDIZ;
    } else if (module.level === 'virtuoso') {
      moduleCompletionPoints = GAMIFICATION_CONSTANTS.POINTS.MODULE_COMPLETION_VIRTUOSO;
    } else if (module.level === 'maestro') {
      moduleCompletionPoints = GAMIFICATION_CONSTANTS.POINTS.MODULE_COMPLETION_MAESTRO;
    }

    user.totalPoints = (user.totalPoints || 0) + moduleCompletionPoints;

    console.log(`✅ Módulo "${module.title}" (${module.level}) marcado como completo!`);
    console.log(`   Pontos ganhos: ${moduleCompletionPoints} (nível: ${module.level})`);
    console.log(`   Total de pontos: ${user.totalPoints}`);
    console.log(`   Módulos completados: ${user.completedModules.length}`);

    await user.save();

    // Persistir progresso semanal (módulos nos últimos 7 dias) para ranking/perfil
    try {
      const GamificationService = require('./gamification.service');
      await GamificationService.updateWeeklyProgress(userId);
    } catch (weeklyError) {
      console.warn('⚠️ Não foi possível atualizar weeklyProgress:', weeklyError?.message || weeklyError);
    }

    invalidateCache('/api/gamification');
    invalidateCache('/api/modules');
    invalidateCache('/api/modules/categories-with-modules');

    console.log(`🗑️ [COMPLETE-MODULE] Cache invalidado após completar módulo ${moduleId}`);

    return {
      status: 200,
      body: {
        success: true,
        message: 'Módulo marcado como completo com sucesso!',
        pointsEarned: moduleCompletionPoints,
        totalPoints: user.totalPoints,
        completedModules: user.completedModules.length,
        level: user.level
      }
    };
  }

  static async getNextModule(userId) {
    console.log(`🔍 Buscando próximo módulo recomendado para usuário: ${userId}`);

    const user = await User.findById(userId);
    const completedModuleIds = user.completedModules.map((cm) => cm.moduleId.toString());

    const modules = await Module.find({
      level: user.level,
      isActive: true
    }).sort({ order: 1 });

    const nextModule = modules.find(
      (module) => !completedModuleIds.includes(module._id.toString())
    );

    if (!nextModule) {
      console.log(`ℹ️ Nenhum módulo pendente encontrado para o nível: ${user.level}`);
      return {
        status: 200,
        body: {
          success: true,
          message: 'Todos os módulos deste nível foram completados',
          hasNextModule: false
        }
      };
    }

    console.log(`✅ Próximo módulo recomendado: ${nextModule.title}`);
    return {
      status: 200,
      body: {
        success: true,
        hasNextModule: true,
        module: {
          ...nextModule.toObject(),
          isCompleted: false
        }
      }
    };
  }

  static async getCategories() {
    console.log('🔍 Buscando categorias disponíveis');

    console.log('🔍 Contando módulos por categoria');
    const moduleCounts = await Module.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    console.log('📊 Contagem de módulos por categoria:', moduleCounts);

    const categoriesWithCount = CATEGORY_DEFINITIONS.map((cat) => {
      const count = moduleCounts.find((mc) => mc._id === cat.id);
      return {
        ...cat,
        moduleCount: count ? count.count : 0
      };
    });

    return {
      status: 200,
      body: {
        success: true,
        categories: categoriesWithCount
      }
    };
  }

  static async getCategoriesWithModules() {
    console.log('🚀 [OTIMIZADO] Buscando categorias COM módulos em UMA única query...');
    const startTime = Date.now();

    const modules = await Module.find({ isActive: true })
      .sort({ order: 1 })
      .select('_id title description category level order quizzes')
      .populate({
        path: 'quizzes',
        select: 'timeLimit',
        options: { lean: true }
      })
      .lean()
      .hint({ isActive: 1, order: 1 });

    const queryTime = Date.now() - startTime;
    console.log(`📊 Módulos carregados: ${modules.length} (query: ${queryTime}ms)`);

    const categoriesMap = {};
    CATEGORY_DEFINITIONS.forEach((cat) => {
      categoriesMap[cat.id] = { ...cat, modules: [] };
    });

    const processStartTime = Date.now();

    for (const module of modules) {
      let quizTimeLimit = null;

      if (module.quizzes && module.quizzes.length > 0) {
        const quiz = Array.isArray(module.quizzes) ? module.quizzes[0] : module.quizzes;
        if (quiz && quiz.timeLimit && quiz.timeLimit > 0) {
          quizTimeLimit = quiz.timeLimit;
        }
      }

      const moduleData = {
        id: module._id.toString(),
        title: module.title,
        description: module.description,
        category: module.category,
        level: module.level,
        order: module.order,
        quizTimeLimit: quizTimeLimit || 300,
        isCompleted: false,
        isLocked: false
      };

      const category = categoriesMap[module.category];
      if (category) {
        category.modules.push(moduleData);
      }
    }

    const processTime = Date.now() - processStartTime;
    console.log(`⚡ Processamento: ${processTime}ms`);

    const sortStartTime = Date.now();
    const result = [];

    for (const category of Object.values(categoriesMap)) {
      if (category.modules.length > 0) {
        category.modules.sort((a, b) => a.order - b.order);
        result.push({
          id: category.id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          modules: category.modules,
          moduleCount: category.modules.length
        });
      }
    }

    const sortTime = Date.now() - sortStartTime;
    const totalTime = Date.now() - startTime;

    console.log(
      `✅ Categorias agrupadas: ${result.length} (ordenação: ${sortTime}ms, total: ${totalTime}ms)`
    );
    console.log(
      `📊 Performance: Query=${queryTime}ms, Process=${processTime}ms, Sort=${sortTime}ms, Total=${totalTime}ms`
    );

    return {
      status: 200,
      body: {
        success: true,
        categories: result,
        meta: {
          totalCategories: result.length,
          totalModules: modules.length,
          queryTime,
          processTime,
          sortTime,
          totalTime
        }
      }
    };
  }

  static async getModulesByLevel(level) {
    console.log(`🔍 Buscando módulos do nível: ${level}`);

    if (!['aprendiz', 'virtuoso', 'maestro'].includes(level)) {
      console.log(`❌ Nível inválido: ${level}`);
      return {
        status: 400,
        body: {
          success: false,
          message: 'Nível inválido. Use: aprendiz, virtuoso ou maestro'
        }
      };
    }

    const modules = await Module.find({
      level,
      isActive: true
    })
      .sort({ order: 1 })
      .select('-content.exercises');

    console.log(`📊 Módulos encontrados para o nível ${level}: ${modules.length}`);

    return {
      status: 200,
      body: {
        success: true,
        count: modules.length,
        modules: modules.map((module) => ({
          ...module.toObject(),
          isCompleted: false,
          isLocked: false
        }))
      }
    };
  }

  static async getModuleStats() {
    console.log('🔍 Buscando estatísticas de módulos');

    const levelStats = await Module.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const totalModules = await Module.countDocuments({ isActive: true });

    const stats = {
      total: totalModules,
      byLevel: levelStats.map((stat) => ({
        level: stat._id,
        levelName: getNivelName(stat._id),
        count: stat.count
      }))
    };

    console.log('📊 Estatísticas de módulos:', stats);

    return {
      status: 200,
      body: {
        success: true,
        stats
      }
    };
  }
}

module.exports = ModuleService;
