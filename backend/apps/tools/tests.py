"""
Tests for Tools app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
import io
from PIL import Image

from .models import ShortenedURL, QRCode, CompressedImage, PDFOperation

User = get_user_model()


class ShortenedURLModelTest(TestCase):
    """Test ShortenedURL model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='urluser',
            email='url@example.com',
            password='testpass123'
        )

    def test_create_shortened_url(self):
        """Test creating shortened URL generates code."""
        url = ShortenedURL.objects.create(
            original_url='https://example.com/very/long/url/here',
            title='Example',
            created_by=self.user,
        )
        self.assertEqual(len(url.short_code), 8)
        self.assertFalse(url.is_expired)

    def test_record_click(self):
        """Test recording clicks."""
        url = ShortenedURL.objects.create(
            original_url='https://example.com',
            created_by=self.user,
        )
        self.assertEqual(url.click_count, 0)
        url.record_click()
        self.assertEqual(url.click_count, 1)
        self.assertIsNotNone(url.last_clicked_at)


class QRCodeModelTest(TestCase):
    """Test QRCode model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='qruser',
            email='qr@example.com',
            password='testpass123'
        )

    def test_create_qrcode(self):
        """Test creating QR code."""
        qr = QRCode.objects.create(
            content_type=QRCode.ContentType.URL,
            content='https://example.com',
            title='Test QR',
            created_by=self.user,
        )
        self.assertEqual(qr.size, 300)
        self.assertEqual(qr.error_correction, 'M')


class ShortenedURLAPITest(APITestCase):
    """Test URL Shortener API."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='apiuser',
            email='api@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_shortened_url(self):
        """Test creating shortened URL via API."""
        data = {
            'original_url': 'https://example.com/test',
            'title': 'Test URL',
        }
        response = self.client.post('/api/v1/tools/urls/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('short_code', response.data)
        self.assertIn('short_url', response.data)

    def test_list_urls(self):
        """Test listing user's shortened URLs."""
        ShortenedURL.objects.create(
            original_url='https://example1.com',
            created_by=self.user,
        )
        ShortenedURL.objects.create(
            original_url='https://example2.com',
            created_by=self.user,
        )
        response = self.client.get('/api/v1/tools/urls/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_url_stats(self):
        """Test URL statistics endpoint."""
        url = ShortenedURL.objects.create(
            original_url='https://example.com',
            created_by=self.user,
        )
        url.record_click()
        response = self.client.get(f'/api/v1/tools/urls/{url.id}/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_clicks'], 1)


class QRCodeAPITest(APITestCase):
    """Test QR Code API."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='qrapiuser',
            email='qrapi@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_qrcode(self):
        """Test creating QR code via API."""
        data = {
            'content_type': 'url',
            'content': 'https://example.com',
            'title': 'Test QR',
            'size': 200,
        }
        response = self.client.post('/api/v1/tools/qrcodes/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('qr_image', response.data)

    def test_generate_qrcode(self):
        """Test generating QR code without saving."""
        data = {
            'content': 'https://example.com',
            'size': 200,
        }
        response = self.client.post('/api/v1/tools/qrcodes/generate/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'image/png')


class ImageCompressorAPITest(APITestCase):
    """Test Image Compressor API."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='imguser',
            email='img@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def _create_test_image(self):
        """Create a test image."""
        img = Image.new('RGB', (100, 100), color='red')
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        buffer.seek(0)
        return SimpleUploadedFile('test.jpg', buffer.read(), content_type='image/jpeg')

    def test_compress_image(self):
        """Test compressing image without saving."""
        image = self._create_test_image()
        data = {
            'image': image,
            'quality': 50,
            'output_format': 'jpeg',
        }
        response = self.client.post('/api/v1/tools/images/compress/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'image/jpeg')


class URLRedirectTest(APITestCase):
    """Test URL redirect functionality."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='redirectuser',
            email='redirect@example.com',
            password='testpass123'
        )

    def test_redirect_url(self):
        """Test redirecting shortened URL."""
        url = ShortenedURL.objects.create(
            original_url='https://example.com/target',
            created_by=self.user,
        )
        response = self.client.get(f'/api/v1/tools/s/{url.short_code}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['redirect_url'], 'https://example.com/target')

    def test_redirect_nonexistent(self):
        """Test redirecting nonexistent URL."""
        response = self.client.get('/api/v1/tools/s/nonexistent/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
