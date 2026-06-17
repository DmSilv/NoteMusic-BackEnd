const mongoose = require('mongoose');
const Quiz = require('../../src/models/Quiz');
require('dotenv').config();

// =====================================================
// SCRIPT: CORRIGIR QUIZZES SEM RESPOSTA CORRETA
// =====================================================
// Este script encontra e corrige todos os quizzes onde
// NENHUMA opção está marcada como isCorrect: true

const MAPEAMENTO_RESPOSTAS_CORRETAS = {
  // PROPRIEDADES DO SOM
  "No contexto da harmonia": "Harmonia é a combinação simultânea de sons",
  "Considerando os conceitos básicos": "A altura do som é determinada pela frequência das ondas sonoras",
  "conceitos básicos de teoria musical": "A altura do som é determinada pela frequência das ondas sonoras",
  "Qual símbolo musical indica": "Sustenido (#)",
  "símbolo musical indica que": "Sustenido (#)",
  "Qual figura musical representa": "Semibreve",
  "figura musical representa a maior": "Semibreve",
  "Quando você vê um sinal": "Aumentar gradualmente a intensidade",
  "sinal de crescendo": "Aumentar gradualmente a intensidade",
  
  // ALTURA
  "altura do som": "A altura do som é determinada pela frequência das ondas sonoras",
  "som é \"grave\" ou \"agudo\"": "Altura",
  "dizemos que um som é": "Altura",
  "frequência e altura": "Quanto maior a frequência, mais agudo o som",
  
  // INTENSIDADE
  "intensidade do som": "A intensidade está relacionada à amplitude da onda sonora",
  "som está \"alto\" ou \"baixo\"": "Intensidade",
  "volume": "Intensidade",
  "qual símbolo indica": "p (piano)",
  "tocar suavemente": "p (piano)",
  "tocar com volume baixo": "p (piano)",
  "tocar forte": "f (forte)",
  
  // TIMBRE
  "timbre": "A qualidade que diferencia sons de mesma altura e intensidade",
  "diferencia instrumentos": "Timbre",
  "mesma nota em instrumentos": "Timbre",
  
  // DURAÇÃO
  "duração do som": "O tempo durante o qual o som permanece audível",
  "tempo que o som": "Duração",
  
  // FIGURAS MUSICAIS
  "SEMIBREVE": "4 tempos",
  "semibreve": "4 tempos",
  "MÍNIMA": "2 tempos",
  "mínima": "2 tempos",
  "SEMÍNIMA": "1 tempo",
  "semínima": "1 tempo",
  "COLCHEIA": "1/2 tempo (meio tempo)",
  "colcheia": "1/2 tempo (meio tempo)",
  "SEMICOLCHEIA": "1/4 de tempo",
  "semicolcheia": "1/4 de tempo",
  
  // PAUSAS
  "pausa": "Indica um momento de silêncio",
  "silêncio": "Pausa",
  
  // COMPASSOS
  "4/4": "4 tempos por compasso",
  "3/4": "3 tempos por compasso",
  "2/4": "2 tempos por compasso",
  "primeiro número": "O número de tempos por compasso",
  "segundo número": "A figura que vale um tempo",
  "BPM": "Batimentos Por Minuto",
  
  // COMPASSOS SIMPLES
  "compasso simples": "Cada tempo se divide naturalmente em duas partes iguais",
  "representa um compasso simples": "3/4",
  
  // COMPASSOS COMPOSTOS
  "compasso composto": "Cada tempo se divide naturalmente em três partes iguais",
  "representa um compasso composto": "6/8",
  
  // TONS E SEMITONS
  "tom na música": "A distância de dois semitons entre duas notas",
  "semitons compõem um tom": "Dois semitons",
  
  // INTERVALOS
  "intervalo": "A distância entre duas notas",
  "quinta justa": "A distância de 7 semitons",
  
  // ESCALAS
  "escala de Dó maior": "Dó, Ré, Mi, Fá, Sol, Lá, Si",
  "escala maior": "Tom, Tom, Semitom, Tom, Tom, Tom, Semitom",
  
  // ACORDES
  "acorde maior": "Tônica, terça maior e quinta justa",
  "acorde menor": "Tônica, terça menor e quinta justa",
  "tríade": "Maior, menor e diminuta",
  
  // FUNÇÕES HARMÔNICAS
  "função de tônica": "O acorde construído sobre o primeiro grau da escala",
  "função de dominante": "O acorde construído sobre o quinto grau da escala",
  "função de subdominante": "O acorde construído sobre o quarto grau da escala",
  
  // CADÊNCIAS
  "cadência perfeita": "Uma progressão do V para o I",
  "cadência plagal": "Uma progressão do IV para o I"
};

function encontrarOpcaoCorreta(questao) {
  const perguntaLower = questao.question.toLowerCase();
  
  // Procurar por palavras-chave na pergunta
  for (const [chave, respostaCorreta] of Object.entries(MAPEAMENTO_RESPOSTAS_CORRETAS)) {
    if (perguntaLower.includes(chave.toLowerCase())) {
      // Procurar a opção que contém a resposta correta
      const opcaoCorreta = questao.options.find(opt => 
        opt.text.includes(respostaCorreta) || 
        respostaCorreta.includes(opt.text)
      );
      
      if (opcaoCorreta) {
        return opcaoCorreta._id;
      }
    }
  }
  
  return null;
}

async function corrigirQuizzesSemResposta() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');
    
    const todosQuizzes = await Quiz.find({});
    console.log(`📊 Total de quizzes no banco: ${todosQuizzes.length}\n`);
    
    let quizzesSemResposta = [];
    let questoesCorrigidas = 0;
    let questoesNaoCorrigidas = 0;
    
    // Fase 1: Identificar quizzes problemáticos
    console.log('🔍 FASE 1: IDENTIFICANDO QUIZZES SEM RESPOSTA CORRETA');
    console.log('='.repeat(80));
    
    for (const quiz of todosQuizzes) {
      const questoesSemResposta = quiz.questions.filter(q => 
        !q.options.some(opt => opt.isCorrect === true)
      );
      
      if (questoesSemResposta.length > 0) {
        quizzesSemResposta.push({
          quiz,
          questoesSemResposta
        });
        
        console.log(`\n❌ Quiz: "${quiz.title}" (${quiz._id})`);
        console.log(`   📌 ${questoesSemResposta.length} questão(ões) sem resposta correta`);
        
        questoesSemResposta.forEach((q, idx) => {
          console.log(`\n   Questão ${idx + 1}: "${q.question.substring(0, 60)}..."`);
          console.log(`   Opções disponíveis:`);
          q.options.forEach((opt, i) => {
            console.log(`     ${i}. ${opt.text} ${opt.isCorrect ? '✅' : ''}`);
          });
        });
      }
    }
    
    if (quizzesSemResposta.length === 0) {
      console.log('\n✅ Todos os quizzes têm respostas corretas marcadas!\n');
      return;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`⚠️  TOTAL: ${quizzesSemResposta.length} quizzes precisam de correção\n`);
    
    // Fase 2: Corrigir automaticamente
    console.log('🔧 FASE 2: CORRIGINDO AUTOMATICAMENTE');
    console.log('='.repeat(80));
    
    for (const { quiz, questoesSemResposta } of quizzesSemResposta) {
      let modificado = false;
      
      for (const questao of questoesSemResposta) {
        const opcaoCorretaId = encontrarOpcaoCorreta(questao);
        
        if (opcaoCorretaId) {
          // Marcar a opção correta
          questao.options.forEach(opt => {
            opt.isCorrect = opt._id.toString() === opcaoCorretaId.toString();
          });
          
          console.log(`\n✅ Quiz: "${quiz.title}"`);
          console.log(`   Questão: "${questao.question.substring(0, 60)}..."`);
          console.log(`   ✓ Resposta correta marcada!`);
          
          modificado = true;
          questoesCorrigidas++;
        } else {
          console.log(`\n⚠️  Quiz: "${quiz.title}"`);
          console.log(`   Questão: "${questao.question.substring(0, 60)}..."`);
          console.log(`   ✗ Não foi possível determinar a resposta correta automaticamente`);
          questoesNaoCorrigidas++;
        }
      }
      
      if (modificado) {
        await quiz.save();
        console.log(`   💾 Quiz salvo!`);
      }
    }
    
    // Relatório Final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL');
    console.log('='.repeat(80));
    console.log(`✅ Questões corrigidas automaticamente: ${questoesCorrigidas}`);
    console.log(`⚠️  Questões que precisam correção manual: ${questoesNaoCorrigidas}`);
    
    if (questoesNaoCorrigidas > 0) {
      console.log('\n⚠️  ATENÇÃO: Algumas questões não puderam ser corrigidas automaticamente.');
      console.log('   Execute novamente o script de validação para ver os detalhes.');
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado do MongoDB');
  }
}

// Executar
corrigirQuizzesSemResposta();

