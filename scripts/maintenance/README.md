# Scripts de manutenção

Scripts oficiais para operação local do banco. **Não** fazem parte do runtime da API.

| Script | Comando | Descrição |
|--------|---------|-----------|
| `cleanupAttempts.js` | `npm run cleanup` | Remove tentativas de quiz expiradas |
| `createMasterUser.js` | `node scripts/maintenance/createMasterUser.js` | Cria usuário admin local |
| `createOrUpdateUser.js` | `node scripts/maintenance/createOrUpdateUser.js` | Requer `DEV_USER_EMAIL` e `DEV_USER_PASSWORD` no `.env` |
| `backupModulos.js` | `node scripts/maintenance/backupModulos.js` | Backup JSON dos módulos em `scripts/backups/` |

Variáveis opcionais no `.env` para scripts: `DEV_USER_*`, `MASTER_*`, `MONGODB_URI_PRODUCTION`.
