from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count
from datetime import timedelta

from apps.common.cache import cache_api_response, invalidate_cache
from .models import Asset, MaintenanceSchedule, MaintenanceRecord, AssetStatus, MaintenanceStatus
from .serializers import (
    AssetSerializer, AssetListSerializer,
    MaintenanceScheduleSerializer,
    MaintenanceRecordSerializer, MaintenanceRecordListSerializer,
)


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.select_related('current_holder')
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['asset_code', 'name', 'brand', 'model', 'serial_number']
    filterset_fields = ['category', 'status', 'department', 'is_active']
    ordering_fields = ['asset_code', 'name', 'purchase_date', 'purchase_price']

    @cache_api_response(timeout=300, key_prefix='assets')
    def list(self, request, *args, **kwargs):
        """List assets with caching (5 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='asset_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve asset detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create asset and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('assets:*')

    def perform_update(self, serializer):
        """Update asset and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('assets:*')
        invalidate_cache('asset_detail:*')

    def perform_destroy(self, instance):
        """Delete asset and invalidate cache"""
        super().perform_destroy(instance)
        invalidate_cache('assets:*')
        invalidate_cache('asset_detail:*')

    def get_serializer_class(self):
        if self.action == 'list':
            return AssetListSerializer
        return AssetSerializer

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available (unassigned) assets."""
        assets = self.queryset.filter(
            status=AssetStatus.ACTIVE,
            current_holder__isnull=True,
            is_active=True,
        )
        serializer = AssetListSerializer(assets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def warranty_expiring(self, request):
        """Get assets with warranty expiring soon."""
        threshold = timezone.now().date() + timedelta(days=30)
        assets = self.queryset.filter(
            warranty_expiry__lte=threshold,
            warranty_expiry__gte=timezone.now().date(),
            is_active=True,
        )
        serializer = AssetListSerializer(assets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get asset counts by category."""
        from django.db.models import Count
        counts = Asset.objects.filter(is_active=True).values('category').annotate(
            count=Count('id')
        ).order_by('-count')
        return Response(list(counts))

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get asset statistics."""
        total = Asset.objects.filter(is_active=True).count()
        by_status = Asset.objects.filter(is_active=True).values('status').annotate(
            count=Count('id')
        )
        by_category = Asset.objects.filter(is_active=True).values('category').annotate(
            count=Count('id')
        )
        total_value = Asset.objects.filter(
            is_active=True, purchase_price__isnull=False
        ).aggregate(total=Sum('purchase_price'))

        return Response({
            'total': total,
            'by_status': list(by_status),
            'by_category': list(by_category),
            'total_purchase_value': total_value['total'] or 0,
        })


class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceSchedule.objects.select_related('asset')
    serializer_class = MaintenanceScheduleSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['asset__asset_code', 'asset__name', 'title']
    filterset_fields = ['maintenance_type', 'asset']
    ordering_fields = ['next_due', 'last_performed']

    @cache_api_response(timeout=300, key_prefix='maintenance_schedules')
    def list(self, request, *args, **kwargs):
        """List maintenance schedules with caching (5 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='maintenance_schedule_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve maintenance schedule detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create schedule and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('maintenance_schedules:*')

    def perform_update(self, serializer):
        """Update schedule and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('maintenance_schedules:*')
        invalidate_cache('maintenance_schedule_detail:*')

    def perform_destroy(self, instance):
        """Delete schedule and invalidate cache"""
        super().perform_destroy(instance)
        invalidate_cache('maintenance_schedules:*')
        invalidate_cache('maintenance_schedule_detail:*')

    @action(detail=False, methods=['get'])
    def due_soon(self, request):
        """Get maintenance schedules due within 7 days."""
        threshold = timezone.now().date() + timedelta(days=7)
        schedules = self.queryset.filter(
            next_due__lte=threshold,
            is_active=True,
        ).order_by('next_due')
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue maintenance schedules."""
        today = timezone.now().date()
        schedules = self.queryset.filter(
            next_due__lt=today,
            is_active=True,
        ).order_by('next_due')
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.select_related('asset', 'schedule', 'assigned_to')
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['asset__asset_code', 'asset__name', 'title', 'vendor']
    filterset_fields = ['status', 'maintenance_type', 'asset']
    ordering_fields = ['scheduled_date', 'total_cost', 'created_at']

    @cache_api_response(timeout=300, key_prefix='maintenance_records')
    def list(self, request, *args, **kwargs):
        """List maintenance records with caching (5 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='maintenance_record_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve maintenance record detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create record and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('maintenance_records:*')

    def perform_update(self, serializer):
        """Update record and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('maintenance_records:*')
        invalidate_cache('maintenance_record_detail:*')

    def perform_destroy(self, instance):
        """Delete record and invalidate cache"""
        super().perform_destroy(instance)
        invalidate_cache('maintenance_records:*')
        invalidate_cache('maintenance_record_detail:*')

    def get_serializer_class(self):
        if self.action == 'list':
            return MaintenanceRecordListSerializer
        return MaintenanceRecordSerializer

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start maintenance work."""
        record = self.get_object()
        if record.status != MaintenanceStatus.SCHEDULED:
            return Response(
                {'error': 'Only scheduled maintenance can be started.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        record.status = MaintenanceStatus.IN_PROGRESS
        record.started_at = timezone.now()
        record.save()

        # Update asset status
        record.asset.status = AssetStatus.MAINTENANCE
        record.asset.save(update_fields=['status'])

        return Response(MaintenanceRecordSerializer(record).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete maintenance work."""
        record = self.get_object()
        if record.status not in [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.PENDING_PARTS]:
            return Response(
                {'error': 'Only in-progress maintenance can be completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record.status = MaintenanceStatus.COMPLETED
        record.completed_at = timezone.now()
        record.findings = request.data.get('findings', record.findings)
        record.actions_taken = request.data.get('actions_taken', record.actions_taken)
        record.parts_replaced = request.data.get('parts_replaced', record.parts_replaced)
        record.save()

        # Update asset status back to active
        record.asset.status = AssetStatus.ACTIVE
        record.asset.save(update_fields=['status'])

        return Response(MaintenanceRecordSerializer(record).data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending/in-progress maintenance."""
        records = self.queryset.filter(
            status__in=[MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.PENDING_PARTS]
        )
        serializer = MaintenanceRecordListSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def cost_summary(self, request):
        """Get maintenance cost summary."""
        from django.db.models.functions import TruncMonth

        monthly = MaintenanceRecord.objects.filter(
            status=MaintenanceStatus.COMPLETED
        ).annotate(
            month=TruncMonth('completed_at')
        ).values('month').annotate(
            total_cost=Sum('total_cost'),
            count=Count('id'),
        ).order_by('-month')[:12]

        by_type = MaintenanceRecord.objects.filter(
            status=MaintenanceStatus.COMPLETED
        ).values('maintenance_type').annotate(
            total_cost=Sum('total_cost'),
            count=Count('id'),
        )

        return Response({
            'monthly': list(monthly),
            'by_type': list(by_type),
        })
