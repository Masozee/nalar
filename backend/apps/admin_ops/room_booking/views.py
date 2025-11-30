from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
from .models import Room, RoomBooking, BookingStatus
from .serializers import (
    RoomSerializer,
    RoomBookingSerializer,
    RoomBookingListSerializer,
    BookingApprovalSerializer,
    BookingCancellationSerializer,
)


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.filter(is_active=True)
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'code', 'description']
    filterset_fields = ['room_type', 'building', 'floor', 'requires_approval']
    ordering_fields = ['name', 'capacity', 'building', 'floor']

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Get room availability for a date range."""
        room = self.get_object()
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date:
            start_date = timezone.now().date()
        if not end_date:
            end_date = start_date + timedelta(days=7)

        bookings = RoomBooking.objects.filter(
            room=room,
            status__in=[BookingStatus.PENDING, BookingStatus.APPROVED],
            start_time__date__lte=end_date,
            end_time__date__gte=start_date,
        ).values('id', 'title', 'start_time', 'end_time', 'status')

        return Response({
            'room': RoomSerializer(room).data,
            'bookings': list(bookings),
        })

    @action(detail=False, methods=['get'])
    def by_capacity(self, request):
        """Filter rooms by minimum capacity."""
        min_capacity = request.query_params.get('min_capacity', 1)
        rooms = self.queryset.filter(capacity__gte=min_capacity)
        serializer = self.get_serializer(rooms, many=True)
        return Response(serializer.data)


class RoomBookingViewSet(viewsets.ModelViewSet):
    queryset = RoomBooking.objects.select_related('room', 'booked_by', 'approved_by')
    serializer_class = RoomBookingSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['title', 'description', 'room__name']
    filterset_fields = ['status', 'room']
    ordering_fields = ['start_time', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return RoomBookingListSerializer
        return RoomBookingSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if start_date:
            qs = qs.filter(start_time__date__gte=start_date)
        if end_date:
            qs = qs.filter(end_time__date__lte=end_date)

        return qs

    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Get current user's bookings."""
        bookings = self.queryset.filter(booked_by=request.user)
        serializer = RoomBookingListSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get bookings pending approval (for admins)."""
        bookings = self.queryset.filter(
            status=BookingStatus.PENDING,
            room__requires_approval=True,
        )
        serializer = RoomBookingListSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's bookings."""
        today = timezone.now().date()
        bookings = self.queryset.filter(
            start_time__date=today,
            status__in=[BookingStatus.APPROVED, BookingStatus.PENDING],
        )
        serializer = RoomBookingListSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming bookings (next 7 days)."""
        now = timezone.now()
        end_date = now + timedelta(days=7)
        bookings = self.queryset.filter(
            start_time__gte=now,
            start_time__lte=end_date,
            status__in=[BookingStatus.APPROVED, BookingStatus.PENDING],
        )
        serializer = RoomBookingListSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve or reject a booking."""
        booking = self.get_object()
        serializer = BookingApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if booking.status != BookingStatus.PENDING:
            return Response(
                {'error': 'Only pending bookings can be approved/rejected.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if serializer.validated_data['approved']:
            booking.status = BookingStatus.APPROVED
            booking.approved_by = request.user
            booking.approved_at = timezone.now()
        else:
            booking.status = BookingStatus.REJECTED
            booking.rejection_reason = serializer.validated_data.get('reason', '')

        booking.save()
        return Response(RoomBookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking."""
        booking = self.get_object()
        serializer = BookingCancellationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if booking.status in [BookingStatus.CANCELLED, BookingStatus.COMPLETED]:
            return Response(
                {'error': 'Booking cannot be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only allow cancellation by booker or admin
        if booking.booked_by != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Only the booker or admin can cancel this booking.'},
                status=status.HTTP_403_FORBIDDEN
            )

        booking.status = BookingStatus.CANCELLED
        booking.cancelled_at = timezone.now()
        booking.cancellation_reason = serializer.validated_data.get('reason', '')
        booking.save()

        return Response(RoomBookingSerializer(booking).data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get booking statistics."""
        from django.db.models import Count
        from django.db.models.functions import TruncMonth

        # Monthly booking counts
        monthly = RoomBooking.objects.filter(
            status__in=[BookingStatus.APPROVED, BookingStatus.COMPLETED]
        ).annotate(
            month=TruncMonth('start_time')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('-month')[:12]

        # By room
        by_room = RoomBooking.objects.filter(
            status__in=[BookingStatus.APPROVED, BookingStatus.COMPLETED]
        ).values('room__name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]

        # Status summary
        status_summary = RoomBooking.objects.values('status').annotate(
            count=Count('id')
        )

        return Response({
            'monthly': list(monthly),
            'by_room': list(by_room),
            'status_summary': list(status_summary),
        })
