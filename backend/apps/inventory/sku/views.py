from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.cache import cache_api_response, invalidate_cache
from .models import SKU, Warehouse, StockRecord, StockMovement
from .serializers import (
    SKUListSerializer, SKUDetailSerializer, SKUCreateSerializer,
    WarehouseSerializer, StockRecordSerializer, StockMovementSerializer,
    StockAdjustmentSerializer,
)


class WarehouseViewSet(viewsets.ModelViewSet):
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name']
    ordering_fields = ['name', 'code']
    ordering = ['name']

    @cache_api_response(timeout=600, key_prefix='warehouses')
    def list(self, request, *args, **kwargs):
        """List warehouses with caching (10 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=1800, key_prefix='warehouse_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve warehouse detail with caching (30 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create warehouse and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('warehouses:*')

    def perform_update(self, serializer):
        """Update warehouse and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('warehouses:*')
        invalidate_cache('warehouse_detail:*')

    def perform_destroy(self, instance):
        """Delete warehouse and invalidate cache"""
        super().perform_destroy(instance)
        invalidate_cache('warehouses:*')
        invalidate_cache('warehouse_detail:*')

    def get_queryset(self):
        return Warehouse.objects.filter(is_active=True)

    @action(detail=False, methods=['get'])
    def default(self, request):
        """Get default warehouse."""
        warehouse = Warehouse.objects.filter(is_default=True, is_active=True).first()
        if warehouse:
            return Response(WarehouseSerializer(warehouse).data)
        return Response({'detail': 'No default warehouse set.'}, status=status.HTTP_404_NOT_FOUND)


class SKUViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_stockable', 'is_purchasable', 'default_location']
    search_fields = ['sku_code', 'barcode', 'name', 'brand']
    ordering_fields = ['name', 'sku_code', 'current_stock', 'created_at']
    ordering = ['name']

    @cache_api_response(timeout=300, key_prefix='skus')
    def list(self, request, *args, **kwargs):
        """List SKUs with caching (5 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='sku_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve SKU detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create SKU and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('skus:*')

    def perform_update(self, serializer):
        """Update SKU and invalidate cache"""
        serializer.save(updated_by=self.request.user)
        invalidate_cache('skus:*')
        invalidate_cache('sku_detail:*')

    def get_queryset(self):
        return SKU.objects.filter(is_active=True).select_related('default_location')

    def get_serializer_class(self):
        if self.action == 'create':
            return SKUCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return SKUCreateSerializer
        elif self.action == 'retrieve':
            return SKUDetailSerializer
        return SKUListSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        # Invalidate cache after soft delete
        invalidate_cache('skus:*')
        invalidate_cache('sku_detail:*')
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get items with low stock."""
        skus = self.get_queryset().filter(
            current_stock__lte=F('minimum_stock')
        )
        serializer = SKUListSerializer(skus, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def needs_reorder(self, request):
        """Get items that need reorder."""
        skus = self.get_queryset().filter(
            current_stock__lte=F('reorder_point')
        )
        serializer = SKUListSerializer(skus, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def stock_by_warehouse(self, request, pk=None):
        """Get stock levels by warehouse for a SKU."""
        sku = self.get_object()
        records = StockRecord.objects.filter(sku=sku, is_active=True)
        serializer = StockRecordSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def movements(self, request, pk=None):
        """Get stock movements for a SKU."""
        sku = self.get_object()
        movements = StockMovement.objects.filter(sku=sku)[:50]
        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def adjust_stock(self, request):
        """Manual stock adjustment."""
        serializer = StockAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            sku = SKU.objects.get(id=serializer.validated_data['sku_id'])
            warehouse = Warehouse.objects.get(id=serializer.validated_data['warehouse_id'])
        except (SKU.DoesNotExist, Warehouse.DoesNotExist):
            return Response(
                {'detail': 'SKU atau Warehouse tidak ditemukan.'},
                status=status.HTTP_404_NOT_FOUND
            )

        adjustment_qty = serializer.validated_data['adjustment_quantity']
        reason = serializer.validated_data['reason']

        # Get or create stock record
        stock_record, _ = StockRecord.objects.get_or_create(
            sku=sku,
            warehouse=warehouse,
            defaults={'quantity': 0}
        )

        # Create movement
        StockMovement.objects.create(
            sku=sku,
            warehouse=warehouse,
            movement_type='adjustment',
            quantity=adjustment_qty,
            quantity_before=stock_record.quantity,
            quantity_after=stock_record.quantity + adjustment_qty,
            notes=reason,
            created_by=request.user,
            updated_by=request.user,
        )

        # Update stock
        stock_record.quantity += adjustment_qty
        stock_record.updated_by = request.user
        stock_record.save()

        return Response({'detail': 'Stok berhasil disesuaikan.'})


class StockRecordViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StockRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['sku', 'warehouse']
    ordering_fields = ['quantity']
    ordering = ['-quantity']

    def get_queryset(self):
        return StockRecord.objects.filter(is_active=True).select_related('sku', 'warehouse')


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['sku', 'warehouse', 'movement_type']
    ordering_fields = ['movement_date']
    ordering = ['-movement_date']

    def get_queryset(self):
        return StockMovement.objects.filter(is_active=True).select_related('sku', 'warehouse')
