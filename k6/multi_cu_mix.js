/**
 * k6 Load Test: Multi-CU Mixed Traffic
 * 
 * Simulates 25 credit unions with realistic traffic distribution
 */

import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 1000 },
    { duration: '10m', target: 1000 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95 )<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function ( ) {
  const cu = Math.floor(Math.random() * 25) + 1;
  
  const payload = JSON.stringify({
    tenant_id: `cu-${String(cu).padStart(2, '0')}`,
    payment_id: `pmt-${__VU}-${__ITER}`,
    customer_id: `cust-${Math.floor(Math.random() * 10000)}`,
    amount: Math.random() * 800 + 10,
    currency: 'AUD',
    channel: Math.random() > 0.5 ? 'MOBILE' : 'WEB',
    ts: new Date().toISOString(),
  });

  const res = http.post(__ENV.TURING_PAYMENTS_API || 'http://localhost:8000/payments', payload, {
    headers: { 'Content-Type': 'application/json' },
  } );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'latency < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(0.002 + Math.random() * 0.003);
}
