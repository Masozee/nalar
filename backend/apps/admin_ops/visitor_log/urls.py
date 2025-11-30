from rest_framework.routers import DefaultRouter
from .views import VisitorViewSet, VisitLogViewSet, VisitorBadgeViewSet

router = DefaultRouter()
router.register(r'visitors', VisitorViewSet)
router.register(r'visits', VisitLogViewSet)
router.register(r'badges', VisitorBadgeViewSet)

urlpatterns = router.urls
