from django.contrib import admin
from .models import ExpenseRequest, ExpenseItem, ExpenseAdvance


class ExpenseItemInline(admin.TabularInline):
    model = ExpenseItem
    extra = 1
    readonly_fields = ['amount']


@admin.register(ExpenseRequest)
class ExpenseRequestAdmin(admin.ModelAdmin):
    list_display = [
        'request_number', 'title', 'requester', 'status',
        'total_amount', 'approved_amount', 'request_date', 'is_active'
    ]
    list_filter = ['status', 'payment_method', 'request_date', 'expense_date']
    search_fields = ['request_number', 'title', 'requester__username', 'requester__email']
    raw_id_fields = ['requester', 'approved_by', 'processed_by', 'created_by', 'updated_by']
    readonly_fields = [
        'request_number', 'total_amount', 'approved_at',
        'processed_at', 'created_at', 'updated_at'
    ]
    inlines = [ExpenseItemInline]
    fieldsets = (
        ('Request Info', {
            'fields': ('request_number', 'title', 'description', 'purpose')
        }),
        ('Requester', {
            'fields': ('requester', 'department')
        }),
        ('Dates', {
            'fields': ('request_date', 'expense_date')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Financial', {
            'fields': ('currency', 'total_amount', 'approved_amount')
        }),
        ('Payment', {
            'fields': (
                'payment_method', 'bank_name',
                'bank_account_number', 'bank_account_name'
            ),
            'classes': ('collapse',)
        }),
        ('Approval', {
            'fields': ('approved_by', 'approved_at', 'rejection_reason'),
            'classes': ('collapse',)
        }),
        ('Processing', {
            'fields': (
                'processed_by', 'processed_at',
                'payment_reference', 'payment_date'
            ),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes', 'finance_notes'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ExpenseItem)
class ExpenseItemAdmin(admin.ModelAdmin):
    list_display = [
        'expense_request', 'category', 'description',
        'quantity', 'unit_price', 'amount'
    ]
    list_filter = ['category', 'expense_request__status']
    search_fields = ['expense_request__request_number', 'description']
    raw_id_fields = ['expense_request']
    readonly_fields = ['amount']


@admin.register(ExpenseAdvance)
class ExpenseAdvanceAdmin(admin.ModelAdmin):
    list_display = [
        'advance_number', 'requester', 'purpose', 'amount',
        'status', 'settled_amount', 'is_active'
    ]
    list_filter = ['status']
    search_fields = ['advance_number', 'requester__username', 'purpose']
    raw_id_fields = ['requester', 'expense_request', 'approved_by', 'created_by', 'updated_by']
    readonly_fields = ['advance_number', 'created_at', 'updated_at']
    fieldsets = (
        ('Advance Info', {
            'fields': ('advance_number', 'requester', 'expense_request')
        }),
        ('Details', {
            'fields': ('purpose', 'amount', 'status')
        }),
        ('Approval', {
            'fields': ('approved_by', 'approved_at'),
            'classes': ('collapse',)
        }),
        ('Settlement', {
            'fields': ('settled_amount', 'settlement_date'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )
