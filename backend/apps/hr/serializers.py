from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Employee, EmployeeFamily, EmployeeEducation, EmployeeWorkHistory
from .services.face_recognition import face_service

User = get_user_model()


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

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
        help_text="Optional: Link employee to a user account"
    )
    employee_id = serializers.CharField(
        required=False,
        help_text="Auto-generated if not provided"
    )

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

    def create(self, validated_data):
        """Create employee with auto-generated employee_id if not provided."""
        if not validated_data.get('employee_id'):
            # Get tenant from request context
            request = self.context.get('request')
            tenant = request.tenant if hasattr(request, 'tenant') else None

            # Generate employee_id based on count in tenant
            if tenant:
                count = Employee.objects.filter(tenant=tenant).count() + 1
                validated_data['employee_id'] = f'EMP{count:05d}'
            else:
                # Fallback if no tenant context
                import uuid
                validated_data['employee_id'] = f'EMP{uuid.uuid4().hex[:8].upper()}'

        return super().create(validated_data)


class FaceRegistrationSerializer(serializers.Serializer):
    """Serializer for registering employee face with AWS Rekognition."""
    face_image = serializers.ImageField(required=True, help_text="Clear photo of employee's face")

    def validate_face_image(self, value):
        """Validate that the image contains exactly one face using AWS Rekognition."""
        try:
            image_bytes = face_service.read_image_file(value)
            detection = face_service.detect_faces(image_bytes)

            if not detection['success']:
                raise serializers.ValidationError(
                    f"Face detection failed: {detection.get('error', 'Unknown error')}"
                )

            if detection['face_count'] == 0:
                raise serializers.ValidationError(
                    "No face detected in the image. Please provide a clear photo with your face."
                )

            if detection['face_count'] > 1:
                raise serializers.ValidationError(
                    "Multiple faces detected. Please provide a photo with only one person."
                )

            return value
        except Exception as e:
            raise serializers.ValidationError(f"Face validation failed: {str(e)}")

    def save(self, employee):
        """Save face image to employee (AWS Rekognition doesn't need encoding storage)."""
        face_image = self.validated_data['face_image']

        try:
            # Save to employee (AWS Rekognition will compare on-demand, no need to store encoding)
            employee.face_image = face_image
            employee.face_registered = True
            employee.save()

            return employee
        except Exception as e:
            raise serializers.ValidationError(f"Failed to register face: {str(e)}")


class FaceVerificationSerializer(serializers.Serializer):
    """Serializer for verifying face against known employee using AWS Rekognition."""
    face_image = serializers.ImageField(required=True, help_text="Photo to verify")
    employee_id = serializers.CharField(
        required=False,
        help_text="Optional: Employee ID to verify against specific employee"
    )

    def validate_face_image(self, value):
        """Validate that the image contains a face using AWS Rekognition."""
        try:
            image_bytes = face_service.read_image_file(value)
            detection = face_service.detect_faces(image_bytes)

            if not detection['success']:
                raise serializers.ValidationError(
                    f"Face detection failed: {detection.get('error', 'Unknown error')}"
                )

            if detection['face_count'] == 0:
                raise serializers.ValidationError("No face detected in the image.")

            return value
        except Exception as e:
            raise serializers.ValidationError(f"Face validation failed: {str(e)}")


class FaceAttendanceSerializer(serializers.Serializer):
    """Serializer for face-based attendance check-in/out using AWS Rekognition."""
    face_image = serializers.ImageField(required=True, help_text="Employee face photo")
    latitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        required=False,
        allow_null=True
    )
    longitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        required=False,
        allow_null=True
    )
    location = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Location name/address"
    )
