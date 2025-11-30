from django.contrib import admin
from .models import Attendance, AttendanceSummary


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'date', 'status', 'check_in', 'check_out',
        'work_hours', 'overtime_hours',
    ]
    list_filter = ['status', 'date']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
    date_hierarchy = 'date'
    raw_id_fields = ['employee']
    fieldsets = (
        ('Basic Info', {
            'fields': ('employee', 'date', 'status')
        }),
        ('Time', {
            'fields': ('check_in', 'check_out', 'work_hours', 'overtime_hours')
        }),
        ('Location', {
            'fields': (
                'check_in_location', 'check_out_location',
                'check_in_latitude', 'check_in_longitude',
                'check_out_latitude', 'check_out_longitude',
            ),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )


@admin.register(AttendanceSummary)
class AttendanceSummaryAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'year', 'month', 'present_days', 'absent_days',
        'late_days', 'leave_days', 'total_work_hours',
    ]
    list_filter = ['year', 'month']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
    raw_id_fields = ['employee']
