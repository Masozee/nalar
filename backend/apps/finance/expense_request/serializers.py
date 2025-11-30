"""
Serializers for Expense Request module.
"""
from rest_framework import serializers
from .models import ExpenseRequest, ExpenseItem, ExpenseAdvance


class ExpenseItemSerializer(serializers.ModelSerializer):
    """Serializer for ExpenseItem."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = ExpenseItem
        fields = [
            'id', 'expense_request', 'category', 'category_display',
            'description', 'quantity', 'unit_price', 'amount',
            'receipt_number', 'receipt_date', 'receipt_file', 'notes',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'amount', 'created_at', 'updated_at']


class ExpenseItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ExpenseItem (nested in ExpenseRequest)."""

    class Meta:
        model = ExpenseItem
        fields = [
            'category', 'description', 'quantity', 'unit_price',
            'receipt_number', 'receipt_date', 'notes'
        ]


class ExpenseRequestListSerializer(serializers.ModelSerializer):
    """List serializer for ExpenseRequest."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    requester_name = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = ExpenseRequest
        fields = [
            'id', 'request_number', 'title', 'requester', 'requester_name',
            'department', 'status', 'status_display', 'currency',
            'total_amount', 'approved_amount', 'payment_method',
            'payment_method_display', 'request_date', 'expense_date',
            'item_count', 'is_active', 'created_at'
        ]

    def get_requester_name(self, obj):
        """Get requester name with fallback to username."""
        full_name = obj.requester.get_full_name()
        if full_name and full_name.strip():
            return full_name
        return obj.requester.username

    def get_item_count(self, obj):
        return obj.items.filter(is_active=True).count()


class ExpenseRequestDetailSerializer(serializers.ModelSerializer):
    """Detail serializer for ExpenseRequest."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    requester_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    processed_by_name = serializers.SerializerMethodField()
    items = ExpenseItemSerializer(many=True, read_only=True)

    class Meta:
        model = ExpenseRequest
        fields = [
            'id', 'request_number', 'requester', 'requester_name',
            'department', 'title', 'description', 'purpose',
            'request_date', 'expense_date', 'status', 'status_display',
            'currency', 'total_amount', 'approved_amount',
            'payment_method', 'payment_method_display',
            'bank_name', 'bank_account_number', 'bank_account_name',
            'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason',
            'processed_by', 'processed_by_name', 'processed_at',
            'payment_reference', 'payment_date',
            'notes', 'finance_notes', 'items',
            'is_active', 'created_at', 'updated_at'
        ]

    def get_requester_name(self, obj):
        """Get requester name with fallback to username."""
        full_name = obj.requester.get_full_name()
        if full_name and full_name.strip():
            return full_name
        return obj.requester.username

    def get_approved_by_name(self, obj):
        """Get approved_by name with fallback to username."""
        if not obj.approved_by:
            return None
        full_name = obj.approved_by.get_full_name()
        if full_name and full_name.strip():
            return full_name
        return obj.approved_by.username

    def get_processed_by_name(self, obj):
        """Get processed_by name with fallback to username."""
        if not obj.processed_by:
            return None
        full_name = obj.processed_by.get_full_name()
        if full_name and full_name.strip():
            return full_name
        return obj.processed_by.username


class ExpenseRequestCreateSerializer(serializers.ModelSerializer):
    """Create serializer for ExpenseRequest."""
    items = ExpenseItemCreateSerializer(many=True, required=False)

    class Meta:
        model = ExpenseRequest
        fields = [
            'title', 'description', 'purpose', 'expense_date',
            'payment_method', 'bank_name', 'bank_account_number',
            'bank_account_name', 'notes', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        request = self.context['request']
        validated_data['requester'] = request.user
        validated_data['created_by'] = request.user

        # Get department from user profile if available
        if hasattr(request.user, 'employee_profile'):
            profile = request.user.employee_profile
            if hasattr(profile, 'department') and profile.department:
                validated_data['department'] = profile.department.name

        expense_request = ExpenseRequest.objects.create(**validated_data)

        for item_data in items_data:
            ExpenseItem.objects.create(
                expense_request=expense_request,
                **item_data
            )

        return expense_request


class ExpenseRequestUpdateSerializer(serializers.ModelSerializer):
    """Update serializer for ExpenseRequest."""

    class Meta:
        model = ExpenseRequest
        fields = [
            'title', 'description', 'purpose', 'expense_date',
            'payment_method', 'bank_name', 'bank_account_number',
            'bank_account_name', 'notes'
        ]

    def update(self, instance, validated_data):
        request = self.context['request']
        validated_data['updated_by'] = request.user
        return super().update(instance, validated_data)


class ExpenseRequestApproveSerializer(serializers.Serializer):
    """Serializer for approving expense request."""
    approved_amount = serializers.DecimalField(
        max_digits=15, decimal_places=2, required=False
    )
    finance_notes = serializers.CharField(required=False, allow_blank=True)


class ExpenseRequestRejectSerializer(serializers.Serializer):
    """Serializer for rejecting expense request."""
    reason = serializers.CharField(required=True)


class ExpenseRequestProcessSerializer(serializers.Serializer):
    """Serializer for processing expense payment."""
    payment_reference = serializers.CharField(required=False, allow_blank=True)


class ExpenseRequestPaySerializer(serializers.Serializer):
    """Serializer for marking expense as paid."""
    payment_date = serializers.DateField(required=False)


# Expense Advance Serializers
class ExpenseAdvanceListSerializer(serializers.ModelSerializer):
    """List serializer for ExpenseAdvance."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requester_name = serializers.SerializerMethodField()

    class Meta:
        model = ExpenseAdvance
        fields = [
            'id', 'advance_number', 'requester', 'requester_name',
            'purpose', 'amount', 'status', 'status_display',
            'settled_amount', 'balance', 'is_active', 'created_at'
        ]

    def get_requester_name(self, obj):
        """Get requester name with fallback to username."""
        full_name = obj.requester.get_full_name()
        if full_name and full_name.strip():
            return full_name
        return obj.requester.username


class ExpenseAdvanceDetailSerializer(serializers.ModelSerializer):
    """Detail serializer for ExpenseAdvance."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requester_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    expense_request_number = serializers.CharField(
        source='expense_request.request_number', read_only=True, allow_null=True
    )

    class Meta:
        model = ExpenseAdvance
        fields = [
            'id', 'advance_number', 'requester', 'requester_name',
            'expense_request', 'expense_request_number',
            'purpose', 'amount', 'status', 'status_display',
            'approved_by', 'approved_by_name', 'approved_at',
            'settled_amount', 'settlement_date', 'balance',
            'notes', 'is_active', 'created_at', 'updated_at'
        ]

    def get_requester_name(self, obj):
        """Get requester name with fallback to username."""
        full_name = obj.requester.get_full_name()
        if full_name and full_name.strip():
            return full_name
        return obj.requester.username

    def get_approved_by_name(self, obj):
        """Get approved_by name with fallback to username."""
        if not obj.approved_by:
            return None
        full_name = obj.approved_by.get_full_name()
        if full_name and full_name.strip():
            return full_name
        return obj.approved_by.username


class ExpenseAdvanceCreateSerializer(serializers.ModelSerializer):
    """Create serializer for ExpenseAdvance."""

    class Meta:
        model = ExpenseAdvance
        fields = ['expense_request', 'purpose', 'amount', 'notes']

    def create(self, validated_data):
        request = self.context['request']
        validated_data['requester'] = request.user
        validated_data['created_by'] = request.user
        return super().create(validated_data)


class ExpenseAdvanceSettleSerializer(serializers.Serializer):
    """Serializer for settling expense advance."""
    settled_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    settlement_date = serializers.DateField(required=False)
