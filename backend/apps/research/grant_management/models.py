"""
Grant Management models for Research module.
"""
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import TenantBaseModel
from apps.core.models.audit import AuditMixin


class GrantStatus(models.TextChoices):
    DRAFT = 'draft', 'Draf'
    SUBMITTED = 'submitted', 'Diajukan'
    UNDER_REVIEW = 'under_review', 'Dalam Review'
    APPROVED = 'approved', 'Disetujui'
    REJECTED = 'rejected', 'Ditolak'
    ACTIVE = 'active', 'Aktif'
    COMPLETED = 'completed', 'Selesai'
    CANCELLED = 'cancelled', 'Dibatalkan'


class GrantType(models.TextChoices):
    INTERNAL = 'internal', 'Internal'
    GOVERNMENT = 'government', 'Pemerintah'
    PRIVATE = 'private', 'Swasta'
    INTERNATIONAL = 'international', 'Internasional'
    PARTNERSHIP = 'partnership', 'Kemitraan'


class FundingSource(models.TextChoices):
    DIKTI = 'dikti', 'Dikti/Kemendikbud'
    BRIN = 'brin', 'BRIN'
    LPDP = 'lpdp', 'LPDP'
    KEMENKES = 'kemenkes', 'Kemenkes'
    CORPORATE = 'corporate', 'Perusahaan'
    FOUNDATION = 'foundation', 'Yayasan'
    NGO = 'ngo', 'NGO'
    FOREIGN_GOV = 'foreign_gov', 'Pemerintah Asing'
    INTERNAL = 'internal', 'Dana Internal'
    OTHER = 'other', 'Lainnya'


class Grant(TenantBaseModel, AuditMixin):
    """Research grant/funding model."""
    grant_number = models.CharField(
        max_length=30, unique=True, verbose_name='Nomor Grant'
    )
    title = models.CharField(max_length=300, verbose_name='Judul')
    abstract = models.TextField(blank=True, verbose_name='Abstrak')

    # Grant details
    grant_type = models.CharField(
        max_length=20, choices=GrantType.choices,
        default=GrantType.INTERNAL, verbose_name='Jenis Grant'
    )
    funding_source = models.CharField(
        max_length=20, choices=FundingSource.choices,
        default=FundingSource.INTERNAL, verbose_name='Sumber Dana'
    )
    funder_name = models.CharField(
        max_length=200, blank=True, verbose_name='Nama Pemberi Dana'
    )
    funder_contact = models.TextField(blank=True, verbose_name='Kontak Pemberi Dana')

    # Principal Investigator
    principal_investigator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='grants_as_pi',
        verbose_name='Peneliti Utama'
    )

    # Dates
    submission_date = models.DateField(
        null=True, blank=True, verbose_name='Tanggal Pengajuan'
    )
    start_date = models.DateField(
        null=True, blank=True, verbose_name='Tanggal Mulai'
    )
    end_date = models.DateField(
        null=True, blank=True, verbose_name='Tanggal Selesai'
    )

    # Financials
    currency = models.CharField(max_length=3, default='IDR')
    requested_amount = models.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal('0'),
        verbose_name='Dana Diajukan'
    )
    approved_amount = models.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal('0'),
        verbose_name='Dana Disetujui'
    )
    disbursed_amount = models.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal('0'),
        verbose_name='Dana Dicairkan'
    )

    # Status
    status = models.CharField(
        max_length=20, choices=GrantStatus.choices,
        default=GrantStatus.DRAFT, verbose_name='Status'
    )

    # Review
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='grants_reviewed',
        verbose_name='Direview Oleh'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True, verbose_name='Catatan Review')

    # Documents
    proposal_file = models.FileField(
        upload_to='grants/proposals/', blank=True, null=True,
        verbose_name='File Proposal'
    )
    contract_file = models.FileField(
        upload_to='grants/contracts/', blank=True, null=True,
        verbose_name='File Kontrak'
    )

    notes = models.TextField(blank=True, verbose_name='Catatan')

    class Meta:
        verbose_name = 'Grant'
        verbose_name_plural = 'Grants'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['grant_number']),
            models.Index(fields=['principal_investigator']),
            models.Index(fields=['status']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.grant_number} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.grant_number:
            self.grant_number = self._generate_grant_number()
        super().save(*args, **kwargs)

    def _generate_grant_number(self):
        """Generate grant number: GRT-YYYY-XXXX"""
        year = timezone.now().year
        prefix = f"GRT-{year}-"
        last = Grant.objects.filter(
            grant_number__startswith=prefix
        ).order_by('-grant_number').first()

        if last:
            last_num = int(last.grant_number.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        return f"{prefix}{new_num:04d}"

    @property
    def remaining_budget(self):
        """Calculate remaining budget."""
        return self.approved_amount - self.disbursed_amount

    @property
    def duration_months(self):
        """Calculate grant duration in months."""
        if self.start_date and self.end_date:
            delta = self.end_date - self.start_date
            return delta.days // 30
        return 0


class GrantTeamMember(TenantBaseModel):
    """Grant team member (co-investigators, researchers, etc.)."""
    class Role(models.TextChoices):
        CO_PI = 'co_pi', 'Co-Principal Investigator'
        RESEARCHER = 'researcher', 'Peneliti'
        ASSISTANT = 'assistant', 'Asisten Peneliti'
        CONSULTANT = 'consultant', 'Konsultan'
        ADMIN = 'admin', 'Admin'

    grant = models.ForeignKey(
        Grant, on_delete=models.CASCADE,
        related_name='team_members'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grant_memberships'
    )
    role = models.CharField(
        max_length=20, choices=Role.choices,
        default=Role.RESEARCHER
    )
    responsibilities = models.TextField(blank=True, verbose_name='Tanggung Jawab')
    allocation_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('100'),
        verbose_name='Alokasi Waktu (%)'
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = 'Anggota Tim Grant'
        verbose_name_plural = 'Anggota Tim Grant'
        unique_together = ['grant', 'user']

    def __str__(self):
        return f"{self.user} - {self.grant.grant_number} ({self.get_role_display()})"


class GrantMilestone(TenantBaseModel, AuditMixin):
    """Grant milestone/deliverable."""
    class MilestoneStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'Dalam Proses'
        COMPLETED = 'completed', 'Selesai'
        DELAYED = 'delayed', 'Terlambat'
        CANCELLED = 'cancelled', 'Dibatalkan'

    grant = models.ForeignKey(
        Grant, on_delete=models.CASCADE,
        related_name='milestones'
    )
    title = models.CharField(max_length=200, verbose_name='Judul')
    description = models.TextField(blank=True, verbose_name='Deskripsi')
    due_date = models.DateField(verbose_name='Tanggal Target')
    completed_date = models.DateField(null=True, blank=True, verbose_name='Tanggal Selesai')
    status = models.CharField(
        max_length=20, choices=MilestoneStatus.choices,
        default=MilestoneStatus.PENDING
    )
    deliverable_file = models.FileField(
        upload_to='grants/deliverables/', blank=True, null=True,
        verbose_name='File Deliverable'
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Milestone Grant'
        verbose_name_plural = 'Milestone Grant'
        ordering = ['due_date']

    def __str__(self):
        return f"{self.grant.grant_number} - {self.title}"


class GrantDisbursement(TenantBaseModel, AuditMixin):
    """Grant fund disbursement record."""
    class DisbursementStatus(models.TextChoices):
        REQUESTED = 'requested', 'Diajukan'
        APPROVED = 'approved', 'Disetujui'
        DISBURSED = 'disbursed', 'Dicairkan'
        REJECTED = 'rejected', 'Ditolak'

    grant = models.ForeignKey(
        Grant, on_delete=models.CASCADE,
        related_name='disbursements'
    )
    disbursement_number = models.CharField(
        max_length=30, unique=True, verbose_name='Nomor Pencairan'
    )
    description = models.CharField(max_length=300, verbose_name='Deskripsi')
    amount = models.DecimalField(
        max_digits=15, decimal_places=2, verbose_name='Jumlah'
    )
    status = models.CharField(
        max_length=20, choices=DisbursementStatus.choices,
        default=DisbursementStatus.REQUESTED
    )
    request_date = models.DateField(default=timezone.now, verbose_name='Tanggal Pengajuan')
    disbursement_date = models.DateField(null=True, blank=True, verbose_name='Tanggal Pencairan')
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='grant_disbursements_approved'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    supporting_document = models.FileField(
        upload_to='grants/disbursements/', blank=True, null=True
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Pencairan Dana Grant'
        verbose_name_plural = 'Pencairan Dana Grant'
        ordering = ['-request_date']

    def __str__(self):
        return f"{self.disbursement_number} - {self.grant.grant_number}"

    def save(self, *args, **kwargs):
        if not self.disbursement_number:
            self.disbursement_number = self._generate_disbursement_number()
        super().save(*args, **kwargs)

        # Update grant disbursed amount
        if self.status == self.DisbursementStatus.DISBURSED:
            total = self.grant.disbursements.filter(
                status=self.DisbursementStatus.DISBURSED,
                is_active=True
            ).aggregate(total=models.Sum('amount'))['total'] or Decimal('0')
            self.grant.disbursed_amount = total
            self.grant.save(update_fields=['disbursed_amount'])

    def _generate_disbursement_number(self):
        """Generate disbursement number: DSB-YYYY-XXXX"""
        year = timezone.now().year
        prefix = f"DSB-{year}-"
        last = GrantDisbursement.objects.filter(
            disbursement_number__startswith=prefix
        ).order_by('-disbursement_number').first()

        if last:
            last_num = int(last.disbursement_number.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        return f"{prefix}{new_num:04d}"
