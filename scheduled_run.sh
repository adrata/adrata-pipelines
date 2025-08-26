#!/bin/bash

echo "🚀 SCHEDULED PRODUCTION RUN - 9:05 PM PT"
echo "========================================"
echo ""
echo "⏰ Current Time: $(date)"
echo "🎯 Target: Fresh API limits + Real executive data"
echo ""

# Wait until 9:05 PM PT (21:05)
echo "⏳ Waiting for 9:05 PM PT..."

while true; do
    CURRENT_HOUR=$(date +%H)
    CURRENT_MIN=$(date +%M)
    
    if [ "$CURRENT_HOUR" -eq 21 ] && [ "$CURRENT_MIN" -ge 5 ]; then
        break
    elif [ "$CURRENT_HOUR" -gt 21 ]; then
        break
    fi
    
    echo "⏱️  $(date +%H:%M) - Waiting for 21:05..."
    sleep 30
done

echo ""
echo "🎉 IT'S TIME! Starting production run..."
echo "======================================="

# Test API first
echo "🧪 Testing API status..."
python3 run_production.py

echo "🎉 PRODUCTION COMPLETE!"
