from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import StockOpname, StockOpnameItem, OpnameStatus
from .serializers import (
    StockOpnameListSerializer, StockOpnameDetailSerializer,
    StockOpnameCreateSerializer, StockOpnameItemSerializer,
    CountItemSerializer,
)


class StockOpnameViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'warehouse', 'is_full_count']
    search_fields = ['opname_number']
    ordering_fields = ['scheduled_date', 'created_at']
    ordering = ['-scheduled_date']

    def get_queryset(self):
        return StockOpname.objects.filter(is_active=True).select_related(
            'warehouse', 'assigned_to', 'approved_by'
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return StockOpnameCreateSerializer
        elif self.action == 'retrieve':
            return StockOpnameDetailSerializer
        return StockOpnameListSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status not in [OpnameStatus.DRAFT, OpnameStatus.CANCELLED]:
            return Response(
                {'detail': 'Hanya opname dengan status Draft yang bisa dihapus.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start the opname process."""
        opname = self.get_object()
        if opname.status != OpnameStatus.DRAFT:
            return Response(
                {'detail': 'Opname sudah dimulai atau selesai.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        opname.status = OpnameStatus.IN_PROGRESS
        opname.start_date = timezone.now()
        opname.save(update_fields=['status', 'start_date'])
        return Response({'detail': 'Opname berhasil dimulai.'})

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit opname for approval."""
        opname = self.get_object()
        if opname.status != OpnameStatus.IN_PROGRESS:
            return Response(
                {'detail': 'Opname harus dalam status In Progress untuk diajukan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if opname.counted_items < opname.total_items:
            return Response(
                {'detail': 'Semua item harus dihitung sebelum mengajukan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        opname.status = OpnameStatus.PENDING_APPROVAL
        opname.save(update_fields=['status'])
        return Response({'detail': 'Opname berhasil diajukan untuk persetujuan.'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve or reject opname."""
        opname = self.get_object()
        if opname.status != OpnameStatus.PENDING_APPROVAL:
            return Response(
                {'detail': 'Opname harus dalam status Menunggu Persetujuan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        action_type = request.data.get('action')
        if action_type == 'approve':
            opname.status = OpnameStatus.APPROVED
            opname.approved_by = request.user
            opname.approved_at = timezone.now()
            opname.save(update_fields=['status', 'approved_by', 'approved_at'])

            # Apply adjustments
            opname.apply_adjustments()
            return Response({'detail': 'Opname berhasil disetujui dan stok disesuaikan.'})
        elif action_type == 'reject':
            reason = request.data.get('reason', '')
            opname.status = OpnameStatus.REJECTED
            opname.rejection_reason = reason
            opname.save(update_fields=['status', 'rejection_reason'])
            return Response({'detail': 'Opname berhasil ditolak.'})
        else:
            return Response(
                {'detail': 'Action harus approve atau reject.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel opname."""
        opname = self.get_object()
        if opname.status in [OpnameStatus.COMPLETED, OpnameStatus.CANCELLED]:
            return Response(
                {'detail': 'Opname sudah selesai atau dibatalkan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        opname.status = OpnameStatus.CANCELLED
        opname.save(update_fields=['status'])
        return Response({'detail': 'Opname berhasil dibatalkan.'})

    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        """Get opname items."""
        opname = self.get_object()
        items = opname.items.filter(is_active=True).select_related('sku', 'counted_by')
        serializer = StockOpnameItemSerializer(items, many=True)
        return Response(serializer.data)


class StockOpnameItemViewSet(viewsets.ModelViewSet):
    serializer_class = StockOpnameItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['opname', 'is_counted', 'has_variance']

    def get_queryset(self):
        return StockOpnameItem.objects.filter(is_active=True).select_related(
            'opname', 'sku', 'counted_by'
        )

    @action(detail=True, methods=['post'])
    def count(self, request, pk=None):
        """Record count for an item."""
        item = self.get_object()

        if item.opname.status != OpnameStatus.IN_PROGRESS:
            return Response(
                {'detail': 'Opname harus dalam status In Progress untuk menghitung.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CountItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item.actual_quantity = serializer.validated_data['actual_quantity']
        item.variance_reason = serializer.validated_data.get('variance_reason', '')
        item.notes = serializer.validated_data.get('notes', '')
        item.counted_by = request.user
        item.save()

        return Response(StockOpnameItemSerializer(item).data)
