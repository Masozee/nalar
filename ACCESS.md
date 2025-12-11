# Service Access Guide

## Direct IP Access (No Domain Required)

After running `docker compose up -d`, access services via IP address:

### Main Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | `http://YOUR_IP:80` | Main application UI |
| **Backend API** | `http://YOUR_IP/api/v1/` | Django REST API |
| **Admin Panel** | `http://YOUR_IP:8000/admin/` | Django admin (direct) |
| **Grafana** | `http://YOUR_IP:3002` | Monitoring dashboards |
| **Prometheus** | `http://YOUR_IP:9090` | Metrics & alerts |

### Storage & Database

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| **RustFS Console** | `http://YOUR_IP:9001` | 9001 | S3-compatible storage UI |
| **RustFS S3 API** | `http://YOUR_IP:9000` | 9000 | S3 API endpoint |
| **PostgreSQL** | `YOUR_IP:5432` | 5432 | Database (internal) |
| **PgBouncer** | `YOUR_IP:6432` | 6432 | Connection pooler |
| **Redis** | `YOUR_IP:6379` | 6379 | Cache (requires password) |

### Monitoring Metrics

| Service | Port | Description |
|---------|------|-------------|
| Node Exporter | 9100 | System metrics |
| Postgres Exporter | 9187 | Database metrics |
| Redis Exporter | 9121 | Cache metrics |
| Blackbox Exporter | 9115 | Health check probes |
| Caddy Metrics | 2019 | Reverse proxy metrics |

---

## With Domain Name (Production)

Set these environment variables in `.env`:

```bash
DOMAIN=yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com
TLS_CONFIG="tls {$EMAIL}"
```

Then access via:

| Service | URL |
|---------|-----|
| Frontend | `https://yourdomain.com` |
| Backend API | `https://api.yourdomain.com` |
| Grafana | `https://grafana.yourdomain.com` |
| Prometheus | `https://prometheus.yourdomain.com` |
| RustFS Console | `https://storage.yourdomain.com` |
| RustFS S3 API | `https://s3.yourdomain.com` |

Caddy will automatically provision SSL certificates via Let's Encrypt.

---

## Default Credentials

### Grafana
- **Username:** `admin`
- **Password:** `admin` (change on first login)

### RustFS (MinIO)
- **Username:** `rustfsadmin`
- **Password:** `rustfsadmin`

### Django Admin
Create superuser first:
```bash
docker compose exec backend uv run python manage.py createsuperuser
```

### PostgreSQL
- **User:** `nalar`
- **Password:** Set in `.env` as `POSTGRES_PASSWORD`
- **Database:** `nalar`

### Redis
- **Password:** Set in `.env` as `REDIS_PASSWORD`

---

## Firewall Configuration

If services are not accessible, open these ports:

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3002/tcp  # Grafana
sudo ufw allow 9090/tcp  # Prometheus
sudo ufw allow 9001/tcp  # RustFS Console

# Check status
sudo ufw status
```

---

## Quick Health Check

```bash
# Check all services are running
docker compose ps

# Check Caddy is working
curl http://localhost:80

# Check backend API
curl http://localhost/api/v1/health/

# Check Grafana
curl http://localhost:3002

# Check Prometheus
curl http://localhost:9090/-/healthy
```

---

## Troubleshooting

### Can't access services from external IP

1. Check Docker containers are running:
   ```bash
   docker compose ps
   ```

2. Check Caddy logs:
   ```bash
   docker compose logs caddy
   ```

3. Verify firewall rules:
   ```bash
   sudo ufw status
   ```

4. Check if ports are listening:
   ```bash
   sudo netstat -tulpn | grep -E '(80|443|3002|9090)'
   ```

### Services work on localhost but not external IP

Check `ALLOWED_HOSTS` in backend `.env`:
```bash
ALLOWED_HOSTS=localhost,127.0.0.1,YOUR_SERVER_IP,your-domain.com
```

Then restart:
```bash
docker compose restart backend caddy
```

### SSL certificate errors

Let's Encrypt requires:
- Valid domain name pointing to your server
- Port 80 and 443 accessible from internet
- Email set in `LETSENCRYPT_EMAIL`

For development/testing, leave `TLS_CONFIG` empty to use HTTP only.

---

## Security Notes

⚠️ **Important for Production:**

1. Change all default passwords in `.env`
2. Set `DEBUG=False` in backend
3. Configure firewall (don't expose internal ports publicly)
4. Use strong `SECRET_KEY` for Django
5. Enable HTTPS by setting `DOMAIN` and `TLS_CONFIG`
6. Restrict Grafana/Prometheus access with authentication
