# Plano de implementação — NoteMusic

**Data:** 2026-07-11  
Com base em `security-audit.md`, `performance-audit.md`, `scalability-plan.md`.

---

## Fase 1 — Antes do lançamento público

| Tarefa | Prioridade | Dependências | Esforço | Ganho | Critério de conclusão |
|--------|------------|--------------|---------|-------|------------------------|
| Strip `isCorrect` daily challenge | P0 | — | 1h | Integridade gamificação | GET público sem gabarito |
| Fix bcrypt no updateProfile | P0 | — | 1h | Senhas seguras | Hash no DB após troca |
| Remover senha AsyncStorage + logs | P0 | — | 1h | Sem credencial no device | Keys ausentes |
| Remover `test-login.json` + gitignore | P0 | Rotacionar senha fora do código | 30m | Sem secret no repo | Arquivo gone |
| Bloquear mass assignment `level` | P0 | — | 1h | Progressão íntegra | Body level ignorado |
| Rate limit login 20/15min | P0 | — | 30m | Anti brute-force | 429 após excesso |
| Restaurar RegisterUser navigation | P0 | — | 15m | Cadastro funciona | Botão abre registro |
| Caps paginação | P1 | — | 1h | Evita DoS leve | limit ≤ 100 |
| Health + Mongo | P1 | — | 1h | Deploy confiável | health reflete DB |
| Body limit explícito | P1 | — | 15m | Proteção payload | 413 acima do lim |

## Fase 2 — Primeiros usuários

| Tarefa | Prioridade | Esforço | Ganho |
|--------|------------|---------|-------|
| AuthGate + 401 → logout completo | P1 | 4h | Sessão consistente |
| Token em SecureStore | P1 | 4h | Menos exposição |
| Índices validados em staging | P1 | 2h | Queries estáveis |
| Logs estruturados / reduzir verbosidade | P1 | 3h | Ops |
| Sentry + UptimeRobot | P1 | 2h | Alertas |
| Testes IDOR / authorization / rate limit | P1 | 1d | Regressão |
| k6 average em staging | P1 | 0,5d | Baseline |
| `allowBackup=false` | P2 | 1h | Android |

## Fase 3 — Crescimento

Cache Redis (se multi-instância), fila e-mail, worker exclusão contas, upgrade Railway/Mongo, otimizar arrays User.

## Fase 4 — Escala elevada

Múltiplas réplicas, auto-scaling, observabilidade avançada — **só com métricas**.

---

## Implementação imediata (esta sessão)

Somente **Crítica / Alta / rápida baixo risco**, após aprovação implícita do plano nesta entrega:

1. Backend: daily challenge strip, password save, level strip, rate limit, pagination caps, health DB, body limit, test-login removal  
2. Frontend: remove password storage/logs, restore register navigation, sanitize register logs  
3. Testes unitários/integração para as correções críticas  
4. Commits Conventional Commits pequenos  

**Não nesta sessão:** SecureStore migração completa, AuthGate completo, Redis, refresh tokens, major upgrades.
