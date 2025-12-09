from django.db import models
from apps.core.models import TenantBaseModel
from apps.users.models import User


class PolicyCategory(models.Model):
    """Category for grouping policies"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = "Policy Categories"
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Policy(TenantBaseModel):
    """Office policy document"""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(
        PolicyCategory,
        on_delete=models.PROTECT,
        related_name='policies'
    )
    content = models.TextField(help_text="Full policy content in Markdown or HTML")

    # File attachments
    file = models.FileField(
        upload_to='policies/%Y/%m/',
        blank=True,
        null=True,
        help_text="Policy document file (PDF, DOCX, etc.)"
    )
    file_size = models.IntegerField(null=True, blank=True, help_text="File size in bytes")
    file_name = models.CharField(max_length=255, blank=True)

    # Versioning
    version = models.CharField(max_length=50, default="1.0")
    effective_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)

    # Status and approval
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    requires_acknowledgment = models.BooleanField(default=False)

    # Creator
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_policies'
    )

    # Metadata
    tags = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    view_count = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = "Policies"
        ordering = ['-effective_date', '-created_at']

    def __str__(self):
        return f"{self.title} (v{self.version})"


class PolicyApproval(TenantBaseModel):
    """Approval workflow for policies"""

    APPROVAL_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    policy = models.ForeignKey(
        Policy,
        on_delete=models.CASCADE,
        related_name='approvals'
    )
    approver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='policy_approvals'
    )
    approver_title = models.CharField(max_length=100, help_text="e.g., Executive Director")
    order = models.IntegerField(default=1, help_text="Approval sequence order")

    status = models.CharField(
        max_length=20,
        choices=APPROVAL_STATUS_CHOICES,
        default='pending'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    comments = models.TextField(blank=True)

    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ['policy', 'order']

    def __str__(self):
        return f"{self.policy.title} - {self.approver_title} ({self.status})"


class PolicyAcknowledgment(TenantBaseModel):
    """Track employee acknowledgment of policies"""

    policy = models.ForeignKey(
        Policy,
        on_delete=models.CASCADE,
        related_name='acknowledgments'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='policy_acknowledgments'
    )
    acknowledged_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        unique_together = ['policy', 'user']
        ordering = ['-acknowledged_at']

    def __str__(self):
        return f"{self.user.username} - {self.policy.title}"
