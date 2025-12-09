from datetime import date
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes

from .models import Attendance, AttendanceSummary, AttendanceStatus
from .serializers import (
    AttendanceSerializer,
    AttendanceCheckInSerializer,
    AttendanceCheckOutSerializer,
    AttendanceSummarySerializer,
)
from apps.hr.serializers import FaceAttendanceSerializer
from apps.hr.services.face_recognition import face_service
from apps.hr.models import Employee


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    filterset_fields = ['employee', 'date', 'status']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']

    @action(detail=False, methods=['post'])
    def check_in(self, request):
        """Check in for today."""
        serializer = AttendanceCheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        employee = getattr(request.user, 'employee', None)
        if not employee:
            return Response(
                {'error': 'User is not linked to an employee'},
                status=status.HTTP_400_BAD_REQUEST
            )

        today = date.today()
        attendance, created = Attendance.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={
                'check_in': timezone.now(),
                'check_in_latitude': serializer.validated_data.get('latitude'),
                'check_in_longitude': serializer.validated_data.get('longitude'),
                'check_in_location': serializer.validated_data.get('location', ''),
                'status': AttendanceStatus.PRESENT,
            }
        )

        if not created and attendance.check_in:
            return Response(
                {'error': 'Already checked in today'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not created:
            attendance.check_in = timezone.now()
            attendance.check_in_latitude = serializer.validated_data.get('latitude')
            attendance.check_in_longitude = serializer.validated_data.get('longitude')
            attendance.check_in_location = serializer.validated_data.get('location', '')
            attendance.save()

        return Response(AttendanceSerializer(attendance).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def check_out(self, request):
        """Check out for today."""
        serializer = AttendanceCheckOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        employee = getattr(request.user, 'employee', None)
        if not employee:
            return Response(
                {'error': 'User is not linked to an employee'},
                status=status.HTTP_400_BAD_REQUEST
            )

        today = date.today()
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response(
                {'error': 'No check-in record for today'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if attendance.check_out:
            return Response(
                {'error': 'Already checked out today'},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance.check_out = timezone.now()
        attendance.check_out_latitude = serializer.validated_data.get('latitude')
        attendance.check_out_longitude = serializer.validated_data.get('longitude')
        attendance.check_out_location = serializer.validated_data.get('location', '')
        attendance.calculate_work_hours()
        attendance.save()

        return Response(AttendanceSerializer(attendance).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def my_attendance(self, request):
        """Get current user's attendance records."""
        employee = getattr(request.user, 'employee', None)
        if not employee:
            return Response(
                {'error': 'User is not linked to an employee'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.queryset.filter(employee=employee)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Face Recognition Check-In",
        description="""
        Check in using face recognition.

        The system will:
        1. Detect face in the uploaded image
        2. Match against all registered employee faces
        3. Create attendance record if match found
        4. Record location if provided

        **Requirements:**
        - Employee must have registered face
        - Image must contain a clear face
        - Confidence must be above threshold (60%)
        """,
        request=FaceAttendanceSerializer,
        responses={
            200: AttendanceSerializer,
            400: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
        },
        tags=["HR - Attendance"],
    )
    @action(
        detail=False,
        methods=['post'],
        parser_classes=[MultiPartParser, FormParser],
        url_path='face-check-in'
    )
    def face_check_in(self, request):
        """Check in using face recognition with AWS Rekognition."""
        serializer = FaceAttendanceSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        face_image = serializer.validated_data['face_image']

        try:
            # Read verification image
            verification_bytes = face_service.read_image_file(face_image)

            # Detect face first
            detection = face_service.detect_faces(verification_bytes)
            if not detection['success'] or detection['face_count'] == 0:
                return Response({
                    'error': 'No face detected',
                    'message': 'Please ensure your face is clearly visible in the photo.'
                }, status=status.HTTP_400_BAD_REQUEST)

            if detection['face_count'] > 1:
                return Response({
                    'error': 'Multiple faces detected',
                    'message': 'Please ensure only one person is in the photo.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Find matching employee
            result = face_service.find_matching_employee(
                verification_bytes,
                Employee.objects.all(),
                threshold=90.0
            )

            if not result:
                return Response({
                    'error': 'No matching employee found',
                    'message': 'Face not recognized. Please ensure you have registered your face.'
                }, status=status.HTTP_404_NOT_FOUND)

            employee, similarity = result

            # Check if already checked in today
            today = date.today()
            attendance, created = Attendance.objects.get_or_create(
                employee=employee,
                date=today,
                defaults={
                    'check_in': timezone.now(),
                    'check_in_latitude': serializer.validated_data.get('latitude'),
                    'check_in_longitude': serializer.validated_data.get('longitude'),
                    'check_in_location': serializer.validated_data.get('location', ''),
                    'status': AttendanceStatus.PRESENT,
                }
            )

            if not created and attendance.check_in:
                return Response(
                    {
                        'error': 'Already checked in today',
                        'attendance': AttendanceSerializer(attendance).data
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not created:
                attendance.check_in = timezone.now()
                attendance.check_in_latitude = serializer.validated_data.get('latitude')
                attendance.check_in_longitude = serializer.validated_data.get('longitude')
                attendance.check_in_location = serializer.validated_data.get('location', '')
                attendance.save()

            return Response({
                'success': True,
                'message': f'Check-in successful! Welcome {employee.full_name}',
                'employee': {
                    'id': str(employee.id),
                    'employee_id': employee.employee_id,
                    'full_name': employee.full_name,
                    'department': employee.department.name if employee.department else None,
                },
                'similarity': similarity,
                'attendance': AttendanceSerializer(attendance).data
            })

        except Exception as e:
            return Response(
                {'error': f'Face check-in failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Face Recognition Check-Out",
        description="""
        Check out using face recognition.

        Similar to check-in but for checking out:
        1. Detect and match face
        2. Update attendance record with check-out time
        3. Calculate work hours
        """,
        request=FaceAttendanceSerializer,
        responses={
            200: AttendanceSerializer,
            400: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
        },
        tags=["HR - Attendance"],
    )
    @action(
        detail=False,
        methods=['post'],
        parser_classes=[MultiPartParser, FormParser],
        url_path='face-check-out'
    )
    def face_check_out(self, request):
        """Check out using face recognition with AWS Rekognition."""
        serializer = FaceAttendanceSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        face_image = serializer.validated_data['face_image']

        try:
            # Read verification image
            verification_bytes = face_service.read_image_file(face_image)

            # Detect face first
            detection = face_service.detect_faces(verification_bytes)
            if not detection['success'] or detection['face_count'] == 0:
                return Response({
                    'error': 'No face detected',
                    'message': 'Please ensure your face is clearly visible in the photo.'
                }, status=status.HTTP_400_BAD_REQUEST)

            if detection['face_count'] > 1:
                return Response({
                    'error': 'Multiple faces detected',
                    'message': 'Please ensure only one person is in the photo.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Find matching employee
            result = face_service.find_matching_employee(
                verification_bytes,
                Employee.objects.all(),
                threshold=90.0
            )

            if not result:
                return Response({
                    'error': 'No matching employee found',
                    'message': 'Face not recognized.'
                }, status=status.HTTP_404_NOT_FOUND)

            employee, similarity = result

            # Get today's attendance
            today = date.today()
            try:
                attendance = Attendance.objects.get(employee=employee, date=today)
            except Attendance.DoesNotExist:
                return Response(
                    {'error': 'No check-in record for today'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if attendance.check_out:
                return Response(
                    {
                        'error': 'Already checked out today',
                        'attendance': AttendanceSerializer(attendance).data
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update check-out
            attendance.check_out = timezone.now()
            attendance.check_out_latitude = serializer.validated_data.get('latitude')
            attendance.check_out_longitude = serializer.validated_data.get('longitude')
            attendance.check_out_location = serializer.validated_data.get('location', '')
            attendance.calculate_work_hours()
            attendance.save()

            return Response({
                'success': True,
                'message': f'Check-out successful! Goodbye {employee.full_name}',
                'employee': {
                    'id': str(employee.id),
                    'employee_id': employee.employee_id,
                    'full_name': employee.full_name,
                    'department': employee.department.name if employee.department else None,
                },
                'similarity': similarity,
                'work_hours': float(attendance.work_hours) if attendance.work_hours else 0,
                'attendance': AttendanceSerializer(attendance).data
            })

        except Exception as e:
            return Response(
                {'error': f'Face check-out failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AttendanceSummaryViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSummary.objects.select_related('employee').all()
    serializer_class = AttendanceSummarySerializer
    filterset_fields = ['employee', 'year', 'month']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
