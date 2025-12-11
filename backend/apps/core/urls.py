"""URL patterns for core API."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet
from .health import health_check

router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('', include(router.urls)),
]
