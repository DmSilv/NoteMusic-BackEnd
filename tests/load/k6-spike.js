import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * Spike — aumento súbito curto, depois retorno.
 * NUNCA produção.
 */

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3333').replace(/\/$/, '');
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '20s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '20s', target: 5 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.10'],
  },
};

function api(path) {
  return `${BASE_URL}${path.startsWith('/api') ? path : `/api${path}`}`;
}

export default function () {
  const res = http.get(api('/health'), { tags: { name: 'health' } });
  const ok = check(res, {
    'health 200 or 429': (r) => r.status === 200 || r.status === 429,
  });
  errorRate.add(!ok && res.status >= 500);

  http.get(api('/modules'), { tags: { name: 'modules' } });
  sleep(0.3);
}
