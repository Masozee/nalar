"""
Asset Assignment models for tracking asset assignments to employees.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import BaseModel, AuditMixin


class AssignmentStatus(models.TextChoices):
    ACTIVE = 'active', 'Aktif'
    RETURNED = 'returned', 'Dikembalikan'
    TRANSFERRED = 'transferred', 'Dipindahkan'
    LOST = 'lost', 'Hilang'
    DAMAGED = 'damaged', 'Rusak'


class AssignmentType(models.TextChoices):
    PERMANENT = 'permanent', 'Permanen'
    TEMPORARY = 'temporary', 'Sementara'
    PROJECT = 'project', 'Proyek'


class AssetAssignment(BaseModel, AuditMixin):
    """Track asset assignments to users."""
    asset = models.ForeignKey(
        'assets.Asset',
        on_delete=models.CASCADE,
        related_name='assignments',
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='asset_assignments',
    )

    assignment_type = models.CharField(
        max_length=20,
        choices=AssignmentType.choices,
        default=AssignmentType.PERMANENT,
    )
    status = models.CharField(
        max_length=20,
        choices=AssignmentStatus.choices,
        default=AssignmentStatus.ACTIVE,
    )

    # Dates
    assigned_date = models.DateField(auto_now_add=True)
    expected_return_date = models.DateField(null=True, blank=True)
    actual_return_date = models.DateField(null=True, blank=True)

    # Assignment details
    purpose = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)

    # Condition tracking
    condition_at_assignment = models.TextField(blank=True)
    condition_at_return = models.TextField(blank=True)

    # Approval
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_asset_assignments',
    )

    # Return
    returned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_asset_returns',
    )

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Asset Assignment'
        verbose_name_plural = 'Asset Assignments'
        ordering = ['-assigned_date']
        indexes = [
            models.Index(fields=['asset', 'status']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['assigned_date']),
        ]

    def __str__(self):
        return f"{self.asset.asset_code} -> {self.assigned_to.email}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update asset's current holder
        if self.status == AssignmentStatus.ACTIVE:
            self.asset.current_holder = self.assigned_to
            self.asset.save(update_fields=['current_holder'])
        elif self.status == AssignmentStatus.RETURNED:
            # Check if there's another active assignment
            active = self.asset.assignments.filter(
                status=AssignmentStatus.ACTIVE
            ).exclude(pk=self.pk).first()
            if active:
                self.asset.current_holder = active.assigned_to
            else:
                self.asset.current_holder = None
            self.asset.save(update_fields=['current_holder'])


class AssetTransfer(BaseModel, AuditMixin):
    """Track asset transfers between users."""
    asset = models.ForeignKey(
        'assets.Asset',
        on_delete=models.CASCADE,
        related_name='transfers',
    )
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='asset_transfers_out',
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='asset_transfers_in',
    )

    transfer_date = models.DateField(auto_now_add=True)
    reason = models.TextField()

    # Condition
    condition = models.TextField(blank=True)

    # Approval
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_asset_transfers',
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Asset Transfer'
        verbose_name_plural = 'Asset Transfers'
        ordering = ['-transfer_date']

    def __str__(self):
        return f"{self.asset.asset_code}: {self.from_user.email} -> {self.to_user.email}"


class AssetCheckout(BaseModel):
    """Temporary asset checkout (e.g., projector for meeting)."""
    asset = models.ForeignKey(
        'assets.Asset',
        on_delete=models.CASCADE,
        related_name='checkouts',
    )
    checked_out_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='asset_checkouts',
    )

    checkout_time = models.DateTimeField(default=timezone.now)
    expected_return_time = models.DateTimeField()
    actual_return_time = models.DateTimeField(null=True, blank=True)

    purpose = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)

    is_returned = models.BooleanField(default=False)
    returned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_asset_checkouts',
    )

    condition_on_return = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Asset Checkout'
        verbose_name_plural = 'Asset Checkouts'
        ordering = ['-checkout_time']

    def __str__(self):
        return f"{self.asset.asset_code} - {self.checked_out_by.email} ({self.checkout_time.date()})"

    @property
    def is_overdue(self):
        if self.is_returned:
            return False
        return timezone.now() > self.expected_return_time
