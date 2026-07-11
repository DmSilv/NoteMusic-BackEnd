// Carregar variáveis de ambiente ANTES de importar qualquer módulo da app.
// Serviços como email.service.js leem process.env na hora do require()
// (instanciados como singleton), então se o dotenv carregasse depois, esses
// módulos veriam as variáveis como undefined mesmo com o .env configurado.
require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');
const { startWeeklyDailyChallengeScheduler } = require('./src/jobs/weeklyDailyChallengeJob');

const PORT = process.env.PORT || 3333;

// Conectar ao banco de dados
connectDB();

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🌐 Acessível em: http://localhost:${PORT}`);
  
  // Health check imediato após iniciar
  console.log('✅ Servidor pronto para receber requisições');

  // Gera/completa a semana do desafio diário em background
  startWeeklyDailyChallengeScheduler();
});

// Graceful shutdown - importante para Railway/Render
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, encerrando servidor graciosamente...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
  
  // Forçar encerramento após 10 segundos
  setTimeout(() => {
    console.error('⚠️ Forçando encerramento...');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido, encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});