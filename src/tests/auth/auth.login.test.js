jest.mock('../../services/email.service');

const jwt = require('jsonwebtoken');
const request = require('supertest');
const {
  registerUser,
  loginUser,
  createUserDirect,
  VALID_REGISTER,
} = require('../helpers/auth.helpers');
const app = require('../../app');

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await registerUser();
  });

  it('autentica com credenciais válidas e retorna JWT', async () => {
    const response = await loginUser();

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();

    const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(decoded.id).toBeDefined();
    expect(response.body.user.email).toBe(VALID_REGISTER.email);
  });

  it('rejeita senha incorreta com mensagem genérica', async () => {
    const response = await loginUser(VALID_REGISTER.email, 'senhaerrada');

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/inválidos/i);
    expect(response.body.token).toBeUndefined();
  });

  it('rejeita usuário inexistente com mensagem genérica', async () => {
    const response = await loginUser('naoexiste@gmail.com', 'senha123');

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/inválidos/i);
  });

  it('não expõe senha ou hash na resposta', async () => {
    const response = await loginUser();
    const body = JSON.stringify(response.body);

    expect(body).not.toContain(VALID_REGISTER.password);
    expect(body).not.toMatch(/\$2a\$/);
  });

  it('rejeita conta desativada', async () => {
    await createUserDirect({ email: 'inativo@gmail.com', isActive: false });

    const response = await loginUser('inativo@gmail.com', 'senha123');

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/desativada/i);
  });
});

describe('POST /api/auth/login — validação', () => {
  it('rejeita payload sem senha', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_REGISTER.email });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
