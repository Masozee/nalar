from rest_framework import serializers
from .models import Attendance, AttendanceSummary


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'date', 'check_in', 'check_out',
            'status', 'status_display', 'work_hours', 'overtime_hours', 'notes',
            'check_in_location', 'check_out_location',
            'check_in_latitude', 'check_in_longitude',
            'check_out_latitude', 'check_out_longitude',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttendanceCheckInSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False)
    location = serializers.CharField(max_length=255, required=False)


class AttendanceCheckOutSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False)
    location = serializers.CharField(max_length=255, required=False)


class AttendanceSummarySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = AttendanceSummary
        fields = [
            'id', 'employee', 'employee_name', 'year', 'month',
            'total_days', 'present_days', 'absent_days', 'late_days',
            'leave_days', 'sick_days', 'wfh_days',
            'total_work_hours', 'total_overtime_hours',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
