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

// Conteúdo teórico refinado com explicações detalhadas
const detailedExplanations = {
  "Propriedades do Som": [
    {
      question: "Qual propriedade do som determina se uma nota é grave ou aguda?",
      correctOptionLabel: "Altura",
      explanation: "A altura (pitch) é a propriedade acústica relacionada à frequência das ondas sonoras. Quanto maior a frequência, mais agudo é o som; quanto menor, mais grave. É medida em Hertz (Hz). Por exemplo, a nota Lá 440Hz é o padrão de afinação para orquestras."
    },
    {
      question: "O que diferencia o som de um violino e um piano tocando a mesma nota?",
      correctOptionLabel: "Timbre",
      explanation: "O timbre é a qualidade sonora que permite distinguir sons da mesma altura e intensidade produzidos por fontes diferentes. É determinado pelos harmônicos (frequências secundárias) que acompanham a frequência fundamental. Cada instrumento possui um envelope sonoro único com ataque, sustentação e decaimento característicos."
    },
    {
      question: "Qual símbolo musical indica que uma nota deve ser tocada com pouca intensidade?",
      correctOptionLabel: "p (piano)",
      explanation: "Na notação musical, 'p' (piano) indica que o som deve ser executado com baixa intensidade. A escala completa de dinâmicas vai de ppp (pianississimo - extremamente suave) a fff (fortississimo - extremamente forte). Estas indicações italianas são universalmente utilizadas na música ocidental desde o período barroco."
    },
    {
      question: "Qual figura musical representa a maior duração em um compasso simples?",
      correctOptionLabel: "Semibreve",
      explanation: "A semibreve (whole note) é a figura de maior duração no sistema moderno de notação musical, valendo 4 tempos em um compasso quaternário (4/4). As demais figuras são subdivisões dela: mínima (2 tempos), semínima (1 tempo), colcheia (1/2 tempo), semicolcheia (1/4 tempo), fusa (1/8 tempo) e semifusa (1/16 tempo)."
    },
    {
      question: "O que significa o símbolo de crescendo (<) na partitura?",
      correctOptionLabel: "Aumentar gradualmente a intensidade",
      explanation: "O crescendo (<) é uma indicação de dinâmica que orienta o músico a aumentar gradualmente a intensidade do som durante o trecho marcado. Seu oposto é o diminuendo ou decrescendo (>), que indica redução gradual da intensidade. Estas indicações são essenciais para a expressividade musical, permitindo nuances na interpretação."
    }
  ],
  "Notação Musical": [
    {
      question: "Quantas linhas possui um pentagrama padrão?",
      correctOptionLabel: "5 linhas",
      explanation: "O pentagrama (staff) padrão consiste em exatamente 5 linhas horizontais equidistantes e 4 espaços entre elas. É neste sistema que as notas musicais são escritas, tanto nas linhas quanto nos espaços. Quando necessário, podem ser adicionadas linhas suplementares acima ou abaixo do pentagrama para acomodar notas mais agudas ou graves."
    },
    {
      question: "Em uma partitura com clave de Sol, onde se localiza a nota Sol?",
      correctOptionLabel: "Na segunda linha",
      explanation: "A clave de Sol (G clef) é posicionada de modo que sua espiral circunde a segunda linha do pentagrama, indicando que ali está a nota Sol (G). Esta é a clave mais comum para instrumentos de registro médio-agudo como violino, flauta, trompete e a mão direita do piano. A partir desta referência, as outras notas são posicionadas."
    },
    {
      question: "Quantos tempos vale uma mínima?",
      correctOptionLabel: "2 tempos",
      explanation: "A mínima (half note) vale 2 tempos em um compasso simples. Representa metade da duração de uma semibreve (4 tempos) e o dobro de uma semínima (1 tempo). É representada por uma nota com cabeça branca e haste. Em compassos compostos, como 6/8, seu valor relativo se mantém, mas a unidade de tempo muda."
    },
    {
      question: "Qual figura musical representa a metade da duração de uma semínima?",
      correctOptionLabel: "Colcheia",
      explanation: "A colcheia (eighth note) representa 1/2 tempo, metade da duração de uma semínima. É identificada pela cabeça preta com haste e uma bandeirola. Duas colcheias ligadas equivalem a uma semínima. Em notação rítmica, oito colcheias preenchem um compasso 4/4. Quando agrupadas, suas hastes são conectadas por uma barra horizontal."
    },
    {
      question: "O que indica a fração 4/4 no início de uma partitura?",
      correctOptionLabel: "A fórmula de compasso",
      explanation: "A fração 4/4 indica a fórmula de compasso (time signature). O numerador (4) representa o número de unidades de tempo por compasso, e o denominador (4) indica que a semínima é a unidade de tempo. Também conhecido como compasso quaternário simples ou 'common time', pode ser representado pelo símbolo C. É o compasso mais utilizado na música ocidental."
    }
  ],
  "Intervalos Musicais": [
    {
      question: "Qual é o intervalo entre as notas Dó e Mi?",
      correctOptionLabel: "3ª maior",
      explanation: "O intervalo entre Dó e Mi é uma 3ª maior, abrangendo 2 tons (ou 4 semitons). Na teoria musical ocidental, a 3ª maior é um dos intervalos fundamentais para a construção de acordes maiores. Este intervalo tem uma qualidade sonora brilhante e estável, sendo a base da sonoridade dos acordes maiores que transmitem sensações de alegria ou resolução."
    },
    {
      question: "Qual intervalo é considerado 'consonância perfeita'?",
      correctOptionLabel: "5ª justa",
      explanation: "Na teoria tradicional, os intervalos de uníssono, 4ª justa, 5ª justa e oitava são considerados consonâncias perfeitas. A 5ª justa (7 semitons) é especialmente importante na música ocidental, sendo a base do ciclo de quintas e da relação entre tônica e dominante. As consonâncias perfeitas têm uma estabilidade acústica devido à proporção simples entre as frequências das notas."
    },
    {
      question: "Quantos tons tem um intervalo de 3ª menor?",
      correctOptionLabel: "1,5 tons",
      explanation: "Um intervalo de 3ª menor contém 1,5 tons (ou 3 semitons). Exemplos incluem Lá-Dó, Mi-Sol e Si-Ré. A 3ª menor é fundamental para a construção de acordes menores e para definir o modo menor. Este intervalo possui uma qualidade sonora mais melancólica ou introspectiva em comparação com a 3ª maior, sendo essencial para expressar emoções como tristeza ou nostalgia na música."
    },
    {
      question: "Qual é o intervalo entre as notas Fá e Si?",
      correctOptionLabel: "4ª aumentada",
      alternateLabel: "trítono",
      explanation: "O intervalo entre Fá e Si é uma 4ª aumentada (3 tons ou 6 semitons), também conhecido como trítono. Na música medieval era chamado de 'diabolus in musica' (o diabo na música) por sua dissonância. É um intervalo simétrico que divide a oitava exatamente ao meio. Na harmonia funcional, o trítono presente no acorde dominante (entre a 3ª e a 7ª) cria a tensão que busca resolução na tônica."
    },
    {
      question: "Na escala maior, qual é o intervalo formado entre o 1º e o 5º graus?",
      correctOptionLabel: "5ª justa",
      explanation: "Na escala maior, o intervalo entre o 1º e o 5º graus é sempre uma 5ª justa (7 semitons). Esta relação é fundamental na harmonia tonal, estabelecendo a relação tônica-dominante que define grande parte da música ocidental. A progressão V-I (dominante-tônica) é considerada a mais forte resolução harmônica, presente em praticamente todas as cadências conclusivas da música clássica e popular."
    }
  ],
  "Harmonia Avançada": [
    {
      question: "O que é uma modulação por acorde pivô?",
      correctOptionLabel: "Uma modulação que utiliza um acorde comum a duas tonalidades",
      explanation: "A modulação por acorde pivô é uma técnica de transição harmônica onde um acorde que pertence simultaneamente a duas tonalidades diferentes é usado como ponte para estabelecer a nova tonalidade. É uma forma suave de modulação muito utilizada na música clássica. Por exemplo, o acorde de Lá menor pode funcionar como vi grau em Dó maior e como ii grau em Sol maior, servindo como pivô entre estas tonalidades."
    },
    {
      question: "Qual destas é uma característica do empréstimo modal?",
      correctOptionLabel: "Uso de acordes de modos paralelos na mesma tonalidade",
      explanation: "O empréstimo modal consiste em utilizar acordes derivados de modos paralelos (que compartilham a mesma tônica) dentro de uma tonalidade. Por exemplo, em Dó maior, usar o acorde de Láb maior (VI grau do modo menor) cria uma sonoridade expressiva por empréstimo modal. Esta técnica enriquece a paleta harmônica, sendo muito utilizada na música romântica, no jazz e na música popular para criar contrastes emocionais."
    },
    {
      question: "Qual acorde é a substituição tritônica do V7?",
      correctOptionLabel: "bII7",
      alternateLabel: "Db7",
      explanation: "A substituição tritônica do V7 é o acorde de sétima construído sobre o segundo grau abaixado (bII7). Por exemplo, em Dó maior, o G7 (V7) pode ser substituído pelo Db7 (bII7). Estes acordes compartilham as notas guia (3ª e 7ª) e suas fundamentais estão separadas por um trítono. Esta substituição é muito utilizada no jazz e na música popular, especialmente em progressões II-V-I, criando movimento cromático no baixo."
    },
    {
      question: "Qual progressão representa uma cadência autêntica perfeita?",
      correctOptionLabel: "V7-I com ambos os acordes em estado fundamental",
      alternateLabel: "G7-C",
      explanation: "A cadência autêntica perfeita consiste na progressão V7-I (dominante para tônica) com ambos os acordes em estado fundamental e com a tônica na voz mais aguda do acorde final. É considerada a cadência mais conclusiva na música tonal, criando forte sensação de resolução e finalização. Esta cadência é frequentemente utilizada para encerrar frases musicais, seções ou peças inteiras na música clássica e popular."
    },
    {
      question: "Qual técnica de harmonização utiliza acordes com notas adicionadas além da tríade básica?",
      correctOptionLabel: "Extensões harmônicas",
      alternateLabel: "Harmonização cromática",
      explanation: "As extensões harmônicas são notas adicionadas além da tríade básica (como 7ª, 9ª, 11ª e 13ª). São muito utilizadas no jazz e na música popular para criar sonoridades mais ricas e complexas. A harmonização cromática também utiliza acordes com notas que não pertencem à tonalidade, criando tensão e colorido harmônico. Estas técnicas expandem as possibilidades expressivas dos acordes, permitindo nuances emocionais mais sofisticadas."
    }
  ]
};

// Atualizar as explicações no banco de dados de forma direta
const forceUpdateExplanations = async () => {
  try {
    console.log('🔧 Iniciando atualização forçada de explicações...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Atualizando quiz: ${quiz.title}`);
      
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
      
      if (!contentType || !detailedExplanations[contentType]) {
        console.log(`⚠️ Tipo de conteúdo não identificado para ${quiz.title}`);
        continue;
      }
      
      // Obter as explicações para este tipo de conteúdo
      const explanations = detailedExplanations[contentType];
      
      // Atualizar diretamente no banco de dados
      await Quiz.updateOne(
        { _id: quiz._id },
        { $set: { 
          "questions.0.explanation": explanations[0].explanation,
          "questions.1.explanation": explanations[1].explanation,
          "questions.2.explanation": explanations[2].explanation,
          "questions.3.explanation": explanations[3].explanation,
          "questions.4.explanation": explanations[4].explanation
        }}
      );
      
      console.log(`✅ Explicações atualizadas para: ${quiz.title}`);
    }
    
    console.log('\n✅ Todas as explicações foram atualizadas!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar explicações:', error);
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
    
    // Atualizar explicações de forma direta
    await forceUpdateExplanations();
    
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





























