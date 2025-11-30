from rest_framework import serializers
from .models import Vendor, VendorContact, VendorEvaluation


class VendorContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorContact
        fields = [
            'id', 'vendor', 'name', 'position', 'phone',
            'email', 'is_primary', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class VendorListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing vendors."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    vendor_type_display = serializers.CharField(source='get_vendor_type_display', read_only=True)

    class Meta:
        model = Vendor
        fields = [
            'id', 'code', 'name', 'vendor_type', 'vendor_type_display',
            'category', 'category_display', 'status', 'status_display',
            'city', 'phone', 'email', 'rating', 'is_active',
        ]


class VendorDetailSerializer(serializers.ModelSerializer):
    """Full serializer for vendor detail."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    vendor_type_display = serializers.CharField(source='get_vendor_type_display', read_only=True)
    contacts = VendorContactSerializer(many=True, read_only=True)
    total_pos = serializers.SerializerMethodField()
    total_po_value = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            'id', 'code', 'name', 'vendor_type', 'vendor_type_display',
            'category', 'category_display', 'status', 'status_display',
            'npwp', 'nib', 'siup_number',
            'address', 'city', 'province', 'postal_code',
            'phone', 'fax', 'email', 'website',
            'contact_person', 'contact_phone', 'contact_email',
            'bank_name', 'bank_branch', 'bank_account_number', 'bank_account_name',
            'payment_terms', 'credit_limit', 'rating',
            'notes', 'blacklist_reason', 'documents',
            'contacts', 'total_pos', 'total_po_value',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']

    def get_total_pos(self, obj):
        return obj.purchase_orders.count()

    def get_total_po_value(self, obj):
        from django.db.models import Sum
        result = obj.purchase_orders.aggregate(total=Sum('total_amount'))
        return result['total'] or 0


class VendorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vendors."""

    class Meta:
        model = Vendor
        fields = [
            'name', 'vendor_type', 'category', 'status',
            'npwp', 'nib', 'siup_number',
            'address', 'city', 'province', 'postal_code',
            'phone', 'fax', 'email', 'website',
            'contact_person', 'contact_phone', 'contact_email',
            'bank_name', 'bank_branch', 'bank_account_number', 'bank_account_name',
            'payment_terms', 'credit_limit', 'notes',
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        validated_data['updated_by'] = user
        return super().create(validated_data)


class VendorEvaluationSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    evaluator_name = serializers.CharField(source='evaluator.get_full_name', read_only=True)

    class Meta:
        model = VendorEvaluation
        fields = [
            'id', 'vendor', 'vendor_name', 'evaluation_date',
            'period_start', 'period_end',
            'quality_score', 'delivery_score', 'price_score',
            'service_score', 'compliance_score', 'overall_score',
            'recommendation', 'evaluator', 'evaluator_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'overall_score', 'evaluator', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['evaluator'] = user
        validated_data['created_by'] = user
        validated_data['updated_by'] = user
        return super().create(validated_data)
