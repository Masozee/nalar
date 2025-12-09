"""
Tenant-aware managers for automatic data isolation.
"""

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

    Usage:
        # Automatic tenant filtering
        departments = Department.objects.all()  # Only current tenant's departments

        # Explicit tenant filtering
        departments = Department.objects.for_tenant(some_tenant)

        # Bypass tenant filtering (for admin/superuser)
        all_departments = Department.all_objects.all()
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
        return TenantQuerySet(self.model, using=self._db).for_tenant(tenant)

    def all_tenants(self):
        """Get all records across all tenants (for superuser/admin)."""
        return TenantQuerySet(self.model, using=self._db)
