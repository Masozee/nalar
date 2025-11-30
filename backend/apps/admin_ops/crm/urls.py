"""
CRM URL Configuration
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OrganizationViewSet, ContactViewSet, JobPositionViewSet,
    ContactNoteViewSet, ContactActivityViewSet,
)

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='crm-organization')
router.register(r'contacts', ContactViewSet, basename='crm-contact')
router.register(r'positions', JobPositionViewSet, basename='crm-position')
router.register(r'notes', ContactNoteViewSet, basename='crm-note')
router.register(r'activities', ContactActivityViewSet, basename='crm-activity')

urlpatterns = [
    path('', include(router.urls)),
]
