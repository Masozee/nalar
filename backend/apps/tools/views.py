"""
Views for Tools app.
"""
import io
import qrcode
from PIL import Image
from django.db.models import Count
from django.http import HttpResponse, FileResponse
from django.shortcuts import get_object_or_404
from django.core.files.base import ContentFile
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import ShortenedURL, URLClickLog, QRCode, CompressedImage, PDFOperation, PDFInputFile
from .serializers import (
    ShortenedURLSerializer, URLClickLogSerializer, URLStatsSerializer,
    QRCodeSerializer, QRCodeGenerateSerializer,
    CompressedImageSerializer, ImageCompressSerializer,
    PDFOperationSerializer, PDFMergeSerializer, PDFSplitSerializer,
)


class ShortenedURLViewSet(viewsets.ModelViewSet):
    """ViewSet for URL Shortener."""
    queryset = ShortenedURL.objects.filter(is_active=True)
    serializer_class = ShortenedURLSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['created_by']
    search_fields = ['short_code', 'original_url', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        # Users see only their own URLs
        if self.request.user.is_staff:
            return super().get_queryset()
        return super().get_queryset().filter(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get statistics for a shortened URL."""
        url = self.get_object()
        now = timezone.now()

        clicks = url.click_logs.all()
        clicks_today = clicks.filter(clicked_at__date=now.date()).count()
        clicks_week = clicks.filter(clicked_at__gte=now - timedelta(days=7)).count()
        clicks_month = clicks.filter(clicked_at__gte=now - timedelta(days=30)).count()

        # Top countries
        top_countries = list(
            clicks.exclude(country='').values('country')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        recent_clicks = URLClickLogSerializer(
            clicks.order_by('-clicked_at')[:10], many=True
        ).data

        return Response({
            'total_clicks': url.click_count,
            'clicks_today': clicks_today,
            'clicks_this_week': clicks_week,
            'clicks_this_month': clicks_month,
            'top_countries': top_countries,
            'recent_clicks': recent_clicks,
        })


class URLRedirectView(APIView):
    """View to redirect shortened URLs."""
    permission_classes = [AllowAny]

    def get(self, request, short_code):
        url = get_object_or_404(ShortenedURL, short_code=short_code, is_active=True)

        if url.is_expired:
            return Response({'error': 'URL telah kedaluwarsa'}, status=status.HTTP_410_GONE)

        if url.password:
            # Password protected - return info
            return Response({
                'protected': True,
                'title': url.title,
                'original_url': None,
            })

        # Return URL info without logging (frontend will log)
        return Response({
            'original_url': url.original_url,
            'title': url.title,
            'protected': False,
        })

    def post(self, request, short_code):
        """For password-protected URLs or logging clicks from frontend."""
        url = get_object_or_404(ShortenedURL, short_code=short_code, is_active=True)

        if url.is_expired:
            return Response({'error': 'URL telah kedaluwarsa'}, status=status.HTTP_410_GONE)

        # Check if this is a click log request from frontend
        if request.data.get('log_click'):
            # Log click with data from frontend
            click_data = request.data
            URLClickLog.objects.create(
                shortened_url=url,
                ip_address=self._get_client_ip(request),
                user_agent=click_data.get('user_agent', '')[:500],
                referer=click_data.get('referer', '')[:2048],
                device_type=click_data.get('device_type', ''),
                browser=click_data.get('browser', ''),
                browser_version=click_data.get('browser_version', ''),
                os=click_data.get('os', ''),
                os_version=click_data.get('os_version', ''),
                is_bot=click_data.get('is_bot', False),
                country=click_data.get('country', ''),
                city=click_data.get('city', ''),
            )
            url.record_click()
            return Response({'logged': True})

        # Password verification
        password = request.data.get('password')
        if url.password and url.password != password:
            return Response({'error': 'Password salah'}, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'original_url': url.original_url,
            'title': url.title,
        })

    def _log_click(self, request, url):
        """Log click with detailed device and browser info."""
        user_agent_str = request.META.get('HTTP_USER_AGENT', '')

        # Parse user agent
        device_info = self._parse_user_agent(user_agent_str)

        URLClickLog.objects.create(
            shortened_url=url,
            ip_address=self._get_client_ip(request),
            user_agent=user_agent_str[:500],
            referer=request.META.get('HTTP_REFERER', '')[:2048],
            device_type=device_info.get('device_type', ''),
            browser=device_info.get('browser', ''),
            browser_version=device_info.get('browser_version', ''),
            os=device_info.get('os', ''),
            os_version=device_info.get('os_version', ''),
            is_bot=device_info.get('is_bot', False),
        )

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def _parse_user_agent(self, ua_string):
        """Parse user agent string to extract device, browser, and OS info."""
        ua_lower = ua_string.lower()

        result = {
            'device_type': 'desktop',
            'browser': '',
            'browser_version': '',
            'os': '',
            'os_version': '',
            'is_bot': False,
        }

        # Check if bot
        bot_keywords = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests']
        if any(bot in ua_lower for bot in bot_keywords):
            result['is_bot'] = True
            result['device_type'] = 'bot'
            return result

        # Detect device type
        if 'mobile' in ua_lower or 'android' in ua_lower and 'mobile' in ua_lower:
            result['device_type'] = 'mobile'
        elif 'tablet' in ua_lower or 'ipad' in ua_lower:
            result['device_type'] = 'tablet'
        elif 'android' in ua_lower:
            result['device_type'] = 'tablet'  # Android without mobile = tablet

        # Detect OS
        if 'windows nt 10' in ua_lower:
            result['os'] = 'Windows'
            result['os_version'] = '10'
        elif 'windows nt 11' in ua_lower or 'windows nt 10.0; win64' in ua_lower:
            result['os'] = 'Windows'
            result['os_version'] = '11'
        elif 'windows' in ua_lower:
            result['os'] = 'Windows'
        elif 'mac os x' in ua_lower:
            result['os'] = 'macOS'
            # Extract version
            import re
            match = re.search(r'mac os x (\d+[._]\d+)', ua_lower)
            if match:
                result['os_version'] = match.group(1).replace('_', '.')
        elif 'iphone' in ua_lower or 'ipad' in ua_lower:
            result['os'] = 'iOS'
            import re
            match = re.search(r'os (\d+[._]\d+)', ua_lower)
            if match:
                result['os_version'] = match.group(1).replace('_', '.')
        elif 'android' in ua_lower:
            result['os'] = 'Android'
            import re
            match = re.search(r'android (\d+\.?\d*)', ua_lower)
            if match:
                result['os_version'] = match.group(1)
        elif 'linux' in ua_lower:
            result['os'] = 'Linux'

        # Detect browser
        import re
        if 'edg/' in ua_lower:
            result['browser'] = 'Edge'
            match = re.search(r'edg/(\d+\.?\d*)', ua_lower)
            if match:
                result['browser_version'] = match.group(1)
        elif 'chrome' in ua_lower and 'chromium' not in ua_lower:
            result['browser'] = 'Chrome'
            match = re.search(r'chrome/(\d+\.?\d*)', ua_lower)
            if match:
                result['browser_version'] = match.group(1)
        elif 'safari' in ua_lower and 'chrome' not in ua_lower:
            result['browser'] = 'Safari'
            match = re.search(r'version/(\d+\.?\d*)', ua_lower)
            if match:
                result['browser_version'] = match.group(1)
        elif 'firefox' in ua_lower:
            result['browser'] = 'Firefox'
            match = re.search(r'firefox/(\d+\.?\d*)', ua_lower)
            if match:
                result['browser_version'] = match.group(1)
        elif 'opera' in ua_lower or 'opr/' in ua_lower:
            result['browser'] = 'Opera'
            match = re.search(r'(?:opera|opr)/(\d+\.?\d*)', ua_lower)
            if match:
                result['browser_version'] = match.group(1)

        return result


class QRCodeViewSet(viewsets.ModelViewSet):
    """ViewSet for QR Code Generator."""
    queryset = QRCode.objects.filter(is_active=True)
    serializer_class = QRCodeSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['content_type', 'created_by']
    search_fields = ['title', 'content']
    ordering = ['-created_at']

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()
        return super().get_queryset().filter(created_by=self.request.user)

    def perform_create(self, serializer):
        instance = serializer.save()
        # Generate QR code image
        self._generate_qr_image(instance)

    def _generate_qr_image(self, qr_obj):
        """Generate and save QR code image."""
        qr = qrcode.QRCode(
            version=1,
            error_correction=getattr(qrcode.constants, f'ERROR_CORRECT_{qr_obj.error_correction}'),
            box_size=10,
            border=4,
        )
        qr.add_data(qr_obj.content)
        qr.make(fit=True)

        img = qr.make_image(
            fill_color=qr_obj.foreground_color,
            back_color=qr_obj.background_color
        )

        # Resize
        img = img.resize((qr_obj.size, qr_obj.size), Image.Resampling.LANCZOS)

        # Save to buffer
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)

        # Save to model
        filename = f'qr_{qr_obj.id}.png'
        qr_obj.qr_image.save(filename, ContentFile(buffer.read()), save=True)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate QR code without saving (returns image directly)."""
        serializer = QRCodeGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        qr = qrcode.QRCode(
            version=1,
            error_correction=getattr(qrcode.constants, f'ERROR_CORRECT_{data["error_correction"]}'),
            box_size=10,
            border=4,
        )
        qr.add_data(data['content'])
        qr.make(fit=True)

        img = qr.make_image(
            fill_color=data['foreground_color'],
            back_color=data['background_color']
        )
        img = img.resize((data['size'], data['size']), Image.Resampling.LANCZOS)

        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)

        return HttpResponse(buffer, content_type='image/png')


class CompressedImageViewSet(viewsets.ModelViewSet):
    """ViewSet for Image Compressor."""
    queryset = CompressedImage.objects.filter(is_active=True)
    serializer_class = CompressedImageSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['output_format', 'created_by']
    ordering = ['-created_at']

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()
        return super().get_queryset().filter(created_by=self.request.user)

    def perform_create(self, serializer):
        instance = serializer.save()
        # Compress image
        self._compress_image(instance)

    def _compress_image(self, img_obj):
        """Compress the uploaded image."""
        original = Image.open(img_obj.original_image)

        # Get original size
        img_obj.original_size = img_obj.original_image.size

        # Resize if needed
        if img_obj.max_width or img_obj.max_height:
            original.thumbnail(
                (img_obj.max_width or original.width, img_obj.max_height or original.height),
                Image.Resampling.LANCZOS
            )

        # Convert mode if needed
        if img_obj.output_format.upper() == 'JPEG' and original.mode in ('RGBA', 'P'):
            original = original.convert('RGB')

        # Compress
        buffer = io.BytesIO()
        save_format = img_obj.output_format.upper()
        if save_format == 'JPEG':
            original.save(buffer, format='JPEG', quality=img_obj.quality, optimize=True)
        elif save_format == 'PNG':
            original.save(buffer, format='PNG', optimize=True)
        elif save_format == 'WEBP':
            original.save(buffer, format='WEBP', quality=img_obj.quality)

        buffer.seek(0)
        img_obj.compressed_size = buffer.getbuffer().nbytes

        # Save compressed image
        ext = img_obj.output_format.lower()
        filename = f'compressed_{img_obj.id}.{ext}'
        img_obj.compressed_image.save(filename, ContentFile(buffer.read()), save=True)

    @action(detail=False, methods=['post'])
    def compress(self, request):
        """Compress image without saving (returns image directly)."""
        serializer = ImageCompressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        original = Image.open(data['image'])

        # Resize if needed
        if data.get('max_width') or data.get('max_height'):
            original.thumbnail(
                (data.get('max_width') or original.width, data.get('max_height') or original.height),
                Image.Resampling.LANCZOS
            )

        # Convert mode if needed
        output_format = data['output_format'].upper()
        if output_format == 'JPEG' and original.mode in ('RGBA', 'P'):
            original = original.convert('RGB')

        buffer = io.BytesIO()
        if output_format == 'JPEG':
            original.save(buffer, format='JPEG', quality=data['quality'], optimize=True)
            content_type = 'image/jpeg'
        elif output_format == 'PNG':
            original.save(buffer, format='PNG', optimize=True)
            content_type = 'image/png'
        else:  # WEBP
            original.save(buffer, format='WEBP', quality=data['quality'])
            content_type = 'image/webp'

        buffer.seek(0)
        return HttpResponse(buffer, content_type=content_type)


class PDFOperationViewSet(viewsets.ModelViewSet):
    """ViewSet for PDF Operations."""
    queryset = PDFOperation.objects.filter(is_active=True)
    serializer_class = PDFOperationSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['operation_type', 'created_by']
    ordering = ['-created_at']

    def get_queryset(self):
        if self.request.user.is_staff:
            return super().get_queryset()
        return super().get_queryset().filter(created_by=self.request.user)

    @action(detail=False, methods=['post'])
    def merge(self, request):
        """Merge multiple PDF files."""
        try:
            from PyPDF2 import PdfMerger
        except ImportError:
            return Response(
                {'error': 'PyPDF2 not installed'},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )

        serializer = PDFMergeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Create operation record
        operation = PDFOperation.objects.create(
            operation_type=PDFOperation.OperationType.MERGE,
            title=data.get('title', 'Merged PDF'),
            created_by=request.user,
        )

        merger = PdfMerger()
        total_pages = 0

        for i, pdf_file in enumerate(data['files']):
            # Save input file
            input_file = PDFInputFile.objects.create(
                operation=operation,
                file=pdf_file,
                order=i,
            )

            merger.append(pdf_file)
            # Count pages
            from PyPDF2 import PdfReader
            reader = PdfReader(pdf_file)
            input_file.page_count = len(reader.pages)
            input_file.save()
            total_pages += input_file.page_count

        operation.input_page_count = total_pages
        operation.output_page_count = total_pages

        # Save merged PDF
        buffer = io.BytesIO()
        merger.write(buffer)
        merger.close()
        buffer.seek(0)

        filename = f'merged_{operation.id}.pdf'
        operation.result_file.save(filename, ContentFile(buffer.read()), save=True)

        return Response(PDFOperationSerializer(operation).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def split(self, request):
        """Split PDF by page ranges."""
        try:
            from PyPDF2 import PdfReader, PdfWriter
        except ImportError:
            return Response(
                {'error': 'PyPDF2 not installed'},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )

        serializer = PDFSplitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        pdf_file = data['file']
        reader = PdfReader(pdf_file)
        total_pages = len(reader.pages)

        # Parse page ranges
        pages_to_extract = self._parse_page_ranges(data['page_ranges'], total_pages)

        if not pages_to_extract:
            return Response(
                {'error': 'Invalid page ranges'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create operation
        operation = PDFOperation.objects.create(
            operation_type=PDFOperation.OperationType.SPLIT,
            title=data.get('title', 'Split PDF'),
            page_ranges=data['page_ranges'],
            input_page_count=total_pages,
            output_page_count=len(pages_to_extract),
            created_by=request.user,
        )

        # Save input file
        PDFInputFile.objects.create(
            operation=operation,
            file=pdf_file,
            order=0,
            page_count=total_pages,
        )

        # Extract pages
        writer = PdfWriter()
        for page_num in pages_to_extract:
            writer.add_page(reader.pages[page_num])

        buffer = io.BytesIO()
        writer.write(buffer)
        buffer.seek(0)

        filename = f'split_{operation.id}.pdf'
        operation.result_file.save(filename, ContentFile(buffer.read()), save=True)

        return Response(PDFOperationSerializer(operation).data, status=status.HTTP_201_CREATED)

    def _parse_page_ranges(self, ranges_str, max_pages):
        """Parse page ranges string like '1-3,5,7-10' to list of 0-indexed pages."""
        pages = set()
        parts = ranges_str.replace(' ', '').split(',')

        for part in parts:
            if '-' in part:
                try:
                    start, end = part.split('-')
                    start = int(start) - 1  # Convert to 0-indexed
                    end = int(end)
                    for p in range(start, min(end, max_pages)):
                        pages.add(p)
                except ValueError:
                    continue
            else:
                try:
                    p = int(part) - 1
                    if 0 <= p < max_pages:
                        pages.add(p)
                except ValueError:
                    continue

        return sorted(pages)


class PDFAuditView(APIView):
    """Audit PDF file to analyze size and content."""
    permission_classes = [AllowAny]

    def post(self, request):
        """Analyze PDF file and return detailed size breakdown."""
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_file = request.FILES['file']

        # Validate file type
        if not uploaded_file.name.lower().endswith('.pdf'):
            return Response(
                {'error': 'Invalid file type. Only PDF files are supported.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            import PyPDF2
            from io import BytesIO
            import base64
            from pdf2image import convert_from_bytes
            from PIL import Image

            # Read PDF file
            pdf_bytes = uploaded_file.read()
            pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))

            total_size = len(pdf_bytes)
            page_count = len(pdf_reader.pages)

            # Extract metadata
            metadata = {}
            if pdf_reader.metadata:
                metadata = {
                    'creator': pdf_reader.metadata.get('/Creator', ''),
                    'producer': pdf_reader.metadata.get('/Producer', ''),
                    'title': pdf_reader.metadata.get('/Title', ''),
                    'subject': pdf_reader.metadata.get('/Subject', ''),
                    'author': pdf_reader.metadata.get('/Author', ''),
                }

            # Generate thumbnails for all pages
            thumbnails = []
            try:
                images = convert_from_bytes(pdf_bytes, dpi=72, fmt='jpeg')
                for img in images:
                    # Resize thumbnail to reasonable size
                    img.thumbnail((300, 400), Image.Resampling.LANCZOS)
                    buffer = BytesIO()
                    img.save(buffer, format='JPEG', quality=85)
                    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                    thumbnails.append(f"data:image/jpeg;base64,{img_base64}")
            except Exception as e:
                print(f"Error generating thumbnails: {e}")
                # If thumbnail generation fails, continue without thumbnails
                thumbnails = [None] * page_count

            # Analyze each page
            pages = []
            recommendations = []

            for page_num in range(page_count):
                page = pdf_reader.pages[page_num]

                # Get page resources
                page_dict = page.get_object()
                resources_ref = page_dict.get('/Resources')

                # Dereference if it's an indirect object
                if hasattr(resources_ref, 'get_object'):
                    resources = resources_ref.get_object()
                else:
                    resources = resources_ref if resources_ref else {}

                # Count images and estimate size
                images_count = 0
                images_size = 0

                if resources and '/XObject' in resources:
                    xobjects_ref = resources['/XObject']
                    # Dereference XObject
                    if hasattr(xobjects_ref, 'get_object'):
                        xobjects = xobjects_ref.get_object()
                    else:
                        xobjects = xobjects_ref

                    if xobjects:
                        for obj_name in xobjects:
                            try:
                                obj_ref = xobjects[obj_name]
                                if hasattr(obj_ref, 'get_object'):
                                    obj = obj_ref.get_object()
                                else:
                                    obj = obj_ref

                                # Check if this is an image - check both Subtype and presence of image properties
                                is_image = False
                                subtype = obj.get('/Subtype') if obj else None

                                # Dereference subtype if needed
                                if hasattr(subtype, 'get_object'):
                                    subtype = subtype.get_object()

                                if subtype == '/Image':
                                    is_image = True
                                # Also check if it has image-like properties (Width, Height, ColorSpace or BitsPerComponent)
                                elif obj and ('/Width' in obj or '/Height' in obj or '/ColorSpace' in obj or '/BitsPerComponent' in obj):
                                    is_image = True

                                if is_image and obj:
                                    images_count += 1

                                    # Try to get actual image data size
                                    size_added = False
                                    try:
                                        # Method 1: Try to get stream data directly
                                        if hasattr(obj, 'get_data'):
                                            img_data = obj.get_data()
                                            images_size += len(img_data)
                                            size_added = True
                                            print(f"Page {page_num + 1}: Image {obj_name} - got data: {len(img_data)} bytes")
                                        elif hasattr(obj, '_data'):
                                            images_size += len(obj._data)
                                            size_added = True
                                            print(f"Page {page_num + 1}: Image {obj_name} - got _data: {len(obj._data)} bytes")
                                    except Exception as data_error:
                                        print(f"Could not get data directly: {data_error}")

                                    if not size_added:
                                        try:
                                            # Method 2: Get Length directly
                                            if '/Length' in obj:
                                                length = obj['/Length']
                                                if hasattr(length, 'get_object'):
                                                    length = length.get_object()
                                                images_size += int(length)
                                                size_added = True
                                                print(f"Page {page_num + 1}: Image {obj_name} - from Length: {int(length)} bytes")
                                        except Exception as length_error:
                                            print(f"Could not get Length: {length_error}")

                                    if not size_added:
                                        try:
                                            # Method 3: Calculate from dimensions
                                            width = obj.get('/Width', 0)
                                            height = obj.get('/Height', 0)

                                            # Dereference width/height if needed
                                            if hasattr(width, 'get_object'):
                                                width = width.get_object()
                                            if hasattr(height, 'get_object'):
                                                height = height.get_object()

                                            if width and height:
                                                # Get bits per component
                                                bpc = obj.get('/BitsPerComponent', 8)
                                                if hasattr(bpc, 'get_object'):
                                                    bpc = bpc.get_object()

                                                # Get color space components
                                                color_components = 3  # Default RGB
                                                color_space = obj.get('/ColorSpace')
                                                if color_space:
                                                    if hasattr(color_space, 'get_object'):
                                                        color_space = color_space.get_object()
                                                    if color_space == '/DeviceGray':
                                                        color_components = 1
                                                    elif color_space == '/DeviceCMYK':
                                                        color_components = 4

                                                # Calculate size (conservative estimate)
                                                estimated_size = int(width) * int(height) * color_components * int(bpc) // 8
                                                images_size += estimated_size
                                                size_added = True
                                                print(f"Page {page_num + 1}: Image {obj_name} - estimated: {estimated_size} bytes ({width}x{height})")
                                        except Exception as calc_error:
                                            print(f"Could not calculate from dimensions: {calc_error}")

                                    if not size_added:
                                        # Fallback: estimate as 50KB per image
                                        images_size += 50000
                                        print(f"Page {page_num + 1}: Image {obj_name} - using fallback: 50KB")

                            except Exception as e:
                                print(f"Error processing XObject {obj_name}: {e}")
                                continue

                # Count fonts and estimate size
                fonts_count = 0
                fonts_size = 0

                if resources and '/Font' in resources:
                    fonts_ref = resources['/Font']
                    # Dereference Font
                    if hasattr(fonts_ref, 'get_object'):
                        fonts = fonts_ref.get_object()
                    else:
                        fonts = fonts_ref

                    if fonts:
                        try:
                            fonts_count = len(fonts)
                            # Estimate font size (rough approximation)
                            fonts_size = fonts_count * 5000  # Average font size
                        except Exception:
                            pass

                # Extract text content and calculate text size
                text_content = ""
                text_size = 0
                try:
                    text_content = page.extract_text() or ""
                    text_size = len(text_content.encode('utf-8'))
                except Exception:
                    pass

                # Estimate content streams size (excluding text which is already counted)
                content_streams_size = 0
                if '/Contents' in page_dict:
                    contents = page_dict['/Contents']
                    if isinstance(contents, list):
                        for content in contents:
                            try:
                                if hasattr(content, 'get_object'):
                                    content_obj = content.get_object()
                                else:
                                    content_obj = content

                                if hasattr(content_obj, '_data'):
                                    content_streams_size += len(content_obj._data)
                            except Exception:
                                continue
                    else:
                        try:
                            if hasattr(contents, 'get_object'):
                                content_obj = contents.get_object()
                            else:
                                content_obj = contents

                            if hasattr(content_obj, '_data'):
                                content_streams_size += len(content_obj._data)
                        except Exception:
                            pass

                total_page_size = images_size + fonts_size + content_streams_size

                page_data = {
                    'pageNumber': page_num + 1,
                    'totalSize': total_page_size,
                    'images': images_count,
                    'imagesSize': images_size,
                    'fonts': fonts_count,
                    'fontsSize': fonts_size,
                    'textSize': text_size,
                    'textLength': len(text_content),
                    'contentStreams': 1 if content_streams_size > 0 else 0,
                    'contentStreamsSize': content_streams_size,
                    'thumbnail': thumbnails[page_num] if page_num < len(thumbnails) else None,
                }

                pages.append(page_data)

                # Generate recommendations
                if images_size > 500000:
                    recommendations.append(
                        f"Page {page_num + 1}: Large images detected ({self._format_bytes(images_size)}). "
                        "Consider compressing images."
                    )
                if images_count > 10:
                    recommendations.append(
                        f"Page {page_num + 1}: Many images ({images_count}). "
                        "Consider optimizing image count."
                    )

            # Overall recommendations
            total_images_size = sum(p['imagesSize'] for p in pages)
            if total_images_size > total_size * 0.7:
                recommendations.append(
                    "Images take up more than 70% of the PDF size. "
                    "Consider aggressive image compression."
                )

            # Check for large file
            if total_size > 10 * 1024 * 1024:  # 10MB
                recommendations.append(
                    f"Large PDF file ({self._format_bytes(total_size)}). "
                    "Consider splitting or compressing."
                )

            return Response({
                'fileName': uploaded_file.name,
                'totalSize': total_size,
                'pageCount': page_count,
                'pages': pages,
                'metadata': metadata,
                'recommendations': recommendations,
            })

        except Exception as e:
            return Response(
                {'error': f'Error analyzing PDF: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _format_bytes(self, bytes_size):
        """Format bytes to human readable string."""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.2f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.2f} TB"


class DocxToPdfView(APIView):
    """Convert DOCX files to PDF."""
    permission_classes = [AllowAny]

    def post(self, request):
        """Convert uploaded DOCX file to PDF."""
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_file = request.FILES['file']

        # Validate file type
        valid_extensions = ['.doc', '.docx']
        file_ext = uploaded_file.name.lower().split('.')[-1]
        if f'.{file_ext}' not in valid_extensions:
            return Response(
                {'error': 'Invalid file type. Only .doc and .docx files are supported.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Try using python-docx and reportlab for conversion
            from docx import Document
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas
            from reportlab.lib.styles import getSampleStyleSheet
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.units import inch

            # Read DOCX
            doc = Document(uploaded_file)

            # Create PDF in memory
            pdf_buffer = io.BytesIO()
            pdf_doc = SimpleDocTemplate(
                pdf_buffer,
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )

            styles = getSampleStyleSheet()
            story = []

            for para in doc.paragraphs:
                if para.text.strip():
                    # Determine style based on paragraph style
                    style_name = 'Normal'
                    if para.style and para.style.name:
                        if 'Heading 1' in para.style.name:
                            style_name = 'Heading1'
                        elif 'Heading 2' in para.style.name:
                            style_name = 'Heading2'
                        elif 'Heading 3' in para.style.name:
                            style_name = 'Heading3'

                    story.append(Paragraph(para.text, styles[style_name]))
                    story.append(Spacer(1, 12))

            if not story:
                story.append(Paragraph("(Empty document)", styles['Normal']))

            pdf_doc.build(story)
            pdf_buffer.seek(0)

            response = FileResponse(
                pdf_buffer,
                content_type='application/pdf',
                as_attachment=True,
                filename=uploaded_file.name.rsplit('.', 1)[0] + '.pdf'
            )
            return response

        except ImportError:
            return Response(
                {'error': 'DOCX to PDF conversion is not available. Required packages: python-docx, reportlab'},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )
        except Exception as e:
            return Response(
                {'error': f'Conversion failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class YoutubeDownloaderView(APIView):
    """Download videos from YouTube."""
    permission_classes = [AllowAny]

    def post(self, request):
        """Get video info and download link."""
        url = request.data.get('url')
        quality = request.data.get('quality', 'best')

        if not url:
            return Response(
                {'error': 'URL is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            import yt_dlp
            import tempfile
            import os

            # Configure yt-dlp options
            ydl_opts = {
                'format': quality if quality != 'best' else 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                'outtmpl': os.path.join(tempfile.gettempdir(), '%(title)s.%(ext)s'),
                'quiet': True,
                'no_warnings': True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Extract info without downloading first
                info = ydl.extract_info(url, download=False)

                # Get available formats with direct URLs
                formats = []
                if 'formats' in info:
                    for f in info['formats']:
                        if f.get('vcodec') != 'none' and f.get('acodec') != 'none':
                            formats.append({
                                'format_id': f.get('format_id'),
                                'ext': f.get('ext'),
                                'resolution': f.get('resolution', 'audio only'),
                                'filesize': f.get('filesize', 0),
                                'url': f.get('url', ''),  # Direct download URL
                            })

                # Get the best format's direct URL
                best_format = info.get('url') or (formats[0]['url'] if formats else '')

                return Response({
                    'title': info.get('title'),
                    'duration': info.get('duration'),
                    'thumbnail': info.get('thumbnail'),
                    'uploader': info.get('uploader'),
                    'view_count': info.get('view_count'),
                    'formats': formats[:10],  # Return top 10 formats
                    'download_url': best_format,  # Direct download URL for best quality
                    'original_url': url,
                })

        except Exception as e:
            return Response(
                {'error': f'Failed to fetch video info: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        """Download the video."""
        url = request.query_params.get('url')
        format_id = request.query_params.get('format', 'best')

        if not url:
            return Response(
                {'error': 'URL is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            import yt_dlp
            import tempfile
            import os

            temp_dir = tempfile.mkdtemp()
            ydl_opts = {
                'format': format_id,
                'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
                'quiet': True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                filename = ydl.prepare_filename(info)

                if os.path.exists(filename):
                    with open(filename, 'rb') as f:
                        response = HttpResponse(f.read(), content_type='video/mp4')
                        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(filename)}"'
                        return response

            return Response(
                {'error': 'Failed to download video'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except Exception as e:
            return Response(
                {'error': f'Download failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InstagramDownloaderView(APIView):
    """Download content from Instagram."""
    permission_classes = [AllowAny]

    def post(self, request):
        """Get Instagram post info and download."""
        url = request.data.get('url')

        if not url:
            return Response(
                {'error': 'URL is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            import yt_dlp

            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

                return Response({
                    'title': info.get('title', 'Instagram Post'),
                    'thumbnail': info.get('thumbnail'),
                    'uploader': info.get('uploader'),
                    'description': info.get('description', ''),
                    'download_url': info.get('url'),
                    'type': 'video' if info.get('vcodec') != 'none' else 'image',
                })

        except Exception as e:
            return Response(
                {'error': f'Failed to fetch Instagram content: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TwitterDownloaderView(APIView):
    """Download videos from Twitter/X."""
    permission_classes = [AllowAny]

    def post(self, request):
        """Get Twitter video info and download."""
        url = request.data.get('url')

        if not url:
            return Response(
                {'error': 'URL is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            import yt_dlp

            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

                # Get available formats
                formats = []
                if 'formats' in info:
                    for f in info['formats']:
                        formats.append({
                            'format_id': f.get('format_id'),
                            'ext': f.get('ext'),
                            'resolution': f.get('resolution', f.get('height', 'unknown')),
                            'filesize': f.get('filesize', 0),
                        })

                return Response({
                    'title': info.get('title', 'Twitter Video'),
                    'thumbnail': info.get('thumbnail'),
                    'uploader': info.get('uploader'),
                    'description': info.get('description', ''),
                    'formats': formats,
                    'download_url': info.get('url'),
                })

        except Exception as e:
            return Response(
                {'error': f'Failed to fetch Twitter video: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
