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

// Corrigir perguntas específicas do quiz de Propriedades do Som
const corrigirPerguntasPropriedadesSom = async () => {
  try {
    console.log('🔍 Buscando quiz de Propriedades do Som...');
    
    // Buscar o quiz de Propriedades do Som
    const quiz = await Quiz.findOne({ 
      title: { $regex: /propriedades do som/i }
    });
    
    if (!quiz) {
      console.log('❌ Quiz de Propriedades do Som não encontrado');
      return;
    }
    
    console.log(`✅ Quiz encontrado: ${quiz.title}`);
    console.log(`📊 Total de perguntas: ${quiz.questions.length}`);
    
    let quizModificado = false;
    
    // Correções específicas para cada pergunta
    const correcoes = [
      {
        perguntaContains: "propriedade do som determina se uma nota é grave ou aguda",
        respostaCorreta: "Altura",
        explicacao: "A altura (pitch) é a propriedade acústica relacionada à frequência das ondas sonoras. Quanto maior a frequência, mais agudo é o som; quanto menor, mais grave. É medida em Hertz (Hz). Por exemplo, a nota Lá 440Hz é o padrão de afinação para orquestras."
      },
      {
        perguntaContains: "o que diferencia o som de um violino e um piano",
        respostaCorreta: "Timbre",
        explicacao: "O timbre é a qualidade sonora que permite distinguir sons da mesma altura e intensidade produzidos por fontes diferentes. É determinado pelos harmônicos (frequências secundárias) que acompanham a frequência fundamental. Cada instrumento possui um envelope sonoro único com ataque, sustentação e decaimento característicos."
      },
      {
        perguntaContains: "o que significa o símbolo de crescendo",
        respostaCorreta: "Aumentar gradualmente a intensidade",
        explicacao: "O crescendo (<) é uma indicação de dinâmica que orienta o músico a aumentar gradualmente a intensidade do som durante o trecho marcado. Seu oposto é o diminuendo ou decrescendo (>), que indica redução gradual da intensidade. Estas indicações são essenciais para a expressividade musical, permitindo nuances na interpretação."
      }
    ];
    
    // Para cada pergunta do quiz
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      
      console.log(`\n📝 Analisando Questão ${i+1}: "${question.question}"`);
      
      // Verificar se esta pergunta precisa de correção
      for (const correcao of correcoes) {
        if (question.question.toLowerCase().includes(correcao.perguntaContains.toLowerCase())) {
          console.log(`🔍 Pergunta encontrada para correção: ${correcao.perguntaContains}`);
          
          // Verificar as opções
          const options = question.options;
          const correctOptionIndex = options.findIndex(opt => opt.isCorrect);
          
          if (correctOptionIndex === -1) {
            console.log('❌ ERRO: Nenhuma opção marcada como correta');
            continue;
          }
          
          const correctOption = options[correctOptionIndex];
          console.log(`✓ Opção atualmente marcada como correta: "${correctOption.label}"`);
          
          // Verificar se a resposta atual está correta
          if (correctOption.label.toLowerCase().includes(correcao.respostaCorreta.toLowerCase())) {
            console.log('✅ A resposta já está correta');
            
            // Atualizar explicação se necessário
            if (!question.explanation || question.explanation.length < 30) {
              quiz.questions[i].explanation = correcao.explicacao;
              console.log('✅ Explicação atualizada');
              quizModificado = true;
            }
          } else {
            // Procurar a opção correta
            const opcaoCorretaIndex = options.findIndex(opt => 
              opt.label.toLowerCase().includes(correcao.respostaCorreta.toLowerCase())
            );
            
            if (opcaoCorretaIndex !== -1) {
              console.log(`🔧 Corrigindo: marcando "${options[opcaoCorretaIndex].label}" como correta`);
              
              // Marcar a opção correta
              for (let j = 0; j < options.length; j++) {
                quiz.questions[i].options[j].isCorrect = (j === opcaoCorretaIndex);
              }
              
              // Atualizar explicação
              quiz.questions[i].explanation = correcao.explicacao;
              
              quizModificado = true;
              console.log('✅ Pergunta corrigida');
            } else {
              console.log(`❌ ERRO: Não foi possível encontrar opção com "${correcao.respostaCorreta}"`);
              
              // Mostrar todas as opções disponíveis
              console.log('📋 Opções disponíveis:');
              options.forEach((opt, idx) => {
                console.log(`   ${idx+1}. ${opt.label}`);
              });
            }
          }
          
          break;
        }
      }
    }
    
    // Salvar o quiz se foi modificado
    if (quizModificado) {
      await quiz.save();
      console.log(`\n✅ Quiz ${quiz.title} atualizado com correções`);
    } else {
      console.log('\nℹ️ Nenhuma modificação necessária no quiz');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir perguntas:', error);
  }
};

// Corrigir perguntas específicas do quiz de Notação Musical
const corrigirPerguntasNotacaoMusical = async () => {
  try {
    console.log('\n🔍 Buscando quiz de Notação Musical...');
    
    // Buscar o quiz de Notação Musical
    const quiz = await Quiz.findOne({ 
      title: { $regex: /notação|notacao/i }
    });
    
    if (!quiz) {
      console.log('❌ Quiz de Notação Musical não encontrado');
      return;
    }
    
    console.log(`✅ Quiz encontrado: ${quiz.title}`);
    console.log(`📊 Total de perguntas: ${quiz.questions.length}`);
    
    let quizModificado = false;
    
    // Correções específicas para cada pergunta
    const correcoes = [
      {
        perguntaContains: "quantas linhas possui um pentagrama",
        respostaCorreta: "5 linhas",
        explicacao: "O pentagrama (staff) padrão consiste em exatamente 5 linhas horizontais equidistantes e 4 espaços entre elas. É neste sistema que as notas musicais são escritas, tanto nas linhas quanto nos espaços. Quando necessário, podem ser adicionadas linhas suplementares acima ou abaixo do pentagrama para acomodar notas mais agudas ou graves."
      },
      {
        perguntaContains: "quantos tempos vale uma mínima",
        respostaCorreta: "2 tempos",
        explicacao: "A mínima (half note) vale 2 tempos em um compasso simples. Representa metade da duração de uma semibreve (4 tempos) e o dobro de uma semínima (1 tempo). É representada por uma nota com cabeça branca e haste. Em compassos compostos, como 6/8, seu valor relativo se mantém, mas a unidade de tempo muda."
      },
      {
        perguntaContains: "o que indica a fração 4/4",
        respostaCorreta: "A fórmula de compasso",
        explicacao: "A fração 4/4 indica a fórmula de compasso (time signature). O numerador (4) representa o número de unidades de tempo por compasso, e o denominador (4) indica que a semínima é a unidade de tempo. Também conhecido como compasso quaternário simples ou 'common time', pode ser representado pelo símbolo C. É o compasso mais utilizado na música ocidental."
      }
    ];
    
    // Para cada pergunta do quiz
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      
      console.log(`\n📝 Analisando Questão ${i+1}: "${question.question}"`);
      
      // Verificar se esta pergunta precisa de correção
      for (const correcao of correcoes) {
        if (question.question.toLowerCase().includes(correcao.perguntaContains.toLowerCase())) {
          console.log(`🔍 Pergunta encontrada para correção: ${correcao.perguntaContains}`);
          
          // Verificar as opções
          const options = question.options;
          const correctOptionIndex = options.findIndex(opt => opt.isCorrect);
          
          if (correctOptionIndex === -1) {
            console.log('❌ ERRO: Nenhuma opção marcada como correta');
            continue;
          }
          
          const correctOption = options[correctOptionIndex];
          console.log(`✓ Opção atualmente marcada como correta: "${correctOption.label}"`);
          
          // Verificar se a resposta atual está correta
          if (correctOption.label.toLowerCase().includes(correcao.respostaCorreta.toLowerCase())) {
            console.log('✅ A resposta já está correta');
            
            // Atualizar explicação se necessário
            if (!question.explanation || question.explanation.length < 30) {
              quiz.questions[i].explanation = correcao.explicacao;
              console.log('✅ Explicação atualizada');
              quizModificado = true;
            }
          } else {
            // Procurar a opção correta
            const opcaoCorretaIndex = options.findIndex(opt => 
              opt.label.toLowerCase().includes(correcao.respostaCorreta.toLowerCase())
            );
            
            if (opcaoCorretaIndex !== -1) {
              console.log(`🔧 Corrigindo: marcando "${options[opcaoCorretaIndex].label}" como correta`);
              
              // Marcar a opção correta
              for (let j = 0; j < options.length; j++) {
                quiz.questions[i].options[j].isCorrect = (j === opcaoCorretaIndex);
              }
              
              // Atualizar explicação
              quiz.questions[i].explanation = correcao.explicacao;
              
              quizModificado = true;
              console.log('✅ Pergunta corrigida');
            } else {
              console.log(`❌ ERRO: Não foi possível encontrar opção com "${correcao.respostaCorreta}"`);
              
              // Mostrar todas as opções disponíveis
              console.log('📋 Opções disponíveis:');
              options.forEach((opt, idx) => {
                console.log(`   ${idx+1}. ${opt.label}`);
              });
            }
          }
          
          break;
        }
      }
    }
    
    // Salvar o quiz se foi modificado
    if (quizModificado) {
      await quiz.save();
      console.log(`\n✅ Quiz ${quiz.title} atualizado com correções`);
    } else {
      console.log('\nℹ️ Nenhuma modificação necessária no quiz');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir perguntas:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await corrigirPerguntasPropriedadesSom();
    await corrigirPerguntasNotacaoMusical();
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























