const app = require('./src/app');
const connectDB = require('./src/config/database');

// Carregar variáveis de ambiente
require('dotenv').config();

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