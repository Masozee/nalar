from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from .views import (
    EmployeeViewSet,
    EmployeeFamilyViewSet,
    EmployeeEducationViewSet,
    EmployeeWorkHistoryViewSet,
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)

# Nested routes for employee-related data
employees_router = nested_routers.NestedDefaultRouter(router, r'employees', lookup='employee')
employees_router.register(r'family', EmployeeFamilyViewSet, basename='employee-family')
employees_router.register(r'education', EmployeeEducationViewSet, basename='employee-education')
employees_router.register(r'work-history', EmployeeWorkHistoryViewSet, basename='employee-work-history')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(employees_router.urls)),
    path('attendance/', include('apps.hr.attendance.urls')),
    path('leave/', include('apps.hr.leave.urls')),
    path('payroll/', include('apps.hr.payroll_light.urls')),
]
