import http from 'k6/http';
import { check, sleep } from 'k6';

const scenario = JSON.parse(open('./salary_day.json' ));

export const options = {
  scenarios: {
    salary_day: {
      executor: 'ramping-arrival-rate',
      startRate: scenario.phases[0].tps,
      timeUnit: '1s',
      stages: scenario.phases.map(p => ({
        duration: `${p.duration_minutes}m`,
        target: p.tps
      })),
      preAllocatedVUs: 500,
      maxVUs: 5000
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01']
  }
};

function pickType(mix ) {
  const r = Math.random();
  let acc = 0;
  for (const [k, v] of Object.entries(mix)) {
    acc += v;
    if (r <= acc) return k;
  }
  return 'p2p_transfer';
}

export default function () {
  const txType = pickType(scenario.mix);
  const tenant = Math.floor(Math.random() * scenario.cus);

  const payload = JSON.stringify({
    tenant_id: `cu-${String(tenant + 1).padStart(2, '0')}`,
    payment_id: `pmt-salary-${__VU}-${__ITER}`,
    tx_type: txType,
    amount: txType === 'payroll_batch' ? Math.random() * 5000 + 1000 : Math.random() * 500,
    currency: 'AUD',
    channel: 'BATCH',
    ts: new Date().toISOString()
  });

  const res = http.post(__ENV.TURING_PAYMENTS_API || 'http://localhost:8000/payments', payload, {
    headers: { 'Content-Type': 'application/json' }
  } );

  check(res, {
    'status ok': r => r.status === 200 || r.status === 202,
    'latency acceptable': r => r.timings.duration < 500
  });

  sleep(0.01);
}