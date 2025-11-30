from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockTransferViewSet, StockTransferItemViewSet

router = DefaultRouter()
router.register(r'transfers', StockTransferViewSet, basename='stock-transfer')
router.register(r'transfer-items', StockTransferItemViewSet, basename='stock-transfer-item')

urlpatterns = [
    path('', include(router.urls)),
]
