"""Django admin configuration for tenant models."""

from django.contrib import admin
from django.utils.html import format_html
from .models import Tenant, TenantUser, Subscription, Invoice


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    """Admin interface for Tenant model."""

    list_display = [
        'name',
        'slug',
        'status_badge',
        'plan_badge',
        'user_count',
        'created_at',
    ]
    list_filter = ['status', 'plan', 'created_at']
    search_fields = ['name', 'slug', 'email', 'subdomain']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    prepopulated_fields = {'slug': ('name',)}

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'subdomain', 'logo')
        }),
        ('Contact', {
            'fields': ('email', 'phone', 'website')
        }),
        ('Address', {
            'fields': ('address', 'city', 'state', 'country', 'postal_code')
        }),
        ('Status & Plan', {
            'fields': ('status', 'plan', 'max_users', 'max_storage_gb')
        }),
        ('Configuration', {
            'fields': ('enabled_modules', 'settings', 'primary_color'),
            'classes': ('collapse',)
        }),
        ('Dates', {
            'fields': ('trial_ends_at', 'subscription_ends_at'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        """Display status as colored badge."""
        colors = {
            'active': 'green',
            'trial': 'orange',
            'suspended': 'red',
            'canceled': 'gray',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def plan_badge(self, obj):
        """Display plan as badge."""
        return format_html(
            '<span style="background: #005357; color: white; padding: 2px 8px; border-radius: 3px;">{}</span>',
            obj.get_plan_display()
        )
    plan_badge.short_description = 'Plan'

    def user_count(self, obj):
        """Display number of active users."""
        count = obj.get_user_count()
        return format_html('{} / {}', count, obj.max_users)
    user_count.short_description = 'Users'


@admin.register(TenantUser)
class TenantUserAdmin(admin.ModelAdmin):
    """Admin interface for TenantUser model."""

    list_display = [
        'user_email',
        'tenant',
        'role',
        'is_owner',
        'is_active',
        'joined_at',
    ]
    list_filter = ['role', 'is_owner', 'is_active', 'tenant__plan']
    search_fields = ['user__email', 'tenant__name']
    readonly_fields = ['invited_at', 'joined_at']

    fieldsets = (
        (None, {
            'fields': ('tenant', 'user', 'role', 'is_owner', 'is_active')
        }),
        ('Invitation', {
            'fields': ('invited_by', 'invited_at', 'joined_at'),
            'classes': ('collapse',)
        }),
    )

    def user_email(self, obj):
        """Display user email."""
        return obj.user.email
    user_email.short_description = 'User Email'


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """Admin interface for Subscription model."""

    list_display = [
        'tenant',
        'plan',
        'status',
        'current_period_end',
        'cancel_at_period_end',
    ]
    list_filter = ['plan', 'status', 'cancel_at_period_end']
    search_fields = ['tenant__name', 'billing_email']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']

    fieldsets = (
        ('Tenant & Plan', {
            'fields': ('tenant', 'plan', 'status')
        }),
        ('Billing Information', {
            'fields': ('billing_email', 'billing_name', 'billing_address')
        }),
        ('Payment Gateway', {
            'fields': ('stripe_customer_id', 'stripe_subscription_id'),
            'classes': ('collapse',)
        }),
        ('Subscription Period', {
            'fields': ('current_period_start', 'current_period_end')
        }),
        ('Cancellation', {
            'fields': ('cancel_at_period_end', 'canceled_at'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """Admin interface for Invoice model."""

    list_display = [
        'invoice_number',
        'tenant',
        'status_badge',
        'total_amount_display',
        'issue_date',
        'due_date',
        'paid_date',
    ]
    list_filter = ['status', 'issue_date', 'paid_date']
    search_fields = ['invoice_number', 'tenant__name', 'stripe_invoice_id']
    readonly_fields = ['invoice_number', 'created_at', 'updated_at', 'created_by', 'updated_by']
    date_hierarchy = 'issue_date'

    fieldsets = (
        ('Invoice Details', {
            'fields': ('tenant', 'subscription', 'invoice_number', 'status')
        }),
        ('Amounts', {
            'fields': ('amount', 'tax_amount', 'total_amount', 'currency')
        }),
        ('Description', {
            'fields': ('description', 'line_items')
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date', 'paid_date')
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'stripe_invoice_id', 'pdf_url'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        """Display status as colored badge."""
        colors = {
            'paid': 'green',
            'pending': 'orange',
            'draft': 'gray',
            'failed': 'red',
            'refunded': 'blue',
            'canceled': 'gray',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def total_amount_display(self, obj):
        """Display total amount with currency."""
        return f'{obj.currency} {obj.total_amount}'
    total_amount_display.short_description = 'Total Amount'
