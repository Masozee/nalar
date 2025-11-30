from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PolicyViewSet, PolicyCategoryViewSet, PolicyApprovalViewSet

router = DefaultRouter()
router.register(r'categories', PolicyCategoryViewSet, basename='policy-category')
router.register(r'policies', PolicyViewSet, basename='policy')
router.register(r'approvals', PolicyApprovalViewSet, basename='policy-approval')

urlpatterns = [
    path('', include(router.urls)),
]
