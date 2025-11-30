import uuid
from django.db import models


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
    """

    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='%(app_label)s_%(class)s_set',
        db_index=True,
        help_text="Tenant that owns this record"
    )

    class Meta:
        abstract = True
        # Add composite index for tenant + common queries
        indexes = [
            models.Index(fields=['tenant', 'is_active']),
            models.Index(fields=['tenant', 'created_at']),
        ]
