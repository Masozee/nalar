"""
Tenant models for multi-tenancy support.

This module provides the core models for implementing a multi-tenant SaaS:
- Tenant: Organization/Company model
- TenantUser: User membership in tenants with roles
- Subscription: Billing and plan management
"""

from django.db import models
from django.conf import settings
from django.utils.text import slugify
from apps.core.models import BaseModel, AuditMixin


class PlanType(models.TextChoices):
    """Subscription plan types."""
    FREE = 'free', 'Free'
    STARTER = 'starter', 'Starter'
    PROFESSIONAL = 'professional', 'Professional'
    ENTERPRISE = 'enterprise', 'Enterprise'


class TenantStatus(models.TextChoices):
    """Tenant account status."""
    ACTIVE = 'active', 'Active'
    SUSPENDED = 'suspended', 'Suspended'
    TRIAL = 'trial', 'Trial'
    CANCELED = 'canceled', 'Canceled'


class TenantRole(models.TextChoices):
    """User roles within a tenant."""
    OWNER = 'owner', 'Owner'
    ADMIN = 'admin', 'Administrator'
    MANAGER = 'manager', 'Manager'
    MEMBER = 'member', 'Member'
    VIEWER = 'viewer', 'Viewer'


class Tenant(BaseModel, AuditMixin):
    """
    Tenant model representing an organization/company in the system.

    Each tenant has isolated data and can have multiple users with different roles.
    """

    # Basic Information
    name = models.CharField(max_length=200, help_text="Organization name")
    slug = models.SlugField(
        max_length=100,
        unique=True,
        help_text="URL-safe identifier (e.g., 'acme-corp')"
    )
    subdomain = models.CharField(
        max_length=63,
        unique=True,
        blank=True,
        null=True,
        help_text="Custom subdomain (e.g., 'acme' for acme.nalar.app)"
    )

    # Contact Information
    email = models.EmailField(help_text="Primary contact email")
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)

    # Address
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='ID')
    postal_code = models.CharField(max_length=20, blank=True)

    # Status & Plan
    status = models.CharField(
        max_length=20,
        choices=TenantStatus.choices,
        default=TenantStatus.TRIAL
    )
    plan = models.CharField(
        max_length=20,
        choices=PlanType.choices,
        default=PlanType.FREE
    )

    # Limits (based on plan)
    max_users = models.PositiveIntegerField(default=5)
    max_storage_gb = models.PositiveIntegerField(default=1)

    # Features (JSON for flexibility)
    enabled_modules = models.JSONField(
        default=list,
        help_text="List of enabled modules (hr, finance, research, etc.)"
    )
    settings = models.JSONField(
        default=dict,
        help_text="Tenant-specific settings (branding, timezone, locale)"
    )

    # Branding
    logo = models.ImageField(upload_to='tenants/logos/', blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#005357')

    # Dates
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    subscription_ends_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Tenant'
        verbose_name_plural = 'Tenants'
        ordering = ['name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['subdomain']),
            models.Index(fields=['status']),
            models.Index(fields=['plan']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        if not self.subdomain:
            self.subdomain = self.slug
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        """Check if tenant is active."""
        return self.status == TenantStatus.ACTIVE

    @property
    def is_trial(self):
        """Check if tenant is in trial period."""
        return self.status == TenantStatus.TRIAL

    def get_user_count(self):
        """Get number of users in this tenant."""
        return self.tenant_users.filter(is_active=True).count()

    def has_module(self, module_name):
        """Check if a module is enabled for this tenant."""
        return module_name in self.enabled_modules


class TenantUser(BaseModel):
    """
    User membership in a tenant with role-based access.

    Allows users to belong to multiple tenants with different roles.
    """

    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='tenant_users'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tenant_memberships'
    )
    role = models.CharField(
        max_length=20,
        choices=TenantRole.choices,
        default=TenantRole.MEMBER
    )
    is_owner = models.BooleanField(
        default=False,
        help_text="Owner has full control and billing access"
    )

    # Invitation tracking
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tenant_invitations_sent'
    )
    invited_at = models.DateTimeField(auto_now_add=True)
    joined_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Tenant User'
        verbose_name_plural = 'Tenant Users'
        unique_together = [('tenant', 'user')]
        ordering = ['-is_owner', 'role', 'user__email']
        indexes = [
            models.Index(fields=['tenant', 'user']),
            models.Index(fields=['tenant', 'is_active']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.tenant.name} ({self.get_role_display()})"

    @property
    def can_manage_users(self):
        """Check if user can manage other users in tenant."""
        return self.role in [TenantRole.OWNER, TenantRole.ADMIN]

    @property
    def can_manage_billing(self):
        """Check if user can manage billing."""
        return self.is_owner or self.role == TenantRole.ADMIN


class Subscription(BaseModel, AuditMixin):
    """
    Subscription and billing information for a tenant.
    """

    tenant = models.OneToOneField(
        Tenant,
        on_delete=models.CASCADE,
        related_name='subscription'
    )

    # Plan Details
    plan = models.CharField(
        max_length=20,
        choices=PlanType.choices,
        default=PlanType.FREE
    )

    # Billing
    billing_email = models.EmailField()
    billing_name = models.CharField(max_length=200, blank=True)
    billing_address = models.TextField(blank=True)

    # Payment Gateway (Stripe/Paddle)
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True)

    # Subscription Period
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)

    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('trialing', 'Trialing'),
            ('past_due', 'Past Due'),
            ('canceled', 'Canceled'),
            ('unpaid', 'Unpaid'),
        ],
        default='trialing'
    )

    # Cancellation
    cancel_at_period_end = models.BooleanField(default=False)
    canceled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.tenant.name} - {self.get_plan_display()}"

    @property
    def is_active(self):
        """Check if subscription is active."""
        return self.status in ['active', 'trialing']
