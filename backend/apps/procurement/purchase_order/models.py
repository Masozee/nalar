"""
Purchase Order models.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.core.models import BaseModel, AuditMixin
from apps.procurement.vendor.models import Vendor


class POStatus(models.TextChoices):
    """Purchase Order status."""
    DRAFT = 'draft', 'Draf'
    PENDING_APPROVAL = 'pending_approval', 'Menunggu Persetujuan'
    APPROVED = 'approved', 'Disetujui'
    REJECTED = 'rejected', 'Ditolak'
    SENT = 'sent', 'Dikirim ke Vendor'
    PARTIAL = 'partial', 'Penerimaan Sebagian'
    RECEIVED = 'received', 'Diterima Lengkap'
    CANCELLED = 'cancelled', 'Dibatalkan'
    CLOSED = 'closed', 'Selesai'


class POPriority(models.TextChoices):
    """Purchase Order priority."""
    LOW = 'low', 'Rendah'
    NORMAL = 'normal', 'Normal'
    HIGH = 'high', 'Tinggi'
    URGENT = 'urgent', 'Urgent'


class PaymentStatus(models.TextChoices):
    """Payment status for PO."""
    UNPAID = 'unpaid', 'Belum Dibayar'
    PARTIAL = 'partial', 'Dibayar Sebagian'
    PAID = 'paid', 'Lunas'


class PurchaseOrder(BaseModel, AuditMixin):
    """
    Purchase Order header.
    """
    # PO identification
    po_number = models.CharField(max_length=30, unique=True)
    reference_number = models.CharField(max_length=50, blank=True)

    # Vendor
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.PROTECT,
        related_name='purchase_orders',
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=POStatus.choices,
        default=POStatus.DRAFT,
    )
    priority = models.CharField(
        max_length=20,
        choices=POPriority.choices,
        default=POPriority.NORMAL,
    )

    # Dates
    order_date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)

    # Requester info
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='requested_pos',
    )
    department = models.CharField(max_length=100, blank=True)

    # Delivery info
    delivery_address = models.TextField(blank=True)
    delivery_notes = models.TextField(blank=True)

    # Financial
    currency = models.CharField(max_length=3, default='IDR')
    subtotal = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )
    discount_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )
    tax_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=11,  # PPN 11%
    )
    tax_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )

    # Payment
    payment_terms = models.PositiveIntegerField(
        default=30,
        help_text='Payment terms in days'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
    )
    paid_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )

    # Approval
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_pos',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    # Notes
    terms_conditions = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Purchase Order'
        verbose_name_plural = 'Purchase Orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['po_number']),
            models.Index(fields=['status']),
            models.Index(fields=['vendor']),
            models.Index(fields=['order_date']),
            models.Index(fields=['payment_status']),
        ]

    def __str__(self):
        return f"{self.po_number} - {self.vendor.name}"

    def save(self, *args, **kwargs):
        if not self.po_number:
            self.po_number = self.generate_po_number()
        super().save(*args, **kwargs)

    def generate_po_number(self):
        """Generate PO number like PO-2024-0001."""
        from django.utils import timezone
        year = timezone.now().year
        prefix = f'PO-{year}-'
        last = PurchaseOrder.objects.filter(
            po_number__startswith=prefix
        ).order_by('-po_number').first()

        if last:
            try:
                num = int(last.po_number.split('-')[-1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f'{prefix}{num:04d}'

    def calculate_totals(self):
        """Recalculate totals from items."""
        items = self.items.filter(is_active=True)
        self.subtotal = sum(item.total_price for item in items)

        # Calculate discount
        if self.discount_percent > 0:
            self.discount_amount = self.subtotal * (self.discount_percent / Decimal('100'))

        # Calculate tax on discounted amount
        taxable = self.subtotal - self.discount_amount
        if self.tax_percent > 0:
            self.tax_amount = taxable * (self.tax_percent / Decimal('100'))

        self.total_amount = taxable + self.tax_amount
        self.save(update_fields=[
            'subtotal', 'discount_amount', 'tax_amount', 'total_amount'
        ])

    def update_payment_status(self):
        """Update payment status based on paid amount."""
        if self.paid_amount >= self.total_amount:
            self.payment_status = PaymentStatus.PAID
        elif self.paid_amount > 0:
            self.payment_status = PaymentStatus.PARTIAL
        else:
            self.payment_status = PaymentStatus.UNPAID
        self.save(update_fields=['payment_status'])


class POItem(BaseModel):
    """
    Purchase Order line items.
    """
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name='items',
    )
    line_number = models.PositiveIntegerField(default=1)

    # Item details
    item_code = models.CharField(max_length=50, blank=True)
    item_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=20, default='pcs')

    # Quantity
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    received_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # Pricing
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
    )
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )
    total_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )

    # Notes
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'PO Item'
        verbose_name_plural = 'PO Items'
        ordering = ['line_number']
        indexes = [
            models.Index(fields=['purchase_order', 'line_number']),
        ]

    def __str__(self):
        return f"{self.purchase_order.po_number} - {self.item_name}"

    def save(self, *args, **kwargs):
        # Calculate total price
        base_price = self.quantity * self.unit_price
        if self.discount_percent > 0:
            discount = base_price * (self.discount_percent / Decimal('100'))
            self.total_price = base_price - discount
        else:
            self.total_price = base_price

        # Auto-assign line number
        if not self.line_number:
            last_item = POItem.objects.filter(
                purchase_order=self.purchase_order
            ).order_by('-line_number').first()
            self.line_number = (last_item.line_number + 1) if last_item else 1

        super().save(*args, **kwargs)

        # Recalculate PO totals
        self.purchase_order.calculate_totals()

    @property
    def is_fully_received(self):
        return self.received_quantity >= self.quantity

    @property
    def pending_quantity(self):
        return max(self.quantity - self.received_quantity, Decimal('0'))


class POReceipt(BaseModel, AuditMixin):
    """
    Goods receipt for Purchase Order.
    """
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name='receipts',
    )
    receipt_number = models.CharField(max_length=30, unique=True)
    receipt_date = models.DateField()

    # Receiver
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='po_receipts',
    )

    # Vendor delivery info
    delivery_note_number = models.CharField(max_length=50, blank=True)
    delivery_date = models.DateField(null=True, blank=True)

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'PO Receipt'
        verbose_name_plural = 'PO Receipts'
        ordering = ['-receipt_date']

    def __str__(self):
        return f"{self.receipt_number} - {self.purchase_order.po_number}"

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = self.generate_receipt_number()
        super().save(*args, **kwargs)

    def generate_receipt_number(self):
        """Generate receipt number like GR-2024-0001."""
        from django.utils import timezone
        year = timezone.now().year
        prefix = f'GR-{year}-'
        last = POReceipt.objects.filter(
            receipt_number__startswith=prefix
        ).order_by('-receipt_number').first()

        if last:
            try:
                num = int(last.receipt_number.split('-')[-1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f'{prefix}{num:04d}'


class POReceiptItem(BaseModel):
    """
    Line items for goods receipt.
    """
    receipt = models.ForeignKey(
        POReceipt,
        on_delete=models.CASCADE,
        related_name='items',
    )
    po_item = models.ForeignKey(
        POItem,
        on_delete=models.CASCADE,
        related_name='receipt_items',
    )
    quantity_received = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    quantity_rejected = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    rejection_reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'PO Receipt Item'
        verbose_name_plural = 'PO Receipt Items'

    def __str__(self):
        return f"{self.receipt.receipt_number} - {self.po_item.item_name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Update PO item received quantity
        total_received = POReceiptItem.objects.filter(
            po_item=self.po_item
        ).aggregate(
            total=models.Sum('quantity_received')
        )['total'] or Decimal('0')

        self.po_item.received_quantity = total_received
        self.po_item.save(update_fields=['received_quantity'])

        # Update PO status
        self._update_po_status()

    def _update_po_status(self):
        """Update PO status based on receipt status."""
        po = self.receipt.purchase_order
        items = po.items.filter(is_active=True)

        all_received = all(item.is_fully_received for item in items)
        any_received = any(item.received_quantity > 0 for item in items)

        if all_received:
            po.status = POStatus.RECEIVED
            po.actual_delivery_date = self.receipt.receipt_date
        elif any_received:
            po.status = POStatus.PARTIAL

        po.save(update_fields=['status', 'actual_delivery_date'])
