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
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Métodos
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
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