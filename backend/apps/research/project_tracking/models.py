"""
Project Tracking models for Research module.
"""
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import TenantBaseModel
from apps.core.models.audit import AuditMixin


class ProjectStatus(models.TextChoices):
    PLANNING = 'planning', 'Perencanaan'
    PROPOSAL = 'proposal', 'Penyusunan Proposal'
    ACTIVE = 'active', 'Aktif'
    ON_HOLD = 'on_hold', 'Ditunda'
    COMPLETED = 'completed', 'Selesai'
    CANCELLED = 'cancelled', 'Dibatalkan'


class ProjectType(models.TextChoices):
    BASIC_RESEARCH = 'basic_research', 'Penelitian Dasar'
    APPLIED_RESEARCH = 'applied_research', 'Penelitian Terapan'
    POLICY_RESEARCH = 'policy_research', 'Penelitian Kebijakan'
    COMMISSIONED = 'commissioned', 'Penelitian Pesanan'
    COLLABORATIVE = 'collaborative', 'Penelitian Kolaborasi'
    INTERNAL = 'internal', 'Penelitian Internal'


class ResearchProject(TenantBaseModel, AuditMixin):
    """Research project tracking model."""
    project_code = models.CharField(
        max_length=30, unique=True, verbose_name='Kode Proyek'
    )
    title = models.CharField(max_length=300, verbose_name='Judul')
    description = models.TextField(blank=True, verbose_name='Deskripsi')
    objectives = models.TextField(blank=True, verbose_name='Tujuan')
    methodology = models.TextField(blank=True, verbose_name='Metodologi')

    # Type and status
    project_type = models.CharField(
        max_length=20, choices=ProjectType.choices,
        default=ProjectType.INTERNAL, verbose_name='Jenis Proyek'
    )
    status = models.CharField(
        max_length=20, choices=ProjectStatus.choices,
        default=ProjectStatus.PLANNING, verbose_name='Status'
    )

    # Lead researcher
    lead_researcher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='projects_led',
        verbose_name='Peneliti Utama'
    )

    # Related grant (optional)
    grant = models.ForeignKey(
        'research.Grant',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='projects',
        verbose_name='Grant Terkait'
    )

    # Dates
    start_date = models.DateField(
        null=True, blank=True, verbose_name='Tanggal Mulai'
    )
    end_date = models.DateField(
        null=True, blank=True, verbose_name='Tanggal Selesai'
    )
    actual_end_date = models.DateField(
        null=True, blank=True, verbose_name='Tanggal Selesai Aktual'
    )

    # Budget
    currency = models.CharField(max_length=3, default='IDR')
    budget = models.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal('0'),
        verbose_name='Anggaran'
    )
    spent = models.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal('0'),
        verbose_name='Pengeluaran'
    )

    # Progress
    progress_percentage = models.IntegerField(
        default=0, verbose_name='Progress (%)',
        help_text='0-100'
    )

    # Tags and areas
    research_area = models.CharField(
        max_length=200, blank=True, verbose_name='Bidang Penelitian'
    )
    tags = models.CharField(
        max_length=500, blank=True, verbose_name='Tags',
        help_text='Pisahkan dengan koma'
    )

    notes = models.TextField(blank=True, verbose_name='Catatan')

    class Meta:
        verbose_name = 'Proyek Penelitian'
        verbose_name_plural = 'Proyek Penelitian'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project_code']),
            models.Index(fields=['lead_researcher']),
            models.Index(fields=['status']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.project_code} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.project_code:
            self.project_code = self._generate_project_code()
        super().save(*args, **kwargs)

    def _generate_project_code(self):
        """Generate project code: PRJ-YYYY-XXXX"""
        year = timezone.now().year
        prefix = f"PRJ-{year}-"
        last = ResearchProject.objects.filter(
            project_code__startswith=prefix
        ).order_by('-project_code').first()

        if last:
            last_num = int(last.project_code.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        return f"{prefix}{new_num:04d}"

    @property
    def remaining_budget(self):
        return self.budget - self.spent

    @property
    def is_overdue(self):
        if self.end_date and self.status == ProjectStatus.ACTIVE:
            return timezone.now().date() > self.end_date
        return False


class ProjectTeamMember(TenantBaseModel):
    """Project team member."""
    class Role(models.TextChoices):
        CO_LEAD = 'co_lead', 'Co-Lead'
        RESEARCHER = 'researcher', 'Peneliti'
        ASSISTANT = 'assistant', 'Asisten'
        CONSULTANT = 'consultant', 'Konsultan'
        DATA_ANALYST = 'data_analyst', 'Analis Data'
        FIELD_WORKER = 'field_worker', 'Petugas Lapangan'

    project = models.ForeignKey(
        ResearchProject, on_delete=models.CASCADE,
        related_name='team_members'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='project_memberships'
    )
    role = models.CharField(
        max_length=20, choices=Role.choices,
        default=Role.RESEARCHER
    )
    responsibilities = models.TextField(blank=True, verbose_name='Tanggung Jawab')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = 'Anggota Tim Proyek'
        verbose_name_plural = 'Anggota Tim Proyek'
        unique_together = ['project', 'user']

    def __str__(self):
        return f"{self.user} - {self.project.project_code}"


class ProjectTask(TenantBaseModel, AuditMixin):
    """Project task/activity."""
    class TaskStatus(models.TextChoices):
        TODO = 'todo', 'To Do'
        IN_PROGRESS = 'in_progress', 'Dalam Proses'
        REVIEW = 'review', 'Review'
        DONE = 'done', 'Selesai'
        BLOCKED = 'blocked', 'Terblokir'

    class Priority(models.TextChoices):
        LOW = 'low', 'Rendah'
        MEDIUM = 'medium', 'Sedang'
        HIGH = 'high', 'Tinggi'
        URGENT = 'urgent', 'Urgent'

    project = models.ForeignKey(
        ResearchProject, on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(max_length=200, verbose_name='Judul')
    description = models.TextField(blank=True, verbose_name='Deskripsi')

    status = models.CharField(
        max_length=20, choices=TaskStatus.choices,
        default=TaskStatus.TODO
    )
    priority = models.CharField(
        max_length=10, choices=Priority.choices,
        default=Priority.MEDIUM
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_project_tasks',
        verbose_name='Ditugaskan Ke'
    )

    due_date = models.DateField(null=True, blank=True, verbose_name='Deadline')
    completed_at = models.DateTimeField(null=True, blank=True)

    # Parent task for subtasks
    parent_task = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='subtasks'
    )

    class Meta:
        verbose_name = 'Tugas Proyek'
        verbose_name_plural = 'Tugas Proyek'
        ordering = ['priority', 'due_date']

    def __str__(self):
        return f"{self.project.project_code} - {self.title}"

    def mark_complete(self):
        self.status = self.TaskStatus.DONE
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'completed_at'])


class ProjectUpdate(TenantBaseModel, AuditMixin):
    """Project progress update/log."""
    project = models.ForeignKey(
        ResearchProject, on_delete=models.CASCADE,
        related_name='updates'
    )
    title = models.CharField(max_length=200, verbose_name='Judul')
    content = models.TextField(verbose_name='Isi Update')
    progress_percentage = models.IntegerField(
        null=True, blank=True, verbose_name='Progress (%)',
        help_text='Progress setelah update ini'
    )
    attachment = models.FileField(
        upload_to='projects/updates/', blank=True, null=True,
        verbose_name='Lampiran'
    )

    class Meta:
        verbose_name = 'Update Proyek'
        verbose_name_plural = 'Update Proyek'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.project.project_code} - {self.title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update project progress if provided
        if self.progress_percentage is not None:
            self.project.progress_percentage = self.progress_percentage
            self.project.save(update_fields=['progress_percentage'])
