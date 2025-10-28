/**
 * 🔄 SINCRONIZAÇÃO DE DADOS: LOCAL → PRODUÇÃO
 * 
 * Este script sincroniza módulos e quizzes do banco local
 * para o banco de produção no Railway
 * 
 * ⚠️ CUIDADO: Este script pode sobrescrever dados existentes!
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Module = require('./src/models/Module');
const Quiz = require('./src/models/Quiz');

// URLs dos bancos
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/mongodb+srv://danielmingoranse84:NoteMusic2024@notemusicdb.y9jf3qj.mongodb.net/notemusic?retryWrites=true&w=majority&appName=NoteMusicDB';
const PRODUCTION_MONGODB_URI = process.env.MONGODB_URI; // Railway

// Validar se a URL de produção está configurada
if (!PRODUCTION_MONGODB_URI) {
  console.error('❌ ERRO: A variável MONGODB_URI não está configurada!\n');
  console.log('📋 Para configurar, você tem duas opções:\n');
  console.log('Opção 1: Criar arquivo .env na pasta Back End');
  console.log('   Criar um arquivo chamado ".env" com o conteúdo:');
  console.log('   MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/notemusic\n');
  console.log('Opção 2: Passar como variável de ambiente');
  console.log('   No Windows PowerShell:');
  console.log('   $env:MONGODB_URI="mongodb+srv://..."');
  console.log('   node sync-production-database.js\n');
  console.log('📝 Como obter a URL do Railway:');
  console.log('   1. Acesse: https://railway.app');
  console.log('   2. Abra seu projeto NoteMusic');
  console.log('   3. Vá em Variables');
  console.log('   4. Copie o valor de MONGODB_URI\n');
  process.exit(1);
}

async function syncData() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔄 SINCRONIZAÇÃO DE DADOS LOCAL → PRODUÇÃO');
    console.log('═══════════════════════════════════════════════════\n');

    // Conectar ao banco LOCAL
    console.log('1️⃣ Conectando ao banco LOCAL...');
    const localConnection = mongoose.createConnection(LOCAL_MONGODB_URI);
    console.log('✅ Conectado ao banco LOCAL');

    // Conectar ao banco PRODUÇÃO
    console.log('\n2️⃣ Conectando ao banco PRODUÇÃO (Railway)...');
    const productionConnection = mongoose.createConnection(PRODUCTION_MONGODB_URI);
    console.log('✅ Conectado ao banco PRODUÇÃO');

    // Buscar todos os módulos do LOCAL (apenas Aprendiz por enquanto)
    console.log('\n3️⃣ Buscando módulos do nível Aprendiz no banco LOCAL...');
    const LocalModule = localConnection.model('Module', Module.schema);
    const localModules = await LocalModule.find({ 
      level: 'aprendiz',
      isActive: true 
    }).populate('quizzes').lean();

    console.log(`✅ Encontrados ${localModules.length} módulos no banco LOCAL`);

    // Buscar módulos já existentes na PRODUÇÃO
    console.log('\n4️⃣ Verificando módulos existentes na PRODUÇÃO...');
    const ProductionModule = productionConnection.model('Module', Module.schema);
    const ProductionQuiz = productionConnection.model('Quiz', Quiz.schema);
    
    const productionModules = await ProductionModule.find({ 
      level: 'aprendiz' 
    }).lean();

    console.log(`   Existem ${productionModules.length} módulos na PRODUÇÃO`);

    // Comparar e identificar o que precisa ser adicionado
    const localModulesByTitle = new Map(localModules.map(m => [m.title, m]));
    const productionModulesByTitle = new Map(productionModules.map(m => [m.title, m]));

    const modulesToAdd = [];
    const quizzesToAdd = [];

    for (const [title, localModule] of localModulesByTitle) {
      if (!productionModulesByTitle.has(title)) {
        console.log(`   📦 Módulo para adicionar: ${title}`);
        modulesToAdd.push(localModule);

        // Adicionar quizzes deste módulo
        if (localModule.quizzes && localModule.quizzes.length > 0) {
          for (const quiz of localModule.quizzes) {
            if (!quiz._id) continue; // Verificar se é ObjectId válido
            quizzesToAdd.push({
              quiz,
              moduleTitle: title
            });
          }
        }
      } else {
        console.log(`   ✅ Já existe: ${title}`);
      }
    }

    console.log(`\n📊 Resumo:`);
    console.log(`   Módulos para adicionar: ${modulesToAdd.length}`);
    console.log(`   Quizzes para adicionar: ${quizzesToAdd.length}`);

    if (modulesToAdd.length === 0) {
      console.log('\n✅ Todos os módulos já estão sincronizados!');
      await localConnection.close();
      await productionConnection.close();
      return;
    }

    // Confirmar antes de prosseguir
    console.log('\n⚠️ ATENÇÃO: Vamos adicionar os módulos à PRODUÇÃO.');
    console.log('   Isso pode sobrescrever dados existentes.');

    // Adicionar módulos
    console.log('\n5️⃣ Adicionando módulos na PRODUÇÃO...');
    for (const moduleData of modulesToAdd) {
      try {
        // Remover _id para criar novo
        const { _id, quizzes, ...moduleFields } = moduleData;
        
        const newModule = await ProductionModule.create(moduleFields);
        console.log(`   ✅ Módulo criado: ${newModule.title}`);

        // Adicionar quizzes correspondentes
        if (quizzes && Array.isArray(quizzes) && quizzes.length > 0) {
          for (const quizData of quizzes) {
            const { _id: quizId, ...quizFields } = quizData;
            const newQuiz = await ProductionQuiz.create({
              ...quizFields,
              module: newModule._id
            });
            console.log(`      ✅ Quiz criado para o módulo`);
          }
        }

      } catch (error) {
        console.error(`   ❌ Erro ao adicionar módulo ${moduleData.title}:`, error.message);
      }
    }

    console.log('\n✅ Sincronização concluída!');

    // Fechar conexões
    await localConnection.close();
    await productionConnection.close();

    console.log('\n🎉 PROCESSO CONCLUÍDO COM SUCESSO!');
    console.log('\nPróximo passo: Verificar no Railway se os dados foram sincronizados.');

  } catch (error) {
    console.error('❌ Erro durante sincronização:', error);
    process.exit(1);
  }
}

// Executar sincronização
syncData();


