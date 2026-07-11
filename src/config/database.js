const dns = require('dns');
const mongoose = require('mongoose');

// Em alguns Windows (ex.: pós-formatação) o DNS do sistema recusa querySrv,
// e o mongodb+srv falha com ECONNREFUSED mesmo com internet ok.
// Forçar resolvers públicos só no processo Node (não muda o DNS do PC).
if (process.env.NODE_ENV !== 'production') {
  const current = dns.getServers();
  dns.setServers(['8.8.8.8', '1.1.1.1', ...current.filter((s) => s !== '8.8.8.8' && s !== '1.1.1.1')]);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro ao conectar ao MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;