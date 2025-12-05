# Testing Notifications Guide

This guide explains how to test the notification system with already registered users.

## Prerequisites

1. **Backend is running** on `http://localhost:8080` (or your configured port)
2. **Telegram bot is running** and connected to the same Redis instance
3. **Users are registered** in PostgreSQL (they get registered automatically when they use `/login` command)

## Quick Test Methods

### Method 1: Using cURL

#### 1. Check registered users
```bash
curl -X GET http://localhost:8080/api/users/authorized
```

This will show all authorized users in the database.

#### 2. Send a simple notification
```bash
curl -X POST http://localhost:8080/api/notification \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! This is a test notification."
  }'
```

#### 3. Send notification with type (for future extensibility)
```bash
curl -X POST http://localhost:8080/api/notification \
  -H "Content-Type: application/json" \
  -d '{
    "message": "New match found!",
    "type": "match",
    "data": {
      "user1": "Alice",
      "user2": "Bob"
    }
  }'
```

### Method 2: Using the Test Script

Run the provided test script:
```bash
./test_notifications.sh
```

Or with custom backend URL:
```bash
BACKEND_URL=http://your-backend:8080 ./test_notifications.sh
```

### Method 3: Using Postman or HTTP Client

1. **GET** `http://localhost:8080/api/users/authorized`
   - Check which users are registered

2. **POST** `http://localhost:8080/api/notification`
   - Headers: `Content-Type: application/json`
   - Body:
     ```json
     {
       "message": "Your test message here"
     }
     ```

## How It Works

1. **Backend receives notification request** → `/api/notification` endpoint
2. **Goroutine writes to Redis Stream** → Stream name: `notifications`
3. **Rust bot consumes from stream** → Background task reads new messages
4. **Bot fetches authorized users** → Calls `/api/users/authorized`
5. **Bot sends messages** → Sends notification to each authorized user's Telegram chat

## Verification Steps

### 1. Check Backend Logs
Look for:
```
Notification written to stream: {"message":"..."}
```

### 2. Check Bot Logs
Look for:
```
Notification sent to user 123456789
```

### 3. Check Redis Stream (Optional)
If you have `redis-cli` access:
```bash
redis-cli XREAD COUNT 10 STREAMS notifications 0
```

### 4. Check Telegram
- All registered users should receive the notification message in their Telegram chat

## Troubleshooting

### No users receiving notifications?

1. **Check if users are registered:**
   ```bash
   curl http://localhost:8080/api/users/authorized
   ```
   - If empty, users need to use `/login` command in Telegram bot first

2. **Check if bot is running:**
   - Bot should be consuming from Redis Streams
   - Check bot logs for errors

3. **Check Redis connection:**
   - Both backend and bot should connect to the same Redis instance
   - Check Redis logs for stream writes

4. **Check user authorization:**
   - Users must have `authorized = true` in database
   - Check with: `SELECT * FROM users WHERE authorized = true;`

### Notification sent but not received?

1. **User might have blocked the bot** - Check if bot can send messages
2. **Check bot logs** for specific error messages
3. **Verify user ID** - Make sure Telegram user ID matches database

## Example Test Flow

```bash
# 1. Check current users
curl http://localhost:8080/api/users/authorized

# 2. Send test notification
curl -X POST http://localhost:8080/api/notification \
  -H "Content-Type: application/json" \
  -d '{"message": "Test notification"}'

# 3. Wait a few seconds and check Telegram
# Users should see the message in their chat

# 4. Send another notification
curl -X POST http://localhost:8080/api/notification \
  -H "Content-Type: application/json" \
  -d '{"message": "Second test notification"}'
```

## Advanced: Testing with Different Event Types

The system is designed to support future event types:

```json
{
  "type": "match",
  "message": "You have a new match!",
  "data": {
    "user1": "Alice",
    "user2": "Bob",
    "matchId": "12345"
  }
}
```

Currently, only `message` is required and used, but the structure supports future extensions.

