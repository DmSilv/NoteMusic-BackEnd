const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../../src/models/user.model');
const { USER_LEVELS } = require('../../src/utils/constants');

// Conectar ao banco
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
};

// Verificar e atualizar o nível do usuário com base em pontos e módulos completados
const checkUserLevelProgression = async () => {
  try {
    console.log('🔍 Verificando progressão de níveis dos usuários...');
    
    // Buscar todos os usuários
    const users = await User.find({}).populate('completedModules.moduleId');
    console.log(`📊 Total de usuários encontrados: ${users.length}`);
    
    let updatedCount = 0;
    
    // Para cada usuário
    for (const user of users) {
      console.log(`\n👤 Analisando usuário: ${user.name || user.email}`);
      console.log(`   Nível atual: ${user.level}`);
      console.log(`   Total de pontos: ${user.totalPoints}`);
      console.log(`   Módulos completados: ${user.completedModules.length}`);
      
      const completedModules = user.completedModules.length;
      const totalPoints = user.totalPoints || 0;
      let shouldUpdate = false;
      let newLevel = user.level;
      
      // Verificar se o usuário deve avançar de nível
      switch (user.level) {
        case USER_LEVELS.BEGINNER: // aprendiz
          if (completedModules >= 2 || totalPoints >= 150) {
            newLevel = USER_LEVELS.INTERMEDIATE; // virtuoso
            shouldUpdate = true;
            console.log(`   ✨ Usuário qualificado para avançar para ${newLevel}`);
          }
          break;
        
        case USER_LEVELS.INTERMEDIATE: // virtuoso
          if (completedModules >= 4 || totalPoints >= 300) {
            newLevel = USER_LEVELS.ADVANCED; // maestro
            shouldUpdate = true;
            console.log(`   ✨ Usuário qualificado para avançar para ${newLevel}`);
          }
          break;
          
        default:
          break;
      }
      
      // Se o usuário deve avançar de nível
      if (shouldUpdate) {
        console.log(`   🔄 Atualizando nível de ${user.level} para ${newLevel}`);
        
        user.level = newLevel;
        await user.save();
        
        updatedCount++;
        console.log(`   ✅ Nível atualizado com sucesso!`);
      } else {
        console.log(`   ℹ️ Usuário permanece no nível ${user.level}`);
        
        // Verificar quanto falta para o próximo nível
        if (user.level === USER_LEVELS.BEGINNER) {
          const modulesNeeded = Math.max(0, 2 - completedModules);
          const pointsNeeded = Math.max(0, 150 - totalPoints);
          
          console.log(`   📊 Faltam ${modulesNeeded} módulos OU ${pointsNeeded} pontos para avançar para ${USER_LEVELS.INTERMEDIATE}`);
        } 
        else if (user.level === USER_LEVELS.INTERMEDIATE) {
          const modulesNeeded = Math.max(0, 4 - completedModules);
          const pointsNeeded = Math.max(0, 300 - totalPoints);
          
          console.log(`   📊 Faltam ${modulesNeeded} módulos OU ${pointsNeeded} pontos para avançar para ${USER_LEVELS.ADVANCED}`);
        }
      }
    }
    
    console.log(`\n📊 Resumo:`);
    console.log(`   Total de usuários verificados: ${users.length}`);
    console.log(`   Usuários que avançaram de nível: ${updatedCount}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar progressão de níveis:', error);
  }
};

// Função para verificar o cálculo de pontos nos quizzes
const checkQuizPointsCalculation = async () => {
  try {
    console.log('\n🔍 Verificando cálculo de pontos nos quizzes...');
    
    // Buscar usuários com quizzes completados
    const users = await User.find({ 'completedQuizzes.0': { $exists: true } });
    console.log(`📊 Usuários com quizzes completados: ${users.length}`);
    
    for (const user of users) {
      console.log(`\n👤 Usuário: ${user.name || user.email}`);
      console.log(`   Total de pontos: ${user.totalPoints}`);
      console.log(`   Quizzes completados: ${user.completedQuizzes.length}`);
      
      // Calcular pontos totais dos quizzes
      let totalQuizPoints = 0;
      
      for (const quiz of user.completedQuizzes) {
        const correctAnswers = quiz.score || 0;
        const quizPoints = correctAnswers * 10; // POINTS.QUIZ_QUESTION = 10
        
        // Bônus por desempenho (acima de 90%)
        let performanceBonus = 0;
        if (quiz.percentage >= 90) {
          performanceBonus = Math.round(quizPoints * 0.2); // POINTS.PERFECT_SCORE_BONUS = 0.2
        }
        
        const quizTotalPoints = quizPoints + performanceBonus;
        totalQuizPoints += quizTotalPoints;
        
        console.log(`   Quiz ${quiz.quizId}: ${correctAnswers} corretas, ${quizPoints} pontos base, ${performanceBonus} bônus, ${quizTotalPoints} total`);
      }
      
      console.log(`   📊 Total de pontos calculados dos quizzes: ${totalQuizPoints}`);
      
      // Verificar se há discrepância entre pontos calculados e pontos do usuário
      const pointsDiff = user.totalPoints - totalQuizPoints;
      if (Math.abs(pointsDiff) > 50) { // Permitir alguma variação devido a outros fatores
        console.log(`   ⚠️ Possível discrepância de pontos: ${pointsDiff} (${totalQuizPoints} calculados vs ${user.totalPoints} registrados)`);
      } else {
        console.log(`   ✅ Pontuação parece consistente`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar cálculo de pontos:', error);
  }
};

// Implementar função para atualizar o nível do usuário após completar um quiz
const implementLevelUpFunction = async () => {
  try {
    console.log('\n🔧 Implementando função de atualização de nível...');
    
    // Código da função a ser implementada no controlador de quiz
    const updateUserLevelCode = `
// Função para verificar e atualizar o nível do usuário
const updateUserLevel = async (user) => {
  try {
    const completedModules = user.completedModules.length;
    const totalPoints = user.totalPoints || 0;
    let shouldUpdate = false;
    let newLevel = user.level;
    
    // Verificar se o usuário deve avançar de nível
    switch (user.level) {
      case USER_LEVELS.BEGINNER: // aprendiz
        if (completedModules >= 2 || totalPoints >= 150) {
          newLevel = USER_LEVELS.INTERMEDIATE; // virtuoso
          shouldUpdate = true;
          console.log(\`🔼 Usuário \${user.name || user.email} avançou para \${newLevel}\`);
        }
        break;
      
      case USER_LEVELS.INTERMEDIATE: // virtuoso
        if (completedModules >= 4 || totalPoints >= 300) {
          newLevel = USER_LEVELS.ADVANCED; // maestro
          shouldUpdate = true;
          console.log(\`🔼 Usuário \${user.name || user.email} avançou para \${newLevel}\`);
        }
        break;
        
      default:
        break;
    }
    
    // Se o usuário deve avançar de nível
    if (shouldUpdate) {
      user.level = newLevel;
      await user.save();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erro ao atualizar nível do usuário:', error);
    return false;
  }
};
`;
    
    // Código para adicionar a chamada da função no submitQuizPrivate
    const submitQuizCode = `
    // Adicionar ao total do usuário
    user.totalPoints += totalPointsEarned;
    
    // Verificar e atualizar nível do usuário
    const leveledUp = await updateUserLevel(user);
    
    await user.save();
`;
    
    console.log('✅ Código da função gerado com sucesso!');
    console.log('Para implementar esta função:');
    console.log('1. Adicione a função updateUserLevel no quiz.controller.js');
    console.log('2. Substitua o trecho "user.totalPoints += totalPointsEarned; await user.save();" pelo código fornecido');
    console.log('3. Importe USER_LEVELS de ../utils/constants no topo do arquivo');
    
  } catch (error) {
    console.error('❌ Erro ao implementar função de atualização de nível:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    
    // Verificar progressão de níveis
    await checkUserLevelProgression();
    
    // Verificar cálculo de pontos
    await checkQuizPointsCalculation();
    
    // Implementar função de atualização de nível
    await implementLevelUpFunction();
    
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























