from rest_framework import serializers
from .models import StockTransfer, StockTransferItem, TransferStatus


class StockTransferItemSerializer(serializers.ModelSerializer):
    sku_code = serializers.CharField(source='sku.sku_code', read_only=True)
    sku_name = serializers.CharField(source='sku.name', read_only=True)
    pending_quantity = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    is_fully_received = serializers.BooleanField(read_only=True)

    class Meta:
        model = StockTransferItem
        fields = [
            'id', 'transfer', 'sku', 'sku_code', 'sku_name',
            'quantity', 'received_quantity', 'pending_quantity',
            'is_fully_received', 'notes',
        ]
        read_only_fields = ['id', 'received_quantity']


class StockTransferListSerializer(serializers.ModelSerializer):
    source_warehouse_name = serializers.CharField(source='source_warehouse.name', read_only=True)
    destination_warehouse_name = serializers.CharField(source='destination_warehouse.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = StockTransfer
        fields = [
            'id', 'transfer_number',
            'source_warehouse', 'source_warehouse_name',
            'destination_warehouse', 'destination_warehouse_name',
            'status', 'status_display', 'priority', 'priority_display',
            'requested_date', 'expected_date', 'items_count',
            'is_active', 'created_at',
        ]

    def get_items_count(self, obj):
        return obj.items.filter(is_active=True).count()


class StockTransferDetailSerializer(serializers.ModelSerializer):
    source_warehouse_name = serializers.CharField(source='source_warehouse.name', read_only=True)
    destination_warehouse_name = serializers.CharField(source='destination_warehouse.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    shipped_by_name = serializers.CharField(source='shipped_by.get_full_name', read_only=True)
    received_by_name = serializers.CharField(source='received_by.get_full_name', read_only=True)
    items = StockTransferItemSerializer(many=True, read_only=True)

    class Meta:
        model = StockTransfer
        fields = [
            'id', 'transfer_number',
            'source_warehouse', 'source_warehouse_name',
            'destination_warehouse', 'destination_warehouse_name',
            'status', 'status_display', 'priority', 'priority_display',
            'requested_date', 'expected_date', 'shipped_date', 'received_date',
            'requested_by', 'requested_by_name',
            'approved_by', 'approved_by_name', 'approved_at',
            'shipped_by', 'shipped_by_name',
            'received_by', 'received_by_name',
            'reason', 'notes', 'rejection_reason', 'items',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'transfer_number', 'approved_at',
            'shipped_date', 'received_date',
            'created_at', 'updated_at'
        ]


class StockTransferCreateSerializer(serializers.ModelSerializer):
    items = StockTransferItemSerializer(many=True, required=False)

    class Meta:
        model = StockTransfer
        fields = [
            'source_warehouse', 'destination_warehouse',
            'priority', 'expected_date', 'reason', 'notes', 'items',
        ]

    def validate(self, data):
        if data['source_warehouse'] == data['destination_warehouse']:
            raise serializers.ValidationError(
                'Source dan destination warehouse tidak boleh sama.'
            )
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user

        transfer = StockTransfer.objects.create(
            requested_by=user,
            created_by=user,
            updated_by=user,
            **validated_data
        )

        for item_data in items_data:
            StockTransferItem.objects.create(transfer=transfer, **item_data)

        return transfer


class ReceiveItemsSerializer(serializers.Serializer):
    """Serializer for receiving transfer items."""
    items = serializers.DictField(
        child=serializers.DecimalField(max_digits=12, decimal_places=2),
        help_text='Dict of {item_id: received_quantity}'
    )
