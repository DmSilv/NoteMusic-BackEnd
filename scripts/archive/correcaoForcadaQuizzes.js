const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/quiz.model');

// Conectar ao banco
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
};

// CORREÇÕES ESPECÍFICAS COM RESPOSTAS CERTAS
const CORRECOES = {
  // FIGURAS MUSICAIS
  'quantas colcheias cabem em uma semínima': {
    respostaCorreta: '2',
    explicacao: '2 colcheias cabem em 1 semínima! A colcheia vale meio tempo, então 0,5 + 0,5 = 1 tempo. ♪♪ = ♩'
  },
  'qual figura musical equivale a metade da duração de uma semibreve': {
    respostaCorreta: 'mínima',
    explicacao: 'A MÍNIMA vale metade da semibreve! Semibreve = 4 tempos, Mínima = 2 tempos. 𝅝 = 𝅗𝅥/2'
  },
  
  // PULSAÇÃO E TEMPO
  'o que é a pulsação musical': {
    respostaCorreta: 'batida regular',
    explicacao: 'A pulsação é a BATIDA REGULAR que sentimos na música, como as batidas do coração! É o "tic-tac" constante da música. 💓'
  },
  'o que significa bpm na música': {
    respostaCorreta: 'batidas por minuto',
    explicacao: 'BPM = Batidas Por Minuto! Indica a velocidade da música. BPM 60 = 1 batida por segundo, BPM 120 = 2 batidas por segundo. ⏱️'
  },
  
  // FÓRMULAS DE COMPASSO
  'na fórmula de compasso 4/4, o que significa o primeiro número': {
    respostaCorreta: '4 tempos',
    explicacao: 'O número de CIMA (4) indica quantos TEMPOS tem em cada compasso! Em 4/4 temos 4 tempos por compasso. 🎵🎵🎵🎵'
  },
  'na fórmula de compasso 3/4, o que significa o segundo número': {
    respostaCorreta: 'semínima',
    explicacao: 'O número de BAIXO (4) indica que cada tempo vale uma SEMÍNIMA! O 4 representa a semínima como unidade de tempo. ♩'
  },
  'como se chama a linha vertical que divide os compassos': {
    respostaCorreta: 'barra de compasso',
    explicacao: 'A BARRA DE COMPASSO (|) é a linha vertical que separa os compassos na partitura! Como se fossem "cercas" dividindo a música. |🎵|🎵|'
  },
  
  // COMPASSOS SIMPLES
  'qual das seguintes alternativas representa um compasso simples': {
    respostaCorreta: '2/4',
    explicacao: 'Compassos SIMPLES têm numerador 2, 3 ou 4! Exemplos: 2/4, 3/4, 4/4. O tempo é dividido em 2 partes (binário). ♩=♪♪'
  },
  'qual é a característica principal de um compasso simples': {
    respostaCorreta: 'divisão binária',
    explicacao: 'No compasso SIMPLES, cada tempo se divide em 2 partes IGUAIS! Uma semínima vira 2 colcheias. ♩ → ♪♪'
  },
  'em um compasso 2/4, qual figura ocupa um compasso inteiro': {
    respostaCorreta: 'mínima',
    explicacao: 'Em 2/4 temos 2 tempos, e a MÍNIMA vale 2 tempos! Então ela ocupa o compasso inteiro. 𝅗𝅥 = 2 tempos'
  },
  
  // COMPASSOS COMPOSTOS
  'qual das seguintes alternativas representa um compasso composto': {
    respostaCorreta: '6/8',
    explicacao: 'Compassos COMPOSTOS têm numerador 6, 9 ou 12! Exemplos: 6/8, 9/8, 12/8. O tempo é dividido em 3 partes (ternário). ♩.=♪♪♪'
  },
  'qual é a característica principal de um compasso composto': {
    respostaCorreta: 'divisão ternária',
    explicacao: 'No compasso COMPOSTO, cada tempo se divide em 3 partes IGUAIS! Uma semínima pontuada vira 3 colcheias. ♩. → ♪♪♪'
  },
  
  // TONS E SEMITONS
  'o que é um tom na música': {
    respostaCorreta: '2 semitons',
    explicacao: 'Um TOM é a distância de 2 SEMITONS (2 casas no piano)! Exemplo: de Dó para Ré é 1 tom (passa por Dó#). 🎹'
  },
  'entre quais notas da escala diatônica existe naturalmente um semitom': {
    respostaCorreta: 'mi e fá',
    explicacao: 'Entre MI-FÁ e SI-DÓ existem SEMITONS naturais (não tem tecla preta no meio no piano)! Todas as outras têm 1 tom. 🎹'
  },
  'quantos semitons compõem um tom': {
    respostaCorreta: '2',
    explicacao: '1 TOM = 2 SEMITONS! O semitom é a menor distância entre duas notas, e o tom é o dobro disso. 🎵'
  },
  
  // INTERVALOS
  'o que é um intervalo de quinta justa': {
    respostaCorreta: 'quinta nota',
    explicacao: 'A QUINTA JUSTA é a distância da 1ª até a 5ª nota da escala! Exemplo: de Dó até Sol (Dó-Ré-Mi-Fá-Sol). Vale 7 semitons. 🎵'
  },
  'quantos semitons existem em um intervalo de oitava justa': {
    respostaCorreta: '12',
    explicacao: 'Uma OITAVA tem 12 SEMITONS! É a distância de uma nota até a mesma nota mais aguda (ex: Dó grave → Dó agudo). 🎹'
  },
  'qual é o intervalo entre dó e mi': {
    respostaCorreta: 'terça maior',
    explicacao: 'Dó até Mi é uma TERÇA MAIOR! São 3 notas (Dó-Ré-Mi) e 4 semitons de distância. É o intervalo que forma acordes maiores! 🎵'
  },
  
  // ESCALAS
  'quantas notas tem uma escala maior diatônica': {
    respostaCorreta: '7',
    explicacao: 'A escala maior tem 7 NOTAS diferentes! Exemplo: Dó-Ré-Mi-Fá-Sol-Lá-Si (depois volta pro Dó). 🎼'
  },
  'qual é o padrão de tons (t) e semitons (s) de uma escala maior': {
    respostaCorreta: 't-t-s-t-t-t-s',
    explicacao: 'Escala MAIOR = T-T-S-T-T-T-S! Memorize: "Tom Tom Semi, Tom Tom Tom Semi". Exemplo: Dó-Ré-Mi-Fá-Sol-Lá-Si. 🎵'
  },
  'quais são as notas da escala de dó maior': {
    respostaCorreta: 'dó, ré, mi, fá, sol, lá, si',
    explicacao: 'Dó maior: Dó-Ré-Mi-Fá-Sol-Lá-Si! É a escala SEM acidentes (sem # ou ♭). A mais básica! 🎹'
  },
  'qual é a relativa menor da tonalidade de dó maior': {
    respostaCorreta: 'lá menor',
    explicacao: 'A relativa menor de Dó maior é LÁ MENOR! Tem as mesmas notas, mas começa no Lá: Lá-Si-Dó-Ré-Mi-Fá-Sol. 🎵'
  },
  'qual é a característica principal de uma escala menor natural': {
    respostaCorreta: 'terceiro grau',
    explicacao: 'A escala MENOR tem o 3º GRAU REBAIXADO (um semitom abaixo)! É o que dá aquele som mais "triste". Compare: Dó-Mi (maior) vs Dó-Mi♭ (menor). 🎼'
  },
  'quais são os tipos de escala menor': {
    respostaCorreta: 'menor natural, menor harmônica e menor melódica',
    explicacao: 'Existem 3 tipos de escala MENOR: Natural (escala pura), Harmônica (7º grau elevado), Melódica (6º e 7º elevados na subida). 🎵'
  },
  
  // ACORDES
  'o que é um acorde': {
    respostaCorreta: 'três ou mais notas',
    explicacao: 'ACORDE = 3 ou mais notas tocadas AO MESMO TEMPO! Cria harmonia. Exemplo: Dó+Mi+Sol = acorde de Dó maior. 🎸'
  },
  'qual é a estrutura básica de um acorde maior': {
    respostaCorreta: 'tônica, terça maior e quinta justa',
    explicacao: 'Acorde MAIOR = Fundamental + Terça Maior + Quinta Justa! Exemplo: Dó maior = Dó (1ª) + Mi (3ª maior) + Sol (5ª). Som alegre! 😊🎵'
  },
  'qual é a estrutura básica de um acorde menor': {
    respostaCorreta: 'tônica, terça menor e quinta justa',
    explicacao: 'Acorde MENOR = Fundamental + Terça Menor + Quinta Justa! Exemplo: Dó menor = Dó + Mi♭ + Sol. Som mais triste. 😔🎵'
  },
  
  // TRÍADES
  'o que é uma tríade': {
    respostaCorreta: 'acorde formado por três notas',
    explicacao: 'TRÍADE = acorde de 3 NOTAS! É a forma mais básica de acorde. Exemplo: Dó-Mi-Sol. ▲'
  },
  'quais são os tipos básicos de tríades': {
    respostaCorreta: 'maior, menor, aumentada e diminuta',
    explicacao: 'Existem 4 tipos de TRÍADES: Maior (alegre), Menor (triste), Aumentada (tensa), Diminuta (muito tensa). 🎵'
  },
  'como é formada uma tríade de dó maior': {
    respostaCorreta: 'dó, mi, sol',
    explicacao: 'Tríade de Dó MAIOR = Dó + Mi + Sol! É a fundamental (1ª), terça maior (3ª) e quinta justa (5ª). 🎹'
  },
  
  // FUNÇÕES HARMÔNICAS
  'qual acorde tem função de tônica em uma tonalidade maior': {
    respostaCorreta: 'primeiro grau',
    explicacao: 'TÔNICA = acorde do I GRAU (primeiro)! É o acorde de repouso, o "lar" da música. Em Dó maior, a tônica é o acorde de Dó. 🏠'
  },
  'qual acorde tem função de dominante em uma tonalidade maior': {
    respostaCorreta: 'quinto grau',
    explicacao: 'DOMINANTE = acorde do V GRAU (quinto)! Cria tensão e quer voltar pra tônica. Em Dó maior, a dominante é Sol. ⚡'
  },
  'qual acorde tem função de subdominante em uma tonalidade maior': {
    respostaCorreta: 'quarto grau',
    explicacao: 'SUBDOMINANTE = acorde do IV GRAU (quarto)! Prepara a dominante. Em Dó maior, a subdominante é Fá. 🎵'
  },
  
  // CADÊNCIAS
  'o que é uma cadência musical': {
    respostaCorreta: 'sequência de acordes',
    explicacao: 'CADÊNCIA = sequência de acordes que FINALIZA uma frase musical! É como a "pontuação" da música. 🎵.'
  },
  'o que é uma cadência perfeita': {
    respostaCorreta: 'v para i',
    explicacao: 'Cadência PERFEITA = V → I (dominante para tônica)! É a finalização mais forte. Exemplo: Sol → Dó. Som de "fim"! 🎯'
  },
  'o que é uma cadência plagal': {
    respostaCorreta: 'iv para i',
    explicacao: 'Cadência PLAGAL = IV → I (subdominante para tônica)! Conhecida como cadência "Amém" usada em igrejas. Exemplo: Fá → Dó. 🙏'
  }
};

// Função para normalizar texto (remover acentos, pontuação, etc)
const normalizarTexto = (texto) => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .trim();
};

// Função para verificar se uma opção contém a resposta correta
const opcaoContemResposta = (opcao, respostaCorreta) => {
  const opcaoNorm = normalizarTexto(opcao);
  const respostaNorm = normalizarTexto(respostaCorreta);
  
  // Verificar se contém a resposta ou palavras-chave
  if (opcaoNorm.includes(respostaNorm)) return true;
  
  // Verificar variações
  const palavrasResposta = respostaNorm.split(' ');
  const palavrasOpcao = opcaoNorm.split(' ');
  
  // Se todas as palavras da resposta estão na opção
  return palavrasResposta.every(palavra => 
    palavrasOpcao.some(pOpcao => pOpcao.includes(palavra) || palavra.includes(pOpcao))
  );
};

// Função principal de correção
const corrigirTodosQuizzes = async () => {
  try {
    console.log('🔧 CORREÇÃO FORÇADA DE TODOS OS QUIZZES');
    console.log('Corrigindo automaticamente com base em teoria musical\n');
    console.log('=' .repeat(80) + '\n');
    
    const quizzes = await Quiz.find({});
    let totalCorrigido = 0;
    let totalNaoEncontrado = 0;
    const naoCorrigidos = [];
    
    for (const quiz of quizzes) {
      let quizModificado = false;
      
      for (let i = 0; i < quiz.questions.length; i++) {
        const questao = quiz.questions[i];
        const perguntaNorm = normalizarTexto(questao.question);
        
        // Procurar correção correspondente
        let correcaoEncontrada = null;
        for (const [chavePergunta, dadosCorrecao] of Object.entries(CORRECOES)) {
          if (perguntaNorm.includes(normalizarTexto(chavePergunta))) {
            correcaoEncontrada = dadosCorrecao;
            break;
          }
        }
        
        if (correcaoEncontrada) {
          // Encontrar a opção que contém a resposta correta
          let indiceCorreto = -1;
          
          for (let j = 0; j < questao.options.length; j++) {
            if (opcaoContemResposta(questao.options[j].label, correcaoEncontrada.respostaCorreta)) {
              indiceCorreto = j;
              break;
            }
          }
          
          if (indiceCorreto !== -1) {
            // Verificar se já está correta
            const jaCorreto = questao.options[indiceCorreto].isCorrect;
            
            if (!jaCorreto) {
              console.log(`\n✅ Quiz: "${quiz.title}"`);
              console.log(`   Questão: "${questao.question}"`);
              console.log(`   Resposta correta: "${questao.options[indiceCorreto].label}"\n`);
              
              // Marcar todas como incorretas
              questao.options.forEach((opt, idx) => {
                quiz.questions[i].options[idx].isCorrect = false;
              });
              
              // Marcar a correta
              quiz.questions[i].options[indiceCorreto].isCorrect = true;
              quiz.questions[i].explanation = correcaoEncontrada.explicacao;
              
              quizModificado = true;
              totalCorrigido++;
            }
          } else {
            console.log(`\n⚠️  Não encontrei opção correta para: "${questao.question}"`);
            console.log(`   Opções disponíveis:`);
            questao.options.forEach((opt, idx) => {
              console.log(`   ${idx}. ${opt.label}`);
            });
            totalNaoEncontrado++;
            naoCorrigidos.push({
              quiz: quiz.title,
              questao: questao.question
            });
          }
        }
      }
      
      // Salvar se modificado
      if (quizModificado) {
        await quiz.save();
        console.log(`   💾 Quiz salvo!`);
      }
    }
    
    // Relatório final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL DA CORREÇÃO');
    console.log('='.repeat(80));
    console.log(`\n✅ Questões corrigidas: ${totalCorrigido}`);
    console.log(`⚠️  Questões não encontradas/corrigidas: ${totalNaoEncontrado}`);
    
    if (naoCorrigidos.length > 0) {
      console.log(`\n\n🔍 QUESTÕES QUE PRECISAM DE REVISÃO MANUAL:\n`);
      naoCorrigidos.forEach((item, idx) => {
        console.log(`${idx + 1}. Quiz: "${item.quiz}"`);
        console.log(`   Questão: "${item.questao}"\n`);
      });
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir quizzes:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await corrigirTodosQuizzes();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();

