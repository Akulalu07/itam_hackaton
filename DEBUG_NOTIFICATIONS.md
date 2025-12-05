# Debugging Notification Issues

If you're not receiving notifications, check these steps:

## Step 1: Check if users are registered

```bash
curl http://localhost:8080/api/users/authorized
```

**Expected output:**
```json
{
  "users": [
    {
      "telegramUserId": 123456789,
      "username": "your_username",
      "authorized": true,
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

**If empty array `{"users":[]}`:**
- Users need to use `/login` command in Telegram bot first
- This will register them in the database

## Step 2: Check if bot is running

Check if the Telegram bot process is running:
```bash
# If using Docker
docker ps | grep tgbot

# If running directly
ps aux | grep tgbot
```

## Step 3: Check bot logs

Look for these log messages:

**Good signs:**
- `Starting bot..`
- `Notification sent to user 123456789`
- No error messages

**Bad signs:**
- `Error reading from stream: ...`
- `Failed to get authorized users: ...`
- `Failed to send notification to user ...: ...`

## Step 4: Check Redis Stream

If you have `redis-cli` access:

```bash
# Check if stream exists and has messages
redis-cli XINFO STREAM notifications

# Read recent messages from stream
redis-cli XREAD COUNT 10 STREAMS notifications 0
```

## Step 5: Check backend logs

After sending notification, backend should log:
```
Notification written to stream: {"message":"Hello! This is a test notification."}
```

## Step 6: Check environment variables

**Bot needs:**
- `BACKEND_URL` - Should be `http://backend:8080` (Docker) or `http://localhost:8080` (local)
- `REDISADDR` - Redis address
- `REDISUSER` - Redis username (if required)
- `REDISPASSWORD` - Redis password (if required)
- `TELOXIDE_TOKEN` - Telegram bot token

**Backend needs:**
- `REDISADDR` - Redis address
- `REDISUSER` - Redis username (if required)
- `REDISPASSWORD` - Redis password (if required)
- PostgreSQL connection variables

## Common Issues

### Issue 1: No users registered
**Solution:** Users must use `/login` command in Telegram bot to register

### Issue 2: Bot can't reach backend
**Symptoms:** Bot logs show `Failed to get authorized users: ...`
**Solution:** 
- Check `BACKEND_URL` environment variable in bot
- If running locally, use `http://localhost:8080`
- If running in Docker, use `http://backend:8080` (service name)

### Issue 3: Redis connection issues
**Symptoms:** `Error reading from stream: ...`
**Solution:**
- Check Redis is running
- Check Redis credentials match in both backend and bot
- Check network connectivity between services

### Issue 4: User blocked the bot
**Symptoms:** `Failed to send notification to user ...: ...`
**Solution:** User needs to unblock the bot in Telegram

### Issue 5: Consumer group not created
**Symptoms:** Stream consumer not reading messages
**Solution:** Bot should create consumer group automatically, but you can manually create:
```bash
redis-cli XGROUP CREATE notifications telegram_bot 0
```

## Testing Checklist

- [ ] Backend is running and accessible
- [ ] Bot is running
- [ ] At least one user is registered (`/api/users/authorized` returns users)
- [ ] Users have `authorized: true` in database
- [ ] Redis is running and accessible
- [ ] Backend can write to Redis Stream (check logs)
- [ ] Bot can read from Redis Stream (check logs)
- [ ] Bot can reach backend API (check `BACKEND_URL`)
- [ ] Bot has valid Telegram token
- [ ] Users haven't blocked the bot

## Manual Test Commands

```bash
# 1. Check users
curl http://localhost:8080/api/users/authorized

# 2. Send notification
curl -X POST http://localhost:8080/api/notification \
  -H "Content-Type: application/json" \
  -d '{"message": "Test notification"}'

# 3. Check Redis stream (if you have redis-cli)
redis-cli XREAD COUNT 1 STREAMS notifications 0

# 4. Check consumer group
redis-cli XINFO GROUPS notifications
```

