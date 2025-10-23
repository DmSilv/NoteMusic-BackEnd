/**
 * 📧 Configuração do Serviço de Email - NoteMusic
 * Configurações específicas para Gmail SMTP
 */

module.exports = {
  // Configurações do Gmail
  gmail: {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.EMAIL_USER || 'notemusic.oficial@gmail.com',
      pass: process.env.EMAIL_PASS || 'daniel250900'
    },
    tls: {
      rejectUnauthorized: false
    }
  },

  // Configurações de fallback para desenvolvimento
  development: {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS
    }
  },

  // Configurações de email
  email: {
    from: `"NoteMusic App" <notemusic.oficial@gmail.com>`,
    replyTo: 'notemusic.oficial@gmail.com',
    subject: {
      passwordReset: '🎵 NoteMusic - Recuperação de Senha',
      welcome: '🎵 NoteMusic - Bem-vindo!',
      notification: '🎵 NoteMusic - Notificação'
    }
  },

  // Validações
  validation: {
    requireAuth: true,
    requireTLS: true,
    maxRetries: 3,
    timeout: 10000 // 10 segundos
  },

  // Logs e debugging
  debug: process.env.NODE_ENV === 'development',
  logger: true
};
