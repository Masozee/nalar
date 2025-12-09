from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.core.models import TenantBaseModel, AuditMixin


class PayrollStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    CALCULATED = 'calculated', 'Dihitung'
    APPROVED = 'approved', 'Disetujui'
    PAID = 'paid', 'Dibayar'
    CANCELLED = 'cancelled', 'Dibatalkan'


class AllowanceType(models.TextChoices):
    TRANSPORT = 'transport', 'Tunjangan Transportasi'
    MEAL = 'meal', 'Tunjangan Makan'
    HOUSING = 'housing', 'Tunjangan Perumahan'
    HEALTH = 'health', 'Tunjangan Kesehatan'
    COMMUNICATION = 'communication', 'Tunjangan Komunikasi'
    POSITION = 'position', 'Tunjangan Jabatan'
    PERFORMANCE = 'performance', 'Tunjangan Kinerja'
    OTHER = 'other', 'Tunjangan Lainnya'


class DeductionType(models.TextChoices):
    TAX = 'tax', 'PPh 21'
    BPJS_HEALTH = 'bpjs_health', 'BPJS Kesehatan'
    BPJS_EMPLOYMENT = 'bpjs_employment', 'BPJS Ketenagakerjaan'
    LOAN = 'loan', 'Potongan Pinjaman'
    ABSENCE = 'absence', 'Potongan Ketidakhadiran'
    LATE = 'late', 'Potongan Keterlambatan'
    OTHER = 'other', 'Potongan Lainnya'


class SalaryComponent(TenantBaseModel):
    """Salary component configuration."""

    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='salary_components',
    )
    component_type = models.CharField(max_length=20)  # allowance or deduction
    component_name = models.CharField(max_length=50)
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
    )
    is_fixed = models.BooleanField(
        default=True,
        help_text='Komponen tetap setiap bulan'
    )
    effective_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = 'Salary Component'
        verbose_name_plural = 'Salary Components'
        ordering = ['employee', 'component_type', 'component_name']
        indexes = [
            models.Index(fields=['employee', 'component_type']),
            models.Index(fields=['effective_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.component_name}: Rp {self.amount:,.0f}"


class PayrollPeriod(TenantBaseModel, AuditMixin):
    """Monthly payroll period."""

    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=PayrollStatus.choices,
        default=PayrollStatus.DRAFT,
    )
    notes = models.TextField(blank=True)

    # Summary
    total_employees = models.PositiveIntegerField(default=0)
    total_gross = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    total_net = models.DecimalField(max_digits=18, decimal_places=2, default=0)

    class Meta:
        verbose_name = 'Payroll Period'
        verbose_name_plural = 'Payroll Periods'
        ordering = ['-year', '-month']
        unique_together = ['year', 'month']
        indexes = [
            models.Index(fields=['year', 'month']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Payroll {self.month}/{self.year}"


class Payslip(TenantBaseModel, AuditMixin):
    """Individual employee payslip."""

    payroll_period = models.ForeignKey(
        PayrollPeriod,
        on_delete=models.CASCADE,
        related_name='payslips',
    )
    employee = models.ForeignKey(
        'hr.Employee',
        on_delete=models.CASCADE,
        related_name='payslips',
    )

    # Basic salary
    basic_salary = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
    )

    # Calculated totals
    total_allowances = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )
    total_deductions = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )
    overtime_pay = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )
    gross_salary = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )
    net_salary = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )

    # Work details for calculation
    working_days = models.PositiveIntegerField(default=0)
    present_days = models.PositiveIntegerField(default=0)
    absent_days = models.PositiveIntegerField(default=0)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Payment info
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)

    status = models.CharField(
        max_length=20,
        choices=PayrollStatus.choices,
        default=PayrollStatus.DRAFT,
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Payslip'
        verbose_name_plural = 'Payslips'
        ordering = ['-payroll_period__year', '-payroll_period__month', 'employee']
        unique_together = ['payroll_period', 'employee']
        indexes = [
            models.Index(fields=['payroll_period', 'employee']),
            models.Index(fields=['status']),
            models.Index(fields=['employee', 'status']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.payroll_period}"

    def calculate(self):
        """Calculate payslip totals."""
        self.gross_salary = self.basic_salary + self.total_allowances + self.overtime_pay
        self.net_salary = self.gross_salary - self.total_deductions
        return self.net_salary


class PayslipItem(TenantBaseModel):
    """Individual items in a payslip (allowances/deductions)."""

    payslip = models.ForeignKey(
        Payslip,
        on_delete=models.CASCADE,
        related_name='items',
    )
    item_type = models.CharField(
        max_length=20,
        choices=[('allowance', 'Tunjangan'), ('deduction', 'Potongan')],
    )
    name = models.CharField(max_length=100)
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
    )
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Payslip Item'
        verbose_name_plural = 'Payslip Items'
        ordering = ['payslip', 'item_type', 'name']
        indexes = [
            models.Index(fields=['payslip', 'item_type']),
        ]

    def __str__(self):
        prefix = '+' if self.item_type == 'allowance' else '-'
        return f"{prefix} {self.name}: Rp {self.amount:,.0f}"
