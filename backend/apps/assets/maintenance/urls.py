from rest_framework.routers import DefaultRouter
from .views import AssetViewSet, MaintenanceScheduleViewSet, MaintenanceRecordViewSet

router = DefaultRouter()
router.register(r'assets', AssetViewSet)
router.register(r'schedules', MaintenanceScheduleViewSet)
router.register(r'records', MaintenanceRecordViewSet)

urlpatterns = router.urls
