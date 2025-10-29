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

// Verificar e corrigir problemas na validação de quizzes
const fixQuizValidation = async () => {
  try {
    console.log('🔍 Analisando quizzes para corrigir problemas de validação...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    let quizzesFixed = 0;
    let questionsFixed = 0;
    
    // Para cada quiz
    for (const quiz of quizzes) {
      console.log(`\n🎵 Analisando quiz: ${quiz.title}`);
      let quizModified = false;
      
      // Para cada questão
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        
        // Verificar se há exatamente uma opção correta
        const correctOptions = question.options.filter(opt => opt.isCorrect === true);
        
        if (correctOptions.length !== 1) {
          console.log(`   ⚠️ Questão ${i+1} tem ${correctOptions.length} opções corretas`);
          
          if (correctOptions.length === 0) {
            // Se não há opção correta, marcar a primeira como correta
            console.log(`   🔧 Marcando primeira opção como correta para questão ${i+1}`);
            quiz.questions[i].options[0].isCorrect = true;
            quizModified = true;
            questionsFixed++;
          } 
          else if (correctOptions.length > 1) {
            // Se há múltiplas opções corretas, deixar apenas a primeira
            console.log(`   🔧 Mantendo apenas a primeira opção correta para questão ${i+1}`);
            
            let foundFirst = false;
            for (let j = 0; j < question.options.length; j++) {
              if (question.options[j].isCorrect) {
                if (!foundFirst) {
                  foundFirst = true;
                } else {
                  quiz.questions[i].options[j].isCorrect = false;
                }
              }
            }
            
            quizModified = true;
            questionsFixed++;
          }
        } else {
          console.log(`   ✅ Questão ${i+1} tem exatamente uma opção correta`);
        }
        
        // Verificar se todas as opções têm a propriedade isCorrect explicitamente definida
        let fixedUndefinedOptions = false;
        
        for (let j = 0; j < question.options.length; j++) {
          if (question.options[j].isCorrect === undefined) {
            console.log(`   ⚠️ Opção ${j+1} da questão ${i+1} não tem isCorrect definido`);
            quiz.questions[i].options[j].isCorrect = false;
            fixedUndefinedOptions = true;
            quizModified = true;
          }
        }
        
        if (fixedUndefinedOptions) {
          questionsFixed++;
        }
        
        // Verificar se há opções duplicadas
        const optionTexts = question.options.map(opt => opt.label);
        const uniqueOptions = new Set(optionTexts);
        
        if (uniqueOptions.size !== optionTexts.length) {
          console.log(`   ⚠️ Questão ${i+1} tem opções duplicadas`);
          
          // Modificar ligeiramente as opções duplicadas
          const seenOptions = new Set();
          
          for (let j = 0; j < question.options.length; j++) {
            const option = question.options[j];
            
            if (seenOptions.has(option.label)) {
              const originalLabel = option.label;
              quiz.questions[i].options[j].label = `${originalLabel} (variação)`;
              console.log(`   🔧 Modificando opção duplicada: "${originalLabel}" -> "${quiz.questions[i].options[j].label}"`);
              quizModified = true;
            } else {
              seenOptions.add(option.label);
            }
          }
          
          questionsFixed++;
        }
      }
      
      // Salvar alterações se o quiz foi modificado
      if (quizModified) {
        await quiz.save();
        console.log(`✅ Quiz atualizado: ${quiz.title}`);
        quizzesFixed++;
      } else {
        console.log(`✅ Quiz já está correto: ${quiz.title}`);
      }
    }
    
    console.log('\n📊 Resumo das correções:');
    console.log(`   Total de quizzes verificados: ${quizzes.length}`);
    console.log(`   Quizzes corrigidos: ${quizzesFixed}`);
    console.log(`   Questões corrigidas: ${questionsFixed}`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir validação de quizzes:', error);
  }
};

// Verificar o comportamento do controller de validação
const testQuizValidation = async () => {
  try {
    console.log('\n🧪 Testando comportamento do controller de validação...');
    
    // Buscar um quiz aleatório
    const quiz = await Quiz.findOne();
    
    if (!quiz) {
      console.log('❌ Nenhum quiz encontrado para teste');
      return;
    }
    
    console.log(`📝 Testando com quiz: ${quiz.title}`);
    
    // Para cada questão
    for (let i = 0; i < Math.min(quiz.questions.length, 3); i++) {
      const question = quiz.questions[i];
      console.log(`\n📋 Questão ${i+1}: "${question.question}"`);
      
      // Encontrar o índice da opção correta
      const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
      
      if (correctOptionIndex === -1) {
        console.log('❌ Nenhuma opção correta encontrada');
        continue;
      }
      
      console.log(`✅ Opção correta: ${correctOptionIndex + 1}. ${question.options[correctOptionIndex].label}`);
      
      // Simular validação com diferentes tipos de dados
      const testCases = [
        { value: correctOptionIndex, type: 'number' },
        { value: String(correctOptionIndex), type: 'string' },
        { value: Number(correctOptionIndex), type: 'Number()' },
        { value: parseInt(correctOptionIndex), type: 'parseInt()' }
      ];
      
      console.log('\n🧪 Simulando validações:');
      
      for (const test of testCases) {
        const isCorrect = test.value === correctOptionIndex;
        console.log(`   Teste com ${test.type}: ${test.value} === ${correctOptionIndex} = ${isCorrect}`);
        
        // Simular o código do controller
        const isCorrectController = Number(test.value) === correctOptionIndex;
        console.log(`   Controller: Number(${test.value}) === ${correctOptionIndex} = ${isCorrectController}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar validação:', error);
  }
};

// Corrigir o controller de validação
const fixValidationController = async () => {
  try {
    console.log('\n🔧 Gerando código corrigido para o controller de validação...');
    
    // Código corrigido para a função validateQuestion
    const fixedCode = `
// @desc    Validar resposta de uma questão
// @route   POST /api/quiz/:quizId/validate/:questionIndex
// @access  Public
exports.validateQuestion = async (req, res, next) => {
  try {
    const { quizId, questionIndex } = req.params;
    const { selectedAnswer } = req.body;

    console.log(\`🔍 Validando questão \${questionIndex} do quiz \${quizId}\`);
    console.log(\`📝 Resposta selecionada: \${selectedAnswer} (tipo: \${typeof selectedAnswer})\`);

    // Validar entrada
    if (selectedAnswer === undefined || selectedAnswer === null) {
      return res.status(400).json({
        success: false,
        message: 'Resposta é obrigatória'
      });
    }

    // Converter para número para garantir comparação consistente
    const selectedAnswerIndex = Number(selectedAnswer);

    // Tratar desafio diário mock
    if (quizId === 'daily-challenge-mock') {
      // ... código existente para o mock ...

      // Converter para garantir comparação numérica
      const isCorrect = selectedAnswerIndex === correctOptionIndex;
      
      console.log(\`\${isCorrect ? '✅' : '❌'} Questão \${questionIndex}: \${isCorrect ? 'Correta' : 'Incorreta'}\`);
      console.log(\`  Resposta do usuário: \${selectedAnswerIndex} (convertido para número)\`);
      console.log(\`  Resposta correta: \${correctOptionIndex}\`);

      return res.json({
        success: true,
        isCorrect,
        selectedAnswer: {
          index: selectedAnswerIndex,
          text: selectedOption.label,
          isCorrect
        },
        correctAnswer: {
          index: correctOptionIndex,
          text: correctOption.label
        },
        explanation: question.explanation,
        points: isCorrect ? POINTS.QUIZ_QUESTION : 0
      });
    }

    // Buscar o quiz real no banco de dados
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz não encontrado'
      });
    }

    // Verificar se a questão existe
    const questionIdx = parseInt(questionIndex);
    if (isNaN(questionIdx) || questionIdx < 0 || questionIdx >= quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Índice de questão inválido'
      });
    }

    const question = quiz.questions[questionIdx];
    
    // Verificar se a opção existe
    if (isNaN(selectedAnswerIndex) || selectedAnswerIndex < 0 || selectedAnswerIndex >= question.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Opção inválida'
      });
    }

    // Verificar se a resposta está correta
    const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
    
    // Se não encontrar opção correta, logar erro e retornar erro
    if (correctOptionIndex === -1) {
      console.error(\`❌ Erro: Questão \${questionIdx} não tem opção correta definida\`);
      return res.status(500).json({
        success: false,
        message: 'Erro interno: questão mal configurada'
      });
    }
    
    const isCorrect = selectedAnswerIndex === correctOptionIndex;
    const selectedOption = question.options[selectedAnswerIndex];
    const correctOption = question.options[correctOptionIndex];
    
    console.log(\`🔍 Validação da questão \${questionIdx}:\`);
    console.log(\`  Pergunta: "\${question.question.substring(0, 40)}..."\`);
    console.log(\`  Resposta do usuário: \${selectedAnswerIndex} (\${selectedOption.label})\`);
    console.log(\`  Resposta correta: \${correctOptionIndex} (\${correctOption.label})\`);
    console.log(\`  Resultado: \${isCorrect ? '✅ Correta' : '❌ Incorreta'}\`);

    res.json({
      success: true,
      isCorrect,
      selectedAnswer: {
        index: selectedAnswerIndex,
        text: selectedOption.label,
        isCorrect
      },
      correctAnswer: {
        index: correctOptionIndex,
        text: correctOption.label
      },
      explanation: selectedOption.explanation || correctOption.explanation || question.explanation || null,
      points: isCorrect ? POINTS.QUIZ_QUESTION : 0
    });
  } catch (error) {
    console.error('❌ Erro ao validar questão:', error);
    next(error);
  }
};`;
    
    console.log('✅ Código corrigido gerado com sucesso!');
    console.log('\nPara corrigir o problema:');
    console.log('1. Abra o arquivo Back End/src/controllers/quiz.controller.js');
    console.log('2. Substitua a função validateQuestion pelo código corrigido acima');
    console.log('3. Reinicie o servidor backend');
    
  } catch (error) {
    console.error('❌ Erro ao gerar código corrigido:', error);
  }
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    
    // Verificar e corrigir problemas na validação de quizzes
    await fixQuizValidation();
    
    // Testar o comportamento do controller de validação
    await testQuizValidation();
    
    // Gerar código corrigido para o controller
    await fixValidationController();
    
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();





























