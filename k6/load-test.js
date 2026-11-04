import http from 'k6/http';
import { check, sleep } from 'k6';

// Test Configuration: Multi-stage ramp-up and stress testing
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up to 20 virtual users
    { duration: '1m', target: 50 },   // Stress traffic with 50 concurrent users
    { duration: '30s', target: 100 }, // Peak spike load
    { duration: '20s', target: 0 },   // Graceful ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],             // Error rate must be under 1%
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost';

export default function () {
  // Scenario 1: Fetch static web assets (Products Catalog)
  const homeRes = http.get(`${BASE_URL}/index.html`);
  check(homeRes, {
    'index status is 200': (r) => r.status === 200,
    'index body contains catalog': (r) => r.body.includes('Product Catalog'),
  });

  // Scenario 2: Fetch Products API (Simulating concurrent catalog browsing)
  const apiRes = http.get(`${BASE_URL}/api/products`);
  check(apiRes, {
    'api status is 200': (r) => r.status === 200,
  });

  // Scenario 3: Fetch Pokédex module
  const pokeRes = http.get(`${BASE_URL}/pokemon.html`);
  check(pokeRes, {
    'pokemon page status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
