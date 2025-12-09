#!/bin/bash
echo "🌪️  Kill-Switch Storm Test"
for i in {1..50}
do
  echo "[$i/50] ARMING..."
  export PAYMENTS_KILL_SWITCH=ARMED
  sleep 1
  echo "[$i/50] DISARMING..."
  export PAYMENTS_KILL_SWITCH=DISARMED
  sleep 1
done
echo "✅ Complete"
