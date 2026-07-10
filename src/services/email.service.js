const axios = require('axios');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const emailConfig = require('../config/email.config');

const APP_NAME = process.env.APP_NAME || 'NoteMusic';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

class EmailService {
  constructor() {
    this.setupTransporter();
  }

  setupTransporter() {
    try {
      this.useSendGrid = false;
      this.transporter = null;
      this.provider = null;
      this.brevoApiKey = null;

      // 1) Brevo via API HTTPS — prioridade máxima. Diferente do SMTP, a API
      //    HTTPS funciona em QUALQUER plano do Railway (Free/Trial/Hobby/Pro),
      //    já que o Railway bloqueia apenas as portas SMTP (25/465/587) nos
      //    planos abaixo de Pro, não requisições HTTPS.
      //    Gerar a chave em: Brevo > Configurações > SMTP & API > aba "API Keys".
      if (process.env.BREVO_API_KEY) {
        this.provider = 'brevo-api';
        this.brevoApiKey = process.env.BREVO_API_KEY;
        return;
      }

      // 2) SendGrid — também via API HTTPS (não é bloqueado pelo Railway).
      //    Mantido por compatibilidade, mas o plano trial grátis perde os
      //    créditos diários após ~60 dias (vira 0/dia, envio falha com
      //    "Maximum credits exceeded").
      if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.useSendGrid = true;
        this.provider = 'sendgrid';
        return;
      }

      // 3) Brevo via SMTP relay — só funciona se a porta SMTP estiver
      //    liberada (ambiente local, ou Railway no plano Pro+). Em
      //    Free/Trial/Hobby do Railway a conexão trava em timeout.
      const brevoUser = process.env.BREVO_SMTP_USER;
      const brevoPass = process.env.BREVO_SMTP_PASS;
      if (brevoUser && brevoPass) {
        this.provider = 'brevo-smtp';
        this.transporter = nodemailer.createTransport({
          host: 'smtp-relay.brevo.com',
          port: 587,
          secure: false,
          auth: {
            user: brevoUser,
            pass: brevoPass
          },
          connectionTimeout: emailConfig.validation.timeout,
          greetingTimeout: emailConfig.validation.timeout,
          socketTimeout: emailConfig.validation.timeout
        });
        return;
      }

      // 4) Gmail SMTP direto — bom para volume baixo (uso pessoal/testes),
      //    com a mesma limitação de porta SMTP citada acima.
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (!emailUser || !emailPass) {
        console.warn(
          'Email não configurado (defina BREVO_API_KEY, ou SENDGRID_API_KEY, ou BREVO_SMTP_USER + BREVO_SMTP_PASS, ou EMAIL_USER + EMAIL_PASS)'
        );
        return;
      }

      this.provider = 'gmail';
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: emailUser,
          pass: emailPass
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
        connectionTimeout: emailConfig.validation.timeout,
        greetingTimeout: emailConfig.validation.timeout,
        socketTimeout: emailConfig.validation.timeout
      });
    } catch (error) {
      console.error('Erro ao configurar Email Service:', error.message);
      throw error;
    }
  }

  getFromAddress() {
    const emailUser = process.env.EMAIL_USER || process.env.BREVO_SMTP_USER;
    if (!emailUser) {
      throw new Error('EMAIL_USER é obrigatório para envio de e-mails (defina o remetente verificado)');
    }
    return emailUser;
  }

  assertConfigured() {
    if (!this.useSendGrid && !this.brevoApiKey && !this.transporter) {
      throw new Error('Serviço de email não configurado no servidor');
    }
  }

  mapProviderError(error) {
    const statusCode = error?.response?.statusCode || error?.response?.status || error?.code;
    const message = (error?.message || '').toLowerCase();

    if (statusCode === 429 || message.includes('rate limit')) {
      return new Error('Limite de envio de e-mails atingido. Tente novamente mais tarde.');
    }

    if (
      error?.code === 'ETIMEDOUT' ||
      error?.code === 'ESOCKET' ||
      error?.code === 'ECONNABORTED' ||
      message.includes('timeout')
    ) {
      return new Error('Tempo esgotado ao conectar ao serviço de e-mail.');
    }

    return new Error('Falha no envio do e-mail. Tente novamente mais tarde.');
  }

  /**
   * Envia via API HTTPS do Brevo (não usa SMTP, funciona em qualquer plano do Railway).
   */
  async sendViaBrevoApi({ to, name, subject, html, from }) {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: { name: APP_NAME, email: from },
        to: [{ email: to, name: name || undefined }],
        subject,
        htmlContent: html
      },
      {
        headers: {
          'api-key': this.brevoApiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        timeout: emailConfig.validation.timeout
      }
    );

    return { success: true, messageId: response.data?.messageId || 'brevo-api-success' };
  }

  /**
   * Envia e-mail com código de redefinição de senha (nunca envia a senha em texto).
   */
  async sendPasswordResetEmail(email, resetCode, userName, expiresInMinutes = 15) {
    this.assertConfigured();

    const from = this.getFromAddress();
    const subject = `${APP_NAME} — Redefinição de senha`;
    const html = this.generatePasswordResetEmailTemplate(resetCode, userName, expiresInMinutes);

    try {
      if (this.provider === 'brevo-api') {
        return await this.sendViaBrevoApi({ to: email, name: userName, subject, html, from });
      }

      if (this.useSendGrid) {
        await sgMail.send({
          to: email,
          from,
          subject,
          html
        });

        return { success: true, messageId: 'sendgrid-success' };
      }

      const mailOptions = {
        from: `"${APP_NAME}" <${from}>`,
        to: email,
        subject,
        html
      };

      await this.transporter.verify();
      const info = await this.transporter.sendMail(mailOptions);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Erro ao enviar e-mail de recuperação:', error.message);
      throw this.mapProviderError(error);
    }
  }

  generatePasswordResetEmailTemplate(resetCode, userName, expiresInMinutes) {
    const safeName = userName || 'usuário';
    const year = new Date().getFullYear();

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinição de senha — ${APP_NAME}</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f2937; background: #f3f4f6; margin: 0; padding: 24px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #007AFF; color: #ffffff; padding: 24px; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 24px; }
        .code-box { background: #f8fafc; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #007AFF; font-family: 'Courier New', monospace; }
        .note { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #92400e; }
        .footer { padding: 16px 24px 24px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${APP_NAME}</h1>
          <p style="margin: 8px 0 0;">Redefinição de senha</p>
        </div>
        <div class="content">
          <p>Olá, ${safeName}.</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo no aplicativo ${APP_NAME}:</p>
          <div class="code-box">
            <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">Seu código de verificação</p>
            <div class="code">${resetCode}</div>
          </div>
          <p><strong>Este código expira em ${expiresInMinutes} minutos.</strong></p>
          <div class="note">
            Se você não solicitou esta redefinição, ignore este e-mail. Sua senha permanecerá inalterada.
          </div>
          <p>Atenciosamente,<br>Equipe ${APP_NAME}</p>
        </div>
        <div class="footer">
          <p>Este é um e-mail automático. Por favor, não responda.</p>
          <p>© ${year} ${APP_NAME}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  async verifyConnection() {
    try {
      if (this.provider === 'brevo-api' || this.useSendGrid) {
        return true;
      }

      if (!this.transporter) {
        return false;
      }

      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Erro na conexão com o serviço de email:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
