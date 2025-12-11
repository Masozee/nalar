#!/bin/bash
# Quick script to switch to the simple Dockerfile
# Use this if standalone builds keep failing

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Switching to Simple Dockerfile (Non-Standalone Mode)       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/.."

if [ ! -f "frontend/Dockerfile.simple" ]; then
    echo "❌ Error: frontend/Dockerfile.simple not found"
    echo "   Make sure you're in the project root directory"
    exit 1
fi

# Backup current Dockerfile
if [ -f "frontend/Dockerfile" ]; then
    echo "📋 Backing up current Dockerfile..."
    mv frontend/Dockerfile frontend/Dockerfile.standalone.backup
    echo "   ✓ Saved to frontend/Dockerfile.standalone.backup"
fi

# Use simple Dockerfile
echo "🔄 Switching to simple Dockerfile..."
cp frontend/Dockerfile.simple frontend/Dockerfile
echo "   ✓ frontend/Dockerfile now uses simple (non-standalone) mode"

echo ""
echo "✅ Done! The simple Dockerfile is now active."
echo ""
echo "This Dockerfile:"
echo "  • Doesn't use standalone mode"
echo "  • Is more reliable on resource-constrained servers"
echo "  • Has faster build times"
echo "  • Produces larger images (but more stable)"
echo ""
echo "Next steps:"
echo "  1. Build: docker compose build --no-cache frontend"
echo "  2. Start: docker compose up -d"
echo ""
echo "To revert:"
echo "  mv frontend/Dockerfile.standalone.backup frontend/Dockerfile"
echo ""
