# Production Setup Guide

## Simple 3-Step Setup

### Step 1: Edit .env.production

```bash
nano .env.production
```

**Update these lines with your server IP (e.g., 192.168.0.231):**

```bash
# Django - ADD YOUR SERVER IP HERE
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.0.231,backend

# CORS - ADD YOUR SERVER IP HERE
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://192.168.0.231

# Frontend URL - USE YOUR SERVER IP
FRONTEND_URL=http://192.168.0.231

# Caddy - Use port 80 for production
HTTP_PORT=80
HTTPS_PORT=443
```

Save and exit (Ctrl+X, Y, Enter)

### Step 2: Deploy

```bash
# Full Docker deployment
docker compose up -d

# OR use hybrid (if frontend Docker build fails)
./scripts/deploy-hybrid.sh
```

### Step 3: Verify

```bash
# Check all services are running
docker compose ps

# Test backend
curl http://YOUR_IP:8000/api/v1/health/

# Test frontend (via Caddy)
curl http://YOUR_IP/
```

---

## Access Services

Replace `YOUR_IP` with your server IP (e.g., 192.168.0.231):

- **Frontend:** `http://YOUR_IP`
- **Backend API:** `http://YOUR_IP/api/v1/`
- **Django Admin:** `http://YOUR_IP:8000/admin/`
- **Grafana:** `http://YOUR_IP:3002` (admin/admin)
- **Prometheus:** `http://YOUR_IP:9090`

---

## Common Issues

### Backend returns 400 Bad Request

**Fix:** Add your server IP to `ALLOWED_HOSTS` in `.env.production`

```bash
nano .env.production
# Add your IP: ALLOWED_HOSTS=localhost,127.0.0.1,YOUR_IP,backend
docker compose restart backend
```

### Frontend keeps restarting

**Fix:** Use PM2 deployment instead of Docker

```bash
./scripts/deploy-hybrid.sh
```

### Can't access from external network

**Fix:** Open firewall ports

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3002/tcp
sudo ufw allow 9090/tcp
```

---

## File Structure

**Only edit THIS file on your server:**
- `.env.production` - Your production configuration

**Don't edit these:**
- `.env.example` - Template only
- `.env.production.example` - Template only
- `.env.development` - Development only

---

## Updating

```bash
git pull origin main
docker compose build
docker compose up -d
```

**Your `.env.production` changes are preserved!** Git won't overwrite it.
