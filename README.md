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
│   ├── models/            # schemas Mongoose
│   ├── routes/            # routers por domínio
│   ├── services/          # lógica de negócio (parcial)
│   └── utils/
├── scripts/
│   ├── seed.js            # npm run seed
│   ├── cleanupAttempts.js # npm run cleanup
│   └── archive/           # scripts manuais arquivados
└── docs/                  # documentação operacional
    └── GUIA_LIMPEZA_ARQUITETURA.md
```

## Início rápido

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp env.example .env
# Editar .env com MONGODB_URI, JWT_SECRET, etc.

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

## Rotas principais

| Prefixo | Domínio |
|---------|---------|
| `/api/auth` | Login, registro, senha |
| `/api/users` | Perfil do usuário |
| `/api/modules` | Módulos educacionais |
| `/api/quiz` | Quizzes e desafio diário |
| `/api/gamification` | Pontos, achievements, leaderboard |
| `/api/quiz-attempts` | Tentativas de quiz |

## Documentação

Toda a documentação operacional está em [`docs/`](docs/).

Guia de limpeza e reestruturação (em andamento):

- [`docs/GUIA_LIMPEZA_ARQUITETURA.md`](docs/GUIA_LIMPEZA_ARQUITETURA.md)

## Deploy

Backend em produção no Railway. Ver `docs/EXECUTAR_NO_RAILWAY.md` e `docs/SYNC_DATABASE_TO_PRODUCTION.md`.
