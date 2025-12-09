import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 500 },
    { duration: '5m', target: 1000 },
    { duration: '5m', target: 2000 },
    { duration: '5m', target: 5000 },
    { duration: '5m', target: 10000 },
  ],
};

export default function ( ) {
  const payload = JSON.stringify({
    tenant_id: 'cu-01',
    payment_id: `pmt-${__VU}-${__ITER}`,
    amount: Math.random() * 500,
    currency: 'AUD',
  });

  http.post(__ENV.TURING_PAYMENTS_API || 'http://localhost:8000/payments', payload, {
    headers: { 'Content-Type': 'application/json' },
  } );

  sleep(0.001);
}
