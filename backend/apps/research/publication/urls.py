"""URL configuration for Publication module."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicationViewSet, PublicationAuthorViewSet, PublicationReviewViewSet

router = DefaultRouter()
router.register(r'publications', PublicationViewSet, basename='publication')
router.register(r'authors', PublicationAuthorViewSet, basename='publication-author')
router.register(r'reviews', PublicationReviewViewSet, basename='publication-review')

urlpatterns = [
    path('', include(router.urls)),
]
