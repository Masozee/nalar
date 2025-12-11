# syntax=docker/dockerfile:1

# Build stage
FROM node:23-alpine AS builder

WORKDIR /app

# Install dependencies needed for build
RUN apk add --no-cache libc6-compat

# Install dependencies only when needed
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --legacy-peer-deps

# Copy source and build
COPY . .

# Accept build arguments for Next.js public env vars
ARG BACKEND_URL=http://localhost:8000
ARG FRONTEND_URL=http://localhost:3000

# Set environment variables for build
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBOPACK=0
ENV BACKEND_URL=${BACKEND_URL}
ENV FRONTEND_URL=${FRONTEND_URL}

# Build with verbose logging and error capture
RUN set -e; \
    echo "=== Starting Next.js Build (webpack mode) ===" && \
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
        echo "Contents of .next:" && \
        ls -la .next/ && \
        exit 1; \
    fi && \
    echo "=== Standalone build verified successfully ==="

# Production stage
FROM node:23-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install PM2 globally (small layer)
RUN npm install -g pm2@latest

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Copy standalone output - this includes server.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# The standalone build puts server.js inside .next/standalone/
# We need to copy it to /app/server.js for PM2 to find it
RUN if [ -f "server.js" ]; then \
        echo "✓ server.js found at /app/server.js"; \
    else \
        echo "⚠ No server.js found, will use npm start fallback"; \
    fi

# Copy package files and node_modules as fallback
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY ecosystem.config.js ./

# Set ownership after all files are copied
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000 HOSTNAME="0.0.0.0"

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
