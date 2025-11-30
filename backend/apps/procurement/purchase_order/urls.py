from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PurchaseOrderViewSet, POItemViewSet, POReceiptViewSet

router = DefaultRouter()
router.register(r'orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'items', POItemViewSet, basename='po-item')
router.register(r'receipts', POReceiptViewSet, basename='po-receipt')

urlpatterns = [
    path('', include(router.urls)),
]
