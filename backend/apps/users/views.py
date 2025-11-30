"""
Views for User authentication and management.
"""
from django.contrib.auth import get_user_model
from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing/retrieving users (admin only)."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view that returns user info with tokens."""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """User registration view."""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """Logout view that blacklists the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'detail': 'Berhasil logout.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {'detail': 'Token tidak valid.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    """View for getting and updating user profile."""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """View for changing password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({'detail': 'Password berhasil diubah.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Get current user info."""
    return Response(UserSerializer(request.user).data)
