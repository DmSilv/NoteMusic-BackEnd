const User = require('../models/User');

class GamificationService {
  // Verificar conquistas do usuário
  static checkAchievements(user) {
    const achievements = [];
    
    // Conquista por primeiro módulo
    if (user.completedModules.length >= 1) {
      achievements.push({
        id: 'first_module',
        name: 'Primeiro Passo',
        description: 'Complete seu primeiro módulo',
        icon: '🎯',
        points: 50,
        unlockedAt: user.completedModules[0].completedAt
      });
    }
    
    // Conquista por streak de 7 dias
    if (user.streak >= 7) {
      achievements.push({
        id: 'week_streak',
        name: 'Consistente',
        description: 'Mantenha um streak de 7 dias',
        icon: '🔥',
        points: 100,
        unlockedAt: new Date()
      });
    }
    
    // Conquista por 5 módulos
    if (user.completedModules.length >= 5) {
      achievements.push({
        id: 'five_modules',
        name: 'Aprendiz Dedicado',
        description: 'Complete 5 módulos',
        icon: '📚',
        points: 200,
        unlockedAt: new Date()
      });
    }
    
    // Conquista por 1000 pontos
    if (user.totalPoints >= 1000) {
      achievements.push({
        id: 'thousand_points',
        name: 'Pontuador',
        description: 'Alcance 1000 pontos',
        icon: '⭐',
        points: 300,
        unlockedAt: new Date()
      });
    }
    
    return achievements;
  }
  
  // Gerar desafios personalizados
  static generatePersonalizedChallenges(user) {
    const challenges = [];
    
    // Desafio de módulos
    const moduleChallenge = {
      id: 'weekly_modules',
      title: 'Módulos da Semana',
      description: 'Complete 3 módulos esta semana',
      type: 'modules',
      target: 3,
      progress: user.completedModules.filter(m => {
        const date = new Date(m.completedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date > weekAgo;
      }).length,
      reward: 150,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    
    // Desafio de quizzes
    const quizChallenge = {
      id: 'weekly_quizzes',
      title: 'Quizzes da Semana',
      description: 'Complete 5 quizzes esta semana',
      type: 'quizzes',
      target: 5,
      progress: user.completedQuizzes.filter(q => {
        const date = new Date(q.completedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date > weekAgo;
      }).length,
      reward: 100,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    
    // Desafio de streak
    const streakChallenge = {
      id: 'maintain_streak',
      title: 'Mantenha o Streak',
      description: 'Mantenha um streak de 10 dias',
      type: 'streak',
      target: 10,
      progress: user.streak,
      reward: 200,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    };
    
    challenges.push(moduleChallenge, quizChallenge, streakChallenge);
    
    return challenges;
  }
  
  // Calcular estatísticas do usuário
  static calculateUserStats(user) {
    const totalModules = user.completedModules.length;
    const totalQuizzes = user.completedQuizzes.length;
    
    // Calcular progresso geral
    const progress = totalModules > 0 ? (totalModules / 12) * 100 : 0; // 12 módulos totais
    
    // Calcular nível baseado nos pontos
    const level = this.calculateLevel(user.totalPoints);
    
    // Calcular média de pontuação dos quizzes
    const quizScores = user.completedQuizzes.map(q => q.score || 0);
    const averageScore = quizScores.length > 0 
      ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length 
      : 0;
    
    return {
      level,
      progress: Math.round(progress),
      totalModules,
      completedModules: totalModules,
      totalQuizzes,
      averageScore: Math.round(averageScore),
      streak: user.streak,
      totalPoints: user.totalPoints
    };
  }
  
  // Calcular progresso de nível
  static calculateLevelProgress(totalPoints) {
    const levels = {
      aprendiz: { min: 0, max: 999 },
      intermediario: { min: 1000, max: 2999 },
      avancado: { min: 3000, max: Infinity }
    };
    
    let currentLevel = 'aprendiz';
    let nextLevel = 'intermediario';
    
    // Determinar nível atual
    if (totalPoints >= levels.intermediario.min) {
      currentLevel = 'intermediario';
      nextLevel = 'avancado';
    }
    if (totalPoints >= levels.avancado.min) {
      currentLevel = 'avancado';
      nextLevel = null;
    }
    
    // Calcular progresso para o próximo nível
    const currentLevelInfo = levels[currentLevel];
    const nextLevelInfo = nextLevel ? levels[nextLevel] : null;
    
    let percentage = 0;
    if (nextLevelInfo) {
      const range = nextLevelInfo.min - currentLevelInfo.min;
      const progress = totalPoints - currentLevelInfo.min;
      percentage = Math.min(Math.round((progress / range) * 100), 100);
    } else {
      percentage = 100; // Nível máximo
    }
    
    return {
      currentLevel,
      nextLevel,
      percentage,
      pointsToNext: nextLevelInfo ? nextLevelInfo.min - totalPoints : 0
    };
  }
  
  // Calcular nível baseado nos pontos
  static calculateLevel(totalPoints) {
    if (totalPoints < 1000) return 'Iniciante';
    if (totalPoints < 3000) return 'Intermediário';
    return 'Avançado';
  }
  
  // Atualizar progresso semanal
  static async updateWeeklyProgress(userId) {
    const user = await User.findById(userId);
    if (!user) return;
    
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Contar módulos completados na semana
    const weeklyModules = user.completedModules.filter(m => 
      new Date(m.completedAt) > lastWeek
    ).length;
    
    // Contar quizzes completados na semana
    const weeklyQuizzes = user.completedQuizzes.filter(q => 
      new Date(q.completedAt) > lastWeek
    ).length;
    
    // Atualizar progresso semanal
    user.weeklyProgress = weeklyModules + weeklyQuizzes;
    user.lastActivityDate = now;
    
    await user.save();
    
    return {
      weeklyProgress: user.weeklyProgress,
      weeklyGoal: user.weeklyGoal,
      percentage: Math.round((user.weeklyProgress / user.weeklyGoal) * 100)
    };
  }
  
  // Atualizar streak do usuário
  static async updateStreak(userId) {
    const user = await User.findById(userId);
    if (!user) return;
    
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Se o usuário já tem atividade hoje, não precisa atualizar
    if (user.lastActivityDate && 
        user.lastActivityDate.toDateString() === now.toDateString()) {
      return user.streak;
    }
    
    // Se a última atividade foi ontem, incrementar streak
    if (user.lastActivityDate && 
        user.lastActivityDate.toDateString() === yesterday.toDateString()) {
      user.streak += 1;
    } else {
      // Se passou mais de um dia, resetar streak
      user.streak = 1;
    }
    
    user.lastActivityDate = now;
    await user.save();
    
    return user.streak;
  }
}

module.exports = GamificationService;
