#!/bin/bash

BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

echo "=========================================="
echo "Testing Notification System"
echo "=========================================="
echo ""

echo "Step 1: Checking registered users..."
echo "-----------------------------------"
USERS_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/users/authorized")
echo "$USERS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$USERS_RESPONSE"
echo ""

USER_COUNT=$(echo "$USERS_RESPONSE" | grep -o '"TelegramUserID"' | wc -l)
echo "Found $USER_COUNT registered user(s)"
echo ""

if [ "$USER_COUNT" -eq 0 ]; then
    echo "⚠️  WARNING: No users registered! Users need to use /login in Telegram bot first."
    echo ""
fi

echo "Step 2: Sending test notification..."
echo "-----------------------------------"
NOTIFICATION_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/notification" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "🧪 Test notification - '$(date +"%H:%M:%S")' - If you receive this, the system is working!"
  }')

echo "$NOTIFICATION_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$NOTIFICATION_RESPONSE"
echo ""

if echo "$NOTIFICATION_RESPONSE" | grep -q "notification queued"; then
    echo "✅ Notification queued successfully!"
else
    echo "❌ Failed to queue notification"
fi

echo ""
echo "Step 3: Waiting 3 seconds for processing..."
echo "-----------------------------------"
sleep 3

echo ""
echo "Step 4: Checking Redis Stream (if redis-cli available)..."
echo "-----------------------------------"
if command -v redis-cli &> /dev/null; then
    echo "Checking stream info..."
    redis-cli XINFO STREAM notifications 2>/dev/null || echo "Could not access Redis stream (may need authentication)"
    echo ""
    echo "Recent messages in stream:"
    redis-cli XREAD COUNT 3 STREAMS notifications 0 2>/dev/null || echo "Could not read from stream"
else
    echo "redis-cli not available, skipping Redis check"
fi

echo ""
echo "=========================================="
echo "Test Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check your Telegram bot - you should receive the notification"
echo "2. Check bot logs for:"
echo "   - 'Received X stream keys'"
echo "   - 'Found X authorized users'"
echo "   - '✓ Notification sent to user...'"
echo "3. If no notification received, check:"
echo "   - Is the bot running?"
echo "   - Check bot logs for errors"
echo "   - Verify BACKEND_URL in bot environment"
echo ""

