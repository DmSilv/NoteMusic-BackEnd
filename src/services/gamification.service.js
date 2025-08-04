const { POINTS, USER_LEVELS } = require('../utils/constants');

class GamificationService {
  /**
   * Calcula o nível do usuário baseado nos pontos totais
   */
  static calculateUserLevel(totalPoints) {
    if (totalPoints < 1000) return USER_LEVELS.BEGINNER;
    if (totalPoints < 5000) return USER_LEVELS.INTERMEDIATE;
    return USER_LEVELS.ADVANCED;
  }

  /**
   * Calcula pontos de bônus por streak
   */
  static calculateStreakBonus(streak) {
    if (streak < 3) return 0;
    if (streak < 7) return POINTS.STREAK_BONUS;
    if (streak < 30) return POINTS.STREAK_BONUS * 2;
    return POINTS.STREAK_BONUS * 3;
  }

  /**
   * Verifica se deve resetar o progresso semanal
   */
  static shouldResetWeeklyProgress(lastActivityDate) {
    const lastActivity = new Date(lastActivityDate);
    const now = new Date();
    
    // Calcular início da semana (domingo)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    return lastActivity < weekStart;
  }

  /**
   * Calcula conquistas desbloqueadas
   */
  static checkAchievements(user) {
    const achievements = [];

    // Primeira aula
    if (user.completedModules.length === 1) {
      achievements.push({
        id: 'first_module',
        title: 'Primeira Aula',
        description: 'Complete sua primeira aula',
        icon: 'star',
        points: 50
      });
    }

    // Streak de 7 dias
    if (user.streak === 7) {
      achievements.push({
        id: 'week_streak',
        title: 'Semana Perfeita',
        description: 'Estude por 7 dias seguidos',
        icon: 'fire',
        points: 100
      });
    }

    // Streak de 30 dias
    if (user.streak === 30) {
      achievements.push({
        id: 'month_streak',
        title: 'Mês de Dedicação',
        description: 'Estude por 30 dias seguidos',
        icon: 'trophy',
        points: 500
      });
    }

    // 10 módulos completados
    if (user.completedModules.length === 10) {
      achievements.push({
        id: 'ten_modules',
        title: 'Dezena Musical',
        description: 'Complete 10 módulos',
        icon: 'medal',
        points: 200
      });
    }

    // Primeiro quiz perfeito
    const perfectQuiz = user.completedQuizzes.find(q => q.score === 100);
    if (perfectQuiz && user.completedQuizzes.filter(q => q.score === 100).length === 1) {
      achievements.push({
        id: 'perfect_quiz',
        title: 'Perfeição',
        description: 'Acerte 100% em um quiz',
        icon: 'check-circle',
        points: 150
      });
    }

    // Meta semanal cumprida
    if (user.weeklyProgress >= user.weeklyGoal) {
      achievements.push({
        id: 'weekly_goal',
        title: 'Meta Semanal',
        description: 'Cumpra sua meta semanal',
        icon: 'target',
        points: 75
      });
    }

    return achievements;
  }

  /**
   * Calcula o progresso para o próximo nível
   */
  static calculateLevelProgress(totalPoints) {
    const levels = [
      { name: USER_LEVELS.BEGINNER, minPoints: 0, maxPoints: 1000 },
      { name: USER_LEVELS.INTERMEDIATE, minPoints: 1000, maxPoints: 5000 },
      { name: USER_LEVELS.ADVANCED, minPoints: 5000, maxPoints: Infinity }
    ];

    const currentLevel = this.calculateUserLevel(totalPoints);
    const levelData = levels.find(l => l.name === currentLevel);
    
    if (currentLevel === USER_LEVELS.ADVANCED) {
      return {
        currentLevel,
        nextLevel: null,
        progress: 100,
        pointsToNext: 0
      };
    }

    const nextLevelData = levels[levels.indexOf(levelData) + 1];
    const pointsInLevel = totalPoints - levelData.minPoints;
    const pointsNeeded = nextLevelData.minPoints - levelData.minPoints;
    const progress = (pointsInLevel / pointsNeeded) * 100;

    return {
      currentLevel,
      nextLevel: nextLevelData.name,
      progress: Math.min(progress, 100),
      pointsToNext: nextLevelData.minPoints - totalPoints
    };
  }

  /**
   * Gera desafios personalizados baseados no progresso
   */
  static generatePersonalizedChallenges(user) {
    const challenges = [];

    // Desafio de streak
    if (user.streak < 7) {
      challenges.push({
        id: 'streak_challenge',
        title: 'Mantenha o Ritmo',
        description: `Estude por ${7 - user.streak} dias seguidos para completar uma semana`,
        reward: 100,
        progress: (user.streak / 7) * 100,
        type: 'streak'
      });
    }

    // Desafio de módulos
    const modulesThisWeek = user.completedModules.filter(m => {
      const completedDate = new Date(m.completedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completedDate > weekAgo;
    }).length;

    if (modulesThisWeek < 5) {
      challenges.push({
        id: 'modules_challenge',
        title: 'Explorador Musical',
        description: `Complete ${5 - modulesThisWeek} módulos esta semana`,
        reward: 150,
        progress: (modulesThisWeek / 5) * 100,
        type: 'modules'
      });
    }

    // Desafio de quiz perfeito
    const recentQuizzes = user.completedQuizzes.slice(-5);
    const perfectQuizzes = recentQuizzes.filter(q => q.score === 100).length;
    
    if (perfectQuizzes < 3) {
      challenges.push({
        id: 'perfect_quiz_challenge',
        title: 'Mestre dos Quizzes',
        description: `Acerte 100% em ${3 - perfectQuizzes} quizzes`,
        reward: 200,
        progress: (perfectQuizzes / 3) * 100,
        type: 'quiz'
      });
    }

    return challenges;
  }

  /**
   * Calcula estatísticas detalhadas do usuário
   */
  static calculateUserStats(user) {
    const now = new Date();
    const accountAge = Math.floor((now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    
    // Calcular média de pontos por dia
    const averagePointsPerDay = accountAge > 0 ? user.totalPoints / accountAge : 0;
    
    // Calcular taxa de conclusão de quizzes
    const totalQuizAttempts = user.completedQuizzes.length;
    const passedQuizzes = user.completedQuizzes.filter(q => q.score >= 70).length;
    const quizPassRate = totalQuizAttempts > 0 ? (passedQuizzes / totalQuizAttempts) * 100 : 0;
    
    // Calcular melhor categoria
    const categoryProgress = {};
    user.completedModules.forEach(cm => {
      if (cm.moduleId && cm.moduleId.category) {
        categoryProgress[cm.moduleId.category] = (categoryProgress[cm.moduleId.category] || 0) + 1;
      }
    });
    
    const bestCategory = Object.entries(categoryProgress).sort((a, b) => b[1] - a[1])[0];
    
    return {
      accountAgeDays: accountAge,
      averagePointsPerDay: Math.round(averagePointsPerDay),
      quizPassRate: Math.round(quizPassRate),
      bestCategory: bestCategory ? bestCategory[0] : null,
      totalStudyDays: user.streak,
      longestStreak: user.longestStreak || user.streak,
      levelProgress: this.calculateLevelProgress(user.totalPoints)
    };
  }
}

module.exports = GamificationService;