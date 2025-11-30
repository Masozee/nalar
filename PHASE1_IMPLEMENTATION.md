# Phase 1: Tenant Schema & Core Models - Implementation Guide

## Overview
This phase adds multi-tenant capability to the Nalar ERP system using a **shared database with row-level isolation** approach. Each tenant's data is isolated by a `tenant_id` foreign key on all models.

---

## ✅ Completed Steps

### 1. **Created Tenants App** ✓
- Location: `backend/apps/tenants/`
- Models created:
  - `Tenant`: Organization/company model with plan, status, branding
  - `TenantUser`: User membership in tenants with roles (Owner, Admin, Manager, Member, Viewer)
  - `Subscription`: Billing and subscription management (Stripe integration ready)

### 2. **Added TenantMixin** ✓
- Location: `backend/apps/core/models/base.py`
- Purpose: Provides `tenant` foreign key to all models that need isolation
- Features:
  - Automatic related_name generation: `%(app_label)s_%(class)s_set`
  - Composite indexes for performance: `(tenant, is_active)`, `(tenant, created_at)`

### 3. **Updated Django Settings** ✓
- Added `apps.tenants` to `INSTALLED_APPS` in `config/settings/base.py`
- Positioned before other apps to ensure tenant models are available

---

## 📋 Next Steps (To Complete Phase 1)

### **Step 4: Generate Initial Migration**

```bash
cd backend
uv run python manage.py makemigrations tenants
```

**Expected output:**
```
Migrations for 'tenants':
  apps/tenants/migrations/0001_initial.py
    - Create model Tenant
    - Create model TenantUser
    - Create model Subscription
```

---

### **Step 5: Add TenantMixin to Existing Models**

**Models that need tenant isolation:**

#### **Organization** (`apps/organization/models.py`):
```python
from apps.core.models import BaseModel, AuditMixin, TenantMixin

class Department(BaseModel, TenantMixin, AuditMixin):  # Add TenantMixin
    # ... existing fields

class Position(BaseModel, TenantMixin, AuditMixin):  # Add TenantMixin
    # ... existing fields

class Team(BaseModel, TenantMixin, AuditMixin):  # Add TenantMixin
    # ... existing fields
```

#### **HR** (`apps/hr/models.py`):
```python
class Employee(BaseModel, TenantMixin, AuditMixin):  # Add TenantMixin
    # ... existing fields

class EmployeeFamily(BaseModel, TenantMixin):  # Add TenantMixin
    # ... existing fields
```

#### **Finance** (`apps/finance/expense_request/models.py`):
```python
class ExpenseRequest(BaseModel, TenantMixin, AuditMixin):  # Add TenantMixin
    # ... existing fields
```

#### **Assets** (`apps/assets/models.py`):
```python
class Asset(BaseModel, TenantMixin, AuditMixin):  # Add TenantMixin
    # ... existing fields
```

#### **Inventory** (`apps/inventory/sku/models.py`):
```python
class SKU(BaseModel, TenantMixin, AuditMixin):  # Add TenantMixin
    # ... existing fields
```

#### **Research** (`apps/research/grant_management/models.py`):
```python
class Grant(BaseModel, TenantMixin, AuditMixin):  # Add TenantMixin
    # ... existing fields
```

#### **Procurement** (`apps/procurement/purchase_order/models.py`):
```python
class PurchaseOrder(BaseModel, TenantMixin, AuditMixin):  # Add TenantMixin
    # ... existing fields
```

#### **Documents** (`apps/documents/models.py`):
```python
class Document(BaseModel, TenantMixin, AuditMixin):  # Add TenantMixin
    # ... existing fields
```

**Total models to update:** ~50-60 models across all apps

---

### **Step 6: Generate Migrations for Updated Models**

```bash
# Generate migrations for all apps
uv run python manage.py makemigrations

# This will create migrations adding tenant_id to all models
# Example output:
# Migrations for 'organization':
#   apps/organization/migrations/0005_add_tenant_field.py
#     - Add field tenant to department
#     - Add field tenant to position
#     - Add field tenant to team
```

---

### **Step 7: Create Data Migration Script**

Create: `backend/apps/tenants/management/commands/migrate_to_multitenancy.py`

```python
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.tenants.models import Tenant, TenantUser, TenantRole
from apps.users.models import User
from apps.organization.models import Department, Position
from apps.hr.models import Employee
# ... import all models that need tenant

class Command(BaseCommand):
    help = 'Migrate existing data to default tenant'

    def handle(self, *args, **options):
        with transaction.atomic():
            # 1. Create default tenant
            default_tenant, created = Tenant.objects.get_or_create(
                slug='default',
                defaults={
                    'name': 'Default Organization',
                    'email': 'admin@nalar.app',
                    'plan': 'enterprise',
                    'status': 'active',
                    'max_users': 1000,
                    'enabled_modules': [
                        'hr', 'finance', 'research', 'assets',
                        'inventory', 'procurement', 'documents'
                    ]
                }
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created default tenant: {default_tenant.name}')
                )

            # 2. Assign all existing users to default tenant
            users = User.objects.all()
            for user in users:
                TenantUser.objects.get_or_create(
                    tenant=default_tenant,
                    user=user,
                    defaults={
                        'role': TenantRole.ADMIN,
                        'is_owner': user.is_superuser,
                        'is_active': True
                    }
                )

            self.stdout.write(
                self.style.SUCCESS(f'Assigned {users.count()} users to default tenant')
            )

            # 3. Update all existing records with default tenant
            models_to_update = [
                Department, Position, Employee,
                # ... add all tenant-aware models
            ]

            for model in models_to_update:
                count = model.objects.filter(tenant__isnull=True).update(
                    tenant=default_tenant
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Updated {count} {model.__name__} records'
                    )
                )

            self.stdout.write(
                self.style.SUCCESS('✅ Migration to multi-tenancy complete!')
            )
```

---

### **Step 8: Run Migrations**

```bash
# 1. Run all migrations
cd backend
uv run python manage.py migrate

# 2. Run data migration command
uv run python manage.py migrate_to_multitenancy

# 3. Make tenant field required (optional - for production)
# Edit models to change: tenant = models.ForeignKey(..., null=False)
# Then run: uv run python manage.py makemigrations
# Then run: uv run python manage.py migrate
```

---

### **Step 9: Update Admin** (Optional but recommended)

Update Django admin for all models to filter by tenant:

```python
# Example: apps/organization/admin.py
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'code', 'created_at']
    list_filter = ['tenant', 'is_active']
    search_fields = ['name', 'code', 'tenant__name']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Super admin sees all tenants, regular admin sees their tenant only
        if not request.user.is_superuser:
            user_tenants = request.user.tenant_memberships.values_list('tenant_id', flat=True)
            qs = qs.filter(tenant_id__in=user_tenants)
        return qs
```

---

### **Step 10: Test Tenant Isolation**

Create test file: `backend/apps/tenants/tests.py`

```python
from django.test import TestCase
from apps.tenants.models import Tenant, TenantUser, TenantRole
from apps.users.models import User
from apps.organization.models import Department

class TenantIsolationTest(TestCase):
    def setUp(self):
        # Create two tenants
        self.tenant1 = Tenant.objects.create(
            name='Tenant 1',
            slug='tenant1',
            email='tenant1@test.com'
        )
        self.tenant2 = Tenant.objects.create(
            name='Tenant 2',
            slug='tenant2',
            email='tenant2@test.com'
        )

    def test_department_isolation(self):
        # Create departments for each tenant
        dept1 = Department.objects.create(
            tenant=self.tenant1,
            name='IT',
            code='IT-T1'
        )
        dept2 = Department.objects.create(
            tenant=self.tenant2,
            name='IT',
            code='IT-T2'
        )

        # Verify isolation
        tenant1_depts = Department.objects.filter(tenant=self.tenant1)
        tenant2_depts = Department.objects.filter(tenant=self.tenant2)

        self.assertEqual(tenant1_depts.count(), 1)
        self.assertEqual(tenant2_depts.count(), 1)
        self.assertIn(dept1, tenant1_depts)
        self.assertNotIn(dept1, tenant2_depts)

    def test_user_tenant_membership(self):
        user = User.objects.create_user(
            email='test@test.com',
            username='testuser'
        )

        # Add user to tenant1 as admin
        TenantUser.objects.create(
            tenant=self.tenant1,
            user=user,
            role=TenantRole.ADMIN
        )

        # Verify membership
        self.assertEqual(user.tenant_memberships.count(), 1)
        self.assertTrue(
            user.tenant_memberships.filter(tenant=self.tenant1).exists()
        )
```

Run tests:
```bash
uv run python manage.py test apps.tenants
```

---

## 📊 Progress Checklist

- [x] Create tenants app structure
- [x] Define Tenant, TenantUser, Subscription models
- [x] Create TenantMixin for data isolation
- [x] Add tenants to INSTALLED_APPS
- [ ] Generate initial tenants migration
- [ ] Add TenantMixin to ~50-60 existing models
- [ ] Generate migrations for updated models
- [ ] Create data migration management command
- [ ] Run all migrations
- [ ] Execute data migration to default tenant
- [ ] Update admin interfaces (optional)
- [ ] Write and run tenant isolation tests
- [ ] Commit Phase 1 changes to git

---

## 🎯 Success Criteria

Phase 1 is complete when:

1. ✅ All models have `tenant` foreign key
2. ✅ Existing data is assigned to "default" tenant
3. ✅ Migrations run successfully without errors
4. ✅ Admin panel shows tenant filtering
5. ✅ Tests confirm data isolation between tenants
6. ✅ No breaking changes to existing functionality

---

## 📝 Notes

- **Database Strategy**: Shared database with row-level isolation (recommended for <1000 tenants)
- **Migration Safety**: All migrations allow `null=True` initially, then populate, then make required
- **Performance**: Composite indexes on `(tenant, is_active)` ensure fast queries
- **Backward Compatibility**: Existing code works with "default" tenant until Phase 2

---

## 🚀 Next Phase

After Phase 1 completion, proceed to:
- **Phase 2**: Tenant-Aware Authentication & JWT tokens with tenant context
