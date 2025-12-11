# Quick Start - Production Deployment

## Step 1: Pull Latest Code

```bash
cd /path/to/nalar
git pull origin main
```

## Step 2: Copy and Configure Environment

```bash
# Copy production environment file
cp .env.production.example .env

# Edit and update these values:
nano .env
```

**Important: Update these in .env:**
```bash
# Add your server IP to ALLOWED_HOSTS
ALLOWED_HOSTS=localhost,127.0.0.1,YOUR_SERVER_IP,backend

# Add your server IP to CORS
CORS_ALLOWED_ORIGINS=http://YOUR_SERVER_IP,http://localhost:3000

# Set frontend URL
FRONTEND_URL=http://YOUR_SERVER_IP

# For production, use port 80 (not 8080)
HTTP_PORT=80
HTTPS_PORT=443

# Leave these empty if using IP (no domain)
DOMAIN=
EMAIL=
TLS_CONFIG=
```

## Step 3: Deploy Services

### Option A: Full Docker (Recommended for Production)

```bash
# Build and start all services
docker compose -f docker-compose.yml up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Option B: Hybrid (Backend Docker + Frontend PM2)

```bash
# This is better if frontend Docker build keeps failing
./scripts/deploy-hybrid.sh

# Check status
docker compose -f docker-compose.backend-only.yml ps
pm2 status
```

### Option C: Manual Frontend Docker Build

```bash
# Use this if you already manually built frontend successfully
./scripts/build-docker-manual.sh
```

## Step 4: Verify Services

```bash
# Check if services are running
docker compose ps

# Test backend API
curl http://localhost:8000/api/v1/

# Test frontend
curl http://localhost:3000

# Test via Caddy (port 80)
curl http://localhost/
```

## Step 5: Access from Network

From another computer on your network:

```bash
# Replace with your server IP (e.g., 192.168.0.231)
curl http://YOUR_SERVER_IP
```

**Service URLs:**
- Frontend: `http://YOUR_SERVER_IP`
- Backend API: `http://YOUR_SERVER_IP/api/v1/`
- Grafana: `http://YOUR_SERVER_IP:3002`
- Prometheus: `http://YOUR_SERVER_IP:9090`

## Troubleshooting

### Backend returns 400 Bad Request

**Cause:** IP not in ALLOWED_HOSTS

**Fix:**
```bash
# Edit .env and add your IP
nano .env

# Add to ALLOWED_HOSTS line:
ALLOWED_HOSTS=localhost,127.0.0.1,YOUR_IP,backend

# Restart backend
docker compose restart backend
```

### Can't access on port 80

**Check if Caddy is running:**
```bash
docker compose ps caddy
docker compose logs caddy
```

**Check if port 80 is in use:**
```bash
sudo netstat -tulpn | grep :80
```

**Check firewall:**
```bash
sudo ufw status
sudo ufw allow 80/tcp
```

### Frontend build fails in Docker

**Use PM2 deployment instead:**
```bash
./scripts/deploy-hybrid.sh
```

This builds frontend directly on server without Docker.

## Database Setup

### Create superuser for Django admin:

```bash
docker compose exec backend uv run python manage.py createsuperuser
```

### Run seed data (optional):

```bash
docker compose exec backend uv run python manage.py seed_indonesian_data
```

## Monitoring

- **Grafana:** `http://YOUR_IP:3002` (admin/admin)
- **Prometheus:** `http://YOUR_IP:9090`
- **Caddy Metrics:** `http://YOUR_IP:2019/metrics`

## Stopping Services

```bash
# Stop all
docker compose down

# Stop but keep data
docker compose stop

# Stop and remove volumes (⚠️ deletes database!)
docker compose down -v
```

## Updating

```bash
git pull origin main
docker compose build --no-cache
docker compose up -d
```
