# Auditoria de Segurança — NoteMusic

**Data:** 2026-07-11  
**Repos:** Análise estática. Sem testes de penetração ofensivos em produção.

---

## Resumo executivo

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Seguro para continuar no teste fechado? | **Sim, com ressalvas** — corrigir vazamento de respostas do desafio diário, senha em plaintext no update de perfil, e senha no AsyncStorage do app antes de ampliar o público. |
| 2 | Vulnerabilidade crítica? | **Sim** — (a) `GET /api/quiz/daily-challenge` retorna `isCorrect`; (b) `PUT /profile` pode gravar senha sem hash via `findByIdAndUpdate`; (c) app grava senha em AsyncStorage no cadastro. |
| 3 | Backend preparado para produção pública? | **Parcialmente** — base sólida (Helmet, bcrypt, anti-enumeração no reset), mas rate limit de login fraco, JWT sem revogação, mass assignment de `level`, health sem DB. |
| 4 | Banco configurado corretamente? | **Parcialmente no código** — índices úteis existem; pool/backups/região **não verificáveis** sem painel. |
| 5 | Plano Railway ~US$5 suficiente para fase atual? | **Provável para teste fechado com poucos usuários** — **não** para 1.000 simultâneos. Confirmar métricas no painel. |
| 6 | Suporta 1.000 usuários simultâneos? | **Não é possível afirmar.** Análise estática insuficiente; ver testes k6 em staging. |
| 7 | Cinco maiores riscos | 1) Vazamento respostas quiz 2) Senha plaintext no update 3) Senha no dispositivo 4) Brute-force login 5) Credenciais em `test-login.json` |
| 8 | Antes do lançamento público | Críticos + altos de segurança listados abaixo |
| 9 | Pode esperar crescimento | Cache Redis, filas, refresh token, multi-instância, observabilidade avançada |
| 10 | Métricas desde o início | CPU/RAM Railway, restarts, p95 API, erros 5xx/429, conexões Mongo, falhas login, uptime |

**Nota de segurança: 4,5 / 10** — fundamentos presentes, falhas críticas em quiz e senhas.

---

## Problemas encontrados

### SEC-01 — Desafio diário público vaza respostas corretas

| Campo | Valor |
|-------|-------|
| Área | Backend / Quiz |
| Arquivo | `src/services/quiz.service.js` ~L487–490 |
| Evidência | `isCorrect: option.isCorrect` na resposta de `GET /api/quiz/daily-challenge` (rota pública em `quiz.routes.js` L23). Outros getters de quiz **omitam** `isCorrect` (comentário ~L247). |
| Risco | Qualquer cliente obtém gabarito sem autenticação |
| Impacto | Integridade do desafio diário / gamificação comprometida |
| Probabilidade | Alta |
| Severidade | **Crítica** |
| Solução | Remover `isCorrect` (e explanations que revelam a resposta) da resposta pública; validar só no servidor no submit |
| Esforço | Baixo (1–2 h) |
| Regressão | Médio — app pode depender de validar no client; validar fluxo submit |
| Testar | `GET /daily-challenge` sem token → opções sem `isCorrect`; submit ainda pontua |

### SEC-02 — Update de senha pode gravar plaintext

| Campo | Valor |
|-------|-------|
| Área | Backend / User |
| Arquivo | `src/services/user.service.js` ~L121–132 |
| Evidência | `fieldsToUpdate.password = newPassword` + `User.findByIdAndUpdate` — hook `pre('save')` do bcrypt **não executa** |
| Risco | Senha armazenada em texto claro |
| Impacto | Comprometimento de contas; violação LGPD |
| Probabilidade | Média (quando usuário troca senha pelo perfil) |
| Severidade | **Crítica** |
| Solução | Atribuir `user.password = newPassword` e `await user.save()`; nunca usar `findByIdAndUpdate` para senha |
| Esforço | Baixo |
| Regressão | Baixo |
| Testar | Trocar senha → documento no DB começa com `$2a$` / `$2b$`; login com nova senha |

### SEC-03 — Senha salva em AsyncStorage no cadastro (app)

| Campo | Valor |
|-------|-------|
| Área | Frontend / Auth |
| Arquivo | `features/auth/screens/RegisterUser/RegisterUser.tsx` ~L128–169 |
| Evidência | Log de `registerData` com password; `AsyncStorage.setItem('@NoteMusic:savedPassword', password)`. AuthContext já remove esses keys no boot (~L93–97), mas a tela ainda grava. |
| Risco | Senha em storage não criptografado; backup Android (`allowBackup=true`) |
| Impacto | Roubo de credencial em dispositivo / backup |
| Probabilidade | Alta se usuário escolher “Sim” no alerta |
| Severidade | **Crítica** |
| Solução | Remover persistência de senha; salvar só e-mail; remover logs com senha; alinhar mensagem do alerta |
| Esforço | Baixo |
| Regressão | Baixo |
| Testar | Cadastro → AsyncStorage sem `savedPassword`; logs sem senha |

### SEC-04 — Credenciais em `test-login.json` versionável

| Campo | Valor |
|-------|-------|
| Área | Repo / Secrets |
| Arquivo | `test-login.json` L1 |
| Evidência | JSON com e-mail e senha. `.gitignore` cobre `test-*.js`, **não** `test-*.json` |
| Risco | Credencial real/pessoal no histórico Git |
| Impacto | Conta comprometida se repositório público/compartilhado |
| Probabilidade | Alta (repo público no GitHub) |
| Severidade | **Crítica** (se credencial real) / Alta |
| Solução | Remover arquivo; adicionar `test-*.json` ao `.gitignore`; **rotar senha** da conta; nunca commitá-la de novo |
| Esforço | Baixo |
| Regressão | Nenhum |
| Testar | Arquivo ausente; gitignore cobre padrão |

### SEC-05 — `validateQuestion` revela resposta correta

| Campo | Valor |
|-------|-------|
| Área | Backend / Quiz |
| Arquivo | `src/services/quiz.service.js` ~L648–661; rota `POST /:quizId/validate/:questionIndex` |
| Evidência | Resposta inclui `correctAnswer: { index, text }` sempre |
| Risco | Enumerar opções até achar a correta / obter gabarito |
| Impacto | Cheat de pontuação |
| Probabilidade | Alta |
| Severidade | **Alta** |
| Solução | Retornar apenas `isCorrect` (+ explanation genérica após tentativa registrada); não enviar índice correto antes do submit final |
| Esforço | Médio (alinhar UX do app) |
| Regressão | Médio |
| Testar | Validate com resposta errada → sem `correctAnswer.index` |

### SEC-06 — Mass assignment de `level`

| Campo | Valor |
|-------|-------|
| Área | Backend / Auth+User |
| Arquivo | `user.service.js` ~L113–117; `auth.service.js` ~L57; validators |
| Evidência | Cliente pode enviar `level: 'maestro'` no perfil/registro |
| Risco | Escalação de privilégio de conteúdo |
| Impacto | Pula progressão |
| Probabilidade | Alta |
| Severidade | **Alta** |
| Solução | Remover `level` do body aceito em register/updateProfile; nível só via regras de negócio no servidor |
| Esforço | Baixo |
| Regressão | Baixo se app não envia level |
| Testar | PUT profile com level → ignorado |

### SEC-07 — Rate limit de login excessivamente permissivo

| Campo | Valor |
|-------|-------|
| Área | Backend / Auth |
| Arquivo | `src/app.js` ~L65–74 |
| Evidência | 300 req / 15 min em login/register |
| Risco | Brute-force de senhas fracas |
| Impacto | Contas comprometidas |
| Probabilidade | Média |
| Severidade | **Alta** |
| Solução | Reduzir para ~10–20 / 15 min por IP; considerar lockout progressivo |
| Esforço | Baixo |
| Regressão | Baixo (testes com `NODE_ENV=test` já skipam) |
| Testar | Exceder limite → 429 |

### SEC-08 — Logs do app com senha (`api.ts`)

| Campo | Valor |
|-------|-------|
| Área | Frontend |
| Arquivo | `services/api.ts` ~L373–375 |
| Evidência | `console.log('...Dados recebidos:', data)` no `register` sem `__DEV__` |
| Risco | Senha em logcat / crash reports |
| Severidade | **Alta** |
| Solução | Remover ou usar `devLog` sem campos sensíveis |
| Esforço | Baixo |

### SEC-09 — JWT em AsyncStorage + allowBackup

| Campo | Valor |
|-------|-------|
| Área | Frontend |
| Arquivo | `services/api.ts` (token); `android/.../AndroidManifest.xml` `allowBackup=true` |
| Evidência | Token de sessão em AsyncStorage; SecureStore só para biometria |
| Severidade | **Alta** |
| Solução | Migrar token para SecureStore; considerar `allowBackup=false` |
| Esforço | Médio |
| Regressão | Médio (migração de sessão) |

### SEC-10 — Sem auth gate na navegação

| Campo | Valor |
|-------|-------|
| Área | Frontend |
| Arquivo | `app/navigation/RootNavigator.tsx`; `SelectionScreen.tsx` ~L80–86 |
| Evidência | Stack único sem redirect; “Criar Conta” pula registro (TODO de teste) |
| Severidade | **Alta** (UX/segurança de sessão) |
| Solução | AuthGate; restaurar `navigation.navigate('RegisterUser')` |
| Esforço | Médio / baixo (restore register) |

### SEC-11 — Logout não invalida JWT

| Campo | Valor |
|-------|-------|
| Área | Backend |
| Arquivo | `auth.service.js` logout |
| Severidade | **Média** |
| Solução | Fase 3: denylist curta / refresh tokens / TTL menor |

### SEC-12 — Admin secret bypass fora de produção

| Campo | Valor |
|-------|-------|
| Área | Backend |
| Arquivo | `middlewares/adminSecret.js` ~L16–18 |
| Severidade | **Média** (staging) |
| Solução | Exigir secret também em staging; nunca aceitar no body em produção |

### SEC-13 — IDOR clássico (trocar userId)

| Campo | Valor |
|-------|-------|
| Área | Backend |
| Evidência | Perfil/progresso/attempts usam `req.user.id` |
| Severidade | **Não identificado** nos fluxos principais autenticados |
| Nota | Risco maior é cheat/level, não IDOR de perfil |

### SEC-14 — CORS / Helmet / body size

| Campo | Valor |
|-------|-------|
| Área | Backend |
| Evidência | Helmet ativo; CORS whitelist em prod; body parser sem `limit` explícito |
| Severidade | **Média** (body size) / OK Helmet |
| Solução | `express.json({ limit: '100kb' })` explícito |

---

## Controles positivos (manter)

- bcrypt no `pre('save')` para registro/reset via save.
- Reset com hash SHA-256 do código e mensagem anti-enumeração.
- Rate limit forte no forgot/reset em produção (5/h).
- Password fields `select: false`.
- Error handler oculta stack em produção.
- HTTPS na URL de produção do app.
- AuthContext remove senhas legadas no boot.

---

## Dependências vulneráveis

`npm audit` **não foi executado nesta auditoria** (evitar instalar/alterar sem aprovação). Recomendação: rodar localmente em ambos os repos e tratar High/Critical.
