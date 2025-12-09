"""Dashboard analytics API views."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, F, Sum
from django.db.models.functions import TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta

from apps.organization.models import Department, Position
from apps.hr.models import Employee
from apps.research.publication.models import Publication, PublicationType, PublicationStatus
from apps.tenants.models import TenantUser


class DashboardViewSet(viewsets.ViewSet):
    """
    Dashboard analytics endpoints.

    Provides aggregated data for dashboard visualizations:
    - Organization overview
    - Publication statistics
    - Employee demographics
    - Department distribution
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def organization_overview(self, request):
        """
        Get organization overview statistics.

        Returns:
            - total_employees
            - total_departments
            - total_positions
            - total_publications
            - employees_by_status
            - employees_by_type
        """
        # Get current tenant
        tenant_user = TenantUser.objects.filter(
            user=request.user,
            is_active=True
        ).select_related('tenant').first()

        if not tenant_user:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        tenant = tenant_user.tenant

        # Total counts
        total_employees = Employee.objects.filter(tenant=tenant, is_active=True).count()
        total_departments = Department.objects.filter(tenant=tenant, is_active=True).count()
        total_positions = Position.objects.filter(tenant=tenant, is_active=True).count()
        total_publications = Publication.objects.filter(
            tenant=tenant,
            is_active=True,
            status=PublicationStatus.PUBLISHED
        ).count()

        # Employees by status
        employees_by_status = list(
            Employee.objects.filter(tenant=tenant, is_active=True)
            .values('employment_status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Employees by type
        employees_by_type = list(
            Employee.objects.filter(tenant=tenant, is_active=True)
            .values('employment_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return Response({
            'total_employees': total_employees,
            'total_departments': total_departments,
            'total_positions': total_positions,
            'total_publications': total_publications,
            'employees_by_status': employees_by_status,
            'employees_by_type': employees_by_type,
        })

    @action(detail=False, methods=['get'])
    def publications_stats(self, request):
        """
        Get publications statistics for charts.

        Returns:
            - publications_by_type (pie chart data)
            - publications_by_year (bar chart data)
            - publications_by_status (pie chart data)
            - publications_by_indexation (bar chart data)
            - monthly_trend (area chart data - last 12 months)
        """
        tenant_user = TenantUser.objects.filter(
            user=request.user,
            is_active=True
        ).select_related('tenant').first()

        if not tenant_user:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        tenant = tenant_user.tenant

        # Publications by type
        publications_by_type = list(
            Publication.objects.filter(tenant=tenant, is_active=True)
            .values('publication_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Publications by year (last 5 years)
        current_year = timezone.now().year
        publications_by_year = list(
            Publication.objects.filter(
                tenant=tenant,
                is_active=True,
                year__gte=current_year - 4,
                year__isnull=False
            )
            .values('year')
            .annotate(count=Count('id'))
            .order_by('year')
        )

        # Publications by status
        publications_by_status = list(
            Publication.objects.filter(tenant=tenant, is_active=True)
            .values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Publications by indexation
        publications_by_indexation = list(
            Publication.objects.filter(tenant=tenant, is_active=True)
            .values('indexation')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Monthly trend (last 12 months)
        twelve_months_ago = timezone.now() - timedelta(days=365)
        monthly_trend = list(
            Publication.objects.filter(
                tenant=tenant,
                is_active=True,
                created_at__gte=twelve_months_ago
            )
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        # Recent publications (last 10)
        recent_publications = Publication.objects.filter(
            tenant=tenant,
            is_active=True,
            status=PublicationStatus.PUBLISHED
        ).select_related('created_by').order_by('-publication_date')[:10].values(
            'id',
            'title',
            'publication_type',
            'publication_date',
            'journal_name',
            'indexation',
            'citation_count'
        )

        return Response({
            'publications_by_type': publications_by_type,
            'publications_by_year': publications_by_year,
            'publications_by_status': publications_by_status,
            'publications_by_indexation': publications_by_indexation,
            'monthly_trend': monthly_trend,
            'recent_publications': list(recent_publications),
        })

    @action(detail=False, methods=['get'])
    def department_stats(self, request):
        """
        Get department statistics.

        Returns:
            - departments_by_employee_count (bar chart)
            - top_departments (list)
            - department_hierarchy
        """
        tenant_user = TenantUser.objects.filter(
            user=request.user,
            is_active=True
        ).select_related('tenant').first()

        if not tenant_user:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        tenant = tenant_user.tenant

        # Departments by employee count
        departments_with_counts = list(
            Department.objects.filter(tenant=tenant, is_active=True)
            .annotate(employee_count=Count('employees', filter=Q(employees__is_active=True)))
            .values('id', 'name', 'code', 'employee_count')
            .order_by('-employee_count')[:10]
        )

        # Top 5 departments
        top_departments = departments_with_counts[:5]

        # Department hierarchy (for tree visualization)
        root_departments = Department.objects.filter(
            tenant=tenant,
            is_active=True,
            parent__isnull=True
        ).prefetch_related('children')

        def build_hierarchy(dept):
            return {
                'id': str(dept.id),
                'name': dept.name,
                'code': dept.code,
                'employee_count': dept.employees.filter(is_active=True).count(),
                'children': [build_hierarchy(child) for child in dept.children.filter(is_active=True)]
            }

        department_hierarchy = [build_hierarchy(dept) for dept in root_departments]

        return Response({
            'departments_by_employee_count': departments_with_counts,
            'top_departments': top_departments,
            'department_hierarchy': department_hierarchy,
        })

    @action(detail=False, methods=['get'])
    def employee_demographics(self, request):
        """
        Get employee demographic statistics.

        Returns:
            - employees_by_gender (pie chart)
            - employees_by_age_group (bar chart)
            - employees_by_tenure (area chart)
            - employees_by_department (bar chart)
        """
        tenant_user = TenantUser.objects.filter(
            user=request.user,
            is_active=True
        ).select_related('tenant').first()

        if not tenant_user:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        tenant = tenant_user.tenant

        # Employees by gender
        employees_by_gender = list(
            Employee.objects.filter(tenant=tenant, is_active=True, gender__isnull=False)
            .exclude(gender='')
            .values('gender')
            .annotate(count=Count('id'))
        )

        # Employees by department (top 10)
        employees_by_department = list(
            Employee.objects.filter(tenant=tenant, is_active=True, department__isnull=False)
            .values(department_name=F('department__name'))
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        # Join date trend (last 24 months)
        two_years_ago = timezone.now() - timedelta(days=730)
        join_date_trend = list(
            Employee.objects.filter(
                tenant=tenant,
                is_active=True,
                join_date__gte=two_years_ago,
                join_date__isnull=False
            )
            .annotate(month=TruncMonth('join_date'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        return Response({
            'employees_by_gender': employees_by_gender,
            'employees_by_department': employees_by_department,
            'join_date_trend': join_date_trend,
        })
