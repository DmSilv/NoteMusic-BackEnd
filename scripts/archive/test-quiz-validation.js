const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testQuizValidation() {
  try {
    console.log('🧪 Testando validação de quiz NoteMusic...\n');
    
    // Teste 1: Login
    console.log('1. Fazendo login...');
    const loginResponse = await fetch('http://localhost:3333/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teste@notemusic.com',
        password: 'senha123'
      })
    });
    
    let token = null;
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      token = loginData.token;
      console.log('✅ Login bem-sucedido');
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Erro no login:', errorData);
      return;
    }
    
    // Teste 2: Testar quiz de teste (ID atualizado)
    console.log('\n2. Testando quiz de teste...');
    const testQuizId = '689d1cbca9442adf708f40d4'; // ID atualizado do seed
    
    // Buscar o quiz primeiro
    const quizResponse = await fetch(`http://localhost:3333/api/quiz/${testQuizId}`);
    if (quizResponse.ok) {
      const quizData = await quizResponse.json();
      console.log('✅ Quiz obtido:', {
        title: quizData.title,
        questions: quizData.questions.length
      });
      
      // Mostrar questões e opções
      console.log('\n📋 Questões do quiz:');
      quizData.questions.forEach((q, idx) => {
        console.log(`\n   Questão ${idx + 1}: ${q.questionText}`);
        q.options.forEach((opt, optIdx) => {
          console.log(`     ${optIdx}: ${opt.optionText}${opt.isCorrect ? ' ✓' : ''}`);
        });
      });
      
      // Submeter com respostas corretas
      console.log('\n3. Submetendo quiz com respostas CORRETAS...');
      const correctAnswers = [3, 2, 0]; // Si (3), 7 notas (2), Volume alto (0)
      const submitCorrectResponse = await fetch(`http://localhost:3333/api/quiz/${testQuizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: correctAnswers,
          timeSpent: 120
        })
      });
      
      if (submitCorrectResponse.ok) {
        const submitData = await submitCorrectResponse.json();
        console.log('✅ Resultado (respostas corretas):', {
          score: submitData.score,
          total: submitData.total,
          percentage: submitData.percentage,
          userAnswers: submitData.userAnswers,
          correctAnswers: submitData.correctAnswers
        });
        
        // Mostrar detalhes das respostas
        if (submitData.answerDetails) {
          console.log('\n📊 Detalhes das respostas:');
          submitData.answerDetails.forEach((detail, idx) => {
            console.log(`   Questão ${idx + 1}: ${detail.isCorrect ? '✅' : '❌'}`);
            console.log(`     Sua resposta: ${detail.userAnswer}`);
            console.log(`     Resposta correta: ${detail.correctAnswer}`);
          });
        }
      } else {
        const errorData = await submitCorrectResponse.json();
        console.log('❌ Erro ao submeter quiz:', errorData);
      }
      
      // Submeter com respostas incorretas
      console.log('\n4. Submetendo quiz com respostas INCORRETAS...');
      const incorrectAnswers = [0, 0, 1]; // Todas incorretas
      const submitIncorrectResponse = await fetch(`http://localhost:3333/api/quiz/${testQuizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: incorrectAnswers,
          timeSpent: 90
        })
      });
      
      if (submitIncorrectResponse.ok) {
        const submitData = await submitIncorrectResponse.json();
        console.log('✅ Resultado (respostas incorretas):', {
          score: submitData.score,
          total: submitData.total,
          percentage: submitData.percentage,
          userAnswers: submitData.userAnswers,
          correctAnswers: submitData.correctAnswers
        });
      }
    } else {
      const errorData = await quizResponse.json();
      console.log('❌ Erro ao obter quiz:', errorData);
    }
    
    // Teste 3: Testar desafio diário
    console.log('\n5. Testando desafio diário...');
    const dailyResponse = await fetch('http://localhost:3333/api/quiz/daily-challenge');
    if (dailyResponse.ok) {
      const dailyData = await dailyResponse.json();
      console.log('✅ Desafio diário obtido:', {
        id: dailyData.id,
        title: dailyData.title,
        questions: dailyData.questions.length
      });
      
      // Mostrar questões do desafio diário
      console.log('\n📋 Questões do desafio diário:');
      dailyData.questions.forEach((q, idx) => {
        console.log(`\n   Questão ${idx + 1}: ${q.questionText}`);
        q.options.forEach((opt, optIdx) => {
          console.log(`     ${optIdx}: ${opt.optionText}${opt.isCorrect ? ' ✓' : ''}`);
        });
      });
      
      // Submeter desafio diário com respostas corretas
      console.log('\n6. Submetendo desafio diário...');
      const dailyAnswers = [2, 3]; // Órgão (2), Si (3)
      const submitDailyResponse = await fetch(`http://localhost:3333/api/quiz/${dailyData.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: dailyAnswers,
          timeSpent: 60
        })
      });
      
      if (submitDailyResponse.ok) {
        const submitData = await submitDailyResponse.json();
        console.log('✅ Resultado do desafio diário:', {
          score: submitData.score,
          total: submitData.total,
          percentage: submitData.percentage,
          isDailyChallenge: submitData.isDailyChallenge,
          userAnswers: submitData.userAnswers,
          correctAnswers: submitData.correctAnswers
        });
      } else {
        const errorData = await submitDailyResponse.json();
        console.log('❌ Erro ao submeter desafio diário:', errorData);
      }
    }
    
    // Teste 4: Testar quiz privado (autenticado)
    console.log('\n7. Testando quiz privado (autenticado)...');
    const privateQuizResponse = await fetch(`http://localhost:3333/api/quiz/${testQuizId}/private`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (privateQuizResponse.ok) {
      const privateQuizData = await privateQuizResponse.json();
      console.log('✅ Quiz privado obtido:', {
        title: privateQuizData.quiz.title,
        totalQuestions: privateQuizData.quiz.totalQuestions,
        attemptsRemaining: privateQuizData.quiz.attemptsRemaining
      });
      
      // Submeter quiz privado
      console.log('\n8. Submetendo quiz privado...');
      const submitPrivateResponse = await fetch(`http://localhost:3333/api/quiz/${testQuizId}/submit/private`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: [
            { questionId: '1', answer: 3 }, // Si
            { questionId: '2', answer: 2 }, // 7 notas
            { questionId: '3', answer: 0 }  // Volume alto
          ],
          timeSpent: 150
        })
      });
      
      if (submitPrivateResponse.ok) {
        const submitData = await submitPrivateResponse.json();
        console.log('✅ Resultado do quiz privado:', {
          score: submitData.score,
          total: submitData.total,
          percentage: submitData.percentage,
          pointsEarned: submitData.pointsEarned,
          totalPoints: submitData.totalPoints
        });
      } else {
        const errorData = await submitPrivateResponse.json();
        console.log('❌ Erro ao submeter quiz privado:', errorData);
      }
    }
    
    console.log('\n🎉 Testes de validação concluídos!');
    
  } catch (error) {
    console.error('❌ Erro ao testar validação:', error.message);
  }
}

// Executar teste
testQuizValidation();
