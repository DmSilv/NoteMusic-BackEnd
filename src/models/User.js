const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [15, 'Nome deve ter no máximo 15 caracteres (apenas primeiro nome)'],
    minlength: [2, 'Nome deve ter no mínimo 2 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    select: false
  },
  tempPassword: {
    type: Boolean,
    default: false
  },
  tempPasswordCreatedAt: {
    type: Date
  },
  level: {
    type: String,
    enum: ['aprendiz', 'virtuoso', 'maestro'],
    default: 'aprendiz'
  },
  // Gamificação
  streak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  weeklyGoal: {
    type: Number,
    default: 5
  },
  weeklyProgress: {
    type: Number,
    default: 0
  },
  // Progresso
  completedModules: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedQuizzes: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: false // Permitir null para desafios diários
    },
    score: Number,
    percentage: Number,
    passed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    isDailyChallenge: {
      type: Boolean,
      default: false
    }
  }],
  quizAttempts: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    attempts: {
      type: Number,
      default: 0
    },
    lastAttempt: {
      type: Date,
      default: Date.now
    },
    cooldownUntil: {
      type: Date
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    blockedAt: {
      type: Date
    }
  }],
  // Configurações
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Sistema de exclusão de conta
  deletionRequested: {
    type: Boolean,
    default: false
  },
  deletionRequestedAt: {
    type: Date
  },
  deletionScheduledFor: {
    type: Date
  },
  deletionReason: {
    type: String,
    maxlength: [500, 'Motivo deve ter no máximo 500 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para otimização de performance
userSchema.index({ createdAt: -1 });
userSchema.index({ email: 1 }); // Índice único já existe, mas garantindo
userSchema.index({ isActive: 1, totalPoints: -1 }); // Para leaderboards
userSchema.index({ isActive: 1, streak: -1 }); // Para leaderboards de streak
userSchema.index({ lastActivityDate: -1 }); // Para queries de atividade recente
userSchema.index({ 'completedModules.moduleId': 1 }); // Para queries de módulos completados
userSchema.index({ 'completedQuizzes.quizId': 1 }); // Para queries de quizzes completados

// Métodos
userSchema.pre('save', async function(next) {
  // Hash password se foi modificada e não está já hasheada
  if (this.isModified('password') && !this.password.startsWith('$2a$')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Atualizar nível automaticamente baseado em MÓDULOS COMPLETOS (não pontos)
  if (this.isModified('completedModules')) {
    const previousLevel = this.level;
    
    // Calcular novo nível baseado APENAS em módulos completos
    // PROGRESSÃO DINÂMICA POR MÓDULOS (75% do total):
    // - Aprendiz: 0-15 módulos
    // - Virtuoso: 16-31 módulos  
    // - Maestro: 32+ módulos
    const completedModulesCount = this.completedModules?.length || 0;
    
    if (completedModulesCount >= 32) {
      this.level = 'maestro';
    } else if (completedModulesCount >= 16) {
      this.level = 'virtuoso';
    } else {
      this.level = 'aprendiz';
    }
    
    console.log(`📊 Progressão de nível: ${completedModulesCount} módulos completos → Nível: ${this.level}`);
    
    // Log se houve mudança de nível
    if (previousLevel !== this.level) {
      console.log(`🎉 Usuário ${this.email} avançou de ${previousLevel} para ${this.level}! (${completedModulesCount} módulos completos)`);
    }
  }
  
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para solicitar exclusão de conta
userSchema.methods.requestAccountDeletion = function(reason = '') {
  this.deletionRequested = true;
  this.deletionRequestedAt = new Date();
  this.deletionScheduledFor = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
  this.deletionReason = reason;
  this.isActive = false; // Desativar conta imediatamente
  return this.save();
};

// Método para cancelar exclusão de conta
userSchema.methods.cancelAccountDeletion = function() {
  this.deletionRequested = false;
  this.deletionRequestedAt = null;
  this.deletionScheduledFor = null;
  this.deletionReason = '';
  this.isActive = true; // Reativar conta
  return this.save();
};

// Método para verificar se conta está marcada para exclusão
userSchema.methods.isMarkedForDeletion = function() {
  return this.deletionRequested && this.deletionScheduledFor && new Date() < this.deletionScheduledFor;
};

// Método para verificar se conta deve ser excluída (período expirado)
userSchema.methods.shouldBeDeleted = function() {
  return this.deletionRequested && this.deletionScheduledFor && new Date() >= this.deletionScheduledFor;
};

userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActivity = new Date(this.lastActivityDate);
  
  // Garantir que estamos comparando apenas as DATAS (sem hora)
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastActivityDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
  
  // Calcular diferença em DIAS (não em horas)
  const diffDays = Math.floor((todayDate - lastActivityDate) / (1000 * 60 * 60 * 24));
  
  console.log(`📅 Calculando streak: hoje=${todayDate.toISOString()}, última=${lastActivityDate.toISOString()}, diff=${diffDays} dias`);
  
  // Se é o mesmo dia, não incrementar streak nem atualizar lastActivityDate (evita acumular)
  if (diffDays === 0) {
    console.log('📅 Mesmo dia - streak mantido:', this.streak);
    return this.streak;
  }
  
  // Se passou 1 dia (consecutivo), incrementar streak
  if (diffDays === 1) {
    this.streak += 1;
    this.lastActivityDate = todayDate; // Registrar que entrou HOJE
    console.log('✅ Dia consecutivo - streak incrementado para:', this.streak);
    console.log('✅ Registrado que usuário entrou hoje:', todayDate.toISOString());
  } 
  // Se passou mais de 1 dia, resetar streak para 1
  else if (diffDays > 1) {
    this.streak = 1;
    this.lastActivityDate = todayDate; // Registrar que entrou HOJE
    console.log('⚠️ Quebrou sequência - streak resetado para 1');
    console.log('✅ Registrado que usuário entrou hoje:', todayDate.toISOString());
  }
  
  // Verificar se é uma nova semana para resetar o progresso semanal
  const currentWeek = Math.floor(today.getTime() / (7 * 24 * 60 * 60 * 1000));
  const lastWeek = Math.floor(lastActivity.getTime() / (7 * 24 * 60 * 60 * 1000));
  
  if (currentWeek > lastWeek) {
    this.weeklyProgress = 0; // Resetar progresso semanal
  }
  
  return this.streak;
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);