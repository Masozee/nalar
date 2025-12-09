from django.db import models
from django.conf import settings
from apps.core.models import TenantBaseModel, AuditMixin


class AttendanceStatus(models.TextChoices):
    PRESENT = 'present', 'Hadir'
    ABSENT = 'absent', 'Tidak Hadir'
    LATE = 'late', 'Terlambat'
    EARLY_LEAVE = 'early_leave', 'Pulang Awal'
    HALF_DAY = 'half_day', 'Setengah Hari'
    WORK_FROM_HOME = 'wfh', 'Work From Home'
    SICK = 'sick', 'Sakit'
    LEAVE = 'leave', 'Cuti'


class Attendance(TenantBaseModel, AuditMixin):
    """Daily attendance record for employees."""

    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='attendances',
    )
    date = models.DateField(db_index=True)
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=AttendanceStatus.choices,
        default=AttendanceStatus.PRESENT,
    )
    work_hours = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Total jam kerja',
    )
    overtime_hours = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
        help_text='Jam lembur',
    )
    notes = models.TextField(blank=True)

    # Location tracking (optional)
    check_in_location = models.CharField(max_length=255, blank=True)
    check_out_location = models.CharField(max_length=255, blank=True)
    check_in_latitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    check_in_longitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    check_out_latitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    check_out_longitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )

    class Meta:
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendances'
        ordering = ['-date', 'employee']
        unique_together = ['employee', 'date']
        indexes = [
            models.Index(fields=['employee', 'date']),
            models.Index(fields=['date', 'status']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.get_status_display()})"

    def calculate_work_hours(self):
        """Calculate work hours from check_in and check_out."""
        if self.check_in and self.check_out:
            delta = self.check_out - self.check_in
            hours = delta.total_seconds() / 3600
            self.work_hours = round(hours, 2)
        return self.work_hours


class AttendanceSummary(TenantBaseModel):
    """Monthly attendance summary for employees."""

    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='attendance_summaries',
    )
    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField()

    total_days = models.PositiveIntegerField(default=0)
    present_days = models.PositiveIntegerField(default=0)
    absent_days = models.PositiveIntegerField(default=0)
    late_days = models.PositiveIntegerField(default=0)
    leave_days = models.PositiveIntegerField(default=0)
    sick_days = models.PositiveIntegerField(default=0)
    wfh_days = models.PositiveIntegerField(default=0)

    total_work_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    total_overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    class Meta:
        verbose_name = 'Attendance Summary'
        verbose_name_plural = 'Attendance Summaries'
        ordering = ['-year', '-month', 'employee']
        unique_together = ['employee', 'year', 'month']
        indexes = [
            models.Index(fields=['employee', 'year', 'month']),
            models.Index(fields=['year', 'month']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.month}/{self.year}"
