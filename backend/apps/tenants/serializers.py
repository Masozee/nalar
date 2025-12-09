"""Serializers for tenant models."""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tenant, TenantUser, Subscription, Invoice, TenantRole, PlanType

User = get_user_model()


class TenantSerializer(serializers.ModelSerializer):
    """Serializer for Tenant model."""

    user_count = serializers.SerializerMethodField()
    is_trial = serializers.SerializerMethodField()
    plan_display = serializers.CharField(source='get_plan_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Tenant
        fields = [
            'id',
            'name',
            'slug',
            'subdomain',
            'email',
            'phone',
            'website',
            'address',
            'city',
            'state',
            'country',
            'postal_code',
            'status',
            'status_display',
            'plan',
            'plan_display',
            'max_users',
            'max_storage_gb',
            'enabled_modules',
            'settings',
            'logo',
            'primary_color',
            'trial_ends_at',
            'subscription_ends_at',
            'user_count',
            'is_trial',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_user_count(self, obj):
        """Get number of active users in tenant."""
        return obj.get_user_count()

    def get_is_trial(self, obj):
        """Check if tenant is in trial period."""
        return obj.is_trial


class TenantUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tenant settings."""

    class Meta:
        model = Tenant
        fields = [
            'name',
            'email',
            'phone',
            'website',
            'address',
            'city',
            'state',
            'country',
            'postal_code',
            'logo',
            'primary_color',
            'settings',
        ]


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for tenant user listing."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'is_active',
            'last_login',
            'date_joined',
        ]

    def get_full_name(self, obj):
        """Get user's full name."""
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class TenantUserSerializer(serializers.ModelSerializer):
    """Serializer for TenantUser model."""

    user = UserBasicSerializer(read_only=True)
    user_email = serializers.EmailField(write_only=True, required=False)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    can_manage_users = serializers.BooleanField(read_only=True)
    can_manage_billing = serializers.BooleanField(read_only=True)

    class Meta:
        model = TenantUser
        fields = [
            'id',
            'tenant',
            'user',
            'user_email',
            'role',
            'role_display',
            'is_owner',
            'is_active',
            'can_manage_users',
            'can_manage_billing',
            'invited_by',
            'invited_at',
            'joined_at',
            'created_at',
        ]
        read_only_fields = ['id', 'tenant', 'invited_at', 'joined_at', 'created_at']

    def create(self, validated_data):
        """Create tenant user with email lookup."""
        user_email = validated_data.pop('user_email', None)
        if user_email:
            try:
                user = User.objects.get(email=user_email)
                validated_data['user'] = user
            except User.DoesNotExist:
                raise serializers.ValidationError({'user_email': 'User with this email does not exist.'})

        return super().create(validated_data)


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscription model."""

    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    plan_display = serializers.CharField(source='get_plan_display', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    days_until_renewal = serializers.SerializerMethodField()

    # Add frontend-expected field names as aliases
    start_date = serializers.DateTimeField(source='current_period_start', read_only=True)
    end_date = serializers.DateTimeField(source='current_period_end', allow_null=True)
    trial_end_date = serializers.DateTimeField(source='tenant.trial_ends_at', read_only=True, allow_null=True)
    auto_renew = serializers.BooleanField(source='is_auto_renew', default=True)

    class Meta:
        model = Subscription
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'plan',
            'plan_display',
            'billing_email',
            'billing_name',
            'billing_address',
            'stripe_customer_id',
            'stripe_subscription_id',
            'current_period_start',
            'current_period_end',
            'start_date',  # Alias for current_period_start
            'end_date',  # Alias for current_period_end
            'trial_end_date',  # From tenant
            'auto_renew',
            'status',
            'is_active',
            'cancel_at_period_end',
            'canceled_at',
            'days_until_renewal',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'tenant',
            'stripe_customer_id',
            'stripe_subscription_id',
            'created_at',
            'updated_at',
        ]

    def get_days_until_renewal(self, obj):
        """Calculate days until subscription renewal."""
        if obj.current_period_end:
            from datetime import datetime, timezone
            delta = obj.current_period_end - datetime.now(timezone.utc)
            return max(0, delta.days)
        return None


class TenantRoleChoicesSerializer(serializers.Serializer):
    """Serializer for tenant role choices."""
    value = serializers.CharField()
    label = serializers.CharField()


class TenantPlanChoicesSerializer(serializers.Serializer):
    """Serializer for tenant plan choices."""
    value = serializers.CharField()
    label = serializers.CharField()


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice model."""

    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    subscription_plan = serializers.CharField(source='subscription.plan', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    days_overdue = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'subscription',
            'subscription_plan',
            'invoice_number',
            'amount',
            'currency',
            'tax_amount',
            'total_amount',
            'description',
            'line_items',
            'status',
            'status_display',
            'issue_date',
            'due_date',
            'paid_date',
            'stripe_invoice_id',
            'payment_method',
            'pdf_url',
            'days_overdue',
            'is_overdue',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'tenant',
            'invoice_number',
            'stripe_invoice_id',
            'created_at',
            'updated_at',
        ]

    def get_days_overdue(self, obj):
        """Calculate days overdue if invoice is unpaid and past due date."""
        if obj.status not in ['paid', 'canceled', 'refunded'] and obj.due_date:
            from datetime import date
            delta = date.today() - obj.due_date
            return max(0, delta.days) if delta.days > 0 else None
        return None

    def get_is_overdue(self, obj):
        """Check if invoice is overdue."""
        days_overdue = self.get_days_overdue(obj)
        return days_overdue is not None and days_overdue > 0
