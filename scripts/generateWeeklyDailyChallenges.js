/**
 * Gera (ou regenera) os 7 desafios diários da semana corrente.
 *
 * Uso:
 *   npm run daily:week
 *   npm run daily:week -- --gemini
 *   npm run daily:week -- --from=2026-07-13
 *
 * Em produção o servidor também roda isso automaticamente
 * (startup preenche faltantes + toda segunda regenera a semana).
 */

require('dotenv').config();

// Mesmo workaround local do database.js (Windows / querySrv)
const dns = require('dns');
if (process.env.NODE_ENV !== 'production') {
  const current = dns.getServers();
  dns.setServers(['8.8.8.8', '1.1.1.1', ...current.filter((s) => s !== '8.8.8.8' && s !== '1.1.1.1')]);
}

const mongoose = require('mongoose');
const { generateAndPersistWeeklyChallenges } = require('../src/services/weeklyDailyChallenge.service');

function parseArgs(argv) {
  const args = {
    useGemini: argv.includes('--gemini'),
    from: null
  };

  const fromArg = argv.find((arg) => arg.startsWith('--from='));
  if (fromArg) {
    args.from = fromArg.slice('--from='.length);
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const anchorDate = args.from ? new Date(`${args.from}T12:00:00`) : new Date();

  if (Number.isNaN(anchorDate.getTime())) {
    throw new Error(`Data inválida em --from: ${args.from}`);
  }

  if (args.useGemini && !process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY ausente no .env (ou rode sem --gemini)');
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic';
  await mongoose.connect(uri);
  console.log('✅ Conectado ao MongoDB');

  const result = await generateAndPersistWeeklyChallenges({
    anchorDate,
    useGemini: args.useGemini,
    onlyMissing: false
  });

  if (result.skipped) {
    console.log(`ℹ️ ${result.reason}`);
  } else {
    console.log(`📅 Semana ${result.weekStart} → ${result.weekEnd}`);
    console.log(`🧠 Modo: ${result.useGemini ? 'fatos + Gemini (só enunciado)' : 'fatos locais (gratuito)'}`);
    result.results.forEach((item) => {
      console.log(`  ✓ ${item.date} (${item.action}) [${item.source}]`);
    });
    if (result.legacyRemoved) {
      console.log(`🧹 Removidos ${result.legacyRemoved} desafio(s) legado(s) sem data`);
    }
    console.log(`\n✅ Semana pronta: ${result.results.length} dias gravados`);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('❌ Falha ao gerar semana do desafio diário:', error.message);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
