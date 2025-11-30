"""URL configuration for Grant Management module."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GrantViewSet, GrantTeamMemberViewSet, GrantMilestoneViewSet, GrantDisbursementViewSet

router = DefaultRouter()
router.register(r'grants', GrantViewSet, basename='grant')
router.register(r'team-members', GrantTeamMemberViewSet, basename='grant-team-member')
router.register(r'milestones', GrantMilestoneViewSet, basename='grant-milestone')
router.register(r'disbursements', GrantDisbursementViewSet, basename='grant-disbursement')

urlpatterns = [
    path('', include(router.urls)),
]
