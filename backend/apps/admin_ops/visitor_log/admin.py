from django.contrib import admin
from .models import Visitor, VisitLog, VisitorBadge


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'company', 'phone', 'email',
        'id_type', 'is_blacklisted', 'is_active',
    ]
    list_filter = ['is_blacklisted', 'id_type', 'is_active']
    search_fields = ['name', 'company', 'phone', 'email', 'id_number']
    ordering = ['name']

    fieldsets = (
        (None, {
            'fields': ('name', 'company', 'photo')
        }),
        ('Contact', {
            'fields': ('email', 'phone')
        }),
        ('Identification', {
            'fields': ('id_type', 'id_number')
        }),
        ('Status', {
            'fields': ('is_blacklisted', 'blacklist_reason', 'is_active', 'notes')
        }),
    )


@admin.register(VisitLog)
class VisitLogAdmin(admin.ModelAdmin):
    list_display = [
        'visitor_name', 'visitor_company', 'purpose', 'host_name',
        'expected_arrival', 'check_in_time', 'check_out_time', 'status',
    ]
    list_filter = ['status', 'purpose', 'is_pre_registered', 'check_in_time']
    search_fields = ['visitor_name', 'visitor_company', 'host_name', 'badge_number']
    date_hierarchy = 'check_in_time'
    raw_id_fields = ['visitor', 'host', 'checked_in_by', 'checked_out_by', 'pre_registered_by']
    ordering = ['-check_in_time']

    fieldsets = (
        ('Visitor Info', {
            'fields': (
                'visitor', 'visitor_name', 'visitor_company', 'visitor_phone',
                ('visitor_id_type', 'visitor_id_number'),
            )
        }),
        ('Visit Details', {
            'fields': ('purpose', 'purpose_detail', 'belongings')
        }),
        ('Host', {
            'fields': ('host', 'host_name', 'host_department')
        }),
        ('Schedule', {
            'fields': (
                'expected_arrival', 'check_in_time', 'check_out_time', 'status'
            )
        }),
        ('Badge', {
            'fields': ('badge_number',)
        }),
        ('Check In/Out', {
            'fields': ('checked_in_by', 'checked_out_by'),
            'classes': ('collapse',)
        }),
        ('Pre-registration', {
            'fields': ('is_pre_registered', 'pre_registered_by'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )


@admin.register(VisitorBadge)
class VisitorBadgeAdmin(admin.ModelAdmin):
    list_display = ['badge_number', 'badge_type', 'is_available', 'current_holder', 'is_active']
    list_filter = ['is_available', 'badge_type', 'is_active']
    search_fields = ['badge_number']
    raw_id_fields = ['current_holder']
