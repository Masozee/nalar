"""
Stock Transfer models for moving inventory between warehouses.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from apps.core.models import TenantBaseModel, AuditMixin
from apps.inventory.sku.models import SKU, Warehouse, StockRecord, StockMovement


class TransferStatus(models.TextChoices):
    """Stock transfer status."""
    DRAFT = 'draft', 'Draf'
    PENDING_APPROVAL = 'pending_approval', 'Menunggu Persetujuan'
    APPROVED = 'approved', 'Disetujui'
    REJECTED = 'rejected', 'Ditolak'
    IN_TRANSIT = 'in_transit', 'Dalam Perjalanan'
    PARTIAL = 'partial', 'Diterima Sebagian'
    RECEIVED = 'received', 'Diterima'
    CANCELLED = 'cancelled', 'Dibatalkan'


class TransferPriority(models.TextChoices):
    """Transfer priority."""
    LOW = 'low', 'Rendah'
    NORMAL = 'normal', 'Normal'
    HIGH = 'high', 'Tinggi'
    URGENT = 'urgent', 'Urgent'


class StockTransfer(TenantBaseModel, AuditMixin):
    """
    Stock Transfer header - transfer between warehouses.
    """
    transfer_number = models.CharField(max_length=30, unique=True)

    # Warehouses
    source_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name='outgoing_transfers',
    )
    destination_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name='incoming_transfers',
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=TransferStatus.choices,
        default=TransferStatus.DRAFT,
    )
    priority = models.CharField(
        max_length=20,
        choices=TransferPriority.choices,
        default=TransferPriority.NORMAL,
    )

    # Dates
    requested_date = models.DateField(auto_now_add=True)
    expected_date = models.DateField(null=True, blank=True)
    shipped_date = models.DateTimeField(null=True, blank=True)
    received_date = models.DateTimeField(null=True, blank=True)

    # Personnel
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='requested_transfers',
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_transfers',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    shipped_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='shipped_transfers',
    )
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_transfers',
    )

    # Notes
    reason = models.TextField(blank=True, help_text='Alasan transfer')
    notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Stock Transfer'
        verbose_name_plural = 'Stock Transfers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transfer_number']),
            models.Index(fields=['status']),
            models.Index(fields=['source_warehouse']),
            models.Index(fields=['destination_warehouse']),
        ]

    def __str__(self):
        return f"{self.transfer_number}: {self.source_warehouse.code} → {self.destination_warehouse.code}"

    def save(self, *args, **kwargs):
        if not self.transfer_number:
            self.transfer_number = self.generate_transfer_number()
        super().save(*args, **kwargs)

    def generate_transfer_number(self):
        """Generate transfer number like ST-2024-0001."""
        year = timezone.now().year
        prefix = f'ST-{year}-'
        last = StockTransfer.objects.filter(
            transfer_number__startswith=prefix
        ).order_by('-transfer_number').first()

        if last:
            try:
                num = int(last.transfer_number.split('-')[-1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f'{prefix}{num:04d}'

    def ship(self, user):
        """Ship the transfer - deduct from source warehouse."""
        if self.status != TransferStatus.APPROVED:
            raise ValueError('Transfer must be approved before shipping')

        for item in self.items.filter(is_active=True):
            # Get source stock record
            source_record = StockRecord.objects.get(
                sku=item.sku,
                warehouse=self.source_warehouse,
            )

            if source_record.available_quantity < item.quantity:
                raise ValueError(f'Insufficient stock for {item.sku.name}')

            # Record movement out
            StockMovement.objects.create(
                sku=item.sku,
                warehouse=self.source_warehouse,
                movement_type='transfer_out',
                quantity=-item.quantity,
                quantity_before=source_record.quantity,
                quantity_after=source_record.quantity - item.quantity,
                reference_type='stock_transfer',
                reference_id=str(self.id),
                notes=f'Transfer ke {self.destination_warehouse.name}',
                created_by=user,
                updated_by=user,
            )

            # Update source stock
            source_record.quantity -= item.quantity
            source_record.save()

        self.status = TransferStatus.IN_TRANSIT
        self.shipped_date = timezone.now()
        self.shipped_by = user
        self.save(update_fields=['status', 'shipped_date', 'shipped_by'])

    def receive(self, user, items_received=None):
        """
        Receive the transfer - add to destination warehouse.
        items_received: dict of {item_id: received_quantity} for partial receipt
        """
        if self.status not in [TransferStatus.IN_TRANSIT, TransferStatus.PARTIAL]:
            raise ValueError('Transfer must be in transit to receive')

        all_received = True

        for item in self.items.filter(is_active=True):
            received_qty = item.quantity
            if items_received and str(item.id) in items_received:
                received_qty = Decimal(str(items_received[str(item.id)]))

            if received_qty <= 0:
                all_received = False
                continue

            # Get or create destination stock record
            dest_record, _ = StockRecord.objects.get_or_create(
                sku=item.sku,
                warehouse=self.destination_warehouse,
                defaults={'quantity': 0}
            )

            # Record movement in
            StockMovement.objects.create(
                sku=item.sku,
                warehouse=self.destination_warehouse,
                movement_type='transfer_in',
                quantity=received_qty,
                quantity_before=dest_record.quantity,
                quantity_after=dest_record.quantity + received_qty,
                reference_type='stock_transfer',
                reference_id=str(self.id),
                notes=f'Transfer dari {self.source_warehouse.name}',
                created_by=user,
                updated_by=user,
            )

            # Update destination stock
            dest_record.quantity += received_qty
            dest_record.save()

            # Update item received quantity
            item.received_quantity += received_qty
            item.save(update_fields=['received_quantity'])

            if item.received_quantity < item.quantity:
                all_received = False

        self.status = TransferStatus.RECEIVED if all_received else TransferStatus.PARTIAL
        self.received_date = timezone.now()
        self.received_by = user
        self.save(update_fields=['status', 'received_date', 'received_by'])


class StockTransferItem(TenantBaseModel):
    """
    Stock Transfer line item.
    """
    transfer = models.ForeignKey(
        StockTransfer,
        on_delete=models.CASCADE,
        related_name='items',
    )
    sku = models.ForeignKey(
        SKU,
        on_delete=models.PROTECT,
        related_name='transfer_items',
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    received_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Stock Transfer Item'
        verbose_name_plural = 'Stock Transfer Items'
        unique_together = ['transfer', 'sku']

    def __str__(self):
        return f"{self.transfer.transfer_number} - {self.sku.name}"

    @property
    def pending_quantity(self):
        return self.quantity - self.received_quantity

    @property
    def is_fully_received(self):
        return self.received_quantity >= self.quantity
