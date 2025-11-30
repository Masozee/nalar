"""
Models for Tools app.
"""
import secrets
import string
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import BaseModel
from apps.core.models.audit import AuditMixin


class ShortenedURL(BaseModel, AuditMixin):
    """URL Shortener model."""
    original_url = models.URLField(max_length=2048, verbose_name='URL Asli')
    short_code = models.CharField(
        max_length=20, unique=True, db_index=True,
        verbose_name='Kode Pendek'
    )
    title = models.CharField(max_length=200, blank=True, verbose_name='Judul')

    # Statistics
    click_count = models.PositiveIntegerField(default=0, verbose_name='Jumlah Klik')
    last_clicked_at = models.DateTimeField(null=True, blank=True)

    # Expiration
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='Kedaluwarsa')

    # Optional password protection
    password = models.CharField(max_length=128, blank=True, verbose_name='Password')

    class Meta:
        verbose_name = 'Shortened URL'
        verbose_name_plural = 'Shortened URLs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['short_code']),
            models.Index(fields=['created_by', '-created_at']),
        ]

    def __str__(self):
        return f"{self.short_code} -> {self.original_url[:50]}"

    def save(self, *args, **kwargs):
        if not self.short_code:
            self.short_code = self._generate_short_code()
        super().save(*args, **kwargs)

    def _generate_short_code(self, length=8):
        """Generate unique short code."""
        chars = string.ascii_letters + string.digits
        while True:
            code = ''.join(secrets.choice(chars) for _ in range(length))
            if not ShortenedURL.objects.filter(short_code=code).exists():
                return code

    def record_click(self):
        """Record a click on this URL."""
        self.click_count += 1
        self.last_clicked_at = timezone.now()
        self.save(update_fields=['click_count', 'last_clicked_at'])

    @property
    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    @property
    def short_url(self):
        """Return full short URL (needs base URL from settings)."""
        base = getattr(settings, 'SHORT_URL_BASE', 'http://localhost:8000/s/')
        return f"{base}{self.short_code}"


class URLClickLog(BaseModel):
    """Log of URL clicks for analytics."""
    shortened_url = models.ForeignKey(
        ShortenedURL, on_delete=models.CASCADE,
        related_name='click_logs'
    )
    clicked_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referer = models.URLField(max_length=2048, blank=True)

    # Location info
    country = models.CharField(max_length=100, blank=True)
    country_code = models.CharField(max_length=10, blank=True)
    city = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)

    # Device info (parsed from user agent)
    device_type = models.CharField(max_length=50, blank=True)  # mobile, tablet, desktop
    browser = models.CharField(max_length=100, blank=True)
    browser_version = models.CharField(max_length=50, blank=True)
    os = models.CharField(max_length=100, blank=True)
    os_version = models.CharField(max_length=50, blank=True)
    is_bot = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'URL Click Log'
        verbose_name_plural = 'URL Click Logs'
        ordering = ['-clicked_at']
        indexes = [
            models.Index(fields=['shortened_url', '-clicked_at']),
            models.Index(fields=['device_type']),
            models.Index(fields=['browser']),
            models.Index(fields=['country_code']),
        ]

    def __str__(self):
        return f"Click on {self.shortened_url.short_code} at {self.clicked_at}"


class QRCode(BaseModel, AuditMixin):
    """QR Code generation record."""
    class ContentType(models.TextChoices):
        URL = 'url', 'URL'
        TEXT = 'text', 'Teks'
        VCARD = 'vcard', 'vCard'
        WIFI = 'wifi', 'WiFi'
        EMAIL = 'email', 'Email'
        PHONE = 'phone', 'Telepon'
        SMS = 'sms', 'SMS'

    content_type = models.CharField(
        max_length=20, choices=ContentType.choices,
        default=ContentType.URL, verbose_name='Jenis Konten'
    )
    content = models.TextField(verbose_name='Konten')
    title = models.CharField(max_length=200, blank=True, verbose_name='Judul')

    # QR Code settings
    size = models.IntegerField(default=300, verbose_name='Ukuran (px)')
    error_correction = models.CharField(
        max_length=1, default='M',
        choices=[('L', 'Low'), ('M', 'Medium'), ('Q', 'Quartile'), ('H', 'High')],
        verbose_name='Error Correction'
    )
    foreground_color = models.CharField(max_length=7, default='#000000')
    background_color = models.CharField(max_length=7, default='#FFFFFF')

    # Generated file
    qr_image = models.ImageField(
        upload_to='tools/qrcodes/', blank=True, null=True,
        verbose_name='QR Code Image'
    )

    # Statistics
    download_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'QR Code'
        verbose_name_plural = 'QR Codes'
        ordering = ['-created_at']

    def __str__(self):
        return f"QR: {self.title or self.content[:30]}"


class CompressedImage(BaseModel, AuditMixin):
    """Image compression record."""
    class OutputFormat(models.TextChoices):
        JPEG = 'jpeg', 'JPEG'
        PNG = 'png', 'PNG'
        WEBP = 'webp', 'WebP'

    title = models.CharField(max_length=200, blank=True, verbose_name='Judul')
    original_image = models.ImageField(
        upload_to='tools/images/original/',
        verbose_name='Gambar Asli'
    )
    compressed_image = models.ImageField(
        upload_to='tools/images/compressed/',
        blank=True, null=True,
        verbose_name='Gambar Terkompresi'
    )

    # Compression settings
    quality = models.IntegerField(default=80, verbose_name='Kualitas (%)')
    max_width = models.IntegerField(null=True, blank=True, verbose_name='Lebar Maks')
    max_height = models.IntegerField(null=True, blank=True, verbose_name='Tinggi Maks')
    output_format = models.CharField(
        max_length=10, choices=OutputFormat.choices,
        default=OutputFormat.JPEG, verbose_name='Format Output'
    )

    # Size info
    original_size = models.PositiveIntegerField(default=0, verbose_name='Ukuran Asli (bytes)')
    compressed_size = models.PositiveIntegerField(default=0, verbose_name='Ukuran Terkompresi (bytes)')

    class Meta:
        verbose_name = 'Compressed Image'
        verbose_name_plural = 'Compressed Images'
        ordering = ['-created_at']

    def __str__(self):
        return f"Image: {self.title or self.id}"

    @property
    def compression_ratio(self):
        if self.original_size and self.compressed_size:
            return round((1 - self.compressed_size / self.original_size) * 100, 2)
        return 0


class PDFOperation(BaseModel, AuditMixin):
    """PDF merge/split operation record."""
    class OperationType(models.TextChoices):
        MERGE = 'merge', 'Gabung'
        SPLIT = 'split', 'Pisah'
        COMPRESS = 'compress', 'Kompres'

    operation_type = models.CharField(
        max_length=20, choices=OperationType.choices,
        verbose_name='Jenis Operasi'
    )
    title = models.CharField(max_length=200, blank=True, verbose_name='Judul')

    # For split: page ranges (e.g., "1-3,5,7-10")
    page_ranges = models.CharField(
        max_length=500, blank=True,
        verbose_name='Range Halaman',
        help_text='Untuk split: 1-3,5,7-10'
    )

    # Result file
    result_file = models.FileField(
        upload_to='tools/pdf/results/',
        blank=True, null=True,
        verbose_name='File Hasil'
    )

    # Stats
    input_page_count = models.PositiveIntegerField(default=0)
    output_page_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'PDF Operation'
        verbose_name_plural = 'PDF Operations'
        ordering = ['-created_at']

    def __str__(self):
        return f"PDF {self.get_operation_type_display()}: {self.title or self.id}"


class PDFInputFile(BaseModel):
    """Input files for PDF operations."""
    operation = models.ForeignKey(
        PDFOperation, on_delete=models.CASCADE,
        related_name='input_files'
    )
    file = models.FileField(upload_to='tools/pdf/inputs/')
    order = models.PositiveIntegerField(default=0)
    page_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"PDF Input {self.order} for {self.operation_id}"
