jest.mock('../../services/email.service');

const request = require('supertest');
const { registerUser, VALID_REGISTER } = require('../helpers/auth.helpers');
const app = require('../../app');

describe('POST /api/auth/register', () => {
  it('cadastra usuário com dados válidos e retorna token', async () => {
    const { response } = await registerUser();

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(VALID_REGISTER.email);
    expect(response.body.user.name).toBe(VALID_REGISTER.name);
    expect(response.body.password).toBeUndefined();
    expect(response.body.user.password).toBeUndefined();
  });

  it('rejeita cadastro sem campos obrigatórios', async () => {
    const response = await request(app).post('/api/auth/register').send({ email: 'x@gmail.com' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it('rejeita e-mail inválido', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_REGISTER, email: 'email-invalido' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('rejeita e-mail já cadastrado', async () => {
    await registerUser();
    const { response } = await registerUser();

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/já está cadastrado/i);
  });

  it('não expõe senha ou hash na resposta', async () => {
    const { response } = await registerUser();
    const body = JSON.stringify(response.body);

    expect(body).not.toContain(VALID_REGISTER.password);
    expect(body).not.toMatch(/\$2a\$/);
  });
});
