from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Department, Position, Team
from .serializers import (
    DepartmentSerializer,
    DepartmentTreeSerializer,
    PositionSerializer,
    TeamSerializer,
    TeamDetailSerializer,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.select_related('parent', 'head').all()
    serializer_class = DepartmentSerializer
    filterset_fields = ['parent', 'is_active']
    search_fields = ['name', 'code']

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get department hierarchy as tree."""
        root_departments = Department.objects.filter(
            parent__isnull=True,
            is_active=True,
        )
        serializer = DepartmentTreeSerializer(root_departments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def employees(self, request, pk=None):
        """Get employees in this department."""
        department = self.get_object()
        employees = department.employees.filter(is_active=True)
        return Response([
            {
                'id': str(e.id),
                'employee_id': e.employee_id,
                'name': e.full_name,
                'position': e.position,
            }
            for e in employees
        ])

    @action(detail=True, methods=['get'])
    def teams(self, request, pk=None):
        """Get teams in this department."""
        department = self.get_object()
        teams = department.teams.filter(is_active=True)
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)


class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.select_related('department').all()
    serializer_class = PositionSerializer
    filterset_fields = ['department', 'level', 'is_active']
    search_fields = ['name', 'code']


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.select_related('department', 'lead').prefetch_related('members').all()
    serializer_class = TeamSerializer
    filterset_fields = ['department', 'is_active']
    search_fields = ['name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TeamDetailSerializer
        return TeamSerializer

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the team."""
        from apps.users.models import User
        team = self.get_object()
        user_id = request.data.get('user_id')

        try:
            user = User.objects.get(id=user_id)
            team.members.add(user)
            return Response({'message': f'{user.email} added to team'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Remove a member from the team."""
        from apps.users.models import User
        team = self.get_object()
        user_id = request.data.get('user_id')

        try:
            user = User.objects.get(id=user_id)
            team.members.remove(user)
            return Response({'message': f'{user.email} removed from team'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class OrgChartView(APIView):
    """Get organizational chart based on employee supervisor hierarchy."""

    def get(self, request):
        from apps.hr.models import Employee

        def build_employee_node(employee):
            """Build a node for an employee with their subordinates."""
            subordinates = Employee.objects.filter(
                supervisor=employee,
                is_active=True,
            ).select_related('department')

            return {
                'id': str(employee.id),
                'name': employee.full_name,
                'position': employee.position or employee.job_title or '',
                'department': employee.department.name if employee.department else '',
                'avatar': employee.avatar.url if employee.avatar else None,
                'employee_id': employee.employee_id,
                'children': [build_employee_node(sub) for sub in subordinates],
            }

        # Get top-level employees (those without supervisors)
        top_employees = Employee.objects.filter(
            supervisor__isnull=True,
            is_active=True,
        ).select_related('department')

        org_chart = [build_employee_node(emp) for emp in top_employees]

        return Response(org_chart)
