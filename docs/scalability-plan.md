# Plano de Escalabilidade — NoteMusic

**Data:** 2026-07-11

---

## Classificação da arquitetura atual

**Razoavelmente preparada para crescimento inicial** (teste fechado / dezenas a baixo centenas de usuários ativos/dia).

**Não preparada** para garantir 1.000 usuários **simultâneos**.

### Evidências

| Fator positivo | Fator limitante |
|----------------|-----------------|
| JWT stateless (escala horizontal possível na API) | Cache `node-cache` por processo |
| Índices de leaderboard | Sem filas / workers |
| Rate limiting presente | Auth limiter frouxo (300/15min) |
| QuizAttempt com TTL | User document com arrays crescentes |
| Compressão + Helmet | 1 instância implícita; sem railway.toml de réplicas |
| | Health sem DB; pool default |
| | E-mail síncrono |
| | Sem métricas/APM no código |

---

## Definições (não misturar)

| Termo | Significado |
|-------|-------------|
| Cadastrados | Contas no MongoDB |
| Ativos/dia (DAU) | Usuários que abriram o app no dia |
| Simultâneos | Conexões/requests sobrepostas no mesmo intervalo curto |
| RPS | Requisições HTTP por segundo na API |

1.000 cadastrados ≠ 1.000 simultâneos. Em educação, simultaneidade típica costuma ser uma fração pequena do DAU — **medir**, não assumir.

---

## Matriz de prontidão (estimativa)

| Escala | Prontidão | Notas |
|--------|-----------|-------|
| 100 cadastrados | Alta | Arquitetura atual suficiente |
| 1.000 cadastrados | Média-Alta | Com índices + caps de paginação |
| 10.000 cadastrados | Média | Monitorar tamanho docs User; leaderboard |
| 50 simultâneos | Provável | Validar com k6 average |
| 100 simultâneos | Incerto | Depende RAM/CPU Railway + pool Mongo |
| 500 simultâneos | Baixa | Provável necessidade de upgrade + cache |
| 1.000 simultâneos | Não suportado por evidência atual | Exige stress test + possível multi-instância |

**Nota de escalabilidade: 3,5 / 10**

---

## Gargalos prováveis (ordem)

1. Memória/CPU da única instância Railway  
2. Conexões / latência MongoDB  
3. Consultas sem limíte de `limit`  
4. Event loop bloqueado por logs + JSON grandes  
5. E-mail no path de forgot password  
6. Cache inconsistente se escalar horizontalmente sem Redis  
7. Rate limits mal calibrados (ou genéricos altos)

---

## Railway — o que o código mostra

- Start: `node server.js`, bind `0.0.0.0`, `PORT` env  
- Sem Dockerfile / railway.toml  
- Graceful shutdown HTTP parcial; **não** fecha Mongoose  
- Estado local: `node-cache`  
- Sem cron in-process duplicável  
- Redis: **não necessário agora** (1 instância); justificado na Fase 3 se multi-instância ou rate-limit distribuído  

### Informações que precisam ser verificadas no painel Railway

Anote estes valores (não inventar):

1. **Project → Service → Settings → Resources**  
   - Memory limit (MB)  
   - CPU  
   - Réplicas / horizontal scaling  
2. **Metrics** (últimos 7–14 dias)  
   - Memory avg / max  
   - CPU avg / max  
   - Network  
   - Restart count  
3. **Deployments**  
   - Região  
   - Build method (Nixpacks?)  
   - Healthcheck path e intervalo  
4. **Variables** (só nomes/status)  
   - `NODE_ENV=production`?  
   - `TRUST_PROXY=1`?  
   - `MONGODB_URI` presente?  
   - `JWT_SECRET` comprimento ≥ 32?  
   - `ADMIN_SECRET` setado?  
   - Provedor e-mail configurado?  
5. **Usage / Billing**  
   - Uso vs plano (~US$5)  
   - Alertas de billing  

### MongoDB (Atlas ou equivalente) — verificar

1. Tier / storage / RAM  
2. Região vs região Railway (latência)  
3. `maxPoolSize` efetivo / conexões atuais  
4. Backups automáticos e retenção  
5. Alertas de storage e connections  
6. Slow query log  

---

## Redis — quando justificar

| Situação | Redis? |
|----------|--------|
| 1 instância, cache módulos ok | Não |
| 2+ instâncias API | Sim (cache compartilhado / rate limit) |
| Filas de e-mail | Sim (Bull/BullMQ) ou serviço gerenciado |
| Sessões server-side | Só se abandonar JWT puro |

---

## Plano por fases

### Fase 1 — Antes do lançamento público

Ver `deployment-checklist.md` + correções Críticas/Altas de segurança.

### Fase 2 — Primeiros usuários

Índices validados, caps paginação, health+DB, logs estruturados mínimos, Sentry free, alertas Railway, k6 em staging.

### Fase 3 — Crescimento

Redis se multi-instância; fila e-mail; worker exclusão de contas; otimizar User arrays; upgrade plano.

### Fase 4 — Escala elevada

Auto-scaling, observabilidade avançada, possível split read replicas — **somente com métricas**.
