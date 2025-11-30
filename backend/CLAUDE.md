# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
uv sync

# Run development server
uv run python manage.py runserver

# Run Django checks
uv run python manage.py check

# Create migrations
uv run python manage.py makemigrations

# Apply migrations
uv run python manage.py migrate

# Create superuser
uv run python manage.py createsuperuser
```

## Architecture

This is a Django 5.2+ REST API backend for an enterprise resource planning (ERP) system, using Django REST Framework.

### Settings Structure
- `config/settings/base.py` - Shared settings
- `config/settings/dev.py` - Development (default, uses SQLite)
- `config/settings/prod.py` - Production (uses PostgreSQL, env vars)

### App Organization
All Django apps live in `apps/`. Each app follows standard Django structure (models.py, views.py, serializers.py, urls.py).

**Core Apps:**
- `core` - Base models (BaseModel with UUID, timestamps), mixins (AuditMixin), shared utilities, permissions
- `users` - Authentication only (simple User model with email login). Employee data is NOT here.
- `organization` - Departments (hierarchical), Teams with members
- `workflow` - Reusable approval engine (WorkflowTemplate, WorkflowStep, ApprovalRequest, ApprovalAction, ApprovalDelegate)

**Domain Apps:**
- `hr` - Human Resources with submodules:
  - `models.py` - Employee, EmployeeFamily, EmployeeEducation, EmployeeWorkHistory
  - `attendance/` - Daily attendance, check-in/out, location tracking, monthly summaries
  - `leave/` - Leave policies, balances, requests with approval workflow
  - `payroll_light/` - Salary components, payroll periods, payslips
- `admin_ops` - General affairs (room_booking/, vehicle_management/, visitor_log/)
- `assets` - Asset lifecycle (maintenance/, assignment/)
- `inventory` - Warehouse/stock (stock_opname/, stock_transfer/, sku/)
- `procurement` - Purchase orders, vendors
- `ticketing` - IT/GA helpdesk with SLA
- `documents` - File storage, versioning
- `research` - Think tank module (grant_management/, publication/, project_tracking/)
- `finance` - Cost centers, expense requests
- `analytics` - BI reports, dashboards

### API Structure
- All APIs versioned under `api/v1/`
- Router configuration in `api/v1/routers.py`
- Custom user model: `AUTH_USER_MODEL = 'users.User'`

### Base Models
New models should inherit from `apps.core.models.BaseModel` (provides UUID pk, created_at, updated_at, is_active) and optionally `AuditMixin` (created_by, updated_by).

For simple additional fields (room number, printer ID), add them directly to the model. Use dedicated fields for type safety.

### Submodule Pattern
For large apps like HR, use submodules:
```
apps/hr/
├── __init__.py
├── models.py          # Main models (Employee, etc.)
├── admin.py           # Imports submodule admins
├── urls.py            # Includes submodule urls
├── attendance/
│   ├── models.py
│   ├── admin.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── leave/
└── payroll_light/
```

In main `admin.py`, import submodule admins:
```python
from .attendance import admin as attendance_admin  # noqa
```

In main `urls.py`, include submodule urls:
```python
path('attendance/', include('apps.hr.attendance.urls')),
```

## Query Optimization

### Indexing Strategy
- Add `db_index=True` to fields used in filters, ordering, or lookups
- Use composite indexes for common query patterns via `Meta.indexes`
- ForeignKey fields are auto-indexed; no need to add `db_index`

### QuerySet Best Practices
```python
# Always use select_related for ForeignKey (single object)
Employee.objects.select_related('department', 'supervisor')

# Use prefetch_related for reverse FK or M2M (multiple objects)
Employee.objects.prefetch_related('family_members', 'education_history')

# Combine for nested relations
Employee.objects.select_related('department').prefetch_related('family_members')

# Use only() or defer() to limit fields
Employee.objects.only('id', 'first_name', 'last_name', 'employee_id')

# Use values() or values_list() for simple data extraction
Employee.objects.values('id', 'full_name')

# Filter early, not in Python
Employee.objects.filter(employment_status='active')  # Good
[e for e in Employee.objects.all() if e.employment_status == 'active']  # Bad

# Use exists() instead of count() for existence checks
if Employee.objects.filter(email=email).exists():  # Good
if Employee.objects.filter(email=email).count() > 0:  # Bad

# Use bulk operations for multiple records
Employee.objects.bulk_create([...])
Employee.objects.bulk_update([...], ['field1', 'field2'])
```

### ViewSet Optimization
```python
class EmployeeViewSet(viewsets.ModelViewSet):
    # Define optimized base queryset
    queryset = Employee.objects.select_related('department', 'supervisor').all()

    # Use different serializers for list vs detail
    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer  # Lightweight
        return EmployeeDetailSerializer     # Full data
```

## Performance Stack

### Production
- **orjson**: Fast JSON serialization (10x faster than stdlib)
- **Redis**: Cache backend and session storage
- **WhiteNoise**: Efficient static file serving with compression
- **PostgreSQL**: With connection pooling (`CONN_MAX_AGE=60`)
- **Gunicorn**: Production WSGI server

### Development Tools (optional)
```bash
# Install dev tools
uv pip install django-debug-toolbar django-silk

# Debug Toolbar: SQL query analysis in browser
# Silk: Request profiling at /silk/
```

### Caching Patterns
```python
from django.core.cache import cache

# Simple caching
cache.set('key', value, timeout=300)
value = cache.get('key')

# Cache decorator for views
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # 15 minutes
def my_view(request):
    ...

# Cache in DRF viewsets
from django.utils.decorators import method_decorator

@method_decorator(cache_page(60 * 5), name='list')
class MyViewSet(viewsets.ModelViewSet):
    ...
```

## Containers (Podman/Docker)

```bash
# Start dev services (postgres + redis only)
podman-compose -f docker-compose.dev.yml up -d

# Run Django locally against containerized services
export DB_HOST=localhost DB_NAME=nalar_dev DB_USER=nalar DB_PASSWORD=nalar_dev
uv run python manage.py runserver

# Build and run full stack
podman-compose up --build

# Run in background
podman-compose up -d

# View logs
podman-compose logs -f web

# Stop all
podman-compose down

# Stop and remove volumes
podman-compose down -v
```

## Testing

Tests are mandatory for each feature. Run tests with:
```bash
uv run python manage.py test

# Run specific app tests
uv run python manage.py test apps.hr

# Run with verbosity
uv run python manage.py test -v 2
```

## Seed Data

```bash
# Seed organization (17 departments, 16 teams)
uv run python manage.py seed_organization

# Seed workflow templates (5 approval workflows)
uv run python manage.py seed_workflow

# Seed HR data (20 employees, family, attendance, leave, payroll)
uv run python manage.py seed_hr
```

## API Endpoints

### HR Module
- `/api/v1/hr/employees/` - Employee CRUD with nested family, education, work history
- `/api/v1/hr/attendance/attendances/` - Attendance records
  - `POST /check_in/` - Check in for today
  - `POST /check_out/` - Check out for today
  - `GET /my_attendance/` - Current user's attendance
- `/api/v1/hr/attendance/attendance-summaries/` - Monthly summaries
- `/api/v1/hr/leave/policies/` - Leave policies
- `/api/v1/hr/leave/balances/` - Leave balances
  - `GET /my_balance/` - Current user's balance
- `/api/v1/hr/leave/requests/` - Leave requests
  - `GET /my_requests/` - Current user's requests
  - `GET /pending_approvals/` - Subordinates' pending requests
  - `POST /{id}/approve/` - Approve/reject request
  - `POST /{id}/cancel/` - Cancel request
- `/api/v1/hr/payroll/salary-components/` - Salary components
- `/api/v1/hr/payroll/periods/` - Payroll periods
  - `POST /{id}/generate_payslips/` - Generate payslips for period
  - `POST /{id}/calculate_all/` - Calculate all payslips
  - `POST /{id}/approve/` - Approve payroll period
- `/api/v1/hr/payroll/payslips/` - Payslips
  - `GET /my_payslips/` - Current user's payslips
  - `POST /{id}/add_item/` - Add allowance/deduction

### Organization Module
- `/api/v1/organization/departments/` - Department CRUD
  - `GET /tree/` - Get department hierarchy
  - `GET /{id}/employees/` - Get employees in department
  - `GET /{id}/teams/` - Get teams in department
- `/api/v1/organization/teams/` - Team CRUD
  - `POST /{id}/add_member/` - Add member to team
  - `POST /{id}/remove_member/` - Remove member from team

### Workflow Module
- `/api/v1/workflow/templates/` - Workflow templates with steps
  - `POST /{id}/add_step/` - Add step to workflow
- `/api/v1/workflow/steps/` - Workflow steps
- `/api/v1/workflow/requests/` - Approval requests
  - `GET /my_requests/` - Current user's requests
  - `GET /pending_my_approval/` - Requests pending user's approval
  - `POST /{id}/take_action/` - Approve/reject/revision
  - `POST /{id}/cancel/` - Cancel request
- `/api/v1/workflow/delegates/` - Approval delegations
  - `GET /my_delegations/` - Delegations given by user
  - `GET /delegated_to_me/` - Active delegations to user
