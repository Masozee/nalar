from django.contrib import admin
from .models import Asset, MaintenanceSchedule, MaintenanceRecord


class MaintenanceScheduleInline(admin.TabularInline):
    model = MaintenanceSchedule
    extra = 0
    fields = ['title', 'maintenance_type', 'frequency_days', 'next_due']


class MaintenanceRecordInline(admin.TabularInline):
    model = MaintenanceRecord
    extra = 0
    fields = ['title', 'maintenance_type', 'status', 'scheduled_date', 'total_cost']
    readonly_fields = ['total_cost']


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = [
        'asset_code', 'name', 'category', 'brand', 'model',
        'status', 'location', 'current_holder', 'is_active',
    ]
    list_filter = ['category', 'status', 'is_active', 'department']
    search_fields = ['asset_code', 'name', 'brand', 'model', 'serial_number']
    ordering = ['asset_code']
    raw_id_fields = ['current_holder']
    inlines = [MaintenanceScheduleInline, MaintenanceRecordInline]

    fieldsets = (
        (None, {
            'fields': ('asset_code', 'name', 'description', 'category', 'photo')
        }),
        ('Details', {
            'fields': ('brand', 'model', 'serial_number')
        }),
        ('Purchase Info', {
            'fields': ('purchase_date', 'purchase_price', 'vendor', 'warranty_expiry')
        }),
        ('Location', {
            'fields': ('location', 'department', 'current_holder')
        }),
        ('Depreciation', {
            'fields': ('useful_life_years', 'salvage_value'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('status', 'is_active', 'notes')
        }),
    )


@admin.register(MaintenanceSchedule)
class MaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = [
        'asset', 'title', 'maintenance_type', 'frequency_days',
        'last_performed', 'next_due',
    ]
    list_filter = ['maintenance_type', 'next_due']
    search_fields = ['asset__asset_code', 'asset__name', 'title']
    date_hierarchy = 'next_due'
    raw_id_fields = ['asset']


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = [
        'asset', 'title', 'maintenance_type', 'status',
        'scheduled_date', 'total_cost', 'vendor',
    ]
    list_filter = ['status', 'maintenance_type', 'scheduled_date']
    search_fields = ['asset__asset_code', 'asset__name', 'title', 'vendor']
    date_hierarchy = 'scheduled_date'
    raw_id_fields = ['asset', 'schedule', 'assigned_to']

    fieldsets = (
        (None, {
            'fields': ('asset', 'schedule', 'title', 'description', 'maintenance_type')
        }),
        ('Schedule', {
            'fields': ('status', 'scheduled_date', 'started_at', 'completed_at')
        }),
        ('Personnel', {
            'fields': ('assigned_to', 'performed_by', 'vendor')
        }),
        ('Costs', {
            'fields': ('labor_cost', 'parts_cost', 'total_cost')
        }),
        ('Results', {
            'fields': ('findings', 'actions_taken', 'parts_replaced', 'notes')
        }),
    )
    readonly_fields = ['total_cost']
