// @desc    Validar resposta de uma questão
// @route   POST /api/quiz/:quizId/validate/:questionIndex
// @access  Public
exports.validateQuestion = async (req, res, next) => {
  try {
    const { quizId, questionIndex } = req.params;
    const { selectedAnswer } = req.body;

    console.log(`🔍 Validando questão ${questionIndex} do quiz ${quizId}`);
    console.log(`📝 Resposta selecionada: ${selectedAnswer} (tipo: ${typeof selectedAnswer})`);

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
      // Para o mock, usar dados simulados com 5 questões para evitar erro de índice inválido
      const mockQuestions = [
        {
          question: "Qual é a duração de uma semibreve?",
          options: [
            { label: "1 tempo", isCorrect: false },
            { label: "2 tempos", isCorrect: false },
            { label: "4 tempos", isCorrect: true },
            { label: "8 tempos", isCorrect: false }
          ],
          explanation: "A semibreve é a figura musical de maior duração no sistema tradicional, valendo 4 tempos em um compasso quaternário."
        },
        {
          question: "Quantas linhas tem a pauta musical?",
          options: [
            { label: "4 linhas", isCorrect: false },
            { label: "5 linhas", isCorrect: true },
            { label: "6 linhas", isCorrect: false },
            { label: "7 linhas", isCorrect: false }
          ],
          explanation: "A pauta musical tradicional possui 5 linhas e 4 espaços onde são escritas as notas musicais."
        },
        {
          question: "Qual símbolo musical indica que devemos tocar suavemente?",
          options: [
            { label: "f (forte)", isCorrect: false },
            { label: "p (piano)", isCorrect: true },
            { label: "m (mezzo)", isCorrect: false },
            { label: "s (suave)", isCorrect: false }
          ],
          explanation: "O termo 'piano' (p) em italiano significa suave e indica que o trecho deve ser tocado com pouca intensidade."
        },
        {
          question: "Qual é o intervalo entre as notas Dó e Sol?",
          options: [
            { label: "3ª Maior", isCorrect: false },
            { label: "4ª Justa", isCorrect: false },
            { label: "5ª Justa", isCorrect: true },
            { label: "6ª Menor", isCorrect: false }
          ],
          explanation: "O intervalo entre Dó e Sol é uma 5ª Justa, pois contém 5 graus diatônicos (Dó, Ré, Mi, Fá, Sol)."
        },
        {
          question: "Qual a figura musical que vale metade de uma semínima?",
          options: [
            { label: "Mínima", isCorrect: false },
            { label: "Colcheia", isCorrect: true },
            { label: "Semicolcheia", isCorrect: false },
            { label: "Fusa", isCorrect: false }
          ],
          explanation: "A colcheia vale metade do valor de uma semínima. Se a semínima vale um tempo, a colcheia vale meio tempo."
        }
      ];

      const question = mockQuestions[questionIndex];
      if (!question) {
        return res.status(400).json({
          success: false,
          message: 'Índice de questão inválido'
        });
      }

      const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
      
      // Converter para garantir comparação numérica
      const isCorrect = selectedAnswerIndex === correctOptionIndex;
      
      console.log(`${isCorrect ? '✅' : '❌'} Questão ${questionIndex}: ${isCorrect ? 'Correta' : 'Incorreta'}`);
      console.log(`  Resposta do usuário: ${selectedAnswerIndex} (convertido para número)`);
      console.log(`  Resposta correta: ${correctOptionIndex}`);

      return res.json({
        success: true,
        isCorrect,
        selectedAnswer: {
          index: selectedAnswerIndex,
          text: question.options[selectedAnswerIndex].label,
          isCorrect
        },
        correctAnswer: {
          index: correctOptionIndex,
          text: question.options[correctOptionIndex].label
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
      console.error(`❌ Erro: Questão ${questionIdx} não tem opção correta definida`);
      return res.status(500).json({
        success: false,
        message: 'Erro interno: questão mal configurada'
      });
    }
    
    const isCorrect = selectedAnswerIndex === correctOptionIndex;
    const selectedOption = question.options[selectedAnswerIndex];
    const correctOption = question.options[correctOptionIndex];
    
    console.log(`🔍 Validação da questão ${questionIdx}:`);
    console.log(`  Pergunta: "${question.question.substring(0, 40)}..."`);
    console.log(`  Resposta do usuário: ${selectedAnswerIndex} (${selectedOption.label})`);
    console.log(`  Resposta correta: ${correctOptionIndex} (${correctOption.label})`);
    console.log(`  Resultado: ${isCorrect ? '✅ Correta' : '❌ Incorreta'}`);

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
};





















