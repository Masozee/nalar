from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockOpnameViewSet, StockOpnameItemViewSet

router = DefaultRouter()
router.register(r'opnames', StockOpnameViewSet, basename='stock-opname')
router.register(r'opname-items', StockOpnameItemViewSet, basename='stock-opname-item')

urlpatterns = [
    path('', include(router.urls)),
]
