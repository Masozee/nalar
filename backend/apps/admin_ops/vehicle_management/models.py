"""
Vehicle Management models for operational vehicle booking and tracking.
"""
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from apps.core.models import TenantBaseModel, AuditMixin


class VehicleType(models.TextChoices):
    CAR = 'car', 'Mobil'
    MPV = 'mpv', 'MPV'
    SUV = 'suv', 'SUV'
    VAN = 'van', 'Van'
    BUS = 'bus', 'Bus'
    MOTORCYCLE = 'motorcycle', 'Motor'


class VehicleStatus(models.TextChoices):
    AVAILABLE = 'available', 'Tersedia'
    IN_USE = 'in_use', 'Sedang Digunakan'
    MAINTENANCE = 'maintenance', 'Dalam Perawatan'
    UNAVAILABLE = 'unavailable', 'Tidak Tersedia'


class BookingStatus(models.TextChoices):
    PENDING = 'pending', 'Menunggu'
    APPROVED = 'approved', 'Disetujui'
    REJECTED = 'rejected', 'Ditolak'
    IN_PROGRESS = 'in_progress', 'Sedang Berlangsung'
    COMPLETED = 'completed', 'Selesai'
    CANCELLED = 'cancelled', 'Dibatalkan'


class Vehicle(TenantBaseModel):
    """Operational vehicles available for booking."""
    name = models.CharField(max_length=100)
    plate_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(
        max_length=20,
        choices=VehicleType.choices,
        default=VehicleType.CAR,
    )
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    color = models.CharField(max_length=30, blank=True)
    capacity = models.PositiveIntegerField(default=4, help_text='Passenger capacity')

    status = models.CharField(
        max_length=20,
        choices=VehicleStatus.choices,
        default=VehicleStatus.AVAILABLE,
    )

    # Documents
    stnk_expiry = models.DateField(null=True, blank=True, verbose_name='STNK Expiry')
    kir_expiry = models.DateField(null=True, blank=True, verbose_name='KIR Expiry')
    insurance_expiry = models.DateField(null=True, blank=True)

    # Maintenance
    last_service_date = models.DateField(null=True, blank=True)
    next_service_date = models.DateField(null=True, blank=True)
    current_odometer = models.PositiveIntegerField(default=0, help_text='Current KM')

    # Assigned driver (optional)
    assigned_driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_vehicles',
    )

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'
        ordering = ['name']
        indexes = [
            models.Index(fields=['plate_number']),
            models.Index(fields=['status']),
            models.Index(fields=['vehicle_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.plate_number})"


class Driver(TenantBaseModel):
    """Driver information for vehicle assignments."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='driver_profile',
    )
    license_number = models.CharField(max_length=50, unique=True, verbose_name='SIM Number')
    license_type = models.CharField(max_length=10, help_text='A, B1, B2, etc.')
    license_expiry = models.DateField()
    phone = models.CharField(max_length=20)

    class Meta:
        verbose_name = 'Driver'
        verbose_name_plural = 'Drivers'

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} - {self.license_number}"


class VehicleBooking(TenantBaseModel, AuditMixin):
    """Vehicle reservation records."""
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='bookings',
    )
    booked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vehicle_bookings',
    )
    driver = models.ForeignKey(
        Driver,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='trips',
    )

    purpose = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)

    passenger_count = models.PositiveIntegerField(default=1)
    passengers = models.TextField(blank=True, help_text='List of passenger names')

    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING,
    )

    # Odometer readings
    start_odometer = models.PositiveIntegerField(null=True, blank=True)
    end_odometer = models.PositiveIntegerField(null=True, blank=True)

    # Fuel
    fuel_used = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        help_text='Liters'
    )
    fuel_cost = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    # Approval
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_vehicle_bookings',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Vehicle Booking'
        verbose_name_plural = 'Vehicle Bookings'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['vehicle', 'start_time', 'end_time']),
            models.Index(fields=['booked_by', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['start_time']),
        ]

    def __str__(self):
        return f"{self.vehicle.plate_number} - {self.purpose} ({self.start_time.strftime('%Y-%m-%d')})"

    @property
    def distance_traveled(self):
        if self.start_odometer and self.end_odometer:
            return self.end_odometer - self.start_odometer
        return None

    def clean(self):
        if self.start_time and self.end_time:
            if self.end_time <= self.start_time:
                raise ValidationError('End time must be after start time.')

            # Check for overlapping bookings
            overlapping = VehicleBooking.objects.filter(
                vehicle=self.vehicle,
                status__in=[BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.IN_PROGRESS],
                start_time__lt=self.end_time,
                end_time__gt=self.start_time,
            ).exclude(pk=self.pk)

            if overlapping.exists():
                raise ValidationError('This vehicle is already booked for the selected time.')


class VehicleMaintenance(TenantBaseModel):
    """Vehicle maintenance records."""
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='maintenance_records',
    )
    maintenance_type = models.CharField(max_length=100)
    description = models.TextField()
    service_date = models.DateField()
    odometer_reading = models.PositiveIntegerField()
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vendor = models.CharField(max_length=200, blank=True)
    next_service_odometer = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Vehicle Maintenance'
        verbose_name_plural = 'Vehicle Maintenance Records'
        ordering = ['-service_date']

    def __str__(self):
        return f"{self.vehicle.plate_number} - {self.maintenance_type} ({self.service_date})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update vehicle's last service info
        self.vehicle.last_service_date = self.service_date
        self.vehicle.current_odometer = max(
            self.vehicle.current_odometer, self.odometer_reading
        )
        self.vehicle.save(update_fields=['last_service_date', 'current_odometer'])
