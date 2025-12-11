# Production Deployment Guide

## Quick Deploy (Recommended)

### Option 1: PM2 Hybrid (Easiest - No Docker for Frontend)

```bash
git pull origin main
./scripts/deploy-hybrid.sh
```

**What it does:**
- Backend runs in Docker (postgres, redis, backend API)
- Frontend runs with PM2 (no Docker build issues)
- Auto-restart on crashes
- Uses all available system RAM

**Commands:**
```bash
# Check status
pm2 status
docker compose -f docker-compose.backend-only.yml ps

# View logs
pm2 logs nalar-frontend
docker compose -f docker-compose.backend-only.yml logs -f backend

# Restart frontend
pm2 restart nalar-frontend

# Stop everything
pm2 stop nalar-frontend
docker compose -f docker-compose.backend-only.yml down
```

---

### Option 2: Simple Docker Deploy (Removes All Cache)

```bash
git pull origin main
./scripts/deploy-simple.sh
```

**What it does:**
- Completely removes old frontend containers/images
- Uses simple single-stage Dockerfile
- Builds with `--no-cache --pull` flags
- No standalone mode complexity

⚠️ **Requires:** At least 2GB RAM available for build

---

### Option 3: Frontend-only PM2

```bash
git pull origin main
./scripts/deploy-frontend-pm2.sh
```

**What it does:**
- Only deploys frontend with PM2
- Assumes backend is already running
- Fastest deployment option

---

## Troubleshooting

### Docker build fails with "exit code: 1"
**Cause:** Not enough RAM or Docker cache issues

**Solutions:**
1. Use PM2 deployment instead (Option 1)
2. Add swap space: `sudo fallocate -l 4G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`
3. Use deploy-simple.sh to nuke cache

### "Turbopack" errors
**Fixed:** All builds now use `--no-turbopack` flag in package.json

### Build succeeds but container won't start
**Check logs:**
```bash
docker compose logs frontend
pm2 logs nalar-frontend
```

---

## Environment Variables

Create `.env` file in project root:

```bash
# Database
POSTGRES_DB=nalar
POSTGRES_USER=nalar
POSTGRES_PASSWORD=your_secure_password_here

# Redis
REDIS_PASSWORD=your_redis_password_here

# Django
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
DEBUG=False

# Frontend
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

---

## PM2 Production Setup

### Auto-start on server reboot:
```bash
pm2 startup
pm2 save
```

### Monitor:
```bash
pm2 monit
```

### Update frontend:
```bash
cd frontend
git pull
npm run build
pm2 restart nalar-frontend
```

---

## Why PM2 Instead of Docker for Frontend?

✅ **Faster deployments** - No Docker build time
✅ **Better memory usage** - Direct Node.js process
✅ **Easier debugging** - Direct access to logs and process
✅ **Auto-restart** - PM2 handles crashes automatically
✅ **No cache issues** - Builds directly on server

Docker is great for backend services (postgres, redis) but adds unnecessary complexity for Next.js.
