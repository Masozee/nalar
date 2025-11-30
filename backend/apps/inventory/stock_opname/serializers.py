from rest_framework import serializers
from .models import StockOpname, StockOpnameItem, OpnameStatus


class StockOpnameItemSerializer(serializers.ModelSerializer):
    sku_code = serializers.CharField(source='sku.sku_code', read_only=True)
    sku_name = serializers.CharField(source='sku.name', read_only=True)
    variance_quantity = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    variance_value = serializers.DecimalField(
        max_digits=15, decimal_places=2, read_only=True
    )
    counted_by_name = serializers.CharField(source='counted_by.get_full_name', read_only=True)

    class Meta:
        model = StockOpnameItem
        fields = [
            'id', 'opname', 'sku', 'sku_code', 'sku_name',
            'system_quantity', 'actual_quantity',
            'is_counted', 'counted_at', 'counted_by', 'counted_by_name',
            'has_variance', 'variance_quantity', 'variance_value',
            'variance_reason', 'notes',
        ]
        read_only_fields = [
            'id', 'system_quantity', 'is_counted', 'counted_at', 'has_variance'
        ]


class StockOpnameListSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = StockOpname
        fields = [
            'id', 'opname_number', 'warehouse', 'warehouse_name',
            'status', 'status_display', 'scheduled_date',
            'assigned_to', 'assigned_to_name',
            'total_items', 'counted_items', 'variance_items', 'progress',
            'is_active', 'created_at',
        ]

    def get_progress(self, obj):
        if obj.total_items == 0:
            return 0
        return round((obj.counted_items / obj.total_items) * 100, 1)


class StockOpnameDetailSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    items = StockOpnameItemSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = StockOpname
        fields = [
            'id', 'opname_number', 'warehouse', 'warehouse_name',
            'status', 'status_display', 'scheduled_date',
            'start_date', 'end_date',
            'is_full_count', 'category_filter',
            'assigned_to', 'assigned_to_name',
            'approved_by', 'approved_by_name', 'approved_at',
            'total_items', 'counted_items', 'variance_items',
            'total_variance_value', 'progress',
            'notes', 'rejection_reason', 'items',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'opname_number', 'total_items', 'counted_items',
            'variance_items', 'total_variance_value',
            'approved_at', 'created_at', 'updated_at'
        ]

    def get_progress(self, obj):
        if obj.total_items == 0:
            return 0
        return round((obj.counted_items / obj.total_items) * 100, 1)


class StockOpnameCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockOpname
        fields = [
            'warehouse', 'scheduled_date', 'is_full_count',
            'category_filter', 'assigned_to', 'notes',
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        validated_data['updated_by'] = user
        opname = super().create(validated_data)
        opname.generate_items()
        return opname


class CountItemSerializer(serializers.Serializer):
    """Serializer for counting a single item."""
    actual_quantity = serializers.DecimalField(max_digits=12, decimal_places=2)
    variance_reason = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
