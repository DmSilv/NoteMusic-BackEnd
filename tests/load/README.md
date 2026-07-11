# Testes de carga k6 — NoteMusic

**IMPORTANTE:** execute somente contra **localhost** ou **staging**.  
**Nunca** aponte `BASE_URL` para produção Railway.  
Não dispare `forgotpassword` em loop (spam de e-mail).

## Pré-requisitos

1. Instalar [k6](https://k6.io/docs/get-started/installation/)
2. Subir API local ou staging com MongoDB de teste
3. (Opcional) Usuário de carga já criado:

```bash
export BASE_URL=http://localhost:3333
export LOAD_EMAIL=loadtest@example.com
export LOAD_PASSWORD='LoadTest!23456'
```

## Comandos

```bash
# Smoke (~30s, poucos VUs)
k6 run tests/load/k6-smoke.js

# Carga média
k6 run tests/load/k6-average.js

# Stress (rampa até 1000 VUs — só staging com recursos)
k6 run tests/load/k6-stress.js

# Spike
k6 run tests/load/k6-spike.js

# Override de URL
k6 run -e BASE_URL=https://staging.example.com tests/load/k6-smoke.js
```

## Cenários cobertos

- Health check
- Login (usuário pré-existente)
- Listagem de módulos
- Perfil autenticado
- Ranking / gamificação (quando autenticado)
- Daily challenge (leitura; assert sem depender de isCorrect)
- Registro descartável **somente no smoke** (1x por iteração limitada)

## Thresholds iniciais

| Métrica | Alvo |
|---------|------|
| `http_req_failed` | < 1% |
| p95 health/modules | < 500 ms |
| p95 login/profile | < 1000 ms |
| HTTP 500 | 0 em smoke/average |

Ajuste após baseline real.

## Métricas a correlacionar no servidor

Durante o teste, no Railway/staging anote:

- CPU %, memória MB, restarts
- Conexões MongoDB
- Logs de erro / OOM
- Event loop (se tiver métrica)

## O que NÃO fazer

- Não usar produção
- Não martelar forgot/reset password
- Não criar milhares de users sem limpeza no banco de teste
- Não iniciar stress em 1000 VUs sem rampa
