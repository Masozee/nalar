from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, VendorContactViewSet, VendorEvaluationViewSet

router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'contacts', VendorContactViewSet, basename='vendor-contact')
router.register(r'evaluations', VendorEvaluationViewSet, basename='vendor-evaluation')

urlpatterns = [
    path('', include(router.urls)),
]
