from rest_framework import serializers
from django.utils import timezone
from .models import Visitor, VisitLog, VisitorBadge, VisitStatus


class VisitorSerializer(serializers.ModelSerializer):
    id_type_display = serializers.CharField(source='get_id_type_display', read_only=True)
    visit_count = serializers.SerializerMethodField()

    class Meta:
        model = Visitor
        fields = [
            'id', 'name', 'company', 'email', 'phone',
            'id_type', 'id_type_display', 'id_number', 'photo',
            'is_blacklisted', 'blacklist_reason', 'notes',
            'visit_count', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_visit_count(self, obj):
        return obj.visits.count()


class VisitorBadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorBadge
        fields = [
            'id', 'badge_number', 'badge_type', 'is_available',
            'current_holder', 'notes', 'is_active',
        ]
        read_only_fields = ['id', 'current_holder']


class VisitLogSerializer(serializers.ModelSerializer):
    visitor_detail = VisitorSerializer(source='visitor', read_only=True)
    purpose_display = serializers.CharField(source='get_purpose_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    id_type_display = serializers.CharField(source='get_visitor_id_type_display', read_only=True)
    host_email = serializers.CharField(source='host.email', read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)

    class Meta:
        model = VisitLog
        fields = [
            'id', 'visitor', 'visitor_detail',
            'visitor_name', 'visitor_company', 'visitor_phone',
            'visitor_id_type', 'id_type_display', 'visitor_id_number',
            'purpose', 'purpose_display', 'purpose_detail',
            'host', 'host_email', 'host_name', 'host_department',
            'expected_arrival', 'check_in_time', 'check_out_time',
            'duration_minutes', 'status', 'status_display',
            'badge_number', 'belongings',
            'checked_in_by', 'checked_out_by',
            'is_pre_registered', 'pre_registered_by',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'checked_in_by', 'checked_out_by', 'created_at', 'updated_at'
        ]

    def validate(self, data):
        visitor = data.get('visitor')
        if visitor and visitor.is_blacklisted:
            raise serializers.ValidationError({
                'visitor': 'This visitor is blacklisted and cannot be registered.'
            })
        return data


class VisitLogListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    purpose_display = serializers.CharField(source='get_purpose_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = VisitLog
        fields = [
            'id', 'visitor_name', 'visitor_company',
            'purpose', 'purpose_display', 'host_name',
            'check_in_time', 'check_out_time',
            'status', 'status_display', 'badge_number',
        ]


class PreRegisterSerializer(serializers.ModelSerializer):
    """Serializer for pre-registering visitors."""

    class Meta:
        model = VisitLog
        fields = [
            'visitor', 'visitor_name', 'visitor_company', 'visitor_phone',
            'visitor_id_type', 'visitor_id_number',
            'purpose', 'purpose_detail',
            'host', 'host_name', 'host_department',
            'expected_arrival', 'notes',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['is_pre_registered'] = True
        validated_data['pre_registered_by'] = request.user
        validated_data['status'] = VisitStatus.EXPECTED
        return super().create(validated_data)


class CheckInSerializer(serializers.Serializer):
    badge_number = serializers.CharField(required=False, allow_blank=True)
    belongings = serializers.CharField(required=False, allow_blank=True)


class CheckOutSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True)


class WalkInSerializer(serializers.ModelSerializer):
    """Serializer for walk-in visitors (direct check-in)."""

    class Meta:
        model = VisitLog
        fields = [
            'visitor', 'visitor_name', 'visitor_company', 'visitor_phone',
            'visitor_id_type', 'visitor_id_number',
            'purpose', 'purpose_detail',
            'host', 'host_name', 'host_department',
            'badge_number', 'belongings', 'notes',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['status'] = VisitStatus.CHECKED_IN
        validated_data['check_in_time'] = timezone.now()
        validated_data['checked_in_by'] = request.user
        return super().create(validated_data)
