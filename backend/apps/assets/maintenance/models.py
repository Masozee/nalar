"""
Asset Maintenance models for tracking asset repairs and maintenance schedules.
"""
from django.db import models
from django.conf import settings
from apps.core.models import BaseModel, AuditMixin


class AssetCategory(models.TextChoices):
    IT_EQUIPMENT = 'it_equipment', 'Peralatan IT'
    FURNITURE = 'furniture', 'Furnitur'
    VEHICLE = 'vehicle', 'Kendaraan'
    ELECTRONICS = 'electronics', 'Elektronik'
    OFFICE_EQUIPMENT = 'office_equipment', 'Peralatan Kantor'
    BUILDING = 'building', 'Gedung/Bangunan'
    OTHER = 'other', 'Lainnya'


class AssetStatus(models.TextChoices):
    ACTIVE = 'active', 'Aktif'
    INACTIVE = 'inactive', 'Tidak Aktif'
    MAINTENANCE = 'maintenance', 'Dalam Perawatan'
    DISPOSED = 'disposed', 'Dibuang'
    LOST = 'lost', 'Hilang'
    DAMAGED = 'damaged', 'Rusak'


class MaintenanceType(models.TextChoices):
    PREVENTIVE = 'preventive', 'Pencegahan'
    CORRECTIVE = 'corrective', 'Perbaikan'
    EMERGENCY = 'emergency', 'Darurat'
    INSPECTION = 'inspection', 'Inspeksi'


class MaintenanceStatus(models.TextChoices):
    SCHEDULED = 'scheduled', 'Terjadwal'
    IN_PROGRESS = 'in_progress', 'Sedang Dikerjakan'
    COMPLETED = 'completed', 'Selesai'
    CANCELLED = 'cancelled', 'Dibatalkan'
    PENDING_PARTS = 'pending_parts', 'Menunggu Sparepart'


class Asset(BaseModel):
    """Master data for company assets."""
    asset_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=20,
        choices=AssetCategory.choices,
        default=AssetCategory.OTHER,
    )
    brand = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    serial_number = models.CharField(max_length=100, blank=True)

    # Purchase info
    purchase_date = models.DateField(null=True, blank=True)
    purchase_price = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    vendor = models.CharField(max_length=200, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)

    # Location
    location = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=100, blank=True)

    # Status
    status = models.CharField(
        max_length=20,
        choices=AssetStatus.choices,
        default=AssetStatus.ACTIVE,
    )

    # Depreciation
    useful_life_years = models.PositiveIntegerField(null=True, blank=True)
    salvage_value = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )

    # Current holder
    current_holder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='held_assets',
    )

    notes = models.TextField(blank=True)
    photo = models.ImageField(upload_to='assets/photos/', blank=True, null=True)

    class Meta:
        verbose_name = 'Asset'
        verbose_name_plural = 'Assets'
        ordering = ['asset_code']
        indexes = [
            models.Index(fields=['asset_code']),
            models.Index(fields=['category']),
            models.Index(fields=['status']),
            models.Index(fields=['current_holder']),
        ]

    def __str__(self):
        return f"{self.asset_code} - {self.name}"

    @property
    def current_value(self):
        """Calculate current depreciated value using straight-line method."""
        if not all([self.purchase_price, self.purchase_date, self.useful_life_years]):
            return self.purchase_price

        from django.utils import timezone
        from datetime import date

        from decimal import Decimal

        today = timezone.now().date()
        years_owned = Decimal((today - self.purchase_date).days) / Decimal('365.25')

        if years_owned >= self.useful_life_years:
            return self.salvage_value or Decimal('0')

        annual_depreciation = (
            (self.purchase_price - (self.salvage_value or Decimal('0'))) / self.useful_life_years
        )
        depreciation = annual_depreciation * years_owned
        return max(self.purchase_price - depreciation, self.salvage_value or Decimal('0'))


class MaintenanceSchedule(BaseModel):
    """Scheduled maintenance for assets."""
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name='maintenance_schedules',
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    maintenance_type = models.CharField(
        max_length=20,
        choices=MaintenanceType.choices,
        default=MaintenanceType.PREVENTIVE,
    )

    # Schedule
    frequency_days = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Days between maintenance (for recurring)'
    )
    last_performed = models.DateField(null=True, blank=True)
    next_due = models.DateField()

    # Notification
    notify_days_before = models.PositiveIntegerField(default=7)

    class Meta:
        verbose_name = 'Maintenance Schedule'
        verbose_name_plural = 'Maintenance Schedules'
        ordering = ['next_due']

    def __str__(self):
        return f"{self.asset.asset_code} - {self.title}"


class MaintenanceRecord(BaseModel, AuditMixin):
    """Actual maintenance work performed on assets."""
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name='maintenance_records',
    )
    schedule = models.ForeignKey(
        MaintenanceSchedule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='records',
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    maintenance_type = models.CharField(
        max_length=20,
        choices=MaintenanceType.choices,
        default=MaintenanceType.CORRECTIVE,
    )

    status = models.CharField(
        max_length=20,
        choices=MaintenanceStatus.choices,
        default=MaintenanceStatus.SCHEDULED,
    )

    # Dates
    scheduled_date = models.DateField()
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Personnel
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_maintenance',
    )
    performed_by = models.CharField(max_length=200, blank=True)
    vendor = models.CharField(max_length=200, blank=True)

    # Costs
    labor_cost = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    parts_cost = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    total_cost = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    # Results
    findings = models.TextField(blank=True)
    actions_taken = models.TextField(blank=True)
    parts_replaced = models.TextField(blank=True)

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Maintenance Record'
        verbose_name_plural = 'Maintenance Records'
        ordering = ['-scheduled_date']
        indexes = [
            models.Index(fields=['asset', 'scheduled_date']),
            models.Index(fields=['status']),
            models.Index(fields=['maintenance_type']),
        ]

    def __str__(self):
        return f"{self.asset.asset_code} - {self.title} ({self.scheduled_date})"

    def save(self, *args, **kwargs):
        self.total_cost = self.labor_cost + self.parts_cost
        super().save(*args, **kwargs)

        # Update schedule if linked
        if self.schedule and self.status == MaintenanceStatus.COMPLETED:
            self.schedule.last_performed = self.completed_at.date() if self.completed_at else self.scheduled_date
            if self.schedule.frequency_days:
                from datetime import timedelta
                self.schedule.next_due = self.schedule.last_performed + timedelta(days=self.schedule.frequency_days)
            self.schedule.save()
