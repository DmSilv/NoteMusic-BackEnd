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

// Conteúdo teórico refinado baseado em teoria musical acadêmica
const refinedMusicalContent = {
  "Propriedades do Som": [
    {
      question: "Qual propriedade do som determina se uma nota é grave ou aguda?",
      correctOptionLabel: "Altura",
      explanation: "A altura (pitch) é a propriedade acústica relacionada à frequência das ondas sonoras. Quanto maior a frequência, mais agudo é o som; quanto menor, mais grave. É medida em Hertz (Hz)."
    },
    {
      question: "O que diferencia o som de um violino e um piano tocando a mesma nota?",
      correctOptionLabel: "Timbre",
      explanation: "O timbre é a qualidade sonora que permite distinguir sons da mesma altura e intensidade produzidos por fontes diferentes. É determinado pelos harmônicos (frequências secundárias) que acompanham a frequência fundamental."
    },
    {
      question: "Qual símbolo musical indica que uma nota deve ser tocada com pouca intensidade?",
      correctOptionLabel: "p (piano)",
      explanation: "Na notação musical, 'p' (piano) indica que o som deve ser executado com baixa intensidade. A escala completa de dinâmicas vai de ppp (pianississimo - extremamente suave) a fff (fortississimo - extremamente forte)."
    },
    {
      question: "Qual figura musical representa a maior duração em um compasso simples?",
      correctOptionLabel: "Semibreve",
      explanation: "A semibreve (whole note) é a figura de maior duração no sistema moderno de notação musical, valendo 4 tempos em um compasso quaternário (4/4). As demais figuras são subdivisões dela: mínima (2 tempos), semínima (1 tempo), colcheia (1/2 tempo), etc."
    },
    {
      question: "O que significa o símbolo de crescendo (<) na partitura?",
      correctOptionLabel: "Aumentar gradualmente a intensidade",
      explanation: "O crescendo (<) é uma indicação de dinâmica que orienta o músico a aumentar gradualmente a intensidade do som durante o trecho marcado. Seu oposto é o diminuendo ou decrescendo (>), que indica redução gradual da intensidade."
    }
  ],
  "Notação Musical": [
    {
      question: "Quantas linhas possui um pentagrama padrão?",
      correctOptionLabel: "5 linhas",
      explanation: "O pentagrama (staff) padrão consiste em exatamente 5 linhas horizontais equidistantes e 4 espaços entre elas. É neste sistema que as notas musicais são escritas, tanto nas linhas quanto nos espaços."
    },
    {
      question: "Em uma partitura com clave de Sol, onde se localiza a nota Sol?",
      correctOptionLabel: "Na segunda linha",
      explanation: "A clave de Sol (G clef) é posicionada de modo que sua espiral circunde a segunda linha do pentagrama, indicando que ali está a nota Sol (G). Esta é a clave mais comum para instrumentos de registro médio-agudo."
    },
    {
      question: "Quantos tempos vale uma mínima?",
      correctOptionLabel: "2 tempos",
      explanation: "A mínima (half note) vale 2 tempos em um compasso simples. Representa metade da duração de uma semibreve (4 tempos) e o dobro de uma semínima (1 tempo). É representada por uma nota com cabeça branca e haste."
    },
    {
      question: "Qual figura musical representa a metade da duração de uma semínima?",
      correctOptionLabel: "Colcheia",
      explanation: "A colcheia (eighth note) representa 1/2 tempo, metade da duração de uma semínima. É identificada pela cabeça preta com haste e uma bandeirola. Duas colcheias ligadas equivalem a uma semínima."
    },
    {
      question: "O que indica a fração 4/4 no início de uma partitura?",
      correctOptionLabel: "A fórmula de compasso",
      explanation: "A fração 4/4 indica a fórmula de compasso (time signature). O numerador (4) representa o número de unidades de tempo por compasso, e o denominador (4) indica que a semínima é a unidade de tempo. Também conhecido como compasso quaternário simples."
    }
  ],
  "Intervalos Musicais": [
    {
      question: "Qual é o intervalo entre as notas Dó e Mi?",
      correctOptionLabel: "3ª maior",
      explanation: "O intervalo entre Dó e Mi é uma 3ª maior, abrangendo 2 tons (ou 4 semitons). Na teoria musical ocidental, a 3ª maior é um dos intervalos fundamentais para a construção de acordes maiores."
    },
    {
      question: "Qual intervalo é considerado 'consonância perfeita'?",
      correctOptionLabel: "5ª justa",
      explanation: "Na teoria tradicional, os intervalos de uníssono, 4ª justa, 5ª justa e oitava são considerados consonâncias perfeitas. A 5ª justa (7 semitons) é especialmente importante na música ocidental, sendo a base do ciclo de quintas e da relação entre tônica e dominante."
    },
    {
      question: "Quantos tons tem um intervalo de 3ª menor?",
      correctOptionLabel: "1,5 tons",
      explanation: "Um intervalo de 3ª menor contém 1,5 tons (ou 3 semitons). Exemplos incluem Lá-Dó, Mi-Sol e Si-Ré. A 3ª menor é fundamental para a construção de acordes menores e para definir o modo menor."
    },
    {
      question: "Qual é o intervalo entre as notas Fá e Si?",
      correctOptionLabel: "4ª aumentada",
      alternateLabel: "trítono",
      explanation: "O intervalo entre Fá e Si é uma 4ª aumentada (3 tons ou 6 semitons), também conhecido como trítono. Na música medieval era chamado de 'diabolus in musica' (o diabo na música) por sua dissonância. É um intervalo simétrico que divide a oitava exatamente ao meio."
    },
    {
      question: "Na escala maior, qual é o intervalo formado entre o 1º e o 5º graus?",
      correctOptionLabel: "5ª justa",
      explanation: "Na escala maior, o intervalo entre o 1º e o 5º graus é sempre uma 5ª justa (7 semitons). Esta relação é fundamental na harmonia tonal, estabelecendo a relação tônica-dominante que define grande parte da música ocidental."
    }
  ],
  "Harmonia Avançada": [
    {
      question: "O que é uma modulação por acorde pivô?",
      correctOptionLabel: "Uma modulação que utiliza um acorde comum a duas tonalidades",
      explanation: "A modulação por acorde pivô é uma técnica de transição harmônica onde um acorde que pertence simultaneamente a duas tonalidades diferentes é usado como ponte para estabelecer a nova tonalidade. É uma forma suave de modulação muito utilizada na música clássica."
    },
    {
      question: "Qual destas é uma característica do empréstimo modal?",
      correctOptionLabel: "Uso de acordes de modos paralelos na mesma tonalidade",
      explanation: "O empréstimo modal consiste em utilizar acordes derivados de modos paralelos (que compartilham a mesma tônica) dentro de uma tonalidade. Por exemplo, em Dó maior, usar o acorde de Láb maior (VI grau do modo menor) cria uma sonoridade expressiva por empréstimo modal."
    },
    {
      question: "Qual acorde é a substituição tritônica do V7?",
      correctOptionLabel: "bII7",
      explanation: "A substituição tritônica do V7 é o acorde de sétima construído sobre o segundo grau abaixado (bII7). Por exemplo, em Dó maior, o V7 (G7) pode ser substituído pelo Db7. Estes acordes compartilham as notas guia (3ª e 7ª) e estão separados por um trítono."
    },
    {
      question: "Qual progressão representa uma cadência autêntica perfeita?",
      correctOptionLabel: "V7-I com ambos os acordes em estado fundamental",
      explanation: "A cadência autêntica perfeita consiste na progressão V7-I (dominante para tônica) com ambos os acordes em estado fundamental e com a tônica na voz mais aguda do acorde final. É considerada a cadência mais conclusiva na música tonal."
    },
    {
      question: "Qual técnica de harmonização utiliza acordes com notas adicionadas além da tríade básica?",
      correctOptionLabel: "Extensões harmônicas",
      explanation: "As extensões harmônicas são notas adicionadas além da tríade básica (como 7ª, 9ª, 11ª e 13ª). São muito utilizadas no jazz e na música popular para criar sonoridades mais ricas e complexas, ampliando as possibilidades expressivas dos acordes."
    }
  ]
};

// Verificar e refinar o conteúdo teórico
const validateAndRefineContent = async () => {
  try {
    console.log('🔍 Iniciando validação e refinamento de conteúdo teórico musical...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    // Estatísticas
    let totalQuestionsChecked = 0;
    let questionsRefined = 0;
    let quizzesUpdated = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Analisando quiz: ${quiz.title}`);
      
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
      
      if (!contentType || !refinedMusicalContent[contentType]) {
        console.log(`⚠️ Tipo de conteúdo não identificado para ${quiz.title}`);
        continue;
      }
      
      console.log(`✅ Identificado como: ${contentType}`);
      
      const refinedContent = refinedMusicalContent[contentType];
      let quizModified = false;
      
      // Para cada questão no quiz
      for (let i = 0; i < quiz.questions.length; i++) {
        totalQuestionsChecked++;
        const question = quiz.questions[i];
        
        // Encontrar a questão refinada correspondente
        const refinedQuestion = refinedContent.find(q => 
          q.question.toLowerCase() === question.question.toLowerCase() ||
          question.question.toLowerCase().includes(q.question.toLowerCase().substring(0, 15)) ||
          q.question.toLowerCase().includes(question.question.toLowerCase().substring(0, 15))
        );
        
        if (!refinedQuestion) {
          console.log(`⚠️ Não encontrada questão correspondente para: "${question.question.substring(0, 40)}..."`);
          continue;
        }
        
        // Verificar se a explicação precisa ser refinada
        if (refinedQuestion.explanation && 
            (!question.explanation || 
             question.explanation.length < refinedQuestion.explanation.length * 0.8)) {
          console.log(`📝 Refinando explicação para: "${question.question.substring(0, 40)}..."`);
          quiz.questions[i].explanation = refinedQuestion.explanation;
          quizModified = true;
          questionsRefined++;
        }
        
        // Encontrar a opção que deveria estar correta
        let correctOptionIndex = question.options.findIndex(opt => 
          opt.label.toLowerCase().includes(refinedQuestion.correctOptionLabel.toLowerCase())
        );
        
        // Se não encontrou, tentar com label alternativo se disponível
        if (correctOptionIndex === -1 && refinedQuestion.alternateLabel) {
          correctOptionIndex = question.options.findIndex(opt => 
            opt.label.toLowerCase().includes(refinedQuestion.alternateLabel.toLowerCase())
          );
        }
        
        if (correctOptionIndex === -1) {
          console.log(`⚠️ Opção correta não encontrada para: "${question.question.substring(0, 40)}..."`);
          console.log(`   Deveria ser: "${refinedQuestion.correctOptionLabel}"`);
          
          // Listar opções disponíveis
          console.log('   Opções disponíveis:');
          question.options.forEach((opt, idx) => {
            console.log(`     ${idx + 1}. ${opt.label} (${opt.isCorrect ? '✓' : '✗'})`);
          });
          
          continue;
        }
        
        // Verificar se a opção correta está marcada
        if (!question.options[correctOptionIndex].isCorrect) {
          console.log(`🔧 Corrigindo resposta para: "${question.question.substring(0, 40)}..."`);
          
          // Marcar todas as opções como incorretas
          for (let j = 0; j < question.options.length; j++) {
            quiz.questions[i].options[j].isCorrect = false;
          }
          
          // Marcar a opção correta
          quiz.questions[i].options[correctOptionIndex].isCorrect = true;
          quizModified = true;
          questionsRefined++;
        }
      }
      
      // Salvar alterações se o quiz foi modificado
      if (quizModified) {
        await quiz.save();
        console.log(`✅ Quiz atualizado com refinamentos: ${quiz.title}`);
        quizzesUpdated++;
      } else {
        console.log(`✅ Quiz já está correto: ${quiz.title}`);
      }
    }
    
    console.log('\n📊 Resumo do refinamento:');
    console.log(`   Total de quizzes verificados: ${quizzes.length}`);
    console.log(`   Total de questões verificadas: ${totalQuestionsChecked}`);
    console.log(`   Questões refinadas: ${questionsRefined}`);
    console.log(`   Quizzes atualizados: ${quizzesUpdated}`);
    
  } catch (error) {
    console.error('❌ Erro ao refinar conteúdo teórico:', error);
  }
};

// Verificar a consistência das respostas corretas
const verifyCorrectAnswers = async () => {
  try {
    console.log('\n🔍 Verificando se todas as questões têm uma opção correta marcada...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    
    let totalQuestionsWithoutCorrect = 0;
    let totalQuestionsWithMultipleCorrect = 0;
    
    // Verificar cada quiz
    for (const quiz of quizzes) {
      console.log(`\n📝 Quiz: ${quiz.title}`);
      
      // Verificar cada questão
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        
        // Contar opções corretas
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        const correctCount = correctOptions.length;
        
        // Log baseado no resultado
        if (correctCount === 0) {
          console.log(`❌ Questão ${i+1} sem resposta correta: "${question.question.substring(0, 40)}..."`);
          totalQuestionsWithoutCorrect++;
        } else if (correctCount > 1) {
          console.log(`⚠️ Questão ${i+1} com ${correctCount} respostas corretas: "${question.question.substring(0, 40)}..."`);
          totalQuestionsWithMultipleCorrect++;
        } else {
          console.log(`✅ Questão ${i+1}: "${question.question.substring(0, 40)}..." - OK`);
        }
      }
    }
    
    console.log('\n📊 Resumo da verificação:');
    console.log(`   Total de questões sem resposta correta: ${totalQuestionsWithoutCorrect}`);
    console.log(`   Total de questões com múltiplas respostas: ${totalQuestionsWithMultipleCorrect}`);
    
    if (totalQuestionsWithoutCorrect === 0 && totalQuestionsWithMultipleCorrect === 0) {
      console.log('   ✅ Todas as questões estão com exatamente uma resposta correta!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar respostas corretas:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    
    // Refinar o conteúdo teórico
    await validateAndRefineContent();
    
    // Verificar se todas as questões têm uma resposta correta
    await verifyCorrectAnswers();
    
    console.log('\n✨ Validação e refinamento concluídos!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























