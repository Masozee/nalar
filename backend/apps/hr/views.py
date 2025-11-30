from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from apps.common.cache import cache_api_response, invalidate_cache
from .models import Employee, EmployeeFamily, EmployeeEducation, EmployeeWorkHistory
from .serializers import (
    EmployeeListSerializer,
    EmployeeDetailSerializer,
    EmployeeCreateUpdateSerializer,
    EmployeeFamilySerializer,
    EmployeeEducationSerializer,
    EmployeeWorkHistorySerializer,
)


class EmployeeViewSet(viewsets.ModelViewSet):
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

    @action(detail=False, methods=['get'])
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
