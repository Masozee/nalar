"""
Vendor management models.
"""
from django.db import models
from django.conf import settings
from apps.core.models import BaseModel, AuditMixin


class VendorCategory(models.TextChoices):
    """Vendor category classification."""
    GOODS = 'goods', 'Barang'
    SERVICES = 'services', 'Jasa'
    BOTH = 'both', 'Barang & Jasa'


class VendorStatus(models.TextChoices):
    """Vendor status in the system."""
    ACTIVE = 'active', 'Aktif'
    INACTIVE = 'inactive', 'Tidak Aktif'
    BLACKLISTED = 'blacklisted', 'Blacklist'
    PENDING = 'pending', 'Menunggu Verifikasi'


class VendorType(models.TextChoices):
    """Vendor business type."""
    PT = 'pt', 'PT (Perseroan Terbatas)'
    CV = 'cv', 'CV (Commanditaire Vennootschap)'
    UD = 'ud', 'UD (Usaha Dagang)'
    PERORANGAN = 'perorangan', 'Perorangan'
    KOPERASI = 'koperasi', 'Koperasi'
    YAYASAN = 'yayasan', 'Yayasan'
    OTHER = 'other', 'Lainnya'


class Vendor(BaseModel, AuditMixin):
    """
    Vendor/Supplier master data.
    """
    # Basic info
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    vendor_type = models.CharField(
        max_length=20,
        choices=VendorType.choices,
        default=VendorType.PT,
    )
    category = models.CharField(
        max_length=20,
        choices=VendorCategory.choices,
        default=VendorCategory.GOODS,
    )
    status = models.CharField(
        max_length=20,
        choices=VendorStatus.choices,
        default=VendorStatus.PENDING,
    )

    # Legal info
    npwp = models.CharField(max_length=30, blank=True, verbose_name='NPWP')
    nib = models.CharField(max_length=30, blank=True, verbose_name='NIB')
    siup_number = models.CharField(max_length=50, blank=True, verbose_name='No. SIUP')

    # Contact info
    address = models.TextField()
    city = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10, blank=True)
    phone = models.CharField(max_length=20)
    fax = models.CharField(max_length=20, blank=True)
    email = models.EmailField()
    website = models.URLField(blank=True)

    # Contact person
    contact_person = models.CharField(max_length=100)
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField(blank=True)

    # Banking info
    bank_name = models.CharField(max_length=100, blank=True)
    bank_branch = models.CharField(max_length=100, blank=True)
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_account_name = models.CharField(max_length=100, blank=True)

    # Terms
    payment_terms = models.PositiveIntegerField(
        default=30,
        help_text='Payment terms in days'
    )
    credit_limit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text='Credit limit in IDR'
    )

    # Rating and notes
    rating = models.PositiveSmallIntegerField(
        default=3,
        help_text='Rating 1-5'
    )
    notes = models.TextField(blank=True)
    blacklist_reason = models.TextField(blank=True)

    # Documents
    documents = models.JSONField(
        default=list,
        blank=True,
        help_text='List of document references'
    )

    class Meta:
        verbose_name = 'Vendor'
        verbose_name_plural = 'Vendors'
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['name']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['city']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_code()
        super().save(*args, **kwargs)

    def generate_code(self):
        """Generate vendor code like VND-0001."""
        last = Vendor.objects.order_by('-created_at').first()
        if last and last.code.startswith('VND-'):
            try:
                num = int(last.code.split('-')[1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f'VND-{num:04d}'


class VendorContact(BaseModel):
    """Additional contacts for a vendor."""
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='contacts',
    )
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    is_primary = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Vendor Contact'
        verbose_name_plural = 'Vendor Contacts'
        ordering = ['-is_primary', 'name']

    def __str__(self):
        return f"{self.vendor.name} - {self.name}"


class VendorEvaluation(BaseModel, AuditMixin):
    """Periodic vendor evaluation/assessment."""
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='evaluations',
    )
    evaluation_date = models.DateField()
    period_start = models.DateField()
    period_end = models.DateField()

    # Scoring (1-5 scale)
    quality_score = models.PositiveSmallIntegerField(
        default=3,
        help_text='Kualitas produk/jasa (1-5)'
    )
    delivery_score = models.PositiveSmallIntegerField(
        default=3,
        help_text='Ketepatan pengiriman (1-5)'
    )
    price_score = models.PositiveSmallIntegerField(
        default=3,
        help_text='Kesesuaian harga (1-5)'
    )
    service_score = models.PositiveSmallIntegerField(
        default=3,
        help_text='Pelayanan (1-5)'
    )
    compliance_score = models.PositiveSmallIntegerField(
        default=3,
        help_text='Kepatuhan terhadap kontrak (1-5)'
    )

    overall_score = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
    )
    recommendation = models.TextField(blank=True)
    evaluator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='vendor_evaluations',
    )

    class Meta:
        verbose_name = 'Vendor Evaluation'
        verbose_name_plural = 'Vendor Evaluations'
        ordering = ['-evaluation_date']
        indexes = [
            models.Index(fields=['vendor', 'evaluation_date']),
        ]

    def __str__(self):
        return f"{self.vendor.name} - {self.evaluation_date}"

    def save(self, *args, **kwargs):
        # Calculate overall score
        scores = [
            self.quality_score,
            self.delivery_score,
            self.price_score,
            self.service_score,
            self.compliance_score,
        ]
        from decimal import Decimal
        self.overall_score = Decimal(sum(scores)) / Decimal(len(scores))
        super().save(*args, **kwargs)

        # Update vendor rating
        self.vendor.rating = round(float(self.overall_score))
        self.vendor.save(update_fields=['rating'])
