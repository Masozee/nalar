from django.contrib import admin
from .models import (
    Folder, Document, DocumentAccessPermission,
    DocumentUserAccess, DocumentAccessLog,
)


class DocumentAccessPermissionInline(admin.TabularInline):
    model = DocumentAccessPermission
    extra = 1


class DocumentUserAccessInline(admin.TabularInline):
    model = DocumentUserAccess
    extra = 1
    fk_name = 'document'


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'owner', 'access_level', 'is_active', 'created_at']
    list_filter = ['access_level', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    raw_id_fields = ['parent', 'owner']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'status', 'access_level',
        'owner', 'is_encrypted', 'version', 'download_count', 'created_at'
    ]
    list_filter = ['category', 'status', 'access_level', 'is_encrypted', 'created_at']
    search_fields = ['title', 'description', 'original_filename', 'tags']
    raw_id_fields = ['folder', 'owner', 'parent_version', 'created_by', 'updated_by']
    readonly_fields = [
        'encryption_nonce', 'file_size', 'download_count',
        'last_accessed_at', 'created_at', 'updated_at'
    ]
    inlines = [DocumentAccessPermissionInline, DocumentUserAccessInline]
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'description', 'category', 'status', 'tags')
        }),
        ('File', {
            'fields': ('file', 'original_filename', 'content_type', 'file_size')
        }),
        ('Encryption', {
            'fields': ('is_encrypted', 'encryption_nonce')
        }),
        ('Organization', {
            'fields': ('folder', 'owner', 'version', 'parent_version')
        }),
        ('Access Control', {
            'fields': ('access_level',)
        }),
        ('Dates', {
            'fields': ('effective_date', 'expiry_date')
        }),
        ('Tracking', {
            'fields': ('download_count', 'last_accessed_at')
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DocumentAccessPermission)
class DocumentAccessPermissionAdmin(admin.ModelAdmin):
    list_display = [
        'document', 'role', 'can_read', 'can_download',
        'can_edit', 'can_delete', 'can_share'
    ]
    list_filter = ['role', 'can_read', 'can_download', 'can_edit']
    search_fields = ['document__title']
    raw_id_fields = ['document']


@admin.register(DocumentUserAccess)
class DocumentUserAccessAdmin(admin.ModelAdmin):
    list_display = [
        'document', 'user', 'granted_by', 'can_read', 'can_download',
        'can_edit', 'expires_at'
    ]
    list_filter = ['can_read', 'can_download', 'can_edit', 'expires_at']
    search_fields = ['document__title', 'user__email']
    raw_id_fields = ['document', 'user', 'granted_by']


@admin.register(DocumentAccessLog)
class DocumentAccessLogAdmin(admin.ModelAdmin):
    list_display = ['document', 'user', 'action', 'success', 'ip_address', 'created_at']
    list_filter = ['action', 'success', 'created_at']
    search_fields = ['document__title', 'user__email', 'ip_address']
    raw_id_fields = ['document', 'user']
    readonly_fields = ['document', 'user', 'action', 'ip_address', 'user_agent', 'success', 'notes', 'created_at']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
