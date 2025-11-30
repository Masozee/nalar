"""
Tests for JWT Authentication.
"""
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthenticationTests(APITestCase):
    """Test JWT authentication endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.login_url = '/api/v1/auth/login/'
        self.refresh_url = '/api/v1/auth/refresh/'
        self.verify_url = '/api/v1/auth/verify/'
        self.logout_url = '/api/v1/auth/logout/'
        self.me_url = '/api/v1/auth/me/'
        self.profile_url = '/api/v1/auth/profile/'
        self.change_password_url = '/api/v1/auth/change-password/'
        self.register_url = '/api/v1/auth/register/'

    def test_login_success(self):
        """Test successful login returns tokens and user data."""
        response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'test@example.com')

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials fails."""
        response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user(self):
        """Test login with non-existent user fails."""
        response = self.client.post(self.login_url, {
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Test refreshing access token with valid refresh token."""
        login_response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        refresh_token = login_response.data['refresh']

        response = self.client.post(self.refresh_url, {
            'refresh': refresh_token
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_token_verify_valid(self):
        """Test verifying a valid token."""
        login_response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        access_token = login_response.data['access']

        response = self.client.post(self.verify_url, {
            'token': access_token
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_token_verify_invalid(self):
        """Test verifying an invalid token fails."""
        response = self.client.post(self.verify_url, {
            'token': 'invalid-token'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_authenticated(self):
        """Test /me endpoint with authentication."""
        login_response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        access_token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['full_name'], 'Test User')

    def test_me_unauthenticated(self):
        """Test /me endpoint without authentication fails."""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_get(self):
        """Test getting user profile."""
        login_response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        access_token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_profile_update(self):
        """Test updating user profile."""
        login_response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        access_token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.patch(self.profile_url, {
            'first_name': 'Updated'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')

    def test_change_password_success(self):
        """Test changing password with correct old password."""
        login_response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        access_token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.post(self.change_password_url, {
            'old_password': 'testpass123',
            'new_password': 'newpass456',
            'new_password_confirm': 'newpass456'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify can login with new password
        self.client.credentials()  # Clear credentials
        response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'newpass456'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_password_wrong_old_password(self):
        """Test changing password with incorrect old password fails."""
        login_response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        access_token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.post(self.change_password_url, {
            'old_password': 'wrongpassword',
            'new_password': 'newpass456'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_blacklists_token(self):
        """Test logout blacklists the refresh token."""
        login_response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        access_token = login_response.data['access']
        refresh_token = login_response.data['refresh']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.post(self.logout_url, {
            'refresh': refresh_token
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify refresh token is blacklisted
        self.client.credentials()  # Clear credentials
        response = self.client.post(self.refresh_url, {
            'refresh': refresh_token
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_register_success(self):
        """Test user registration."""
        response = self.client.post(self.register_url, {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_register_password_mismatch(self):
        """Test registration with mismatched passwords fails."""
        response = self.client.post(self.register_url, {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'differentpass',
            'first_name': 'New',
            'last_name': 'User'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        """Test registration with existing email fails."""
        response = self.client.post(self.register_url, {
            'username': 'anotheruser',
            'email': 'test@example.com',  # Already exists
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'Another',
            'last_name': 'User'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
