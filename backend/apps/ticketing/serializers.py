from rest_framework import serializers
from .models import Category, SLAPolicy, Ticket, TicketComment, TicketAttachment


class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    children_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'code', 'description',
            'parent', 'parent_name', 'children_count',
            'default_assignee_group', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_children_count(self, obj):
        return obj.children.count()


class SLAPolicySerializer(serializers.ModelSerializer):
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = SLAPolicy
        fields = [
            'id', 'name', 'description', 'priority', 'priority_display',
            'response_time', 'resolution_time', 'business_hours_only',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TicketCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    comment_type_display = serializers.CharField(source='get_comment_type_display', read_only=True)

    class Meta:
        model = TicketComment
        fields = [
            'id', 'ticket', 'author', 'author_name', 'content',
            'comment_type', 'comment_type_display', 'is_first_response',
            'created_at',
        ]
        read_only_fields = ['id', 'author', 'is_first_response', 'created_at']

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.email


class TicketAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TicketAttachment
        fields = [
            'id', 'ticket', 'uploaded_by', 'uploaded_by_name',
            'file', 'filename', 'file_size', 'content_type',
            'created_at',
        ]
        read_only_fields = ['id', 'uploaded_by', 'filename', 'file_size', 'created_at']

    def get_uploaded_by_name(self, obj):
        return obj.uploaded_by.get_full_name() or obj.uploaded_by.email


class TicketSerializer(serializers.ModelSerializer):
    requester_name = serializers.SerializerMethodField()
    assignee_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    ticket_type_display = serializers.CharField(source='get_ticket_type_display', read_only=True)
    comments = TicketCommentSerializer(many=True, read_only=True)
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    sla_status = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_number', 'title', 'description',
            'ticket_type', 'ticket_type_display', 'category', 'category_name',
            'priority', 'priority_display', 'status', 'status_display',
            'requester', 'requester_name', 'assignee', 'assignee_name',
            'sla_policy', 'response_due', 'resolution_due',
            'first_response_at', 'resolved_at', 'closed_at',
            'response_breached', 'resolution_breached', 'sla_status',
            'tags', 'attachments_count', 'related_ticket',
            'comments', 'attachments',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'ticket_number', 'requester', 'first_response_at',
            'resolved_at', 'closed_at', 'response_breached', 'resolution_breached',
            'attachments_count', 'created_at', 'updated_at',
        ]

    def get_requester_name(self, obj):
        return obj.requester.get_full_name() or obj.requester.email

    def get_assignee_name(self, obj):
        if obj.assignee:
            return obj.assignee.get_full_name() or obj.assignee.email
        return None

    def get_sla_status(self, obj):
        if obj.response_breached or obj.resolution_breached:
            return 'breached'
        if obj.status in ['resolved', 'closed']:
            return 'met'
        return 'on_track'


class TicketListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    requester_name = serializers.SerializerMethodField()
    assignee_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_number', 'title', 'priority', 'priority_display',
            'status', 'status_display', 'category_name',
            'requester_name', 'assignee_name',
            'response_breached', 'resolution_breached',
            'created_at',
        ]

    def get_requester_name(self, obj):
        return obj.requester.get_full_name() or obj.requester.email

    def get_assignee_name(self, obj):
        if obj.assignee:
            return obj.assignee.get_full_name() or obj.assignee.email
        return None


class TicketCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tickets."""

    class Meta:
        model = Ticket
        fields = [
            'title', 'description', 'ticket_type', 'category',
            'priority', 'tags',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['requester'] = request.user
        return super().create(validated_data)


class TicketAssignSerializer(serializers.Serializer):
    assignee_id = serializers.UUIDField()


class TicketStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        'in_progress', 'waiting_user', 'waiting_vendor',
        'resolved', 'closed', 'cancelled',
    ])
    comment = serializers.CharField(required=False, allow_blank=True)
