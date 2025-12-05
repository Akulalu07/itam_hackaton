#!/bin/bash

# Test script for notifications
# Make sure your backend is running on localhost:8080 (or update BACKEND_URL)

BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

echo "=== Testing Notification System ==="
echo ""

# Step 1: Check registered users
echo "1. Checking registered users..."
curl -s -X GET "${BACKEND_URL}/api/users/authorized" | jq '.'
echo ""
echo ""

# Step 2: Send a test notification
echo "2. Sending test notification..."
curl -s -X POST "${BACKEND_URL}/api/notification" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! This is a test notification from the backend."
  }' | jq '.'
echo ""
echo ""

# Step 3: Send another notification with type
echo "3. Sending notification with type..."
curl -s -X POST "${BACKEND_URL}/api/notification" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "System maintenance scheduled for tonight.",
    "type": "maintenance"
  }' | jq '.'
echo ""
echo ""

echo "=== Check your Telegram bot - users should receive the notifications! ==="
echo "Note: Make sure the bot is running and connected to the same Redis instance."

