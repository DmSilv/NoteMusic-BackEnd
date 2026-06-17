const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/Quiz');

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

// Perguntas melhoradas (lúdicas e claras)
const PERGUNTAS_MELHORADAS = {
  // REMOVER SÍMBOLOS DAS PERGUNTAS
  'crescendo': {
    antigas: [
      'De acordo com os princípios da música, o que significa o símbolo de crescendo (<) na partitura?',
      'O que significa o símbolo de crescendo (<) na partitura?',
      'o que significa o símbolo de crescendo (<)'
    ],
    nova: '🎵 Quando você vê um sinal de "crescendo" na partitura, o que o músico deve fazer?',
    opcoes: [
      { label: 'Diminuir gradualmente o volume', isCorrect: false },
      { label: 'Aumentar gradualmente o volume', isCorrect: true },
      { label: 'Tocar mais agudo', isCorrect: false },
      { label: 'Tocar mais devagar', isCorrect: false }
    ],
    explicacao: 'Crescendo (símbolo <) significa aumentar gradualmente o VOLUME (intensidade) da música. É como aumentar o volume da TV aos poucos! 📢'
  },
  
  // CORRIGIR PIANO (P) - NÃO É FORTE (F)
  'piano': {
    antigas: [
      'Qual símbolo indica que devemos tocar suavemente?',
      'símbolo musical indica que devemos tocar suavemente',
      'tocar suavemente'
    ],
    nova: '🎹 Na partitura, qual letra indica que devemos tocar BAIXINHO?',
    opcoes: [
      { label: 'f (forte)', isCorrect: false },
      { label: 'p (piano)', isCorrect: true },
      { label: 'm (mezzo)', isCorrect: false },
      { label: 'c (crescendo)', isCorrect: false }
    ],
    explicacao: 'A letra "p" significa "piano" em italiano, que quer dizer SUAVE/BAIXINHO. Já "f" significa "forte" (alto). 🔉'
  },
  
  // MELHORAR ALTURA
  'altura': {
    antigas: [
      'O que é a altura do som?',
      'Qual propriedade do som está relacionada à frequência',
      'altura do som'
    ],
    nova: '🎼 Quando dizemos que um som é "grave" ou "agudo", estamos falando sobre qual propriedade?',
    opcoes: [
      { label: 'Intensidade', isCorrect: false },
      { label: 'Altura', isCorrect: true },
      { label: 'Timbre', isCorrect: false },
      { label: 'Duração', isCorrect: false }
    ],
    explicacao: 'ALTURA é a propriedade que torna o som grave (baixo, como voz de homem) ou agudo (alto, como voz de criança). Sons graves têm frequência baixa e sons agudos têm frequência alta. 🎵'
  },
  
  // MELHORAR INTENSIDADE
  'intensidade': {
    antigas: [
      'O que é a intensidade do som?',
      'Qual propriedade distingue sons fortes de fracos',
      'intensidade do som'
    ],
    nova: '🔊 Quando dizemos que um som está "alto" ou "baixo" (volume), estamos falando sobre qual propriedade?',
    opcoes: [
      { label: 'Altura', isCorrect: false },
      { label: 'Intensidade', isCorrect: true },
      { label: 'Timbre', isCorrect: false },
      { label: 'Duração', isCorrect: false }
    ],
    explicacao: 'INTENSIDADE é o VOLUME do som. Som forte (alto) tem muita intensidade, som fraco (baixo) tem pouca intensidade. É como o volume do rádio! 📻'
  },
  
  // MELHORAR TIMBRE
  'timbre': {
    antigas: [
      'O que é o timbre do som?',
      'Qual propriedade permite distinguir diferentes instrumentos',
      'timbre do som',
      'qualidade sonora'
    ],
    nova: '🎸 Como conseguimos diferenciar o som de um violão do som de um piano, mesmo tocando a mesma nota?',
    opcoes: [
      { label: 'Pela altura do som', isCorrect: false },
      { label: 'Pelo timbre (qualidade sonora)', isCorrect: true },
      { label: 'Pela intensidade do som', isCorrect: false },
      { label: 'Pela duração do som', isCorrect: false }
    ],
    explicacao: 'TIMBRE é a "cor do som", a característica que faz cada instrumento ter seu som único! É por isso que você reconhece a voz da sua mãe ao telefone. 🎭'
  },
  
  // MELHORAR DURAÇÃO
  'duração': {
    antigas: [
      'O que é a duração do som?',
      'duração do som'
    ],
    nova: '⏱️ Quando falamos se um som é "curto" ou "longo", estamos falando sobre qual propriedade?',
    opcoes: [
      { label: 'Altura', isCorrect: false },
      { label: 'Intensidade', isCorrect: false },
      { label: 'Timbre', isCorrect: false },
      { label: 'Duração', isCorrect: true }
    ],
    explicacao: 'DURAÇÃO é o tempo que o som permanece. Uma nota pode durar muito tempo (longa) ou pouco tempo (curta). ⏰'
  },
  
  // MELHORAR SEMIBREVE
  'semibreve': {
    antigas: [
      'Qual é a duração de uma semibreve?',
      'semibreve'
    ],
    nova: '🎵 A SEMIBREVE é a nota mais longa! Quanto tempo ela dura em um compasso 4/4?',
    opcoes: [
      { label: '1 tempo', isCorrect: false },
      { label: '2 tempos', isCorrect: false },
      { label: '4 tempos (o compasso inteiro!)', isCorrect: true },
      { label: '8 tempos', isCorrect: false }
    ],
    explicacao: 'A semibreve (○) dura 4 tempos! É a nota mais longa e ocupa o compasso inteiro. Imagine contar 1-2-3-4 segurando uma nota só! 🎶'
  },
  
  // MELHORAR COLCHEIA
  'colcheia': {
    antigas: [
      'Qual a figura musical que vale metade de uma semínima?',
      'colcheia'
    ],
    nova: '♪ Se uma SEMÍNIMA vale 1 tempo, quanto vale uma COLCHEIA?',
    opcoes: [
      { label: '2 tempos', isCorrect: false },
      { label: '1 tempo', isCorrect: false },
      { label: 'Meio tempo (0,5)', isCorrect: true },
      { label: 'Um quarto de tempo', isCorrect: false }
    ],
    explicacao: 'A colcheia (♪) vale METADE de uma semínima! Se a semínima é 1 tempo, a colcheia é meio tempo. Duas colcheias = uma semínima! ♪♪'
  }
};

// Função para melhorar as perguntas
const melhorarPerguntas = async () => {
  try {
    console.log('🎨 MELHORANDO PERGUNTAS DO QUIZ\n');
    console.log('Tornando as perguntas mais lúdicas e claras para os alunos!\n');
    console.log('=' .repeat(80) + '\n');
    
    const quizzes = await Quiz.find({});
    let totalMelhorado = 0;
    let totalCorrigido = 0;
    
    for (const quiz of quizzes) {
      let quizModificado = false;
      
      for (let i = 0; i < quiz.questions.length; i++) {
        const questao = quiz.questions[i];
        const perguntaOriginal = questao.question;
        const perguntaLower = perguntaOriginal.toLowerCase();
        
        // Verificar cada tipo de melhoria
        for (const [conceito, melhoria] of Object.entries(PERGUNTAS_MELHORADAS)) {
          // Verificar se a pergunta atual é sobre este conceito
          const corresponde = melhoria.antigas.some(antiga => 
            perguntaLower.includes(antiga.toLowerCase())
          );
          
          if (corresponde) {
            console.log(`\n📝 Quiz: "${quiz.title}"`);
            console.log(`   Questão ${i + 1} sobre: ${conceito.toUpperCase()}`);
            console.log(`\n   ANTES: "${perguntaOriginal}"`);
            console.log(`   DEPOIS: "${melhoria.nova}"\n`);
            
            // Atualizar a pergunta
            quiz.questions[i].question = melhoria.nova;
            quiz.questions[i].explanation = melhoria.explicacao;
            
            // Atualizar as opções
            quiz.questions[i].options = melhoria.opcoes.map((opt, idx) => ({
              id: `opt_${i}_${idx}`,
              label: opt.label,
              isCorrect: opt.isCorrect,
              explanation: opt.isCorrect ? melhoria.explicacao : ''
            }));
            
            quizModificado = true;
            totalMelhorado++;
            break;
          }
        }
        
        // REMOVER SÍMBOLOS PROBLEMÁTICOS DAS PERGUNTAS
        let perguntaAtual = quiz.questions[i].question;
        let simbolosRemovidos = false;
        
        // Remover < e > das perguntas (não das opções!)
        if (perguntaAtual.includes('<') || perguntaAtual.includes('>')) {
          perguntaAtual = perguntaAtual.replace(/\(<\)/g, '');
          perguntaAtual = perguntaAtual.replace(/\(>\)/g, '');
          perguntaAtual = perguntaAtual.replace(/<|>/g, '');
          perguntaAtual = perguntaAtual.trim();
          simbolosRemovidos = true;
        }
        
        // Remover emojis confusos
        if (perguntaAtual.includes('🥁') || perguntaAtual.includes('🎵') && !perguntaAtual.startsWith('🎵')) {
          perguntaAtual = perguntaAtual.replace('🥁', '🎵');
          simbolosRemovidos = true;
        }
        
        if (simbolosRemovidos) {
          console.log(`\n🔧 Removendo símbolos confusos:`);
          console.log(`   De: "${quiz.questions[i].question}"`);
          console.log(`   Para: "${perguntaAtual}"`);
          
          quiz.questions[i].question = perguntaAtual;
          quizModificado = true;
          totalCorrigido++;
        }
        
        // ADICIONAR EXPLICAÇÕES SE FALTAREM
        if (!quiz.questions[i].explanation || quiz.questions[i].explanation.trim() === '') {
          // Tentar adicionar explicação básica baseada no conceito
          const pergunta = quiz.questions[i].question.toLowerCase();
          
          if (pergunta.includes('semibreve')) {
            quiz.questions[i].explanation = 'A semibreve é a nota de maior duração, valendo 4 tempos.';
            quizModificado = true;
          } else if (pergunta.includes('mínima')) {
            quiz.questions[i].explanation = 'A mínima vale 2 tempos, metade de uma semibreve.';
            quizModificado = true;
          } else if (pergunta.includes('semínima')) {
            quiz.questions[i].explanation = 'A semínima vale 1 tempo em compassos quaternários.';
            quizModificado = true;
          } else if (pergunta.includes('colcheia')) {
            quiz.questions[i].explanation = 'A colcheia vale meio tempo, metade de uma semínima.';
            quizModificado = true;
          } else if (pergunta.includes('pauta') || pergunta.includes('pentagrama')) {
            quiz.questions[i].explanation = 'A pauta musical possui 5 linhas e 4 espaços onde escrevemos as notas.';
            quizModificado = true;
          } else if (pergunta.includes('dó maior')) {
            quiz.questions[i].explanation = 'A escala de Dó maior: Dó, Ré, Mi, Fá, Sol, Lá, Si (sem acidentes).';
            quizModificado = true;
          } else if (pergunta.includes('terça maior')) {
            quiz.questions[i].explanation = 'A terça maior é o intervalo de 2 tons (4 semitons). Exemplo: Dó-Mi.';
            quizModificado = true;
          } else if (pergunta.includes('quinta justa')) {
            quiz.questions[i].explanation = 'A quinta justa é o intervalo de 3,5 tons (7 semitons). Exemplo: Dó-Sol.';
            quizModificado = true;
          } else if (pergunta.includes('acorde maior')) {
            quiz.questions[i].explanation = 'Acorde maior = fundamental + terça maior + quinta justa.';
            quizModificado = true;
          } else if (pergunta.includes('acorde menor')) {
            quiz.questions[i].explanation = 'Acorde menor = fundamental + terça menor + quinta justa.';
            quizModificado = true;
          } else if (pergunta.includes('tônica')) {
            quiz.questions[i].explanation = 'A tônica é o acorde do I grau, que dá sensação de repouso.';
            quizModificado = true;
          } else if (pergunta.includes('dominante')) {
            quiz.questions[i].explanation = 'A dominante é o acorde do V grau, que cria tensão.';
            quizModificado = true;
          } else if (pergunta.includes('subdominante')) {
            quiz.questions[i].explanation = 'A subdominante é o acorde do IV grau.';
            quizModificado = true;
          }
        }
      }
      
      // Salvar se modificado
      if (quizModificado) {
        await quiz.save();
        console.log(`\n   💾 Quiz salvo com melhorias!\n`);
        console.log('-'.repeat(80));
      }
    }
    
    // Relatório final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL');
    console.log('='.repeat(80));
    console.log(`\n✅ Perguntas reescritas de forma lúdica: ${totalMelhorado}`);
    console.log(`🔧 Perguntas com símbolos removidos: ${totalCorrigido}`);
    console.log(`\n🎉 Quizzes agora estão mais claros e didáticos!`);
    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Erro ao melhorar perguntas:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await melhorarPerguntas();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();

