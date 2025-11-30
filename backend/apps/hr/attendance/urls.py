from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, AttendanceSummaryViewSet

router = DefaultRouter()
router.register('attendances', AttendanceViewSet, basename='attendance')
router.register('attendance-summaries', AttendanceSummaryViewSet, basename='attendance-summary')

urlpatterns = router.urls
