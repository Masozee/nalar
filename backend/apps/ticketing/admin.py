from django.contrib import admin
from .models import Category, SLAPolicy, Ticket, TicketComment, TicketAttachment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'parent', 'default_assignee_group', 'is_active']
    list_filter = ['parent', 'is_active']
    search_fields = ['name', 'code']


@admin.register(SLAPolicy)
class SLAPolicyAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'priority', 'response_time', 'resolution_time',
        'business_hours_only', 'is_active',
    ]
    list_filter = ['priority', 'business_hours_only']
    search_fields = ['name']


class TicketCommentInline(admin.TabularInline):
    model = TicketComment
    extra = 0
    readonly_fields = ['author', 'created_at', 'is_first_response']


class TicketAttachmentInline(admin.TabularInline):
    model = TicketAttachment
    extra = 0
    readonly_fields = ['uploaded_by', 'file_size', 'created_at']


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = [
        'ticket_number', 'title', 'priority', 'status',
        'requester', 'assignee', 'category', 'created_at',
    ]
    list_filter = ['status', 'priority', 'ticket_type', 'category', 'created_at']
    search_fields = ['ticket_number', 'title', 'requester__email', 'assignee__email']
    raw_id_fields = ['requester', 'assignee', 'related_ticket']
    readonly_fields = [
        'ticket_number', 'first_response_at', 'resolved_at', 'closed_at',
        'response_breached', 'resolution_breached', 'attachments_count',
    ]
    inlines = [TicketCommentInline, TicketAttachmentInline]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Ticket Info', {
            'fields': (
                'ticket_number', 'title', 'description',
                'ticket_type', 'category', 'tags',
            )
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority')
        }),
        ('Assignment', {
            'fields': ('requester', 'assignee')
        }),
        ('SLA', {
            'fields': (
                'sla_policy', 'response_due', 'resolution_due',
                'first_response_at', 'resolved_at', 'closed_at',
                'response_breached', 'resolution_breached',
            ),
            'classes': ('collapse',)
        }),
        ('Related', {
            'fields': ('related_ticket', 'attachments_count'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(TicketComment)
class TicketCommentAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'author', 'comment_type', 'is_first_response', 'created_at']
    list_filter = ['comment_type', 'is_first_response', 'created_at']
    search_fields = ['ticket__ticket_number', 'content', 'author__email']
    raw_id_fields = ['ticket', 'author']


@admin.register(TicketAttachment)
class TicketAttachmentAdmin(admin.ModelAdmin):
    list_display = ['filename', 'ticket', 'uploaded_by', 'file_size', 'created_at']
    list_filter = ['created_at']
    search_fields = ['filename', 'ticket__ticket_number']
    raw_id_fields = ['ticket', 'uploaded_by']
