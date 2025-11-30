from rest_framework import serializers
from django.utils import timezone
from .models import PurchaseOrder, POItem, POReceipt, POReceiptItem, POStatus


class POItemSerializer(serializers.ModelSerializer):
    is_fully_received = serializers.BooleanField(read_only=True)
    pending_quantity = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = POItem
        fields = [
            'id', 'purchase_order', 'line_number', 'item_code', 'item_name',
            'description', 'unit', 'quantity', 'received_quantity',
            'unit_price', 'discount_percent', 'total_price', 'notes',
            'is_fully_received', 'pending_quantity', 'created_at',
        ]
        read_only_fields = [
            'id', 'line_number', 'total_price', 'received_quantity', 'created_at'
        ]


class POListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing POs."""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'vendor', 'vendor_name',
            'status', 'status_display', 'priority', 'priority_display',
            'order_date', 'expected_delivery_date', 'total_amount',
            'payment_status', 'payment_status_display', 'items_count',
            'created_at',
        ]

    def get_items_count(self, obj):
        return obj.items.filter(is_active=True).count()


class PODetailSerializer(serializers.ModelSerializer):
    """Full serializer for PO detail."""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    vendor_code = serializers.CharField(source='vendor.code', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    items = POItemSerializer(many=True, read_only=True)
    can_approve = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'reference_number',
            'vendor', 'vendor_name', 'vendor_code',
            'status', 'status_display', 'priority', 'priority_display',
            'order_date', 'expected_delivery_date', 'actual_delivery_date',
            'requested_by', 'requested_by_name', 'department',
            'delivery_address', 'delivery_notes',
            'currency', 'subtotal', 'discount_percent', 'discount_amount',
            'tax_percent', 'tax_amount', 'total_amount',
            'payment_terms', 'payment_status', 'payment_status_display', 'paid_amount',
            'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason',
            'terms_conditions', 'internal_notes',
            'items', 'can_approve', 'can_edit',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ]
        read_only_fields = [
            'id', 'po_number', 'subtotal', 'discount_amount', 'tax_amount',
            'total_amount', 'paid_amount', 'approved_at',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ]

    def get_can_approve(self, obj):
        return obj.status == POStatus.PENDING_APPROVAL

    def get_can_edit(self, obj):
        return obj.status in [POStatus.DRAFT, POStatus.REJECTED]


class POCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating POs."""
    items = POItemSerializer(many=True, required=False)

    class Meta:
        model = PurchaseOrder
        fields = [
            'vendor', 'reference_number', 'priority',
            'order_date', 'expected_delivery_date',
            'department', 'delivery_address', 'delivery_notes',
            'currency', 'discount_percent', 'tax_percent',
            'payment_terms', 'terms_conditions', 'internal_notes',
            'items',
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user

        po = PurchaseOrder.objects.create(
            requested_by=user,
            created_by=user,
            updated_by=user,
            **validated_data
        )

        for item_data in items_data:
            POItem.objects.create(purchase_order=po, **item_data)

        po.calculate_totals()
        return po


class POUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating PO metadata."""

    class Meta:
        model = PurchaseOrder
        fields = [
            'reference_number', 'priority',
            'expected_delivery_date', 'department',
            'delivery_address', 'delivery_notes',
            'discount_percent', 'tax_percent',
            'payment_terms', 'terms_conditions', 'internal_notes',
        ]

    def update(self, instance, validated_data):
        instance.updated_by = self.context['request'].user
        instance = super().update(instance, validated_data)
        instance.calculate_totals()
        return instance


class POReceiptItemSerializer(serializers.ModelSerializer):
    po_item_name = serializers.CharField(source='po_item.item_name', read_only=True)

    class Meta:
        model = POReceiptItem
        fields = [
            'id', 'po_item', 'po_item_name',
            'quantity_received', 'quantity_rejected',
            'rejection_reason', 'notes',
        ]
        read_only_fields = ['id']


class POReceiptSerializer(serializers.ModelSerializer):
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)
    received_by_name = serializers.CharField(source='received_by.get_full_name', read_only=True)
    items = POReceiptItemSerializer(many=True, read_only=True)

    class Meta:
        model = POReceipt
        fields = [
            'id', 'purchase_order', 'po_number', 'receipt_number',
            'receipt_date', 'received_by', 'received_by_name',
            'delivery_note_number', 'delivery_date', 'notes',
            'items', 'created_at',
        ]
        read_only_fields = ['id', 'receipt_number', 'received_by', 'created_at']


class POReceiptCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating goods receipts."""
    items = POReceiptItemSerializer(many=True)

    class Meta:
        model = POReceipt
        fields = [
            'purchase_order', 'receipt_date',
            'delivery_note_number', 'delivery_date', 'notes',
            'items',
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user

        receipt = POReceipt.objects.create(
            received_by=user,
            created_by=user,
            updated_by=user,
            **validated_data
        )

        for item_data in items_data:
            POReceiptItem.objects.create(receipt=receipt, **item_data)

        return receipt


class POApprovalSerializer(serializers.Serializer):
    """Serializer for PO approval/rejection."""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    reason = serializers.CharField(required=False, allow_blank=True)
