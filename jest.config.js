/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/src/tests/setup/env.js'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup/db.js'],
  testMatch: ['<rootDir>/src/tests/**/*.test.js'],
  clearMocks: true,
  restoreMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/services/auth.service.js',
    'src/services/email.service.js',
    'src/middlewares/auth.js',
    'src/controllers/auth.controller.js',
  ],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 55,
      lines: 55,
      statements: 55,
    },
  },
};
