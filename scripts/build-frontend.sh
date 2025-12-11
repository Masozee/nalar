#!/bin/bash
# Solution A: Enhanced Frontend Build Script with Error Diagnosis
# This script provides detailed error reporting for Next.js build failures

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔧 Nalar Frontend - Enhanced Build Script                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_LOG="build-frontend.log"
CLEANUP=${CLEANUP:-true}

# Step 1: Check prerequisites
echo -e "${BLUE}[1/6]${NC} Checking prerequisites..."
echo ""

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found${NC}"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose found${NC}"
echo ""

# Step 2: Check system resources
echo -e "${BLUE}[2/6]${NC} Checking system resources..."
echo ""

TOTAL_MEM=$(free -m | awk 'NR==2 {print $2}')
AVAILABLE_MEM=$(free -m | awk 'NR==2 {print $7}')

echo "Total Memory: ${TOTAL_MEM}MB"
echo "Available Memory: ${AVAILABLE_MEM}MB"

if [ "$AVAILABLE_MEM" -lt 4096 ]; then
    echo -e "${YELLOW}⚠ Warning: Less than 4GB available memory${NC}"
    echo -e "${YELLOW}  Recommended: Add swap or use Dockerfile.simple${NC}"
fi

if [ "$AVAILABLE_MEM" -ge 8192 ]; then
    echo -e "${GREEN}✓ Sufficient memory available${NC}"
fi

echo ""

# Step 3: Clean Docker cache
if [ "$CLEANUP" = "true" ]; then
    echo -e "${BLUE}[3/6]${NC} Cleaning Docker cache..."
    echo ""

    docker builder prune -af
    docker system prune -f

    echo -e "${GREEN}✓ Docker cache cleaned${NC}"
    echo ""
else
    echo -e "${BLUE}[3/6]${NC} Skipping cache cleanup (CLEANUP=false)"
    echo ""
fi

# Step 4: Build frontend
echo -e "${BLUE}[4/6]${NC} Building frontend Docker image..."
echo ""
echo "This may take 5-15 minutes depending on your system..."
echo "Logs will be saved to: $BUILD_LOG"
echo ""

if docker compose build --no-cache --progress=plain frontend 2>&1 | tee "$BUILD_LOG"; then
    echo ""
    echo -e "${GREEN}✓ Frontend build completed successfully${NC}"
    BUILD_SUCCESS=true
else
    echo ""
    echo -e "${RED}✗ Frontend build failed${NC}"
    BUILD_SUCCESS=false
fi

echo ""

# Step 5: Analyze build logs
echo -e "${BLUE}[5/6]${NC} Analyzing build logs..."
echo ""

if [ "$BUILD_SUCCESS" = false ]; then
    echo -e "${RED}=== BUILD FAILURE ANALYSIS ===${NC}"
    echo ""

    # Check for specific errors
    if grep -q "FATAL ERROR: Reached heap limit" "$BUILD_LOG"; then
        echo -e "${RED}Issue: Out of Memory${NC}"
        echo "The build ran out of memory (heap limit exceeded)"
        echo ""
        echo "Solutions:"
        echo "1. Add swap memory: sudo fallocate -l 8G /swapfile"
        echo "2. Use Dockerfile.simple: mv frontend/Dockerfile.simple frontend/Dockerfile"
        echo "3. Increase Node memory: Edit Dockerfile NODE_OPTIONS to --max-old-space-size=16384"
        echo ""
    fi

    if grep -q "Cannot find module" "$BUILD_LOG"; then
        echo -e "${RED}Issue: Missing Dependencies${NC}"
        echo "Some npm packages are missing"
        echo ""
        echo "Solutions:"
        echo "1. Remove package-lock.json and rebuild"
        echo "2. Check for package conflicts"
        echo ""
    fi

    if grep -q "ENOSPC" "$BUILD_LOG"; then
        echo -e "${RED}Issue: Out of Disk Space${NC}"
        echo "The build ran out of disk space"
        echo ""
        echo "Solutions:"
        echo "1. Clean up Docker: docker system prune -a"
        echo "2. Free up disk space"
        echo ""
    fi

    # Show last 30 lines of error
    echo -e "${YELLOW}=== Last 30 lines of build log ===${NC}"
    tail -30 "$BUILD_LOG"
    echo ""

    echo -e "${RED}Build failed. See $BUILD_LOG for full details${NC}"
    exit 1
fi

# Step 6: Verify build output
echo -e "${BLUE}[6/6]${NC} Verifying build output..."
echo ""

# Check if container was created
if docker images | grep -q "nalar-frontend"; then
    IMAGE_SIZE=$(docker images nalar-frontend:latest --format "{{.Size}}")
    echo -e "${GREEN}✓ Frontend image created: ${IMAGE_SIZE}${NC}"
else
    echo -e "${RED}✗ Frontend image not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✓ BUILD COMPLETED SUCCESSFULLY                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "Next steps:"
echo "1. Start services: docker compose up -d"
echo "2. View logs: docker compose logs -f frontend"
echo "3. Check status: docker compose ps"
echo ""

echo "Build log saved to: $BUILD_LOG"
echo ""
