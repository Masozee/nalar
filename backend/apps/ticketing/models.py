from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import BaseModel, AuditMixin


class TicketPriority(models.TextChoices):
    LOW = 'low', 'Rendah'
    MEDIUM = 'medium', 'Sedang'
    HIGH = 'high', 'Tinggi'
    CRITICAL = 'critical', 'Kritis'


class TicketStatus(models.TextChoices):
    OPEN = 'open', 'Dibuka'
    IN_PROGRESS = 'in_progress', 'Diproses'
    WAITING_USER = 'waiting_user', 'Menunggu User'
    WAITING_VENDOR = 'waiting_vendor', 'Menunggu Vendor'
    RESOLVED = 'resolved', 'Selesai'
    CLOSED = 'closed', 'Ditutup'
    CANCELLED = 'cancelled', 'Dibatalkan'


class TicketType(models.TextChoices):
    INCIDENT = 'incident', 'Insiden'
    REQUEST = 'request', 'Permintaan'
    PROBLEM = 'problem', 'Problem'
    CHANGE = 'change', 'Perubahan'


class Category(BaseModel):
    """Ticket category for classification."""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children',
    )
    # Default assignee group for this category
    default_assignee_group = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['parent']),
        ]

    def __str__(self):
        return self.name


class SLAPolicy(BaseModel):
    """Service Level Agreement policy."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=TicketPriority.choices)

    # Response time in minutes
    response_time = models.PositiveIntegerField(
        help_text='Target waktu respons pertama (menit)'
    )
    # Resolution time in minutes
    resolution_time = models.PositiveIntegerField(
        help_text='Target waktu penyelesaian (menit)'
    )

    # Business hours only (9-17, Mon-Fri)
    business_hours_only = models.BooleanField(
        default=True,
        help_text='Hitung hanya jam kerja (09:00-17:00, Senin-Jumat)'
    )

    class Meta:
        verbose_name = 'SLA Policy'
        verbose_name_plural = 'SLA Policies'
        ordering = ['priority']
        unique_together = ['priority']
        indexes = [
            models.Index(fields=['priority']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_priority_display()})"


class Ticket(BaseModel, AuditMixin):
    """Main ticket model for helpdesk."""
    ticket_number = models.CharField(max_length=20, unique=True, editable=False)

    # Basic info
    title = models.CharField(max_length=200)
    description = models.TextField()
    ticket_type = models.CharField(
        max_length=20,
        choices=TicketType.choices,
        default=TicketType.INCIDENT,
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets',
    )

    # Priority and status
    priority = models.CharField(
        max_length=20,
        choices=TicketPriority.choices,
        default=TicketPriority.MEDIUM,
    )
    status = models.CharField(
        max_length=20,
        choices=TicketStatus.choices,
        default=TicketStatus.OPEN,
    )

    # People
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tickets_requested',
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets_assigned',
    )

    # SLA tracking
    sla_policy = models.ForeignKey(
        SLAPolicy,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    response_due = models.DateTimeField(null=True, blank=True)
    resolution_due = models.DateTimeField(null=True, blank=True)
    first_response_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    # SLA breach flags
    response_breached = models.BooleanField(default=False)
    resolution_breached = models.BooleanField(default=False)

    # Additional info
    tags = models.CharField(max_length=200, blank=True, help_text='Comma-separated tags')
    attachments_count = models.PositiveIntegerField(default=0)

    # Related ticket (for linked issues)
    related_ticket = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='related_tickets',
    )

    class Meta:
        verbose_name = 'Ticket'
        verbose_name_plural = 'Tickets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['ticket_number']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['requester', 'status']),
            models.Index(fields=['assignee', 'status']),
            models.Index(fields=['category']),
            models.Index(fields=['response_due']),
            models.Index(fields=['resolution_due']),
        ]

    def __str__(self):
        return f"{self.ticket_number} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = self.generate_ticket_number()
        if not self.sla_policy and self.priority:
            self.assign_sla_policy()
        super().save(*args, **kwargs)

    def generate_ticket_number(self):
        """Generate unique ticket number: TKT-YYYYMM-XXXXX"""
        from datetime import datetime
        prefix = f"TKT-{datetime.now().strftime('%Y%m')}-"
        last_ticket = Ticket.objects.filter(
            ticket_number__startswith=prefix
        ).order_by('-ticket_number').first()

        if last_ticket:
            last_num = int(last_ticket.ticket_number.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1

        return f"{prefix}{new_num:05d}"

    def assign_sla_policy(self):
        """Assign SLA policy based on priority."""
        try:
            self.sla_policy = SLAPolicy.objects.get(priority=self.priority)
            self.calculate_sla_deadlines()
        except SLAPolicy.DoesNotExist:
            pass

    def calculate_sla_deadlines(self):
        """Calculate response and resolution deadlines."""
        if not self.sla_policy:
            return

        from datetime import timedelta
        now = timezone.now()

        if self.sla_policy.business_hours_only:
            # Simplified: just add minutes, production would need business hours calc
            self.response_due = now + timedelta(minutes=self.sla_policy.response_time)
            self.resolution_due = now + timedelta(minutes=self.sla_policy.resolution_time)
        else:
            self.response_due = now + timedelta(minutes=self.sla_policy.response_time)
            self.resolution_due = now + timedelta(minutes=self.sla_policy.resolution_time)

    def check_sla_breach(self):
        """Check and update SLA breach status."""
        now = timezone.now()
        if self.response_due and not self.first_response_at and now > self.response_due:
            self.response_breached = True
        if self.resolution_due and not self.resolved_at and now > self.resolution_due:
            self.resolution_breached = True


class TicketComment(BaseModel):
    """Comments/updates on a ticket."""
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ticket_comments',
    )
    content = models.TextField()

    # Comment type
    COMMENT_TYPE_CHOICES = [
        ('reply', 'Balasan'),
        ('internal', 'Internal Note'),
        ('resolution', 'Resolusi'),
        ('status_change', 'Perubahan Status'),
    ]
    comment_type = models.CharField(
        max_length=20,
        choices=COMMENT_TYPE_CHOICES,
        default='reply',
    )

    # Is this the first response (for SLA tracking)?
    is_first_response = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Ticket Comment'
        verbose_name_plural = 'Ticket Comments'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['ticket', 'created_at']),
            models.Index(fields=['author']),
        ]

    def __str__(self):
        return f"Comment on {self.ticket.ticket_number} by {self.author}"

    def save(self, *args, **kwargs):
        # Track first response for SLA
        # Use _state.adding to check if this is a new object (pk is auto-set with UUID)
        is_new = self._state.adding
        if is_new and self.ticket.assignee == self.author:
            if not self.ticket.first_response_at:
                self.is_first_response = True
                self.ticket.first_response_at = timezone.now()
                self.ticket.save(update_fields=['first_response_at'])
        super().save(*args, **kwargs)


class TicketAttachment(BaseModel):
    """File attachments for tickets."""
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    file = models.FileField(upload_to='ticket_attachments/%Y/%m/')
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0)
    content_type = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = 'Ticket Attachment'
        verbose_name_plural = 'Ticket Attachments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.filename} on {self.ticket.ticket_number}"

    def save(self, *args, **kwargs):
        if self.file:
            self.filename = self.file.name
            self.file_size = self.file.size
        super().save(*args, **kwargs)
        # Update attachment count on ticket
        self.ticket.attachments_count = self.ticket.attachments.count()
        self.ticket.save(update_fields=['attachments_count'])
