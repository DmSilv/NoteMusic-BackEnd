const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user.model');

const VALID_REGISTER = {
  name: 'Maria',
  email: 'mariaauth@gmail.com',
  password: 'senha123',
};

async function registerUser(overrides = {}) {
  const payload = { ...VALID_REGISTER, ...overrides };
  const response = await request(app).post('/api/auth/register').send(payload);
  return { response, payload };
}

async function createUserDirect(overrides = {}) {
  return User.create({
    name: 'Direct',
    email: 'direct@gmail.com',
    password: 'senha123',
    ...overrides,
  });
}

async function loginUser(email = VALID_REGISTER.email, password = VALID_REGISTER.password) {
  return request(app).post('/api/auth/login').send({ email, password });
}

module.exports = {
  app,
  request,
  VALID_REGISTER,
  registerUser,
  createUserDirect,
  loginUser,
};
