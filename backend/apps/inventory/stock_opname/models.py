"""
Stock Opname (Physical Inventory Count) models.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from apps.core.models import BaseModel, AuditMixin
from apps.inventory.sku.models import SKU, Warehouse, StockRecord, StockMovement


class OpnameStatus(models.TextChoices):
    """Stock opname status."""
    DRAFT = 'draft', 'Draf'
    IN_PROGRESS = 'in_progress', 'Sedang Berjalan'
    PENDING_APPROVAL = 'pending_approval', 'Menunggu Persetujuan'
    APPROVED = 'approved', 'Disetujui'
    REJECTED = 'rejected', 'Ditolak'
    COMPLETED = 'completed', 'Selesai'
    CANCELLED = 'cancelled', 'Dibatalkan'


class StockOpname(BaseModel, AuditMixin):
    """
    Stock Opname header - physical inventory count session.
    """
    opname_number = models.CharField(max_length=30, unique=True)
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name='opnames',
    )

    # Dates
    scheduled_date = models.DateField()
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    # Status
    status = models.CharField(
        max_length=20,
        choices=OpnameStatus.choices,
        default=OpnameStatus.DRAFT,
    )

    # Scope
    category_filter = models.CharField(
        max_length=20,
        blank=True,
        help_text='Filter by category, empty for all'
    )
    is_full_count = models.BooleanField(
        default=True,
        help_text='Full count or cycle count'
    )

    # Personnel
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_opnames',
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_opnames',
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    # Summary
    total_items = models.PositiveIntegerField(default=0)
    counted_items = models.PositiveIntegerField(default=0)
    variance_items = models.PositiveIntegerField(default=0)
    total_variance_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )

    notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Stock Opname'
        verbose_name_plural = 'Stock Opnames'
        ordering = ['-scheduled_date']
        indexes = [
            models.Index(fields=['opname_number']),
            models.Index(fields=['warehouse', 'scheduled_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.opname_number} - {self.warehouse.name}"

    def save(self, *args, **kwargs):
        if not self.opname_number:
            self.opname_number = self.generate_opname_number()
        super().save(*args, **kwargs)

    def generate_opname_number(self):
        """Generate opname number like SO-2024-0001."""
        year = timezone.now().year
        prefix = f'SO-{year}-'
        last = StockOpname.objects.filter(
            opname_number__startswith=prefix
        ).order_by('-opname_number').first()

        if last:
            try:
                num = int(last.opname_number.split('-')[-1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f'{prefix}{num:04d}'

    def generate_items(self):
        """Generate opname items from current stock records."""
        if self.status != OpnameStatus.DRAFT:
            return

        stock_records = StockRecord.objects.filter(
            warehouse=self.warehouse,
            is_active=True,
        )

        if self.category_filter:
            stock_records = stock_records.filter(sku__category=self.category_filter)

        for record in stock_records:
            StockOpnameItem.objects.get_or_create(
                opname=self,
                sku=record.sku,
                defaults={
                    'system_quantity': record.quantity,
                }
            )

        self.total_items = self.items.count()
        self.save(update_fields=['total_items'])

    def calculate_summary(self):
        """Calculate opname summary."""
        items = self.items.filter(is_active=True)
        self.counted_items = items.filter(is_counted=True).count()
        self.variance_items = items.filter(has_variance=True).count()
        self.total_variance_value = sum(
            item.variance_value for item in items if item.has_variance
        )
        self.save(update_fields=['counted_items', 'variance_items', 'total_variance_value'])

    def apply_adjustments(self):
        """Apply stock adjustments after approval."""
        if self.status != OpnameStatus.APPROVED:
            return

        for item in self.items.filter(is_counted=True, has_variance=True):
            # Get or create stock record
            stock_record, _ = StockRecord.objects.get_or_create(
                sku=item.sku,
                warehouse=self.warehouse,
                defaults={'quantity': 0}
            )

            # Record movement
            StockMovement.objects.create(
                sku=item.sku,
                warehouse=self.warehouse,
                movement_type='opname',
                quantity=item.variance_quantity,
                quantity_before=stock_record.quantity,
                quantity_after=item.actual_quantity,
                reference_type='stock_opname',
                reference_id=str(self.id),
                notes=f'Stock Opname: {self.opname_number}',
                created_by=self.approved_by,
                updated_by=self.approved_by,
            )

            # Update stock record
            stock_record.quantity = item.actual_quantity
            stock_record.save()

        self.status = OpnameStatus.COMPLETED
        self.end_date = timezone.now()
        self.save(update_fields=['status', 'end_date'])


class StockOpnameItem(BaseModel):
    """
    Stock Opname line item - individual SKU count.
    """
    opname = models.ForeignKey(
        StockOpname,
        on_delete=models.CASCADE,
        related_name='items',
    )
    sku = models.ForeignKey(
        SKU,
        on_delete=models.PROTECT,
        related_name='opname_items',
    )

    # Quantities
    system_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text='Quantity in system at opname start'
    )
    actual_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Actual counted quantity'
    )

    # Count info
    is_counted = models.BooleanField(default=False)
    counted_at = models.DateTimeField(null=True, blank=True)
    counted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='counted_opname_items',
    )

    # Variance
    has_variance = models.BooleanField(default=False)
    variance_reason = models.TextField(blank=True)

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Stock Opname Item'
        verbose_name_plural = 'Stock Opname Items'
        unique_together = ['opname', 'sku']
        ordering = ['sku__name']

    def __str__(self):
        return f"{self.opname.opname_number} - {self.sku.name}"

    @property
    def variance_quantity(self):
        if self.actual_quantity is None:
            return Decimal('0')
        return self.actual_quantity - self.system_quantity

    @property
    def variance_value(self):
        return self.variance_quantity * self.sku.unit_price

    def save(self, *args, **kwargs):
        # Check for variance
        if self.actual_quantity is not None:
            self.is_counted = True
            self.has_variance = self.actual_quantity != self.system_quantity
            if not self.counted_at:
                self.counted_at = timezone.now()

        super().save(*args, **kwargs)

        # Update parent summary
        if self.opname_id:
            self.opname.calculate_summary()
