import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

const scenario = JSON.parse(open('./fraud_storm.json' ));

export const options = {
  scenarios: {
    fraud_storm: {
      executor: 'ramping-arrival-rate',
      startRate: scenario.base_tps,
      timeUnit: '1s',
      stages: [
        { duration: `${scenario.storm_start_minute}m`, target: scenario.base_tps },
        { duration: `${scenario.storm_duration_minutes}m`, target: scenario.storm_tps },
        { duration: `${scenario.duration_minutes - scenario.storm_start_minute - scenario.storm_duration_minutes}m`, target: scenario.base_tps }
      ],
      preAllocatedVUs: 500,
      maxVUs: 3000
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05']
  }
};

function pickPattern(patterns ) {
  const r = Math.random();
  let acc = 0;
  for (const [k, v] of Object.entries(patterns)) {
    acc += v;
    if (r <= acc) return k;
  }
  return 'rapid_small_payments';
}

export default function () {
  const isStorm = exec.scenario.iterationInTest > (scenario.storm_start_minute * 60 * scenario.base_tps);
  const tenant = isStorm 
    ? scenario.target_cus[Math.floor(Math.random() * scenario.target_cus.length)]
    : Math.floor(Math.random() * scenario.cus) + 1;

  const pattern = pickPattern(scenario.patterns);
  
  let amount, device_id, mcc;
  
  switch(pattern) {
    case 'rapid_small_payments':
      amount = Math.random() * 50 + 10;
      break;
    case 'new_device_high_amount':
      amount = Math.random() * 5000 + 2000;
      device_id = `dev-new-${Math.random()}`;
      break;
    case 'geo_jump':
      amount = Math.random() * 1000;
      break;
    case 'mcc_risk_cluster':
      amount = Math.random() * 800;
      mcc = '5967';
      break;
    default:
      amount = Math.random() * 200;
  }

  const payload = JSON.stringify({
    tenant_id: `cu-${String(tenant).padStart(2, '0')}`,
    payment_id: `pmt-fraud-${__VU}-${__ITER}`,
    amount: amount,
    currency: 'AUD',
    pattern: pattern,
    device_id: device_id || `dev-${Math.floor(Math.random() * 1000)}`,
    merchant_category: mcc || '5999',
    ts: new Date().toISOString()
  });

  const res = http.post(__ENV.TURING_PAYMENTS_API || 'http://localhost:8000/payments', payload, {
    headers: { 'Content-Type': 'application/json' }
  } );

  check(res, {
    'status ok': r => r.status === 200 || r.status === 202 || r.status === 403
  });

  sleep(0.01);
}