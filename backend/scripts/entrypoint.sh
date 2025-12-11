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

# Run migrations (skip if SKIP_MIGRATIONS=1)
if [ "${SKIP_MIGRATIONS}" != "1" ]; then
    echo "Running migrations..."
    /app/.venv/bin/python manage.py migrate --noinput || echo "Migration failed, continuing..."

    # Collect static files
    echo "Collecting static files..."
    /app/.venv/bin/python manage.py collectstatic --noinput || echo "Static collection failed, continuing..."
else
    echo "Skipping migrations (SKIP_MIGRATIONS=1)"
fi

# Execute command
exec "$@"
