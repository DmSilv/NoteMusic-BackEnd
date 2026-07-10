jest.mock('../../services/email.service');

const emailService = require('../../services/email.service');

const request = require('supertest');
const AuthService = require('../../services/auth.service');
const {
  registerUser,
  createUserDirect,
  VALID_REGISTER,
} = require('../helpers/auth.helpers');
const app = require('../../app');
const User = require('../../models/user.model');

const GENERIC_MESSAGE =
  'Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.';

describe('POST /api/auth/forgotpassword', () => {
  beforeEach(() => {
    emailService.sendPasswordResetEmail.mockClear();
    emailService.sendPasswordResetEmail.mockResolvedValue({ success: true, messageId: 'mock-email' });
  });

  it('envia e-mail e responde de forma genérica para e-mail cadastrado', async () => {
    await registerUser();

    const response = await request(app)
      .post('/api/auth/forgotpassword')
      .send({ email: VALID_REGISTER.email });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(GENERIC_MESSAGE);
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      VALID_REGISTER.email,
      expect.stringMatching(/^\d{6}$/),
      VALID_REGISTER.name,
      15
    );
  });

  it('responde com mesma mensagem genérica para e-mail não cadastrado', async () => {
    const response = await request(app)
      .post('/api/auth/forgotpassword')
      .send({ email: 'desconhecido@gmail.com' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(GENERIC_MESSAGE);
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('não revela conta desativada — resposta genérica', async () => {
    await createUserDirect({
      email: 'deletado@gmail.com',
      deletionRequested: true,
      isActive: false,
    });

    const response = await request(app)
      .post('/api/auth/forgotpassword')
      .send({ email: 'deletado@gmail.com' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(GENERIC_MESSAGE);
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('armazena hash do código e não a senha em texto', async () => {
    await registerUser();

    await request(app).post('/api/auth/forgotpassword').send({ email: VALID_REGISTER.email });

    const user = await User.findOne({ email: VALID_REGISTER.email }).select(
      '+resetPasswordToken +resetPasswordExpires'
    );

    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordToken).toHaveLength(64);
    expect(user.resetPasswordExpires).toBeInstanceOf(Date);
    expect(user.resetPasswordExpires.getTime()).toBeGreaterThan(Date.now());
  });

  it('invalida código anterior ao solicitar novo reset', async () => {
    await registerUser();
    const codes = [];

    emailService.sendPasswordResetEmail.mockImplementation((_email, code) => {
      codes.push(code);
      return Promise.resolve({ success: true });
    });

    await request(app).post('/api/auth/forgotpassword').send({ email: VALID_REGISTER.email });
    await request(app).post('/api/auth/forgotpassword').send({ email: VALID_REGISTER.email });

    expect(codes).toHaveLength(2);
    expect(codes[0]).not.toBe(codes[1]);

    const user = await User.findOne({ email: VALID_REGISTER.email }).select('+resetPasswordToken');
    expect(user.resetPasswordToken).toBe(AuthService.hashResetToken(codes[1]));
  });

  it('retorna erro seguro quando envio de e-mail falha', async () => {
    await registerUser();
    emailService.sendPasswordResetEmail.mockRejectedValueOnce(new Error('SMTP down'));

    const response = await request(app)
      .post('/api/auth/forgotpassword')
      .send({ email: VALID_REGISTER.email });

    expect(response.status).toBe(503);
    expect(response.body.code).toBe('EMAIL_SEND_FAILED');
    expect(response.body.message).not.toMatch(/smtp|sendgrid|gmail/i);

    const user = await User.findOne({ email: VALID_REGISTER.email }).select('+resetPasswordToken');
    expect(user.resetPasswordToken).toBeUndefined();
  });
});
