const Module = require('../models/module.model');
const User = require('../models/user.model');
const Quiz = require('../models/quiz.model');
const { GAMIFICATION_CONSTANTS } = require('../utils/gamificationRebalanced');
const { invalidateCache } = require('../middlewares/cache');

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

    console.log(`🔍 [GET-MODULES] Executando query com filtro:`, filter);

    // ✅ QUERY OTIMIZADA: Buscar apenas campos essenciais
    const modules = await Module.find(filter)
      .sort({ order: 1 })
      .select('_id title description category level order quizzes') // ✅ Apenas campos essenciais
      .populate({
        path: 'quizzes',
        select: 'timeLimit', // ✅ Apenas timeLimit
        options: { lean: true }
      })
      .lean(); // ✅ Usar lean() para melhor performance

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
    const modulesWithProgress = modules.map(module => {
      // Adicionar quizTimeLimit baseado no quiz associado
      let quizTimeLimit = null;
      if (module.quizzes && module.quizzes.length > 0) {
        const quiz = module.quizzes[0];
        // Se tem timeLimit definido, usar; senão calcular baseado no número de questões
        if (quiz.timeLimit && quiz.timeLimit > 0) {
          quizTimeLimit = quiz.timeLimit;
        } else if (quiz.questions && quiz.questions.length > 0) {
          quizTimeLimit = quiz.questions.length * 2 * 60; // 2 minutos por questão
        }
      } else if (module.quizzes && module.quizzes._id) {
        // Formato popula
        const quiz = module.quizzes;
        if (quiz.timeLimit && quiz.timeLimit > 0) {
          quizTimeLimit = quiz.timeLimit;
        } else if (quiz.questions && quiz.questions.length > 0) {
          quizTimeLimit = quiz.questions.length * 2 * 60;
        }
      }
      
      return {
        ...module,
        quizTimeLimit,
        isCompleted: false,
        isLocked: false
      };
    });

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

    // Query otimizada: buscar apenas completedModules (não todo o documento)
    const user = await User.findById(req.user.id)
      .select('completedModules')
      .lean();
    const completedModuleIds = (user?.completedModules || []).map(cm => cm.moduleId?.toString()).filter(Boolean);
    
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

// @desc    Marcar módulo como completo (COM VALIDAÇÃO RIGOROSA)
// @route   POST /api/modules/:id/complete
// @access  Private
exports.completeModule = async (req, res, next) => {
  try {
    const moduleId = req.params.id;
    console.log(`🔍 Marcando módulo como completo: ${moduleId}`);
    
    // Verificar se o módulo existe
    const module = await Module.findById(moduleId).populate('quizzes');
    if (!module) {
      console.log(`❌ Módulo não encontrado: ${moduleId}`);
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    // Buscar usuário
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o usuário já completou este módulo
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

    // ✅ VALIDAÇÃO RIGOROSA: Verificar se TODOS os quizzes do módulo foram completados
    const moduleQuizIds = module.quizzes.map(quiz => quiz._id.toString());
    const completedQuizIds = user.completedQuizzes
      .filter(cq => cq.passed) // Apenas quizzes aprovados
      .map(cq => cq.quizId.toString());

    const completedQuizzesInModule = moduleQuizIds.filter(quizId => 
      completedQuizIds.includes(quizId)
    );

    console.log(`🔍 Validação de conclusão do módulo "${module.title}":`);
    console.log(`   Quizzes no módulo: ${moduleQuizIds.length}`);
    console.log(`   Quizzes completados pelo usuário: ${completedQuizzesInModule.length}`);
    console.log(`   IDs dos quizzes: ${moduleQuizIds}`);
    console.log(`   IDs completados: ${completedQuizzesInModule}`);

    // Verificar se TODOS os quizzes foram completados
    if (moduleQuizIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Este módulo não possui quizzes para completar'
      });
    }

    if (completedQuizzesInModule.length !== moduleQuizIds.length) {
      const missingQuizzes = moduleQuizIds.filter(quizId => 
        !completedQuizzesInModule.includes(quizId)
      );
      
      console.log(`❌ Módulo não pode ser completado. Quizzes faltando: ${missingQuizzes.length}`);
      
      return res.status(400).json({
        success: false,
        message: `Você precisa completar todos os quizzes deste módulo primeiro. Faltam ${missingQuizzes.length} quiz(es).`,
        missingQuizzes: missingQuizzes.length,
        totalQuizzes: moduleQuizIds.length,
        completedQuizzes: completedQuizzesInModule.length
      });
    }

    // ✅ MÓDULO PODE SER COMPLETADO - Adicionar à lista de módulos completados
    user.completedModules.push({
      moduleId,
      completedAt: new Date()
    });

    // Adicionar pontos por completar módulo BASEADO NO NÍVEL DO MÓDULO
    let moduleCompletionPoints = 0;
    if (module.level === 'aprendiz') {
      moduleCompletionPoints = GAMIFICATION_CONSTANTS.POINTS.MODULE_COMPLETION_APRENDIZ; // 50
    } else if (module.level === 'virtuoso') {
      moduleCompletionPoints = GAMIFICATION_CONSTANTS.POINTS.MODULE_COMPLETION_VIRTUOSO; // 100
    } else if (module.level === 'maestro') {
      moduleCompletionPoints = GAMIFICATION_CONSTANTS.POINTS.MODULE_COMPLETION_MAESTRO; // 150
    }
    
    user.totalPoints = (user.totalPoints || 0) + moduleCompletionPoints;
    
    console.log(`✅ Módulo "${module.title}" (${module.level}) marcado como completo!`);
    console.log(`   Pontos ganhos: ${moduleCompletionPoints} (nível: ${module.level})`);
    console.log(`   Total de pontos: ${user.totalPoints}`);
    console.log(`   Módulos completados: ${user.completedModules.length}`);

    await user.save();

    // ✅ Invalidar cache de gamificação e módulos após completar módulo
    invalidateCache('/api/gamification');
    invalidateCache('/api/modules');
    invalidateCache('/api/modules/categories-with-modules'); // ✅ Invalidar endpoint otimizado também
    
    console.log(`🗑️ [COMPLETE-MODULE] Cache invalidado após completar módulo ${moduleId}`);

    res.status(200).json({
      success: true,
      message: 'Módulo marcado como completo com sucesso!',
      pointsEarned: moduleCompletionPoints,
      totalPoints: user.totalPoints,
      completedModules: user.completedModules.length,
      level: user.level
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

// @desc    Obter categorias disponíveis (OTIMIZADO - apenas contagem)
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

    // Contar módulos por categoria (otimizado - apenas agregação)
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

// @desc    Obter categorias COM módulos agrupados (OTIMIZADO - UMA única requisição)
// @route   GET /api/modules/categories-with-modules
// @access  Public
exports.getCategoriesWithModules = async (req, res, next) => {
  try {
    console.log('🚀 [OTIMIZADO] Buscando categorias COM módulos em UMA única query...');
    const startTime = Date.now();
    
    // ✅ QUERY ULTRA-OTIMIZADA: Buscar apenas campos essenciais
    // Usar índices compostos para melhor performance
    const modules = await Module.find({ isActive: true })
      .sort({ order: 1 })
      .select('_id title description category level order quizzes') // ✅ Apenas campos essenciais
      .populate({
        path: 'quizzes',
        select: 'timeLimit', // ✅ Apenas timeLimit (não precisa de questions.length)
        options: { lean: true }
      })
      .lean()
      .hint({ isActive: 1, order: 1 }); // ✅ Forçar uso de índice composto

    const queryTime = Date.now() - startTime;
    console.log(`📊 Módulos carregados: ${modules.length} (query: ${queryTime}ms)`);

    // Agrupar módulos por categoria e adicionar quizTimeLimit
    const categoriesMap = {
      'propriedades-som': { id: 'propriedades-som', name: 'Propriedades do Som', description: 'Aprenda sobre frequência, timbre, intensidade e duração', icon: 'sound-wave', modules: [] },
      'escalas-maiores': { id: 'escalas-maiores', name: 'Escalas Maiores', description: 'Domine as escalas maiores e seus padrões', icon: 'piano', modules: [] },
      'figuras-musicais': { id: 'figuras-musicais', name: 'Figuras Musicais', description: 'Entenda as notas e seus valores', icon: 'music-note', modules: [] },
      'ritmo-ternarios': { id: 'ritmo-ternarios', name: 'Ritmos Ternários', description: 'Explore os compassos ternários', icon: 'metronome', modules: [] },
      'compasso-simples': { id: 'compasso-simples', name: 'Compasso Simples', description: 'Compreenda os compassos simples', icon: 'drum', modules: [] },
      'andamento-dinamica': { id: 'andamento-dinamica', name: 'Andamento e Dinâmica', description: 'Velocidade e intensidade na música', icon: 'speedometer', modules: [] },
      'solfegio-basico': { id: 'solfegio-basico', name: 'Solfejo Básico', description: 'Desenvolva a leitura musical', icon: 'microphone', modules: [] },
      'articulacao-musical': { id: 'articulacao-musical', name: 'Articulação Musical', description: 'Técnicas de execução e expressão', icon: 'hand', modules: [] },
      'intervalos-musicais': { id: 'intervalos-musicais', name: 'Intervalos Musicais', description: 'Distâncias entre as notas', icon: 'ruler', modules: [] },
      'expressao-musical': { id: 'expressao-musical', name: 'Expressão Musical', description: 'Interpretação e sentimento', icon: 'heart', modules: [] },
      'sincopa-contratempo': { id: 'sincopa-contratempo', name: 'Síncopa e Contratempo', description: 'Ritmos sincopados e contratempos', icon: 'shuffle', modules: [] },
      'compasso-composto': { id: 'compasso-composto', name: 'Compasso Composto', description: 'Compassos compostos e suas divisões', icon: 'layers', modules: [] }
    };

    // ✅ PROCESSAMENTO OTIMIZADO: Processar módulos de forma eficiente
    const processStartTime = Date.now();
    
    for (const module of modules) {
      // ✅ Calcular quizTimeLimit de forma otimizada
      let quizTimeLimit = null;
      
      if (module.quizzes && module.quizzes.length > 0) {
        const quiz = Array.isArray(module.quizzes) ? module.quizzes[0] : module.quizzes;
        if (quiz && quiz.timeLimit && quiz.timeLimit > 0) {
          quizTimeLimit = quiz.timeLimit;
        }
        // ✅ Removido cálculo baseado em questions.length (não temos mais esse campo)
      }
      
      // ✅ Criar objeto mínimo necessário
      const moduleData = {
        id: module._id.toString(),
        title: module.title,
        description: module.description,
        category: module.category,
        level: module.level,
        order: module.order,
        quizTimeLimit: quizTimeLimit || 300, // ✅ Default de 5 minutos se não tiver
        isCompleted: false,
        isLocked: false
      };

      // ✅ Adicionar à categoria correspondente
      const category = categoriesMap[module.category];
      if (category) {
        category.modules.push(moduleData);
      }
    }
    
    const processTime = Date.now() - processStartTime;
    console.log(`⚡ Processamento: ${processTime}ms`);

    // ✅ OTIMIZAÇÃO: Ordenar apenas categorias com módulos e ordenar módulos
    const sortStartTime = Date.now();
    const result = [];
    
    for (const category of Object.values(categoriesMap)) {
      if (category.modules.length > 0) {
        // ✅ Ordenar módulos por ordem (já está ordenado pela query, mas garantir)
        category.modules.sort((a, b) => a.order - b.order);
        result.push({
          id: category.id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          modules: category.modules, // ✅ Já ordenado
          moduleCount: category.modules.length
        });
      }
    }
    
    const sortTime = Date.now() - sortStartTime;
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Categorias agrupadas: ${result.length} (ordenação: ${sortTime}ms, total: ${totalTime}ms)`);
    console.log(`📊 Performance: Query=${queryTime}ms, Process=${processTime}ms, Sort=${sortTime}ms, Total=${totalTime}ms`);

    // ✅ Resposta otimizada com apenas dados necessários
    res.json({
      success: true,
      categories: result,
      meta: {
        totalCategories: result.length,
        totalModules: modules.length,
        queryTime: queryTime,
        processTime: processTime,
        sortTime: sortTime,
        totalTime: totalTime
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar categorias com módulos:', error);
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