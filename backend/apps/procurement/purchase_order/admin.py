from django.contrib import admin
from .models import PurchaseOrder, POItem, POReceipt, POReceiptItem


class POItemInline(admin.TabularInline):
    model = POItem
    extra = 1
    readonly_fields = ['total_price', 'received_quantity']


class POReceiptItemInline(admin.TabularInline):
    model = POReceiptItem
    extra = 1


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = [
        'po_number', 'vendor', 'status', 'priority', 'order_date',
        'total_amount', 'payment_status', 'is_active'
    ]
    list_filter = ['status', 'priority', 'payment_status', 'order_date']
    search_fields = ['po_number', 'vendor__name', 'reference_number']
    raw_id_fields = ['vendor', 'requested_by', 'approved_by', 'created_by', 'updated_by']
    readonly_fields = [
        'po_number', 'subtotal', 'discount_amount', 'tax_amount',
        'total_amount', 'paid_amount', 'approved_at', 'created_at', 'updated_at'
    ]
    inlines = [POItemInline]
    fieldsets = (
        ('PO Info', {
            'fields': ('po_number', 'reference_number', 'vendor', 'status', 'priority')
        }),
        ('Dates', {
            'fields': ('order_date', 'expected_delivery_date', 'actual_delivery_date')
        }),
        ('Requester', {
            'fields': ('requested_by', 'department')
        }),
        ('Delivery', {
            'fields': ('delivery_address', 'delivery_notes'),
            'classes': ('collapse',)
        }),
        ('Financial', {
            'fields': (
                'currency', 'subtotal', 'discount_percent', 'discount_amount',
                'tax_percent', 'tax_amount', 'total_amount'
            )
        }),
        ('Payment', {
            'fields': ('payment_terms', 'payment_status', 'paid_amount')
        }),
        ('Approval', {
            'fields': ('approved_by', 'approved_at', 'rejection_reason'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('terms_conditions', 'internal_notes'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )


@admin.register(POItem)
class POItemAdmin(admin.ModelAdmin):
    list_display = [
        'purchase_order', 'line_number', 'item_name', 'quantity',
        'received_quantity', 'unit_price', 'total_price'
    ]
    list_filter = ['purchase_order__status']
    search_fields = ['purchase_order__po_number', 'item_name', 'item_code']
    raw_id_fields = ['purchase_order']
    readonly_fields = ['total_price', 'received_quantity']


@admin.register(POReceipt)
class POReceiptAdmin(admin.ModelAdmin):
    list_display = [
        'receipt_number', 'purchase_order', 'receipt_date',
        'received_by', 'delivery_note_number'
    ]
    list_filter = ['receipt_date']
    search_fields = ['receipt_number', 'purchase_order__po_number', 'delivery_note_number']
    raw_id_fields = ['purchase_order', 'received_by', 'created_by', 'updated_by']
    readonly_fields = ['receipt_number', 'created_at', 'updated_at']
    inlines = [POReceiptItemInline]


@admin.register(POReceiptItem)
class POReceiptItemAdmin(admin.ModelAdmin):
    list_display = [
        'receipt', 'po_item', 'quantity_received', 'quantity_rejected'
    ]
    search_fields = ['receipt__receipt_number', 'po_item__item_name']
    raw_id_fields = ['receipt', 'po_item']
