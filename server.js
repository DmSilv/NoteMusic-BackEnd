const app = require('./src/app');
const connectDB = require('./src/config/database');

// Carregar variáveis de ambiente
require('dotenv').config();

const PORT = process.env.PORT || 3333;

// Conectar ao banco de dados
connectDB();

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🌐 Acessível em: http://localhost:${PORT}`);
});