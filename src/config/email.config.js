/**
 * Configuração do serviço de email — sem credenciais hardcoded.
 * Use SENDGRID_API_KEY (produção) ou EMAIL_USER + EMAIL_PASS (dev local).
 */

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

module.exports = {
  gmail: emailUser && emailPass ? {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  } : null,

  development: {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
  },

  email: {
    from: emailUser ? `"NoteMusic App" <${emailUser}>` : '"NoteMusic App" <noreply@notemusic.app>',
    replyTo: emailUser || 'noreply@notemusic.app',
    subject: {
      passwordReset: '🎵 NoteMusic - Recuperação de Senha',
      welcome: '🎵 NoteMusic - Bem-vindo!',
      notification: '🎵 NoteMusic - Notificação',
    },
  },

  validation: {
    requireAuth: true,
    requireTLS: true,
    maxRetries: 3,
    timeout: 10000,
  },

  debug: process.env.NODE_ENV === 'development',
  logger: true,
};
