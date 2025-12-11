#!/bin/bash
# Deploy Next.js directly with PM2 (without Docker)
# Usage: ./scripts/deploy-frontend-pm2.sh

set -e

echo "🚀 Deploying Frontend with PM2 (No Docker)"

cd "$(dirname "$0")/../frontend"

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit --legacy-peer-deps

# Step 2: Build Next.js
echo "🔨 Building Next.js application..."
NODE_ENV=production npm run build

# Step 3: Stop existing PM2 process if running
echo "🛑 Stopping existing PM2 process..."
pm2 stop nalar-frontend 2>/dev/null || true
pm2 delete nalar-frontend 2>/dev/null || true

# Step 4: Start with PM2
echo "▶️  Starting with PM2..."
pm2 start ecosystem.config.js --name nalar-frontend

# Step 5: Save PM2 config
pm2 save

echo "✅ Frontend deployed successfully!"
echo ""
echo "Check status: pm2 status"
echo "View logs: pm2 logs nalar-frontend"
echo "Restart: pm2 restart nalar-frontend"
