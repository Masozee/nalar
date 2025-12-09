import uuid
from django.db import models
from .managers import TenantManager


class BaseModel(models.Model):
    """Abstract base model with common fields."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']


class TenantMixin(models.Model):
    """
    Mixin to add tenant isolation to models.

    All models that need tenant isolation should inherit from this mixin.
    This ensures data is automatically scoped to a specific tenant.

    Note: tenant field is nullable during migration phase.
    After data migration, this will be made required.
    """

    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='%(app_label)s_%(class)s_set',
        db_index=True,
        null=True,  # Temporarily nullable for migration
        blank=True,
        help_text="Tenant that owns this record"
    )

    class Meta:
        abstract = True
        # Add composite index for tenant + common queries
        indexes = [
            models.Index(fields=['tenant', 'is_active']),
            models.Index(fields=['tenant', 'created_at']),
        ]


class TenantBaseModel(BaseModel, TenantMixin):
    """
    Base model for all tenant-aware models.
    Combines BaseModel fields with TenantMixin and automatic filtering.

    Usage:
        class MyModel(TenantBaseModel):
            name = models.CharField(max_length=100)

        # Queries automatically filtered by current tenant
        MyModel.objects.all()  # Only current tenant's records

        # Bypass tenant filtering (admin/superuser)
        MyModel.all_objects.all()  # All records across all tenants
    """

    objects = TenantManager()  # Tenant-aware manager (default)
    all_objects = models.Manager()  # Unfiltered manager for admin

    class Meta:
        abstract = True
