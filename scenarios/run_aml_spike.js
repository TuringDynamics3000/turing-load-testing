import http from 'k6/http';
import { check, sleep } from 'k6';

const scenario = JSON.parse(open('./aml_spike.json' ));

export const options = {
  duration: `${scenario.duration_minutes}m`,
  vus: 200,
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01']
  }
};

export default function ( ) {
  const r = Math.random();
  let payload;

  if (r < 0.6) {
    const accountId = Math.floor(Math.random() * scenario.structuring.accounts);
    const amount = Math.random() * 
      (scenario.structuring.amount_range[1] - scenario.structuring.amount_range[0]) + 
      scenario.structuring.amount_range[0];
    
    payload = JSON.stringify({
      tenant_id: `cu-${String(Math.floor(Math.random() * scenario.cus) + 1).padStart(2, '0')}`,
      payment_id: `pmt-struct-${accountId}-${__ITER}`,
      customer_id: `cust-struct-${accountId}`,
      amount: amount,
      currency: 'AUD',
      pattern: 'structuring',
      ts: new Date().toISOString()
    });
  } else if (r < 0.8) {
    const funnelId = Math.floor(Math.random() * scenario.funnel_accounts.accounts);
    const isInflow = Math.random() < 0.95;
    
    payload = JSON.stringify({
      tenant_id: `cu-${String(Math.floor(Math.random() * scenario.cus) + 1).padStart(2, '0')}`,
      payment_id: `pmt-funnel-${funnelId}-${__ITER}`,
      customer_id: `cust-funnel-${funnelId}`,
      amount: isInflow ? Math.random() * 500 : Math.random() * 50000 + 10000,
      currency: 'AUD',
      pattern: isInflow ? 'funnel_inflow' : 'funnel_outflow',
      ts: new Date().toISOString()
    });
  } else {
    const jurisdiction = scenario.high_risk_corridors.jurisdictions[
      Math.floor(Math.random() * scenario.high_risk_corridors.jurisdictions.length)
    ];
    
    payload = JSON.stringify({
      tenant_id: `cu-${String(Math.floor(Math.random() * scenario.cus) + 1).padStart(2, '0')}`,
      payment_id: `pmt-corridor-${__ITER}`,
      amount: Math.random() * 10000,
      currency: 'AUD',
      destination_jurisdiction: jurisdiction,
      pattern: 'high_risk_corridor',
      ts: new Date().toISOString()
    });
  }

  const res = http.post(__ENV.TURING_PAYMENTS_API || 'http://localhost:8000/payments', payload, {
    headers: { 'Content-Type': 'application/json' }
  } );

  check(res, {
    'status ok': r => r.status === 200 || r.status === 202
  });

  sleep(0.05);
}