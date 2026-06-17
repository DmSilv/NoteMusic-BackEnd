# Guia de Limpeza e Arquitetura — NoteMusic BackEnd

> Documento vivo. Atualizar este arquivo ao concluir cada tarefa ou fase.
>
> **Última atualização:** 17/06/2025  
> **Fase atual:** Fase 5 ✅ — próxima: Fase 6

---

## Visão geral

O NoteMusic-BackEnd é uma API **Express + MongoDB/Mongoose** para o app educacional de música.

**Fluxo principal da API:**

```
Auth (login/register) → Users/Profile → Modules → Quiz → Gamification
```

**Núcleo da aplicação hoje:**

```
server.js → src/app.js → routes → controllers → models
                              ↘ services (parcial)
                              ↘ middlewares (auth, cache, errors)
```

**Problemas identificados (resumo):**

| Área | Situação |
|------|----------|
| `src/` | 34 arquivos — estrutura razoável, mas controllers muito grandes |
| `scripts/` | ~120 scripts ad-hoc (debug, fix pontual, duplicatas PT/EN) |
| Raiz | 29 arquivos `.md` + 5 scripts de teste soltos |
| Segurança | Credenciais hardcoded em scripts e configs de email |
| Testes | Nenhum framework automatizado (`npm test` falha de propósito) |
| Arquitetura | Camada `services/` incompleta; lógica espalhada nos controllers |

**Princípio deste guia:** igual ao frontend — **uma fase por vez**, commits pequenos, validar após cada etapa, risco crescente conforme avançamos.

---

## Progresso das fases

| Fase | Descrição | Risco | Status | Concluída em |
|------|-----------|-------|--------|--------------|
| 1 | Organização sem impacto no runtime | 🟢 Zero | ✅ Concluída | 17/06/2025 |
| 2 | Remover código morto em `src/` | 🟢 Baixo | ✅ Concluída | 17/06/2025 |
| 3 | Corrigir bugs de rotas e validações | 🟡 Baixo-médio | ✅ Concluída | 17/06/2025 |
| 4 | Limpar e categorizar `scripts/` | 🟡 Médio | ✅ Concluída | 17/06/2025 |
| 5 | Segurança: secrets e endpoints | 🟠 Médio-alto | ✅ Concluída (5A+5B) | 17/06/2025 |
| 6 | Padronizar naming e validators | 🟡 Médio | ⬜ Pendente | — |
| 7 | Extrair services dos fat controllers | 🟠 Alto | ⬜ Pendente | — |
| 8 | Dependências e config centralizada | 🟡 Médio | ⬜ Pendente | — |
| 9 | Testes automatizados (Jest + Supertest) | 🔴 Alto | ⬜ Pendente | — |
| 10 | Arquitetura final e migrations | 🔴 Muito alto | ⬜ Pendente | — |

**Legenda:** ⬜ Pendente · 🔄 Em andamento · ✅ Concluída

---

## Arquitetura atual

```
NoteMusic-BackEnd/
├── server.js
├── package.json
├── env.example / env.production.example
├── sync-production-database.js      → movido para scripts/archive/
├── check-user.js                    → movido para scripts/archive/
├── test-*.js (5 arquivos)           → movidos para scripts/archive/
├── *.md                             → movidos para docs/ (só README.md na raiz)
│
├── scripts/                         ~120 scripts ad-hoc
│   ├── seed.js, cleanupAttempts.js  ← únicos no package.json
│   ├── fix*.js, debug*.js, test*.js
│   └── backups/*.json               ⚠️ possível PII
│
└── src/                             34 arquivos
    ├── app.js
    ├── config/          database.js, email.config.js
    ├── controllers/     9 arquivos (2 órfãos/backup)
    ├── middlewares/     auth, cache, errorHandler, tempPasswordCheck
    ├── models/          User, Module, Quiz, quizAttempt.model.js
    ├── routes/          6 routers
    ├── services/        emailService, gamification.service (parcial)
    └── utils/           constants, seedData, gamificationRebalanced...
```

### Mapa de rotas

| Prefixo | Arquivo | Controller |
|---------|---------|------------|
| `/api/auth` | `auth.routes.js` | `auth`, `accountDeletion` |
| `/api/users` | `user.routes.js` | `user` |
| `/api/modules` | `module.routes.js` | `module` |
| `/api/quiz` | `quiz.routes.js` | `quiz` (~1350 linhas) |
| `/api/gamification` | `gamification.routes.js` | `gamification` (~600 linhas) |
| `/api/quiz-attempts` | `quizAttempt.routes.js` | `quizAttempt` |
| Inline | `app.js` | health, cache admin |

### Controllers grandes (alvo da Fase 7)

| Arquivo | Linhas aprox. | Responsabilidades misturadas |
|---------|---------------|------------------------------|
| `quiz.controller.js` | ~1350 | CRUD quiz, submit, validação, daily challenge, stats |
| `gamification.controller.js` | ~600 | achievements, leaderboard, streak, stats |
| `module.controller.js` | ~500+ | módulos, categorias, conclusão, cache |

---

## Arquitetura alvo (implementar gradualmente)

```
NoteMusic-BackEnd/
├── server.js
├── package.json
├── .env.example                     # só placeholders seguros
│
├── docs/                            # toda documentação
│   └── GUIA_LIMPEZA_ARQUITETURA.md
│
├── scripts/
│   ├── seed/
│   │   └── seed.js
│   ├── maintenance/
│   │   ├── cleanupAttempts.js
│   │   └── createMasterUser.js
│   └── archive/                     # one-offs históricos (ou deletar)
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
└── src/
    ├── app.js
    ├── config/
    │   ├── index.js                 # validação centralizada de env
    │   ├── database.js
    │   └── email.js
    ├── routes/                      # só wiring de rotas
    ├── controllers/                 # finos — delegam para services
    ├── services/
    │   ├── auth.service.js
    │   ├── user.service.js
    │   ├── module.service.js
    │   ├── quiz.service.js
    │   ├── quizAttempt.service.js
    │   ├── gamification.service.js
    │   └── email.service.js
    ├── models/                      # naming uniforme: *.model.js
    ├── middlewares/
    ├── validators/                  # schemas express-validator reutilizáveis
    └── utils/                       # helpers puros sem lógica de negócio
```

**Regra de ouro:** `routes → controllers (finos) → services → models`. Controllers não acessam `mongoose` diretamente após a Fase 7.

---

## Regras de segurança do processo

1. **Uma fase por vez** — não misturar limpeza de scripts com refactor de controllers.
2. **Antes de apagar:** `grep -r "nomeDoArquivo" .` em todo o projeto.
3. **Após cada fase:** rodar validação (seção abaixo).
4. **Commits pequenos** — um commit por fase facilita reverter.
5. **Nunca commitar** `.env`, backups com PII, senhas ou URIs de produção.
6. **Produção (Railway):** fases 5 e 7 exigem deploy controlado e smoke test pós-deploy.
7. **Scripts de mutação de DB** (`resetDatabase`, `forceCleanAndRepopulate`) — só rodar em ambiente local, nunca em produção sem backup.

### Validação padrão (repetir após cada fase)

```bash
# Subir servidor
npm run dev

# Health check
curl http://localhost:3333/api/health

# Login (usar credenciais de teste locais)
# PowerShell:
$body = '{"email":"SEU_EMAIL","password":"SUA_SENHA"}'
Invoke-WebRequest -Uri "http://localhost:3333/api/auth/login" -Method POST -Body $body -ContentType "application/json"

# Scripts oficiais ainda devem funcionar
npm run seed
npm run cleanup
```

**Fluxo manual a testar (com app ou Postman):**

- [ ] `POST /api/auth/login` → token JWT
- [ ] `GET /api/auth/me` com token → dados do usuário
- [ ] `GET /api/modules` → lista de módulos
- [ ] `GET /api/modules/categories` → categorias agrupadas
- [ ] `GET /api/quiz/:moduleId` → quiz do módulo
- [ ] `POST /api/quiz/:quizId/submit/private` → submissão autenticada
- [ ] `GET /api/gamification/stats` → stats do usuário
- [ ] `GET /api/quiz/history` → histórico (verificar ordem de rotas — Fase 3)
- [ ] `GET /api/quiz/stats` → estatísticas (idem)

---

## Fase 1 — Organização sem impacto no runtime

**Risco:** 🟢 zero · **Objetivo:** limpar ruído na raiz e preparar estrutura de docs.

### Tarefas

- [x] Criar pasta `docs/` e mover todos os `.md` da raiz (exceto `README.md`):
  - 32 arquivos movidos para `docs/`
- [x] Atualizar `README.md` com nova estrutura de pastas e link para este guia
- [x] Mover scripts de teste da raiz para `scripts/archive/`:
  - `test-api.js`
  - `test-complete-flow.js`
  - `test-quiz-validation.js`
  - `test-compare-backends.js`
  - `check-user.js`
  - `sync-production-database.js`
- [x] Remover import não usado de `cacheMiddleware` em `src/app.js`
- [x] Garantir que `scripts/backups/*.json` está no `.gitignore`
- [x] Corrigir `.gitignore` (linha corrompida `test-*.js`)

### Não fazer nesta fase

- Não apagar scripts em `scripts/` ainda
- Não alterar lógica de controllers ou rotas
- Não rotacionar credenciais ainda

### Commit sugerido

```
chore: organiza docs e scripts soltos na raiz
```

---

## Fase 2 — Remover código morto em `src/`

**Risco:** 🟢 baixo · **Objetivo:** apagar arquivos em `src/` sem referências.

### Tarefas

- [x] Confirmar com `grep` e remover:
  - [x] `src/controllers/fixedValidateQuestion.js`
  - [x] `src/controllers/module.controller.backup.js`
  - [x] `src/utils/responseHelpers.js`
  - [x] `src/utils/quizTimeCalculator.js`
- [x] Remover imports não usados em `auth.routes.js` (`permanentlyDeleteAccount`, `getPendingDeletions`)
- [x] Remover `dotenv.config()` duplicado de `src/app.js` (mantido só em `server.js`)

### Commit sugerido

```
chore: remove arquivos mortos e imports nao usados em src
```

---

## Fase 3 — Corrigir bugs de rotas e validações

**Risco:** 🟡 baixo-médio · **Objetivo:** corrigir comportamento incorreto sem mudar arquitetura.

### Bug crítico: ordem de rotas em `quiz.routes.js`

Hoje `/history` e `/stats` vêm **depois** de `/:moduleId`. Express interpreta `"history"` e `"stats"` como IDs de módulo.

**Correção:**

```javascript
// ANTES de /:moduleId e /:quizId
router.get('/history', protect, getQuizHistory);
router.get('/stats', protect, getQuizStats);
router.get('/daily-challenge', getDailyChallenge);
router.get('/daily-challenge-info', getDailyChallengeInfo);
// rotas parametrizadas por último
router.get('/:moduleId', getQuiz);
```

### Outras tarefas

- [x] Aplicar `submitQuizValidation` em `submitQuiz` e `submitQuizPrivate` (formato corrigido: `answers: number[]`)
- [x] Criar `src/middlewares/validate.js` para erros do express-validator
- [x] Consolidar domínios de email e palavras inapropriadas em `src/validators/common.validator.js`
- [x] Testar `GET /api/quiz/history` e `GET /api/quiz/stats` → retornam **401** (rota correta, exige auth)

### Commit sugerido

```
fix: corrige ordem de rotas do quiz e aplica validacao de submit
```

---

## Fase 4 — Limpar e categorizar `scripts/`

**Risco:** 🟡 médio · **Objetivo:** reduzir ~120 scripts para um conjunto mantido e documentado.

### Scripts oficiais a manter (mover para subpastas)

| Script atual | Destino | Uso |
|--------------|---------|-----|
| `scripts/seed.js` | `scripts/seed/seed.js` | `npm run seed` |
| `scripts/cleanupAttempts.js` | `scripts/maintenance/cleanupAttempts.js` | `npm run cleanup` |
| `scripts/createMasterUser.js` | `scripts/maintenance/createMasterUser.js` | criar admin local |
| `scripts/backupModulos.js` | `scripts/maintenance/backupModulos.js` | backup manual |

### Categorias para `scripts/archive/`

Mover (não apagar de imediato) scripts destas categorias:

| Categoria | Quantidade aprox. | Exemplos |
|-----------|-------------------|----------|
| `fix*` pontual | ~25 | `fixQuizCrescendoFinal.js`, `correcaoForcadaQuizzes.js` |
| `debug*` | ~8 | `debugAPIIssue.js`, `debugMaestroLevel.js` |
| `test*` manual | ~18 | `testAPI.js`, `testBackendAPI.js` |
| Duplicatas PT/EN | ~10 | `improveQuizQuestions.js` / `melhorarPerguntasQuiz.js` |
| População redundante | ~8 | `createFullContent.js`, `runCompletePopulation.js` |

### Scripts perigosos — tratar com cuidado

| Script | Ação |
|--------|------|
| `sync-production-database.js` (raiz) | Mover para `archive/` + remover credenciais hardcoded |
| `scripts/exportarEImportarModulos.js` | Remover URI hardcoded; usar `MONGODB_URI` do `.env` |
| `scripts/resetDatabase.js` | Manter só em `archive/` com aviso ⚠️ DESTRUTIVO |
| `scripts/forceDatabaseReset.js` | Idem |
| `scripts/createOrUpdateUser.js` | Parametrizar email/senha via args ou `.env` |

### Tarefas

- [x] Mover scripts oficiais: `seed/seed.js`, `maintenance/` (cleanup, backup, createMaster, createOrUpdateUser)
- [x] Arquivar ~122 scripts one-off em `scripts/archive/`
- [x] Mover `README_MUSICAL_CONTENT.md` para `docs/`
- [x] Atualizar `package.json` (`seed`, `cleanup`, `test:performance`)
- [x] Corrigir paths `require('../../src/...')` nos scripts movidos
- [x] Criar `scripts/archive/README.md` e `scripts/maintenance/README.md`
- [x] Atualizar `README.md` com nova estrutura de scripts

### Commit sugerido

```
chore: categoriza scripts e arquiva one-offs de debug/fix
```

---

## Fase 5 — Segurança: secrets e endpoints

**Risco:** 🟠 médio-alto · **Objetivo:** eliminar credenciais expostas e endurecer rotas sensíveis.

> ⚠️ **Requer rotacionar credenciais** no MongoDB Atlas, Gmail/SendGrid e JWT após remover do código.

### Credenciais a remover do código

| Local | Problema |
|-------|----------|
| `sync-production-database.js` | URI Atlas com senha embutida |
| `scripts/exportarEImportarModulos.js` | URI hardcoded |
| `env.example` / `env.production.example` | valores reais/fracos |
| `src/config/email.config.js` | fallback Gmail + senha |
| `src/services/emailService.js` | fallback app password |
| `scripts/createOrUpdateUser.js` | senha plaintext |
| `scripts/createMasterUser.js` | senha default `Master123!@#` |

### Endpoints a endurecer

| Rota | Problema | Ação |
|------|----------|------|
| `POST /api/quiz/:quizId/submit` | Público ("para teste") | Exigir `protect` ou remover em produção |
| `POST /api/quiz/:quizId/validate/:questionIndex` | Público | Exigir `protect` |
| `GET /api/quiz/:moduleId` | Sem auth | Avaliar se frontend precisa; proteger se possível |
| `POST /api/cache/invalidate` | Sem auth | Exigir secret ou admin |
| `POST /api/quiz-attempts/reset` | Admin check comentado | Implementar `authorize('admin')` |
| `POST /api/quiz-attempts/cleanup` | Qualquer autenticado | Restringir a admin |

### Tarefas — 5A+5B (concluídas)

- [x] Remover secrets hardcoded de `src/config/email.config.js` e `emailService.js`
- [x] Limpar `env.example` e `env.production.example` (só placeholders)
- [x] Parametrizar scripts de manutenção (`DEV_USER_*`, `MASTER_PASSWORD`)
- [x] Remover URIs hardcoded de `scripts/archive/sync-*` e `exportarEImportar*`
- [x] Criar `src/middlewares/adminSecret.js`
- [x] Proteger `GET /quiz/:moduleId`, `POST /validate`, cache admin, reset/cleanup
- [x] `POST /quiz/:id/submit` público — só em `development`
- [x] `tls.rejectUnauthorized` ativo em produção no email

### Tarefas — 5C (pendente — ação manual sua)

- [ ] Rotacionar senha MongoDB Atlas (exposta no histórico do git)
- [ ] Rotacionar `JWT_SECRET` no Railway (desloga todos os usuários)
- [ ] Rotacionar Gmail app password / validar SendGrid
- [ ] Definir `ADMIN_SECRET` no Railway antes do próximo deploy
- [ ] Atualizar `.env` local com novos valores

### Commit sugerido

```
security: remove secrets hardcoded e protege endpoints sensiveis
```

---

## Fase 6 — Padronizar naming e validators

**Risco:** 🟡 médio · **Objetivo:** consistência de nomes e validações reutilizáveis.

### Naming de models (breaking change interno — atualizar todos os `require`)

| Atual | Alvo |
|-------|------|
| `User.js` | `user.model.js` |
| `Module.js` | `module.model.js` |
| `Quiz.js` | `quiz.model.js` |
| `quizAttempt.model.js` | ✅ já correto |

> Fazer um model por commit ou todos de uma vez com grep global.

### Nova pasta `src/validators/`

- [ ] `auth.validator.js` — login, register, forgot password, change password
- [ ] `user.validator.js` — update profile
- [ ] `quiz.validator.js` — submit, validate question
- [ ] `common.validator.js` — email domains, palavras inapropriadas (hoje duplicadas)

### Services naming

- [ ] Renomear `emailService.js` → `email.service.js` (padrão uniforme)

### Commit sugerido

```
refactor: padroniza naming de models e extrai validators
```

---

## Fase 7 — Extrair services dos fat controllers

**Risco:** 🟠 alto · **Objetivo:** controllers finos; lógica de negócio nos services.

> Fazer **um domínio por vez**, com testes manuais entre cada extração.

### Ordem recomendada (menor → maior risco)

| Ordem | Origem | Novo service | Motivo |
|-------|--------|--------------|--------|
| 1 | `auth.controller.js` | `auth.service.js` | Fluxo crítico mas menor que quiz |
| 2 | `user.controller.js` | `user.service.js` | Depende de auth |
| 3 | `quizAttempt.controller.js` | `quizAttempt.service.js` | Isolado |
| 4 | `module.controller.js` | `module.service.js` | Cache + categorias |
| 5 | `gamification.controller.js` | expandir `gamification.service.js` | Já existe parcialmente |
| 6 | `quiz.controller.js` | `quiz.service.js` | Maior e mais crítico — por último |

### Por extração, seguir este checklist

- [ ] Criar `*.service.js` com funções puras de negócio
- [ ] Controller fica com: parse request → chama service → formata response
- [ ] Mover acesso a `mongoose` para o service
- [ ] Manter assinaturas das rotas **idênticas** (sem breaking change na API)
- [ ] Testar fluxo manual completo
- [ ] Commit separado por domínio

### Utils a absorver nos services

- [ ] `gamificationRebalanced.js` → `gamification.service.js`
- [ ] `dailyChallengeGenerator.js` → `quiz.service.js`
- [ ] `constants.js` → manter em `utils/` ou `config/`

### Commit sugerido (um por domínio)

```
refactor: extrai quiz.service do quiz.controller
```

---

## Fase 8 — Dependências e config centralizada

**Risco:** 🟡 médio · **Objetivo:** deps enxutas e env validado na startup.

### Dependências candidatas a remoção/movimentação

| Pacote | Ação | Motivo |
|--------|------|--------|
| `mongodb` | Remover | Mongoose cobre tudo; zero `require('mongodb')` em `src/` |
| `node-fetch` | Mover para `devDependencies` ou remover | Só usado em scripts de teste |
| `axios` | Já em devDependencies | OK |

### Config centralizada

- [ ] Criar `src/config/index.js`:
  ```javascript
  // Validar na startup: PORT, MONGODB_URI, JWT_SECRET obrigatórios
  // Falhar rápido com mensagem clara se faltar variável
  ```
- [ ] Remover `dotenv.config()` de `src/app.js` (só em `server.js`)
- [ ] Unificar `email.config.js` + lógica de `emailService.js` em `config/email.js`

### Commit sugerido

```
chore: remove deps nao usadas e centraliza validacao de env
```

---

## Fase 9 — Testes automatizados

**Risco:** 🔴 alto · **Objetivo:** rede de segurança antes de mudanças futuras.

### Setup

```bash
npm install --save-dev jest supertest mongodb-memory-server
```

- [ ] Configurar Jest em `package.json` ou `jest.config.js`
- [ ] `tests/setup.js` — conexão com MongoDB em memória
- [ ] Substituir `"test": "echo Error..."` por `"test": "jest"`

### Testes prioritários (integration)

| Arquivo | Cobre |
|---------|-------|
| `tests/integration/auth.test.js` | login, register, token inválido |
| `tests/integration/quiz.test.js` | get quiz, submit private, history/stats |
| `tests/integration/modules.test.js` | list, categories, complete |
| `tests/integration/gamification.test.js` | stats, achievements |

### Testes unitários

| Arquivo | Cobre |
|---------|-------|
| `tests/unit/gamification.service.test.js` | cálculo de pontos, streak |
| `tests/unit/quiz.service.test.js` | validação de respostas |

### CI (opcional)

- [ ] GitHub Action: `npm test` em cada push para `main`

### Commit sugerido

```
test: adiciona Jest e testes de integracao para auth e quiz
```

---

## Fase 10 — Arquitetura final e migrations

**Risco:** 🔴 muito alto · **Objetivo:** consolidar estrutura alvo e processos de DB seguros.

### Tarefas

- [ ] Mover rotas de cache admin de `app.js` para `src/routes/admin.routes.js`
- [ ] Avaliar `sync-production-database.js` — substituir por pipeline seguro (backup → diff → apply)
- [ ] Introduzir pasta `migrations/` com scripts versionados para mudanças de schema
- [ ] Documentar processo de deploy Railway pós-refactor
- [ ] Deletar `scripts/archive/` após período de quarentena
- [ ] Atualizar `ARQUITETURA_DADOS.md` com estrutura final

### Commit sugerido

```
refactor: consolida arquitetura final e adiciona migrations
```

---

## Problemas conhecidos

### Críticos (corrigir nas Fases 3 e 5)

- [x] Credenciais MongoDB/Gmail/JWT hardcoded em `src/` — removidas (rotacionar ainda — 5C)
- [x] Endpoints de quiz submit/validate públicos em produção — corrigidos
- [x] `submitQuizValidation` definida mas não aplicada — corrigido (Fase 3)

### Médios

- [ ] `quiz.controller.js` com ~1350 linhas — difícil manter
- [ ] Gamificação espalhada entre controller, service e utils
- [ ] Naming inconsistente de models (`Quiz.js` vs `quizAttempt.model.js`)
- [x] ~120 scripts ad-hoc — arquivados e documentados em `scripts/archive/README.md`
- [x] 29 docs na raiz — movidos para `docs/` (Fase 1)

### Baixos / futuro

- [ ] `npm test` não implementado
- [ ] Dep `mongodb` não usada diretamente
- [ ] `auth.authorize()` implementado mas não usado
- [ ] Arquivo `scripts/verificarOpcoes Undefined.js` com espaço no nome

---

## Comparativo com o frontend

| Aspecto | Frontend (feito ✅) | Backend (este guia) |
|---------|---------------------|---------------------|
| Fases | 7 | 10 |
| Código morto | ~36 arquivos | ~4 em `src/` + ~100 scripts |
| Reestruturação | `features/` + `shared/` | `services/` + `validators/` |
| Segurança | keystore fora do git | secrets + endpoints |
| Testes | manual | Jest (Fase 9) |
| Docs | `docs/GUIA_LIMPEZA_ARQUITETURA.md` | este arquivo |

**Estimativa de esforço:** Fases 1–4 são rápidas (1–2 sessões cada). Fases 5–7 exigem cuidado. Fases 8–10 são investimento de longo prazo.

---

## Log de alterações

Registrar aqui o que foi feito em cada sessão de trabalho.

| Data | Fase | O que foi feito | Validado |
|------|------|-----------------|----------|
| 17/06/2025 | — | Guia criado com diagnóstico completo do backend | — |
| 17/06/2025 | 1 | 32 docs → `docs/`; 6 scripts → `scripts/archive/`; `.gitignore` corrigido; import `cacheMiddleware` removido; `README.md` atualizado | `GET /api/health` 200 |
| 17/06/2025 | 2 | Removidos 4 arquivos mortos em `src/`; `dotenv` duplicado removido; imports limpos em `auth.routes.js` | `GET /api/health` 200 |
| 17/06/2025 | 3 | Ordem de rotas quiz corrigida; submitQuizValidation aplicada; validators compartilhados | `/quiz/history` e `/stats` → 401 |
| 17/06/2025 | 5 | 5A+5B: secrets removidos do código, endpoints protegidos, adminSecret | `GET /api/health` 200 |

---

## Referência rápida — endpoints críticos

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me
GET    /api/users/profile
GET    /api/modules
GET    /api/modules/categories
POST   /api/modules/:id/complete
GET    /api/quiz/:moduleId
GET    /api/quiz/history          ← bug ordem de rotas (Fase 3)
GET    /api/quiz/stats            ← bug ordem de rotas (Fase 3)
POST   /api/quiz/:quizId/submit/private
GET    /api/gamification/stats
GET    /api/health
```

---

## Próximo passo recomendado

1. **5C manual:** rotacionar credenciais no Atlas/Railway e definir `ADMIN_SECRET`
2. **Fase 6:** padronizar naming de models e extrair validators restantes

Quando quiser continuar no código, diga **"vamos fazer a Fase 6 do backend"**.
