from django.contrib import admin
from .models import StockOpname, StockOpnameItem


class StockOpnameItemInline(admin.TabularInline):
    model = StockOpnameItem
    extra = 0
    readonly_fields = ['variance_quantity', 'variance_value', 'is_counted', 'counted_at']
    raw_id_fields = ['sku', 'counted_by']


@admin.register(StockOpname)
class StockOpnameAdmin(admin.ModelAdmin):
    list_display = [
        'opname_number', 'warehouse', 'status', 'scheduled_date',
        'total_items', 'counted_items', 'variance_items', 'is_active'
    ]
    list_filter = ['status', 'warehouse', 'scheduled_date', 'is_full_count']
    search_fields = ['opname_number', 'warehouse__name']
    raw_id_fields = ['warehouse', 'assigned_to', 'approved_by', 'created_by', 'updated_by']
    readonly_fields = [
        'opname_number', 'total_items', 'counted_items', 'variance_items',
        'total_variance_value', 'approved_at', 'created_at', 'updated_at'
    ]
    inlines = [StockOpnameItemInline]
    fieldsets = (
        ('Info', {
            'fields': ('opname_number', 'warehouse', 'status')
        }),
        ('Schedule', {
            'fields': ('scheduled_date', 'start_date', 'end_date')
        }),
        ('Scope', {
            'fields': ('is_full_count', 'category_filter')
        }),
        ('Personnel', {
            'fields': ('assigned_to', 'approved_by', 'approved_at')
        }),
        ('Summary', {
            'fields': ('total_items', 'counted_items', 'variance_items', 'total_variance_value')
        }),
        ('Notes', {
            'fields': ('notes', 'rejection_reason'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StockOpnameItem)
class StockOpnameItemAdmin(admin.ModelAdmin):
    list_display = [
        'opname', 'sku', 'system_quantity', 'actual_quantity',
        'has_variance', 'is_counted'
    ]
    list_filter = ['opname__status', 'has_variance', 'is_counted']
    search_fields = ['opname__opname_number', 'sku__name', 'sku__sku_code']
    raw_id_fields = ['opname', 'sku', 'counted_by']
