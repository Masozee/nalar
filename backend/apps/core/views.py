"""Core views for shared functionality."""

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import AuditLog
from .serializers import AuditLogSerializer
from .pagination import DefaultPagePagination


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing audit logs.

    Endpoints:
    - GET /api/v1/audit-logs/ - List audit logs
    - GET /api/v1/audit-logs/{id}/ - Get specific log
    - GET /api/v1/audit-logs/stats/ - Get log statistics
    """

    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'model_name', 'user']
    search_fields = ['model_name', 'user__email', 'user__username', 'changes']
    ordering_fields = ['timestamp', 'action', 'model_name']
    ordering = ['-timestamp']

    def get_queryset(self):
        """Get audit logs for the current tenant."""
        user = self.request.user

        if user.is_superuser:
            # Super admin sees all logs
            return AuditLog.objects.all().select_related('user')

        # Get user's tenant
        from apps.tenants.models import TenantUser
        tenant_user = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).first()

        if not tenant_user:
            return AuditLog.objects.none()

        # Filter logs by tenant (if model has tenant field)
        # For now, show all logs for users in the same tenant
        tenant_user_ids = TenantUser.objects.filter(
            tenant=tenant_user.tenant,
            is_active=True
        ).values_list('user_id', flat=True)

        return AuditLog.objects.filter(
            user_id__in=tenant_user_ids
        ).select_related('user')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get audit log statistics."""
        queryset = self.get_queryset()

        stats = {
            'total_logs': queryset.count(),
            'by_action': {},
            'by_model': {},
            'recent_users': [],
        }

        # Count by action
        actions = queryset.values('action').annotate(
            count=models.Count('id')
        ).order_by('-count')[:5]

        for action in actions:
            stats['by_action'][action['action']] = action['count']

        # Count by model
        models_count = queryset.values('model_name').annotate(
            count=models.Count('id')
        ).order_by('-count')[:5]

        for model in models_count:
            stats['by_model'][model['model_name']] = model['count']

        # Recent active users
        recent_users = queryset.values(
            'user__id',
            'user__email',
            'user__first_name',
            'user__last_name'
        ).annotate(
            log_count=models.Count('id')
        ).order_by('-log_count')[:5]

        stats['recent_users'] = list(recent_users)

        return Response(stats)


from django.db import models
