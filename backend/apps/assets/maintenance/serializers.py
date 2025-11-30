from rest_framework import serializers
from .models import Asset, MaintenanceSchedule, MaintenanceRecord


class AssetSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    current_holder_name = serializers.SerializerMethodField()
    current_value = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = Asset
        fields = [
            'id', 'asset_code', 'name', 'description',
            'category', 'category_display', 'brand', 'model', 'serial_number',
            'purchase_date', 'purchase_price', 'vendor', 'warranty_expiry',
            'location', 'department', 'status', 'status_display',
            'useful_life_years', 'salvage_value', 'current_value',
            'current_holder', 'current_holder_name',
            'photo', 'notes', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'current_holder', 'created_at', 'updated_at']

    def get_current_holder_name(self, obj):
        if obj.current_holder:
            return obj.current_holder.get_full_name() or obj.current_holder.email
        return None


class AssetListSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    current_holder_name = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            'id', 'asset_code', 'name', 'category', 'category_display',
            'brand', 'model', 'status', 'status_display',
            'location', 'current_holder_name',
        ]

    def get_current_holder_name(self, obj):
        if obj.current_holder:
            return obj.current_holder.get_full_name() or obj.current_holder.email
        return None


class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source='asset.asset_code', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    maintenance_type_display = serializers.CharField(source='get_maintenance_type_display', read_only=True)

    class Meta:
        model = MaintenanceSchedule
        fields = [
            'id', 'asset', 'asset_code', 'asset_name',
            'title', 'description', 'maintenance_type', 'maintenance_type_display',
            'frequency_days', 'last_performed', 'next_due',
            'notify_days_before', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source='asset.asset_code', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    maintenance_type_display = serializers.CharField(source='get_maintenance_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'asset', 'asset_code', 'asset_name', 'schedule',
            'title', 'description', 'maintenance_type', 'maintenance_type_display',
            'status', 'status_display',
            'scheduled_date', 'started_at', 'completed_at',
            'assigned_to', 'assigned_to_name', 'performed_by', 'vendor',
            'labor_cost', 'parts_cost', 'total_cost',
            'findings', 'actions_taken', 'parts_replaced', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'total_cost', 'created_at', 'updated_at']

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.email
        return None


class MaintenanceRecordListSerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source='asset.asset_code', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    maintenance_type_display = serializers.CharField(source='get_maintenance_type_display', read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'asset', 'asset_code', 'title',
            'maintenance_type', 'maintenance_type_display',
            'status', 'status_display', 'scheduled_date', 'total_cost',
        ]
