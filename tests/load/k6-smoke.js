import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * Smoke — poucos VUs, duração curta.
 * Uso: k6 run -e BASE_URL=http://localhost:3333 tests/load/k6-smoke.js
 * NUNCA apontar para produção.
 */

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3333').replace(/\/$/, '');
const EMAIL = __ENV.LOAD_EMAIL || '';
const PASSWORD = __ENV.LOAD_PASSWORD || '';

const errorRate = new Rate('errors');

export const options = {
  vus: 2,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
    errors: ['rate<0.05'],
  },
};

function api(path) {
  return `${BASE_URL}${path.startsWith('/api') ? path : `/api${path}`}`;
}

export default function () {
  const health = http.get(api('/health'));
  const healthOk = check(health, {
    'health 200': (r) => r.status === 200,
  });
  errorRate.add(!healthOk);

  const modules = http.get(api('/modules'));
  const modulesOk = check(modules, {
    'modules 200': (r) => r.status === 200,
    'modules p95 budget': (r) => r.timings.duration < 500 || r.status !== 200,
  });
  errorRate.add(!modulesOk);

  const daily = http.get(api('/quiz/daily-challenge'));
  check(daily, {
    'daily challenge not 500': (r) => r.status !== 500,
  });

  if (EMAIL && PASSWORD) {
    const login = http.post(
      api('/auth/login'),
      JSON.stringify({ email: EMAIL, password: PASSWORD }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    const loginOk = check(login, {
      'login 200': (r) => r.status === 200,
      'login has token': (r) => {
        try {
          return !!r.json('token');
        } catch (_) {
          return false;
        }
      },
    });
    errorRate.add(!loginOk);

    if (login.status === 200) {
      let token;
      try {
        token = login.json('token');
      } catch (_) {
        token = null;
      }
      if (token) {
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        const profile = http.get(api('/users/profile'), { headers });
        check(profile, { 'profile 200': (r) => r.status === 200 });

        const logout = http.post(api('/auth/logout'), null, { headers });
        check(logout, { 'logout not 500': (r) => r.status !== 500 });
      }
    }
  }

  sleep(1);
}
