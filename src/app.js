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

// Importar middleware de erro
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Configurações de segurança
app.use(helmet());
app.use(compression());

// CORS - Permitir todas as origens em desenvolvimento
app.use(cors({
  origin: true, // Permitir todas as origens
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // limite de 200 requisições (aumentado de 100)
  message: 'Muitas requisições, tente novamente mais tarde'
});
app.use('/api', limiter);

// Rate limiting mais restrito para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // limite de 20 requisições (aumentado de 5)
  message: 'Muitas tentativas, tente novamente mais tarde'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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