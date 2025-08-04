const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória']
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: [
      'propriedades-som',
      'escalas-maiores',
      'figuras-musicais',
      'ritmo-ternarios',
      'compasso-simples',
      'andamento-dinamica',
      'solfegio-basico',
      'articulacao-musical',
      'intervalos-musicais',
      'expressao-musical',
      'sincopa-contratempo',
      'compasso-composto'
    ]
  },
  level: {
    type: String,
    enum: ['iniciante', 'intermediario', 'avancado'],
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  content: {
    theory: {
      type: String,
      required: true
    },
    examples: [{
      title: String,
      description: String,
      imageUrl: String,
      audioUrl: String
    }],
    exercises: [{
      title: String,
      description: String,
      type: {
        type: String,
        enum: ['pratica', 'teoria', 'audicao']
      }
    }]
  },
  duration: {
    type: Number, // em minutos
    default: 30
  },
  points: {
    type: Number,
    default: 100
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
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
moduleSchema.index({ category: 1, level: 1 });
moduleSchema.index({ order: 1 });

module.exports = mongoose.model('Module', moduleSchema);