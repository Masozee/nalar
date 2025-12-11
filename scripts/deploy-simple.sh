#!/bin/bash
# Simplest possible deployment - removes all Docker cache issues
# Usage: ./scripts/deploy-simple.sh

set -e

echo "🚀 Simple Docker Deployment (No Cache, No BS)"
echo ""

cd "$(dirname "$0")/.."

# Step 1: Stop and remove old frontend container
echo "🛑 Removing old frontend container and image..."
docker compose stop frontend 2>/dev/null || true
docker compose rm -f frontend 2>/dev/null || true
docker rmi nalar-frontend:latest 2>/dev/null || true
docker rmi $(docker images -q 'nalar*frontend*') 2>/dev/null || true

# Step 2: Use production Dockerfile
echo "📝 Switching to production Dockerfile..."
cd frontend
if [ -f "Dockerfile" ]; then
    mv Dockerfile Dockerfile.backup.$(date +%s)
fi
cp Dockerfile.production Dockerfile
cd ..

# Step 3: Build with absolutely no cache
echo "🔨 Building frontend (this will take a few minutes)..."
docker compose build --no-cache --pull frontend

# Step 4: Start container
echo "▶️  Starting frontend container..."
docker compose up -d frontend

# Step 5: Check status
echo ""
echo "✅ Deployment complete!"
echo ""
docker compose ps frontend
echo ""
echo "Check logs: docker compose logs -f frontend"
