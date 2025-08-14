const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
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
    enum: ['iniciante', 'intermediario', 'avancado'],
    default: 'iniciante'
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
      ref: 'Quiz'
    },
    score: Number,
    completedAt: {
      type: Date,
      default: Date.now
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

// Índices
userSchema.index({ createdAt: -1 });

// Métodos
userSchema.pre('save', async function(next) {
  // Hash password se foi modificada
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Atualizar nível automaticamente baseado em pontos
  if (this.isModified('totalPoints')) {
    const previousLevel = this.level;
    
    // Calcular novo nível baseado em pontos
    if (this.totalPoints >= 3000) {
      this.level = 'avancado';
    } else if (this.totalPoints >= 1000) {
      this.level = 'intermediario';
    } else {
      this.level = 'iniciante';
    }
    
    // Log se houve mudança de nível
    if (previousLevel !== this.level) {
      console.log(`🎉 Usuário ${this.email} avançou de ${previousLevel} para ${this.level}!`);
    }
  }
  
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActivity = new Date(this.lastActivityDate);
  const diffTime = Math.abs(today - lastActivity);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    this.streak += 1;
  } else if (diffDays > 1) {
    this.streak = 1;
  }
  
  // Verificar se é uma nova semana para resetar o progresso semanal
  const currentWeek = Math.floor(today.getTime() / (7 * 24 * 60 * 60 * 1000));
  const lastWeek = Math.floor(lastActivity.getTime() / (7 * 24 * 60 * 60 * 1000));
  
  if (currentWeek > lastWeek) {
    this.weeklyProgress = 0; // Resetar progresso semanal
  }
  
  this.lastActivityDate = today;
  return this.streak;
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);