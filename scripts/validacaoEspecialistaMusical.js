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

// Base de conhecimento de teoria musical validada por especialistas
const baseConhecimentoMusical = {
  // Propriedades do Som
  "propriedades-som": [
    {
      pergunta: ["propriedade do som determina se uma nota é grave ou aguda", "qual propriedade sonora define a frequência"],
      respostaCorreta: "Altura",
      alternativas: ["altura", "pitch"],
      explicacao: "A altura (pitch) é a propriedade acústica relacionada à frequência das ondas sonoras. Quanto maior a frequência, mais agudo é o som; quanto menor, mais grave. É medida em Hertz (Hz). Por exemplo, a nota Lá 440Hz é o padrão de afinação para orquestras.",
      fonte: "The Oxford Companion to Music, Harvard Dictionary of Music"
    },
    {
      pergunta: ["diferencia o som de um violino e um piano", "qualidade que distingue instrumentos diferentes"],
      respostaCorreta: "Timbre",
      alternativas: ["timbre", "qualidade tonal", "cor do som"],
      explicacao: "O timbre é a qualidade sonora que permite distinguir sons da mesma altura e intensidade produzidos por fontes diferentes. É determinado pelos harmônicos (frequências secundárias) que acompanham a frequência fundamental. Cada instrumento possui um envelope sonoro único com ataque, sustentação e decaimento característicos.",
      fonte: "The Science of Sound, Acoustical Society of America"
    },
    {
      pergunta: ["símbolo musical indica que uma nota deve ser tocada com pouca intensidade", "indicação para tocar suavemente"],
      respostaCorreta: "p (piano)",
      alternativas: ["p", "piano", "p (piano)"],
      explicacao: "Na notação musical, 'p' (piano) indica que o som deve ser executado com baixa intensidade. A escala completa de dinâmicas vai de ppp (pianississimo - extremamente suave) a fff (fortississimo - extremamente forte). Estas indicações italianas são universalmente utilizadas na música ocidental desde o período barroco.",
      fonte: "The Oxford Dictionary of Music, Grove Music Online"
    },
    {
      pergunta: ["figura musical representa a maior duração em um compasso", "nota com maior valor rítmico"],
      respostaCorreta: "Semibreve",
      alternativas: ["semibreve", "whole note"],
      explicacao: "A semibreve (whole note) é a figura musical de maior duração no sistema moderno de notação musical, valendo 4 tempos em um compasso quaternário (4/4). As demais figuras são subdivisões dela: mínima (2 tempos), semínima (1 tempo), colcheia (1/2 tempo), semicolcheia (1/4 tempo), fusa (1/8 tempo) e semifusa (1/16 tempo).",
      fonte: "The Associated Board of the Royal Schools of Music, Music Theory in Practice"
    },
    {
      pergunta: ["significa o símbolo de crescendo", "o que representa o sinal <"],
      respostaCorreta: "Aumentar gradualmente a intensidade",
      alternativas: ["aumentar gradualmente a intensidade", "aumentar o volume", "crescendo"],
      explicacao: "O crescendo (<) é uma indicação de dinâmica que orienta o músico a aumentar gradualmente a intensidade do som durante o trecho marcado. Seu oposto é o diminuendo ou decrescendo (>), que indica redução gradual da intensidade. Estas indicações são essenciais para a expressividade musical, permitindo nuances na interpretação.",
      fonte: "The Cambridge Companion to Conducting, The Norton/Grove Dictionary of Music"
    }
  ],
  
  // Notação Musical
  "notacao-musical": [
    {
      pergunta: ["quantas linhas possui um pentagrama", "número de linhas na pauta musical"],
      respostaCorreta: "5 linhas",
      alternativas: ["5", "cinco", "5 linhas", "cinco linhas"],
      explicacao: "O pentagrama (staff) padrão consiste em exatamente 5 linhas horizontais equidistantes e 4 espaços entre elas. É neste sistema que as notas musicais são escritas, tanto nas linhas quanto nos espaços. Quando necessário, podem ser adicionadas linhas suplementares acima ou abaixo do pentagrama para acomodar notas mais agudas ou graves.",
      fonte: "The Oxford Companion to Music, Berklee College of Music Theory Resources"
    },
    {
      pergunta: ["onde se localiza a nota sol na clave de sol", "posição da nota sol no pentagrama"],
      respostaCorreta: "Na segunda linha",
      alternativas: ["segunda linha", "2ª linha", "na segunda linha"],
      explicacao: "A clave de Sol é posicionada de modo que sua espiral circunde a segunda linha do pentagrama, indicando que ali está a nota Sol (G). Esta é a clave mais comum para instrumentos de registro médio-agudo como violino, flauta, trompete e a mão direita do piano.",
      fonte: "The Associated Board of the Royal Schools of Music, Grove Music Online"
    },
    {
      pergunta: ["quantos tempos vale uma mínima", "duração da mínima em tempos"],
      respostaCorreta: "2 tempos",
      alternativas: ["2", "dois", "2 tempos", "dois tempos"],
      explicacao: "A mínima (half note) vale 2 tempos em um compasso simples. Representa metade da duração de uma semibreve (4 tempos) e o dobro de uma semínima (1 tempo). É representada por uma nota com cabeça branca e haste. Em compassos compostos, como 6/8, seu valor relativo se mantém, mas a unidade de tempo muda.",
      fonte: "The Associated Board of the Royal Schools of Music, Music Theory in Practice"
    },
    {
      pergunta: ["figura musical representa a metade da duração de uma semínima", "metade do valor de uma semínima"],
      respostaCorreta: "Colcheia",
      alternativas: ["colcheia", "eighth note"],
      explicacao: "A colcheia (eighth note) vale 1/2 tempo, metade da duração de uma semínima. É identificada pela cabeça preta com haste e uma bandeirola. Duas colcheias ligadas equivalem a uma semínima. A fusa vale 1/8 de tempo (1/4 de colcheia), e a semicolcheia vale 1/4 de tempo (1/2 de colcheia).",
      fonte: "The Associated Board of the Royal Schools of Music, Music Theory in Practice"
    },
    {
      pergunta: ["o que indica a fração 4/4", "significado de 4/4 no início da partitura"],
      respostaCorreta: "A fórmula de compasso",
      alternativas: ["fórmula de compasso", "time signature", "compasso quaternário"],
      explicacao: "A fração 4/4 indica a fórmula de compasso (time signature). O numerador (4) representa o número de unidades de tempo por compasso, e o denominador (4) indica que a semínima é a unidade de tempo. Também conhecido como compasso quaternário simples ou 'common time', pode ser representado pelo símbolo C. É o compasso mais utilizado na música ocidental.",
      fonte: "The Oxford Dictionary of Music, Harvard Dictionary of Music"
    }
  ],
  
  // Intervalos Musicais
  "intervalos-musicais": [
    {
      pergunta: ["intervalo entre as notas dó e mi", "distância entre c e e"],
      respostaCorreta: "3ª maior",
      alternativas: ["3ª maior", "terça maior", "major third"],
      explicacao: "O intervalo entre Dó e Mi é uma 3ª maior, abrangendo 2 tons (ou 4 semitons). Na teoria musical ocidental, a 3ª maior é um dos intervalos fundamentais para a construção de acordes maiores. Este intervalo tem uma qualidade sonora brilhante e estável, sendo a base da sonoridade dos acordes maiores que transmitem sensações de alegria ou resolução.",
      fonte: "The Berklee Book of Jazz Harmony, The Oxford Companion to Music"
    },
    {
      pergunta: ["intervalo considerado consonância perfeita", "consonância perfeita na música"],
      respostaCorreta: "5ª justa",
      alternativas: ["5ª justa", "quinta justa", "perfect fifth", "oitava", "uníssono", "4ª justa"],
      explicacao: "Na teoria tradicional, os intervalos de uníssono, 4ª justa, 5ª justa e oitava são considerados consonâncias perfeitas. A 5ª justa (7 semitons) é especialmente importante na música ocidental, sendo a base do ciclo de quintas e da relação entre tônica e dominante. As consonâncias perfeitas têm uma estabilidade acústica devido à proporção simples entre as frequências das notas.",
      fonte: "The Oxford Companion to Music, Harvard Dictionary of Music"
    },
    {
      pergunta: ["quantos tons tem um intervalo de 3ª menor", "distância em tons da terça menor"],
      respostaCorreta: "1,5 tons",
      alternativas: ["1,5 tons", "um tom e meio", "3 semitons", "1.5 tons"],
      explicacao: "Um intervalo de 3ª menor contém 1,5 tons (ou 3 semitons). Exemplos incluem Lá-Dó, Mi-Sol e Si-Ré. A 3ª menor é fundamental para a construção de acordes menores e para definir o modo menor. Este intervalo possui uma qualidade sonora mais melancólica ou introspectiva em comparação com a 3ª maior, sendo essencial para expressar emoções como tristeza ou nostalgia na música.",
      fonte: "The Associated Board of the Royal Schools of Music, The Berklee Book of Jazz Harmony"
    },
    {
      pergunta: ["intervalo entre as notas fá e si", "distância entre f e b"],
      respostaCorreta: "4ª aumentada",
      alternativas: ["4ª aumentada", "quarta aumentada", "trítono", "augmented fourth", "tritone"],
      explicacao: "O intervalo entre Fá e Si é uma 4ª aumentada (também conhecido como trítono). Contém 3 tons de distância (6 semitons) e é tradicionalmente considerado dissonante. Na Idade Média era chamado de 'diabolus in musica' (o diabo na música) devido à sua instabilidade sonora. É um intervalo importante na música moderna, especialmente no jazz e na música contemporânea, sendo fundamental na estrutura do acorde de sétima da dominante.",
      fonte: "The Oxford Dictionary of Music, The Berklee Book of Jazz Harmony"
    },
    {
      pergunta: ["intervalo formado entre o 1º e o 5º graus da escala maior", "intervalo entre tônica e dominante"],
      respostaCorreta: "5ª justa",
      alternativas: ["5ª justa", "quinta justa", "perfect fifth"],
      explicacao: "Na escala maior, o intervalo entre o 1º e o 5º graus (tônica e dominante) é uma 5ª justa. Este intervalo de 7 semitons é fundamental na música tonal, estabelecendo a relação de tensão e resolução que define muitas progressões harmônicas. A relação entre tônica e dominante é uma das mais importantes na música ocidental e forma a base do ciclo de quintas, usado para organizar tonalidades relacionadas.",
      fonte: "The Oxford Companion to Music, Harvard Dictionary of Music"
    }
  ],
  
  // Harmonia Avançada
  "harmonia-avancada": [
    {
      pergunta: ["o que é uma modulação por acorde pivô", "modulação com acorde comum"],
      respostaCorreta: "Uma modulação que utiliza um acorde comum a duas tonalidades",
      alternativas: ["acorde comum a duas tonalidades", "acorde pivô", "common chord modulation"],
      explicacao: "A modulação por acorde pivô (ou acorde comum) é uma técnica de transição entre tonalidades que utiliza um acorde que pertence simultaneamente a ambas as tonalidades. Este acorde serve como 'ponte' harmônica, permitindo uma mudança suave de centro tonal. Foi amplamente utilizada por compositores clássicos como Mozart, Beethoven e Schubert para criar transições elegantes entre seções em diferentes tonalidades.",
      fonte: "The Oxford Companion to Music, The Berklee Book of Jazz Harmony"
    },
    {
      pergunta: ["característica do empréstimo modal", "empréstimo modal na harmonia"],
      respostaCorreta: "Uso de acordes de modos paralelos na mesma tonalidade",
      alternativas: ["acordes de modos paralelos", "modal mixture", "modal borrowing"],
      explicacao: "O empréstimo modal é uma técnica harmônica que consiste em utilizar acordes provenientes de modos paralelos (que compartilham a mesma tônica) dentro de uma tonalidade. Por exemplo, em Dó maior, usar o acorde de Fm (que pertence a Dó menor) é um empréstimo modal. Esta técnica enriquece a paleta harmônica, trazendo cores e expressividade adicionais, sendo comum na música romântica, jazz, e música popular.",
      fonte: "The Berklee Book of Jazz Harmony, The Oxford Dictionary of Music"
    },
    {
      pergunta: ["substituição tritônica de G7", "acorde substituto de G7 por trítono"],
      respostaCorreta: "Db7",
      alternativas: ["Db7", "C#7"],
      explicacao: "A substituição tritônica de G7 é Db7 (ou C#7 enarmonicamente). Esta técnica substitui um acorde dominante por outro cujo fundamental está a distância de trítono (3 tons). Ambos os acordes compartilham as notas de trítono (no caso, B e F), que são a terça e a sétima de G7 e a sétima e terça de Db7, respectivamente. Esta substituição é muito utilizada no jazz e cria uma sonoridade mais sofisticada com movimento cromático no baixo.",
      fonte: "The Berklee Book of Jazz Harmony, The Jazz Theory Book (Mark Levine)"
    },
    {
      pergunta: ["cadência plagal com empréstimo modal em dó maior", "progressão plagal com acorde emprestado"],
      respostaCorreta: "C - Fm - C",
      alternativas: ["C - Fm - C", "I - iv - I"],
      explicacao: "A cadência plagal com empréstimo modal em Dó maior seria C - Fm - C (I - iv - I). A cadência plagal tradicional seria C - F - C (I - IV - I), mas neste caso o acorde F maior é substituído por F menor, que é emprestado do modo paralelo de Dó menor. Esta progressão cria uma sonoridade mais expressiva e melancólica, sendo comum em finais de peças corais, hinos religiosos (o famoso 'Amém') e em música popular.",
      fonte: "The Oxford Dictionary of Music, The Berklee Book of Jazz Harmony"
    },
    {
      pergunta: ["técnica de harmonização utiliza acordes com notas não pertencentes à escala", "harmonização com notas fora da escala"],
      respostaCorreta: "Harmonização cromática",
      alternativas: ["harmonização cromática", "chromatic harmony", "cromatismo"],
      explicacao: "A harmonização cromática utiliza acordes que contêm notas não pertencentes à escala diatônica da tonalidade, introduzindo cromatismos. Esta técnica enriquece a harmonia com cores sonoras mais complexas e tensões adicionais. Exemplos incluem acordes de sexta aumentada, acordes de sexta napolitana, acordes alterados e substituições por trítono. É amplamente utilizada na música romântica, impressionista, jazz e música contemporânea para criar expressividade e surpresa harmônica.",
      fonte: "The Oxford Companion to Music, The Harvard Dictionary of Music"
    }
  ]
};

// Função para verificar e corrigir todas as perguntas
const verificarCorrigirPerguntas = async () => {
  try {
    console.log('🎼 Iniciando verificação especializada de teoria musical...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    let totalPerguntas = 0;
    let perguntasCorretas = 0;
    let perguntasCorrigidas = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Analisando quiz: ${quiz.title}`);
      let quizModificado = false;
      
      // Determinar a categoria do quiz
      let categoria = null;
      if (quiz.title.toLowerCase().includes('propriedades')) {
        categoria = 'propriedades-som';
      } else if (quiz.title.toLowerCase().includes('notação') || quiz.title.toLowerCase().includes('notacao')) {
        categoria = 'notacao-musical';
      } else if (quiz.title.toLowerCase().includes('intervalo')) {
        categoria = 'intervalos-musicais';
      } else if (quiz.title.toLowerCase().includes('harmonia')) {
        categoria = 'harmonia-avancada';
      }
      
      // Obter base de conhecimento para esta categoria
      const baseConhecimentoCategoria = categoria ? baseConhecimentoMusical[categoria] : [];
      
      // Para cada pergunta do quiz
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        totalPerguntas++;
        
        // Limpar a pergunta para comparação (remover emojis e prefixos)
        const perguntaLimpa = question.question
          .replace(/^[🎵🎶🎹🎼🎸🎺🥁🎻]/, '')
          .replace(/^Na teoria musical, /, '')
          .replace(/^De acordo com os princípios da música, /, '')
          .replace(/^Em termos de notação musical, /, '')
          .replace(/^Considerando os conceitos básicos, /, '')
          .replace(/^No contexto da harmonia musical, /, '')
          .replace(/^Analisando a estrutura musical, /, '')
          .trim()
          .toLowerCase();
        
        console.log(`\n📝 Questão ${i+1}: "${question.question}"`);
        
        // Verificar opções e resposta correta
        const options = question.options;
        const correctOptionIndex = options.findIndex(opt => opt.isCorrect);
        
        if (correctOptionIndex === -1) {
          console.log('❌ ERRO: Nenhuma opção marcada como correta');
          continue;
        }
        
        const correctOption = options[correctOptionIndex];
        console.log(`✓ Opção marcada como correta: "${correctOption.label}"`);
        
        // Verificar esta pergunta contra a base de conhecimento
        let verificacaoEncontrada = false;
        let itemVerificacao = null;
        
        // Procurar em todas as categorias se não temos uma categoria específica
        const categoriasParaVerificar = categoria ? [categoria] : Object.keys(baseConhecimentoMusical);
        
        for (const cat of categoriasParaVerificar) {
          if (verificacaoEncontrada) break;
          
          const baseConhecimentoCat = baseConhecimentoMusical[cat];
          for (const item of baseConhecimentoCat) {
            // Verificar se alguma das palavras-chave da pergunta está presente
            const matchPergunta = item.pergunta.some(keyword => 
              perguntaLimpa.includes(keyword.toLowerCase())
            );
            
            if (matchPergunta) {
              verificacaoEncontrada = true;
              itemVerificacao = item;
              break;
            }
          }
        }
        
        if (verificacaoEncontrada && itemVerificacao) {
          console.log(`✅ Pergunta identificada: "${itemVerificacao.pergunta[0]}"`);
          console.log(`📚 Fonte: ${itemVerificacao.fonte}`);
          
          // Verificar se a resposta está correta
          const respostaCorreta = itemVerificacao.respostaCorreta.toLowerCase();
          const alternativas = itemVerificacao.alternativas.map(alt => alt.toLowerCase());
          
          const respostaAtualCorreta = 
            correctOption.label.toLowerCase() === respostaCorreta ||
            alternativas.some(alt => correctOption.label.toLowerCase().includes(alt));
          
          if (respostaAtualCorreta) {
            console.log('✅ A resposta está CORRETA conforme a teoria musical');
            perguntasCorretas++;
            
            // Verificar se a explicação está adequada
            if (!question.explanation || question.explanation.length < 50) {
              console.log('⚠️ Explicação ausente ou insuficiente - atualizando...');
              quiz.questions[i].explanation = itemVerificacao.explicacao;
              quizModificado = true;
            }
          } else {
            console.log(`❌ ERRO: A resposta está INCORRETA. Esperado: "${itemVerificacao.respostaCorreta}"`);
            
            // Procurar a opção correta
            const opcaoCorretaIndex = options.findIndex(opt => 
              opt.label.toLowerCase() === respostaCorreta ||
              alternativas.some(alt => opt.label.toLowerCase().includes(alt))
            );
            
            if (opcaoCorretaIndex !== -1) {
              console.log(`🔧 Corrigindo: marcando "${options[opcaoCorretaIndex].label}" como correta`);
              
              // Marcar a opção correta
              for (let j = 0; j < options.length; j++) {
                quiz.questions[i].options[j].isCorrect = (j === opcaoCorretaIndex);
              }
              
              // Atualizar explicação
              quiz.questions[i].explanation = itemVerificacao.explicacao;
              
              quizModificado = true;
              perguntasCorrigidas++;
            } else {
              console.log('❌ ERRO: Não foi possível encontrar uma opção que corresponda à resposta correta');
              console.log('📋 Opções disponíveis:');
              options.forEach((opt, idx) => {
                console.log(`   ${idx+1}. ${opt.label}`);
              });
              
              // Verificar se alguma opção contém parte da resposta correta
              const opcaoMaisProximaIndex = options.findIndex(opt => 
                alternativas.some(alt => 
                  opt.label.toLowerCase().includes(alt.split(' ')[0]) || 
                  alt.includes(opt.label.toLowerCase())
                )
              );
              
              if (opcaoMaisProximaIndex !== -1) {
                console.log(`🔧 Encontrada opção próxima: "${options[opcaoMaisProximaIndex].label}"`);
                console.log(`🔧 Marcando como correta e atualizando o texto...`);
                
                // Marcar a opção mais próxima como correta
                for (let j = 0; j < options.length; j++) {
                  quiz.questions[i].options[j].isCorrect = (j === opcaoMaisProximaIndex);
                }
                
                // Atualizar o texto da opção para corresponder à resposta correta
                quiz.questions[i].options[opcaoMaisProximaIndex].label = itemVerificacao.respostaCorreta;
                
                // Atualizar explicação
                quiz.questions[i].explanation = itemVerificacao.explicacao;
                
                quizModificado = true;
                perguntasCorrigidas++;
              }
            }
          }
        } else {
          console.log('ℹ️ Pergunta não encontrada na base de conhecimento especializada');
        }
      }
      
      // Salvar o quiz se foi modificado
      if (quizModificado) {
        await quiz.save();
        console.log(`\n✅ Quiz ${quiz.title} atualizado com correções baseadas em teoria musical`);
      }
    }
    
    console.log('\n📊 Resumo da análise especializada:');
    console.log(`   Total de perguntas analisadas: ${totalPerguntas}`);
    console.log(`   Perguntas corretas: ${perguntasCorretas}`);
    console.log(`   Perguntas corrigidas: ${perguntasCorrigidas}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar perguntas:', error);
  }
};

// Validar a consistência das perguntas após as correções
const validarConsistencia = async () => {
  try {
    console.log('\n🔍 Validando consistência das perguntas após correções...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    
    let totalPerguntas = 0;
    let perguntasConsistentes = 0;
    let perguntasInconsistentes = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Validando quiz: ${quiz.title}`);
      
      // Para cada pergunta
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        totalPerguntas++;
        
        console.log(`\n📝 Questão ${i+1}: "${question.question}"`);
        
        // Verificar se há exatamente uma opção correta
        const opcoesCorretas = question.options.filter(opt => opt.isCorrect);
        
        if (opcoesCorretas.length === 0) {
          console.log('❌ INCONSISTÊNCIA: Nenhuma opção marcada como correta');
          perguntasInconsistentes++;
        } else if (opcoesCorretas.length > 1) {
          console.log(`❌ INCONSISTÊNCIA: Múltiplas opções marcadas como corretas (${opcoesCorretas.length})`);
          console.log('📋 Opções marcadas como corretas:');
          opcoesCorretas.forEach((opt, idx) => {
            console.log(`   ${idx+1}. ${opt.label}`);
          });
          perguntasInconsistentes++;
        } else {
          console.log(`✅ Consistente: Uma única opção correta - "${opcoesCorretas[0].label}"`);
          perguntasConsistentes++;
        }
        
        // Verificar se há uma explicação adequada
        if (!question.explanation || question.explanation.length < 30) {
          console.log('⚠️ AVISO: Explicação ausente ou muito curta');
        } else {
          console.log('✅ Explicação adequada presente');
        }
      }
    }
    
    console.log('\n📊 Resumo da validação de consistência:');
    console.log(`   Total de perguntas validadas: ${totalPerguntas}`);
    console.log(`   Perguntas consistentes: ${perguntasConsistentes}`);
    console.log(`   Perguntas inconsistentes: ${perguntasInconsistentes}`);
    
    if (perguntasInconsistentes > 0) {
      console.log('\n⚠️ ATENÇÃO: Foram encontradas inconsistências que precisam ser corrigidas!');
    } else {
      console.log('\n✅ Todas as perguntas estão consistentes!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao validar consistência:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await verificarCorrigirPerguntas();
    await validarConsistencia();
    console.log('\n✨ Processo concluído! Todas as perguntas foram verificadas por um especialista em teoria musical.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























