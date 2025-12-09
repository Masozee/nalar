# Development Setup Guide

## Quick Start

### 1. Start Database & Redis
```bash
podman-compose -f docker-compose.dev.yml up -d
```

### 2. Run Backend (Terminal 1)
```bash
cd backend
uv run python manage.py runserver
```

Backend will run at: http://localhost:8000 with **hot reload** ✨

### 3. Run Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Frontend will run at: http://localhost:3000 with **Fast Refresh** ⚡

---

## Environment Variables

Backend automatically uses `config/settings/dev.py` which connects to:
- Database: `postgresql://nalar:nalar_dev@localhost:5432/nalar_dev`
- Redis: `redis://localhost:6379/0`

---

## Common Commands

### Database Management
```bash
# Run migrations
cd backend
uv run python manage.py migrate

# Create superuser
uv run python manage.py createsuperuser

# Load seed data
uv run python manage.py seed_organization
uv run python manage.py seed_hr
uv run python manage.py seed_finance
uv run python manage.py seed_research
uv run python manage.py seed_assets
uv run python manage.py seed_crm
```

### Stop Development Services
```bash
podman-compose -f docker-compose.dev.yml down
```

---

## Fixed Issues

✅ **Decimal Serialization Error** - Fixed in `backend/apps/core/renderers.py`
- Added custom `default()` function to handle `Decimal` objects
- Converts decimals to float for JSON serialization

---

## Development Benefits

- **Hot Reload**: Backend auto-reloads on code changes
- **Fast Refresh**: Frontend updates instantly
- **No Rebuilds**: Edit code and see changes immediately
- **Easy Debugging**: Use your IDE's debugger
- **Fast Iteration**: No container rebuild delays

---

## Troubleshooting

**Issue**: Cannot connect to database
**Solution**: Ensure `podman-compose -f docker-compose.dev.yml up -d` is running

**Issue**: Port already in use
**Solution**: Stop other services or change ports in docker-compose.dev.yml

**Issue**: Module not found
**Solution**: Run `uv sync` in backend directory or `npm install` in frontend

---

## Next: Phase 2 - Multi-Tenancy

See [SAAS_READINESS_ROADMAP.md](SAAS_READINESS_ROADMAP.md) for Phase 2 tasks.
