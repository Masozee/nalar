"""
URL configuration for User authentication.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    me,
)

urlpatterns = [
    # JWT Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # User management
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', me, name='me'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]
