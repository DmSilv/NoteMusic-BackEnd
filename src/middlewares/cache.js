const NodeCache = require('node-cache');

// Cache global com TTL de 5 minutos por padrão
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutos
  checkperiod: 60, // Verificar itens expirados a cada 60 segundos
  useClones: false // Melhor performance
});

// Middleware de cache para rotas GET
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Apenas cachear requisições GET
    if (req.method !== 'GET') {
      return next();
    }

    // Criar chave única baseada na URL e parâmetros
    const key = `${req.originalUrl || req.url}_${JSON.stringify(req.query)}_${req.user?.id || 'anonymous'}`;
    
    // Tentar obter do cache
    const cachedData = cache.get(key);
    
    if (cachedData) {
      console.log(`💾 Cache HIT: ${key}`);
      return res.json(cachedData);
    }

    // Se não está em cache, salvar resposta original
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Cachear apenas respostas bem-sucedidas
      if (res.statusCode === 200) {
        cache.set(key, data, duration);
        console.log(`💾 Cache SET: ${key} (TTL: ${duration}s)`);
      }
      return originalJson(data);
    };
    
    next();
  };
};

// Invalidar cache por padrão
const invalidateCache = (pattern) => {
  const keys = cache.keys();
  const patternRegex = new RegExp(pattern);
  
  let invalidated = 0;
  keys.forEach(key => {
    if (patternRegex.test(key)) {
      cache.del(key);
      invalidated++;
    }
  });
  
  console.log(`🗑️ Cache invalidado: ${invalidated} chaves removidas (padrão: ${pattern})`);
  return invalidated;
};

// Limpar todo o cache
const clearCache = () => {
  cache.flushAll();
  console.log('🗑️ Todo o cache foi limpo');
};

// Estatísticas do cache
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  clearCache,
  getCacheStats,
  cache
};

