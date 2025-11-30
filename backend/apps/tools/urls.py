"""
URL configuration for Tools app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ShortenedURLViewSet, URLRedirectView,
    QRCodeViewSet, CompressedImageViewSet, PDFOperationViewSet,
    PDFAuditView, DocxToPdfView,
    YoutubeDownloaderView, InstagramDownloaderView, TwitterDownloaderView
)

router = DefaultRouter()
router.register(r'urls', ShortenedURLViewSet, basename='shortened-url')
router.register(r'qrcodes', QRCodeViewSet, basename='qrcode')
router.register(r'images', CompressedImageViewSet, basename='compressed-image')
router.register(r'pdf', PDFOperationViewSet, basename='pdf-operation')

urlpatterns = [
    # Non-router paths should come first to avoid conflicts
    path('s/<str:short_code>/', URLRedirectView.as_view(), name='url-redirect'),
    path('audit-pdf/', PDFAuditView.as_view(), name='pdf-audit'),
    path('convert/docx-to-pdf/', DocxToPdfView.as_view(), name='docx-to-pdf'),
    # Downloader endpoints
    path('download/youtube/', YoutubeDownloaderView.as_view(), name='youtube-downloader'),
    path('download/instagram/', InstagramDownloaderView.as_view(), name='instagram-downloader'),
    path('download/twitter/', TwitterDownloaderView.as_view(), name='twitter-downloader'),
    path('', include(router.urls)),
]
