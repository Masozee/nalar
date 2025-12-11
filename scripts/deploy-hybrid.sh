#!/bin/bash
# Hybrid deployment: Backend in Docker, Frontend with PM2
# Usage: ./scripts/deploy-hybrid.sh

set -e

echo "🚀 Hybrid Deployment: Backend (Docker) + Frontend (PM2)"
echo ""

cd "$(dirname "$0")/.."

# Step 1: Start backend services with Docker
echo "🐳 Starting backend services with Docker..."
docker compose -f docker-compose.backend-only.yml up -d

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Step 2: Deploy frontend with PM2
echo ""
echo "📦 Building and deploying frontend with PM2..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci --prefer-offline --no-audit --legacy-peer-deps
fi

# Build Next.js
echo "🔨 Building Next.js..."
NODE_ENV=production npm run build

# Stop existing PM2 process
echo "🛑 Stopping existing PM2 process..."
pm2 stop nalar-frontend 2>/dev/null || true
pm2 delete nalar-frontend 2>/dev/null || true

# Start with PM2
echo "▶️  Starting frontend with PM2..."
pm2 start ecosystem.config.js --name nalar-frontend

# Save PM2 config
pm2 save

cd ..

echo ""
echo "✅ Hybrid deployment completed successfully!"
echo ""
echo "Backend (Docker): http://localhost:8000"
echo "Frontend (PM2):   http://localhost:3000"
echo ""
echo "Commands:"
echo "  Backend:  docker compose -f docker-compose.backend-only.yml logs -f"
echo "  Frontend: pm2 logs nalar-frontend"
echo "  PM2 Status: pm2 status"
