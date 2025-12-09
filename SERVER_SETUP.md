# Production Server Setup Guide

## Quick Start (Ubuntu Server)

### 1. Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and dependencies
sudo apt install -y docker docker compose git

# Verify installation
docker --version
docker compose --version
```

### 2. Clone Repository

```bash
# Create deploy directory
sudo mkdir -p /home/deploy
cd /home/deploy

# Clone repository
sudo git clone https://github.com/Masozee/nalar.git
cd nalar
```

### 3. Configure Environment

```bash
# Copy environment template
sudo cp .env.production.example .env.production

# Edit with your production values
sudo nano .env.production
```

**Required changes in .env.production:**
- `DOMAIN=yourdomain.com` - Your actual domain
- `LETSENCRYPT_EMAIL=admin@yourdomain.com` - For SSL certificates
- `TLS_CONFIG=tls {$EMAIL}` - Enables HTTPS
- `HTTP_PORT=80` - Use standard HTTP port
- `HTTPS_PORT=443` - Use standard HTTPS port
- Database, Redis, and RustFS passwords are already production-grade ✅
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` - Add your actual AWS keys

### 4. Configure DNS

Point your domain to your server's IP address:

```
A     yourdomain.com           -> YOUR_SERVER_IP
A     api.yourdomain.com       -> YOUR_SERVER_IP
A     grafana.yourdomain.com   -> YOUR_SERVER_IP
A     s3.yourdomain.com        -> YOUR_SERVER_IP
A     storage.yourdomain.com   -> YOUR_SERVER_IP
```

### 5. Open Firewall Ports

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH

# Enable firewall
sudo ufw enable
sudo ufw status
```

### 6. Deploy Application

```bash
# Run deployment script
cd /home/deploy/nalar
sudo bash deploy.sh
```

The script will:
- ✅ Pull latest code from GitHub
- ✅ Build Docker images
- ✅ Start all services
- ✅ Run database migrations
- ✅ Configure SSL certificates (automatic via Caddy)

### 7. Verify Deployment

```bash
# Check running containers
docker ps

# Check logs
docker logs -f nalar_backend
docker logs -f nalar_caddy

# Test endpoints
curl http://localhost:8000/admin/
curl https://yourdomain.com
```

## Update Application

To update to the latest version:

```bash
cd /home/deploy/nalar
sudo bash deploy.sh
```

The script automatically:
1. Pulls latest code
2. Rebuilds images
3. Runs migrations
4. Restarts services

## Service Management

### Start/Stop Services

```bash
# Stop all services
cd /home/deploy/nalar
sudo docker compose --env-file .env.production down

# Start all services
sudo docker compose --env-file .env.production up -d

# Restart a specific service
sudo docker restart nalar_backend
```

### View Logs

```bash
# All services
sudo docker compose --env-file .env.production logs -f

# Specific service
sudo docker logs -f nalar_backend
sudo docker logs -f nalar_frontend
sudo docker logs -f nalar_caddy
```

### Database Access

```bash
# PostgreSQL shell
sudo docker exec -it nalar_db psql -U nalar_prod -d nalar

# Redis CLI
sudo docker exec -it nalar_redis redis-cli
# AUTH <your-redis-password>
```

### Run Django Commands

```bash
# Create superuser
sudo docker exec -it nalar_backend python manage.py createsuperuser

# Run migrations
sudo docker exec nalar_backend python manage.py migrate

# Django shell
sudo docker exec -it nalar_backend python manage.py shell
```

## Monitoring

Access Grafana at `https://grafana.yourdomain.com`:
- Username: `admin`
- Password: (from `GRAFANA_ADMIN_PASSWORD` in .env.production)

Pre-configured dashboards for:
- Django application metrics
- PostgreSQL performance
- Redis cache statistics
- System resources

## Backup

### Manual Backup

```bash
# Create backup directory
sudo mkdir -p /backups/nalar

# Backup database
sudo docker exec nalar_db pg_dump -U nalar_prod nalar | gzip > /backups/nalar/db_$(date +%Y%m%d).sql.gz

# Backup RustFS data
sudo docker exec nalar_rustfs tar czf - /data > /backups/nalar/rustfs_$(date +%Y%m%d).tar.gz
```

### Automated Backup (Cron)

```bash
# Create backup script
sudo nano /usr/local/bin/backup-nalar.sh
```

Paste:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/nalar"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec nalar_db pg_dump -U nalar_prod nalar | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup RustFS
docker exec nalar_rustfs tar czf - /data > $BACKUP_DIR/rustfs_$DATE.tar.gz

# Delete backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-nalar.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
```

Add line:
```
0 2 * * * /usr/local/bin/backup-nalar.sh
```

## Troubleshooting

### SSL Certificate Issues

```bash
# Check Caddy logs
sudo docker logs nalar_caddy

# Verify DNS
dig yourdomain.com

# Test port accessibility
curl -I http://yourdomain.com
```

### Database Connection Errors

```bash
# Check if PostgreSQL is running
sudo docker exec nalar_db pg_isready

# Verify credentials in .env.production
# Make sure POSTGRES_USER and POSTGRES_PASSWORD match
```

### Service Won't Start

```bash
# Check container logs
sudo docker logs nalar_backend

# Check all containers
sudo docker ps -a

# Remove and recreate
sudo docker compose --env-file .env.production down
sudo docker compose --env-file .env.production up -d
```

## Security Checklist

- ✅ Use production-grade passwords (already configured)
- ✅ Enable HTTPS with Let's Encrypt (automatic)
- ✅ Configure firewall (ports 80, 443, 22 only)
- ✅ Regular backups (automated)
- ✅ Keep system updated (`sudo apt update && sudo apt upgrade`)
- ✅ Monitor logs regularly
- ✅ Use separate credentials for each service
- ❌ Never commit .env.production to git
- ❌ Never share server credentials

## Support

- Documentation: [DEPLOYMENT.md](DEPLOYMENT.md)
- Issues: https://github.com/Masozee/nalar/issues
- Deployment Guide: This file

## Next Steps

After deployment:
1. Create admin user: `sudo docker exec -it nalar_backend python manage.py createsuperuser`
2. Access admin: `https://api.yourdomain.com/admin/`
3. Configure AWS Rekognition (if using face recognition)
4. Set up automated backups
5. Monitor application via Grafana

---

🚀 Your Nalar ERP is ready for production!
