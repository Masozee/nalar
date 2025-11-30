from rest_framework import serializers
from .models import SKU, Warehouse, StockRecord, StockMovement


class WarehouseSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)

    class Meta:
        model = Warehouse
        fields = [
            'id', 'code', 'name', 'description', 'address',
            'manager', 'manager_name', 'phone', 'is_default', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SKUListSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    unit_display = serializers.CharField(source='get_unit_display', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    needs_reorder = serializers.BooleanField(read_only=True)

    class Meta:
        model = SKU
        fields = [
            'id', 'sku_code', 'barcode', 'name', 'category', 'category_display',
            'unit', 'unit_display', 'unit_price', 'current_stock',
            'minimum_stock', 'is_low_stock', 'needs_reorder', 'is_active',
        ]


class SKUDetailSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    unit_display = serializers.CharField(source='get_unit_display', read_only=True)
    default_location_name = serializers.CharField(source='default_location.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    needs_reorder = serializers.BooleanField(read_only=True)

    class Meta:
        model = SKU
        fields = [
            'id', 'sku_code', 'barcode', 'name', 'description',
            'category', 'category_display', 'unit', 'unit_display',
            'unit_price', 'minimum_stock', 'maximum_stock',
            'reorder_point', 'reorder_quantity', 'current_stock',
            'default_location', 'default_location_name',
            'brand', 'model', 'specifications',
            'is_stockable', 'is_purchasable', 'image',
            'is_low_stock', 'needs_reorder',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'sku_code', 'current_stock', 'created_at', 'updated_at']


class SKUCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SKU
        fields = [
            'barcode', 'name', 'description', 'category', 'unit',
            'unit_price', 'minimum_stock', 'maximum_stock',
            'reorder_point', 'reorder_quantity', 'default_location',
            'brand', 'model', 'specifications',
            'is_stockable', 'is_purchasable', 'image',
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        validated_data['updated_by'] = user
        return super().create(validated_data)


class StockRecordSerializer(serializers.ModelSerializer):
    sku_code = serializers.CharField(source='sku.sku_code', read_only=True)
    sku_name = serializers.CharField(source='sku.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    available_quantity = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = StockRecord
        fields = [
            'id', 'sku', 'sku_code', 'sku_name',
            'warehouse', 'warehouse_name',
            'quantity', 'reserved_quantity', 'available_quantity',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StockMovementSerializer(serializers.ModelSerializer):
    sku_code = serializers.CharField(source='sku.sku_code', read_only=True)
    sku_name = serializers.CharField(source='sku.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            'id', 'sku', 'sku_code', 'sku_name',
            'warehouse', 'warehouse_name',
            'movement_type', 'movement_type_display',
            'quantity', 'quantity_before', 'quantity_after',
            'reference_type', 'reference_id', 'notes',
            'movement_date', 'created_at',
        ]
        read_only_fields = fields


class StockAdjustmentSerializer(serializers.Serializer):
    """Serializer for manual stock adjustments."""
    sku_id = serializers.UUIDField()
    warehouse_id = serializers.UUIDField()
    adjustment_quantity = serializers.DecimalField(max_digits=12, decimal_places=2)
    reason = serializers.CharField(max_length=500)
