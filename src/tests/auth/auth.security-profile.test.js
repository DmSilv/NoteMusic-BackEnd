const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user.model');
const { registerUser } = require('../helpers/auth.helpers');

describe('Segurança — updateProfile e mass assignment', () => {
  it('hasheia a nova senha com bcrypt ao atualizar o perfil (não plaintext)', async () => {
    const email = `hash-profile-${Date.now()}@gmail.com`;
    const { response: reg } = await registerUser({
      name: 'Hasher',
      email,
      password: 'senhaAntiga1',
    });

    expect([200, 201]).toContain(reg.status);
    const token = reg.body.token;

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'senhaAntiga1',
        newPassword: 'senhaNovaSegura2',
      });

    expect(res.status).toBe(200);

    const stored = await User.findOne({ email }).select('+password');
    expect(stored.password).toMatch(/^\$2[aby]\$/);
    expect(stored.password).not.toBe('senhaNovaSegura2');

    const login = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password: 'senhaNovaSegura2',
      });
    expect(login.status).toBe(200);
  });

  it('ignora level enviado no registro (sempre aprendiz)', async () => {
    const email = `level-reg-${Date.now()}@gmail.com`;
    const res = await request(app).post('/api/auth/register').send({
      name: 'Tester',
      email,
      password: 'senha123',
      level: 'maestro',
    });

    expect([200, 201]).toContain(res.status);

    const stored = await User.findOne({ email });
    expect(stored.level).toBe('aprendiz');
  });

  it('ignora level enviado no update de perfil', async () => {
    const email = `level-upd-${Date.now()}@gmail.com`;
    const { response: reg } = await registerUser({
      name: 'Leveler',
      email,
      password: 'senha1234',
    });

    expect([200, 201]).toContain(reg.status);
    const token = reg.body.token;

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ level: 'maestro', name: 'Leveler' });

    expect(res.status).toBe(200);
    const stored = await User.findOne({ email });
    expect(stored.level).toBe('aprendiz');
  });
});
