from django.contrib import admin
from .models import Room, RoomBooking


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'code', 'room_type', 'floor', 'building',
        'capacity', 'requires_approval', 'is_active',
    ]
    list_filter = ['room_type', 'building', 'floor', 'requires_approval', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering = ['building', 'floor', 'name']

    fieldsets = (
        (None, {
            'fields': ('name', 'code', 'room_type', 'description')
        }),
        ('Location', {
            'fields': ('building', 'floor')
        }),
        ('Capacity & Facilities', {
            'fields': (
                'capacity',
                ('has_projector', 'has_whiteboard'),
                ('has_video_conference', 'has_teleconference'),
                'has_ac',
            )
        }),
        ('Booking Rules', {
            'fields': ('requires_approval', 'max_booking_hours', 'advance_booking_days')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(RoomBooking)
class RoomBookingAdmin(admin.ModelAdmin):
    list_display = [
        'room', 'title', 'booked_by', 'start_time', 'end_time',
        'status', 'expected_attendees',
    ]
    list_filter = ['status', 'room', 'start_time']
    search_fields = ['title', 'description', 'booked_by__email', 'room__name']
    date_hierarchy = 'start_time'
    raw_id_fields = ['booked_by', 'approved_by']
    ordering = ['-start_time']

    fieldsets = (
        (None, {
            'fields': ('room', 'title', 'description', 'booked_by')
        }),
        ('Schedule', {
            'fields': ('start_time', 'end_time', 'expected_attendees')
        }),
        ('Status', {
            'fields': ('status', 'notes')
        }),
        ('Approval', {
            'fields': ('approved_by', 'approved_at', 'rejection_reason'),
            'classes': ('collapse',)
        }),
        ('Cancellation', {
            'fields': ('cancelled_at', 'cancellation_reason'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['approved_at', 'cancelled_at']
