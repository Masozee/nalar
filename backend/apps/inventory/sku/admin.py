from django.contrib import admin
from .models import SKU, Warehouse, StockRecord, StockMovement


@admin.register(SKU)
class SKUAdmin(admin.ModelAdmin):
    list_display = [
        'sku_code', 'name', 'category', 'unit', 'current_stock',
        'minimum_stock', 'unit_price', 'is_active'
    ]
    list_filter = ['category', 'is_stockable', 'is_purchasable', 'is_active']
    search_fields = ['sku_code', 'barcode', 'name', 'brand']
    readonly_fields = ['sku_code', 'current_stock', 'created_at', 'updated_at']
    fieldsets = (
        ('Identification', {
            'fields': ('sku_code', 'barcode', 'name', 'description')
        }),
        ('Classification', {
            'fields': ('category', 'unit', 'brand', 'model')
        }),
        ('Pricing', {
            'fields': ('unit_price',)
        }),
        ('Stock Levels', {
            'fields': ('current_stock', 'minimum_stock', 'maximum_stock', 'reorder_point', 'reorder_quantity')
        }),
        ('Location', {
            'fields': ('default_location',)
        }),
        ('Status', {
            'fields': ('is_stockable', 'is_purchasable', 'is_active')
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'manager', 'is_default', 'is_active']
    list_filter = ['is_default', 'is_active']
    search_fields = ['code', 'name']


@admin.register(StockRecord)
class StockRecordAdmin(admin.ModelAdmin):
    list_display = ['sku', 'warehouse', 'quantity', 'reserved_quantity', 'is_active']
    list_filter = ['warehouse', 'is_active']
    search_fields = ['sku__sku_code', 'sku__name']
    raw_id_fields = ['sku', 'warehouse']


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = [
        'sku', 'warehouse', 'movement_type', 'quantity',
        'quantity_before', 'quantity_after', 'movement_date'
    ]
    list_filter = ['movement_type', 'warehouse', 'movement_date']
    search_fields = ['sku__sku_code', 'sku__name', 'reference_id']
    raw_id_fields = ['sku', 'warehouse']
    readonly_fields = ['movement_date', 'created_at']
