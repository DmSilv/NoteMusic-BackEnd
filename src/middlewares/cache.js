const NodeCache = require('node-cache');

// Cache global com TTL de 5 minutos por padrão
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutos
  checkperiod: 60, // Verificar itens expirados a cada 60 segundos
  useClones: false // Melhor performance
});

// ✅ VERSÃO DO CACHE: Incrementar quando houver mudanças estruturais
const CACHE_VERSION = process.env.CACHE_VERSION || '1.0.0';

// Middleware de cache para rotas GET
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Apenas cachear requisições GET
    if (req.method !== 'GET') {
      return next();
    }

    // ✅ BYPASS DE CACHE: Permitir forçar atualização via query parameter
    const bypassCache = req.query._nocache === 'true' || req.query._refresh === 'true';
    if (bypassCache) {
      console.log(`🔄 [CACHE] Bypass solicitado via query parameter`);
      // Remover parâmetro da query para não afetar a chave
      delete req.query._nocache;
      delete req.query._refresh;
    }

    // ✅ VALIDAÇÃO CRÍTICA: Criar chave única baseada na URL, parâmetros, usuário E versão
    // Para rotas protegidas, SEMPRE incluir o ID do usuário na chave
    // Para rotas públicas, usar 'anonymous' mas NUNCA cachear dados de usuários
    const userId = req.user?.id ? req.user.id.toString() : 'anonymous';
    const key = `${req.originalUrl || req.url}_${JSON.stringify(req.query)}_${userId}_v${CACHE_VERSION}`;
    
    // ✅ VALIDAÇÃO DE SEGURANÇA: Para rotas protegidas, garantir que o cache é isolado por usuário
    // Tentar obter do cache (apenas se não for bypass)
    const cachedData = bypassCache ? null : cache.get(key);
    
    if (cachedData) {
      // ✅ VALIDAÇÃO EXTRA: Para rotas protegidas, verificar se os dados do cache pertencem ao usuário correto
      if (req.user && userId !== 'anonymous' && cachedData._cachedUserId) {
        if (cachedData._cachedUserId !== userId) {
          console.error(`❌ [CACHE] ERRO CRÍTICO: Cache com dados de outro usuário! Limpando...`);
          console.error(`   Cache userId: ${cachedData._cachedUserId}, Request userId: ${userId}`);
          cache.del(key);
          // Continuar sem cache - não retornar dados incorretos
        } else {
          // Dados válidos - remover campos internos e retornar
          const cleanData = { ...cachedData };
          delete cleanData._cachedUserId;
          delete cleanData._cachedAt;
          console.log(`💾 [CACHE] Cache HIT para usuário ${userId}: ${key.substring(0, 100)}...`);
          return res.json(cleanData);
        }
      } else {
        // Rotas públicas ou cache sem validação de usuário - retornar normalmente
        const cleanData = { ...cachedData };
        delete cleanData._cachedUserId;
        delete cleanData._cachedAt;
        console.log(`💾 [CACHE] Cache HIT: ${key.substring(0, 100)}...`);
        return res.json(cleanData);
      }
    }

    // Se não está em cache, salvar resposta original
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // ✅ HEADERS DE CACHE: Adicionar headers para controle de cache no frontend
      if (bypassCache) {
        // Se foi bypass, adicionar headers para não cachear no frontend
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Cache-Status': 'bypassed'
        });
      } else {
        // Headers normais com controle de cache
        res.set({
          'Cache-Control': `public, max-age=${Math.floor(duration / 2)}`, // Metade do TTL do servidor
          'X-Cache-Version': CACHE_VERSION,
          'X-Cache-TTL': duration.toString()
        });
      }

      // Cachear apenas respostas bem-sucedidas e se não for bypass
      if (res.statusCode === 200 && !bypassCache) {
        // ✅ VALIDAÇÃO: Para rotas protegidas, adicionar userId aos dados do cache
        if (req.user && userId !== 'anonymous') {
          // Criar cópia dos dados com userId para validação futura
          const dataWithUserId = {
            ...data,
            _cachedUserId: userId, // Campo interno para validação
            _cachedAt: new Date().toISOString(),
            _cacheVersion: CACHE_VERSION
          };
          cache.set(key, dataWithUserId, duration);
          console.log(`💾 [CACHE] Cache SET para usuário ${userId} (TTL: ${duration}s, v${CACHE_VERSION})`);
        } else {
          // Para rotas públicas, cachear normalmente
          const dataWithVersion = {
            ...data,
            _cacheVersion: CACHE_VERSION
          };
          cache.set(key, dataWithVersion, duration);
          console.log(`💾 [CACHE] Cache SET (público) (TTL: ${duration}s, v${CACHE_VERSION})`);
        }
      }
      
      // Remover campos internos antes de retornar
      if (data._cachedUserId) {
        delete data._cachedUserId;
        delete data._cachedAt;
      }
      if (data._cacheVersion) {
        delete data._cacheVersion;
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
  const keysBefore = cache.keys().length;
  cache.flushAll();
  console.log(`🗑️ Todo o cache foi limpo (${keysBefore} chaves removidas)`);
  return keysBefore;
};

// Limpar cache por versão antiga (útil para atualizações)
const clearCacheByVersion = (oldVersion) => {
  const keys = cache.keys();
  let invalidated = 0;
  
  keys.forEach(key => {
    const cachedData = cache.get(key);
    if (cachedData && cachedData._cacheVersion && cachedData._cacheVersion !== CACHE_VERSION) {
      cache.del(key);
      invalidated++;
    }
  });
  
  console.log(`🗑️ Cache limpo por versão: ${invalidated} chaves removidas (versão antiga: ${oldVersion})`);
  return invalidated;
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

// Obter versão atual do cache
const getCacheVersion = () => CACHE_VERSION;

module.exports = {
  cacheMiddleware,
  invalidateCache,
  clearCache,
  clearCacheByVersion,
  getCacheStats,
  getCacheVersion,
  cache
};






