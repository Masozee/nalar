"""
Room Booking models for meeting room and facility reservations.
"""
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from apps.core.models import TenantBaseModel, AuditMixin


class RoomType(models.TextChoices):
    MEETING = 'meeting', 'Ruang Meeting'
    CONFERENCE = 'conference', 'Ruang Konferensi'
    TRAINING = 'training', 'Ruang Training'
    AUDITORIUM = 'auditorium', 'Auditorium'
    BOARDROOM = 'boardroom', 'Ruang Direksi'
    HUDDLE = 'huddle', 'Ruang Diskusi Kecil'


class BookingStatus(models.TextChoices):
    PENDING = 'pending', 'Menunggu'
    APPROVED = 'approved', 'Disetujui'
    REJECTED = 'rejected', 'Ditolak'
    CANCELLED = 'cancelled', 'Dibatalkan'
    COMPLETED = 'completed', 'Selesai'


class Room(TenantBaseModel):
    """Meeting rooms and facilities available for booking."""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    room_type = models.CharField(
        max_length=20,
        choices=RoomType.choices,
        default=RoomType.MEETING,
    )
    floor = models.CharField(max_length=10, blank=True)
    building = models.CharField(max_length=100, blank=True)
    capacity = models.PositiveIntegerField(default=10)
    description = models.TextField(blank=True)

    # Facilities
    has_projector = models.BooleanField(default=False)
    has_whiteboard = models.BooleanField(default=False)
    has_video_conference = models.BooleanField(default=False)
    has_teleconference = models.BooleanField(default=False)
    has_ac = models.BooleanField(default=True)

    # Booking rules
    requires_approval = models.BooleanField(default=False)
    max_booking_hours = models.PositiveIntegerField(default=8)
    advance_booking_days = models.PositiveIntegerField(default=30)

    class Meta:
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
        ordering = ['building', 'floor', 'name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['room_type']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"


class RoomBooking(TenantBaseModel, AuditMixin):
    """Room reservation records."""
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name='bookings',
    )
    booked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='room_bookings',
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING,
    )

    # Attendee count for reporting
    expected_attendees = models.PositiveIntegerField(default=1)

    # Approval
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_room_bookings',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    # Cancellation
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    # Notes
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Room Booking'
        verbose_name_plural = 'Room Bookings'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['room', 'start_time', 'end_time']),
            models.Index(fields=['booked_by', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['start_time']),
        ]

    def __str__(self):
        return f"{self.room.name} - {self.title} ({self.start_time.strftime('%Y-%m-%d %H:%M')})"

    def clean(self):
        if self.start_time and self.end_time:
            if self.end_time <= self.start_time:
                raise ValidationError('End time must be after start time.')

            # Check for overlapping bookings
            overlapping = RoomBooking.objects.filter(
                room=self.room,
                status__in=[BookingStatus.PENDING, BookingStatus.APPROVED],
                start_time__lt=self.end_time,
                end_time__gt=self.start_time,
            ).exclude(pk=self.pk)

            if overlapping.exists():
                raise ValidationError('This room is already booked for the selected time.')

    def save(self, *args, **kwargs):
        # Auto-approve if room doesn't require approval
        if self._state.adding and not self.room.requires_approval:
            self.status = BookingStatus.APPROVED
        super().save(*args, **kwargs)
