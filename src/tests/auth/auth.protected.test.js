jest.mock('../../services/email.service');

const jwt = require('jsonwebtoken');
const request = require('supertest');
const { registerUser, loginUser, VALID_REGISTER } = require('../helpers/auth.helpers');
const app = require('../../app');
const User = require('../../models/user.model');

describe('Rotas protegidas — GET /api/auth/me', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const { response: reg } = await registerUser();
    userId = reg.body.user.id;
    const login = await loginUser();
    token = login.body.token;
  });

  it('nega acesso sem token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/token/i);
  });

  it('nega acesso com token inválido', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token-invalido');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  it('nega acesso com token expirado', async () => {
    const expiredToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '-1s' });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('SESSION_EXPIRED');
    expect(response.body.message).toMatch(/sessão expirada/i);
  });

  it('permite acesso com token válido', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(VALID_REGISTER.email);
    expect(response.body.user.password).toBeUndefined();
  });

  it('nega acesso quando usuário foi removido', async () => {
    await User.findByIdAndDelete(userId);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });
});
