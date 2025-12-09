"""Kafka Consumer Lag Probe"""
from kafka import KafkaConsumer
import time, json

consumer = KafkaConsumer(
    'payments.authorised.v1',
    bootstrap_servers='localhost:9092',
    auto_offset_reset='latest',
    group_id='lag-probe-monitor',
)

print("📡 Kafka Consumer Lag Probe started")
msg_count = 0
lag_sum = 0

while True:
    records = consumer.poll(timeout_ms=1000)
    for topic_partition, messages in records.items():
        for msg in messages:
            try:
                payload = json.loads(msg.value.decode())
                event_ts = payload.get('ts', time.time())
                lag = time.time() - event_ts
                msg_count += 1
                lag_sum += lag
                if msg_count % 100 == 0:
                    avg_lag = lag_sum / msg_count
                    print(f"📊 Messages: {msg_count:,} | Avg Lag: {avg_lag:.3f}s")
            except Exception as e:
                print(f"❌ Error: {e}")
    if not records:
        time.sleep(0.1)
