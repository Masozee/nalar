from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from apps.core.models import BaseModel, AuditMixin


class ApprovalStatus(models.TextChoices):
    PENDING = 'pending', 'Menunggu'
    APPROVED = 'approved', 'Disetujui'
    REJECTED = 'rejected', 'Ditolak'
    CANCELLED = 'cancelled', 'Dibatalkan'
    REVISION = 'revision', 'Perlu Revisi'


class WorkflowTemplate(BaseModel):
    """
    Defines a reusable approval workflow template.
    Can be applied to different models (LeaveRequest, PurchaseOrder, ExpenseRequest, etc.)
    """
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    # Which model this workflow applies to
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        help_text='Model this workflow applies to',
    )

    # Auto-approve if amount/value is below threshold
    auto_approve_threshold = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Auto-approve if value below this threshold',
    )

    class Meta:
        verbose_name = 'Workflow Template'
        verbose_name_plural = 'Workflow Templates'
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['content_type']),
        ]

    def __str__(self):
        return self.name


class WorkflowStep(BaseModel):
    """
    Individual step in a workflow.
    Steps are executed in order (by step_order).
    """
    workflow = models.ForeignKey(
        WorkflowTemplate,
        on_delete=models.CASCADE,
        related_name='steps',
    )
    name = models.CharField(max_length=100)
    step_order = models.PositiveIntegerField()

    # Who can approve this step
    APPROVER_TYPE_CHOICES = [
        ('supervisor', 'Direct Supervisor'),
        ('department_head', 'Department Head'),
        ('role', 'Specific Role'),
        ('user', 'Specific User'),
        ('any_of_group', 'Any User in Group'),
    ]
    approver_type = models.CharField(max_length=20, choices=APPROVER_TYPE_CHOICES)

    # For role-based approval
    approver_role = models.CharField(max_length=100, blank=True)

    # For specific user approval
    approver_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='workflow_steps_assigned',
    )

    # For group-based approval
    approver_group = models.ForeignKey(
        'auth.Group',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    # Step configuration
    can_reject = models.BooleanField(default=True)
    can_request_revision = models.BooleanField(default=True)
    requires_comment = models.BooleanField(default=False)
    auto_approve_days = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Auto-approve after N days if no action',
    )

    # Notification settings
    notify_on_pending = models.BooleanField(default=True)
    notify_on_complete = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Workflow Step'
        verbose_name_plural = 'Workflow Steps'
        ordering = ['workflow', 'step_order']
        unique_together = ['workflow', 'step_order']
        indexes = [
            models.Index(fields=['workflow', 'step_order']),
        ]

    def __str__(self):
        return f"{self.workflow.name} - Step {self.step_order}: {self.name}"


class ApprovalRequest(BaseModel, AuditMixin):
    """
    An instance of a workflow for a specific object.
    Created when someone submits something for approval.
    """
    workflow = models.ForeignKey(
        WorkflowTemplate,
        on_delete=models.CASCADE,
        related_name='approval_requests',
    )

    # The object being approved (e.g., LeaveRequest, PurchaseOrder)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')

    # Request details
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='approval_requests_made',
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    # Current status
    status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )
    current_step = models.PositiveIntegerField(default=1)

    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Optional: value for threshold-based auto-approval
    value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = 'Approval Request'
        verbose_name_plural = 'Approval Requests'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['requester', 'status']),
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['current_step']),
        ]

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

    def get_current_step_instance(self):
        """Get the current workflow step."""
        try:
            return self.workflow.steps.get(step_order=self.current_step)
        except WorkflowStep.DoesNotExist:
            return None

    def advance_to_next_step(self):
        """Move to the next step or complete the workflow."""
        next_step = self.workflow.steps.filter(
            step_order__gt=self.current_step
        ).first()

        if next_step:
            self.current_step = next_step.step_order
            self.save()
            return next_step
        else:
            # No more steps, workflow is complete
            from django.utils import timezone
            self.status = ApprovalStatus.APPROVED
            self.completed_at = timezone.now()
            self.save()
            return None


class ApprovalAction(BaseModel):
    """
    Records each approval action taken on a request.
    Provides full audit trail of who did what and when.
    """
    approval_request = models.ForeignKey(
        ApprovalRequest,
        on_delete=models.CASCADE,
        related_name='actions',
    )
    step = models.ForeignKey(
        WorkflowStep,
        on_delete=models.CASCADE,
    )

    ACTION_CHOICES = [
        ('approve', 'Approved'),
        ('reject', 'Rejected'),
        ('revision', 'Requested Revision'),
        ('cancel', 'Cancelled'),
        ('reassign', 'Reassigned'),
    ]
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='approval_actions',
    )
    comment = models.TextField(blank=True)
    acted_at = models.DateTimeField(auto_now_add=True)

    # For reassignment
    reassigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reassigned_approvals',
    )

    class Meta:
        verbose_name = 'Approval Action'
        verbose_name_plural = 'Approval Actions'
        ordering = ['acted_at']
        indexes = [
            models.Index(fields=['approval_request', 'step']),
            models.Index(fields=['actor']),
            models.Index(fields=['acted_at']),
        ]

    def __str__(self):
        return f"{self.approval_request.title} - {self.get_action_display()} by {self.actor}"


class ApprovalDelegate(BaseModel):
    """
    Allows users to delegate their approval authority to others.
    Useful for vacations, temporary assignments, etc.
    """
    delegator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='approval_delegations_given',
    )
    delegate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='approval_delegations_received',
    )

    # Optional: limit delegation to specific workflows
    workflow = models.ForeignKey(
        WorkflowTemplate,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text='Leave blank to delegate all workflows',
    )

    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = 'Approval Delegate'
        verbose_name_plural = 'Approval Delegates'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['delegator', 'start_date', 'end_date']),
            models.Index(fields=['delegate']),
        ]

    def __str__(self):
        return f"{self.delegator} -> {self.delegate} ({self.start_date} to {self.end_date})"

    @property
    def is_active(self):
        from datetime import date
        today = date.today()
        return self.start_date <= today <= self.end_date
