from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FolderViewSet, DocumentViewSet, DocumentAccessLogViewSet

router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'access-logs', DocumentAccessLogViewSet, basename='document-access-log')

urlpatterns = [
    path('', include(router.urls)),
]
