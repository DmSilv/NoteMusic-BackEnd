/**
 * Cria ou atualiza conta de revisor da Play Store (acesso master / maestro).
 * Não remove outros usuários.
 *
 * Uso:
 *   node scripts/maintenance/createPlayStoreReviewer.js
 *
 * Variáveis opcionais:
 *   PLAYSTORE_REVIEWER_EMAIL
 *   PLAYSTORE_REVIEWER_PASSWORD
 *   PLAYSTORE_REVIEWER_NAME
 */

// Sem ponto no Gmail: express-validator normalizeEmail remove pontos no login da API
process.env.MASTER_EMAIL =
  process.env.PLAYSTORE_REVIEWER_EMAIL || 'notemusicplaystore@gmail.com';
process.env.MASTER_PASSWORD =
  process.env.PLAYSTORE_REVIEWER_PASSWORD || 'NoteMusic@Play2026';
process.env.MASTER_NAME = process.env.PLAYSTORE_REVIEWER_NAME || 'Revisor';
process.env.UPDATE_EXISTING = 'true';

const createMasterUser = require('./createMasterUser');

createMasterUser();
