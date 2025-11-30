from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, DriverViewSet, VehicleBookingViewSet, VehicleMaintenanceViewSet

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet)
router.register(r'drivers', DriverViewSet)
router.register(r'bookings', VehicleBookingViewSet)
router.register(r'maintenance', VehicleMaintenanceViewSet)

urlpatterns = router.urls
