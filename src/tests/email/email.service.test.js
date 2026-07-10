jest.unmock('../../services/email.service');

describe('EmailService', () => {
  const sgMail = { setApiKey: jest.fn(), send: jest.fn() };
  const sendMail = jest.fn();
  const verify = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    jest.resetModules();
    sgMail.setApiKey.mockReset();
    sgMail.send.mockReset();
    sendMail.mockReset();
    verify.mockReset().mockResolvedValue(true);

    process.env.SENDGRID_API_KEY = 'SG.test_fake_key';
    process.env.EMAIL_USER = 'noreply@test.example.com';
    process.env.APP_NAME = 'NoteMusic';
    delete process.env.EMAIL_PASS;

    jest.doMock('@sendgrid/mail', () => sgMail);
    jest.doMock('nodemailer', () => ({
      createTransport: jest.fn(() => ({ verify, sendMail })),
    }));
  });

  afterEach(() => {
    delete process.env.SENDGRID_API_KEY;
  });

  it('envia e-mail via SendGrid com assunto e destinatário corretos', async () => {
    sgMail.send.mockResolvedValue([{ statusCode: 202 }]);
    const emailService = require('../../services/email.service');

    await emailService.sendPasswordResetEmail(
      'usuario@gmail.com',
      '123456',
      'Maria',
      15
    );

    expect(sgMail.send).toHaveBeenCalledTimes(1);
    const payload = sgMail.send.mock.calls[0][0];
    expect(payload.to).toBe('usuario@gmail.com');
    expect(payload.from).toBe('noreply@test.example.com');
    expect(payload.subject).toContain('NoteMusic');
    expect(payload.subject).toContain('Redefinição');
  });

  it('template contém código, expiração e instruções — sem senha em texto', async () => {
    sgMail.send.mockResolvedValue([{ statusCode: 202 }]);
    const emailService = require('../../services/email.service');

    await emailService.sendPasswordResetEmail(
      'usuario@gmail.com',
      '654321',
      'Maria',
      15
    );

    const html = sgMail.send.mock.calls[0][0].html;
    expect(html).toContain('654321');
    expect(html).toContain('15 minutos');
    expect(html).toContain('não solicitou');
    expect(html).not.toMatch(/senha temporária é/i);
    expect(html).not.toContain('senha123');
    expect(html).not.toMatch(/\$2a\$/);
  });

  it('mapeia falha de rate limit do provedor sem expor detalhes internos', async () => {
    sgMail.send.mockRejectedValue({ response: { statusCode: 429 }, message: 'rate limit' });
    const emailService = require('../../services/email.service');

    await expect(
      emailService.sendPasswordResetEmail('usuario@gmail.com', '111111', 'Maria', 15)
    ).rejects.toThrow(/limite de envio/i);
  });

  it('mapeia timeout sem expor credenciais', async () => {
    sgMail.send.mockRejectedValue({ code: 'ETIMEDOUT', message: 'timeout' });
    const emailService = require('../../services/email.service');

    await expect(
      emailService.sendPasswordResetEmail('usuario@gmail.com', '111111', 'Maria', 15)
    ).rejects.toThrow(/tempo esgotado|tente novamente/i);
  });

  it('usa Brevo (SMTP) em vez do SendGrid quando ambos estão configurados', async () => {
    process.env.BREVO_SMTP_USER = 'meu-login@smtp-brevo.com';
    process.env.BREVO_SMTP_PASS = 'chave-smtp-brevo';
    // SENDGRID_API_KEY continua definida (cenário real: variável antiga
    // esquecida no ambiente de produção) — Brevo deve ter prioridade.

    sendMail.mockResolvedValue({ messageId: 'brevo-message-id' });
    const emailService = require('../../services/email.service');

    expect(emailService.provider).toBe('brevo');
    expect(emailService.useSendGrid).toBe(false);

    await emailService.sendPasswordResetEmail('usuario@gmail.com', '222222', 'Maria', 15);

    expect(sgMail.send).not.toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledTimes(1);
    const mailOptions = sendMail.mock.calls[0][0];
    expect(mailOptions.to).toBe('usuario@gmail.com');
    expect(mailOptions.from).toContain('noreply@test.example.com');

    delete process.env.BREVO_SMTP_USER;
    delete process.env.BREVO_SMTP_PASS;
  });
});
