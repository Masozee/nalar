from rest_framework.routers import DefaultRouter
from .views import LeavePolicyViewSet, LeaveBalanceViewSet, LeaveRequestViewSet

router = DefaultRouter()
router.register('policies', LeavePolicyViewSet, basename='leave-policy')
router.register('balances', LeaveBalanceViewSet, basename='leave-balance')
router.register('requests', LeaveRequestViewSet, basename='leave-request')

urlpatterns = router.urls
