from django.contrib import admin
from .models import StockTransfer, StockTransferItem


class StockTransferItemInline(admin.TabularInline):
    model = StockTransferItem
    extra = 1
    raw_id_fields = ['sku']
    readonly_fields = ['received_quantity']


@admin.register(StockTransfer)
class StockTransferAdmin(admin.ModelAdmin):
    list_display = [
        'transfer_number', 'source_warehouse', 'destination_warehouse',
        'status', 'priority', 'requested_date', 'is_active'
    ]
    list_filter = ['status', 'priority', 'source_warehouse', 'destination_warehouse']
    search_fields = ['transfer_number']
    raw_id_fields = [
        'source_warehouse', 'destination_warehouse',
        'requested_by', 'approved_by', 'shipped_by', 'received_by',
        'created_by', 'updated_by'
    ]
    readonly_fields = [
        'transfer_number', 'approved_at', 'shipped_date', 'received_date',
        'created_at', 'updated_at'
    ]
    inlines = [StockTransferItemInline]
    fieldsets = (
        ('Transfer Info', {
            'fields': ('transfer_number', 'status', 'priority')
        }),
        ('Warehouses', {
            'fields': ('source_warehouse', 'destination_warehouse')
        }),
        ('Dates', {
            'fields': ('requested_date', 'expected_date', 'shipped_date', 'received_date')
        }),
        ('Personnel', {
            'fields': ('requested_by', 'approved_by', 'approved_at', 'shipped_by', 'received_by')
        }),
        ('Notes', {
            'fields': ('reason', 'notes', 'rejection_reason'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StockTransferItem)
class StockTransferItemAdmin(admin.ModelAdmin):
    list_display = ['transfer', 'sku', 'quantity', 'received_quantity']
    list_filter = ['transfer__status']
    search_fields = ['transfer__transfer_number', 'sku__name', 'sku__sku_code']
    raw_id_fields = ['transfer', 'sku']
