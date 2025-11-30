# Admin operations models
# Import submodule models for Django to discover them
from apps.admin_ops.room_booking.models import Room, RoomBooking  # noqa
from apps.admin_ops.vehicle_management.models import (  # noqa
    Vehicle, Driver, VehicleBooking, VehicleMaintenance
)
from apps.admin_ops.visitor_log.models import Visitor, VisitLog, VisitorBadge  # noqa
