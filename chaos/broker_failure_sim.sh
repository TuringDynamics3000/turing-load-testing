#!/bin/bash
echo "💥 Broker Failure Simulation"
docker stop load-testing-kafka-1
sleep 30
docker start load-testing-kafka-1
sleep 10
echo "✅ Complete"
