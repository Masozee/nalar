#!/bin/bash
# Reset database to match .env configuration
# WARNING: This deletes all data!

set -e

echo "⚠️  WARNING: This will DELETE all database data!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

cd "$(dirname "$0")"

echo "Stopping services..."
docker compose stop backend

echo "Removing old database..."
docker compose down postgres pgbouncer
docker volume rm nalar_postgres_data 2>/dev/null || true

echo "Starting fresh database..."
docker compose up -d postgres pgbouncer

echo "Waiting for database to be ready..."
sleep 10

echo "Running migrations..."
docker compose exec backend uv run python manage.py migrate

echo "✅ Database reset complete!"
echo ""
echo "Create a superuser:"
echo "  docker compose exec backend uv run python manage.py createsuperuser"
