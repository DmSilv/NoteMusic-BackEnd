const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    id: String,
    label: String,
    isCorrect: Boolean,
    explanation: String
  }],
  category: String,
  difficulty: {
    type: String,
    enum: ['facil', 'medio', 'dificil'],
    default: 'medio'
  },
  points: {
    type: Number,
    default: 10
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório']
  },
  description: {
    type: String,
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // em segundos
    default: 300 // 5 minutos
  },
  passingScore: {
    type: Number,
    default: 70 // porcentagem
  },
  attempts: {
    type: Number,
    default: 3
  },
  level: {
    type: String,
    enum: ['aprendiz', 'virtuoso', 'maestro'],
    required: true
  },
  type: {
    type: String,
    enum: ['module', 'daily-challenge', 'practice', 'assessment'],
    default: 'module'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Estatísticas
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
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
quizSchema.index({ moduleId: 1 });
quizSchema.index({ level: 1 });

// Método para calcular pontuação total
quizSchema.methods.calculateTotalPoints = function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
};

module.exports = mongoose.model('Quiz', quizSchema);