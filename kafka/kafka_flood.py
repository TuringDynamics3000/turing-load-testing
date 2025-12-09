"""Kafka Flood Producer - 5M events"""
import asyncio, json, random, time
from aiokafka import AIOKafkaProducer

async def produce():
    producer = AIOKafkaProducer(
        bootstrap_servers='localhost:9092',
        compression_type='snappy',
        linger_ms=10,
        batch_size=32768,
    )
    await producer.start()
    try:
        start = time.time()
        for i in range(5_000_000):
            msg = {
                'tenant_id': f'cu-{(i % 25) + 1:02d}',
                'payment_id': f'pmt-flood-{i}',
                'customer_id': f'cust-{random.randint(1, 10000)}',
                'amount': round(random.uniform(1, 1000), 2),
                'currency': 'AUD',
                'channel': random.choice(['MOBILE', 'WEB', 'API']),
                'ts': time.time(),
            }
            await producer.send_and_wait('payments.authorised.v1', json.dumps(msg).encode())
            if i % 10000 == 0:
                elapsed = time.time() - start
                rate = i / elapsed if elapsed > 0 else 0
                print(f"✅ Sent {i:,} events ({rate:.0f} msg/s)")
        print(f"\n🎉 Flood complete: 5M events sent")
    finally:
        await producer.stop()

asyncio.run(produce())
