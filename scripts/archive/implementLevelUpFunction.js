const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

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

// Implementar função de atualização de nível no controlador de quiz
const implementLevelUpFunction = async () => {
  try {
    console.log('🔧 Implementando função de atualização de nível no quiz.controller.js...');
    
    // Caminho para o arquivo do controlador
    const controllerPath = path.join(__dirname, '../../src/controllers/quiz.controller.js');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(controllerPath)) {
      console.error('❌ Arquivo do controlador não encontrado:', controllerPath);
      return false;
    }
    
    // Ler o conteúdo do arquivo
    let content = fs.readFileSync(controllerPath, 'utf8');
    
    // Verificar se a função updateUserLevel já existe
    if (content.includes('updateUserLevel')) {
      console.log('⚠️ A função updateUserLevel já parece existir no arquivo');
    } else {
      console.log('✅ Adicionando função updateUserLevel...');
      
      // Código da função a ser adicionada
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
      
      // Adicionar a função antes do primeiro exports
      content = content.replace(/const\s+([A-Za-z]+)\s+=\s+require\(['"](.*)['"]\);/g, (match) => {
        if (match.includes('USER_LEVELS')) {
          return match;
        }
        return match;
      });
      
      // Adicionar importação de USER_LEVELS se não existir
      if (!content.includes('USER_LEVELS')) {
        content = content.replace(/const\s+([A-Za-z]+)\s+=\s+require\(['"](.*)['"]\);/g, (match, p1, p2, offset, string) => {
          if (offset === string.indexOf(match)) {
            return match + '\nconst { USER_LEVELS } = require(\'../utils/constants\');';
          }
          return match;
        });
      }
      
      // Adicionar a função no final do arquivo antes do module.exports
      content = content.replace(/module\.exports\s+=\s+{/, updateUserLevelCode + '\n\nmodule.exports = {');
    }
    
    // Verificar se já existe a chamada para updateUserLevel no submitQuizPrivate
    if (content.includes('const leveledUp = await updateUserLevel(user);')) {
      console.log('⚠️ A chamada para updateUserLevel já parece existir');
    } else {
      console.log('✅ Adicionando chamada para updateUserLevel em submitQuizPrivate...');
      
      // Substituir o trecho onde os pontos são adicionados
      content = content.replace(
        /user\.totalPoints\s+\+=\s+totalPointsEarned;\s+await\s+user\.save\(\);/g,
        `user.totalPoints += totalPointsEarned;

    // Verificar e atualizar nível do usuário
    const leveledUp = await updateUserLevel(user);
    
    await user.save();`
      );
    }
    
    // Escrever o conteúdo modificado de volta no arquivo
    fs.writeFileSync(controllerPath, content, 'utf8');
    
    console.log('✅ Implementação concluída com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao implementar função de atualização de nível:', error);
    return false;
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    
    // Implementar função de atualização de nível
    const success = await implementLevelUpFunction();
    
    if (success) {
      console.log('\n✨ Função implementada com sucesso! Agora os usuários avançarão de nível automaticamente ao atingir os pontos ou módulos necessários.');
    } else {
      console.log('\n⚠️ Não foi possível implementar a função completamente. Verifique o código manualmente.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























