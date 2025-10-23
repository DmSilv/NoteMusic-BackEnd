const mongoose = require('mongoose');
require('dotenv').config();

const Module = require('../src/models/Module');
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

// Conteúdo teórico correto
const correctedQuestions = {
  "Propriedades do Som": [
    {
      question: "Qual propriedade do som determina se uma nota é grave ou aguda?",
      correctOptionLabel: "Altura",
      explanation: "A altura é a propriedade que determina se um som é grave (baixo) ou agudo (alto). É como a diferença entre a voz de um homem (grave) e de uma mulher (aguda)."
    },
    {
      question: "O que diferencia o som de um violino e um piano tocando a mesma nota?",
      correctOptionLabel: "Timbre",
      explanation: "O timbre é a 'cor' do som. Mesmo tocando a mesma nota, cada instrumento tem seu timbre característico - é por isso que reconhecemos se é piano ou violino."
    },
    {
      question: "Qual símbolo musical indica que uma nota deve ser tocada com pouca intensidade?",
      correctOptionLabel: "p (piano)",
      explanation: "O 'p' significa piano (suave em italiano). A sequência é: pp (pianíssimo), p (piano), mp (mezzo piano), mf (mezzo forte), f (forte), ff (fortíssimo)."
    },
    {
      question: "Qual propriedade do som está relacionada ao tempo que a nota dura?",
      correctOptionLabel: "Duração",
      explanation: "A duração determina quanto tempo uma nota deve ser sustentada. Uma semibreve dura 4 tempos, uma colcheia dura meio tempo."
    },
    {
      question: "O que significa o símbolo de crescendo (<) na partitura?",
      correctOptionLabel: "Aumentar gradualmente a intensidade",
      explanation: "O crescendo (<) indica aumento gradual da intensidade. É como dizer 'vamos ficando mais forte aos poucos'."
    }
  ],
  "Notação Musical": [
    {
      question: "Quantas linhas possui um pentagrama padrão?",
      correctOptionLabel: "5 linhas",
      explanation: "O pentagrama padrão utilizado na notação musical ocidental possui exatamente 5 linhas horizontais paralelas e equidistantes, com 4 espaços entre elas."
    },
    {
      question: "Em uma partitura com clave de Sol, onde se localiza a nota Sol?",
      correctOptionLabel: "Na segunda linha",
      explanation: "A clave de Sol indica que a nota Sol está localizada na segunda linha do pentagrama. É por isso que o símbolo da clave de Sol circunda esta linha."
    },
    {
      question: "Quantos tempos vale uma mínima?",
      correctOptionLabel: "2 tempos",
      explanation: "A mínima vale 2 tempos em um compasso simples. É metade do valor de uma semibreve (4 tempos) e o dobro de uma semínima (1 tempo)."
    },
    {
      question: "Qual figura musical representa a metade da duração de uma semínima?",
      correctOptionLabel: "Colcheia",
      explanation: "A colcheia representa metade da duração de uma semínima. Se a semínima vale 1 tempo, a colcheia vale 1/2 tempo."
    },
    {
      question: "O que indica a fração 4/4 no início de uma partitura?",
      correctOptionLabel: "A fórmula de compasso",
      explanation: "A fração 4/4 indica a fórmula de compasso, onde o numerador (4) representa o número de tempos por compasso e o denominador (4) indica que a semínima é a unidade de tempo."
    }
  ],
  "Intervalos Musicais": [
    {
      question: "Qual é o intervalo entre as notas Dó e Mi?",
      correctOptionLabel: "3ª maior",
      explanation: "O intervalo entre Dó e Mi é uma 3ª maior, pois abrange três graus da escala (Dó, Ré, Mi) e contém 2 tons de distância."
    },
    {
      question: "Qual intervalo é considerado 'consonância perfeita'?",
      correctOptionLabel: "5ª justa",
      explanation: "Os intervalos de uníssono, 4ª justa, 5ª justa e oitava são considerados consonâncias perfeitas, produzindo sons estáveis e agradáveis quando tocados juntos."
    },
    {
      question: "Quantos tons tem um intervalo de 3ª menor?",
      correctOptionLabel: "1,5 tons",
      explanation: "Um intervalo de 3ª menor contém 1,5 tons (ou 3 semitons). Por exemplo, entre Lá e Dó há 1,5 tons de distância."
    },
    {
      question: "Qual é o intervalo entre as notas Fá e Si?",
      correctOptionLabel: "4ª aumentada",
      alternateLabel: "trítono",
      explanation: "O intervalo entre Fá e Si é uma 4ª aumentada (também conhecido como trítono). Contém 3 tons de distância e é tradicionalmente considerado dissonante."
    },
    {
      question: "Na escala maior, qual é o intervalo formado entre o 1º e o 5º graus?",
      correctOptionLabel: "5ª justa",
      explanation: "Na escala maior, o intervalo entre o 1º e o 5º graus é sempre uma 5ª justa. Por exemplo, em Dó maior: Dó (1º) e Sol (5º) formam uma 5ª justa."
    }
  ],
  "Harmonia Avançada": [
    {
      question: "O que é uma modulação por acorde pivô?",
      correctOptionLabel: "Uma modulação que utiliza um acorde comum a duas tonalidades",
      explanation: "A modulação por acorde pivô é uma técnica de transição harmônica que utiliza um acorde comum a duas tonalidades para realizar uma mudança suave de um centro tonal para outro."
    },
    {
      question: "Qual destas é uma característica do empréstimo modal?",
      correctOptionLabel: "Uso de acordes de modos paralelos na mesma tonalidade",
      explanation: "O empréstimo modal consiste em utilizar acordes derivados de modos paralelos (que compartilham a mesma tônica) dentro de uma tonalidade. Por exemplo, usar o IV menor em uma tonalidade maior (emprestado do modo eólio/menor)."
    }
  ]
};

// Corrigir todo o conteúdo teórico
const correctAllContent = async () => {
  try {
    console.log('🔧 Iniciando correção completa de conteúdo teórico...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    // Estatísticas
    let totalQuestionsChecked = 0;
    let questionsFixed = 0;
    let quizzesUpdated = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🔍 Verificando: ${quiz.title}`);
      
      // Identificar o tipo de conteúdo deste quiz
      let contentType = null;
      
      if (quiz.title.toLowerCase().includes('propriedades do som')) {
        contentType = "Propriedades do Som";
      } else if (quiz.title.toLowerCase().includes('notação') || 
                 quiz.title.toLowerCase().includes('figuras musicais') || 
                 quiz.title.toLowerCase().includes('solfejo')) {
        contentType = "Notação Musical";
      } else if (quiz.title.toLowerCase().includes('intervalos')) {
        contentType = "Intervalos Musicais";
      } else if (quiz.title.toLowerCase().includes('harmonia')) {
        contentType = "Harmonia Avançada";
      }
      
      if (!contentType || !correctedQuestions[contentType]) {
        console.log(`⚠️ Tipo de conteúdo não identificado para ${quiz.title}`);
        continue;
      }
      
      console.log(`✅ Identificado como: ${contentType}`);
      
      const correctContent = correctedQuestions[contentType];
      let quizModified = false;
      
      // Para cada questão no quiz
      for (let i = 0; i < quiz.questions.length; i++) {
        totalQuestionsChecked++;
        const question = quiz.questions[i];
        
        // Encontrar a questão correta correspondente
        const correctQuestion = correctContent.find(q => 
          q.question.toLowerCase() === question.question.toLowerCase() ||
          question.question.toLowerCase().includes(q.question.toLowerCase().substring(0, 15))
        );
        
        if (!correctQuestion) {
          console.log(`⚠️ Não encontrada questão correspondente para: "${question.question.substring(0, 40)}..."`);
          continue;
        }
        
        // Encontrar a opção que deveria estar correta
        let correctOptionIndex = question.options.findIndex(opt => 
          opt.label.toLowerCase().includes(correctQuestion.correctOptionLabel.toLowerCase())
        );
        
        // Se não encontrou, tentar com label alternativo se disponível
        if (correctOptionIndex === -1 && correctQuestion.alternateLabel) {
          correctOptionIndex = question.options.findIndex(opt => 
            opt.label.toLowerCase().includes(correctQuestion.alternateLabel.toLowerCase())
          );
          console.log(`   🔍 Tentando com label alternativo: ${correctQuestion.alternateLabel}`);
        }
        
        if (correctOptionIndex === -1) {
          console.log(`⚠️ Opção correta não encontrada para: "${question.question.substring(0, 40)}..."`);
          console.log(`   Deveria ser: "${correctQuestion.correctOptionLabel}"`);
          
          // Listar opções disponíveis
          console.log('   Opções disponíveis:');
          question.options.forEach((opt, idx) => {
            console.log(`     ${idx + 1}. ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
          });
          
          continue;
        }
        
        // Verificar se já está correta
        if (question.options[correctOptionIndex].isCorrect) {
          console.log(`✅ Questão já correta: "${question.question.substring(0, 40)}..."`);
          continue;
        }
        
        // Corrigir a questão
        console.log(`🔧 Corrigindo questão: "${question.question.substring(0, 40)}..."`);
        console.log(`   Opção correta: "${question.options[correctOptionIndex].label}"`);
        
        // Marcar todas as opções como incorretas
        for (let j = 0; j < question.options.length; j++) {
          quiz.questions[i].options[j].isCorrect = false;
        }
        
        // Marcar a opção correta
        quiz.questions[i].options[correctOptionIndex].isCorrect = true;
        
        // Atualizar explicação se estiver vazia
        if (!question.explanation || question.explanation.trim() === '') {
          quiz.questions[i].explanation = correctQuestion.explanation;
          console.log(`   ✏️ Adicionada explicação: "${correctQuestion.explanation.substring(0, 40)}..."`);
        }
        
        questionsFixed++;
        quizModified = true;
      }
      
      // Salvar alterações se o quiz foi modificado
      if (quizModified) {
        await quiz.save();
        console.log(`✅ Quiz salvo com correções: ${quiz.title}`);
        quizzesUpdated++;
      }
    }
    
    console.log('\n📊 Resumo das correções:');
    console.log(`   Total de quizzes verificados: ${quizzes.length}`);
    console.log(`   Total de questões verificadas: ${totalQuestionsChecked}`);
    console.log(`   Questões corrigidas: ${questionsFixed}`);
    console.log(`   Quizzes atualizados: ${quizzesUpdated}`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir conteúdo teórico:', error);
  }
};

// Função para corrigir manualmente a questão do crescendo
const fixCrescendoQuestion = async () => {
  try {
    console.log('\n🔍 Localizando e corrigindo a questão específica sobre crescendo...');
    
    // Buscar o quiz sobre propriedades do som
    const quiz = await Quiz.findOne({ title: { $regex: /Propriedades do Som/i } });
    
    if (!quiz) {
      console.log('❌ Quiz não encontrado');
      return;
    }
    
    // Procurar a questão específica sobre crescendo
    const crescendoIndex = quiz.questions.findIndex(q => 
      q.question.toLowerCase().includes('crescendo') || 
      (q.question.toLowerCase().includes('piano') && q.question.toLowerCase().includes('forte')));
    
    if (crescendoIndex === -1) {
      console.log('❌ Questão sobre crescendo não encontrada');
      return;
    }
    
    const question = quiz.questions[crescendoIndex];
    console.log(`✅ Questão encontrada: "${question.question}"`);
    
    // Localizar a opção "Aumentar gradualmente a intensidade"
    const correctOptionIndex = question.options.findIndex(opt => 
      opt.label.toLowerCase().includes('aumentar') && 
      opt.label.toLowerCase().includes('intensidade'));
    
    if (correctOptionIndex === -1) {
      console.log('❌ Opção correta não encontrada');
      return;
    }
    
    // Verificar se já está correta
    if (question.options[correctOptionIndex].isCorrect) {
      console.log('✅ Questão já está correta');
      return;
    }
    
    // Corrigir a questão - primeiro marcar todas como incorretas
    for (let i = 0; i < question.options.length; i++) {
      quiz.questions[crescendoIndex].options[i].isCorrect = false;
    }
    
    // Marcar a opção correta
    quiz.questions[crescendoIndex].options[correctOptionIndex].isCorrect = true;
    
    // Verificar se a opção inclui o símbolo correto
    if (!quiz.questions[crescendoIndex].options[correctOptionIndex].label.includes('<')) {
      quiz.questions[crescendoIndex].options[correctOptionIndex].label = 
        'Aumentar gradualmente a intensidade (<)';
    }
    
    await quiz.save();
    console.log('✅ Questão corrigida e salva com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir questão sobre crescendo:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    
    // Primeiro corrigir especificamente a questão problemática do crescendo
    await fixCrescendoQuestion();
    
    // Depois corrigir todo o restante do conteúdo teórico
    await correctAllContent();
    
    console.log('\n✨ Correções concluídas!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();
