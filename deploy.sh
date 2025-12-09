#!/bin/bash
# Nalar ERP Production Deployment Script
# Run this on your Ubuntu server to deploy/update the application

set -e  # Exit on error

echo "========================================="
echo "Nalar ERP - Production Deployment"
echo "========================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  This script should be run with sudo or as root"
    echo "Usage: sudo bash deploy.sh"
    exit 1
fi

# Configuration
DEPLOY_DIR="/home/deploy/nalar"
REPO_URL="https://github.com/Masozee/nalar.git"
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 Deployment Configuration:"
echo "   Deploy Directory: $DEPLOY_DIR"
echo "   Repository: $REPO_URL"
echo "   Branch: $BRANCH"
echo ""

# Step 1: Create deploy directory if not exists
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "📁 Creating deployment directory..."
    mkdir -p "$DEPLOY_DIR"
    echo -e "${GREEN}✓${NC} Directory created"
else
    echo -e "${GREEN}✓${NC} Deployment directory exists"
fi

# Step 2: Clone or pull repository
cd "$DEPLOY_DIR"
if [ ! -d ".git" ]; then
    echo "📦 Cloning repository..."
    git clone "$REPO_URL" .
    echo -e "${GREEN}✓${NC} Repository cloned"
else
    echo "🔄 Pulling latest changes..."
    git fetch origin
    git reset --hard origin/$BRANCH
    echo -e "${GREEN}✓${NC} Repository updated"
fi

# Step 3: Check for .env.production
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found!${NC}"
    echo "Please create .env.production file with your production credentials."
    echo "Template available in: .env.production.example"
    echo ""
    echo "Run: cp .env.production.example .env.production"
    echo "Then edit .env.production with your actual values"
    exit 1
else
    echo -e "${GREEN}✓${NC} .env.production found"
fi

# Step 4: Stop running containers
echo "🛑 Stopping running containers..."
docker-compose --env-file .env.production down 2>/dev/null || true
echo -e "${GREEN}✓${NC} Containers stopped"

# Step 5: Pull latest images
echo "📥 Pulling Docker images..."
docker-compose --env-file .env.production pull
echo -e "${GREEN}✓${NC} Images pulled"

# Step 6: Build custom images (backend & frontend)
echo "🔨 Building backend and frontend..."
docker-compose --env-file .env.production build backend frontend
echo -e "${GREEN}✓${NC} Images built"

# Step 7: Start services
echo "🚀 Starting services..."
docker-compose --env-file .env.production up -d
echo -e "${GREEN}✓${NC} Services started"

# Step 8: Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Step 9: Run database migrations
echo "📊 Running database migrations..."
docker exec nalar_backend python manage.py migrate --noinput
echo -e "${GREEN}✓${NC} Migrations completed"

# Step 10: Collect static files
echo "📦 Collecting static files..."
docker exec nalar_backend python manage.py collectstatic --noinput
echo -e "${GREEN}✓${NC} Static files collected"

# Step 11: Show running containers
echo ""
echo "========================================="
echo "🎉 Deployment Complete!"
echo "========================================="
echo ""
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Step 12: Display access URLs
DOMAIN=$(grep "^DOMAIN=" .env.production | cut -d'=' -f2)
HTTP_PORT=$(grep "^HTTP_PORT=" .env.production | cut -d'=' -f2)
HTTPS_PORT=$(grep "^HTTPS_PORT=" .env.production | cut -d'=' -f2)

echo "📍 Access your application:"
if [ "$DOMAIN" != "localhost" ]; then
    echo "   Frontend: https://${DOMAIN}"
    echo "   Backend API: https://api.${DOMAIN}"
    echo "   Grafana: https://grafana.${DOMAIN}"
    echo "   RustFS Console: https://storage.${DOMAIN}"
else
    echo "   Frontend: http://localhost:${HTTP_PORT:-80}"
    echo "   Backend API: http://localhost:8000"
    echo "   Grafana: http://localhost:3001"
    echo "   RustFS Console: http://localhost:9001"
fi
echo ""

# Step 13: Show logs command
echo "📝 View logs:"
echo "   All services: docker-compose --env-file .env.production logs -f"
echo "   Backend only: docker logs -f nalar_backend"
echo "   Frontend only: docker logs -f nalar_frontend"
echo ""

echo "✅ Deployment successful!"
