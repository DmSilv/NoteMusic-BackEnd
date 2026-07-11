import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * Stress — rampa 10 → 50 → 100 → 250 → 500 → 1000 VUs.
 * Somente staging com recursos. Pare se error rate ou restarts subirem.
 * NUNCA produção.
 */

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3333').replace(/\/$/, '');
const EMAIL = __ENV.LOAD_EMAIL || '';
const PASSWORD = __ENV.LOAD_PASSWORD || '';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '3m', target: 250 },
    { duration: '3m', target: 500 },
    { duration: '3m', target: 1000 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // Em stress, thresholds são observacionais — falhas esperadas no topo
    http_req_failed: ['rate<0.10'],
    errors: ['rate<0.15'],
  },
};

function api(path) {
  return `${BASE_URL}${path.startsWith('/api') ? path : `/api${path}`}`;
}

export default function () {
  const health = http.get(api('/health'), { tags: { name: 'health' } });
  errorRate.add(health.status >= 500);

  const modules = http.get(api('/modules'), { tags: { name: 'modules' } });
  check(modules, { 'modules not 500': (r) => r.status < 500 });
  errorRate.add(modules.status >= 500);

  if (EMAIL && PASSWORD && __VU % 3 === 0) {
    const login = http.post(
      api('/auth/login'),
      JSON.stringify({ email: EMAIL, password: PASSWORD }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'login' },
      }
    );
    errorRate.add(login.status >= 500);
    if (login.status === 200) {
      try {
        const token = login.json('token');
        if (token) {
          http.get(api('/users/profile'), {
            headers: { Authorization: `Bearer ${token}` },
            tags: { name: 'profile' },
          });
        }
      } catch (_) {
        /* ignore */
      }
    }
  }

  sleep(0.5);
}
