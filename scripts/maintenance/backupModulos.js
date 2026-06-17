require('dotenv').config();
const mongoose = require('mongoose');
const Module = require('../../src/models/module.model');
const fs = require('fs');
const path = require('path');

async function backupModulos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    const modules = await Module.find({}).lean();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(__dirname, '../backups', `modulos_backup_${timestamp}.json`);
    
    // Criar diretório de backups se não existir
    const backupsDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    fs.writeFileSync(backupPath, JSON.stringify(modules, null, 2));
    
    console.log(`✅ Backup criado: ${backupPath}`);
    console.log(`📊 Total de módulos no backup: ${modules.length}\n`);
    
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

backupModulos();

