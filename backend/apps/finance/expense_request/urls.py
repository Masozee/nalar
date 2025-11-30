"""
URL configuration for Expense Request module.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseRequestViewSet, ExpenseItemViewSet, ExpenseAdvanceViewSet

router = DefaultRouter()
router.register(r'requests', ExpenseRequestViewSet, basename='expense-request')
router.register(r'items', ExpenseItemViewSet, basename='expense-item')
router.register(r'advances', ExpenseAdvanceViewSet, basename='expense-advance')

urlpatterns = [
    path('', include(router.urls)),
]
