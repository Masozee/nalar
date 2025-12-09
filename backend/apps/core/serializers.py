"""Core serializers for audit logs and shared functionality."""

from rest_framework import serializers
from .models import AuditLog


class AuditLogUserSerializer(serializers.Serializer):
    """Nested user serializer for audit logs."""
    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    full_name = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        """Get user's full name."""
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username or obj.email


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for audit log entries."""

    user = serializers.SerializerMethodField()
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'action',
            'action_display',
            'model_name',
            'object_id',
            'changes',
            'ip_address',
            'user_agent',
            'timestamp',
            'created_at',
        ]
        read_only_fields = ['id', 'timestamp', 'created_at']

    def get_user(self, obj):
        """Get user info or return None for system actions."""
        if obj.user:
            return AuditLogUserSerializer(obj.user).data
        return None
