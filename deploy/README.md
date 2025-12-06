# ITAM Hackaton - Docker Deployment

## 🚀 Quick Start (One Command!)

```bash
cd deploy
docker-compose up --build -d
```

**That's it!** The entire stack will be running:
- Frontend: http://localhost
- Backend API: http://localhost/api
- Swagger Docs: http://localhost/swagger
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 🔐 Security Architecture

### Frontend Auth Guard (PrivateRoute)
All routes except `/login` are protected by `PrivateRoute`:
- Checks JWT token in localStorage
- Verifies Zustand auth state
- Redirects to `/login` if unauthenticated
- Supports role-based access (participant, captain, admin)

### Backend JWT Middleware
All `/api/*` routes (except `/api/auth/*`) require JWT:
- Validates `Authorization: Bearer <token>` header
- Returns HTTP 401 if token is invalid/missing
- Sets `user_id`, `user_role` in request context

### Nginx Reverse Proxy (CRITICAL!)
- `GET /` → React SPA (with `try_files` for client-side routing)
- `ALL /api/*` → Proxied to Backend (`http://backend:8080`)
- **Eliminates CORS issues** - everything is same-origin!

## 📦 Services Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        itam-network                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐        ┌──────────────┐                  │
│   │   frontend   │───────▶│   backend    │                  │
│   │  (nginx:80)  │  /api  │  (go:8080)   │                  │
│   └──────────────┘        └──────┬───────┘                  │
│                                   │                          │
│                    ┌──────────────┴──────────────┐          │
│                    │                             │          │
│              ┌─────▼─────┐              ┌────────▼────────┐ │
│              │ postgres  │              │      redis      │ │
│              │   :5432   │              │      :6379      │ │
│              └───────────┘              └─────────────────┘ │
│                                                              │
│                    ┌─────────────┐                          │
│                    │   tgbot     │                          │
│                    │   (rust)    │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Commands

### Build & Run
```bash
# Build all images and start
docker-compose up --build -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Stop & Cleanup
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database!)
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

### Development
```bash
# Rebuild single service
docker-compose up --build -d frontend

# Restart backend
docker-compose restart backend

# Shell into container
docker-compose exec backend sh
docker-compose exec frontend sh
```

## ⚙️ Environment Variables

Create `.env` file in `deploy/` folder:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=itam_hackaton

# JWT
JWT_SECRET=your-jwt-secret-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token
```

## 🔧 Nginx Configuration

Frontend uses Nginx with:
- **SPA fallback**: All routes → `index.html`
- **API proxy**: `/api/*` → `backend:8080`
- **Gzip compression**: Enabled for text assets
- **Static caching**: 1 year for JS/CSS/images
- **Security headers**: X-Frame-Options, X-Content-Type-Options

## 🏥 Health Checks

All services have health checks:
- **Frontend**: `GET http://localhost:80/health`
- **Backend**: `GET http://localhost:8080/health`
- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`

Check status:
```bash
docker-compose ps
```

## 📝 Production Checklist

- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Set unique `JWT_SECRET`
- [ ] Configure `TELEGRAM_BOT_TOKEN`
- [ ] Enable HTTPS (add Traefik/Caddy as reverse proxy)
- [ ] Set up external volumes for data persistence
- [ ] Configure backup for PostgreSQL
- [ ] Set up monitoring (Prometheus/Grafana)
