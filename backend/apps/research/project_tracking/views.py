"""
Views for Project Tracking module.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from .models import ResearchProject, ProjectTeamMember, ProjectTask, ProjectUpdate, ProjectStatus
from .serializers import (
    ResearchProjectListSerializer, ResearchProjectDetailSerializer, ResearchProjectCreateSerializer,
    ProjectTeamMemberSerializer, ProjectTaskSerializer, ProjectUpdateSerializer,
)


class ResearchProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for Research Project CRUD."""
    queryset = ResearchProject.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'project_type', 'lead_researcher', 'grant']
    search_fields = ['project_code', 'title', 'description', 'research_area']
    ordering_fields = ['project_code', 'start_date', 'progress_percentage', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ResearchProjectListSerializer
        elif self.action == 'create':
            return ResearchProjectCreateSerializer
        return ResearchProjectDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(ResearchProjectDetailSerializer(instance).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start project."""
        project = self.get_object()
        if project.status not in [ProjectStatus.PLANNING, ProjectStatus.PROPOSAL]:
            return Response({'error': 'Proyek tidak dapat dimulai'}, status=status.HTTP_400_BAD_REQUEST)
        project.status = ProjectStatus.ACTIVE
        if not project.start_date:
            project.start_date = timezone.now().date()
        project.save(update_fields=['status', 'start_date'])
        return Response({'status': 'active'})

    @action(detail=True, methods=['post'])
    def hold(self, request, pk=None):
        """Put project on hold."""
        project = self.get_object()
        if project.status != ProjectStatus.ACTIVE:
            return Response({'error': 'Proyek harus dalam status aktif'}, status=status.HTTP_400_BAD_REQUEST)
        project.status = ProjectStatus.ON_HOLD
        project.save(update_fields=['status'])
        return Response({'status': 'on_hold'})

    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume project from hold."""
        project = self.get_object()
        if project.status != ProjectStatus.ON_HOLD:
            return Response({'error': 'Proyek harus dalam status ditunda'}, status=status.HTTP_400_BAD_REQUEST)
        project.status = ProjectStatus.ACTIVE
        project.save(update_fields=['status'])
        return Response({'status': 'active'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark project as completed."""
        project = self.get_object()
        if project.status != ProjectStatus.ACTIVE:
            return Response({'error': 'Proyek harus dalam status aktif'}, status=status.HTTP_400_BAD_REQUEST)
        project.status = ProjectStatus.COMPLETED
        project.actual_end_date = timezone.now().date()
        project.progress_percentage = 100
        project.save(update_fields=['status', 'actual_end_date', 'progress_percentage'])
        return Response({'status': 'completed'})

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update project progress."""
        project = self.get_object()
        progress = request.data.get('progress_percentage')
        if progress is None:
            return Response({'error': 'progress_percentage required'}, status=status.HTTP_400_BAD_REQUEST)
        project.progress_percentage = min(100, max(0, int(progress)))
        project.save(update_fields=['progress_percentage'])
        return Response({'progress_percentage': project.progress_percentage})

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get project summary."""
        queryset = self.get_queryset()
        return Response({
            'total_projects': queryset.count(),
            'total_budget': sum(p.budget for p in queryset),
            'avg_progress': sum(p.progress_percentage for p in queryset) / max(1, queryset.count()),
            'overdue_count': sum(1 for p in queryset if p.is_overdue),
            'by_status': {
                'planning': queryset.filter(status=ProjectStatus.PLANNING).count(),
                'active': queryset.filter(status=ProjectStatus.ACTIVE).count(),
                'on_hold': queryset.filter(status=ProjectStatus.ON_HOLD).count(),
                'completed': queryset.filter(status=ProjectStatus.COMPLETED).count(),
            }
        })


class ProjectTeamMemberViewSet(viewsets.ModelViewSet):
    queryset = ProjectTeamMember.objects.filter(is_active=True)
    serializer_class = ProjectTeamMemberSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'user', 'role']


class ProjectTaskViewSet(viewsets.ModelViewSet):
    queryset = ProjectTask.objects.filter(is_active=True)
    serializer_class = ProjectTaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['project', 'status', 'priority', 'assigned_to']
    ordering = ['priority', 'due_date']

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark task as complete."""
        task = self.get_object()
        task.mark_complete()
        return Response({'status': 'done'})

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign task to user."""
        task = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        task.assigned_to_id = user_id
        task.save(update_fields=['assigned_to_id'])
        return Response({'status': 'assigned'})


class ProjectUpdateViewSet(viewsets.ModelViewSet):
    queryset = ProjectUpdate.objects.filter(is_active=True)
    serializer_class = ProjectUpdateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['project']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
