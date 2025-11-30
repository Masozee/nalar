"""
Expense Request models for finance management.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
from apps.core.models import BaseModel, AuditMixin


class ExpenseCategory(models.TextChoices):
    """Expense category classification."""
    TRAVEL = 'travel', 'Perjalanan Dinas'
    ACCOMMODATION = 'accommodation', 'Akomodasi'
    MEALS = 'meals', 'Makan & Minum'
    TRANSPORT = 'transport', 'Transportasi'
    SUPPLIES = 'supplies', 'Perlengkapan'
    ENTERTAINMENT = 'entertainment', 'Jamuan Tamu'
    TRAINING = 'training', 'Pelatihan'
    COMMUNICATION = 'communication', 'Komunikasi'
    UTILITIES = 'utilities', 'Utilitas'
    MEDICAL = 'medical', 'Kesehatan'
    OTHER = 'other', 'Lainnya'


class ExpenseStatus(models.TextChoices):
    """Expense request status."""
    DRAFT = 'draft', 'Draf'
    SUBMITTED = 'submitted', 'Diajukan'
    PENDING_APPROVAL = 'pending_approval', 'Menunggu Persetujuan'
    APPROVED = 'approved', 'Disetujui'
    REJECTED = 'rejected', 'Ditolak'
    PROCESSING = 'processing', 'Diproses'
    PAID = 'paid', 'Dibayar'
    CANCELLED = 'cancelled', 'Dibatalkan'


class PaymentMethod(models.TextChoices):
    """Payment method for expense reimbursement."""
    CASH = 'cash', 'Tunai'
    BANK_TRANSFER = 'bank_transfer', 'Transfer Bank'
    PETTY_CASH = 'petty_cash', 'Kas Kecil'


class ExpenseRequest(BaseModel, AuditMixin):
    """
    Expense request/reimbursement header.
    """
    # Request identification
    request_number = models.CharField(max_length=30, unique=True)

    # Requester
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='expense_requests',
    )
    department = models.CharField(max_length=100, blank=True)

    # Request details
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    purpose = models.TextField(blank=True, help_text='Tujuan/keperluan pengeluaran')

    # Dates
    request_date = models.DateField(auto_now_add=True)
    expense_date = models.DateField(help_text='Tanggal pengeluaran')

    # Status
    status = models.CharField(
        max_length=20,
        choices=ExpenseStatus.choices,
        default=ExpenseStatus.DRAFT,
    )

    # Amount
    currency = models.CharField(max_length=3, default='IDR')
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )
    approved_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )

    # Payment
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.BANK_TRANSFER,
    )
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_account_name = models.CharField(max_length=100, blank=True)

    # Approval
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_expenses',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    # Payment processing
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_expenses',
    )
    processed_at = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    payment_date = models.DateField(null=True, blank=True)

    # Notes
    notes = models.TextField(blank=True)
    finance_notes = models.TextField(blank=True, help_text='Catatan dari finance')

    class Meta:
        verbose_name = 'Expense Request'
        verbose_name_plural = 'Expense Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['request_number']),
            models.Index(fields=['requester']),
            models.Index(fields=['status']),
            models.Index(fields=['request_date']),
            models.Index(fields=['expense_date']),
        ]

    def __str__(self):
        return f"{self.request_number} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.request_number:
            self.request_number = self.generate_request_number()
        super().save(*args, **kwargs)

    def generate_request_number(self):
        """Generate request number like EXP-2024-0001."""
        year = timezone.now().year
        prefix = f'EXP-{year}-'
        last = ExpenseRequest.objects.filter(
            request_number__startswith=prefix
        ).order_by('-request_number').first()

        if last:
            try:
                num = int(last.request_number.split('-')[-1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f'{prefix}{num:04d}'

    def calculate_total(self):
        """Recalculate total from items."""
        items = self.items.filter(is_active=True)
        self.total_amount = sum(item.amount for item in items)
        self.save(update_fields=['total_amount'])

    def submit(self):
        """Submit expense for approval."""
        if self.status != ExpenseStatus.DRAFT:
            raise ValueError('Hanya expense draft yang bisa diajukan')
        if not self.items.filter(is_active=True).exists():
            raise ValueError('Expense harus memiliki minimal satu item')

        self.status = ExpenseStatus.SUBMITTED
        self.save(update_fields=['status'])

    def approve(self, user, approved_amount=None):
        """Approve expense request."""
        if self.status not in [ExpenseStatus.SUBMITTED, ExpenseStatus.PENDING_APPROVAL]:
            raise ValueError('Expense tidak dalam status yang bisa disetujui')

        self.status = ExpenseStatus.APPROVED
        self.approved_by = user
        self.approved_at = timezone.now()
        self.approved_amount = approved_amount if approved_amount is not None else self.total_amount
        self.save(update_fields=['status', 'approved_by', 'approved_at', 'approved_amount'])

    def reject(self, user, reason=''):
        """Reject expense request."""
        if self.status not in [ExpenseStatus.SUBMITTED, ExpenseStatus.PENDING_APPROVAL]:
            raise ValueError('Expense tidak dalam status yang bisa ditolak')

        self.status = ExpenseStatus.REJECTED
        self.approved_by = user
        self.approved_at = timezone.now()
        self.rejection_reason = reason
        self.save(update_fields=['status', 'approved_by', 'approved_at', 'rejection_reason'])

    def process_payment(self, user, payment_ref=''):
        """Mark expense as being processed for payment."""
        if self.status != ExpenseStatus.APPROVED:
            raise ValueError('Expense harus disetujui sebelum diproses')

        self.status = ExpenseStatus.PROCESSING
        self.processed_by = user
        self.processed_at = timezone.now()
        self.payment_reference = payment_ref
        self.save(update_fields=['status', 'processed_by', 'processed_at', 'payment_reference'])

    def mark_paid(self, payment_date=None):
        """Mark expense as paid."""
        if self.status != ExpenseStatus.PROCESSING:
            raise ValueError('Expense harus dalam status processing')

        self.status = ExpenseStatus.PAID
        self.payment_date = payment_date or timezone.now().date()
        self.save(update_fields=['status', 'payment_date'])


class ExpenseItem(BaseModel):
    """
    Expense request line items.
    """
    expense_request = models.ForeignKey(
        ExpenseRequest,
        on_delete=models.CASCADE,
        related_name='items',
    )

    # Item details
    category = models.CharField(
        max_length=20,
        choices=ExpenseCategory.choices,
        default=ExpenseCategory.OTHER,
    )
    description = models.CharField(max_length=300)

    # Amount
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )

    # Receipt/proof
    receipt_number = models.CharField(max_length=100, blank=True)
    receipt_date = models.DateField(null=True, blank=True)
    receipt_file = models.FileField(
        upload_to='expenses/receipts/%Y/%m/',
        blank=True,
        null=True,
    )

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Expense Item'
        verbose_name_plural = 'Expense Items'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.expense_request.request_number} - {self.description}"

    def save(self, *args, **kwargs):
        self.amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        self.expense_request.calculate_total()


class ExpenseAdvance(BaseModel, AuditMixin):
    """
    Cash advance for expenses (uang muka).
    """
    advance_number = models.CharField(max_length=30, unique=True)

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='expense_advances',
    )

    # Linked expense request (optional)
    expense_request = models.ForeignKey(
        ExpenseRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='advances',
    )

    # Details
    purpose = models.TextField()
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )

    # Status
    STATUS_CHOICES = [
        ('pending', 'Menunggu'),
        ('approved', 'Disetujui'),
        ('rejected', 'Ditolak'),
        ('disbursed', 'Dicairkan'),
        ('settled', 'Diselesaikan'),
        ('cancelled', 'Dibatalkan'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Approval
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_advances',
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    # Settlement
    settled_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
    )
    settlement_date = models.DateField(null=True, blank=True)

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Expense Advance'
        verbose_name_plural = 'Expense Advances'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.advance_number} - {self.requester.get_full_name()}"

    def save(self, *args, **kwargs):
        if not self.advance_number:
            self.advance_number = self.generate_advance_number()
        super().save(*args, **kwargs)

    def generate_advance_number(self):
        """Generate advance number like ADV-2024-0001."""
        year = timezone.now().year
        prefix = f'ADV-{year}-'
        last = ExpenseAdvance.objects.filter(
            advance_number__startswith=prefix
        ).order_by('-advance_number').first()

        if last:
            try:
                num = int(last.advance_number.split('-')[-1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f'{prefix}{num:04d}'

    @property
    def balance(self):
        """Remaining balance to settle."""
        return self.amount - self.settled_amount
