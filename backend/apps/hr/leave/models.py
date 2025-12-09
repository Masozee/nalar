from django.db import models
from apps.core.models import TenantBaseModel, AuditMixin


class LeaveType(models.TextChoices):
    ANNUAL = 'annual', 'Cuti Tahunan'
    SICK = 'sick', 'Cuti Sakit'
    MATERNITY = 'maternity', 'Cuti Melahirkan'
    PATERNITY = 'paternity', 'Cuti Ayah'
    MARRIAGE = 'marriage', 'Cuti Menikah'
    BEREAVEMENT = 'bereavement', 'Cuti Duka'
    UNPAID = 'unpaid', 'Cuti Tanpa Gaji'
    SPECIAL = 'special', 'Cuti Khusus'
    RELIGIOUS = 'religious', 'Cuti Keagamaan'


class LeaveStatus(models.TextChoices):
    PENDING = 'pending', 'Menunggu'
    APPROVED = 'approved', 'Disetujui'
    REJECTED = 'rejected', 'Ditolak'
    CANCELLED = 'cancelled', 'Dibatalkan'


class LeavePolicy(TenantBaseModel):
    """Leave policy configuration per year."""

    name = models.CharField(max_length=100)
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices)
    year = models.PositiveIntegerField()
    default_days = models.PositiveIntegerField(help_text='Jumlah hari cuti default')
    max_carry_over = models.PositiveIntegerField(
        default=0,
        help_text='Maksimal hari yang bisa dibawa ke tahun berikutnya'
    )
    requires_approval = models.BooleanField(default=True)
    requires_document = models.BooleanField(default=False)
    min_days_notice = models.PositiveIntegerField(
        default=0,
        help_text='Minimal hari pengajuan sebelum tanggal cuti'
    )
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Leave Policy'
        verbose_name_plural = 'Leave Policies'
        ordering = ['-year', 'leave_type']
        unique_together = ['leave_type', 'year']
        indexes = [
            models.Index(fields=['year', 'leave_type']),
        ]

    def __str__(self):
        return f"{self.name} - {self.year}"


class LeaveBalance(TenantBaseModel):
    """Employee leave balance per year."""

    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='leave_balances',
    )
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices)
    year = models.PositiveIntegerField()
    entitled_days = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        help_text='Jumlah hari yang berhak'
    )
    used_days = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        default=0,
        help_text='Jumlah hari yang sudah digunakan'
    )
    carried_over = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        default=0,
        help_text='Hari yang dibawa dari tahun sebelumnya'
    )

    class Meta:
        verbose_name = 'Leave Balance'
        verbose_name_plural = 'Leave Balances'
        ordering = ['-year', 'employee', 'leave_type']
        unique_together = ['employee', 'leave_type', 'year']
        indexes = [
            models.Index(fields=['employee', 'year']),
            models.Index(fields=['year', 'leave_type']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.get_leave_type_display()} ({self.year})"

    @property
    def remaining_days(self):
        return self.entitled_days + self.carried_over - self.used_days


class LeaveRequest(TenantBaseModel, AuditMixin):
    """Employee leave request."""

    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='leave_requests',
    )
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    total_days = models.DecimalField(max_digits=5, decimal_places=1)
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=LeaveStatus.choices,
        default=LeaveStatus.PENDING,
    )

    # Approval workflow
    approved_by = models.ForeignKey(
        'hr.Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_leave_requests',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    # Supporting document
    attachment = models.FileField(
        upload_to='leave_attachments/',
        null=True,
        blank=True,
    )

    # Emergency contact during leave
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)

    # Delegation
    delegate_to = models.ForeignKey(
        'hr.Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delegated_leave_requests',
        help_text='Karyawan yang menggantikan selama cuti',
    )

    class Meta:
        verbose_name = 'Leave Request'
        verbose_name_plural = 'Leave Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['status']),
            models.Index(fields=['leave_type']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.get_leave_type_display()} ({self.start_date} to {self.end_date})"

    def calculate_total_days(self):
        """Calculate total leave days (excluding weekends)."""
        from datetime import timedelta
        total = 0
        current = self.start_date
        while current <= self.end_date:
            if current.weekday() < 5:  # Monday to Friday
                total += 1
            current += timedelta(days=1)
        self.total_days = total
        return total
