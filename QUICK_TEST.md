# Quick Notification Test Results

## Test Status: ✅ Notification Queued

**Test Time:** $(date)

### Results:
- ✅ **1 user registered** (TelegramUserID: 1051495483, Username: ERR_4O4)
- ✅ **Notification queued** to Redis Stream
- ⏳ **Waiting for bot to process...**

## What Should Happen Next:

1. **Backend** writes notification to Redis Stream `notifications`
2. **Bot** reads from the stream (runs in background)
3. **Bot** fetches authorized users from `/api/users/authorized`
4. **Bot** sends message to Telegram user `1051495483`

## Check If It Worked:

### Option 1: Check Telegram
- Open Telegram
- Look for a message from your bot with: "🧪 Test notification - [time] - If you receive this, the system is working!"

### Option 2: Check Bot Logs
If bot is running in Docker:
```bash
docker logs tgbot --tail 50
```

Look for these log messages:
- `Starting Redis Stream consumer...`
- `Received X stream keys`
- `Found 1 authorized users`
- `✓ Notification sent to user 1051495483 (ERR_4O4)`

### Option 3: Check Backend Logs
```bash
docker logs backend --tail 20
```

Should show:
- `Notification written to stream: {"message":"🧪 Test notification..."}`

## If Notification Not Received:

### 1. Is Bot Running?
```bash
docker ps | grep tgbot
# OR
ps aux | grep tgbot
```

### 2. Check Bot Environment
```bash
docker exec tgbot env | grep BACKEND_URL
```
Should be: `BACKEND_URL=http://backend:8080` (Docker) or `http://localhost:8080` (local)

### 3. Check Bot Logs for Errors
```bash
docker logs tgbot 2>&1 | grep -i error
```

Common errors:
- `Failed to connect to backend` → Wrong BACKEND_URL
- `Error reading from stream` → Redis connection issue
- `Failed to send notification` → Telegram API issue or user blocked bot

### 4. Test Backend Connectivity from Bot
```bash
docker exec tgbot wget -qO- http://backend:8080/api/users/authorized
# OR if local:
docker exec tgbot wget -qO- http://localhost:8080/api/users/authorized
```

## Manual Verification:

Send another test notification:
```bash
curl -X POST http://localhost:8080/api/notification \
  -H "Content-Type: application/json" \
  -d '{"message": "Second test - '$(date +"%H:%M:%S")'"}'
```

Then immediately check bot logs to see if it processes it.

