"""URL configuration for Research module."""
from django.urls import path, include

urlpatterns = [
    path('grants/', include('apps.research.grant_management.urls')),
    path('publications/', include('apps.research.publication.urls')),
    path('projects/', include('apps.research.project_tracking.urls')),
]
