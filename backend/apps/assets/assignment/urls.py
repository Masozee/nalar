from rest_framework.routers import DefaultRouter
from .views import AssetAssignmentViewSet, AssetTransferViewSet, AssetCheckoutViewSet

router = DefaultRouter()
router.register(r'assignments', AssetAssignmentViewSet)
router.register(r'transfers', AssetTransferViewSet)
router.register(r'checkouts', AssetCheckoutViewSet)

urlpatterns = router.urls
