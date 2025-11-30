"""URL configuration for Project Tracking module."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResearchProjectViewSet, ProjectTeamMemberViewSet, ProjectTaskViewSet, ProjectUpdateViewSet

router = DefaultRouter()
router.register(r'projects', ResearchProjectViewSet, basename='research-project')
router.register(r'team-members', ProjectTeamMemberViewSet, basename='project-team-member')
router.register(r'tasks', ProjectTaskViewSet, basename='project-task')
router.register(r'updates', ProjectUpdateViewSet, basename='project-update')

urlpatterns = [
    path('', include(router.urls)),
]
