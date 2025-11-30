from django.contrib import admin
from .models import LeavePolicy, LeaveBalance, LeaveRequest


@admin.register(LeavePolicy)
class LeavePolicyAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'leave_type', 'year', 'default_days',
        'max_carry_over', 'requires_approval',
    ]
    list_filter = ['year', 'leave_type', 'requires_approval']
    search_fields = ['name']


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'leave_type', 'year', 'entitled_days',
        'used_days', 'carried_over', 'remaining_days',
    ]
    list_filter = ['year', 'leave_type']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
    raw_id_fields = ['employee']


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'leave_type', 'start_date', 'end_date',
        'total_days', 'status', 'approved_by',
    ]
    list_filter = ['status', 'leave_type', 'start_date']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
    raw_id_fields = ['employee', 'approved_by', 'delegate_to']
    date_hierarchy = 'start_date'
    fieldsets = (
        ('Request Info', {
            'fields': ('employee', 'leave_type', 'start_date', 'end_date', 'total_days', 'reason')
        }),
        ('Status', {
            'fields': ('status', 'approved_by', 'approved_at', 'rejection_reason')
        }),
        ('Additional', {
            'fields': ('attachment', 'delegate_to', 'emergency_contact_name', 'emergency_contact_phone'),
            'classes': ('collapse',)
        }),
    )
