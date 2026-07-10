jest.unmock('../../services/email.service');

describe('EmailService', () => {
  const sgMail = { setApiKey: jest.fn(), send: jest.fn() };
  const sendMail = jest.fn();
  const verify = jest.fn().mockResolvedValue(true);
  const axiosPost = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    sgMail.setApiKey.mockReset();
    sgMail.send.mockReset();
    sendMail.mockReset();
    verify.mockReset().mockResolvedValue(true);
    axiosPost.mockReset();

    process.env.SENDGRID_API_KEY = 'SG.test_fake_key';
    process.env.EMAIL_USER = 'noreply@test.example.com';
    process.env.APP_NAME = 'NoteMusic';
    delete process.env.EMAIL_PASS;
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_SMTP_USER;
    delete process.env.BREVO_SMTP_PASS;

    jest.doMock('@sendgrid/mail', () => sgMail);
    jest.doMock('nodemailer', () => ({
      createTransport: jest.fn(() => ({ verify, sendMail })),
    }));
    jest.doMock('axios', () => ({ post: axiosPost }));
  });

  afterEach(() => {
    delete process.env.SENDGRID_API_KEY;
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_SMTP_USER;
    delete process.env.BREVO_SMTP_PASS;
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

  it('usa Brevo API em vez do SendGrid e do Brevo SMTP quando BREVO_API_KEY está configurada', async () => {
    process.env.BREVO_API_KEY = 'xkeysib-fake-key';
    process.env.BREVO_SMTP_USER = 'meu-login@smtp-brevo.com';
    process.env.BREVO_SMTP_PASS = 'chave-smtp-brevo';
    // SENDGRID_API_KEY continua definida (cenário real: variável antiga
    // esquecida no ambiente de produção) — Brevo API deve ter prioridade
    // máxima, pois funciona via HTTPS em qualquer plano do Railway.

    axiosPost.mockResolvedValue({ data: { messageId: 'brevo-api-message-id' } });
    const emailService = require('../../services/email.service');

    expect(emailService.provider).toBe('brevo-api');
    expect(emailService.useSendGrid).toBe(false);

    await emailService.sendPasswordResetEmail('usuario@gmail.com', '222222', 'Maria', 15);

    expect(sgMail.send).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
    expect(axiosPost).toHaveBeenCalledTimes(1);
    const [url, body, config] = axiosPost.mock.calls[0];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(body.to).toEqual([{ email: 'usuario@gmail.com', name: 'Maria' }]);
    expect(body.sender.email).toBe('noreply@test.example.com');
    expect(config.headers['api-key']).toBe('xkeysib-fake-key');
  });

  it('usa SendGrid quando não há Brevo API key, mesmo com Brevo SMTP configurado', async () => {
    process.env.BREVO_SMTP_USER = 'meu-login@smtp-brevo.com';
    process.env.BREVO_SMTP_PASS = 'chave-smtp-brevo';
    // Sem BREVO_API_KEY: SendGrid (HTTPS) deve ter prioridade sobre o SMTP
    // do Brevo, já que SMTP costuma travar em timeout no Railway.

    sgMail.send.mockResolvedValue([{ statusCode: 202 }]);
    const emailService = require('../../services/email.service');

    expect(emailService.provider).toBe('sendgrid');
    expect(emailService.useSendGrid).toBe(true);

    await emailService.sendPasswordResetEmail('usuario@gmail.com', '333333', 'Maria', 15);

    expect(sgMail.send).toHaveBeenCalledTimes(1);
    expect(sendMail).not.toHaveBeenCalled();
    expect(axiosPost).not.toHaveBeenCalled();
  });

  it('mapeia timeout da API do Brevo sem expor credenciais', async () => {
    process.env.BREVO_API_KEY = 'xkeysib-fake-key';
    axiosPost.mockRejectedValue({ code: 'ECONNABORTED', message: 'timeout of 10000ms exceeded' });
    const emailService = require('../../services/email.service');

    await expect(
      emailService.sendPasswordResetEmail('usuario@gmail.com', '444444', 'Maria', 15)
    ).rejects.toThrow(/tempo esgotado/i);
  });
});
