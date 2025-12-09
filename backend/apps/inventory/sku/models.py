"""
SKU (Stock Keeping Unit) models for inventory management.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.core.models import TenantBaseModel, AuditMixin


class ItemCategory(models.TextChoices):
    """Item category classification."""
    OFFICE_SUPPLIES = 'office_supplies', 'Perlengkapan Kantor'
    IT_EQUIPMENT = 'it_equipment', 'Peralatan IT'
    FURNITURE = 'furniture', 'Furniture'
    CONSUMABLES = 'consumables', 'Barang Habis Pakai'
    MAINTENANCE = 'maintenance', 'Perlengkapan Maintenance'
    CLEANING = 'cleaning', 'Perlengkapan Kebersihan'
    PANTRY = 'pantry', 'Perlengkapan Pantry'
    SAFETY = 'safety', 'Perlengkapan Keselamatan'
    OTHER = 'other', 'Lainnya'


class UnitOfMeasure(models.TextChoices):
    """Unit of measure for items."""
    PCS = 'pcs', 'Pcs'
    UNIT = 'unit', 'Unit'
    BOX = 'box', 'Box'
    PACK = 'pack', 'Pack'
    RIM = 'rim', 'Rim'
    ROLL = 'roll', 'Roll'
    SET = 'set', 'Set'
    LITER = 'liter', 'Liter'
    KG = 'kg', 'Kg'
    METER = 'meter', 'Meter'
    DOZEN = 'dozen', 'Lusin'
    CARTON = 'carton', 'Karton'


class SKU(TenantBaseModel, AuditMixin):
    """
    Stock Keeping Unit - master data for inventory items.
    """
    # Identification
    sku_code = models.CharField(max_length=30, unique=True)
    barcode = models.CharField(max_length=50, blank=True, unique=True, null=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    # Classification
    category = models.CharField(
        max_length=20,
        choices=ItemCategory.choices,
        default=ItemCategory.OTHER,
    )

    # Unit
    unit = models.CharField(
        max_length=20,
        choices=UnitOfMeasure.choices,
        default=UnitOfMeasure.PCS,
    )

    # Pricing
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text='Harga per unit'
    )

    # Stock levels
    minimum_stock = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text='Stok minimum untuk reorder alert'
    )
    maximum_stock = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text='Stok maksimum'
    )
    reorder_point = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text='Titik reorder'
    )
    reorder_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text='Jumlah reorder'
    )

    # Current stock (denormalized for quick access)
    current_stock = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # Location
    default_location = models.ForeignKey(
        'Warehouse',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='default_skus',
    )

    # Attributes
    brand = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    specifications = models.JSONField(default=dict, blank=True)

    # Status
    is_stockable = models.BooleanField(default=True)
    is_purchasable = models.BooleanField(default=True)

    # Image
    image = models.ImageField(upload_to='inventory/sku/', blank=True, null=True)

    class Meta:
        verbose_name = 'SKU'
        verbose_name_plural = 'SKUs'
        ordering = ['name']
        indexes = [
            models.Index(fields=['sku_code']),
            models.Index(fields=['barcode']),
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['current_stock']),
        ]

    def __str__(self):
        return f"{self.sku_code} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.sku_code:
            self.sku_code = self.generate_sku_code()
        super().save(*args, **kwargs)

    def generate_sku_code(self):
        """Generate SKU code like SKU-0001."""
        last = SKU.objects.order_by('-created_at').first()
        if last and last.sku_code.startswith('SKU-'):
            try:
                num = int(last.sku_code.split('-')[1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f'SKU-{num:04d}'

    @property
    def is_low_stock(self):
        return self.current_stock <= self.minimum_stock

    @property
    def needs_reorder(self):
        return self.current_stock <= self.reorder_point

    def update_stock(self):
        """Recalculate current stock from stock records."""
        from django.db.models import Sum
        total = self.stock_records.filter(is_active=True).aggregate(
            total=Sum('quantity')
        )['total'] or Decimal('0')
        self.current_stock = total
        self.save(update_fields=['current_stock'])


class Warehouse(TenantBaseModel):
    """Warehouse/storage location for inventory."""
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    address = models.TextField(blank=True)

    # Contact
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_warehouses',
    )
    phone = models.CharField(max_length=20, blank=True)

    # Status
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Warehouse'
        verbose_name_plural = 'Warehouses'
        ordering = ['name']

    def __str__(self):
        return f"{self.code} - {self.name}"

    def save(self, *args, **kwargs):
        # Ensure only one default warehouse
        if self.is_default:
            Warehouse.objects.filter(is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class StockRecord(TenantBaseModel, AuditMixin):
    """
    Stock record for tracking inventory quantities per SKU and warehouse.
    """
    sku = models.ForeignKey(
        SKU,
        on_delete=models.CASCADE,
        related_name='stock_records',
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='stock_records',
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    reserved_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text='Quantity reserved for pending orders'
    )

    class Meta:
        verbose_name = 'Stock Record'
        verbose_name_plural = 'Stock Records'
        unique_together = ['sku', 'warehouse']
        indexes = [
            models.Index(fields=['sku', 'warehouse']),
        ]

    def __str__(self):
        return f"{self.sku.name} @ {self.warehouse.name}: {self.quantity}"

    @property
    def available_quantity(self):
        return self.quantity - self.reserved_quantity

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update SKU's denormalized current_stock
        self.sku.update_stock()


class StockMovement(TenantBaseModel, AuditMixin):
    """
    Stock movement history for audit trail.
    """
    MOVEMENT_TYPES = [
        ('in', 'Masuk'),
        ('out', 'Keluar'),
        ('adjustment', 'Penyesuaian'),
        ('transfer_in', 'Transfer Masuk'),
        ('transfer_out', 'Transfer Keluar'),
        ('opname', 'Stock Opname'),
    ]

    sku = models.ForeignKey(
        SKU,
        on_delete=models.CASCADE,
        related_name='movements',
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='movements',
    )
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )
    quantity_before = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    quantity_after = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # Reference
    reference_type = models.CharField(max_length=50, blank=True)
    reference_id = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)

    movement_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Stock Movement'
        verbose_name_plural = 'Stock Movements'
        ordering = ['-movement_date']
        indexes = [
            models.Index(fields=['sku', 'warehouse', 'movement_date']),
            models.Index(fields=['movement_type']),
            models.Index(fields=['reference_type', 'reference_id']),
        ]

    def __str__(self):
        return f"{self.sku.name} - {self.get_movement_type_display()} - {self.quantity}"
