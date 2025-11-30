from rest_framework import serializers
from .models import SalaryComponent, PayrollPeriod, Payslip, PayslipItem


class SalaryComponentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = SalaryComponent
        fields = [
            'id', 'employee', 'employee_name', 'component_type', 'component_name',
            'amount', 'is_fixed', 'effective_date', 'end_date',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PayrollPeriodSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = PayrollPeriod
        fields = [
            'id', 'year', 'month', 'start_date', 'end_date',
            'status', 'status_display', 'notes',
            'total_employees', 'total_gross', 'total_deductions', 'total_net',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'total_employees', 'total_gross', 'total_deductions', 'total_net', 'created_at', 'updated_at']


class PayslipItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayslipItem
        fields = ['id', 'item_type', 'name', 'amount', 'description']
        read_only_fields = ['id']


class PayslipSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id_number = serializers.CharField(source='employee.employee_id', read_only=True)
    period_display = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items = PayslipItemSerializer(many=True, read_only=True)

    class Meta:
        model = Payslip
        fields = [
            'id', 'payroll_period', 'period_display', 'employee', 'employee_name', 'employee_id_number',
            'basic_salary', 'total_allowances', 'total_deductions',
            'overtime_pay', 'gross_salary', 'net_salary',
            'working_days', 'present_days', 'absent_days', 'overtime_hours',
            'payment_date', 'payment_method', 'payment_reference',
            'status', 'status_display', 'notes', 'items',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'gross_salary', 'net_salary', 'created_at', 'updated_at']

    def get_period_display(self, obj):
        return f"{obj.payroll_period.month}/{obj.payroll_period.year}"


class PayslipSummarySerializer(serializers.ModelSerializer):
    """Simplified payslip for list view."""
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    period_display = serializers.SerializerMethodField()

    class Meta:
        model = Payslip
        fields = [
            'id', 'employee', 'employee_name', 'period_display',
            'gross_salary', 'net_salary', 'status',
        ]

    def get_period_display(self, obj):
        return f"{obj.payroll_period.month}/{obj.payroll_period.year}"
