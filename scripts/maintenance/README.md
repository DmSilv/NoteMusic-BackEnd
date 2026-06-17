# Scripts de manutenção

Scripts oficiais para operação local do banco. **Não** fazem parte do runtime da API.

| Script | Comando | Descrição |
|--------|---------|-----------|
| `cleanupAttempts.js` | `npm run cleanup` | Remove tentativas de quiz expiradas |
| `createMasterUser.js` | `node scripts/maintenance/createMasterUser.js` | Cria usuário admin local |
| `createOrUpdateUser.js` | `node scripts/maintenance/createOrUpdateUser.js` | Cria/atualiza usuário de teste |
| `backupModulos.js` | `node scripts/maintenance/backupModulos.js` | Backup JSON dos módulos em `scripts/backups/` |

> ⚠️ `createOrUpdateUser.js` e `createMasterUser.js` contêm credenciais de dev — serão parametrizados na Fase 5.
