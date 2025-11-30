#!/bin/bash
set -e

# Wait for postgres
echo "Waiting for PostgreSQL..."
while ! nc -z ${DB_HOST:-db} ${DB_PORT:-5432}; do
    sleep 0.1
done
echo "PostgreSQL started"

# Wait for redis
echo "Waiting for Redis..."
while ! nc -z ${REDIS_HOST:-redis} ${REDIS_PORT:-6379}; do
    sleep 0.1
done
echo "Redis started"

# Run migrations
echo "Running migrations..."
uv run python manage.py migrate --noinput

# Execute command
exec "$@"
