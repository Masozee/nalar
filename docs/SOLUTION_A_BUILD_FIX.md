# Solution A: Enhanced Frontend Build with Error Diagnosis

This solution provides detailed error reporting and diagnosis for Next.js build failures on production servers.

## 🎯 What This Solves

- **Build worker exiting with code: 1**
- **Missing `.next/standalone` directory**
- **Missing `.next/static` directory**
- **Build failures with no clear error messages**

## 📋 Quick Start

### On Ubuntu Server:

```bash
# 1. Pull latest changes
cd /path/to/nalar
git pull origin main

# 2. Make script executable (if not already)
chmod +x scripts/build-frontend.sh

# 3. Run the enhanced build script
./scripts/build-frontend.sh
```

The script will:
- ✅ Check system prerequisites
- ✅ Verify available memory
- ✅ Clean Docker cache
- ✅ Build with detailed logging
- ✅ Analyze errors automatically
- ✅ Provide specific solutions

## 🔧 What's Different

### Before (Standard Build)
```bash
docker compose build frontend
# Error: failed to calculate checksum... not found
# No idea why it failed ❌
```

### After (Solution A)
```bash
./scripts/build-frontend.sh
# Detailed progress with 6 steps ✅
# Automatic error detection ✅
# Specific solutions provided ✅
# Complete build log saved ✅
```

## 📊 Build Script Features

### 1. **System Check**
   - Verifies Docker installation
   - Checks available memory
   - Warns if memory < 4GB

### 2. **Automatic Cleanup**
   - Clears Docker build cache
   - Removes unused containers
   - Frees up disk space

### 3. **Enhanced Logging**
   - Saves complete build log
   - Shows real-time progress
   - Captures all errors

### 4. **Error Analysis**
   - Detects out-of-memory errors
   - Identifies missing dependencies
   - Finds disk space issues
   - Shows relevant log sections

### 5. **Solution Recommendations**
   - Provides specific fixes for each error type
   - Suggests alternative approaches
   - Shows exact commands to run

## 🐛 Common Errors & Solutions

### Error 1: Out of Memory

**Symptom:**
```
FATAL ERROR: Reached heap limit Allocation failed
```

**Solutions:**
```bash
# Option 1: Add swap memory
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Option 2: Use simple Dockerfile
mv frontend/Dockerfile frontend/Dockerfile.standalone.backup
mv frontend/Dockerfile.simple frontend/Dockerfile

# Option 3: Increase Node memory
# Edit frontend/Dockerfile, change:
ENV NODE_OPTIONS="--max-old-space-size=16384"
```

### Error 2: Missing Dependencies

**Symptom:**
```
Cannot find module '@tanstack/react-query'
```

**Solutions:**
```bash
# Rebuild with fresh dependencies
rm frontend/package-lock.json
docker compose build --no-cache frontend
```

### Error 3: Disk Space

**Symptom:**
```
ENOSPC: no space left on device
```

**Solutions:**
```bash
# Clean Docker
docker system prune -a
docker volume prune -f

# Check disk space
df -h
```

## 📝 Manual Build (Without Script)

If you prefer to build manually:

```bash
# 1. Clean cache
docker builder prune -af
docker system prune -f

# 2. Build with logging
docker compose build --no-cache --progress=plain frontend 2>&1 | tee build.log

# 3. If failed, check errors
grep -A20 "BUILD FAILED" build.log
tail -50 build.log
```

## 🔍 Understanding the Dockerfile

The enhanced Dockerfile now includes:

```dockerfile
# Build with verbose logging and error capture
RUN set -e; \
    echo "=== Starting Next.js Build ===" && \
    npm run build 2>&1 | tee /tmp/build.log || { \
        echo "=== BUILD FAILED ===" && \
        echo "=== Last 50 lines of build log ===" && \
        tail -50 /tmp/build.log && \
        exit 1; \
    } && \
    echo "=== Build completed, checking output ===" && \
    ls -la .next/ && \
    if [ ! -d ".next/standalone" ]; then \
        echo "ERROR: .next/standalone directory not found!" && \
        exit 1; \
    fi
```

This ensures:
- Build logs are captured
- Errors are displayed immediately
- Standalone directory is verified
- Clear error messages

## 🚀 Next Steps After Successful Build

```bash
# 1. Start services
docker compose up -d

# 2. Check logs
docker compose logs -f frontend

# 3. Verify frontend is running
curl http://localhost:3001

# 4. Check all services
docker compose ps
```

## 🔄 Alternative Solutions

If Solution A doesn't work:

- **Solution B**: Use `Dockerfile.simple` (no standalone mode)
- **Solution C**: Add swap memory (8GB recommended)
- **Solution D**: Build locally and copy image to server

See main documentation for other solutions.

## 📞 Troubleshooting

### Script Won't Run
```bash
# Make executable
chmod +x scripts/build-frontend.sh

# Check shell
bash scripts/build-frontend.sh
```

### Build Still Failing
```bash
# Skip cleanup to save time
CLEANUP=false ./scripts/build-frontend.sh

# Check the full log
cat build-frontend.log

# Try with more memory
# Edit Dockerfile and increase NODE_OPTIONS
```

### Container Won't Start
```bash
# Check logs
docker compose logs frontend

# Rebuild without cache
docker compose build --no-cache frontend

# Try simple Dockerfile
mv frontend/Dockerfile.simple frontend/Dockerfile
```

## 📊 Build Performance

Typical build times:
- **8GB RAM**: 5-10 minutes
- **4GB RAM + Swap**: 10-20 minutes
- **4GB RAM (no swap)**: ⚠️ May fail
- **Simple Dockerfile**: Faster, more reliable

## ✅ Success Indicators

You'll know the build succeeded when you see:

```
╔══════════════════════════════════════════════════════════════╗
║           ✓ BUILD COMPLETED SUCCESSFULLY                    ║
╚══════════════════════════════════════════════════════════════╝

✓ Frontend image created: 311MB
```

## 🎓 Learning More

- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Node.js Memory Management](https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-megabytes)

---

**Need help?** Check the build log: `build-frontend.log`
