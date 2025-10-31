const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const moduleRoutes = require('./routes/module.routes');
const quizRoutes = require('./routes/quiz.routes');
const gamificationRoutes = require('./routes/gamification.routes');
const quizAttemptRoutes = require('./routes/quizAttempt.routes');

// Importar middlewares
const errorHandler = require('./middlewares/errorHandler');
const { cacheMiddleware } = require('./middlewares/cache');

const app = express();

// Se atrás de proxy (Render/Heroku/NGINX), habilita IP correto para rate-limit
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Configurações de segurança
app.use(helmet());
app.use(compression());

// CORS - controlado por ambiente
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mobile apps/health checks
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true
}));

// Rate limiting otimizado para produção
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // limite aumentado para 1000 requisições (5x mais)
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
  // Permitir mais requests para usuários autenticados
  skip: (req) => {
    // Pular rate limiting para usuários autenticados em algumas rotas
    return req.user && req.path.includes('/stats');
  }
});
app.use('/api', limiter);

// Rate limiting mais restrito para auth (mas ainda aumentado)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // limite aumentado para 300 requisições (3x mais)
  message: 'Muitas tentativas, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Rate limiting específico para stats (mais permissivo)
const statsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // limite específico para stats
  message: 'Muitas requisições de estatísticas, tente novamente mais tarde'
});
app.use('/api/users/stats', statsLimiter);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API NoteMusic funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

module.exports = app;