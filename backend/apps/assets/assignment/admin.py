from django.contrib import admin
from .models import AssetAssignment, AssetTransfer, AssetCheckout


@admin.register(AssetAssignment)
class AssetAssignmentAdmin(admin.ModelAdmin):
    list_display = [
        'asset', 'assigned_to', 'assignment_type', 'status',
        'assigned_date', 'expected_return_date',
    ]
    list_filter = ['status', 'assignment_type', 'assigned_date']
    search_fields = ['asset__asset_code', 'asset__name', 'assigned_to__email']
    date_hierarchy = 'assigned_date'
    raw_id_fields = ['asset', 'assigned_to', 'approved_by', 'returned_to']

    fieldsets = (
        (None, {
            'fields': ('asset', 'assigned_to', 'assignment_type', 'status')
        }),
        ('Dates', {
            'fields': ('assigned_date', 'expected_return_date', 'actual_return_date')
        }),
        ('Details', {
            'fields': ('purpose', 'location')
        }),
        ('Condition', {
            'fields': ('condition_at_assignment', 'condition_at_return')
        }),
        ('Approval & Return', {
            'fields': ('approved_by', 'returned_to', 'notes')
        }),
    )


@admin.register(AssetTransfer)
class AssetTransferAdmin(admin.ModelAdmin):
    list_display = [
        'asset', 'from_user', 'to_user', 'transfer_date', 'approved_by',
    ]
    list_filter = ['transfer_date']
    search_fields = ['asset__asset_code', 'from_user__email', 'to_user__email']
    date_hierarchy = 'transfer_date'
    raw_id_fields = ['asset', 'from_user', 'to_user', 'approved_by']


@admin.register(AssetCheckout)
class AssetCheckoutAdmin(admin.ModelAdmin):
    list_display = [
        'asset', 'checked_out_by', 'checkout_time', 'expected_return_time',
        'is_returned', 'purpose',
    ]
    list_filter = ['is_returned', 'checkout_time']
    search_fields = ['asset__asset_code', 'checked_out_by__email', 'purpose']
    date_hierarchy = 'checkout_time'
    raw_id_fields = ['asset', 'checked_out_by', 'returned_to']
