from django.contrib import admin
from .models import Policy, PolicyCategory, PolicyApproval, PolicyAcknowledgment


@admin.register(PolicyCategory)
class PolicyCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'description']
    list_editable = ['order']
    search_fields = ['name']


class PolicyApprovalInline(admin.TabularInline):
    model = PolicyApproval
    extra = 0
    readonly_fields = ['approved_at', 'created_at']


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'version', 'status', 'effective_date', 'created_by', 'view_count']
    list_filter = ['status', 'category', 'requires_acknowledgment', 'is_active']
    search_fields = ['title', 'description', 'content']
    readonly_fields = ['view_count', 'created_at', 'updated_at']
    inlines = [PolicyApprovalInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'category', 'content')
        }),
        ('File Attachment', {
            'fields': ('file', 'file_name', 'file_size')
        }),
        ('Versioning', {
            'fields': ('version', 'effective_date', 'expiry_date')
        }),
        ('Status & Settings', {
            'fields': ('status', 'requires_acknowledgment', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'tags', 'view_count', 'created_at', 'updated_at')
        }),
    )


@admin.register(PolicyApproval)
class PolicyApprovalAdmin(admin.ModelAdmin):
    list_display = ['policy', 'approver', 'approver_title', 'order', 'status', 'approved_at']
    list_filter = ['status', 'approver_title']
    search_fields = ['policy__title', 'approver__username', 'approver__first_name', 'approver__last_name']
    readonly_fields = ['approved_at', 'created_at', 'updated_at']


@admin.register(PolicyAcknowledgment)
class PolicyAcknowledgmentAdmin(admin.ModelAdmin):
    list_display = ['policy', 'user', 'acknowledged_at', 'ip_address']
    list_filter = ['acknowledged_at']
    search_fields = ['policy__title', 'user__username', 'user__first_name', 'user__last_name']
    readonly_fields = ['acknowledged_at', 'created_at']
