from django.contrib import admin
from .models import Vendor, VendorContact, VendorEvaluation


class VendorContactInline(admin.TabularInline):
    model = VendorContact
    extra = 1


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'name', 'vendor_type', 'category', 'status',
        'city', 'rating', 'is_active'
    ]
    list_filter = ['status', 'category', 'vendor_type', 'city', 'province']
    search_fields = ['code', 'name', 'email', 'npwp', 'contact_person']
    readonly_fields = ['code', 'created_at', 'updated_at']
    inlines = [VendorContactInline]
    fieldsets = (
        ('Basic Info', {
            'fields': ('code', 'name', 'vendor_type', 'category', 'status')
        }),
        ('Legal', {
            'fields': ('npwp', 'nib', 'siup_number')
        }),
        ('Address', {
            'fields': ('address', 'city', 'province', 'postal_code')
        }),
        ('Contact', {
            'fields': ('phone', 'fax', 'email', 'website')
        }),
        ('Contact Person', {
            'fields': ('contact_person', 'contact_phone', 'contact_email')
        }),
        ('Banking', {
            'fields': ('bank_name', 'bank_branch', 'bank_account_number', 'bank_account_name'),
            'classes': ('collapse',)
        }),
        ('Terms', {
            'fields': ('payment_terms', 'credit_limit', 'rating')
        }),
        ('Notes', {
            'fields': ('notes', 'blacklist_reason'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )


@admin.register(VendorContact)
class VendorContactAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'name', 'position', 'phone', 'email', 'is_primary']
    list_filter = ['is_primary']
    search_fields = ['vendor__name', 'name', 'email']
    raw_id_fields = ['vendor']


@admin.register(VendorEvaluation)
class VendorEvaluationAdmin(admin.ModelAdmin):
    list_display = [
        'vendor', 'evaluation_date', 'overall_score',
        'quality_score', 'delivery_score', 'price_score', 'evaluator'
    ]
    list_filter = ['evaluation_date']
    search_fields = ['vendor__name']
    raw_id_fields = ['vendor', 'evaluator']
    readonly_fields = ['overall_score']
