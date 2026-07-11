# Auditoria de Performance — NoteMusic

**Data:** 2026-07-11  
**Método:** Análise estática. Sem load test em produção.

---

## Resumo

A API é tipicamente I/O-bound (MongoDB). Há índices em User para leaderboard e campos de progresso. Principais riscos: paginação sem teto, listagens sem paginação, vazamento de processamento em logs, e-mail síncrono no reset, cache só em memória, e arrays de progresso no documento User que crescem sem bound.

**Nota de qualidade backend (perf/arquitetura): 5,5 / 10**  
**Nota front-end (perf/UX): 5,0 / 10**

---

## Problemas

### PERF-01 — Paginação sem teto (`MAX_PAGE_LIMIT` não aplicado)

| Campo | Valor |
|-------|-------|
| Área | Backend |
| Arquivo | `src/utils/constants.js` (`MAX_PAGE_LIMIT=100`); history/ranking/leaderboard |
| Evidência | Constante existe mas queries usam `limit` do client sem clamp |
| Risco | Payload enorme / scan pesado |
| Severidade | **Alta** |
| Solução | `Math.min(parseInt(limit)||10, MAX_PAGE_LIMIT)` em todos os list endpoints |
| Esforço | Baixo |

### PERF-02 — `GET /api/modules` sem paginação

| Campo | Valor |
|-------|-------|
| Área | Backend |
| Evidência | Lista completa + cache 180s |
| Severidade | **Média** (ok com dezenas de módulos; risco se catálogo crescer) |
| Solução | Manter cache; paginar se >100 itens |

### PERF-03 — Arrays unbounded no User

| Campo | Valor |
|-------|-------|
| Área | MongoDB |
| Arquivo | `user.model.js` — `completedModules`, `completedQuizzes`, `quizAttempts` |
| Evidência | Sem limite de tamanho; documento User cresce com uso |
| Severidade | **Média** (piora com power users) |
| Solução | Fase 3: coleções separadas / arquivar attempts antigos |

### PERF-04 — E-mail síncrono no request path

| Campo | Valor |
|-------|-------|
| Área | Backend / Email |
| Evidência | Forgot password aguarda provedor |
| Severidade | **Média** |
| Solução | Fase 3: fila; por ora timeout curto no axios |

### PERF-05 — Logs verbosos em hot paths

| Campo | Valor |
|-------|-------|
| Área | Backend |
| Arquivo | `quiz.service.js` (vários `console.log` por questão) |
| Severidade | **Média** |
| Solução | Log nível `debug` só com `LOG_LEVEL=debug` |

### PERF-06 — Health check sem MongoDB

| Campo | Valor |
|-------|-------|
| Área | Deploy |
| Arquivo | `src/app.js` ~L109–117 |
| Severidade | **Média** (Railway pode marcar healthy com DB down) |
| Solução | `/api/health` ping `mongoose.connection.readyState` ou `db.admin().ping()` |

### PERF-07 — Pool MongoDB default

| Campo | Valor |
|-------|-------|
| Área | DB |
| Arquivo | `database.js` |
| Severidade | **Média** sob concorrência |
| Solução | Definir `maxPoolSize` alinhado ao tier Atlas + instâncias Railway |

### PERF-08 — Front: ModuleCategory em ScrollView

| Campo | Valor |
|-------|-------|
| Área | Frontend |
| Evidência | `.map` dentro de ScrollView; FlatList só em ContentListCategory |
| Severidade | **Média** |
| Solução | FlatList / SectionList |

### PERF-09 — Front: sem cancelamento por unmount

| Campo | Valor |
|-------|-------|
| Área | Frontend |
| Evidência | AbortController só para timeout 15s |
| Severidade | **Baixa/Média** |
| Solução | Abort em cleanup de useEffect |

### PERF-10 — Cache in-process

| Campo | Valor |
|-------|-------|
| Área | Backend |
| Evidência | `node-cache`; headers `Cache-Control: public` em algumas rotas autenticadas |
| Severidade | **Média** com múltiplas instâncias |
| Solução | Aceitável 1 instância; Redis na Fase 3 |

### PERF-11 — N+1 / populate

| Campo | Valor |
|-------|-------|
| Área | Backend |
| Evidência | `getProgress` usa populate em completedModules |
| Severidade | **Baixa/Média** |
| Solução | Select enxuto; limitar profundidade |

---

## Índices existentes (User)

| Índice | Campos |
|--------|--------|
| Unique | `email` |
| | `createdAt: -1` |
| | `isActive + totalPoints` |
| | `isActive + streak` |
| | `lastActivityDate` |
| | `completedModules.moduleId` |
| | `completedQuizzes.quizId` |

QuizAttempt: TTL em `expiresAt`; compostos `userId+quizId`, `userId+moduleId`.

## Índices recomendados (não criar automaticamente)

| Collection | Campos | Tipo | Consulta beneficiada | Impacto | Custo escrita |
|------------|--------|------|----------------------|---------|---------------|
| users | `{ resetPasswordToken: 1 }` parcial onde existe | single | reset password lookup | Médio | Baixo |
| quizzes | `{ type: 1, isActive: 1 }` | composto | daily-challenge findOne | Médio | Baixo |
| quizzes | `{ moduleId: 1, isActive: 1 }` | composto | getQuizByModule | Alto | Baixo |
| modules | `{ level: 1, order: 1, isActive: 1 }` | composto | listagem por nível | Médio | Baixo |
| users | Revisar necessidade de índices em arrays se queries mudarem | — | — | — | — |

Validar com `explain("executionStats")` em staging antes de criar em produção.

---

## Capacidade (estimativa qualitativa)

Sem k6 em staging, estimativa **conservadora**:

| Cenário | Avaliação |
|---------|-----------|
| 100 cadastrados | OK |
| 1.000 cadastrados | OK se índices + paginação |
| 10.000 cadastrados | Precisa paginação, monitoramento, possível upgrade Mongo |
| 50 simultâneos | Provável OK no plano pequeno |
| 100 simultâneos | Limite incerto — medir |
| 500–1.000 simultâneos | **Não afirmar** sem stress test + métricas Railway/Mongo |
