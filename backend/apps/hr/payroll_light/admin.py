from django.contrib import admin
from .models import SalaryComponent, PayrollPeriod, Payslip, PayslipItem


class PayslipItemInline(admin.TabularInline):
    model = PayslipItem
    extra = 0


@admin.register(SalaryComponent)
class SalaryComponentAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'component_type', 'component_name',
        'amount', 'is_fixed', 'effective_date',
    ]
    list_filter = ['component_type', 'is_fixed', 'effective_date']
    search_fields = ['employee__first_name', 'employee__last_name', 'component_name']
    raw_id_fields = ['employee']


@admin.register(PayrollPeriod)
class PayrollPeriodAdmin(admin.ModelAdmin):
    list_display = [
        'year', 'month', 'status', 'total_employees',
        'total_gross', 'total_net',
    ]
    list_filter = ['year', 'status']
    search_fields = ['year', 'month']
    fieldsets = (
        ('Period Info', {
            'fields': ('year', 'month', 'start_date', 'end_date', 'status')
        }),
        ('Summary', {
            'fields': ('total_employees', 'total_gross', 'total_deductions', 'total_net')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'payroll_period', 'basic_salary',
        'gross_salary', 'net_salary', 'status',
    ]
    list_filter = ['payroll_period', 'status']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
    raw_id_fields = ['employee', 'payroll_period']
    inlines = [PayslipItemInline]
    fieldsets = (
        ('Basic Info', {
            'fields': ('payroll_period', 'employee', 'status')
        }),
        ('Salary', {
            'fields': ('basic_salary', 'total_allowances', 'total_deductions',
                      'overtime_pay', 'gross_salary', 'net_salary')
        }),
        ('Work Details', {
            'fields': ('working_days', 'present_days', 'absent_days', 'overtime_hours')
        }),
        ('Payment', {
            'fields': ('payment_date', 'payment_method', 'payment_reference'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )


@admin.register(PayslipItem)
class PayslipItemAdmin(admin.ModelAdmin):
    list_display = ['payslip', 'item_type', 'name', 'amount']
    list_filter = ['item_type']
    search_fields = ['name', 'payslip__employee__first_name', 'payslip__employee__last_name']
    raw_id_fields = ['payslip']
