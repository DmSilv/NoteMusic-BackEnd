const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../src/models/Quiz');

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

// Base de conhecimento musical para validação e explicações
const CONHECIMENTO_MUSICAL = {
  // PROPRIEDADES DO SOM
  'altura': {
    keywords: ['altura', 'frequência', 'grave', 'agudo'],
    respostaCorreta: ['frequência', 'grave e agudo', 'vibração', 'Hz'],
    explicacao: 'A altura é a propriedade do som relacionada à frequência das vibrações. Sons graves têm baixa frequência e sons agudos têm alta frequência.'
  },
  'intensidade': {
    keywords: ['intensidade', 'volume', 'forte', 'fraco', 'piano', 'crescendo'],
    respostaCorreta: ['volume', 'forte e fraco', 'amplitude', 'decibéis'],
    explicacao: 'A intensidade é a propriedade que distingue sons fortes de fracos, relacionada à amplitude da onda sonora.'
  },
  'timbre': {
    keywords: ['timbre', 'qualidade', 'cor sonora', 'distinguir instrumentos'],
    respostaCorreta: ['qualidade', 'distinguir', 'cor sonora', 'características'],
    explicacao: 'O timbre é a qualidade sonora que permite distinguir diferentes fontes sonoras. É o que diferencia um piano de um violino tocando a mesma nota.'
  },
  'duração': {
    keywords: ['duração', 'tempo', 'curto', 'longo'],
    respostaCorreta: ['tempo', 'curto e longo', 'permanência'],
    explicacao: 'A duração é o tempo de permanência de um som, determinando se ele é curto ou longo.'
  },
  
  // ESCALAS
  'escala maior': {
    keywords: ['escala maior', 'tom', 'semitom', 'T-T-S-T-T-T-S'],
    respostaCorreta: ['T-T-S-T-T-T-S', '7 notas', 'diatônica'],
    explicacao: 'A escala maior segue o padrão T-T-S-T-T-T-S (Tom-Tom-Semitom-Tom-Tom-Tom-Semitom) e possui 7 notas diferentes.'
  },
  'escala dó maior': {
    keywords: ['dó maior', 'notas'],
    respostaCorreta: ['Dó, Ré, Mi, Fá, Sol, Lá, Si'],
    explicacao: 'A escala de Dó maior é formada pelas notas: Dó, Ré, Mi, Fá, Sol, Lá, Si (não possui acidentes).'
  },
  
  // INTERVALOS
  'terça maior': {
    keywords: ['dó e mi', 'intervalo', 'terça'],
    respostaCorreta: ['terça maior', '2 tons'],
    explicacao: 'O intervalo entre Dó e Mi é uma terça maior, correspondendo a 4 semitons ou 2 tons.'
  },
  'quinta justa': {
    keywords: ['quinta justa', 'quinta nota'],
    respostaCorreta: ['quinta nota da escala', '7 semitons', '3,5 tons'],
    explicacao: 'A quinta justa é o intervalo entre a tônica e a quinta nota da escala, correspondendo a 7 semitons.'
  },
  'oitava': {
    keywords: ['oitava', '12 semitons', 'mesma nota'],
    respostaCorreta: ['12 semitons', 'mesma nota em altura diferente'],
    explicacao: 'Uma oitava corresponde a 12 semitons e representa a distância entre uma nota e sua repetição em outra altura.'
  },
  
  // FIGURAS MUSICAIS
  'semibreve': {
    keywords: ['semibreve', 'duração', '4 tempos'],
    respostaCorreta: ['4 tempos', 'maior duração'],
    explicacao: 'A semibreve é a figura de maior duração no sistema tradicional, valendo 4 tempos em um compasso quaternário.'
  },
  'mínima': {
    keywords: ['mínima', '2 tempos'],
    respostaCorreta: ['2 tempos', 'metade da semibreve'],
    explicacao: 'A mínima vale 2 tempos, correspondendo à metade do valor de uma semibreve.'
  },
  'semínima': {
    keywords: ['semínima', '1 tempo'],
    respostaCorreta: ['1 tempo', 'quarto da semibreve'],
    explicacao: 'A semínima vale 1 tempo em compasso quaternário, sendo um quarto do valor da semibreve.'
  },
  'colcheia': {
    keywords: ['colcheia', 'metade', 'meio tempo'],
    respostaCorreta: ['meio tempo', 'metade da semínima', '0,5 tempo'],
    explicacao: 'A colcheia vale metade de uma semínima, ou seja, meio tempo em compasso quaternário.'
  },
  
  // SÍMBOLOS E DINÂMICA
  'crescendo': {
    keywords: ['crescendo', '<', 'aumentar'],
    respostaCorreta: ['aumentar gradualmente a intensidade', 'aumentar o volume', 'mais forte'],
    explicacao: 'O crescendo (<) é uma indicação de dinâmica que orienta o músico a aumentar gradualmente a intensidade do som.'
  },
  'diminuendo': {
    keywords: ['diminuendo', 'decrescendo', '>', 'diminuir'],
    respostaCorreta: ['diminuir gradualmente a intensidade', 'diminuir o volume', 'mais fraco'],
    explicacao: 'O diminuendo ou decrescendo (>) indica que o som deve diminuir gradualmente de intensidade.'
  },
  'forte': {
    keywords: ['forte', 'f', 'fortíssimo'],
    respostaCorreta: ['tocar com intensidade', 'som forte', 'alto'],
    explicacao: 'Forte (f) indica que o trecho deve ser executado com intensidade, ou seja, com volume alto.'
  },
  'piano': {
    keywords: ['piano', 'p', 'pianíssimo', 'suave'],
    respostaCorreta: ['tocar suavemente', 'som fraco', 'baixo'],
    explicacao: 'Piano (p) indica que o trecho deve ser executado suavemente, com pouca intensidade.'
  },
  
  // ACORDES
  'acorde': {
    keywords: ['acorde', 'três ou mais notas', 'simultaneamente'],
    respostaCorreta: ['três ou mais notas tocadas simultaneamente'],
    explicacao: 'Um acorde é formado por três ou mais notas tocadas ao mesmo tempo, criando harmonia.'
  },
  'acorde maior': {
    keywords: ['acorde maior', 'tônica', 'terça maior', 'quinta'],
    respostaCorreta: ['tônica, terça maior e quinta justa'],
    explicacao: 'Um acorde maior é formado pela tônica, terça maior e quinta justa. Exemplo: Dó maior = Dó, Mi, Sol.'
  },
  'acorde menor': {
    keywords: ['acorde menor', 'tônica', 'terça menor', 'quinta'],
    respostaCorreta: ['tônica, terça menor e quinta justa'],
    explicacao: 'Um acorde menor é formado pela tônica, terça menor e quinta justa. Exemplo: Dó menor = Dó, Mi♭, Sol.'
  },
  'tríade': {
    keywords: ['tríade', 'três notas'],
    respostaCorreta: ['acorde formado por três notas', 'tríade'],
    explicacao: 'Uma tríade é um acorde formado por três notas: fundamental, terça e quinta.'
  },
  
  // FUNÇÕES HARMÔNICAS
  'tônica': {
    keywords: ['tônica', 'primeiro grau', 'repouso'],
    respostaCorreta: ['primeiro grau', 'repouso', 'estabilidade'],
    explicacao: 'A tônica é o acorde construído sobre o primeiro grau da escala, representando repouso e estabilidade.'
  },
  'dominante': {
    keywords: ['dominante', 'quinto grau', 'tensão'],
    respostaCorreta: ['quinto grau', 'tensão', 'V grau'],
    explicacao: 'A dominante é o acorde do quinto grau, que cria tensão e tende a resolver na tônica.'
  },
  'subdominante': {
    keywords: ['subdominante', 'quarto grau'],
    respostaCorreta: ['quarto grau', 'IV grau'],
    explicacao: 'A subdominante é o acorde do quarto grau, que prepara a progressão para a dominante.'
  },
  
  // CADÊNCIAS
  'cadência': {
    keywords: ['cadência', 'sequência de acordes', 'conclusão'],
    respostaCorreta: ['sequência de acordes', 'conclui', 'frase musical'],
    explicacao: 'Uma cadência é uma sequência de acordes que conclui uma frase musical, dando sensação de finalização ou continuidade.'
  },
  'cadência perfeita': {
    keywords: ['cadência perfeita', 'V para I', 'V-I'],
    respostaCorreta: ['V para I', 'dominante para tônica'],
    explicacao: 'A cadência perfeita é a progressão do acorde de dominante (V) para o de tônica (I), dando forte sensação de conclusão.'
  },
  'cadência plagal': {
    keywords: ['cadência plagal', 'IV para I', 'IV-I', 'amém'],
    respostaCorreta: ['IV para I', 'subdominante para tônica'],
    explicacao: 'A cadência plagal é a progressão do acorde de subdominante (IV) para o de tônica (I), conhecida como "cadência de amém".'
  },
  
  // COMPASSOS
  'compasso': {
    keywords: ['compasso', 'fórmula', 'numerador', 'denominador'],
    respostaCorreta: ['divisão', 'tempos', 'pulsação'],
    explicacao: 'O compasso é a divisão da música em grupos regulares de tempos, indicado pela fórmula de compasso (como 4/4, 3/4, etc.).'
  },
  'pauta': {
    keywords: ['pauta', 'pentagrama', '5 linhas'],
    respostaCorreta: ['5 linhas', '4 espaços', 'pentagrama'],
    explicacao: 'A pauta ou pentagrama é formada por 5 linhas e 4 espaços onde são escritas as notas musicais.'
  }
};

// Função para validar se uma resposta está correta
const validarResposta = (pergunta, opcaoMarcadaComoCorreta) => {
  const perguntaLower = pergunta.toLowerCase();
  const opcaoLower = opcaoMarcadaComoCorreta.toLowerCase();
  
  // Buscar no conhecimento musical
  for (const [conceito, info] of Object.entries(CONHECIMENTO_MUSICAL)) {
    // Verificar se a pergunta é sobre este conceito
    const perguntaSobreConceito = info.keywords.some(kw => perguntaLower.includes(kw.toLowerCase()));
    
    if (perguntaSobreConceito) {
      // Verificar se a opção marcada contém as palavras-chave corretas
      const opcaoEstaCorreta = info.respostaCorreta.some(rc => 
        opcaoLower.includes(rc.toLowerCase())
      );
      
      return {
        valida: opcaoEstaCorreta,
        conceito: conceito,
        explicacaoSugerida: info.explicacao
      };
    }
  }
  
  // Se não encontrou no conhecimento, retornar como válida (não temos info)
  return {
    valida: null, // null = não conseguimos validar
    conceito: 'desconhecido',
    explicacaoSugerida: 'Revisar manualmente'
  };
};

// Função principal de validação
const validarTodosQuizzes = async () => {
  try {
    console.log('🔍 VALIDAÇÃO COMPLETA DE TODOS OS QUIZZES\n');
    console.log('=' .repeat(80) + '\n');
    
    const quizzes = await Quiz.find({});
    console.log(`📚 Total de quizzes: ${quizzes.length}\n`);
    
    let totalQuestoes = 0;
    let questoesComProblema = 0;
    let questoesCorrigidas = 0;
    let questoesSemExplicacao = 0;
    const problemas = [];
    
    for (const quiz of quizzes) {
      let quizModificado = false;
      
      for (let i = 0; i < quiz.questions.length; i++) {
        totalQuestoes++;
        const questao = quiz.questions[i];
        
        // Encontrar a opção marcada como correta
        const opcaoCorreta = questao.options.find(opt => opt.isCorrect);
        
        if (!opcaoCorreta) {
          console.log(`❌ ERRO CRÍTICO: Quiz "${quiz.title}" - Questão ${i+1} não tem resposta correta!`);
          console.log(`   "${questao.question}"\n`);
          problemas.push({
            quiz: quiz.title,
            questao: questao.question,
            problema: 'Sem resposta marcada como correta'
          });
          questoesComProblema++;
          continue;
        }
        
        // Validar a resposta
        const validacao = validarResposta(questao.question, opcaoCorreta.label);
        
        if (validacao.valida === false) {
          console.log(`🚨 RESPOSTA ERRADA DETECTADA:`);
          console.log(`   Quiz: "${quiz.title}"`);
          console.log(`   Questão: "${questao.question}"`);
          console.log(`   Resposta marcada: "${opcaoCorreta.label}"`);
          console.log(`   Conceito: ${validacao.conceito}\n`);
          
          // Tentar encontrar a opção correta
          let novaOpcaoCorreta = null;
          for (let j = 0; j < questao.options.length; j++) {
            const validacaoOpcao = validarResposta(questao.question, questao.options[j].label);
            if (validacaoOpcao.valida === true) {
              novaOpcaoCorreta = j;
              break;
            }
          }
          
          if (novaOpcaoCorreta !== null) {
            // Corrigir
            questao.options.forEach((opt, idx) => {
              quiz.questions[i].options[idx].isCorrect = (idx === novaOpcaoCorreta);
            });
            quiz.questions[i].explanation = validacao.explicacaoSugerida;
            quizModificado = true;
            questoesCorrigidas++;
            
            console.log(`   ✅ CORRIGIDO! Nova resposta: "${quiz.questions[i].options[novaOpcaoCorreta].label}"\n`);
          } else {
            console.log(`   ⚠️  Não foi possível corrigir automaticamente\n`);
            problemas.push({
              quiz: quiz.title,
              questao: questao.question,
              problema: 'Resposta incorreta - correção manual necessária'
            });
          }
          
          questoesComProblema++;
        }
        
        // Verificar explicação
        if (!questao.explanation || questao.explanation.trim() === '') {
          if (validacao.explicacaoSugerida && validacao.explicacaoSugerida !== 'Revisar manualmente') {
            quiz.questions[i].explanation = validacao.explicacaoSugerida;
            quizModificado = true;
          }
          questoesSemExplicacao++;
        }
      }
      
      // Salvar se modificado
      if (quizModificado) {
        await quiz.save();
        console.log(`💾 Quiz "${quiz.title}" salvo com correções\n`);
      }
    }
    
    // Relatório final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL DA VALIDAÇÃO');
    console.log('='.repeat(80));
    console.log(`\n✅ Total de questões analisadas: ${totalQuestoes}`);
    console.log(`🚨 Questões com problema: ${questoesComProblema}`);
    console.log(`🔧 Questões corrigidas automaticamente: ${questoesCorrigidas}`);
    console.log(`⚠️  Questões sem explicação: ${questoesSemExplicacao}`);
    
    if (problemas.length > 0) {
      console.log(`\n\n🔍 PROBLEMAS QUE PRECISAM DE REVISÃO MANUAL:\n`);
      problemas.forEach((p, idx) => {
        console.log(`${idx + 1}. Quiz: "${p.quiz}"`);
        console.log(`   Questão: "${p.questao}"`);
        console.log(`   Problema: ${p.problema}\n`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erro ao validar quizzes:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await validarTodosQuizzes();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();

