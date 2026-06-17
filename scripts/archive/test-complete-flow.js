const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCompleteFlow() {
  try {
    console.log('🧪 Testando fluxo completo NoteMusic...\n');
    
    // Teste 1: Registro de novo usuário
    console.log('1. Registrando novo usuário...');
    const registerResponse = await fetch('http://localhost:3333/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Usuário Teste Flow',
        email: 'flowtest@notemusic.com',
        password: 'teste123'
      })
    });
    
    let token = null;
    let userId = null;
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      token = registerData.token;
      userId = registerData.user.id;
      console.log('✅ Registro bem-sucedido:', {
        nome: registerData.user.name,
        email: registerData.user.email,
        level: registerData.user.level
      });
    } else {
      // Se já existe, fazer login
      console.log('⚠️ Usuário já existe, fazendo login...');
      const loginResponse = await fetch('http://localhost:3333/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'flowtest@notemusic.com',
          password: 'teste123'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        token = loginData.token;
        userId = loginData.user.id;
        console.log('✅ Login bem-sucedido');
      } else {
        console.log('❌ Erro no login');
        return;
      }
    }
    
    // Teste 2: Obter estatísticas iniciais
    console.log('\n2. Obtendo estatísticas iniciais...');
    const initialStatsResponse = await fetch('http://localhost:3333/api/gamification/stats/detailed', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (initialStatsResponse.ok) {
      const initialStats = await initialStatsResponse.json();
      console.log('✅ Estatísticas iniciais:', {
        level: initialStats.stats.level,
        totalPoints: initialStats.stats.totalPoints,
        streak: initialStats.stats.currentStreak,
        weeklyProgress: initialStats.stats.weeklyProgress
      });
    }
    
    // Teste 3: Obter módulos disponíveis
    console.log('\n3. Obtendo módulos disponíveis...');
    const modulesResponse = await fetch('http://localhost:3333/api/modules', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    let firstModule = null;
    if (modulesResponse.ok) {
      const modulesData = await modulesResponse.json();
      firstModule = modulesData.modules[0];
      console.log('✅ Módulos disponíveis:', modulesData.count);
      console.log('   Primeiro módulo:', firstModule.title);
    }
    
    // Teste 4: Completar primeiro módulo
    if (firstModule) {
      console.log('\n4. Completando primeiro módulo...');
      const completeModuleResponse = await fetch(`http://localhost:3333/api/modules/${firstModule._id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (completeModuleResponse.ok) {
        const completeData = await completeModuleResponse.json();
        console.log('✅ Módulo completado:', {
          pointsEarned: completeData.pointsEarned,
          totalPoints: completeData.totalPoints,
          streak: completeData.streak,
          levelUp: completeData.levelUp,
          currentLevel: completeData.currentLevel
        });
        
        if (completeData.levelInfo) {
          console.log('📊 Progresso de nível:', {
            current: completeData.levelInfo.currentLevel,
            next: completeData.levelInfo.nextLevel,
            progressModules: completeData.levelInfo.progress.modules,
            progressPoints: completeData.levelInfo.progress.points
          });
        }
      }
    }
    
    // Teste 5: Fazer quiz do módulo
    console.log('\n5. Fazendo quiz do módulo...');
    const quizResponse = await fetch(`http://localhost:3333/api/quiz/${firstModule._id}/private`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (quizResponse.ok) {
      const quizData = await quizResponse.json();
      console.log('✅ Quiz obtido:', {
        title: quizData.quiz.title,
        questions: quizData.quiz.totalQuestions,
        attemptsRemaining: quizData.quiz.attemptsRemaining
      });
      
      // Submeter quiz com respostas corretas
      const answers = quizData.quiz.questions.map((q, idx) => ({
        questionId: q._id,
        answer: 0 // Primeira opção (simplificado para teste)
      }));
      
      const submitQuizResponse = await fetch(`http://localhost:3333/api/quiz/${quizData.quiz._id}/submit/private`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: answers,
          timeSpent: 120
        })
      });
      
      if (submitQuizResponse.ok) {
        const submitData = await submitQuizResponse.json();
        console.log('✅ Quiz submetido:', {
          score: submitData.score,
          total: submitData.total,
          percentage: submitData.percentage,
          pointsEarned: submitData.pointsEarned,
          totalPoints: submitData.totalPoints
        });
      }
    }
    
    // Teste 6: Fazer desafio diário
    console.log('\n6. Fazendo desafio diário...');
    const dailyChallengeResponse = await fetch('http://localhost:3333/api/quiz/daily-challenge/private', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (dailyChallengeResponse.ok) {
      const dailyData = await dailyChallengeResponse.json();
      
      if (dailyData.dailyChallenge.available) {
        console.log('✅ Desafio diário disponível:', {
          title: dailyData.dailyChallenge.quiz.title,
          bonusPoints: dailyData.dailyChallenge.quiz.bonusPoints
        });
        
        // Submeter desafio diário
        const dailyAnswers = [
          { questionId: '1', answer: 2 }, // Órgão
          { questionId: '2', answer: 3 }  // Si
        ];
        
        const submitDailyResponse = await fetch(`http://localhost:3333/api/quiz/${dailyData.dailyChallenge.quiz._id}/submit/private`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            answers: dailyAnswers,
            timeSpent: 90
          })
        });
        
        if (submitDailyResponse.ok) {
          const submitDailyData = await submitDailyResponse.json();
          console.log('✅ Desafio diário completado:', {
            score: submitDailyData.score,
            bonusPoints: submitDailyData.bonusPoints,
            totalPoints: submitDailyData.totalPoints,
            isDailyChallenge: submitDailyData.isDailyChallenge
          });
        }
      } else {
        console.log('⚠️ Desafio diário já foi completado hoje');
      }
    }
    
    // Teste 7: Obter estatísticas finais
    console.log('\n7. Obtendo estatísticas finais...');
    const finalStatsResponse = await fetch('http://localhost:3333/api/gamification/stats/detailed', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (finalStatsResponse.ok) {
      const finalStats = await finalStatsResponse.json();
      console.log('✅ Estatísticas finais:', {
        level: finalStats.stats.level,
        totalPoints: finalStats.stats.totalPoints,
        streak: finalStats.stats.currentStreak,
        weeklyProgress: finalStats.stats.weeklyProgress,
        completedModules: finalStats.stats.completedModules,
        averageScore: finalStats.stats.averageScore
      });
      
      // Mostrar progresso de nível
      if (finalStats.stats.levelProgress) {
        console.log('\n📊 Progresso de nível:');
        console.log(`   Nível atual: ${finalStats.stats.levelProgress.current}`);
        console.log(`   Próximo nível: ${finalStats.stats.levelProgress.next}`);
        console.log(`   Progresso: ${finalStats.stats.levelProgress.percentage}%`);
        console.log(`   Requisitos: ${finalStats.stats.levelProgress.requirements}`);
      }
    }
    
    // Teste 8: Obter ranking
    console.log('\n8. Obtendo ranking...');
    const rankingResponse = await fetch('http://localhost:3333/api/users/ranking', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (rankingResponse.ok) {
      const rankingData = await rankingResponse.json();
      console.log('✅ Posição no ranking:', {
        posição: rankingData.userPosition,
        totalUsuários: rankingData.totalUsers
      });
    }
    
    console.log('\n🎉 Fluxo completo testado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao testar fluxo:', error.message);
  }
}

// Executar teste
testCompleteFlow();
