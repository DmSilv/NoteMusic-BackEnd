const { generateAndPersistWeeklyChallenges } = require('../services/weeklyDailyChallenge.service');
const { weekDateKeys } = require('../utils/weeklyDailyChallengeBuilder');

const ONE_HOUR_MS = 60 * 60 * 1000;
const STARTUP_DELAY_MS = 20 * 1000;

let running = false;
let lastMondayRunWeekStart = null;

function isCronEnabled() {
  if (process.env.NODE_ENV === 'test') return false;
  return process.env.DAILY_WEEK_CRON !== '0';
}

/** Hora atual em America/Sao_Paulo */
function nowInSaoPaulo() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
  return {
    weekday: map.weekday, // Mon, Tue, ...
    hour: Number(map.hour),
    minute: Number(map.minute),
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day)
  };
}

function currentWeekStartKey() {
  return weekDateKeys(new Date())[0];
}

async function runJob({ reason, onlyMissing = false, force = false } = {}) {
  if (!isCronEnabled()) return { skipped: true, reason: 'cron-disabled' };
  if (running) return { skipped: true, reason: 'already-running' };

  running = true;
  try {
    console.log(`🗓️ [daily-week] iniciando (${reason})...`);
    const result = await generateAndPersistWeeklyChallenges({
      onlyMissing,
      // force=true regenera a semana inteira (segunda-feira)
      ...(force ? { onlyMissing: false } : {})
    });

    if (result.skipped) {
      console.log(`🗓️ [daily-week] ok — ${result.reason}`);
    } else {
      console.log(
        `🗓️ [daily-week] gravados ${result.results.length} dia(s) ` +
          `(${result.weekStart} → ${result.weekEnd}) ` +
          `[${result.useGemini ? 'gemini' : 'local'}]`
      );
    }
    return result;
  } catch (error) {
    console.error('🗓️ [daily-week] falhou:', error.message);
    return { skipped: false, error: error.message };
  } finally {
    running = false;
  }
}

/**
 * Na segunda-feira, entre 00:00 e 01:59 (BRT), regenera a semana uma vez.
 */
async function maybeRunMondayRefresh() {
  const sp = nowInSaoPaulo();
  if (sp.weekday !== 'Mon') return;
  if (sp.hour > 1) return;

  const weekStart = currentWeekStartKey();
  if (lastMondayRunWeekStart === weekStart) return;

  const result = await runJob({ reason: 'monday-cron', force: true });
  if (!result?.error) {
    lastMondayRunWeekStart = weekStart;
  }
}

function startWeeklyDailyChallengeScheduler() {
  if (!isCronEnabled()) {
    console.log('🗓️ [daily-week] cron desligado (DAILY_WEEK_CRON=0)');
    return;
  }

  console.log('🗓️ [daily-week] cron ativo — startup + toda segunda 00h–01h (America/Sao_Paulo)');

  // Ao subir: só completa dias que faltam (não regenera o que já existe)
  setTimeout(() => {
    runJob({ reason: 'startup-fill', onlyMissing: true });
  }, STARTUP_DELAY_MS);

  setInterval(() => {
    maybeRunMondayRefresh();
  }, ONE_HOUR_MS);
}

module.exports = {
  startWeeklyDailyChallengeScheduler,
  runJob,
  maybeRunMondayRefresh,
  isCronEnabled
};
