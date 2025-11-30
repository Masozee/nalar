from django.contrib import admin
from .models import (
    WorkflowTemplate,
    WorkflowStep,
    ApprovalRequest,
    ApprovalAction,
    ApprovalDelegate,
)


class WorkflowStepInline(admin.TabularInline):
    model = WorkflowStep
    extra = 1
    ordering = ['step_order']


@admin.register(WorkflowTemplate)
class WorkflowTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'content_type', 'auto_approve_threshold', 'is_active']
    list_filter = ['content_type', 'is_active']
    search_fields = ['name', 'code']
    inlines = [WorkflowStepInline]


@admin.register(WorkflowStep)
class WorkflowStepAdmin(admin.ModelAdmin):
    list_display = [
        'workflow', 'step_order', 'name', 'approver_type',
        'can_reject', 'requires_comment',
    ]
    list_filter = ['workflow', 'approver_type']
    search_fields = ['name', 'workflow__name']


class ApprovalActionInline(admin.TabularInline):
    model = ApprovalAction
    extra = 0
    readonly_fields = ['step', 'action', 'actor', 'comment', 'acted_at']


@admin.register(ApprovalRequest)
class ApprovalRequestAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'workflow', 'requester', 'status',
        'current_step', 'submitted_at',
    ]
    list_filter = ['status', 'workflow', 'submitted_at']
    search_fields = ['title', 'requester__email']
    raw_id_fields = ['requester']
    inlines = [ApprovalActionInline]
    fieldsets = (
        ('Request Info', {
            'fields': ('workflow', 'title', 'description', 'requester', 'value')
        }),
        ('Status', {
            'fields': ('status', 'current_step', 'submitted_at', 'completed_at')
        }),
        ('Related Object', {
            'fields': ('content_type', 'object_id'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['submitted_at', 'completed_at']


@admin.register(ApprovalAction)
class ApprovalActionAdmin(admin.ModelAdmin):
    list_display = ['approval_request', 'step', 'action', 'actor', 'acted_at']
    list_filter = ['action', 'acted_at']
    search_fields = ['approval_request__title', 'actor__email']
    raw_id_fields = ['approval_request', 'actor']


@admin.register(ApprovalDelegate)
class ApprovalDelegateAdmin(admin.ModelAdmin):
    list_display = ['delegator', 'delegate', 'workflow', 'start_date', 'end_date', 'is_active']
    list_filter = ['start_date', 'end_date', 'workflow']
    search_fields = ['delegator__email', 'delegate__email']
    raw_id_fields = ['delegator', 'delegate']
