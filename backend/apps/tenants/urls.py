"""URL patterns for tenants API."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TenantViewSet,
    TenantUserViewSet,
    SubscriptionViewSet,
    InvoiceViewSet,
    BillingViewSet,
    PolarWebhookView,
)
from .views_extended import (
    TenantRegistrationViewSet,
    InvitationViewSet,
    TenantSwitchingViewSet,
)

router = DefaultRouter()
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'tenant-users', TenantUserViewSet, basename='tenant-user')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'billing', BillingViewSet, basename='billing')

# Extended endpoints
router.register(r'register', TenantRegistrationViewSet, basename='tenant-register')
router.register(r'invitations', InvitationViewSet, basename='invitation')
router.register(r'switch', TenantSwitchingViewSet, basename='tenant-switch')

urlpatterns = [
    path('', include(router.urls)),
    # Polar webhook endpoint (public, no auth)
    path('billing/webhooks/polar/', PolarWebhookView.as_view(), name='polar-webhook'),
]
