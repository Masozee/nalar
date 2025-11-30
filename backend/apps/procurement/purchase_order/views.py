from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.cache import cache_api_response, invalidate_cache
from .models import PurchaseOrder, POItem, POReceipt, POReceiptItem, POStatus
from .serializers import (
    POListSerializer, PODetailSerializer, POCreateSerializer, POUpdateSerializer,
    POItemSerializer, POReceiptSerializer, POReceiptCreateSerializer,
    POApprovalSerializer,
)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for purchase order management."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'payment_status', 'vendor']
    search_fields = ['po_number', 'reference_number', 'vendor__name']
    ordering_fields = ['po_number', 'order_date', 'total_amount', 'created_at']
    ordering = ['-created_at']

    @cache_api_response(timeout=180, key_prefix='purchase_orders')
    def list(self, request, *args, **kwargs):
        """List purchase orders with caching (3 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='purchase_order_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve purchase order detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create purchase order and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('purchase_orders:*')

    def perform_update(self, serializer):
        """Update purchase order and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('purchase_orders:*')
        invalidate_cache('purchase_order_detail:*')

    def get_queryset(self):
        return PurchaseOrder.objects.filter(
            is_active=True
        ).select_related('vendor', 'requested_by', 'approved_by')

    def get_serializer_class(self):
        if self.action == 'create':
            return POCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return POUpdateSerializer
        elif self.action == 'retrieve':
            return PODetailSerializer
        return POListSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status not in [POStatus.DRAFT, POStatus.REJECTED]:
            return Response(
                {'detail': 'Hanya PO dengan status Draft atau Ditolak yang bisa dihapus.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        # Invalidate cache after soft delete
        invalidate_cache('purchase_orders:*')
        invalidate_cache('purchase_order_detail:*')
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit PO for approval."""
        po = self.get_object()
        if po.status != POStatus.DRAFT:
            return Response(
                {'detail': 'Hanya PO dengan status Draft yang bisa diajukan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not po.items.filter(is_active=True).exists():
            return Response(
                {'detail': 'PO harus memiliki minimal satu item.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        po.status = POStatus.PENDING_APPROVAL
        po.save(update_fields=['status'])
        return Response({'detail': 'PO berhasil diajukan untuk persetujuan.'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve or reject PO."""
        po = self.get_object()
        serializer = POApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if po.status != POStatus.PENDING_APPROVAL:
            return Response(
                {'detail': 'Hanya PO dengan status Menunggu Persetujuan yang bisa diproses.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        action_type = serializer.validated_data['action']

        if action_type == 'approve':
            po.status = POStatus.APPROVED
            po.approved_by = request.user
            po.approved_at = timezone.now()
            po.save(update_fields=['status', 'approved_by', 'approved_at'])
            return Response({'detail': 'PO berhasil disetujui.'})
        else:
            reason = serializer.validated_data.get('reason', '')
            po.status = POStatus.REJECTED
            po.rejection_reason = reason
            po.save(update_fields=['status', 'rejection_reason'])
            return Response({'detail': 'PO berhasil ditolak.'})

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Mark PO as sent to vendor."""
        po = self.get_object()
        if po.status != POStatus.APPROVED:
            return Response(
                {'detail': 'Hanya PO yang sudah disetujui yang bisa dikirim.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        po.status = POStatus.SENT
        po.save(update_fields=['status'])
        return Response({'detail': 'PO berhasil ditandai sebagai terkirim ke vendor.'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel PO."""
        po = self.get_object()
        if po.status in [POStatus.RECEIVED, POStatus.CLOSED]:
            return Response(
                {'detail': 'PO yang sudah diterima atau selesai tidak bisa dibatalkan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get('reason', '')
        po.status = POStatus.CANCELLED
        po.internal_notes = f"{po.internal_notes}\n\nDibatalkan: {reason}".strip()
        po.save(update_fields=['status', 'internal_notes'])
        return Response({'detail': 'PO berhasil dibatalkan.'})

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a completed PO."""
        po = self.get_object()
        if po.status != POStatus.RECEIVED:
            return Response(
                {'detail': 'Hanya PO yang sudah diterima lengkap yang bisa ditutup.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        po.status = POStatus.CLOSED
        po.save(update_fields=['status'])
        return Response({'detail': 'PO berhasil ditutup.'})

    @action(detail=True, methods=['get'])
    def receipts(self, request, pk=None):
        """Get receipts for a PO."""
        po = self.get_object()
        receipts = po.receipts.filter(is_active=True)
        serializer = POReceiptSerializer(receipts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get POs requested by current user."""
        pos = self.get_queryset().filter(requested_by=request.user)
        serializer = POListSerializer(pos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get POs pending approval."""
        pos = self.get_queryset().filter(status=POStatus.PENDING_APPROVAL)
        serializer = POListSerializer(pos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get PO statistics."""
        qs = self.get_queryset()
        stats = {
            'total': qs.count(),
            'by_status': {},
            'total_value': qs.aggregate(total=Sum('total_amount'))['total'] or 0,
            'pending_approval': qs.filter(status=POStatus.PENDING_APPROVAL).count(),
            'pending_delivery': qs.filter(status__in=[POStatus.SENT, POStatus.PARTIAL]).count(),
        }

        for choice in POStatus.choices:
            stats['by_status'][choice[0]] = qs.filter(status=choice[0]).count()

        return Response(stats)


class POItemViewSet(viewsets.ModelViewSet):
    """ViewSet for PO items."""
    serializer_class = POItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['purchase_order']

    def get_queryset(self):
        return POItem.objects.filter(is_active=True).select_related('purchase_order')

    def create(self, request, *args, **kwargs):
        # Verify PO is editable
        po_id = request.data.get('purchase_order')
        try:
            po = PurchaseOrder.objects.get(id=po_id)
            if po.status not in [POStatus.DRAFT, POStatus.REJECTED]:
                return Response(
                    {'detail': 'Item hanya bisa ditambahkan ke PO dengan status Draft atau Ditolak.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except PurchaseOrder.DoesNotExist:
            return Response(
                {'detail': 'PO tidak ditemukan.'},
                status=status.HTTP_404_NOT_FOUND
            )

        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.purchase_order.status not in [POStatus.DRAFT, POStatus.REJECTED]:
            return Response(
                {'detail': 'Item hanya bisa dihapus dari PO dengan status Draft atau Ditolak.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        instance.purchase_order.calculate_totals()
        return Response(status=status.HTTP_204_NO_CONTENT)


class POReceiptViewSet(viewsets.ModelViewSet):
    """ViewSet for goods receipts."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['purchase_order']
    ordering_fields = ['receipt_date', 'receipt_number']
    ordering = ['-receipt_date']

    def get_queryset(self):
        return POReceipt.objects.filter(
            is_active=True
        ).select_related('purchase_order', 'received_by')

    def get_serializer_class(self):
        if self.action == 'create':
            return POReceiptCreateSerializer
        return POReceiptSerializer

    def create(self, request, *args, **kwargs):
        # Verify PO can receive goods
        po_id = request.data.get('purchase_order')
        try:
            po = PurchaseOrder.objects.get(id=po_id)
            if po.status not in [POStatus.SENT, POStatus.PARTIAL]:
                return Response(
                    {'detail': 'Penerimaan hanya bisa dilakukan untuk PO yang sudah dikirim.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except PurchaseOrder.DoesNotExist:
            return Response(
                {'detail': 'PO tidak ditemukan.'},
                status=status.HTTP_404_NOT_FOUND
            )

        return super().create(request, *args, **kwargs)
