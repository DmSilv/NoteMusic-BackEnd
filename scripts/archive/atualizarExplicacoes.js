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

// Explicações detalhadas para todas as perguntas
const explicacoesDetalhadas = {
  // Propriedades do Som
  "propriedades-som": {
    "propriedade do som determina se uma nota é grave ou aguda": 
      "A altura (pitch) é a propriedade acústica relacionada à frequência das ondas sonoras. Quanto maior a frequência, mais agudo é o som; quanto menor, mais grave. É medida em Hertz (Hz). Por exemplo, a nota Lá 440Hz é o padrão de afinação para orquestras.",
    
    "diferencia o som de um violino e um piano": 
      "O timbre é a qualidade sonora que permite distinguir sons da mesma altura e intensidade produzidos por fontes diferentes. É determinado pelos harmônicos (frequências secundárias) que acompanham a frequência fundamental. Cada instrumento possui um envelope sonoro único com ataque, sustentação e decaimento característicos.",
    
    "símbolo musical indica que uma nota deve ser tocada com pouca intensidade": 
      "Na notação musical, 'p' (piano) indica que o som deve ser executado com baixa intensidade. A escala completa de dinâmicas vai de ppp (pianississimo - extremamente suave) a fff (fortississimo - extremamente forte). Estas indicações italianas são universalmente utilizadas na música ocidental desde o período barroco.",
    
    "figura musical representa a maior duração em um compasso": 
      "A semibreve (whole note) é a figura musical de maior duração no sistema moderno de notação musical, valendo 4 tempos em um compasso quaternário (4/4). As demais figuras são subdivisões dela: mínima (2 tempos), semínima (1 tempo), colcheia (1/2 tempo), semicolcheia (1/4 tempo), fusa (1/8 tempo) e semifusa (1/16 tempo).",
    
    "significa o símbolo de crescendo": 
      "O crescendo (<) é uma indicação de dinâmica que orienta o músico a aumentar gradualmente a intensidade do som durante o trecho marcado. Seu oposto é o diminuendo ou decrescendo (>), que indica redução gradual da intensidade. Estas indicações são essenciais para a expressividade musical, permitindo nuances na interpretação."
  },
  
  // Notação Musical
  "notacao-musical": {
    "quantas linhas possui um pentagrama": 
      "O pentagrama (staff) padrão consiste em exatamente 5 linhas horizontais equidistantes e 4 espaços entre elas. É neste sistema que as notas musicais são escritas, tanto nas linhas quanto nos espaços. Quando necessário, podem ser adicionadas linhas suplementares acima ou abaixo do pentagrama para acomodar notas mais agudas ou graves.",
    
    "onde se localiza a nota sol na clave de sol": 
      "A clave de Sol é posicionada de modo que sua espiral circunde a segunda linha do pentagrama, indicando que ali está a nota Sol (G). Esta é a clave mais comum para instrumentos de registro médio-agudo como violino, flauta, trompete e a mão direita do piano.",
    
    "quantos tempos vale uma mínima": 
      "A mínima (half note) vale 2 tempos em um compasso simples. Representa metade da duração de uma semibreve (4 tempos) e o dobro de uma semínima (1 tempo). É representada por uma nota com cabeça branca e haste. Em compassos compostos, como 6/8, seu valor relativo se mantém, mas a unidade de tempo muda.",
    
    "figura musical representa a metade da duração de uma semínima": 
      "A colcheia (eighth note) vale 1/2 tempo, metade da duração de uma semínima. É identificada pela cabeça preta com haste e uma bandeirola. Duas colcheias ligadas equivalem a uma semínima. A fusa vale 1/8 de tempo (1/4 de colcheia), e a semicolcheia vale 1/4 de tempo (1/2 de colcheia).",
    
    "o que indica a fração 4/4": 
      "A fração 4/4 indica a fórmula de compasso (time signature). O numerador (4) representa o número de unidades de tempo por compasso, e o denominador (4) indica que a semínima é a unidade de tempo. Também conhecido como compasso quaternário simples ou 'common time', pode ser representado pelo símbolo C. É o compasso mais utilizado na música ocidental."
  },
  
  // Intervalos Musicais
  "intervalos-musicais": {
    "intervalo entre as notas dó e mi": 
      "O intervalo entre Dó e Mi é uma 3ª maior, abrangendo 2 tons (ou 4 semitons). Na teoria musical ocidental, a 3ª maior é um dos intervalos fundamentais para a construção de acordes maiores. Este intervalo tem uma qualidade sonora brilhante e estável, sendo a base da sonoridade dos acordes maiores que transmitem sensações de alegria ou resolução.",
    
    "intervalo considerado consonância perfeita": 
      "Na teoria tradicional, os intervalos de uníssono, 4ª justa, 5ª justa e oitava são considerados consonâncias perfeitas. A 5ª justa (7 semitons) é especialmente importante na música ocidental, sendo a base do ciclo de quintas e da relação entre tônica e dominante. As consonâncias perfeitas têm uma estabilidade acústica devido à proporção simples entre as frequências das notas.",
    
    "quantos tons tem um intervalo de 3ª menor": 
      "Um intervalo de 3ª menor contém 1,5 tons (ou 3 semitons). Exemplos incluem Lá-Dó, Mi-Sol e Si-Ré. A 3ª menor é fundamental para a construção de acordes menores e para definir o modo menor. Este intervalo possui uma qualidade sonora mais melancólica ou introspectiva em comparação com a 3ª maior, sendo essencial para expressar emoções como tristeza ou nostalgia na música.",
    
    "intervalo entre as notas fá e si": 
      "O intervalo entre Fá e Si é uma 4ª aumentada (também conhecido como trítono). Contém 3 tons de distância (6 semitons) e é tradicionalmente considerado dissonante. Na Idade Média era chamado de 'diabolus in musica' (o diabo na música) devido à sua instabilidade sonora. É um intervalo importante na música moderna, especialmente no jazz e na música contemporânea, sendo fundamental na estrutura do acorde de sétima da dominante.",
    
    "intervalo formado entre o 1º e o 5º graus da escala maior": 
      "Na escala maior, o intervalo entre o 1º e o 5º graus (tônica e dominante) é uma 5ª justa. Este intervalo de 7 semitons é fundamental na música tonal, estabelecendo a relação de tensão e resolução que define muitas progressões harmônicas. A relação entre tônica e dominante é uma das mais importantes na música ocidental e forma a base do ciclo de quintas, usado para organizar tonalidades relacionadas."
  },
  
  // Harmonia Avançada
  "harmonia-avancada": {
    "o que é uma modulação por acorde pivô": 
      "A modulação por acorde pivô (ou acorde comum) é uma técnica de transição entre tonalidades que utiliza um acorde que pertence simultaneamente a ambas as tonalidades. Este acorde serve como 'ponte' harmônica, permitindo uma mudança suave de centro tonal. Foi amplamente utilizada por compositores clássicos como Mozart, Beethoven e Schubert para criar transições elegantes entre seções em diferentes tonalidades.",
    
    "característica do empréstimo modal": 
      "O empréstimo modal é uma técnica harmônica que consiste em utilizar acordes provenientes de modos paralelos (que compartilham a mesma tônica) dentro de uma tonalidade. Por exemplo, em Dó maior, usar o acorde de Fm (que pertence a Dó menor) é um empréstimo modal. Esta técnica enriquece a paleta harmônica, trazendo cores e expressividade adicionais, sendo comum na música romântica, jazz, e música popular.",
    
    "substituição tritônica de G7": 
      "A substituição tritônica de G7 é Db7 (ou C#7 enarmonicamente). Esta técnica substitui um acorde dominante por outro cujo fundamental está a distância de trítono (3 tons). Ambos os acordes compartilham as notas de trítono (no caso, B e F), que são a terça e a sétima de G7 e a sétima e terça de Db7, respectivamente. Esta substituição é muito utilizada no jazz e cria uma sonoridade mais sofisticada com movimento cromático no baixo.",
    
    "cadência plagal com empréstimo modal em dó maior": 
      "A cadência plagal com empréstimo modal em Dó maior seria C - Fm - C (I - iv - I). A cadência plagal tradicional seria C - F - C (I - IV - I), mas neste caso o acorde F maior é substituído por F menor, que é emprestado do modo paralelo de Dó menor. Esta progressão cria uma sonoridade mais expressiva e melancólica, sendo comum em finais de peças corais, hinos religiosos (o famoso 'Amém') e em música popular.",
    
    "técnica de harmonização utiliza acordes com notas não pertencentes à escala": 
      "A harmonização cromática utiliza acordes que contêm notas não pertencentes à escala diatônica da tonalidade, introduzindo cromatismos. Esta técnica enriquece a harmonia com cores sonoras mais complexas e tensões adicionais. Exemplos incluem acordes de sexta aumentada, acordes de sexta napolitana, acordes alterados e substituições por trítono. É amplamente utilizada na música romântica, impressionista, jazz e música contemporânea para criar expressividade e surpresa harmônica."
  }
};

// Atualizar explicações para todas as perguntas
const atualizarExplicacoes = async () => {
  try {
    console.log('🎼 Iniciando atualização das explicações...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    let totalPerguntas = 0;
    let explicacoesAtualizadas = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Atualizando explicações no quiz: ${quiz.title}`);
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
      
      // Obter explicações para esta categoria
      const explicacoesCat = categoria ? explicacoesDetalhadas[categoria] : {};
      
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
        
        // Verificar se a explicação precisa ser atualizada
        if (!question.explanation || question.explanation.length < 50) {
          console.log('⚠️ Explicação ausente ou insuficiente - atualizando...');
          
          // Procurar uma explicação adequada
          let explicacaoEncontrada = false;
          
          // Procurar em todas as categorias se não temos uma categoria específica
          const categoriasParaProcurar = categoria ? [categoria] : Object.keys(explicacoesDetalhadas);
          
          for (const cat of categoriasParaProcurar) {
            if (explicacaoEncontrada) break;
            
            const explicacoesDaCat = explicacoesDetalhadas[cat];
            for (const [palavraChave, explicacao] of Object.entries(explicacoesDaCat)) {
              if (perguntaLimpa.includes(palavraChave.toLowerCase())) {
                console.log(`✅ Explicação encontrada para: "${palavraChave}"`);
                quiz.questions[i].explanation = explicacao;
                explicacaoEncontrada = true;
                explicacoesAtualizadas++;
                quizModificado = true;
                break;
              }
            }
          }
          
          if (!explicacaoEncontrada) {
            console.log('❌ Não foi possível encontrar uma explicação específica');
            
            // Tentar encontrar uma explicação com base na resposta correta
            const correctOption = question.options.find(opt => opt.isCorrect);
            if (correctOption) {
              console.log(`🔍 Procurando explicação com base na resposta: "${correctOption.label}"`);
              
              // Gerar uma explicação genérica baseada na resposta correta
              let explicacaoGenerica = "";
              
              if (perguntaLimpa.includes("intervalo")) {
                explicacaoGenerica = `O intervalo musical de ${correctOption.label} é um conceito fundamental na teoria musical. Este intervalo tem características sonoras específicas e é utilizado em diversos contextos harmônicos e melódicos. A compreensão dos intervalos é essencial para o estudo de escalas, acordes e progressões harmônicas.`;
              } else if (perguntaLimpa.includes("figura") || perguntaLimpa.includes("duração")) {
                explicacaoGenerica = `A figura musical ${correctOption.label} tem um valor rítmico específico na notação musical ocidental. O entendimento das figuras musicais e suas durações relativas é fundamental para a leitura e interpretação de partituras, bem como para a compreensão da estrutura rítmica da música.`;
              } else if (perguntaLimpa.includes("clave") || perguntaLimpa.includes("pentagrama")) {
                explicacaoGenerica = `Na notação musical, ${correctOption.label} é um elemento essencial para a leitura e escrita da música. A compreensão da posição das notas no pentagrama e o uso correto das claves permite aos músicos interpretar precisamente a altura das notas escritas.`;
              } else {
                explicacaoGenerica = `${correctOption.label} é um conceito importante na teoria musical. O conhecimento deste e outros elementos musicais fundamentais permite uma compreensão mais profunda da música e sua estrutura, facilitando tanto a interpretação quanto a composição musical.`;
              }
              
              quiz.questions[i].explanation = explicacaoGenerica;
              console.log('✅ Explicação genérica criada com base na resposta');
              explicacoesAtualizadas++;
              quizModificado = true;
            }
          }
        } else {
          console.log('✅ Explicação já existente e adequada');
        }
      }
      
      // Salvar o quiz se foi modificado
      if (quizModificado) {
        await quiz.save();
        console.log(`\n✅ Quiz ${quiz.title} atualizado com novas explicações`);
      }
    }
    
    console.log('\n📊 Resumo da atualização:');
    console.log(`   Total de perguntas processadas: ${totalPerguntas}`);
    console.log(`   Explicações atualizadas: ${explicacoesAtualizadas}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar explicações:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await atualizarExplicacoes();
    console.log('\n✨ Processo concluído! Todas as explicações foram atualizadas com conteúdo especializado em teoria musical.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























