from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count
from datetime import timedelta
from .models import Vehicle, Driver, VehicleBooking, VehicleMaintenance, BookingStatus, VehicleStatus
from .serializers import (
    VehicleSerializer,
    DriverSerializer,
    VehicleBookingSerializer,
    VehicleBookingListSerializer,
    VehicleMaintenanceSerializer,
    BookingApprovalSerializer,
    TripStartSerializer,
    TripEndSerializer,
)


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'plate_number', 'brand', 'model']
    filterset_fields = ['vehicle_type', 'status', 'is_active']
    ordering_fields = ['name', 'plate_number', 'current_odometer']

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available vehicles."""
        vehicles = self.queryset.filter(
            status=VehicleStatus.AVAILABLE,
            is_active=True,
        )
        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Get vehicle availability for a date range."""
        vehicle = self.get_object()
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date:
            start_date = timezone.now().date()
        if not end_date:
            end_date = start_date + timedelta(days=7)

        bookings = VehicleBooking.objects.filter(
            vehicle=vehicle,
            status__in=[BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.IN_PROGRESS],
            start_time__date__lte=end_date,
            end_time__date__gte=start_date,
        ).values('id', 'purpose', 'destination', 'start_time', 'end_time', 'status')

        return Response({
            'vehicle': VehicleSerializer(vehicle).data,
            'bookings': list(bookings),
        })

    @action(detail=False, methods=['get'])
    def expiring_documents(self, request):
        """Get vehicles with expiring documents (within 30 days)."""
        threshold = timezone.now().date() + timedelta(days=30)
        vehicles = self.queryset.filter(
            is_active=True,
        ).filter(
            models.Q(stnk_expiry__lte=threshold) |
            models.Q(kir_expiry__lte=threshold) |
            models.Q(insurance_expiry__lte=threshold)
        )
        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def due_for_service(self, request):
        """Get vehicles due for service."""
        today = timezone.now().date()
        vehicles = self.queryset.filter(
            is_active=True,
            next_service_date__lte=today + timedelta(days=7),
        )
        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.select_related('user').filter(is_active=True)
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['user__email', 'user__first_name', 'license_number']
    filterset_fields = ['license_type']

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get drivers not currently on a trip."""
        # Get drivers with active trips
        active_trip_drivers = VehicleBooking.objects.filter(
            status=BookingStatus.IN_PROGRESS,
            driver__isnull=False,
        ).values_list('driver_id', flat=True)

        drivers = self.queryset.exclude(id__in=active_trip_drivers)
        serializer = self.get_serializer(drivers, many=True)
        return Response(serializer.data)


class VehicleBookingViewSet(viewsets.ModelViewSet):
    queryset = VehicleBooking.objects.select_related(
        'vehicle', 'booked_by', 'driver', 'approved_by'
    )
    serializer_class = VehicleBookingSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['purpose', 'destination', 'vehicle__plate_number']
    filterset_fields = ['status', 'vehicle']
    ordering_fields = ['start_time', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return VehicleBookingListSerializer
        return VehicleBookingSerializer

    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Get current user's bookings."""
        bookings = self.queryset.filter(booked_by=request.user)
        serializer = VehicleBookingListSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get bookings pending approval."""
        bookings = self.queryset.filter(status=BookingStatus.PENDING)
        serializer = VehicleBookingListSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's bookings."""
        today = timezone.now().date()
        bookings = self.queryset.filter(
            start_time__date=today,
            status__in=[BookingStatus.APPROVED, BookingStatus.IN_PROGRESS],
        )
        serializer = VehicleBookingListSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active trips (in progress)."""
        bookings = self.queryset.filter(status=BookingStatus.IN_PROGRESS)
        serializer = VehicleBookingListSerializer(bookings, many=True)
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
        return Response(VehicleBookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def start_trip(self, request, pk=None):
        """Start a trip - record actual start time and odometer."""
        booking = self.get_object()
        serializer = TripStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if booking.status != BookingStatus.APPROVED:
            return Response(
                {'error': 'Only approved bookings can start.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = BookingStatus.IN_PROGRESS
        booking.actual_start_time = timezone.now()
        booking.start_odometer = serializer.validated_data['start_odometer']
        booking.save()

        # Update vehicle status
        booking.vehicle.status = VehicleStatus.IN_USE
        booking.vehicle.save(update_fields=['status'])

        return Response(VehicleBookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def end_trip(self, request, pk=None):
        """End a trip - record actual end time, odometer, and fuel."""
        booking = self.get_object()
        serializer = TripEndSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if booking.status != BookingStatus.IN_PROGRESS:
            return Response(
                {'error': 'Only in-progress trips can be ended.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = BookingStatus.COMPLETED
        booking.actual_end_time = timezone.now()
        booking.end_odometer = serializer.validated_data['end_odometer']
        booking.fuel_used = serializer.validated_data.get('fuel_used')
        booking.fuel_cost = serializer.validated_data.get('fuel_cost')
        if serializer.validated_data.get('notes'):
            booking.notes = serializer.validated_data['notes']
        booking.save()

        # Update vehicle status and odometer
        booking.vehicle.status = VehicleStatus.AVAILABLE
        booking.vehicle.current_odometer = booking.end_odometer
        booking.vehicle.save(update_fields=['status', 'current_odometer'])

        return Response(VehicleBookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking."""
        booking = self.get_object()

        if booking.status in [BookingStatus.COMPLETED, BookingStatus.CANCELLED]:
            return Response(
                {'error': 'Booking cannot be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.booked_by != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Only the booker or admin can cancel this booking.'},
                status=status.HTTP_403_FORBIDDEN
            )

        booking.status = BookingStatus.CANCELLED
        booking.save()

        return Response(VehicleBookingSerializer(booking).data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get booking statistics."""
        from django.db.models.functions import TruncMonth

        # Monthly stats
        monthly = VehicleBooking.objects.filter(
            status=BookingStatus.COMPLETED
        ).annotate(
            month=TruncMonth('start_time')
        ).values('month').annotate(
            count=Count('id'),
            total_distance=Sum('end_odometer') - Sum('start_odometer'),
            total_fuel_cost=Sum('fuel_cost'),
        ).order_by('-month')[:12]

        # By vehicle
        by_vehicle = VehicleBooking.objects.filter(
            status=BookingStatus.COMPLETED
        ).values('vehicle__name', 'vehicle__plate_number').annotate(
            count=Count('id'),
        ).order_by('-count')[:10]

        return Response({
            'monthly': list(monthly),
            'by_vehicle': list(by_vehicle),
        })


class VehicleMaintenanceViewSet(viewsets.ModelViewSet):
    queryset = VehicleMaintenance.objects.select_related('vehicle')
    serializer_class = VehicleMaintenanceSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['vehicle__plate_number', 'maintenance_type', 'vendor']
    filterset_fields = ['vehicle', 'maintenance_type']
    ordering_fields = ['service_date', 'cost']

    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        """Get maintenance records for a specific vehicle."""
        vehicle_id = request.query_params.get('vehicle_id')
        if not vehicle_id:
            return Response(
                {'error': 'vehicle_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        records = self.queryset.filter(vehicle_id=vehicle_id)
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)
