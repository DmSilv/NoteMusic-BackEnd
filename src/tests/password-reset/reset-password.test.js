jest.mock('../../services/email.service');

const emailService = require('../../services/email.service');

const request = require('supertest');
const AuthService = require('../../services/auth.service');
const {
  registerUser,
  loginUser,
  VALID_REGISTER,
} = require('../helpers/auth.helpers');
const app = require('../../app');
const User = require('../../models/user.model');

describe('POST /api/auth/resetpassword', () => {
  let resetCode;

  beforeEach(async () => {
    emailService.sendPasswordResetEmail.mockImplementation((_email, code) => {
      resetCode = code;
      return Promise.resolve({ success: true });
    });

    await registerUser();
    await request(app).post('/api/auth/forgotpassword').send({ email: VALID_REGISTER.email });
  });

  it('redefine senha com código válido', async () => {
    const response = await request(app).post('/api/auth/resetpassword').send({
      email: VALID_REGISTER.email,
      resetCode,
      newPassword: 'novaSenha1',
      confirmPassword: 'novaSenha1',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(JSON.stringify(response.body)).not.toContain('novaSenha1');

    const loginOld = await loginUser(VALID_REGISTER.email, VALID_REGISTER.password);
    expect(loginOld.status).toBe(401);

    const loginNew = await loginUser(VALID_REGISTER.email, 'novaSenha1');
    expect(loginNew.status).toBe(200);
  });

  it('invalida código após uso', async () => {
    await request(app).post('/api/auth/resetpassword').send({
      email: VALID_REGISTER.email,
      resetCode,
      newPassword: 'novaSenha1',
      confirmPassword: 'novaSenha1',
    });

    const secondAttempt = await request(app).post('/api/auth/resetpassword').send({
      email: VALID_REGISTER.email,
      resetCode,
      newPassword: 'outraSenha2',
      confirmPassword: 'outraSenha2',
    });

    expect(secondAttempt.status).toBe(400);
    expect(secondAttempt.body.code).toBe('INVALID_RESET_TOKEN');
  });

  it('rejeita código inválido', async () => {
    const response = await request(app).post('/api/auth/resetpassword').send({
      email: VALID_REGISTER.email,
      resetCode: '000000',
      newPassword: 'novaSenha1',
      confirmPassword: 'novaSenha1',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_RESET_TOKEN');
  });

  it('rejeita código expirado', async () => {
    const user = await User.findOne({ email: VALID_REGISTER.email }).select(
      '+resetPasswordExpires +resetPasswordToken'
    );
    user.resetPasswordExpires = new Date(Date.now() - 60_000);
    await user.save({ validateBeforeSave: false });

    const response = await request(app).post('/api/auth/resetpassword').send({
      email: VALID_REGISTER.email,
      resetCode,
      newPassword: 'novaSenha1',
      confirmPassword: 'novaSenha1',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('RESET_TOKEN_EXPIRED');
  });

  it('rejeita senha vazia e confirmação divergente', async () => {
    const empty = await request(app).post('/api/auth/resetpassword').send({
      email: VALID_REGISTER.email,
      resetCode,
      newPassword: '',
      confirmPassword: '',
    });
    expect(empty.status).toBe(400);

    const mismatch = await request(app).post('/api/auth/resetpassword').send({
      email: VALID_REGISTER.email,
      resetCode,
      newPassword: 'novaSenha1',
      confirmPassword: 'outraSenha',
    });
    expect(mismatch.status).toBe(400);
    expect(
      mismatch.body.code === 'PASSWORDS_DONT_MATCH' ||
        mismatch.body.errors?.some((e) => /confere/i.test(e.msg))
    ).toBe(true);
  });

  it('rejeita senha com menos de 6 caracteres', async () => {
    const response = await request(app).post('/api/auth/resetpassword').send({
      email: VALID_REGISTER.email,
      resetCode,
      newPassword: '123',
      confirmPassword: '123',
    });

    expect(response.status).toBe(400);
  });

  it('gera código de 6 dígitos com hash SHA-256', () => {
    const code = AuthService.generateResetCode();
    expect(code).toMatch(/^\d{6}$/);

    const hash = AuthService.hashResetToken(code);
    expect(hash).toHaveLength(64);
    expect(hash).not.toBe(code);
  });
});
