const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const emailConfig = require('../config/email.config');

class EmailService {
  constructor() {
    this.setupTransporter();
  }

  setupTransporter() {
    try {
      console.log('🔧 Configurando Email Service...');
      
      // ✅ PRIORIZAR SENDGRID (API HTTPS - sempre funciona!)
      if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.useSendGrid = true;
        console.log('✅ Email Service configurado para SendGrid (API HTTPS)');
        console.log('📧 Emails serão enviados via SendGrid');
        return;
      }
      
      // Gmail apenas em desenvolvimento, com credenciais no .env
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (!emailUser || !emailPass) {
        this.useSendGrid = false;
        this.transporter = null;
        console.warn('⚠️  Email não configurado (defina SENDGRID_API_KEY ou EMAIL_USER + EMAIL_PASS)');
        return;
      }

      this.useSendGrid = false;
      console.log('⚠️  SendGrid não configurado, usando Gmail (desenvolvimento local)');
      console.log('📧 Usuário:', emailUser);
      console.log('🌐 Host:', 'smtp.gmail.com');
      console.log('🔌 Porta:', 465);
      
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
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
      });
      
      console.log('✅ Gmail Transporter criado (fallback)');
    } catch (error) {
      console.error('❌ Erro ao configurar Email Service:', error);
      throw error;
    }
  }



  /**
   * Enviar email de recuperação de senha
   * @param {string} email - Email do destinatário
   * @param {string} tempPassword - Senha temporária gerada
   * @param {string} userName - Nome do usuário
   */
  async sendPasswordResetEmail(email, tempPassword, userName) {
    try {
      console.log('📤 Iniciando envio de email...');
      console.log('📬 Destinatário:', email);
      console.log('👤 Nome do usuário:', userName);
      
      const emailUser = process.env.EMAIL_USER;

      if (!this.useSendGrid && !this.transporter) {
        throw new Error('Serviço de email não configurado no servidor');
      }

      if (this.useSendGrid && !emailUser) {
        throw new Error('EMAIL_USER é obrigatório para envio via SendGrid');
      }
      
      if (this.useSendGrid) {
        // ✅ USAR SENDGRID (API HTTPS)
        const msg = {
          to: email,
          from: emailUser, // Deve ser verificado no SendGrid
          subject: '🎵 NoteMusic - Recuperação de Senha',
          html: this.generatePasswordResetEmailTemplate(tempPassword, userName)
        };
        
        console.log('📧 Enviando via SendGrid API...');
        await sgMail.send(msg);
        
        console.log('✅ Email enviado com sucesso via SendGrid!');
        console.log('📬 Para:', email);
        console.log('📧 De:', emailUser);
        
        return {
          success: true,
          messageId: 'sendgrid-success',
          previewUrl: null
        };
      } else {
        // Gmail (fallback)
        const mailOptions = {
          from: `"NoteMusic App" <${emailUser}>`,
          to: email,
          subject: '🎵 NoteMusic - Recuperação de Senha',
          html: this.generatePasswordResetEmailTemplate(tempPassword, userName)
        };

        console.log('📧 Opções de email configuradas');
        console.log('🔍 Verificando conexão com Gmail...');
        
        // Verificar conexão antes de enviar
        await this.transporter.verify();
        console.log('✅ Conexão com Gmail verificada com sucesso');
        
        console.log('📤 Enviando email...');
        const info = await this.transporter.sendMail(mailOptions);
        
        console.log('✅ Email enviado com sucesso via Gmail!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📬 Para:', email);

        return {
          success: true,
          messageId: info.messageId,
          previewUrl: null
        };
      }
    } catch (error) {
      console.error('❌ Erro detalhado ao enviar email:');
      console.error('🔍 Tipo de erro:', error.constructor.name);
      console.error('📝 Mensagem:', error.message);
      console.error('🔢 Código:', error.code);
      console.error('📋 Resposta:', error.response);
      console.error('⚡ Comando:', error.command);
      
      throw new Error('Falha no envio do email. Tente novamente mais tarde.');
    }
  }

  /**
   * Template HTML para email de recuperação de senha
   * @param {string} tempPassword - Senha temporária
   * @param {string} userName - Nome do usuário
   */
  generatePasswordResetEmailTemplate(tempPassword, userName) {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha - NoteMusic</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #007AFF 0%, #0A8CD6 100%);
                color: white;
                text-align: center;
                padding: 30px 20px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }
            .content {
                padding: 30px;
            }
            .temp-password {
                background: #f8f9fa;
                border: 2px dashed #007AFF;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }
            .temp-password-text {
                font-size: 24px;
                font-weight: bold;
                color: #007AFF;
                letter-spacing: 2px;
                font-family: 'Courier New', monospace;
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
            .steps {
                background: #e8f5e8;
                border-radius: 6px;
                padding: 20px;
                margin: 20px 0;
            }
            .steps ol {
                margin: 0;
                padding-left: 20px;
            }
            .steps li {
                margin-bottom: 10px;
            }
            .footer {
                background: #f8f9fa;
                text-align: center;
                padding: 20px;
                color: #6c757d;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background: #007AFF;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎵 NoteMusic</h1>
                <p>Recuperação de Senha</p>
            </div>
            
            <div class="content">
                <h2>Olá, ${userName}!</h2>
                
                <p>Recebemos uma solicitação para recuperar a senha da sua conta no NoteMusic. Não se preocupe, geramos uma senha temporária para você!</p>
                
                <div class="temp-password">
                    <p><strong>Sua senha temporária é:</strong></p>
                    <div class="temp-password-text">${tempPassword}</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong> Esta senha é temporária e deve ser alterada imediatamente após o primeiro login por questões de segurança.
                </div>
                
                <div class="steps">
                    <h3>📋 Próximos passos:</h3>
                    <ol>
                        <li>Abra o aplicativo NoteMusic</li>
                        <li>Faça login com seu email e esta senha temporária</li>
                        <li>Você será direcionado automaticamente para alterar sua senha</li>
                        <li>Escolha uma senha nova e segura</li>
                        <li>Continue sua jornada musical! 🎶</li>
                    </ol>
                </div>
                
                <p><strong>Esta senha temporária expira em 24 horas.</strong> Se você não solicitou esta recuperação, ignore este email ou entre em contato conosco.</p>
                
                <p>Continue praticando e explore o mundo da música!</p>
                
                <p>Com carinho,<br>Equipe NoteMusic 🎵</p>
            </div>
            
            <div class="footer">
                <p>Este é um email automático, não responda a esta mensagem.</p>
                <p>© 2024 NoteMusic - Todos os direitos reservados</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Verificar se o serviço de email está funcionando
   */
  async verifyConnection() {
    try {
      if (this.useSendGrid) {
        console.log('✅ SendGrid configurado e pronto para usar');
        return true;
      }
      
      await this.transporter.verify();
      console.log('✅ Serviço de email está funcionando');
      return true;
    } catch (error) {
      console.error('❌ Erro na conexão com o serviço de email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
