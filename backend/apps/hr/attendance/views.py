from datetime import date
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Attendance, AttendanceSummary, AttendanceStatus
from .serializers import (
    AttendanceSerializer,
    AttendanceCheckInSerializer,
    AttendanceCheckOutSerializer,
    AttendanceSummarySerializer,
)


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


class AttendanceSummaryViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSummary.objects.select_related('employee').all()
    serializer_class = AttendanceSummarySerializer
    filterset_fields = ['employee', 'year', 'month']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
