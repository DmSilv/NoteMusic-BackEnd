const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../src/models/Quiz');

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

// Corrigir questões específicas que não foram atualizadas corretamente
const fixSpecificQuestions = async () => {
  try {
    console.log('🔧 Iniciando correção de questões específicas...');
    
    // Corrigir as questões sobre intervalos musicais
    const intervalosQuiz = await Quiz.findOne({ title: { $regex: /Intervalos Musicais/i } });
    
    if (intervalosQuiz) {
      console.log('✅ Quiz de intervalos musicais encontrado');
      let quizModified = false;
      
      // Questão: Intervalo entre Fá e Si
      const faSiQuestion = intervalosQuiz.questions.find(q => 
        q.question.includes('Fá e Si'));
      
      if (faSiQuestion) {
        console.log(`\n🔍 Analisando questão: "${faSiQuestion.question}"`);
        console.log('   Opções atuais:');
        faSiQuestion.options.forEach((opt, i) => {
          console.log(`   ${i+1}. ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
        });
        
        // Verificar se a opção "4ª aumentada" já está correta
        const correctOptionIndex = faSiQuestion.options.findIndex(opt => 
          opt.label.toLowerCase().includes('4ª aumentada'));
        
        if (correctOptionIndex !== -1 && faSiQuestion.options[correctOptionIndex].isCorrect) {
          console.log('   ✅ Questão já está correta');
        } else {
          console.log('   🔧 Corrigindo questão...');
          
          // Encontrar o índice da questão no array
          const questionIndex = intervalosQuiz.questions.findIndex(q => q === faSiQuestion);
          
          // Marcar todas as opções como incorretas
          for (let i = 0; i < faSiQuestion.options.length; i++) {
            intervalosQuiz.questions[questionIndex].options[i].isCorrect = false;
          }
          
          // Marcar a opção "4ª aumentada" como correta
          if (correctOptionIndex !== -1) {
            intervalosQuiz.questions[questionIndex].options[correctOptionIndex].isCorrect = true;
            console.log(`   ✅ Opção "${faSiQuestion.options[correctOptionIndex].label}" marcada como correta`);
          } else {
            // Se não encontrar "4ª aumentada", procurar por "trítono" ou similar
            const alternateIndex = faSiQuestion.options.findIndex(opt => 
              opt.label.toLowerCase().includes('trítono') || 
              opt.label.toLowerCase().includes('tritono'));
            
            if (alternateIndex !== -1) {
              intervalosQuiz.questions[questionIndex].options[alternateIndex].isCorrect = true;
              console.log(`   ✅ Opção alternativa "${faSiQuestion.options[alternateIndex].label}" marcada como correta`);
            } else {
              console.log('   ❌ Não foi possível encontrar uma opção correta');
            }
          }
          
          quizModified = true;
        }
        
        // Atualizar a explicação
        const questionIndex = intervalosQuiz.questions.findIndex(q => q === faSiQuestion);
        intervalosQuiz.questions[questionIndex].explanation = 
          "O intervalo entre Fá e Si é uma 4ª aumentada (também conhecido como trítono). Contém 3 tons de distância (6 semitons) e é tradicionalmente considerado dissonante. Na história da música ocidental, era chamado de 'diabolus in musica' (o diabo na música) devido à sua instabilidade sonora.";
        console.log('   ✅ Explicação atualizada');
        quizModified = true;
      }
      
      // Questão: Intervalo entre 1º e 5º graus
      const grausQuestion = intervalosQuiz.questions.find(q => 
        q.question.includes('1º e o 5º graus'));
      
      if (grausQuestion) {
        console.log(`\n🔍 Analisando questão: "${grausQuestion.question}"`);
        console.log('   Opções atuais:');
        grausQuestion.options.forEach((opt, i) => {
          console.log(`   ${i+1}. ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
        });
        
        // Verificar se a opção "5ª justa" já está correta
        const correctOptionIndex = grausQuestion.options.findIndex(opt => 
          opt.label.toLowerCase().includes('5ª justa'));
        
        if (correctOptionIndex !== -1 && grausQuestion.options[correctOptionIndex].isCorrect) {
          console.log('   ✅ Questão já está correta');
        } else {
          console.log('   🔧 Corrigindo questão...');
          
          // Encontrar o índice da questão no array
          const questionIndex = intervalosQuiz.questions.findIndex(q => q === grausQuestion);
          
          // Marcar todas as opções como incorretas
          for (let i = 0; i < grausQuestion.options.length; i++) {
            intervalosQuiz.questions[questionIndex].options[i].isCorrect = false;
          }
          
          // Marcar a opção "5ª justa" como correta
          if (correctOptionIndex !== -1) {
            intervalosQuiz.questions[questionIndex].options[correctOptionIndex].isCorrect = true;
            console.log(`   ✅ Opção "${grausQuestion.options[correctOptionIndex].label}" marcada como correta`);
          } else {
            console.log('   ❌ Não foi possível encontrar uma opção correta');
          }
          
          quizModified = true;
        }
        
        // Atualizar a explicação
        const questionIndex = intervalosQuiz.questions.findIndex(q => q === grausQuestion);
        intervalosQuiz.questions[questionIndex].explanation = 
          "Na escala maior, o intervalo entre o 1º e o 5º graus é sempre uma 5ª justa (7 semitons). Esta relação é fundamental na harmonia tonal, estabelecendo a relação tônica-dominante. Por exemplo, em Dó maior: Dó (1º) e Sol (5º) formam uma 5ª justa. Este intervalo é a base do ciclo de quintas.";
        console.log('   ✅ Explicação atualizada');
        quizModified = true;
      }
      
      // Salvar as alterações se necessário
      if (quizModified) {
        await intervalosQuiz.save();
        console.log('\n✅ Quiz de intervalos musicais salvo com sucesso');
      } else {
        console.log('\n✅ Nenhuma alteração necessária no quiz de intervalos musicais');
      }
    } else {
      console.log('❌ Quiz de intervalos musicais não encontrado');
    }
    
    // Corrigir as questões de harmonia avançada
    const harmoniaQuiz = await Quiz.findOne({ title: { $regex: /Harmonia Avançada/i } });
    
    if (harmoniaQuiz) {
      console.log('\n✅ Quiz de harmonia avançada encontrado');
      let quizModified = false;
      
      // Questão: Substituição tritônica
      const substitutionQuestion = harmoniaQuiz.questions.find(q => 
        q.question.includes('substituição tritônica'));
      
      if (substitutionQuestion) {
        console.log(`\n🔍 Analisando questão: "${substitutionQuestion.question}"`);
        console.log('   Opções atuais:');
        substitutionQuestion.options.forEach((opt, i) => {
          console.log(`   ${i+1}. ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
        });
        
        // Verificar se a opção "Db7" (ou equivalente) já está correta
        const correctOptionIndex = substitutionQuestion.options.findIndex(opt => 
          opt.label.includes('Db7') || opt.label.includes('bII7'));
        
        if (correctOptionIndex !== -1 && substitutionQuestion.options[correctOptionIndex].isCorrect) {
          console.log('   ✅ Questão já está correta');
        } else {
          console.log('   🔧 Corrigindo questão...');
          
          // Encontrar o índice da questão no array
          const questionIndex = harmoniaQuiz.questions.findIndex(q => q === substitutionQuestion);
          
          // Marcar todas as opções como incorretas
          for (let i = 0; i < substitutionQuestion.options.length; i++) {
            harmoniaQuiz.questions[questionIndex].options[i].isCorrect = false;
          }
          
          // Marcar a opção "Db7" como correta
          if (correctOptionIndex !== -1) {
            harmoniaQuiz.questions[questionIndex].options[correctOptionIndex].isCorrect = true;
            console.log(`   ✅ Opção "${substitutionQuestion.options[correctOptionIndex].label}" marcada como correta`);
          } else {
            console.log('   ❌ Não foi possível encontrar uma opção correta');
          }
          
          quizModified = true;
        }
        
        // Atualizar a explicação
        const questionIndex = harmoniaQuiz.questions.findIndex(q => q === substitutionQuestion);
        harmoniaQuiz.questions[questionIndex].explanation = 
          "A substituição tritônica do V7 é o acorde de sétima construído sobre o segundo grau abaixado (bII7). Por exemplo, em Dó maior, o G7 (V7) pode ser substituído pelo Db7 (bII7). Estes acordes compartilham as notas guia (3ª e 7ª) e suas fundamentais estão separadas por um trítono. Esta substituição é muito utilizada no jazz e na música popular.";
        console.log('   ✅ Explicação atualizada');
        quizModified = true;
      }
      
      // Questão: Cadência autêntica perfeita
      const cadenciaQuestion = harmoniaQuiz.questions.find(q => 
        q.question.includes('cadência autêntica'));
      
      if (cadenciaQuestion) {
        console.log(`\n🔍 Analisando questão: "${cadenciaQuestion.question}"`);
        console.log('   Opções atuais:');
        cadenciaQuestion.options.forEach((opt, i) => {
          console.log(`   ${i+1}. ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
        });
        
        // Verificar se a opção que menciona "V7-I" já está correta
        // Ou se a opção que menciona "G7-C" está correta (em contexto de Dó maior)
        const correctOptionIndex = cadenciaQuestion.options.findIndex(opt => 
          opt.label.toLowerCase().includes('v7-i') || 
          (opt.label.includes('G7') && opt.label.includes('C') && !opt.label.includes('Am')));
        
        if (correctOptionIndex !== -1 && cadenciaQuestion.options[correctOptionIndex].isCorrect) {
          console.log('   ✅ Questão já está correta');
        } else {
          console.log('   🔧 Corrigindo questão...');
          
          // Encontrar o índice da questão no array
          const questionIndex = harmoniaQuiz.questions.findIndex(q => q === cadenciaQuestion);
          
          // Marcar todas as opções como incorretas
          for (let i = 0; i < cadenciaQuestion.options.length; i++) {
            harmoniaQuiz.questions[questionIndex].options[i].isCorrect = false;
          }
          
          // Marcar a opção correta
          if (correctOptionIndex !== -1) {
            harmoniaQuiz.questions[questionIndex].options[correctOptionIndex].isCorrect = true;
            console.log(`   ✅ Opção "${cadenciaQuestion.options[correctOptionIndex].label}" marcada como correta`);
          } else {
            // Se não encontrar a opção ideal, procurar a melhor opção disponível
            // Neste caso, uma progressão que termine com V-I ou G-C
            const bestOptionIndex = cadenciaQuestion.options.findIndex(opt => 
              opt.label.includes('G') && opt.label.includes('C'));
            
            if (bestOptionIndex !== -1) {
              harmoniaQuiz.questions[questionIndex].options[bestOptionIndex].isCorrect = true;
              console.log(`   ✅ Melhor opção disponível "${cadenciaQuestion.options[bestOptionIndex].label}" marcada como correta`);
            } else {
              console.log('   ❌ Não foi possível encontrar uma opção adequada');
            }
          }
          
          quizModified = true;
        }
        
        // Atualizar a explicação
        const questionIndex = harmoniaQuiz.questions.findIndex(q => q === cadenciaQuestion);
        harmoniaQuiz.questions[questionIndex].explanation = 
          "A cadência autêntica perfeita consiste na progressão V7-I (dominante para tônica) com ambos os acordes em estado fundamental e com a tônica na voz mais aguda do acorde final. É considerada a cadência mais conclusiva na música tonal, criando forte sensação de resolução e finalização.";
        console.log('   ✅ Explicação atualizada');
        quizModified = true;
      }
      
      // Questão: Técnica de harmonização
      const tecnicaQuestion = harmoniaQuiz.questions.find(q => 
        q.question.includes('técnica de harmonização'));
      
      if (tecnicaQuestion) {
        console.log(`\n🔍 Analisando questão: "${tecnicaQuestion.question}"`);
        console.log('   Opções atuais:');
        tecnicaQuestion.options.forEach((opt, i) => {
          console.log(`   ${i+1}. ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
        });
        
        // Verificar se a opção que menciona "extensões" ou "cromática" já está correta
        const correctOptionIndex = tecnicaQuestion.options.findIndex(opt => 
          opt.label.toLowerCase().includes('extensões') || 
          opt.label.toLowerCase().includes('cromática'));
        
        if (correctOptionIndex !== -1 && tecnicaQuestion.options[correctOptionIndex].isCorrect) {
          console.log('   ✅ Questão já está correta');
        } else {
          console.log('   🔧 Corrigindo questão...');
          
          // Encontrar o índice da questão no array
          const questionIndex = harmoniaQuiz.questions.findIndex(q => q === tecnicaQuestion);
          
          // Marcar todas as opções como incorretas
          for (let i = 0; i < tecnicaQuestion.options.length; i++) {
            harmoniaQuiz.questions[questionIndex].options[i].isCorrect = false;
          }
          
          // Marcar a opção correta
          if (correctOptionIndex !== -1) {
            harmoniaQuiz.questions[questionIndex].options[correctOptionIndex].isCorrect = true;
            console.log(`   ✅ Opção "${tecnicaQuestion.options[correctOptionIndex].label}" marcada como correta`);
          } else {
            console.log('   ❌ Não foi possível encontrar uma opção adequada');
          }
          
          quizModified = true;
        }
        
        // Atualizar a explicação
        const questionIndex = harmoniaQuiz.questions.findIndex(q => q === tecnicaQuestion);
        harmoniaQuiz.questions[questionIndex].explanation = 
          "As extensões harmônicas são notas adicionadas além da tríade básica (como 7ª, 9ª, 11ª e 13ª). São muito utilizadas no jazz e na música popular para criar sonoridades mais ricas e complexas. A harmonização cromática também utiliza acordes com notas que não pertencem à tonalidade, criando tensão e colorido harmônico.";
        console.log('   ✅ Explicação atualizada');
        quizModified = true;
      }
      
      // Salvar as alterações se necessário
      if (quizModified) {
        await harmoniaQuiz.save();
        console.log('\n✅ Quiz de harmonia avançada salvo com sucesso');
      } else {
        console.log('\n✅ Nenhuma alteração necessária no quiz de harmonia avançada');
      }
    } else {
      console.log('❌ Quiz de harmonia avançada não encontrado');
    }
    
    console.log('\n✅ Correções específicas concluídas');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir questões específicas:', error);
  }
};

// Verificar a consistência final
const verifyFinalState = async () => {
  try {
    console.log('\n🔍 Verificando estado final dos quizzes...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    let allCorrect = true;
    
    // Verificar cada quiz
    for (const quiz of quizzes) {
      console.log(`\n📝 Quiz: ${quiz.title}`);
      
      // Verificar cada questão
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        
        // Contar opções corretas
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        const correctCount = correctOptions.length;
        
        // Verificar explicação
        const hasExplanation = question.explanation && question.explanation.length > 20;
        
        // Log baseado no resultado
        if (correctCount !== 1 || !hasExplanation) {
          allCorrect = false;
          
          if (correctCount !== 1) {
            console.log(`❌ Questão ${i+1} com ${correctCount} respostas corretas: "${question.question.substring(0, 40)}..."`);
          }
          
          if (!hasExplanation) {
            console.log(`⚠️ Questão ${i+1} sem explicação adequada: "${question.question.substring(0, 40)}..."`);
          }
        } else {
          console.log(`✅ Questão ${i+1}: "${question.question.substring(0, 40)}..." - OK`);
        }
      }
    }
    
    if (allCorrect) {
      console.log('\n🎉 Todos os quizzes estão corretamente configurados!');
    } else {
      console.log('\n⚠️ Ainda há questões que precisam de atenção!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estado final:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    
    // Corrigir questões específicas
    await fixSpecificQuestions();
    
    // Verificar estado final
    await verifyFinalState();
    
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





















