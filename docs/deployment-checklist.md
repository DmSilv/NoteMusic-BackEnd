# Checklist de Deploy / Lançamento — NoteMusic

**Data:** 2026-07-11

---

## Pré-lançamento público (obrigatório)

### Segurança

- [ ] Remover `isCorrect` do desafio diário público  
- [ ] Corrigir update de senha com `save()` + bcrypt  
- [ ] Remover persistência/log de senha no app  
- [ ] Remover `test-login.json`; rotacionar senha da conta exposta  
- [ ] Impedir mass assignment de `level`  
- [ ] Reduzir rate limit de login/register  
- [ ] Restaurar navegação “Criar Conta” → RegisterUser  
- [ ] Confirmar `ADMIN_SECRET` e `JWT_SECRET` fortes no Railway  
- [ ] Confirmar `NODE_ENV=production` e `TRUST_PROXY=1`  
- [ ] `npm audit` (high/critical) em front e back  

### Dados e API

- [ ] Caps de paginação (`MAX_PAGE_LIMIT`)  
- [ ] Health check com status MongoDB  
- [ ] Body parser com limit explícito  
- [ ] Backup MongoDB verificado (restore testado em staging)  

### App

- [ ] Build de produção aponta HTTPS Railway  
- [ ] Fluxo login / register / reset / quiz smoke em device real  
- [ ] 401 limpa sessão e redireciona para login  
- [ ] Versão `app.json` / `versionCode` incrementados  

### Observabilidade mínima

- [ ] Alertas Railway: memória > 80%, restarts  
- [ ] Uptime check em `/api/health` (UptimeRobot free ou similar)  
- [ ] (Recomendado) Sentry free no backend + crash reporting mobile  

### Carga

- [ ] k6 smoke + average contra **staging** (nunca produção)  
- [ ] Registrar p95, error rate, memória  

---

## Variáveis Railway (checklist de presença)

| Variável | Obrigatória prod |
|----------|------------------|
| `MONGODB_URI` | Sim |
| `JWT_SECRET` | Sim (≥32 chars) |
| `JWT_EXPIRES_IN` | Recomendado |
| `NODE_ENV` | `production` |
| `PORT` | Railway injeta |
| `TRUST_PROXY` | `1` recomendado |
| `CORS_ORIGINS` | Se houver web |
| `ADMIN_SECRET` | Sim |
| E-mail (`BREVO_*` ou `SENDGRID_*` + `EMAIL_USER`) | Sim para reset |
| `RESET_PASSWORD_EXPIRES_MIN` | Opcional (default 15) |
| `APP_NAME` | Opcional |

**Nunca** commitar valores.

---

## Pós-deploy smoke (manual)

1. `GET /api/health` → 200 + (após fix) db ok  
2. Register + login  
3. List modules  
4. Quiz submit privado  
5. Daily challenge **sem** `isCorrect`  
6. Forgot password (1x) — e-mail chega  
7. Reset password  
8. Logout  

---

## Rollback

1. Redeploy commit anterior no Railway  
2. App: manter versionCode anterior disponível no Play (staged rollout)  
3. Mongo: não rodar migrations destrutivas sem backup  

---

## Recomendação de go-live

Ver seção final do relatório consolidado após implementação das correções Críticas/Altas.
