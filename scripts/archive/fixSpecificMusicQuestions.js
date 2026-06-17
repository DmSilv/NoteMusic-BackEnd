const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/Quiz');

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

// Corrigir perguntas específicas de teoria musical
const fixSpecificMusicQuestions = async () => {
  try {
    console.log('🔧 Iniciando correção de perguntas específicas de teoria musical...');
    
    // 1. Corrigir pergunta sobre a clave de Sol
    await fixClaveQuestion();
    
    // 2. Corrigir pergunta sobre a figura musical que vale metade de uma semínima
    await fixSemiminimQuestion();
    
    console.log('✅ Correções específicas concluídas!');
  } catch (error) {
    console.error('❌ Erro ao corrigir perguntas específicas:', error);
  }
};

// Corrigir a pergunta sobre a clave de Sol
const fixClaveQuestion = async () => {
  try {
    console.log('\n🔍 Procurando pergunta sobre clave de Sol...');
    
    // Buscar quizzes de notação musical
    const quizzes = await Quiz.find({ 
      title: { $regex: /nota|clave|musical/i }
    });
    
    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz relacionado a notação musical encontrado');
      return;
    }
    
    console.log(`📊 Encontrados ${quizzes.length} quizzes potenciais`);
    
    let questionFixed = false;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Analisando quiz: ${quiz.title}`);
      
      // Procurar a pergunta sobre clave de Sol
      const claveQuestionIndex = quiz.questions.findIndex(q => 
        q.question.toLowerCase().includes('clave de sol') && 
        q.question.toLowerCase().includes('localiza')
      );
      
      if (claveQuestionIndex === -1) {
        console.log('❌ Pergunta sobre clave de Sol não encontrada neste quiz');
        continue;
      }
      
      const question = quiz.questions[claveQuestionIndex];
      console.log(`✅ Pergunta encontrada: "${question.question}"`);
      
      // Verificar as opções
      console.log('📋 Opções atuais:');
      question.options.forEach((opt, i) => {
        console.log(`   ${i+1}. ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
      });
      
      // Procurar a opção "segunda linha"
      const segundaLinhaIndex = question.options.findIndex(opt => 
        opt.label.toLowerCase().includes('segunda linha') || 
        opt.label.toLowerCase().includes('2ª linha') ||
        opt.label.toLowerCase().includes('2a linha')
      );
      
      if (segundaLinhaIndex === -1) {
        console.log('❌ Opção "segunda linha" não encontrada');
        
        // Verificar se existe alguma opção com "linha"
        const linhaIndex = question.options.findIndex(opt => 
          opt.label.toLowerCase().includes('linha')
        );
        
        if (linhaIndex !== -1) {
          console.log(`✅ Encontrada opção com "linha": "${question.options[linhaIndex].label}"`);
          
          // Corrigir para "segunda linha"
          quiz.questions[claveQuestionIndex].options[linhaIndex].label = "Na segunda linha";
          quiz.questions[claveQuestionIndex].options[linhaIndex].isCorrect = true;
          
          // Marcar as outras como incorretas
          for (let i = 0; i < question.options.length; i++) {
            if (i !== linhaIndex) {
              quiz.questions[claveQuestionIndex].options[i].isCorrect = false;
            }
          }
          
          await quiz.save();
          console.log('✅ Opção corrigida para "Na segunda linha" e marcada como correta');
          questionFixed = true;
        } else {
          // Não encontrou nenhuma opção com "linha", criar uma nova
          console.log('🔧 Criando nova opção "Na segunda linha"');
          
          // Verificar se há opção sobre espaço
          const espacoIndex = question.options.findIndex(opt => 
            opt.label.toLowerCase().includes('espaço') || 
            opt.label.toLowerCase().includes('espaco')
          );
          
          if (espacoIndex !== -1) {
            // Substituir a opção de espaço pela linha correta
            quiz.questions[claveQuestionIndex].options[espacoIndex].label = "Na segunda linha";
            quiz.questions[claveQuestionIndex].options[espacoIndex].isCorrect = true;
            
            // Marcar as outras como incorretas
            for (let i = 0; i < question.options.length; i++) {
              if (i !== espacoIndex) {
                quiz.questions[claveQuestionIndex].options[i].isCorrect = false;
              }
            }
            
            await quiz.save();
            console.log('✅ Opção de espaço substituída por "Na segunda linha" e marcada como correta');
            questionFixed = true;
          }
        }
      } else {
        // Verificar se a opção "segunda linha" já está marcada como correta
        if (question.options[segundaLinhaIndex].isCorrect) {
          console.log('✅ Opção "segunda linha" já está correta');
          questionFixed = true;
        } else {
          console.log('🔧 Marcando opção "segunda linha" como correta');
          
          // Marcar "segunda linha" como correta
          quiz.questions[claveQuestionIndex].options[segundaLinhaIndex].isCorrect = true;
          
          // Marcar as outras como incorretas
          for (let i = 0; i < question.options.length; i++) {
            if (i !== segundaLinhaIndex) {
              quiz.questions[claveQuestionIndex].options[i].isCorrect = false;
            }
          }
          
          await quiz.save();
          console.log('✅ Opção "segunda linha" marcada como correta');
          questionFixed = true;
        }
      }
      
      // Atualizar a explicação
      if (questionFixed) {
        quiz.questions[claveQuestionIndex].explanation = 
          "A clave de Sol é posicionada de modo que sua espiral circunde a segunda linha do pentagrama, indicando que ali está a nota Sol (G). Esta é a clave mais comum para instrumentos de registro médio-agudo como violino, flauta, trompete e a mão direita do piano.";
        
        await quiz.save();
        console.log('✅ Explicação atualizada');
      }
    }
    
    if (!questionFixed) {
      console.log('❌ Não foi possível corrigir a pergunta sobre clave de Sol');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir pergunta sobre clave de Sol:', error);
  }
};

// Corrigir a pergunta sobre a figura musical que vale metade de uma semínima
const fixSemiminimQuestion = async () => {
  try {
    console.log('\n🔍 Procurando pergunta sobre figura musical que vale metade de uma semínima...');
    
    // Buscar quizzes de figuras musicais
    const quizzes = await Quiz.find({ 
      title: { $regex: /figura|musical|nota/i }
    });
    
    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz relacionado a figuras musicais encontrado');
      return;
    }
    
    console.log(`📊 Encontrados ${quizzes.length} quizzes potenciais`);
    
    let questionFixed = false;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Analisando quiz: ${quiz.title}`);
      
      // Procurar a pergunta sobre figura musical que vale metade de uma semínima
      const figuraQuestionIndex = quiz.questions.findIndex(q => 
        q.question.toLowerCase().includes('metade') && 
        q.question.toLowerCase().includes('semínima')
      );
      
      if (figuraQuestionIndex === -1) {
        console.log('❌ Pergunta sobre metade da semínima não encontrada neste quiz');
        continue;
      }
      
      const question = quiz.questions[figuraQuestionIndex];
      console.log(`✅ Pergunta encontrada: "${question.question}"`);
      
      // Verificar as opções
      console.log('📋 Opções atuais:');
      question.options.forEach((opt, i) => {
        console.log(`   ${i+1}. ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
      });
      
      // Procurar a opção "colcheia"
      const colcheiaIndex = question.options.findIndex(opt => 
        opt.label.toLowerCase().includes('colcheia')
      );
      
      if (colcheiaIndex === -1) {
        console.log('❌ Opção "colcheia" não encontrada');
      } else {
        // Verificar se a opção "colcheia" já está marcada como correta
        if (question.options[colcheiaIndex].isCorrect) {
          console.log('✅ Opção "colcheia" já está correta');
          questionFixed = true;
        } else {
          console.log('🔧 Marcando opção "colcheia" como correta');
          
          // Marcar "colcheia" como correta
          quiz.questions[figuraQuestionIndex].options[colcheiaIndex].isCorrect = true;
          
          // Marcar as outras como incorretas
          for (let i = 0; i < question.options.length; i++) {
            if (i !== colcheiaIndex) {
              quiz.questions[figuraQuestionIndex].options[i].isCorrect = false;
            }
          }
          
          await quiz.save();
          console.log('✅ Opção "colcheia" marcada como correta');
          questionFixed = true;
        }
      }
      
      // Verificar se há opção "fusa" incorretamente marcada como correta
      const fusaIndex = question.options.findIndex(opt => 
        opt.label.toLowerCase().includes('fusa')
      );
      
      if (fusaIndex !== -1 && question.options[fusaIndex].isCorrect) {
        console.log('🔧 Corrigindo: opção "fusa" estava incorretamente marcada como correta');
        quiz.questions[figuraQuestionIndex].options[fusaIndex].isCorrect = false;
        
        // Se não encontrou colcheia, marcar a opção correta
        if (colcheiaIndex === -1) {
          // Criar uma opção "colcheia" se não existir
          quiz.questions[figuraQuestionIndex].options.push({
            label: "Colcheia",
            isCorrect: true
          });
          console.log('✅ Adicionada opção "Colcheia" como correta');
        }
        
        await quiz.save();
        console.log('✅ Correção aplicada: "fusa" desmarcada como correta');
        questionFixed = true;
      }
      
      // Atualizar a explicação
      if (questionFixed) {
        quiz.questions[figuraQuestionIndex].explanation = 
          "A colcheia (eighth note) representa 1/2 tempo, metade da duração de uma semínima. É identificada pela cabeça preta com haste e uma bandeirola. Duas colcheias ligadas equivalem a uma semínima. A fusa vale 1/8 de tempo (1/4 de colcheia), e a semicolcheia vale 1/4 de tempo (1/2 de colcheia).";
        
        await quiz.save();
        console.log('✅ Explicação atualizada');
      }
    }
    
    if (!questionFixed) {
      console.log('❌ Não foi possível corrigir a pergunta sobre figura musical');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir pergunta sobre figura musical:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await fixSpecificMusicQuestions();
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























