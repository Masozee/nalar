from rest_framework import serializers
from .models import AssetAssignment, AssetTransfer, AssetCheckout


class AssetAssignmentSerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source='asset.asset_code', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    assignment_type_display = serializers.CharField(source='get_assignment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AssetAssignment
        fields = [
            'id', 'asset', 'asset_code', 'asset_name',
            'assigned_to', 'assigned_to_name',
            'assignment_type', 'assignment_type_display',
            'status', 'status_display',
            'assigned_date', 'expected_return_date', 'actual_return_date',
            'purpose', 'location',
            'condition_at_assignment', 'condition_at_return',
            'approved_by', 'returned_to', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.get_full_name() or obj.assigned_to.email


class AssetAssignmentListSerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source='asset.asset_code', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AssetAssignment
        fields = [
            'id', 'asset_code', 'asset_name', 'assigned_to_name',
            'status', 'status_display', 'assigned_date', 'expected_return_date',
        ]

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.get_full_name() or obj.assigned_to.email


class AssetTransferSerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source='asset.asset_code', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    from_user_name = serializers.SerializerMethodField()
    to_user_name = serializers.SerializerMethodField()

    class Meta:
        model = AssetTransfer
        fields = [
            'id', 'asset', 'asset_code', 'asset_name',
            'from_user', 'from_user_name', 'to_user', 'to_user_name',
            'transfer_date', 'reason', 'condition',
            'approved_by', 'approved_at', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'approved_at', 'created_at', 'updated_at']

    def get_from_user_name(self, obj):
        return obj.from_user.get_full_name() or obj.from_user.email

    def get_to_user_name(self, obj):
        return obj.to_user.get_full_name() or obj.to_user.email


class AssetCheckoutSerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source='asset.asset_code', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    checked_out_by_name = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = AssetCheckout
        fields = [
            'id', 'asset', 'asset_code', 'asset_name',
            'checked_out_by', 'checked_out_by_name',
            'checkout_time', 'expected_return_time', 'actual_return_time',
            'purpose', 'location',
            'is_returned', 'is_overdue', 'returned_to',
            'condition_on_return', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'checked_out_by', 'checkout_time', 'is_returned', 'actual_return_time', 'created_at', 'updated_at']

    def get_checked_out_by_name(self, obj):
        return obj.checked_out_by.get_full_name() or obj.checked_out_by.email

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['checked_out_by'] = request.user
        return super().create(validated_data)


class AssetReturnSerializer(serializers.Serializer):
    condition_on_return = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
