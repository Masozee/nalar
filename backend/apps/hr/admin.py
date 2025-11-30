from django.contrib import admin
from .models import Employee, EmployeeFamily, EmployeeEducation, EmployeeWorkHistory

# Import submodule admins to register them
from .attendance import admin as attendance_admin  # noqa
from .leave import admin as leave_admin  # noqa
from .payroll_light import admin as payroll_admin  # noqa


class EmployeeFamilyInline(admin.TabularInline):
    model = EmployeeFamily
    extra = 0


class EmployeeEducationInline(admin.TabularInline):
    model = EmployeeEducation
    extra = 0


class EmployeeWorkHistoryInline(admin.TabularInline):
    model = EmployeeWorkHistory
    extra = 0


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = [
        'employee_id', 'full_name', 'employment_type',
        'employment_status', 'department', 'position',
    ]
    list_filter = ['employment_type', 'employment_status', 'department']
    search_fields = ['employee_id', 'first_name', 'last_name', 'personal_email']
    inlines = [EmployeeFamilyInline, EmployeeEducationInline, EmployeeWorkHistoryInline]
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'employee_id', 'first_name', 'last_name', 'avatar')
        }),
        ('Personal Details', {
            'fields': (
                'gender', 'date_of_birth', 'place_of_birth',
                'nationality', 'national_id', 'tax_id', 'marital_status'
            )
        }),
        ('Contact', {
            'fields': ('personal_email', 'phone', 'mobile', 'address', 'city', 'postal_code')
        }),
        ('Employment', {
            'fields': (
                'employment_type', 'employment_status', 'department',
                'position', 'job_title', 'supervisor'
            )
        }),
        ('Dates', {
            'fields': ('join_date', 'contract_start_date', 'contract_end_date', 'termination_date')
        }),
        ('Banking', {
            'fields': ('bank_name', 'bank_account_number', 'bank_account_name'),
            'classes': ('collapse',)
        }),
        ('Office', {
            'fields': ('room_number', 'phone_extension', 'printer_id', 'workstation_id')
        }),
    )


@admin.register(EmployeeFamily)
class EmployeeFamilyAdmin(admin.ModelAdmin):
    list_display = ['employee', 'name', 'relation', 'is_emergency_contact', 'is_dependent']
    list_filter = ['relation', 'is_emergency_contact', 'is_dependent']
    search_fields = ['name', 'employee__first_name', 'employee__last_name']
