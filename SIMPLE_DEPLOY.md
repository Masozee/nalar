# Simple Production Deployment - TESTED & WORKING

## The Problem
Docker filesystem issues are blocking deployment.

## The Solution
Deploy backend in Docker, frontend with PM2 directly on the host.

---

## Step-by-Step Deployment

### 1. On your server, create .env file:

```bash
cd /home/deploy/nalar
cp .env.production .env
nano .env
```

**Edit these 3 lines ONLY:**
```bash
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.0.231,backend
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://192.168.0.231
FRONTEND_URL=http://192.168.0.231
```
Save (Ctrl+X, Y, Enter)

### 2. Fix Promtail mount issue:

```bash
# Remove promtail service temporarily to avoid read-only filesystem error
nano docker-compose.yml
```

Comment out promtail (lines 299-312):
```yaml
  # promtail:
  #   image: grafana/promtail:latest
  # ... (comment all lines)
```

### 3. Deploy backend services:

```bash
docker compose up -d postgres redis pgbouncer backend rustfs caddy grafana prometheus
```

### 4. Deploy frontend with PM2:

```bash
cd frontend
npm ci --legacy-peer-deps
npm run build
pm2 start ecosystem.config.js --name nalar-frontend
pm2 save
pm2 startup
```

### 5. Test:

```bash
curl http://192.168.0.231:8000/api/v1/health/
curl http://192.168.0.231
```

---

## Access Services

- Frontend: http://192.168.0.231
- Backend: http://192.168.0.231:8000
- Grafana: http://192.168.0.231:3002

---

## If Something Breaks

**Backend issues:**
```bash
docker compose logs backend
docker compose restart backend
```

**Frontend issues:**
```bash
pm2 logs nalar-frontend
pm2 restart nalar-frontend
```

**Start over:**
```bash
docker compose down
docker compose up -d postgres redis pgbouncer backend rustfs caddy grafana prometheus
cd frontend && pm2 restart nalar-frontend
```
