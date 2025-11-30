from django.contrib import admin
from .models import Vehicle, Driver, VehicleBooking, VehicleMaintenance


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'plate_number', 'vehicle_type', 'brand', 'model',
        'status', 'capacity', 'current_odometer', 'is_active',
    ]
    list_filter = ['vehicle_type', 'status', 'brand', 'is_active']
    search_fields = ['name', 'plate_number', 'brand', 'model']
    ordering = ['name']

    fieldsets = (
        (None, {
            'fields': ('name', 'plate_number', 'vehicle_type', 'status')
        }),
        ('Vehicle Info', {
            'fields': ('brand', 'model', 'year', 'color', 'capacity')
        }),
        ('Documents', {
            'fields': ('stnk_expiry', 'kir_expiry', 'insurance_expiry')
        }),
        ('Maintenance', {
            'fields': (
                'current_odometer', 'last_service_date', 'next_service_date'
            )
        }),
        ('Assignment', {
            'fields': ('assigned_driver', 'notes')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ['user', 'license_number', 'license_type', 'license_expiry', 'phone']
    list_filter = ['license_type']
    search_fields = ['user__email', 'user__first_name', 'license_number']
    raw_id_fields = ['user']


class VehicleMaintenanceInline(admin.TabularInline):
    model = VehicleMaintenance
    extra = 0
    fields = ['maintenance_type', 'service_date', 'odometer_reading', 'cost', 'vendor']


@admin.register(VehicleBooking)
class VehicleBookingAdmin(admin.ModelAdmin):
    list_display = [
        'vehicle', 'purpose', 'destination', 'booked_by',
        'start_time', 'end_time', 'status', 'driver',
    ]
    list_filter = ['status', 'vehicle', 'start_time']
    search_fields = ['purpose', 'destination', 'booked_by__email', 'vehicle__plate_number']
    date_hierarchy = 'start_time'
    raw_id_fields = ['booked_by', 'driver', 'approved_by']
    ordering = ['-start_time']

    fieldsets = (
        (None, {
            'fields': ('vehicle', 'booked_by', 'driver')
        }),
        ('Trip Details', {
            'fields': ('purpose', 'destination', 'description', 'passenger_count', 'passengers')
        }),
        ('Schedule', {
            'fields': (
                ('start_time', 'end_time'),
                ('actual_start_time', 'actual_end_time'),
            )
        }),
        ('Odometer & Fuel', {
            'fields': (
                ('start_odometer', 'end_odometer'),
                ('fuel_used', 'fuel_cost'),
            )
        }),
        ('Status', {
            'fields': ('status', 'notes')
        }),
        ('Approval', {
            'fields': ('approved_by', 'approved_at', 'rejection_reason'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['approved_at']


@admin.register(VehicleMaintenance)
class VehicleMaintenanceAdmin(admin.ModelAdmin):
    list_display = [
        'vehicle', 'maintenance_type', 'service_date',
        'odometer_reading', 'cost', 'vendor',
    ]
    list_filter = ['maintenance_type', 'service_date']
    search_fields = ['vehicle__plate_number', 'maintenance_type', 'vendor']
    date_hierarchy = 'service_date'
    ordering = ['-service_date']
