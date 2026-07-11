import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * Average load — rampa gradual, carga “normal”.
 * Requer LOAD_EMAIL / LOAD_PASSWORD de usuário de teste.
 * NUNCA produção.
 */

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3333').replace(/\/$/, '');
const EMAIL = __ENV.LOAD_EMAIL || '';
const PASSWORD = __ENV.LOAD_PASSWORD || '';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 5 },
    { duration: '3m', target: 20 },
    { duration: '3m', target: 20 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:health}': ['p(95)<500'],
    'http_req_duration{name:modules}': ['p(95)<500'],
    'http_req_duration{name:login}': ['p(95)<1000'],
    'http_req_duration{name:profile}': ['p(95)<1000'],
    errors: ['rate<0.05'],
  },
};

function api(path) {
  return `${BASE_URL}${path.startsWith('/api') ? path : `/api${path}`}`;
}

export function setup() {
  if (!EMAIL || !PASSWORD) {
    console.warn('LOAD_EMAIL/LOAD_PASSWORD não definidos — só endpoints públicos serão medidos.');
  }
  return {};
}

export default function () {
  const health = http.get(api('/health'), { tags: { name: 'health' } });
  errorRate.add(health.status !== 200);

  const modules = http.get(api('/modules'), { tags: { name: 'modules' } });
  errorRate.add(modules.status !== 200);
  check(modules, { 'modules 200': (r) => r.status === 200 });

  http.get(api('/quiz/daily-challenge'), { tags: { name: 'daily' } });

  if (EMAIL && PASSWORD) {
    const login = http.post(
      api('/auth/login'),
      JSON.stringify({ email: EMAIL, password: PASSWORD }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'login' },
      }
    );
    const ok = check(login, { 'login 200': (r) => r.status === 200 });
    errorRate.add(!ok);

    if (login.status === 200) {
      let token;
      try {
        token = login.json('token');
      } catch (_) {
        token = null;
      }
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        const profile = http.get(api('/users/profile'), {
          headers,
          tags: { name: 'profile' },
        });
        check(profile, { 'profile 200': (r) => r.status === 200 });

        http.get(api('/gamification/leaderboard?limit=20'), {
          headers,
          tags: { name: 'leaderboard' },
        });
      }
    }
  }

  sleep(1);
}
