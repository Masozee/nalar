from rest_framework import serializers
from django.utils import timezone
from .models import Room, RoomBooking, BookingStatus


class RoomSerializer(serializers.ModelSerializer):
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    facilities = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'name', 'code', 'room_type', 'room_type_display',
            'floor', 'building', 'capacity', 'description',
            'has_projector', 'has_whiteboard', 'has_video_conference',
            'has_teleconference', 'has_ac', 'facilities',
            'requires_approval', 'max_booking_hours', 'advance_booking_days',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_facilities(self, obj):
        facilities = []
        if obj.has_projector:
            facilities.append('Proyektor')
        if obj.has_whiteboard:
            facilities.append('Whiteboard')
        if obj.has_video_conference:
            facilities.append('Video Conference')
        if obj.has_teleconference:
            facilities.append('Teleconference')
        if obj.has_ac:
            facilities.append('AC')
        return facilities


class RoomBookingSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.name', read_only=True)
    booked_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    duration_hours = serializers.SerializerMethodField()

    class Meta:
        model = RoomBooking
        fields = [
            'id', 'room', 'room_name', 'booked_by', 'booked_by_name',
            'title', 'description', 'start_time', 'end_time', 'duration_hours',
            'status', 'status_display', 'expected_attendees',
            'approved_by', 'approved_by_name', 'approved_at',
            'rejection_reason', 'cancelled_at', 'cancellation_reason',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'booked_by', 'approved_by', 'approved_at',
            'cancelled_at', 'created_at', 'updated_at',
        ]

    def get_booked_by_name(self, obj):
        return obj.booked_by.get_full_name() or obj.booked_by.email

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.email
        return None

    def get_duration_hours(self, obj):
        if obj.start_time and obj.end_time:
            delta = obj.end_time - obj.start_time
            return round(delta.total_seconds() / 3600, 1)
        return None

    def validate(self, data):
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        room = data.get('room')

        if start_time and end_time:
            if end_time <= start_time:
                raise serializers.ValidationError({
                    'end_time': 'End time must be after start time.'
                })

            # Check room max booking hours
            if room:
                duration = (end_time - start_time).total_seconds() / 3600
                if duration > room.max_booking_hours:
                    raise serializers.ValidationError({
                        'end_time': f'Booking cannot exceed {room.max_booking_hours} hours.'
                    })

            # Check for overlapping bookings
            overlapping = RoomBooking.objects.filter(
                room=room,
                status__in=[BookingStatus.PENDING, BookingStatus.APPROVED],
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)

            if overlapping.exists():
                raise serializers.ValidationError({
                    'start_time': 'This room is already booked for the selected time.'
                })

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['booked_by'] = request.user
        return super().create(validated_data)


class RoomBookingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    room_name = serializers.CharField(source='room.name', read_only=True)
    booked_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = RoomBooking
        fields = [
            'id', 'room', 'room_name', 'title', 'booked_by_name',
            'start_time', 'end_time', 'status', 'status_display',
            'expected_attendees',
        ]

    def get_booked_by_name(self, obj):
        return obj.booked_by.get_full_name() or obj.booked_by.email


class BookingApprovalSerializer(serializers.Serializer):
    approved = serializers.BooleanField()
    reason = serializers.CharField(required=False, allow_blank=True)


class BookingCancellationSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
