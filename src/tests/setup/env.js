// Variáveis de ambiente isoladas — nunca usar credenciais ou banco de produção
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_with_at_least_32_chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.RESET_PASSWORD_EXPIRES_MIN = '15';
process.env.APP_NAME = 'NoteMusic';
process.env.EMAIL_USER = 'noreply@test.example.com';
process.env.TRUST_PROXY = '0';
