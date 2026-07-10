const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const moduleRoutes = require('./routes/module.routes');
const quizRoutes = require('./routes/quiz.routes');
const gamificationRoutes = require('./routes/gamification.routes');
const quizAttemptRoutes = require('./routes/quizAttempt.routes');

// Importar middlewares
const errorHandler = require('./middlewares/errorHandler');
const requireAdminSecret = require('./middlewares/adminSecret');

// Importar funções de cache
const { 
  clearCache,
  getCacheStats,
  getCacheVersion,
  invalidateCache 
} = require('./middlewares/cache');

const app = express();

// Configuração de proxy (Render/Heroku/NGINX)
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Middlewares de segurança e performance
app.use(helmet());
app.use(compression());

// CORS configurável por ambiente
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true
}));

// Rate limiting geral
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user && req.path.includes('/stats')
});
app.use('/api', limiter);

// Rate limiting específico para Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Muitas tentativas, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false
});
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
}

// Rate limiting para recuperação de senha (anti-abuso)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Muitas solicitações de recuperação. Tente novamente em 1 hora.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/auth/forgotpassword', passwordResetLimiter);
  app.use('/api/auth/resetpassword', passwordResetLimiter);
}

// Rate limiting para estatísticas
const statsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Muitas requisições de estatísticas, tente novamente mais tarde'
});
app.use('/api/users/stats', statsLimiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check principal
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API NoteMusic funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Health check alternativo
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

//
// =========================
// ROTAS DE CACHE (ORGANIZADAS)
// =========================
//

// Estatísticas do cache (admin)
app.get('/api/cache/stats', requireAdminSecret, (req, res) => {
  const stats = getCacheStats();
  res.json({
    success: true,
    cache: {
      ...stats,
      version: getCacheVersion(),
      timestamp: new Date().toISOString()
    }
  });
});

// Limpar cache
app.post('/api/cache/clear', requireAdminSecret, (req, res) => {
  const cleared = clearCache();
  res.json({
    success: true,
    message: 'Cache limpo com sucesso',
    keysCleared: cleared,
    timestamp: new Date().toISOString()
  });
});

// Invalidação por padrão
app.post('/api/cache/invalidate', requireAdminSecret, (req, res) => {
  const { pattern } = req.body;

  if (!pattern) {
    return res.status(400).json({
      success: false,
      message: 'Padrão de invalidação é obrigatório'
    });
  }

  const invalidated = invalidateCache(pattern);
  res.json({
    success: true,
    message: 'Cache invalidado com sucesso',
    keysInvalidated: invalidated,
    pattern,
    timestamp: new Date().toISOString()
  });
});

//
// =========================
// ROTAS PRINCIPAIS DA API
// =========================
//
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);

// Middleware de erro (por último)
app.use(errorHandler);

// Rota 404 padrão
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

module.exports = app;
