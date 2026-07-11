/**
 * Testes leves do agendamento (sem Mongo).
 */
const {
  isCronEnabled,
  maybeRunMondayRefresh
} = require('../../jobs/weeklyDailyChallengeJob');

describe('weeklyDailyChallengeJob', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('fica desligado com DAILY_WEEK_CRON=0', () => {
    process.env.DAILY_WEEK_CRON = '0';
    expect(isCronEnabled()).toBe(false);
  });

  it('maybeRunMondayRefresh não quebra fora da janela', async () => {
    process.env.DAILY_WEEK_CRON = '1';
    await expect(maybeRunMondayRefresh()).resolves.toBeUndefined();
  });
});
