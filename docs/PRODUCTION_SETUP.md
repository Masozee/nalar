# Production Setup Guide

## Prerequisites

1. **Docker Desktop** must be running
2. **Environment variables** configured in `.env.production`

## Quick Start

### 1. Start Docker Desktop
```bash
open -a Docker
```

Wait for Docker Desktop to fully start (check the menu bar icon).

### 2. Build Services
```bash
docker compose --env-file .env.production build
```

### 3. Start All Services
```bash
docker compose --env-file .env.production up -d
```

### 4. Run Database Migrations
```bash
docker exec -it nalar_backend uv run python manage.py migrate
```

### 5. Create Superuser
```bash
docker exec -it nalar_backend uv run python manage.py createsuperuser
```

### 6. Collect Static Files
```bash
docker exec -it nalar_backend uv run python manage.py collectstatic --noinput
```

## Verify Services

### Check All Services Status
```bash
docker compose ps
```

Expected output:
- `nalar_db` (postgres) - healthy
- `nalar_redis` (redis) - healthy
- `nalar_backend` (django) - running
- `nalar_frontend` (nextjs) - running

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Test Endpoints

**Backend API:**
```bash
curl http://localhost:8000/api/v1/health/
```

**Frontend:**
```bash
curl http://localhost:3000
```

## Service URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/v1
- **Admin Panel:** http://localhost:8000/admin
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker compose logs backend

# Rebuild backend
docker compose build --no-cache backend
docker compose up -d backend
```

### Database Connection Issues
```bash
# Check PostgreSQL health
docker exec -it nalar_db pg_isready -U nalar

# View PostgreSQL logs
docker compose logs postgres
```

### Frontend Build Errors
```bash
# Check logs
docker compose logs frontend

# Rebuild frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Reset Everything
```bash
# Stop all services
docker compose down

# Remove volumes (WARNING: destroys data)
docker compose down -v

# Rebuild and restart
docker compose build --no-cache
docker compose up -d
```

## Development vs Production

### Development (Current Setup)
- Uses `.env.production` for local testing
- Exposed ports for all services
- Debug logging enabled in development

### Production Deployment
1. Update `.env.production` with strong passwords
2. Change `SECRET_KEY` to a secure random value
3. Set `DEBUG=False`
4. Configure proper domain names in `ALLOWED_HOSTS`
5. Use reverse proxy (nginx/traefik) for SSL
6. Set up backup strategy for PostgreSQL
7. Configure log aggregation
8. Set up monitoring (Prometheus/Grafana)

## Stopping Services

### Stop All Services
```bash
docker compose down
```

### Stop Specific Service
```bash
docker compose stop backend
```

### Stop and Remove Volumes
```bash
docker compose down -v
```

## Updating Services

### Update Backend Code
```bash
# Rebuild backend
docker compose build backend

# Restart backend
docker compose up -d backend

# Run migrations if needed
docker exec -it nalar_backend uv run python manage.py migrate
```

### Update Frontend Code
```bash
# Rebuild frontend
docker compose build frontend

# Restart frontend
docker compose up -d frontend
```

## Environment Variables

Edit `.env.production` to configure:

```env
# Security
DEBUG=False
SECRET_KEY=<generate-with-openssl-rand-hex-32>

# Database
POSTGRES_DB=nalar
POSTGRES_USER=nalar
POSTGRES_PASSWORD=<strong-password>

# Redis
REDIS_PASSWORD=<strong-password>

# Django
ALLOWED_HOSTS=localhost,yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

## Health Checks

The compose file includes health checks for PostgreSQL and Redis:

- **PostgreSQL:** Checks `pg_isready` every 10s
- **Redis:** Checks connection every 10s

Backend and Frontend services wait for database health before starting.
