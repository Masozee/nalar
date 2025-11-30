from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import StockTransfer, StockTransferItem, TransferStatus
from .serializers import (
    StockTransferListSerializer, StockTransferDetailSerializer,
    StockTransferCreateSerializer, StockTransferItemSerializer,
    ReceiveItemsSerializer,
)


class StockTransferViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'source_warehouse', 'destination_warehouse']
    search_fields = ['transfer_number']
    ordering_fields = ['requested_date', 'expected_date', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return StockTransfer.objects.filter(is_active=True).select_related(
            'source_warehouse', 'destination_warehouse',
            'requested_by', 'approved_by', 'shipped_by', 'received_by'
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return StockTransferCreateSerializer
        elif self.action == 'retrieve':
            return StockTransferDetailSerializer
        return StockTransferListSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status not in [TransferStatus.DRAFT, TransferStatus.REJECTED]:
            return Response(
                {'detail': 'Hanya transfer dengan status Draft atau Ditolak yang bisa dihapus.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit transfer for approval."""
        transfer = self.get_object()
        if transfer.status != TransferStatus.DRAFT:
            return Response(
                {'detail': 'Transfer harus dalam status Draft untuk diajukan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not transfer.items.filter(is_active=True).exists():
            return Response(
                {'detail': 'Transfer harus memiliki minimal satu item.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        transfer.status = TransferStatus.PENDING_APPROVAL
        transfer.save(update_fields=['status'])
        return Response({'detail': 'Transfer berhasil diajukan untuk persetujuan.'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve or reject transfer."""
        transfer = self.get_object()
        if transfer.status != TransferStatus.PENDING_APPROVAL:
            return Response(
                {'detail': 'Transfer harus dalam status Menunggu Persetujuan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        action_type = request.data.get('action')
        if action_type == 'approve':
            transfer.status = TransferStatus.APPROVED
            transfer.approved_by = request.user
            transfer.approved_at = timezone.now()
            transfer.save(update_fields=['status', 'approved_by', 'approved_at'])
            return Response({'detail': 'Transfer berhasil disetujui.'})
        elif action_type == 'reject':
            reason = request.data.get('reason', '')
            transfer.status = TransferStatus.REJECTED
            transfer.rejection_reason = reason
            transfer.save(update_fields=['status', 'rejection_reason'])
            return Response({'detail': 'Transfer berhasil ditolak.'})
        else:
            return Response(
                {'detail': 'Action harus approve atau reject.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def ship(self, request, pk=None):
        """Ship the transfer."""
        transfer = self.get_object()
        try:
            transfer.ship(request.user)
            return Response({'detail': 'Transfer berhasil dikirim.'})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        """Receive the transfer."""
        transfer = self.get_object()

        items_received = None
        if request.data:
            serializer = ReceiveItemsSerializer(data=request.data)
            if serializer.is_valid():
                items_received = serializer.validated_data.get('items')

        try:
            transfer.receive(request.user, items_received)
            return Response({'detail': 'Transfer berhasil diterima.'})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel transfer."""
        transfer = self.get_object()
        if transfer.status in [TransferStatus.RECEIVED, TransferStatus.CANCELLED]:
            return Response(
                {'detail': 'Transfer sudah diterima atau dibatalkan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if transfer.status == TransferStatus.IN_TRANSIT:
            return Response(
                {'detail': 'Transfer dalam perjalanan tidak bisa dibatalkan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        transfer.status = TransferStatus.CANCELLED
        transfer.save(update_fields=['status'])
        return Response({'detail': 'Transfer berhasil dibatalkan.'})

    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get transfers requested by current user."""
        transfers = self.get_queryset().filter(requested_by=request.user)
        serializer = StockTransferListSerializer(transfers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get transfers pending approval."""
        transfers = self.get_queryset().filter(status=TransferStatus.PENDING_APPROVAL)
        serializer = StockTransferListSerializer(transfers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def in_transit(self, request):
        """Get transfers in transit."""
        transfers = self.get_queryset().filter(
            status__in=[TransferStatus.IN_TRANSIT, TransferStatus.PARTIAL]
        )
        serializer = StockTransferListSerializer(transfers, many=True)
        return Response(serializer.data)


class StockTransferItemViewSet(viewsets.ModelViewSet):
    serializer_class = StockTransferItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['transfer']

    def get_queryset(self):
        return StockTransferItem.objects.filter(is_active=True).select_related(
            'transfer', 'sku'
        )

    def create(self, request, *args, **kwargs):
        transfer_id = request.data.get('transfer')
        try:
            transfer = StockTransfer.objects.get(id=transfer_id)
            if transfer.status != TransferStatus.DRAFT:
                return Response(
                    {'detail': 'Item hanya bisa ditambahkan ke transfer dengan status Draft.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except StockTransfer.DoesNotExist:
            return Response(
                {'detail': 'Transfer tidak ditemukan.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return super().create(request, *args, **kwargs)
