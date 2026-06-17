const mongoose = require('mongoose');
require('dotenv').config();

const limpar = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');

    console.log('🔍 Procurando usuários com totalPoints inválido...\n');
    
    // Buscar TODOS os usuários e verificar
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`📊 Total de usuários encontrados: ${allUsers.length}\n`);

    let corrigidos = 0;
    
    for (const user of allUsers) {
      const needsUpdate = 
        user.totalPoints === null ||
        user.totalPoints === undefined ||
        typeof user.totalPoints !== 'number' ||
        isNaN(user.totalPoints);
      
      if (needsUpdate) {
        console.log(`⚠️  Usuário ${user.email}:`);
        console.log(`   totalPoints atual: ${user.totalPoints} (tipo: ${typeof user.totalPoints})`);
        
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { totalPoints: 0 } }
        );
        
        console.log(`   ✅ Atualizado para: 0\n`);
        corrigidos++;
      } else {
        console.log(`✅ Usuário ${user.email}: OK (${user.totalPoints} pontos)`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 RESUMO:`);
    console.log(`   Total de usuários: ${allUsers.length}`);
    console.log(`   Usuários corrigidos: ${corrigidos}`);
    console.log(`   Usuários OK: ${allUsers.length - corrigidos}`);
    
    if (corrigidos > 0) {
      console.log('\n✅ Correção concluída! Reinicie o backend e o app.');
    } else {
      console.log('\n✅ Todos os usuários já estão corretos!');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
};

limpar();

