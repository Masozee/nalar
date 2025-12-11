#!/bin/bash
# Build frontend Docker image using manual Dockerfile method
# This mimics your successful manual build process

set -e

echo "🐳 Building Frontend Docker (Manual Method)"
echo ""

cd "$(dirname "$0")/.."

# Step 1: Switch to manual Dockerfile
echo "Step 1: Switching to manual Dockerfile..."
./scripts/use-manual-dockerfile.sh

echo ""
echo "Step 2: Removing old containers and images..."
docker compose stop frontend 2>/dev/null || true
docker compose rm -f frontend 2>/dev/null || true

# Remove old images
docker rmi $(docker images | grep 'nalar.*frontend' | awk '{print $3}') 2>/dev/null || true

echo ""
echo "Step 3: Building frontend (this may take a few minutes)..."
docker compose build --no-cache --progress=plain frontend

echo ""
echo "Step 4: Starting container..."
docker compose up -d frontend

echo ""
echo "✅ Frontend deployed successfully!"
echo ""
docker compose ps frontend
echo ""
echo "View logs: docker compose logs -f frontend"
