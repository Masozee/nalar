from rest_framework import serializers
from .models import Vehicle, Driver, VehicleBooking, VehicleMaintenance, BookingStatus


class DriverSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = [
            'id', 'user', 'name', 'license_number', 'license_type',
            'license_expiry', 'phone', 'is_active',
        ]
        read_only_fields = ['id']

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.email


class VehicleSerializer(serializers.ModelSerializer):
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assigned_driver_name = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            'id', 'name', 'plate_number', 'vehicle_type', 'vehicle_type_display',
            'brand', 'model', 'year', 'color', 'capacity',
            'status', 'status_display',
            'stnk_expiry', 'kir_expiry', 'insurance_expiry',
            'last_service_date', 'next_service_date', 'current_odometer',
            'assigned_driver', 'assigned_driver_name', 'notes',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_assigned_driver_name(self, obj):
        if obj.assigned_driver:
            return obj.assigned_driver.get_full_name() or obj.assigned_driver.email
        return None


class VehicleBookingSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    booked_by_name = serializers.SerializerMethodField()
    driver_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    distance_traveled = serializers.IntegerField(read_only=True)

    class Meta:
        model = VehicleBooking
        fields = [
            'id', 'vehicle', 'vehicle_name', 'vehicle_plate',
            'booked_by', 'booked_by_name', 'driver', 'driver_name',
            'purpose', 'destination', 'description',
            'start_time', 'end_time', 'actual_start_time', 'actual_end_time',
            'passenger_count', 'passengers',
            'status', 'status_display',
            'start_odometer', 'end_odometer', 'distance_traveled',
            'fuel_used', 'fuel_cost',
            'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'booked_by', 'approved_by', 'approved_at',
            'created_at', 'updated_at',
        ]

    def get_booked_by_name(self, obj):
        return obj.booked_by.get_full_name() or obj.booked_by.email

    def get_driver_name(self, obj):
        if obj.driver:
            return obj.driver.user.get_full_name() or obj.driver.user.email
        return None

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.email
        return None

    def validate(self, data):
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        vehicle = data.get('vehicle')

        if start_time and end_time:
            if end_time <= start_time:
                raise serializers.ValidationError({
                    'end_time': 'End time must be after start time.'
                })

            # Check for overlapping bookings
            overlapping = VehicleBooking.objects.filter(
                vehicle=vehicle,
                status__in=[BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.IN_PROGRESS],
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)

            if overlapping.exists():
                raise serializers.ValidationError({
                    'start_time': 'This vehicle is already booked for the selected time.'
                })

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['booked_by'] = request.user
        return super().create(validated_data)


class VehicleBookingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    booked_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = VehicleBooking
        fields = [
            'id', 'vehicle', 'vehicle_name', 'vehicle_plate',
            'purpose', 'destination', 'booked_by_name',
            'start_time', 'end_time', 'status', 'status_display',
        ]

    def get_booked_by_name(self, obj):
        return obj.booked_by.get_full_name() or obj.booked_by.email


class VehicleMaintenanceSerializer(serializers.ModelSerializer):
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)

    class Meta:
        model = VehicleMaintenance
        fields = [
            'id', 'vehicle', 'vehicle_plate', 'maintenance_type',
            'description', 'service_date', 'odometer_reading',
            'cost', 'vendor', 'next_service_odometer', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookingApprovalSerializer(serializers.Serializer):
    approved = serializers.BooleanField()
    reason = serializers.CharField(required=False, allow_blank=True)


class TripStartSerializer(serializers.Serializer):
    start_odometer = serializers.IntegerField()


class TripEndSerializer(serializers.Serializer):
    end_odometer = serializers.IntegerField()
    fuel_used = serializers.DecimalField(max_digits=6, decimal_places=2, required=False)
    fuel_cost = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
