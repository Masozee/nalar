"""
Serializers for User authentication and management.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user info."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        token['username'] = user.username
        token['full_name'] = user.get_full_name()
        token['is_staff'] = user.is_staff

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user info to response
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'full_name': self.user.get_full_name(),
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
        }

        return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'is_staff', 'is_active', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'is_staff', 'is_active', 'date_joined', 'last_login']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password_confirm',
            'first_name', 'last_name'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Password tidak cocok.'
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Password baru tidak cocok.'
            })
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Password lama salah.')
        return value
