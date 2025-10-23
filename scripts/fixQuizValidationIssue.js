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

// Função para simular a validação de uma resposta
const simulateValidation = (question, selectedAnswer) => {
  // Converter para número para garantir comparação consistente
  const selectedAnswerIndex = Number(selectedAnswer);
  
  // Verificar se a resposta está correta
  const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
  
  // Se não encontrar opção correta, retornar erro
  if (correctOptionIndex === -1) {
    return {
      success: false,
      error: 'Questão mal configurada: nenhuma opção marcada como correta'
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

// Função para verificar se há problemas de tipo na validação
const checkTypeIssues = async () => {
  try {
    console.log('🔍 Verificando problemas de tipo na validação...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Encontrados ${quizzes.length} quizzes no banco de dados`);
    
    let totalProblemas = 0;
    
    // Para cada quiz, testar uma questão
    for (let i = 0; i < Math.min(5, quizzes.length); i++) {
      const quiz = quizzes[i];
      console.log(`\n🎵 Testando quiz: ${quiz.title}`);
      
      if (quiz.questions.length === 0) {
        console.log('⚠️ Quiz sem questões, pulando...');
        continue;
      }
      
      // Pegar a primeira questão
      const question = quiz.questions[0];
      console.log(`📝 Questão: "${question.question}"`);
      
      // Encontrar o índice da opção correta
      const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
      
      if (correctOptionIndex === -1) {
        console.log('❌ PROBLEMA: Nenhuma opção marcada como correta');
        totalProblemas++;
        continue;
      }
      
      console.log(`📊 Índice da opção correta: ${correctOptionIndex}`);
      
      // Testar com diferentes tipos de dados
      console.log('\n🧪 Testando validação com diferentes tipos de dados:');
      
      // Testar como número
      const resultNumber = simulateValidation(question, correctOptionIndex);
      console.log(`   Número (${correctOptionIndex}): ${resultNumber.isCorrect ? '✅ Correto' : '❌ Incorreto'}`);
      
      // Testar como string
      const resultString = simulateValidation(question, correctOptionIndex.toString());
      console.log(`   String ("${correctOptionIndex}"): ${resultString.isCorrect ? '✅ Correto' : '❌ Incorreto'}`);
      
      // Testar como string com espaços
      const resultStringSpace = simulateValidation(question, ` ${correctOptionIndex} `);
      console.log(`   String com espaços (" ${correctOptionIndex} "): ${resultStringSpace.isCorrect ? '✅ Correto' : '❌ Incorreto'}`);
      
      // Verificar se há inconsistência
      if (!resultNumber.isCorrect || !resultString.isCorrect || !resultStringSpace.isCorrect) {
        console.log('❌ PROBLEMA: Inconsistência na validação com diferentes tipos de dados');
        totalProblemas++;
      }
    }
    
    console.log(`\n📊 Total de problemas encontrados: ${totalProblemas}`);
    
    if (totalProblemas > 0) {
      console.log('\n⚠️ ATENÇÃO: Foram encontrados problemas que podem afetar a validação!');
      console.log('💡 Solução recomendada: Garantir que a comparação seja feita usando Number() para converter os valores.');
    } else {
      console.log('\n✅ Não foram encontrados problemas de tipo na validação!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar problemas de tipo:', error);
  }
};

// Função para corrigir a função validateQuestion no backend
const generateFixedValidationFunction = () => {
  console.log('\n📝 Gerando função validateQuestion corrigida:');
  
  const fixedFunction = `
// @desc    Validar resposta de uma questão específica
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
    
    // Verificar se é um número válido após conversão
    if (isNaN(selectedAnswerIndex)) {
      return res.status(400).json({
        success: false,
        message: 'Resposta inválida: deve ser um número'
      });
    }

    // Tratar desafio diário mock
    if (quizId === 'daily-challenge-mock') {
      // ... código existente para o mock ...
      
      // Garantir que a comparação seja feita com números
      const isCorrect = selectedAnswerIndex === correctOptionIndex;
      
      // ... resto do código para o mock ...
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
    
    // Garantir que a comparação seja feita com números
    const isCorrect = selectedAnswerIndex === correctOptionIndex;
    const selectedOption = question.options[selectedAnswerIndex];
    const correctOption = question.options[correctOptionIndex];
    
    console.log(\`🔍 Validação da questão \${questionIdx}:\`);
    console.log(\`  Pergunta: "\${question.question.substring(0, 40)}..."\`);
    console.log(\`  Resposta do usuário: \${selectedAnswerIndex} (convertido para número) - "\${selectedOption.label}"\`);
    console.log(\`  Resposta correta: \${correctOptionIndex} - "\${correctOption.label}"\`);
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

  console.log(fixedFunction);
  
  return fixedFunction;
};

// Função para verificar o frontend
const checkFrontendHandling = () => {
  console.log('\n🔍 Verificando como o frontend deve enviar a resposta:');
  
  console.log(`
// No componente Quiz.tsx
const handleOptionSelect = useCallback(async (optionIndex: number) => {
    // ...
    
    try {
        // 🔍 Validar resposta no backend
        // Importante: optionIndex já é um número, não precisa de conversão
        const validation = await quizService.validateQuestion(
            state.quiz!.id,
            state.currentQuestionIndex,
            optionIndex // Enviando como número
        );
        
        // ...
    } catch (error) {
        // ...
    }
}, []);

// No serviço quizService.ts
async validateQuestion(quizId: string, questionIndex: number, selectedAnswer: number): Promise<QuestionValidationResult> {
    try {
        // ...
        
        // Não converter selectedAnswer para string, manter como número
        const response = await apiService.validateQuestion(quizId, questionIndex, selectedAnswer);
        
        // ...
    } catch (error) {
        // ...
    }
}

// No serviço api.ts
async validateQuestion(quizId: string, questionIndex: number, selectedAnswer: number): Promise<QuestionValidationResult> {
    try {
        // ...
        
        const response = await this.request(\`/quiz/\${quizId}/validate/\${questionIndex}\`, {
            method: 'POST',
            body: JSON.stringify({
                selectedAnswer // Será convertido para string no JSON.stringify, mas o backend usará Number()
            })
        });
        
        // ...
    } catch (error) {
        // ...
    }
}`);
};

// Executar o script
const main = async () => {
  try {
    await connectDB();
    await checkTypeIssues();
    generateFixedValidationFunction();
    checkFrontendHandling();
    console.log('\n✨ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal durante a execução:', error);
    process.exit(1);
  }
};

// Iniciar o script
main();
