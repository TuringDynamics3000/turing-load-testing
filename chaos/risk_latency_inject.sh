#!/bin/bash
DELAY_MS=${1:-2500}
DURATION_SEC=${2:-120}
echo "⏱️  Injecting ${DELAY_MS}ms delay for ${DURATION_SEC}s..."
export RISK_ARTIFICIAL_DELAY_MS=$DELAY_MS
sleep $DURATION_SEC
unset RISK_ARTIFICIAL_DELAY_MS
echo "✅ Complete"
