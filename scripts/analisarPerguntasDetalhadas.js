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

// Definir respostas corretas para verificação detalhada
const respostasCorretas = {
  // Propriedades do Som
  "propriedades-som": [
    {
      pergunta: "Qual propriedade do som determina se uma nota é grave ou aguda?",
      respostaCorreta: "Altura",
      explicacao: "A altura é a propriedade relacionada à frequência da onda sonora, determinando se um som é grave (baixa frequência) ou agudo (alta frequência)."
    },
    {
      pergunta: "O que diferencia o som de um violino e um piano tocando a mesma nota?",
      respostaCorreta: "Timbre",
      explicacao: "O timbre é a qualidade sonora que permite distinguir sons da mesma altura e intensidade produzidos por fontes diferentes."
    },
    {
      pergunta: "Qual símbolo musical indica que uma nota deve ser tocada com pouca intensidade?",
      respostaCorreta: "p (piano)",
      explicacao: "Na notação musical, 'p' (piano) indica que o som deve ser executado com baixa intensidade."
    },
    {
      pergunta: "Qual figura musical representa a maior duração em um compasso simples?",
      respostaCorreta: "Semibreve",
      explicacao: "A semibreve é a figura musical de maior duração, valendo 4 tempos em um compasso quaternário (4/4)."
    },
    {
      pergunta: "O que significa o símbolo de crescendo (<) na partitura?",
      respostaCorreta: "Aumentar gradualmente a intensidade",
      explicacao: "O crescendo (<) indica que o som deve aumentar gradualmente de intensidade."
    }
  ],
  
  // Notação Musical
  "notacao-musical": [
    {
      pergunta: "Quantas linhas possui um pentagrama padrão?",
      respostaCorreta: "5 linhas",
      explicacao: "O pentagrama padrão consiste em exatamente 5 linhas horizontais equidistantes."
    },
    {
      pergunta: "Em uma partitura com clave de Sol, onde se localiza a nota Sol?",
      respostaCorreta: "Na segunda linha",
      explicacao: "A clave de Sol é posicionada de modo que sua espiral circunde a segunda linha do pentagrama, indicando que ali está a nota Sol (G)."
    },
    {
      pergunta: "Quantos tempos vale uma mínima?",
      respostaCorreta: "2 tempos",
      explicacao: "A mínima vale 2 tempos em um compasso simples."
    },
    {
      pergunta: "Qual figura musical representa a metade da duração de uma semínima?",
      respostaCorreta: "Colcheia",
      explicacao: "A colcheia vale metade do valor de uma semínima (1/2 tempo)."
    },
    {
      pergunta: "O que indica a fração 4/4 no início de uma partitura?",
      respostaCorreta: "A fórmula de compasso",
      explicacao: "A fração 4/4 indica a fórmula de compasso: 4 tempos por compasso, sendo a semínima a unidade de tempo."
    }
  ],
  
  // Intervalos Musicais
  "intervalos-musicais": [
    {
      pergunta: "Qual é o intervalo entre as notas Dó e Mi?",
      respostaCorreta: "3ª maior",
      explicacao: "O intervalo entre Dó e Mi é uma 3ª maior, abrangendo 2 tons (ou 4 semitons)."
    },
    {
      pergunta: "Qual intervalo é considerado 'consonância perfeita'?",
      respostaCorreta: "5ª justa",
      explicacao: "A 5ª justa é considerada uma consonância perfeita, junto com o uníssono, a 4ª justa e a 8ª justa."
    },
    {
      pergunta: "Quantos tons tem um intervalo de 3ª menor?",
      respostaCorreta: "1,5 tons",
      alternativas: ["1,5 tons", "um tom e meio", "3 semitons"],
      explicacao: "Um intervalo de 3ª menor contém 1,5 tons (ou 3 semitons)."
    },
    {
      pergunta: "Qual é o intervalo entre as notas Fá e Si?",
      respostaCorreta: "4ª aumentada",
      alternativas: ["4ª aumentada", "trítono"],
      explicacao: "O intervalo entre Fá e Si é uma 4ª aumentada (também conhecido como trítono)."
    },
    {
      pergunta: "Na escala maior, qual é o intervalo formado entre o 1º e o 5º graus?",
      respostaCorreta: "5ª justa",
      explicacao: "Na escala maior, o intervalo entre o 1º e o 5º graus é uma 5ª justa."
    }
  ],
  
  // Figuras Musicais
  "figuras-musicais": [
    {
      pergunta: "Qual é a duração da semibreve?",
      respostaCorreta: "4 tempos",
      explicacao: "A semibreve vale 4 tempos em um compasso quaternário."
    },
    {
      pergunta: "Qual figura musical vale 1/4 do valor da semínima?",
      respostaCorreta: "Semicolcheia",
      explicacao: "A semicolcheia vale 1/4 do valor da semínima."
    }
  ]
};

// Analisar todas as perguntas de forma detalhada
const analisarPerguntas = async () => {
  try {
    console.log('🔍 Analisando todas as perguntas do banco de dados...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    let perguntasAnalisadas = 0;
    let perguntasCorretas = 0;
    let perguntasIncorretas = 0;
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
      } else if (quiz.title.toLowerCase().includes('figura')) {
        categoria = 'figuras-musicais';
      }
      
      // Obter lista de verificação para esta categoria
      const listaVerificacao = categoria ? respostasCorretas[categoria] : [];
      
      // Para cada questão do quiz
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        perguntasAnalisadas++;
        
        // Limpar a pergunta para comparação (remover emojis e prefixos)
        const perguntaLimpa = question.question
          .replace(/^[🎵🎶🎹🎼🎸🎺🥁🎻]/, '')
          .replace(/^Na teoria musical, /, '')
          .replace(/^De acordo com os princípios da música, /, '')
          .replace(/^Em termos de notação musical, /, '')
          .replace(/^Considerando os conceitos básicos, /, '')
          .replace(/^No contexto da harmonia musical, /, '')
          .replace(/^Analisando a estrutura musical, /, '')
          .trim();
        
        console.log(`\n📝 Questão ${i+1}: "${perguntaLimpa}"`);
        
        // Verificar opções e resposta correta
        const options = question.options;
        const correctOptionIndex = options.findIndex(opt => opt.isCorrect);
        
        if (correctOptionIndex === -1) {
          console.log('❌ ERRO: Nenhuma opção marcada como correta');
          perguntasIncorretas++;
          continue;
        }
        
        const correctOption = options[correctOptionIndex];
        console.log(`✓ Opção marcada como correta: "${correctOption.label}"`);
        
        // Verificar se esta pergunta está na lista de verificação
        let verificacaoEncontrada = false;
        let respostaEsperada = null;
        
        if (listaVerificacao) {
          for (const item of listaVerificacao) {
            if (perguntaLimpa.includes(item.pergunta) || item.pergunta.includes(perguntaLimpa)) {
              verificacaoEncontrada = true;
              respostaEsperada = item.respostaCorreta;
              
              // Verificar se a resposta está correta
              let respostaCorreta = false;
              
              if (correctOption.label.toLowerCase().includes(respostaEsperada.toLowerCase())) {
                respostaCorreta = true;
              } else if (item.alternativas) {
                // Verificar alternativas aceitáveis
                for (const alt of item.alternativas) {
                  if (correctOption.label.toLowerCase().includes(alt.toLowerCase())) {
                    respostaCorreta = true;
                    break;
                  }
                }
              }
              
              if (respostaCorreta) {
                console.log('✅ A resposta está CORRETA conforme o esperado');
                perguntasCorretas++;
                
                // Verificar se a explicação está adequada
                if (!question.explanation || question.explanation.length < 30) {
                  console.log('⚠️ Explicação ausente ou muito curta - atualizando...');
                  quiz.questions[i].explanation = item.explicacao;
                  quizModificado = true;
                }
              } else {
                console.log(`❌ ERRO: A resposta está INCORRETA. Esperado: "${respostaEsperada}"`);
                perguntasIncorretas++;
                
                // Procurar a opção correta
                const opcaoCorretaIndex = options.findIndex(opt => 
                  opt.label.toLowerCase().includes(respostaEsperada.toLowerCase())
                );
                
                if (opcaoCorretaIndex !== -1) {
                  console.log(`🔧 Corrigindo: marcando "${options[opcaoCorretaIndex].label}" como correta`);
                  
                  // Marcar a opção correta
                  for (let j = 0; j < options.length; j++) {
                    quiz.questions[i].options[j].isCorrect = (j === opcaoCorretaIndex);
                  }
                  
                  // Atualizar explicação
                  quiz.questions[i].explanation = item.explicacao;
                  
                  quizModificado = true;
                  perguntasCorrigidas++;
                } else {
                  console.log('❌ ERRO: Não foi possível encontrar a opção correta');
                }
              }
              
              break;
            }
          }
        }
        
        if (!verificacaoEncontrada) {
          console.log('ℹ️ Pergunta não encontrada na lista de verificação');
        }
      }
      
      // Salvar o quiz se foi modificado
      if (quizModificado) {
        await quiz.save();
        console.log(`✅ Quiz ${quiz.title} atualizado com correções`);
      }
    }
    
    console.log('\n📊 Resumo da análise:');
    console.log(`   Total de perguntas analisadas: ${perguntasAnalisadas}`);
    console.log(`   Perguntas corretas: ${perguntasCorretas}`);
    console.log(`   Perguntas incorretas encontradas: ${perguntasIncorretas}`);
    console.log(`   Perguntas corrigidas: ${perguntasCorrigidas}`);
    
  } catch (error) {
    console.error('❌ Erro ao analisar perguntas:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await analisarPerguntas();
    console.log('\n✨ Análise concluída!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();

























