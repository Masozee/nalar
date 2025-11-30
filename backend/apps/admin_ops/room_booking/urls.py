from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, RoomBookingViewSet

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'bookings', RoomBookingViewSet)

urlpatterns = router.urls
