from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SKUViewSet, WarehouseViewSet, StockRecordViewSet, StockMovementViewSet

router = DefaultRouter()
router.register(r'skus', SKUViewSet, basename='sku')
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'stock-records', StockRecordViewSet, basename='stock-record')
router.register(r'movements', StockMovementViewSet, basename='stock-movement')

urlpatterns = [
    path('', include(router.urls)),
]
