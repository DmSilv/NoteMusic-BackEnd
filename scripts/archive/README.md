# Scripts arquivados

Scripts one-off de debug, correção pontual e testes manuais. **Não fazem parte do runtime da API.**

Arquivados na **Fase 4** da limpeza de arquitetura. Mantidos por referência histórica — podem ser removidos após período de quarentena.

## Como executar

```bash
node scripts/archive/nome-do-script.js
```

## Inventário (122 scripts)

| Categoria | Qtd | Padrão | Motivo do arquivamento |
|-----------|-----|--------|------------------------|
| Correções pontuais | ~18 | `fix*.js` | Fixes pós-incidente já aplicados no banco |
| Debug | ~7 | `debug*.js` | Diagnóstico temporário de bugs |
| Testes manuais | ~19 | `test*.js` | Testes ad-hoc sem framework |
| Verificação | ~6 | `verificar*.js` | Validação pontual de conteúdo |
| Correções PT | ~5 | `corrigir*`, `correcao*` | Duplicata/overlap com scripts EN |
| População redundante | ~8 | `populate*`, `run*Population`, `createFullContent` | Substituído por `npm run seed` |
| Reset destrutivo | ~4 | `resetDatabase`, `forceDatabaseReset`, `forceClean*` | ⚠️ Apaga dados — só local |
| Sync/export | ~3 | `sync-production-database`, `exportarEImportar*` | Movidos da raiz; revisar credenciais (Fase 5) |
| Conteúdo musical | ~15 | `*Musical*`, `*Content*`, `*Questions*` | Versões antigas de população |
| Outros | ~37 | diversos | Scripts únicos sem uso ativo |

## Scripts da raiz (Fase 1)

| Arquivo | Descrição |
|---------|-----------|
| `check-user.js` | Debug de usuário no banco |
| `test-api.js` | Teste manual da API |
| `test-complete-flow.js` | Teste de fluxo completo |
| `test-quiz-validation.js` | Teste de validação de quiz |
| `test-compare-backends.js` | Comparação local vs produção |
| `sync-production-database.js` | Sync de banco (⚠️ credenciais — Fase 5) |

## Scripts destrutivos — usar com cuidado

- `resetDatabase.js` — reseta módulos/quizzes
- `forceDatabaseReset.js` — reset forçado
- `forceCleanAndRepopulate.js` — limpa e repopula
- `cleanUsersAndCreateMaster.js` — remove usuários

**Nunca rodar em produção sem backup.**

## Scripts oficiais (não estão aqui)

Use `scripts/seed/seed.js` (`npm run seed`) e `scripts/maintenance/` para operação rotineira.
