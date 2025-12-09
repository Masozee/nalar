# Phase 2: Multi-Tenancy Architecture - Implementation Plan

## Current Status Assessment

### ✅ Already Complete
1. **Tenant Model** (`apps/tenants/models.py`)
   - ✅ Tenant, TenantUser, Subscription, Invoice models
   - ✅ Plan types (FREE, STARTER, PROFESSIONAL, ENTERPRISE)
   - ✅ Tenant status management (ACTIVE, TRIAL, SUSPENDED, CANCELED)
   - ✅ Role-based access (OWNER, ADMIN, MANAGER, MEMBER, VIEWER)

2. **TenantMixin** (`apps/core/models/base.py`)
   - ✅ Tenant foreign key with proper indexing
   - ✅ Temporarily nullable for migration
   - ✅ Composite indexes for performance

### 🔨 To Implement

## Step 1: Tenant-Aware Manager

**File**: `backend/apps/core/models/managers.py` (new)

```python
from django.db import models
from django.db.models import QuerySet


class TenantQuerySet(QuerySet):
    """QuerySet that filters by tenant automatically."""

    def for_tenant(self, tenant):
        """Filter records for a specific tenant."""
        if tenant is None:
            return self.none()
        return self.filter(tenant=tenant)


class TenantManager(models.Manager):
    """
    Manager for tenant-aware models.
    Automatically filters all queries by the current tenant.
    """

    def get_queryset(self):
        """Override to add tenant filtering."""
        from apps.core.middleware import get_current_tenant

        queryset = TenantQuerySet(self.model, using=self._db)
        tenant = get_current_tenant()

        if tenant:
            return queryset.for_tenant(tenant)
        return queryset

    def for_tenant(self, tenant):
        """Explicitly filter for a specific tenant (bypass current tenant)."""
        return self.get_queryset().filter(tenant=tenant)

    def all_tenants(self):
        """Get all records across all tenants (for superuser/admin)."""
        return TenantQuerySet(self.model, using=self._db)
```

## Step 2: Tenant Middleware

**File**: `backend/apps/core/middleware.py` (new)

```python
import threading
from django.utils.deprecation import MiddlewareMixin
from apps.tenants.models import Tenant, TenantUser

# Thread-local storage for current tenant
_thread_locals = threading.local()


def get_current_tenant():
    """Get the current tenant from thread-local storage."""
    return getattr(_thread_locals, 'tenant', None)


def set_current_tenant(tenant):
    """Set the current tenant in thread-local storage."""
    _thread_locals.tenant = tenant


def clear_current_tenant():
    """Clear the current tenant from thread-local storage."""
    if hasattr(_thread_locals, 'tenant'):
        del _thread_locals.tenant


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to set the current tenant based on:
    1. Subdomain (e.g., acme.nalar.app)
    2. X-Tenant-ID header
    3. JWT token tenant claim
    4. User's current tenant selection
    """

    def process_request(self, request):
        """Extract tenant from request and set it in thread-local."""
        tenant = None

        # Method 1: From subdomain
        host = request.get_host().split(':')[0]
        subdomain_parts = host.split('.')
        if len(subdomain_parts) > 2:  # subdomain.nalar.app
            subdomain = subdomain_parts[0]
            try:
                tenant = Tenant.objects.get(subdomain=subdomain, status='active')
            except Tenant.DoesNotExist:
                pass

        # Method 2: From X-Tenant-ID header (for API calls)
        if not tenant:
            tenant_id = request.headers.get('X-Tenant-ID')
            if tenant_id:
                try:
                    tenant = Tenant.objects.get(id=tenant_id, status='active')
                except Tenant.DoesNotExist:
                    pass

        # Method 3: From authenticated user's JWT token
        if not tenant and request.user and request.user.is_authenticated:
            # Check if user has tenant membership
            try:
                # Get user's primary tenant or first active tenant
                tenant_user = TenantUser.objects.filter(
                    user=request.user,
                    is_active=True,
                    tenant__status='active'
                ).select_related('tenant').first()

                if tenant_user:
                    tenant = tenant_user.tenant
            except:
                pass

        # Set tenant in thread-local
        set_current_tenant(tenant)
        request.tenant = tenant

    def process_response(self, request, response):
        """Clear tenant from thread-local after request."""
        clear_current_tenant()
        return response

    def process_exception(self, request, exception):
        """Clear tenant from thread-local on exception."""
        clear_current_tenant()
        return None
```

## Step 3: Update Settings

**File**: `backend/config/settings/base.py`

Add to MIDDLEWARE (after AuthenticationMiddleware):
```python
MIDDLEWARE = [
    ...
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.core.middleware.TenantMiddleware',  # Add this
    ...
]
```

## Step 4: Update BaseModel

**File**: `backend/apps/core/models/base.py`

```python
# Add this after TenantMixin
class TenantBaseModel(BaseModel, TenantMixin):
    """
    Base model for all tenant-aware models.
    Combines BaseModel fields with TenantMixin and automatic filtering.
    """

    objects = TenantManager()  # Tenant-aware manager
    all_objects = models.Manager()  # Unfiltered manager for admin

    class Meta:
        abstract = True
```

## Step 5: Migration Strategy

### Phase A: Add tenant field to existing models (nullable)
Already done - TenantMixin has `null=True`

### Phase B: Data Migration
Create a migration to assign existing data to a default tenant:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

**File**: `backend/apps/core/management/commands/assign_default_tenant.py`

```python
from django.core.management.base import BaseCommand
from apps.tenants.models import Tenant
from apps.organization.models import Department, Position, Team
from apps.hr.models import Employee
# Import all models that need tenant assignment

class Command(BaseCommand):
    help = 'Assign existing records to a default tenant'

    def handle(self, *args, **kwargs):
        # Create or get default tenant
        tenant, created = Tenant.objects.get_or_create(
            slug='default',
            defaults={
                'name': 'Default Organization',
                'email': 'admin@example.com',
                'status': 'active',
                'plan': 'enterprise',
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created default tenant: {tenant.name}'))

        # Assign all records without tenant to default tenant
        models_to_update = [
            Department, Position, Team, Employee,
            # Add all other models here
        ]

        for model in models_to_update:
            count = model.objects.filter(tenant__isnull=True).update(tenant=tenant)
            self.stdout.write(
                self.style.SUCCESS(f'Assigned {count} {model.__name__} records to {tenant.name}')
            )
```

### Phase C: Make tenant field required
After data migration, update TenantMixin:
```python
tenant = models.ForeignKey(
    'tenants.Tenant',
    on_delete=models.CASCADE,
    related_name='%(app_label)s_%(class)s_set',
    db_index=True,
    null=False,  # Change to required
    blank=False,
    help_text="Tenant that owns this record"
)
```

## Step 6: Update Models to Use TenantBaseModel

Example for Department:
```python
# Before
class Department(BaseModel, AuditMixin):
    ...

# After
class Department(TenantBaseModel, AuditMixin):
    ...
```

Models to update:
- ✅ Organization: Department, Position, Team
- ✅ HR: Employee, FamilyMember, Attendance, Leave, Payroll
- ✅ Finance: ExpenseRequest, ExpenseAdvance
- ✅ Research: Grant, Publication, Project
- ✅ Assets: Asset, Maintenance
- ✅ CRM: Organization, Contact

## Step 7: Tenant Registration API

**File**: `backend/apps/tenants/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Tenant, TenantUser
from .serializers import TenantSerializer, TenantRegistrationSerializer

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Register a new tenant (organization signup)."""
        serializer = TenantRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            tenant = serializer.save()
            return Response({
                'tenant': TenantSerializer(tenant).data,
                'message': 'Tenant registered successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """List users in a tenant."""
        tenant = self.get_object()
        users = TenantUser.objects.filter(tenant=tenant, is_active=True)
        # Return serialized users
        return Response(...)
```

## Step 8: Testing

**File**: `backend/apps/tenants/tests/test_isolation.py`

```python
from django.test import TestCase
from apps.tenants.models import Tenant, TenantUser
from apps.organization.models import Department
from apps.core.middleware import set_current_tenant

class TenantIsolationTest(TestCase):
    def setUp(self):
        # Create two tenants
        self.tenant1 = Tenant.objects.create(name='Tenant 1', slug='tenant1')
        self.tenant2 = Tenant.objects.create(name='Tenant 2', slug='tenant2')

        # Create departments for each tenant
        self.dept1 = Department.objects.create(
            name='Dept 1',
            tenant=self.tenant1
        )
        self.dept2 = Department.objects.create(
            name='Dept 2',
            tenant=self.tenant2
        )

    def test_tenant_isolation(self):
        """Test that queries only return data for current tenant."""
        # Set current tenant to tenant1
        set_current_tenant(self.tenant1)

        # Query should only return dept1
        depts = Department.objects.all()
        self.assertEqual(depts.count(), 1)
        self.assertEqual(depts.first().id, self.dept1.id)

        # Switch to tenant2
        set_current_tenant(self.tenant2)

        # Query should only return dept2
        depts = Department.objects.all()
        self.assertEqual(depts.count(), 1)
        self.assertEqual(depts.first().id, self.dept2.id)
```

## Timeline

| Task | Duration | Status |
|------|----------|--------|
| 1. Create TenantManager | 1 hour | ⏳ Todo |
| 2. Create TenantMiddleware | 2 hours | ⏳ Todo |
| 3. Update Settings | 15 min | ⏳ Todo |
| 4. Update BaseModel | 30 min | ⏳ Todo |
| 5. Create data migration command | 2 hours | ⏳ Todo |
| 6. Update all models | 4 hours | ⏳ Todo |
| 7. Create Tenant API | 2 hours | ⏳ Todo |
| 8. Write tests | 3 hours | ⏳ Todo |
| 9. Frontend tenant context | 4 hours | ⏳ Todo |
| 10. Testing & bug fixes | 4 hours | ⏳ Todo |

**Total**: ~23 hours (3 days)

## Success Criteria

- [ ] All models inherit from TenantBaseModel
- [ ] Tenant middleware extracts tenant from subdomain/header/JWT
- [ ] QuerySets automatically filter by current tenant
- [ ] Data isolation verified with tests
- [ ] Existing data migrated to default tenant
- [ ] Tenant registration API working
- [ ] Frontend tenant context provider implemented
- [ ] Zero data leakage between tenants

## Next Steps

1. Create `managers.py` with TenantManager
2. Create `middleware.py` with TenantMiddleware
3. Update settings to include middleware
4. Test with existing models
5. Create migration command
6. Update all models progressively
7. Build tenant registration API
8. Add frontend tenant switcher

---

**Ready to start implementation!**
