const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('../../src/models/quiz.model');

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

// Simular o processo de validação do backend
const simularValidacao = (question, selectedAnswer) => {
  // Converter para número para garantir comparação consistente
  const selectedAnswerIndex = Number(selectedAnswer);
  
  // Verificar se a resposta está correta
  const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
  
  // Se não encontrar opção correta, retornar erro
  if (correctOptionIndex === -1) {
    console.error(`❌ Erro: Questão não tem opção correta definida`);
    return {
      success: false,
      error: 'Questão mal configurada'
    };
  }
  
  const isCorrect = selectedAnswerIndex === correctOptionIndex;
  
  return {
    success: true,
    isCorrect,
    selectedAnswerIndex,
    correctOptionIndex
  };
};

// Verificar se há inconsistências na validação de respostas
const verificarInconsistencias = async () => {
  try {
    console.log('🔍 Verificando inconsistências na validação de respostas...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    let totalPerguntas = 0;
    let perguntasSemRespostaCorreta = 0;
    let perguntasComMultiplasRespostasCorretas = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Analisando quiz: ${quiz.title}`);
      
      // Para cada pergunta
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        totalPerguntas++;
        
        console.log(`\n📝 Questão ${i+1}: "${question.question}"`);
        
        // Verificar se há exatamente uma opção correta
        const opcoesCorretas = question.options.filter(opt => opt.isCorrect);
        
        if (opcoesCorretas.length === 0) {
          console.log('❌ PROBLEMA: Nenhuma opção marcada como correta');
          perguntasSemRespostaCorreta++;
          
          // Sugerir correção
          console.log('💡 Sugestão: Marcar uma opção como correta');
        } else if (opcoesCorretas.length > 1) {
          console.log(`❌ PROBLEMA: Múltiplas opções marcadas como corretas (${opcoesCorretas.length})`);
          console.log('📋 Opções marcadas como corretas:');
          opcoesCorretas.forEach((opt, idx) => {
            console.log(`   ${idx+1}. ${opt.label}`);
          });
          perguntasComMultiplasRespostasCorretas++;
          
          // Sugerir correção
          console.log('💡 Sugestão: Manter apenas uma opção como correta');
        } else {
          console.log(`✅ OK: Uma única opção correta - "${opcoesCorretas[0].label}"`);
          
          // Verificar o índice da opção correta
          const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
          console.log(`📊 Índice da opção correta: ${correctOptionIndex}`);
          
          // Simular validação para cada opção
          console.log('\n🧪 Simulando validação para cada opção:');
          for (let j = 0; j < question.options.length; j++) {
            const option = question.options[j];
            const result = simularValidacao(question, j);
            
            console.log(`   Opção ${j}: "${option.label}" - ${result.isCorrect ? '✅ Correta' : '❌ Incorreta'}`);
            
            // Verificar se a validação está correta
            if ((j === correctOptionIndex && !result.isCorrect) || 
                (j !== correctOptionIndex && result.isCorrect)) {
              console.log(`   ❌ PROBLEMA: Validação inconsistente para opção ${j}`);
            }
          }
        }
        
        // Verificar se há uma explicação adequada
        if (!question.explanation || question.explanation.length < 30) {
          console.log('⚠️ AVISO: Explicação ausente ou muito curta');
        }
      }
    }
    
    console.log('\n📊 Resumo da verificação:');
    console.log(`   Total de perguntas analisadas: ${totalPerguntas}`);
    console.log(`   Perguntas sem resposta correta: ${perguntasSemRespostaCorreta}`);
    console.log(`   Perguntas com múltiplas respostas corretas: ${perguntasComMultiplasRespostasCorretas}`);
    
    if (perguntasSemRespostaCorreta > 0 || perguntasComMultiplasRespostasCorretas > 0) {
      console.log('\n⚠️ ATENÇÃO: Foram encontradas inconsistências que podem causar problemas na validação!');
    } else {
      console.log('\n✅ Todas as perguntas têm exatamente uma resposta correta!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar inconsistências:', error);
  }
};

// Simular o processo de validação do frontend
const simularFluxoFrontendBackend = async () => {
  try {
    console.log('\n🔄 Simulando fluxo completo frontend-backend...');
    
    // Buscar um quiz para teste
    const quiz = await Quiz.findOne();
    if (!quiz) {
      console.log('❌ Nenhum quiz encontrado para teste');
      return;
    }
    
    console.log(`📊 Usando quiz "${quiz.title}" para simulação`);
    
    // Pegar uma pergunta para teste
    const questionIndex = 0;
    const question = quiz.questions[questionIndex];
    
    if (!question) {
      console.log('❌ Nenhuma pergunta encontrada para teste');
      return;
    }
    
    console.log(`📝 Questão: "${question.question}"`);
    
    // Mostrar opções
    console.log('📋 Opções:');
    question.options.forEach((opt, idx) => {
      console.log(`   ${idx}. ${opt.label} ${opt.isCorrect ? '(✓)' : ''}`);
    });
    
    // Índice da opção correta
    const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
    console.log(`📊 Índice da opção correta: ${correctOptionIndex}`);
    
    // Simular seleção de cada opção
    console.log('\n🧪 Simulando seleção de cada opção:');
    
    for (let selectedAnswer = 0; selectedAnswer < question.options.length; selectedAnswer++) {
      console.log(`\n🔍 Usuário seleciona opção ${selectedAnswer}: "${question.options[selectedAnswer].label}"`);
      
      // 1. Frontend envia para o backend
      console.log(`   1️⃣ Frontend envia: quizId=${quiz._id}, questionIndex=${questionIndex}, selectedAnswer=${selectedAnswer}`);
      
      // 2. Backend processa
      console.log(`   2️⃣ Backend converte selectedAnswer para número: ${Number(selectedAnswer)}`);
      console.log(`   3️⃣ Backend encontra índice da opção correta: ${correctOptionIndex}`);
      
      // 3. Backend compara
      const isCorrect = Number(selectedAnswer) === correctOptionIndex;
      console.log(`   4️⃣ Backend compara: ${Number(selectedAnswer)} === ${correctOptionIndex} => ${isCorrect ? 'Correto' : 'Incorreto'}`);
      
      // 4. Backend responde
      console.log(`   5️⃣ Backend responde: isCorrect=${isCorrect}`);
      
      // 5. Frontend processa resposta
      console.log(`   6️⃣ Frontend atualiza UI: ${isCorrect ? '✅ Resposta correta!' : '❌ Resposta incorreta!'}`);
      
      // Verificar se a resposta está correta
      if ((selectedAnswer === correctOptionIndex && !isCorrect) || 
          (selectedAnswer !== correctOptionIndex && isCorrect)) {
        console.log(`   ❌ PROBLEMA: Validação inconsistente para opção ${selectedAnswer}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao simular fluxo frontend-backend:', error);
  }
};

// Verificar se há inconsistências na ordenação das opções
const verificarOrdenacaoOpcoes = async () => {
  try {
    console.log('\n🔄 Verificando se há inconsistências na ordenação das opções...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    
    let totalPerguntas = 0;
    let perguntasComProblemaOrdenacao = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Analisando quiz: ${quiz.title}`);
      
      // Para cada pergunta
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        totalPerguntas++;
        
        // Verificar se as opções têm IDs consistentes
        const opcoesSemId = question.options.filter(opt => !opt.id && !opt._id);
        const opcoesComIdDuplicado = question.options.filter((opt, idx, arr) => 
          opt.id && arr.findIndex(o => o.id === opt.id) !== idx
        );
        
        if (opcoesSemId.length > 0 || opcoesComIdDuplicado.length > 0) {
          console.log(`\n📝 Questão ${i+1}: "${question.question.substring(0, 50)}..."`);
          
          if (opcoesSemId.length > 0) {
            console.log(`❌ PROBLEMA: ${opcoesSemId.length} opções sem ID`);
            perguntasComProblemaOrdenacao++;
          }
          
          if (opcoesComIdDuplicado.length > 0) {
            console.log(`❌ PROBLEMA: ${opcoesComIdDuplicado.length} opções com ID duplicado`);
            perguntasComProblemaOrdenacao++;
          }
        }
      }
    }
    
    console.log('\n📊 Resumo da verificação de ordenação:');
    console.log(`   Total de perguntas analisadas: ${totalPerguntas}`);
    console.log(`   Perguntas com problemas de ordenação: ${perguntasComProblemaOrdenacao}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar ordenação das opções:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await verificarInconsistencias();
    await simularFluxoFrontendBackend();
    await verificarOrdenacaoOpcoes();
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();
