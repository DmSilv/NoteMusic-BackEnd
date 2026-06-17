const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/Quiz');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');
    console.log('✅ Conectado ao MongoDB\n');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
};

// CORREÇÕES MANUAIS ESPECÍFICAS - USANDO ÍNDICE EXATO DAS OPÇÕES
const corrigirManualmente = async () => {
  try {
    console.log('🔧 CORREÇÃO MANUAL DEFINITIVA\n');
    console.log('Corrigindo questões específicas com índices exatos\n');
    console.log('='.repeat(80) + '\n');
    
    let totalCorrigido = 0;
    
    // ==================== QUIZ APRENDIZ - PULSAÇÃO E TEMPO ====================
    let quiz = await Quiz.findOne({ title: /Quiz Aprendiz - PULSAÇÃO E TEMPO/i });
    if (quiz) {
      console.log('📝 Corrigindo: Quiz Aprendiz - PULSAÇÃO E TEMPO\n');
      
      // 1. O que é a pulsação musical? (Índice correto: batida regular)
      let questao = quiz.questions.find(q => q.question.toLowerCase().includes('o que é a pulsação musical'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => 
          opt.label.toLowerCase().includes('batida') && opt.label.toLowerCase().includes('regular')
        );
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'A pulsação é a BATIDA REGULAR da música, como as batidas do coração! 💓';
          totalCorrigido++;
          console.log(`   ✅ Pulsação musical corrigida`);
        }
      }
      
      // 2. O que significa BPM? (Opção 0: Batimentos Por Minuto)
      questao = quiz.questions.find(q => q.question.toLowerCase().includes('bpm'));
      if (questao) {
        questao.options.forEach((opt, i) => opt.isCorrect = (i === 0)); // Opção 0 é a correta
        questao.explanation = 'BPM = Batimentos Por Minuto! Indica a velocidade da música. BPM 60 = 1 batida/segundo. ⏱️';
        totalCorrigido++;
        console.log(`   ✅ BPM corrigida (opção 0)`);
      }
      
      await quiz.save();
      console.log(`   💾 Quiz salvo!\n`);
    }
    
    // ==================== QUIZ APRENDIZ - FÓRMULAS DE COMPASSO ====================
    quiz = await Quiz.findOne({ title: /Quiz Aprendiz - FÓRMULAS DE COMPASSO/i });
    if (quiz) {
      console.log('📝 Corrigindo: Quiz Aprendiz - FÓRMULAS DE COMPASSO\n');
      
      // 1. Na fórmula 4/4, primeiro número? (Opção 2: número de tempos)
      let questao = quiz.questions.find(q => q.question.toLowerCase().includes('4/4') && q.question.toLowerCase().includes('primeiro'));
      if (questao) {
        questao.options.forEach((opt, i) => opt.isCorrect = (i === 2)); // Opção 2 é a correta
        questao.explanation = 'O número de CIMA indica quantos TEMPOS tem no compasso! Em 4/4 são 4 tempos. 🎵🎵🎵🎵';
        totalCorrigido++;
        console.log(`   ✅ 4/4 primeiro número corrigida (opção 2)`);
      }
      
      // 2. Na fórmula 3/4, segundo número? (semínima)
      questao = quiz.questions.find(q => q.question.toLowerCase().includes('3/4') && q.question.toLowerCase().includes('segundo'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => opt.label.toLowerCase().includes('semínima'));
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'O número de BAIXO indica qual figura vale 1 tempo. O 4 = semínima! ♩';
          totalCorrigido++;
          console.log(`   ✅ 3/4 segundo número corrigida`);
        }
      }
      
      // 3. Linha vertical que divide compassos? (barra de compasso)
      questao = quiz.questions.find(q => q.question.toLowerCase().includes('linha vertical'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => opt.label.toLowerCase().includes('barra'));
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'A BARRA DE COMPASSO (|) divide os compassos na partitura! |🎵|🎵|';
          totalCorrigido++;
          console.log(`   ✅ Barra de compasso corrigida`);
        }
      }
      
      await quiz.save();
      console.log(`   💾 Quiz salvo!\n`);
    }
    
    // ==================== QUIZ APRENDIZ - COMPASSOS SIMPLES ====================
    quiz = await Quiz.findOne({ title: /Quiz Aprendiz - COMPASSOS SIMPLES/i });
    if (quiz) {
      console.log('📝 Corrigindo: Quiz Aprendiz - COMPASSOS SIMPLES\n');
      
      // 1. Qual representa compasso simples? (Opção 2: 3/4)
      let questao = quiz.questions.find(q => q.question.toLowerCase().includes('representa um compasso simples'));
      if (questao) {
        questao.options.forEach((opt, i) => opt.isCorrect = (i === 2)); // Opção 2 = 3/4
        questao.explanation = 'Compassos SIMPLES: 2/4, 3/4, 4/4. O tempo se divide em 2 partes. ♩=♪♪';
        totalCorrigido++;
        console.log(`   ✅ Compasso simples corrigida (opção 2: 3/4)`);
      }
      
      // 2. Característica principal? (Opção 1: divide em duas partes)
      questao = quiz.questions.find(q => q.question.toLowerCase().includes('característica principal'));
      if (questao) {
        questao.options.forEach((opt, i) => opt.isCorrect = (i === 1)); // Opção 1
        questao.explanation = 'Compasso SIMPLES: cada tempo se divide em 2 partes iguais! ♩ → ♪♪';
        totalCorrigido++;
        console.log(`   ✅ Característica compasso simples corrigida (opção 1)`);
      }
      
      // 3. Em 2/4, qual figura ocupa compasso inteiro? (mínima)
      questao = quiz.questions.find(q => q.question.toLowerCase().includes('2/4'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => opt.label.toLowerCase().includes('mínima'));
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'Em 2/4 temos 2 tempos, e a MÍNIMA vale 2 tempos! 𝅗𝅥 = compasso inteiro';
          totalCorrigido++;
          console.log(`   ✅ 2/4 figura inteira corrigida`);
        }
      }
      
      await quiz.save();
      console.log(`   💾 Quiz salvo!\n`);
    }
    
    // ==================== QUIZ APRENDIZ - COMPASSOS COMPOSTOS ====================
    quiz = await Quiz.findOne({ title: /Quiz Aprendiz - COMPASSOS COMPOSTOS/i });
    if (quiz) {
      console.log('📝 Corrigindo: Quiz Aprendiz - COMPASSOS COMPOSTOS\n');
      
      // 1. Qual representa compasso composto? (6/8)
      let questao = quiz.questions.find(q => q.question.toLowerCase().includes('representa um compasso composto'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => opt.label.includes('6/8'));
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'Compassos COMPOSTOS: 6/8, 9/8, 12/8. O tempo se divide em 3 partes. ♩.=♪♪♪';
          totalCorrigido++;
          console.log(`   ✅ Compasso composto corrigida (6/8)`);
        }
      }
      
      // 2. Característica principal? (Opção 1: divide em três partes)
      questao = quiz.questions.find(q => q.question.toLowerCase().includes('característica principal'));
      if (questao) {
        questao.options.forEach((opt, i) => opt.isCorrect = (i === 1)); // Opção 1
        questao.explanation = 'Compasso COMPOSTO: cada tempo se divide em 3 partes iguais! ♩. → ♪♪♪';
        totalCorrigido++;
        console.log(`   ✅ Característica compasso composto corrigida (opção 1)`);
      }
      
      await quiz.save();
      console.log(`   💾 Quiz salvo!\n`);
    }
    
    // ==================== QUIZ APRENDIZ - TONS E SEMITONS ====================
    quiz = await Quiz.findOne({ title: /Quiz Aprendiz - TONS E SEMITONS/i });
    if (quiz) {
      console.log('📝 Corrigindo: Quiz Aprendiz - TONS E SEMITONS\n');
      
      // 1. O que é um tom? (distância entre notas)
      let questao = quiz.questions.find(q => q.question.toLowerCase().includes('o que é um tom'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => 
          opt.label.toLowerCase().includes('distância')
        );
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'Um TOM é a distância de 2 semitons (2 casas no piano)! De Dó para Ré é 1 tom. 🎹';
          totalCorrigido++;
          console.log(`   ✅ O que é um tom corrigida`);
        }
      }
      
      // 2. Quantos semitons compõem um tom? (Opção 1: Dois semitons)
      questao = quiz.questions.find(q => q.question.toLowerCase().includes('quantos semitons compõem um tom'));
      if (questao) {
        questao.options.forEach((opt, i) => opt.isCorrect = (i === 1)); // Opção 1 = Dois semitons
        questao.explanation = '1 TOM = 2 SEMITONS! O semitom é a menor distância entre duas notas. 🎵';
        totalCorrigido++;
        console.log(`   ✅ Quantos semitons corrigida (opção 1: Dois)`);
      }
      
      // 3. Entre quais notas existe semitom natural? (Mi-Fá e Si-Dó)
      questao = quiz.questions.find(q => q.question.toLowerCase().includes('existe naturalmente um semitom'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => 
          (opt.label.toLowerCase().includes('mi') && opt.label.toLowerCase().includes('fá')) ||
          (opt.label.toLowerCase().includes('mi-fá'))
        );
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'MI-FÁ e SI-DÓ têm SEMITOM natural (sem tecla preta no meio)! 🎹';
          totalCorrigido++;
          console.log(`   ✅ Semitons naturais corrigida`);
        }
      }
      
      await quiz.save();
      console.log(`   💾 Quiz salvo!\n`);
    }
    
    // ==================== CORREÇÃO DAS FUNÇÕES HARMÔNICAS ERRADAS ====================
    quiz = await Quiz.findOne({ title: /Quiz Aprendiz - FUNÇÕES HARMÔNICAS/i });
    if (quiz) {
      console.log('📝 Corrigindo: Quiz Aprendiz - FUNÇÕES HARMÔNICAS\n');
      
      // 1. Tônica = PRIMEIRO grau (NÃO quinto!)
      let questao = quiz.questions.find(q => q.question.toLowerCase().includes('tônica'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => opt.label.toLowerCase().includes('primeiro'));
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'TÔNICA = I GRAU (primeiro)! É o acorde de repouso, o "lar" da música. 🏠';
          totalCorrigido++;
          console.log(`   ✅ Tônica = PRIMEIRO grau (CORRIGIDO!)`);
        }
      }
      
      // 2. Dominante = QUINTO grau (NÃO primeiro!)
      questao = quiz.questions.find(q => q.question.toLowerCase().includes('dominante'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => opt.label.toLowerCase().includes('quinto'));
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'DOMINANTE = V GRAU (quinto)! Cria tensão e quer voltar pra tônica. ⚡';
          totalCorrigido++;
          console.log(`   ✅ Dominante = QUINTO grau (CORRIGIDO!)`);
        }
      }
      
      // 3. Subdominante = QUARTO grau (NÃO segundo!)
      questao = quiz.questions.find(q => q.question.toLowerCase().includes('subdominante'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => opt.label.toLowerCase().includes('quarto'));
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'SUBDOMINANTE = IV GRAU (quarto)! Prepara a dominante. 🎵';
          totalCorrigido++;
          console.log(`   ✅ Subdominante = QUARTO grau (CORRIGIDO!)`);
        }
      }
      
      await quiz.save();
      console.log(`   💾 Quiz salvo!\n`);
    }
    
    // ==================== CORREÇÃO DAS CADÊNCIAS ERRADAS ====================
    quiz = await Quiz.findOne({ title: /Quiz Aprendiz - CADÊNCIAS/i });
    if (quiz) {
      console.log('📝 Corrigindo: Quiz Aprendiz - CADÊNCIAS\n');
      
      // 1. Cadência perfeita = V→I (NÃO I→V!)
      let questao = quiz.questions.find(q => q.question.toLowerCase().includes('cadência perfeita'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => 
          opt.label.toLowerCase().includes('v para i') || 
          opt.label.toLowerCase().includes('v para o i') ||
          (opt.label.toLowerCase().includes('progressão') && opt.label.toLowerCase().includes('v') && opt.label.toLowerCase().includes('i'))
        );
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'Cadência PERFEITA = V → I (dominante para tônica)! É a finalização mais forte. 🎯';
          totalCorrigido++;
          console.log(`   ✅ Cadência perfeita = V→I (CORRIGIDO!)`);
        }
      }
      
      // 2. Cadência plagal = IV→I
      questao = quiz.questions.find(q => q.question.toLowerCase().includes('cadência plagal'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => 
          opt.label.toLowerCase().includes('iv para i') || 
          opt.label.toLowerCase().includes('iv para o i')
        );
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'Cadência PLAGAL = IV → I (subdominante para tônica)! Cadência "Amém". 🙏';
          totalCorrigido++;
          console.log(`   ✅ Cadência plagal = IV→I (CORRIGIDO!)`);
        }
      }
      
      await quiz.save();
      console.log(`   💾 Quiz salvo!\n`);
    }
    
    // ==================== CORREÇÃO DÓ MAIOR (SEM FÁ#!) ====================
    quiz = await Quiz.findOne({ title: /Quiz Aprendiz - ESCALAS MAIORES/i });
    if (quiz) {
      console.log('📝 Corrigindo: Quiz Aprendiz - ESCALAS MAIORES\n');
      
      let questao = quiz.questions.find(q => q.question.toLowerCase().includes('dó maior'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => 
          opt.label.includes('Dó, Ré, Mi, Fá, Sol, Lá, Si') && !opt.label.includes('#')
        );
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'Dó maior: Dó-Ré-Mi-Fá-Sol-Lá-Si! SEM acidentes (sem # ou ♭). 🎹';
          totalCorrigido++;
          console.log(`   ✅ Dó maior SEM Fá# (CORRIGIDO!)`);
        }
      }
      
      await quiz.save();
      console.log(`   💾 Quiz salvo!\n`);
    }
    
    // ==================== CORREÇÃO ACORDE MENOR (TERÇA MENOR!) ====================
    quiz = await Quiz.findOne({ title: /Quiz Aprendiz - FORMAÇÃO DE ACORDES/i });
    if (quiz) {
      console.log('📝 Corrigindo: Quiz Aprendiz - FORMAÇÃO DE ACORDES\n');
      
      let questao = quiz.questions.find(q => q.question.toLowerCase().includes('acorde menor'));
      if (questao) {
        let indiceCorreto = questao.options.findIndex(opt => 
          opt.label.toLowerCase().includes('terça menor')
        );
        if (indiceCorreto !== -1) {
          questao.options.forEach((opt, i) => opt.isCorrect = (i === indiceCorreto));
          questao.explanation = 'Acorde MENOR = Fundamental + TERÇA MENOR + Quinta Justa! Som triste. 😔🎵';
          totalCorrigido++;
          console.log(`   ✅ Acorde menor = TERÇA MENOR (CORRIGIDO!)`);
        }
      }
      
      await quiz.save();
      console.log(`   💾 Quiz salvo!\n`);
    }
    
    // Relatório final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL');
    console.log('='.repeat(80));
    console.log(`\n✅ Total de questões CORRIGIDAS: ${totalCorrigido}`);
    console.log('\n🎉 CORREÇÃO MANUAL CONCLUÍDA COM SUCESSO!\n');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await corrigirManualmente();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  }
};

main();

