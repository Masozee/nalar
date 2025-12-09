from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from apps.common.cache import cache_api_response, invalidate_cache
from .models import Employee, EmployeeFamily, EmployeeEducation, EmployeeWorkHistory
from .serializers import (
    EmployeeListSerializer,
    EmployeeDetailSerializer,
    EmployeeCreateUpdateSerializer,
    EmployeeFamilySerializer,
    EmployeeEducationSerializer,
    EmployeeWorkHistorySerializer,
    FaceRegistrationSerializer,
    FaceVerificationSerializer,
)
from .services import face_service


@extend_schema_view(
    list=extend_schema(
        summary="List Employees",
        description="""
        Get a paginated list of all employees in the organization.

        **Features:**
        - Cached for 5 minutes for performance
        - Includes department and supervisor information
        - Supports filtering and searching
        - Sorted by employee number

        **Use Cases:**
        - Employee directory
        - HR dashboard
        - Org chart building
        - Report generation
        """,
        tags=["HR - Employees"],
    ),
    retrieve=extend_schema(
        summary="Get Employee Details",
        description="""
        Retrieve complete employee profile including personal info, work history,
        education, and family details.

        **Cached for 10 minutes**
        """,
        tags=["HR - Employees"],
    ),
    create=extend_schema(
        summary="Create New Employee",
        description="Add a new employee to the system with complete profile information.",
        tags=["HR - Employees"],
    ),
    update=extend_schema(
        summary="Update Employee",
        description="Update employee information (full update).",
        tags=["HR - Employees"],
    ),
    partial_update=extend_schema(
        summary="Partially Update Employee",
        description="Update specific employee fields (partial update).",
        tags=["HR - Employees"],
    ),
    destroy=extend_schema(
        summary="Delete Employee",
        description="Remove employee from the system (soft delete recommended).",
        tags=["HR - Employees"],
    ),
)
class EmployeeViewSet(viewsets.ModelViewSet):
    """
    **Employee Management**

    Comprehensive employee lifecycle management including onboarding, profile management,
    and offboarding. Maintains complete employee records with work history, education,
    and family information.

    **Key Features:**
    - Employee directory and profiles
    - Department and position tracking
    - Work history and education records
    - Family and emergency contact information
    - Performance caching for fast retrieval
    """

    queryset = Employee.objects.select_related('department', 'supervisor').all()
    permission_classes = [permissions.IsAuthenticated]

    @cache_api_response(timeout=300, key_prefix='employees')
    def list(self, request, *args, **kwargs):
        """List employees with caching (5 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='employee_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve employee detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create employee and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('employees:*')

    def perform_update(self, serializer):
        """Update employee and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('employees:*')
        invalidate_cache('employee_detail:*')

    def perform_destroy(self, instance):
        """Delete employee and invalidate cache"""
        super().perform_destroy(instance)
        invalidate_cache('employees:*')
        invalidate_cache('employee_detail:*')

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return EmployeeCreateUpdateSerializer
        return EmployeeDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by employment type
        employment_type = self.request.query_params.get('employment_type')
        if employment_type:
            queryset = queryset.filter(employment_type=employment_type)

        # Filter by employment status
        employment_status = self.request.query_params.get('employment_status')
        if employment_status:
            queryset = queryset.filter(employment_status=employment_status)

        # Filter by department
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department_id=department)

        return queryset

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """Get current user's employee profile."""
        try:
            employee = Employee.objects.get(user=request.user)
            serializer = EmployeeDetailSerializer(employee)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response(
                {'detail': 'Employee profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(
        detail=False,
        methods=['post'],
        parser_classes=[MultiPartParser, FormParser],
        url_path='me/register-face'
    )
    def register_my_face(self, request):
        """Register face for current user's employee profile."""
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response(
                {'detail': 'Employee profile not found. Please contact HR.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = FaceRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(employee=employee)
                invalidate_cache('employees:*')
                invalidate_cache('employee_detail:*')

                return Response({
                    'success': True,
                    'message': 'Face registered successfully! You can now use face recognition for attendance.',
                    'employee': EmployeeDetailSerializer(employee).data
                })
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Register Face for Employee",
        description="""
        Register face recognition for an employee.

        Upload a clear photo of the employee's face. The system will:
        1. Detect the face in the image
        2. Extract facial features (encoding)
        3. Store the encoding for future recognition

        **Requirements:**
        - Image must contain exactly one face
        - Face should be clearly visible and well-lit
        - Face should be looking at the camera

        **Tips for best results:**
        - Good lighting (avoid shadows)
        - Neutral expression
        - Remove glasses if possible
        - No hat or face coverings
        """,
        request=FaceRegistrationSerializer,
        responses={
            200: EmployeeDetailSerializer,
            400: OpenApiTypes.OBJECT,
        },
        tags=["HR - Face Recognition"],
    )
    @action(
        detail=True,
        methods=['post'],
        parser_classes=[MultiPartParser, FormParser],
        url_path='register-face'
    )
    def register_face(self, request, pk=None):
        """Register face for employee."""
        employee = self.get_object()
        serializer = FaceRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            try:
                serializer.save(employee=employee)
                invalidate_cache('employees:*')
                invalidate_cache('employee_detail:*')

                return Response({
                    'success': True,
                    'message': 'Face registered successfully',
                    'employee': EmployeeDetailSerializer(employee).data
                })
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Remove Face Registration",
        description="Remove face recognition data from employee profile.",
        responses={200: OpenApiTypes.OBJECT},
        tags=["HR - Face Recognition"],
    )
    @action(
        detail=True,
        methods=['delete'],
        url_path='remove-face'
    )
    def remove_face(self, request, pk=None):
        """Remove face registration from employee."""
        employee = self.get_object()

        if not employee.face_registered:
            return Response(
                {'error': 'Employee does not have face registered'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Clear face data
        employee.face_image.delete(save=False)
        employee.face_image = None
        employee.face_encoding = ''
        employee.face_registered = False
        employee.save()

        invalidate_cache('employees:*')
        invalidate_cache('employee_detail:*')

        return Response({
            'success': True,
            'message': 'Face registration removed successfully'
        })

    @extend_schema(
        summary="Verify Face",
        description="""
        Verify if a face photo matches a specific employee or find matching employee.

        **Two modes:**
        1. Specific verification: Include employee_id to verify against specific employee
        2. General search: Omit employee_id to search across all registered employees

        Returns match status and confidence score.
        """,
        request=FaceVerificationSerializer,
        responses={
            200: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
        },
        tags=["HR - Face Recognition"],
    )
    @action(
        detail=False,
        methods=['post'],
        parser_classes=[MultiPartParser, FormParser],
        url_path='verify-face'
    )
    def verify_face(self, request):
        """Verify face against employee database."""
        serializer = FaceVerificationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        face_image = serializer.validated_data['face_image']
        employee_id = serializer.validated_data.get('employee_id')

        try:
            if employee_id:
                # Verify against specific employee
                try:
                    employee = Employee.objects.get(employee_id=employee_id)
                except Employee.DoesNotExist:
                    return Response(
                        {'error': 'Employee not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )

                if not employee.face_registered:
                    return Response(
                        {'error': 'Employee does not have face registered'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Compare faces using AWS Rekognition
                # Get employee's stored face image
                if not employee.face_image:
                    return Response(
                        {'error': 'Employee face image not found'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Read both images
                verification_bytes = face_service.read_image_file(face_image)
                employee_image_bytes = employee.face_image.read()

                # Compare using AWS Rekognition
                result = face_service.compare_faces(
                    employee_image_bytes,
                    verification_bytes,
                    similarity_threshold=90.0
                )

                if not result['success']:
                    return Response(
                        {'error': result.get('error', 'Face comparison failed')},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                return Response({
                    'match': result['match'],
                    'similarity': result['similarity'],
                    'confidence': result['confidence'],
                    'message': result['message'],
                    'employee': EmployeeListSerializer(employee).data if result['match'] else None
                })
            else:
                # Find matching employee from all registered faces
                verification_bytes = face_service.read_image_file(face_image)
                best_match = None
                best_similarity = 0

                # Compare against all employees with face registration
                for employee in Employee.objects.filter(face_registered=True):
                    if not employee.face_image:
                        continue

                    employee_image_bytes = employee.face_image.read()
                    result = face_service.compare_faces(
                        employee_image_bytes,
                        verification_bytes,
                        similarity_threshold=85.0  # Lower threshold for search
                    )

                    if result['success'] and result['match']:
                        if result['similarity'] > best_similarity:
                            best_similarity = result['similarity']
                            best_match = (employee, result)

                if best_match:
                    employee, match_result = best_match
                    return Response({
                        'match': True,
                        'similarity': match_result['similarity'],
                        'confidence': match_result['confidence'],
                        'message': f"Matched with {employee.get_full_name()}",
                        'employee': EmployeeListSerializer(employee).data
                    })
                else:
                    return Response({
                        'match': False,
                        'message': 'No matching employee found'
                    }, status=status.HTTP_404_NOT_FOUND)

        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Face verification failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EmployeeFamilyViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeFamilySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EmployeeFamily.objects.filter(
            employee_id=self.kwargs.get('employee_pk')
        )

    def perform_create(self, serializer):
        serializer.save(employee_id=self.kwargs.get('employee_pk'))


class EmployeeEducationViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeEducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EmployeeEducation.objects.filter(
            employee_id=self.kwargs.get('employee_pk')
        )

    def perform_create(self, serializer):
        serializer.save(employee_id=self.kwargs.get('employee_pk'))


class EmployeeWorkHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeWorkHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EmployeeWorkHistory.objects.filter(
            employee_id=self.kwargs.get('employee_pk')
        )

    def perform_create(self, serializer):
        serializer.save(employee_id=self.kwargs.get('employee_pk'))
