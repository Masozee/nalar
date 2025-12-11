# syntax=docker/dockerfile:1
FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_SYSTEM_PYTHON=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Set work directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy project
COPY . .

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    chmod +x /app/scripts/entrypoint.sh

# Expose port
EXPOSE 8000

# Run entrypoint
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
CMD ["/app/.venv/bin/granian", "--interface", "asgi", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "config.asgi:application"]
