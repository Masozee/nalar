from rest_framework import serializers
from .models import LeavePolicy, LeaveBalance, LeaveRequest


class LeavePolicySerializer(serializers.ModelSerializer):
    leave_type_display = serializers.CharField(source='get_leave_type_display', read_only=True)

    class Meta:
        model = LeavePolicy
        fields = [
            'id', 'name', 'leave_type', 'leave_type_display', 'year',
            'default_days', 'max_carry_over', 'requires_approval',
            'requires_document', 'min_days_notice', 'description',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeaveBalanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    leave_type_display = serializers.CharField(source='get_leave_type_display', read_only=True)
    remaining_days = serializers.DecimalField(max_digits=5, decimal_places=1, read_only=True)

    class Meta:
        model = LeaveBalance
        fields = [
            'id', 'employee', 'employee_name', 'leave_type', 'leave_type_display',
            'year', 'entitled_days', 'used_days', 'carried_over', 'remaining_days',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    leave_type_display = serializers.CharField(source='get_leave_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    delegate_to_name = serializers.CharField(source='delegate_to.full_name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name', 'leave_type', 'leave_type_display',
            'start_date', 'end_date', 'total_days', 'reason',
            'status', 'status_display',
            'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason',
            'attachment', 'emergency_contact_name', 'emergency_contact_phone',
            'delegate_to', 'delegate_to_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'approved_by', 'approved_at', 'created_at', 'updated_at']


class LeaveRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = [
            'leave_type', 'start_date', 'end_date', 'reason',
            'attachment', 'emergency_contact_name', 'emergency_contact_phone',
            'delegate_to',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        employee = getattr(request.user, 'employee', None)
        if not employee:
            raise serializers.ValidationError('User is not linked to an employee')

        leave_request = LeaveRequest.objects.create(
            employee=employee,
            **validated_data
        )
        leave_request.calculate_total_days()
        leave_request.save()
        return leave_request


class LeaveApprovalSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
