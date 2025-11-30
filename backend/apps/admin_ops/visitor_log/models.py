"""
Visitor Log models for tracking visitors and guest management.
"""
from django.db import models
from django.conf import settings
from apps.core.models import BaseModel, AuditMixin


class VisitPurpose(models.TextChoices):
    MEETING = 'meeting', 'Meeting'
    INTERVIEW = 'interview', 'Interview'
    DELIVERY = 'delivery', 'Pengiriman'
    VENDOR = 'vendor', 'Vendor/Supplier'
    GUEST = 'guest', 'Tamu'
    CONTRACTOR = 'contractor', 'Kontraktor'
    GOVERNMENT = 'government', 'Pemerintah'
    OTHER = 'other', 'Lainnya'


class VisitStatus(models.TextChoices):
    EXPECTED = 'expected', 'Diharapkan'
    CHECKED_IN = 'checked_in', 'Check In'
    CHECKED_OUT = 'checked_out', 'Check Out'
    NO_SHOW = 'no_show', 'Tidak Hadir'
    CANCELLED = 'cancelled', 'Dibatalkan'


class IDType(models.TextChoices):
    KTP = 'ktp', 'KTP'
    SIM = 'sim', 'SIM'
    PASSPORT = 'passport', 'Passport'
    KITAS = 'kitas', 'KITAS'
    OTHER = 'other', 'Lainnya'


class Visitor(BaseModel):
    """Visitor master data for recurring visitors."""
    name = models.CharField(max_length=200)
    company = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20)
    id_type = models.CharField(
        max_length=20,
        choices=IDType.choices,
        default=IDType.KTP,
    )
    id_number = models.CharField(max_length=50, blank=True)
    photo = models.ImageField(upload_to='visitors/photos/', blank=True, null=True)
    notes = models.TextField(blank=True)

    # Blacklist
    is_blacklisted = models.BooleanField(default=False)
    blacklist_reason = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Visitor'
        verbose_name_plural = 'Visitors'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['phone']),
            models.Index(fields=['company']),
            models.Index(fields=['is_blacklisted']),
        ]

    def __str__(self):
        if self.company:
            return f"{self.name} ({self.company})"
        return self.name


class VisitLog(BaseModel, AuditMixin):
    """Individual visit records."""
    visitor = models.ForeignKey(
        Visitor,
        on_delete=models.CASCADE,
        related_name='visits',
        null=True,
        blank=True,
    )

    # For quick walk-ins without creating visitor record
    visitor_name = models.CharField(max_length=200)
    visitor_company = models.CharField(max_length=200, blank=True)
    visitor_phone = models.CharField(max_length=20, blank=True)
    visitor_id_type = models.CharField(
        max_length=20,
        choices=IDType.choices,
        default=IDType.KTP,
    )
    visitor_id_number = models.CharField(max_length=50, blank=True)

    purpose = models.CharField(
        max_length=20,
        choices=VisitPurpose.choices,
        default=VisitPurpose.MEETING,
    )
    purpose_detail = models.TextField(blank=True)

    # Host information
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hosted_visits',
    )
    host_name = models.CharField(max_length=200, blank=True)
    host_department = models.CharField(max_length=100, blank=True)

    # Schedule
    expected_arrival = models.DateTimeField(null=True, blank=True)
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=VisitStatus.choices,
        default=VisitStatus.EXPECTED,
    )

    # Badge
    badge_number = models.CharField(max_length=20, blank=True)

    # Belongings
    belongings = models.TextField(blank=True, help_text='Items brought by visitor')

    # Sign-in/out by
    checked_in_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='visitor_check_ins',
    )
    checked_out_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='visitor_check_outs',
    )

    notes = models.TextField(blank=True)

    # Pre-registration
    is_pre_registered = models.BooleanField(default=False)
    pre_registered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pre_registered_visits',
    )

    class Meta:
        verbose_name = 'Visit Log'
        verbose_name_plural = 'Visit Logs'
        ordering = ['-check_in_time', '-expected_arrival']
        indexes = [
            models.Index(fields=['visitor_name']),
            models.Index(fields=['status']),
            models.Index(fields=['check_in_time']),
            models.Index(fields=['expected_arrival']),
            models.Index(fields=['host']),
            models.Index(fields=['purpose']),
        ]

    def __str__(self):
        return f"{self.visitor_name} - {self.get_purpose_display()} ({self.check_in_time or self.expected_arrival})"

    def save(self, *args, **kwargs):
        # Copy visitor info if visitor is selected
        if self.visitor and not self.visitor_name:
            self.visitor_name = self.visitor.name
            self.visitor_company = self.visitor.company
            self.visitor_phone = self.visitor.phone
            self.visitor_id_type = self.visitor.id_type
            self.visitor_id_number = self.visitor.id_number
        super().save(*args, **kwargs)

    @property
    def duration_minutes(self):
        if self.check_in_time and self.check_out_time:
            delta = self.check_out_time - self.check_in_time
            return int(delta.total_seconds() / 60)
        return None


class VisitorBadge(BaseModel):
    """Visitor badges for tracking."""
    badge_number = models.CharField(max_length=20, unique=True)
    badge_type = models.CharField(max_length=50, default='Visitor')
    is_available = models.BooleanField(default=True)
    current_holder = models.ForeignKey(
        VisitLog,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='badges_held',
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Visitor Badge'
        verbose_name_plural = 'Visitor Badges'
        ordering = ['badge_number']

    def __str__(self):
        return f"Badge {self.badge_number}"
