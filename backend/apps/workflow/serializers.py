from rest_framework import serializers
from .models import (
    WorkflowTemplate,
    WorkflowStep,
    ApprovalRequest,
    ApprovalAction,
    ApprovalDelegate,
)


class WorkflowStepSerializer(serializers.ModelSerializer):
    approver_type_display = serializers.CharField(
        source='get_approver_type_display', read_only=True
    )

    class Meta:
        model = WorkflowStep
        fields = [
            'id', 'name', 'step_order', 'approver_type', 'approver_type_display',
            'approver_role', 'approver_user', 'approver_group',
            'can_reject', 'can_request_revision', 'requires_comment',
            'auto_approve_days', 'notify_on_pending', 'notify_on_complete',
        ]
        read_only_fields = ['id']


class WorkflowTemplateSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(many=True, read_only=True)
    content_type_name = serializers.SerializerMethodField()

    class Meta:
        model = WorkflowTemplate
        fields = [
            'id', 'name', 'code', 'description',
            'content_type', 'content_type_name',
            'auto_approve_threshold', 'steps',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_content_type_name(self, obj):
        return f"{obj.content_type.app_label}.{obj.content_type.model}"


class WorkflowTemplateListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    steps_count = serializers.SerializerMethodField()

    class Meta:
        model = WorkflowTemplate
        fields = ['id', 'name', 'code', 'steps_count', 'is_active']

    def get_steps_count(self, obj):
        return obj.steps.count()


class ApprovalActionSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    actor_name = serializers.SerializerMethodField()
    step_name = serializers.CharField(source='step.name', read_only=True)

    class Meta:
        model = ApprovalAction
        fields = [
            'id', 'step', 'step_name', 'action', 'action_display',
            'actor', 'actor_name', 'comment', 'acted_at', 'reassigned_to',
        ]
        read_only_fields = ['id', 'acted_at']

    def get_actor_name(self, obj):
        return obj.actor.get_full_name() or obj.actor.email


class ApprovalRequestSerializer(serializers.ModelSerializer):
    workflow_name = serializers.CharField(source='workflow.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requester_name = serializers.SerializerMethodField()
    current_step_name = serializers.SerializerMethodField()
    actions = ApprovalActionSerializer(many=True, read_only=True)

    class Meta:
        model = ApprovalRequest
        fields = [
            'id', 'workflow', 'workflow_name', 'title', 'description',
            'requester', 'requester_name', 'status', 'status_display',
            'current_step', 'current_step_name', 'value',
            'submitted_at', 'completed_at', 'actions',
            'content_type', 'object_id',
        ]
        read_only_fields = ['id', 'submitted_at', 'completed_at']

    def get_requester_name(self, obj):
        return obj.requester.get_full_name() or obj.requester.email

    def get_current_step_name(self, obj):
        step = obj.get_current_step_instance()
        return step.name if step else None


class ApprovalRequestListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    workflow_name = serializers.CharField(source='workflow.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requester_name = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalRequest
        fields = [
            'id', 'workflow_name', 'title', 'requester_name',
            'status', 'status_display', 'current_step', 'submitted_at',
        ]

    def get_requester_name(self, obj):
        return obj.requester.get_full_name() or obj.requester.email


class ApprovalActionCreateSerializer(serializers.Serializer):
    """Serializer for taking approval actions."""
    action = serializers.ChoiceField(choices=['approve', 'reject', 'revision'])
    comment = serializers.CharField(required=False, allow_blank=True)


class ApprovalDelegateSerializer(serializers.ModelSerializer):
    delegator_name = serializers.SerializerMethodField()
    delegate_name = serializers.SerializerMethodField()
    workflow_name = serializers.CharField(source='workflow.name', read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = ApprovalDelegate
        fields = [
            'id', 'delegator', 'delegator_name', 'delegate', 'delegate_name',
            'workflow', 'workflow_name', 'start_date', 'end_date', 'reason',
            'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_delegator_name(self, obj):
        return obj.delegator.get_full_name() or obj.delegator.email

    def get_delegate_name(self, obj):
        return obj.delegate.get_full_name() or obj.delegate.email
