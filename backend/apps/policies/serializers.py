from rest_framework import serializers
from .models import Policy, PolicyCategory, PolicyApproval, PolicyAcknowledgment


class PolicyCategorySerializer(serializers.ModelSerializer):
    policy_count = serializers.SerializerMethodField()

    class Meta:
        model = PolicyCategory
        fields = ['id', 'name', 'description', 'order', 'policy_count']

    def get_policy_count(self, obj):
        return obj.policies.count()


class PolicyApprovalSerializer(serializers.ModelSerializer):
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    approver_username = serializers.CharField(source='approver.username', read_only=True)

    class Meta:
        model = PolicyApproval
        fields = [
            'id', 'policy', 'approver', 'approver_name', 'approver_username',
            'approver_title', 'order', 'status', 'approved_at', 'comments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PolicyListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approval_status = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Policy
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'version', 'effective_date', 'expiry_date', 'status',
            'requires_acknowledgment', 'created_by', 'created_by_name',
            'tags', 'is_active', 'view_count', 'file_url', 'file_name',
            'approval_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'view_count']

    def get_approval_status(self, obj):
        approvals = obj.approvals.all()
        total = approvals.count()
        approved = approvals.filter(status='approved').count()
        return {
            'total': total,
            'approved': approved,
            'pending': total - approved
        }

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class PolicyDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approvals = PolicyApprovalSerializer(many=True, read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Policy
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'content', 'file', 'file_url', 'file_size', 'file_name',
            'version', 'effective_date', 'expiry_date', 'status',
            'requires_acknowledgment', 'created_by', 'created_by_name',
            'tags', 'is_active', 'view_count', 'approvals',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'view_count']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class PolicyAcknowledgmentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    policy_title = serializers.CharField(source='policy.title', read_only=True)

    class Meta:
        model = PolicyAcknowledgment
        fields = [
            'id', 'policy', 'policy_title', 'user', 'user_name',
            'acknowledged_at', 'ip_address', 'created_at'
        ]
        read_only_fields = ['acknowledged_at', 'created_at']
