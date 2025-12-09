# Nalar ERP - Production Deployment Guide

## Prerequisites

- Server with Ubuntu 20.04+ or similar Linux distribution
- Docker or Podman installed
- Domain name pointing to your server
- Ports 80 and 443 open in firewall
- At least 4GB RAM, 2 CPU cores, 50GB storage
- AWS account for Rekognition (optional, for face recognition)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/nalar.git
cd nalar
```

### 2. Configure Environment

```bash
# Copy example configuration
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Required changes:**
- `DOMAIN=yourdomain.com`
- `LETSENCRYPT_EMAIL=admin@yourdomain.com`
- `SECRET_KEY=<generate-random-key>`
- `POSTGRES_PASSWORD=<strong-password>`
- `REDIS_PASSWORD=<strong-password>`
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (for face recognition)

**Generate SECRET_KEY:**
```bash
python3 -c "from secrets import token_urlsafe; print(token_urlsafe(50))"
```

### 3. Update DNS Records

Point your domain to your server's IP address:

```
A     yourdomain.com           -> YOUR_SERVER_IP
A     api.yourdomain.com       -> YOUR_SERVER_IP
A     grafana.yourdomain.com   -> YOUR_SERVER_IP
A     s3.yourdomain.com        -> YOUR_SERVER_IP
A     storage.yourdomain.com   -> YOUR_SERVER_IP
```

### 4. Build and Start Services

```bash
# Build images
podman-compose --env-file .env.production build

# Start services
podman-compose --env-file .env.production up -d

# Check logs
podman-compose --env-file .env.production logs -f
```

### 5. Run Database Migrations

```bash
# Run migrations
podman exec nalar_backend python manage.py migrate

# Create superuser
podman exec -it nalar_backend python manage.py createsuperuser

# Collect static files
podman exec nalar_backend python manage.py collectstatic --noinput
```

### 6. Verify Deployment

- Frontend: `https://yourdomain.com`
- Backend Admin: `https://api.yourdomain.com/admin/`
- Grafana: `https://grafana.yourdomain.com`
- RustFS Console: `https://storage.yourdomain.com`

## SSL Certificate Setup

Caddy automatically obtains SSL certificates from Let's Encrypt when:

1. Your domain is correctly pointed to your server
2. Ports 80 and 443 are accessible
3. `TLS_CONFIG=tls {$EMAIL}` is set in `.env.production`

**First request may take 30-60 seconds** while Caddy obtains certificates.

## Configuration Details

### Port Configuration

**Production (recommended):**
```env
HTTP_PORT=80
HTTPS_PORT=443
```

**Development (if testing locally):**
```env
HTTP_PORT=8080
HTTPS_PORT=8443
```

### Database Backup

Create automated backups:

```bash
# Create backup script
cat > /usr/local/bin/backup-nalar.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/nalar"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
podman exec nalar_db pg_dump -U nalar nalar | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup RustFS data
podman exec nalar_rustfs tar czf - /data | cat > $BACKUP_DIR/rustfs_$DATE.tar.gz

# Delete backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-nalar.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-nalar.sh") | crontab -
```

### AWS Rekognition Setup

1. **Create IAM User:**
   - Go to AWS IAM Console
   - Create new user with programmatic access
   - Attach policy: `AmazonRekognitionFullAccess`
   - Save Access Key ID and Secret Access Key

2. **Create Collection:**
```bash
aws rekognition create-collection \
  --collection-id nalar-employees \
  --region us-east-1
```

3. **Update `.env.production`:**
```env
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_REKOGNITION_COLLECTION_ID=nalar-employees
```

## Monitoring & Maintenance

### View Logs

```bash
# All services
podman-compose --env-file .env.production logs -f

# Specific service
podman logs -f nalar_backend
podman logs -f nalar_frontend
podman logs -f nalar_caddy
```

### Service Management

```bash
# Restart a service
podman restart nalar_backend

# Stop all services
podman-compose --env-file .env.production down

# Start all services
podman-compose --env-file .env.production up -d

# Rebuild after code changes
podman-compose --env-file .env.production build backend frontend
podman-compose --env-file .env.production up -d
```

### Database Access

```bash
# PostgreSQL shell
podman exec -it nalar_db psql -U nalar -d nalar

# Redis CLI
podman exec -it nalar_redis redis-cli
```

### Performance Monitoring

Access Grafana at `https://grafana.yourdomain.com`:
- Default credentials: `admin` / (password from `.env.production`)
- Pre-configured dashboards for Django, PostgreSQL, Redis

## Troubleshooting

### SSL Certificate Issues

```bash
# Check Caddy logs
podman logs nalar_caddy

# Verify DNS is correct
nslookup yourdomain.com
dig yourdomain.com

# Test port accessibility
curl -I http://yourdomain.com
```

### Backend Not Starting

```bash
# Check backend logs
podman logs nalar_backend

# Common issues:
# 1. Database connection - verify POSTGRES_* variables
# 2. Redis connection - verify REDIS_* variables
# 3. Missing migrations - run: podman exec nalar_backend python manage.py migrate
```

### Database Connection Errors

```bash
# Check if PostgreSQL is running
podman exec nalar_db pg_isready

# Check database logs
podman logs nalar_db

# Verify credentials match .env.production
```

## Security Best Practices

1. **Change default passwords** for PostgreSQL, Redis, Grafana
2. **Use strong SECRET_KEY** (50+ random characters)
3. **Enable firewall** - only allow ports 80, 443, 22
4. **Regular updates:**
   ```bash
   podman-compose --env-file .env.production pull
   podman-compose --env-file .env.production up -d
   ```
5. **Setup monitoring alerts** in Grafana
6. **Regular backups** (automated daily)
7. **Use environment variables** - never hardcode secrets

## Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild images
podman-compose --env-file .env.production build

# Run migrations
podman exec nalar_backend python manage.py migrate

# Restart services
podman-compose --env-file .env.production up -d

# Collect static files
podman exec nalar_backend python manage.py collectstatic --noinput
```

## Scaling Considerations

### Horizontal Scaling

For high-traffic deployments:

1. **Load Balancer** - Add HAProxy/Nginx in front of multiple backend instances
2. **Database Replication** - Setup PostgreSQL primary-replica
3. **Redis Cluster** - For distributed caching
4. **Separate Static Storage** - Use AWS S3 instead of RustFS

### Vertical Scaling

Adjust resources in `.env.production`:

```env
# More workers for backend
GUNICORN_WORKERS=9  # (2 * CPU_CORES) + 1

# Larger database pool
DB_POOL_SIZE=50
DB_MAX_OVERFLOW=20
```

## Support

- Documentation: https://docs.nalar.app (if available)
- Issues: https://github.com/your-org/nalar/issues
- Email: support@yourdomain.com

## License

[Your License Here]
