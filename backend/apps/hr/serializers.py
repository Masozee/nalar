from rest_framework import serializers
from .models import Employee, EmployeeFamily, EmployeeEducation, EmployeeWorkHistory


class EmployeeFamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeFamily
        fields = [
            'id', 'name', 'relation', 'gender', 'date_of_birth',
            'phone', 'is_emergency_contact', 'is_dependent', 'occupation',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeEducation
        fields = [
            'id', 'institution', 'degree', 'field_of_study',
            'start_date', 'end_date', 'grade', 'description',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeWorkHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeWorkHistory
        fields = [
            'id', 'company', 'position', 'start_date', 'end_date',
            'responsibilities', 'reason_for_leaving',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    full_name = serializers.CharField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'full_name', 'first_name', 'last_name',
            'employment_type', 'employment_status', 'department_name',
            'position', 'job_title',
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    """Full serializer with nested relations."""
    full_name = serializers.CharField(read_only=True)
    family_members = EmployeeFamilySerializer(many=True, read_only=True)
    education_history = EmployeeEducationSerializer(many=True, read_only=True)
    work_history = EmployeeWorkHistorySerializer(many=True, read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.full_name', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'employee_id',
            # Personal
            'first_name', 'last_name', 'full_name', 'gender',
            'date_of_birth', 'place_of_birth', 'nationality',
            'national_id', 'tax_id', 'marital_status',
            # Contact
            'personal_email', 'phone', 'mobile', 'address', 'city', 'postal_code',
            # Employment
            'employment_type', 'employment_status', 'department', 'department_name',
            'position', 'job_title', 'supervisor', 'supervisor_name',
            # Dates
            'join_date', 'contract_start_date', 'contract_end_date', 'termination_date',
            # Documents
            'avatar',
            # Banking
            'bank_name', 'bank_account_number', 'bank_account_name',
            # Nested
            'family_members', 'education_history', 'work_history',
            # Timestamps
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating employees."""

    class Meta:
        model = Employee
        fields = [
            'user', 'employee_id',
            # Personal
            'first_name', 'last_name', 'gender',
            'date_of_birth', 'place_of_birth', 'nationality',
            'national_id', 'tax_id', 'marital_status',
            # Contact
            'personal_email', 'phone', 'mobile', 'address', 'city', 'postal_code',
            # Employment
            'employment_type', 'employment_status', 'department',
            'position', 'job_title', 'supervisor',
            # Dates
            'join_date', 'contract_start_date', 'contract_end_date',
            # Documents
            'avatar',
            # Banking
            'bank_name', 'bank_account_number', 'bank_account_name',
        ]
