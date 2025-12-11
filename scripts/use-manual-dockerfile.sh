#!/bin/bash
# Switch to manual Dockerfile (the one that works like manual build)

set -e

echo "🔄 Switching to Manual Dockerfile"

cd "$(dirname "$0")/../frontend"

# Backup current Dockerfile
if [ -f "Dockerfile" ]; then
    TIMESTAMP=$(date +%s)
    mv Dockerfile "Dockerfile.backup.$TIMESTAMP"
    echo "✓ Backed up existing Dockerfile to Dockerfile.backup.$TIMESTAMP"
fi

# Use manual Dockerfile
cp Dockerfile.manual Dockerfile
echo "✓ Now using Dockerfile.manual"
echo ""
echo "Build with: docker compose build --no-cache frontend"
