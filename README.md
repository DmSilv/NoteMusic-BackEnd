# NoteMusic BackEnd

API **Express + MongoDB/Mongoose** para o app educacional NoteMusic.

## Estrutura do projeto

```
NoteMusic-BackEnd/
├── server.js              # Entry point
├── src/
│   ├── app.js             # Express app, middlewares, rotas
│   ├── config/            # database, email
│   ├── controllers/       # handlers HTTP
│   ├── middlewares/       # auth, cache, errors
│   ├── models/            # user.model, module.model, quiz.model...
│   ├── validators/        # auth, user, quiz, common
│   ├── services/          # email.service, gamification.service
│   └── utils/
├── scripts/
│   ├── seed/
│   │   └── seed.js              # npm run seed
│   ├── maintenance/             # cleanup, backup, usuários dev
│   ├── archive/                 # ~122 scripts one-off arquivados
│   └── backups/                 # JSON de backup (gitignored)
└── docs/                  # documentação operacional
    └── GUIA_LIMPEZA_ARQUITETURA.md
```

## Início rápido

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp env.example .env
# Editar .env: MONGODB_URI, JWT_SECRET, DEV_USER_* (scripts), ADMIN_SECRET (opcional em dev)

# Desenvolvimento
npm run dev

# Health check
curl http://localhost:3333/api/health
```

## Scripts npm

| Comando | Descrição |
|---------|-----------|
| `npm start` | Produção |
| `npm run dev` | Desenvolvimento com nodemon |
| `npm run seed` | Popular banco com dados iniciais |
| `npm run cleanup` | Limpar tentativas de quiz antigas |
| `npm run test:performance` | Teste manual de performance (arquivo em `scripts/archive/`) |

## Rotas principais

| Prefixo | Domínio |
|---------|---------|
| `/api/auth` | Login, registro, senha, reset por código |
| `/api/users` | Perfil do usuário |
| `/api/modules` | Módulos educacionais |
| `/api/quiz` | Quizzes e desafio diário |
| `/api/gamification` | Pontos, achievements, leaderboard |
| `/api/quiz-attempts` | Tentativas de quiz |

## Autenticação e reset de senha

- JWT stateless (`JWT_SECRET`, `JWT_EXPIRES_IN`)
- `POST /api/auth/forgotpassword` — envia código de 6 dígitos (resposta genérica anti-enumeração)
- `POST /api/auth/resetpassword` — redefine senha com e-mail + código + confirmação
- Rate limit: 5 req/h por IP em rotas de reset
- E-mail via `src/services/email.service.js` (SendGrid ou Gmail dev)

Ver `env.example` para `RESET_PASSWORD_EXPIRES_MIN` e `APP_NAME`.

## Documentação

Toda a documentação operacional está em [`docs/`](docs/).

Guia de limpeza e reestruturação (em andamento):

- [`docs/GUIA_LIMPEZA_ARQUITETURA.md`](docs/GUIA_LIMPEZA_ARQUITETURA.md)

## Deploy

Backend em produção no Railway. Variáveis obrigatórias: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_SECRET`, `SENDGRID_API_KEY` (ou email). Ver `env.production.example` e `docs/EXECUTAR_NO_RAILWAY.md`.

## Testes

### Ferramentas

| Pacote | Por quê |
|--------|---------|
| **Jest** | Runner já padrão em projetos Node; compatível com o backend Express |
| **Supertest** | Testa rotas HTTP sem subir servidor manualmente |
| **mongodb-memory-server** | MongoDB em memória — isolado, sem banco de produção |

### Estrutura

```
src/tests/
  setup/env.js, db.js       # env de teste + MongoDB em memória
  helpers/auth.helpers.js   # factories de registro/login
  auth/                     # register, login, rotas protegidas
  password-reset/           # forgot + reset password
  email/                    # EmailService (SendGrid mockado)
src/services/__mocks__/email.service.js
jest.config.js
```

### Comandos

```bash
cd NoteMusic-BackEnd
npm test                 # 33 testes, uma execução
npm run test:watch       # modo contínuo
npm run test:coverage    # cobertura (meta ~55–60% nos arquivos críticos)
```

### Variáveis de ambiente (teste)

Definidas automaticamente em `src/tests/setup/env.js`:

- `NODE_ENV=test`
- `JWT_SECRET` (fake, 32+ chars)
- `EMAIL_USER` (fake)
- **Não** usa `MONGODB_URI` real — memória local via `mongodb-memory-server`
- **Não** envia e-mail — mock de `email.service`

### Fluxos cobertos

- Cadastro, login, rotas protegidas (token ausente/inválido/expirado)
- Forgot password: anti-enumeração, hash do código, invalidação, falha de e-mail
- Reset password: código válido/inválido/expirado, senha antiga inválida após troca
- EmailService: template sem senha em texto, expiração, erros de provedor

### Não coberto (motivo)

- Rate limit HTTP em `forgotpassword` — desabilitado com `NODE_ENV=test` para evitar testes flaky
- Fluxo legado `changetemppassword` — mantido por compatibilidade, baixa prioridade
- Integração real com SendGrid/Gmail — propositalmente mockado
