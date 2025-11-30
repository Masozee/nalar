from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, OrgChartView, PositionViewSet, TeamViewSet

router = DefaultRouter()
router.register('departments', DepartmentViewSet, basename='department')
router.register('positions', PositionViewSet, basename='position')
router.register('teams', TeamViewSet, basename='team')

urlpatterns = [
    path('org-chart/', OrgChartView.as_view(), name='org-chart'),
] + router.urls
