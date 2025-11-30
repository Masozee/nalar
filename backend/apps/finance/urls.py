"""
URL configuration for Finance module.
"""
from django.urls import path, include

urlpatterns = [
    path('expenses/', include('apps.finance.expense_request.urls')),
]
