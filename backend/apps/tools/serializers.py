"""
Serializers for Tools app.
"""
from rest_framework import serializers
from .models import ShortenedURL, URLClickLog, QRCode, CompressedImage, PDFOperation, PDFInputFile


# URL Shortener Serializers
class ShortenedURLSerializer(serializers.ModelSerializer):
    short_url = serializers.ReadOnlyField()
    short_code = serializers.CharField(required=False, allow_blank=True, max_length=20)

    class Meta:
        model = ShortenedURL
        fields = [
            'id', 'original_url', 'short_code', 'short_url', 'title',
            'click_count', 'last_clicked_at', 'expires_at', 'password',
            'is_expired', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'short_url', 'click_count', 'last_clicked_at', 'is_expired', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_short_code(self, value):
        """Validate custom short code if provided."""
        if value:
            # Check if already exists (excluding current instance on update)
            qs = ShortenedURL.objects.filter(short_code=value)
            if self.instance:
                qs = qs.exclude(id=self.instance.id)
            if qs.exists():
                raise serializers.ValidationError("This short code is already taken.")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        # If no short_code provided, model will auto-generate
        if not validated_data.get('short_code'):
            validated_data.pop('short_code', None)
        return super().create(validated_data)


class URLClickLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = URLClickLog
        fields = [
            'id', 'shortened_url', 'clicked_at', 'ip_address',
            'country', 'country_code', 'city', 'region', 'referer',
            'device_type', 'browser', 'browser_version', 'os', 'os_version', 'is_bot'
        ]
        read_only_fields = ['id', 'clicked_at']


class URLStatsSerializer(serializers.Serializer):
    """Statistics for shortened URL."""
    total_clicks = serializers.IntegerField()
    clicks_today = serializers.IntegerField()
    clicks_this_week = serializers.IntegerField()
    clicks_this_month = serializers.IntegerField()
    top_countries = serializers.ListField()
    recent_clicks = URLClickLogSerializer(many=True)


# QR Code Serializers
class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = [
            'id', 'content_type', 'content', 'title',
            'size', 'error_correction', 'foreground_color', 'background_color',
            'qr_image', 'download_count', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'qr_image', 'download_count', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class QRCodeGenerateSerializer(serializers.Serializer):
    """Serializer for generating QR code without saving."""
    content_type = serializers.ChoiceField(choices=QRCode.ContentType.choices, default='url')
    content = serializers.CharField()
    size = serializers.IntegerField(default=300, min_value=100, max_value=1000)
    error_correction = serializers.ChoiceField(
        choices=[('L', 'Low'), ('M', 'Medium'), ('Q', 'Quartile'), ('H', 'High')],
        default='M'
    )
    foreground_color = serializers.CharField(default='#000000', max_length=7)
    background_color = serializers.CharField(default='#FFFFFF', max_length=7)


# Image Compressor Serializers
class CompressedImageSerializer(serializers.ModelSerializer):
    compression_ratio = serializers.ReadOnlyField()

    class Meta:
        model = CompressedImage
        fields = [
            'id', 'title', 'original_image', 'compressed_image',
            'quality', 'max_width', 'max_height', 'output_format',
            'original_size', 'compressed_size', 'compression_ratio',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'compressed_image', 'original_size', 'compressed_size', 'compression_ratio', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class ImageCompressSerializer(serializers.Serializer):
    """Serializer for compressing image without saving."""
    image = serializers.ImageField()
    quality = serializers.IntegerField(default=80, min_value=1, max_value=100)
    max_width = serializers.IntegerField(required=False, min_value=1)
    max_height = serializers.IntegerField(required=False, min_value=1)
    output_format = serializers.ChoiceField(
        choices=CompressedImage.OutputFormat.choices,
        default='jpeg'
    )


# PDF Operation Serializers
class PDFInputFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFInputFile
        fields = ['id', 'file', 'order', 'page_count']
        read_only_fields = ['id', 'page_count']


class PDFOperationSerializer(serializers.ModelSerializer):
    input_files = PDFInputFileSerializer(many=True, read_only=True)

    class Meta:
        model = PDFOperation
        fields = [
            'id', 'operation_type', 'title', 'page_ranges',
            'result_file', 'input_page_count', 'output_page_count',
            'input_files', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'result_file', 'input_page_count', 'output_page_count', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class PDFMergeSerializer(serializers.Serializer):
    """Serializer for merging PDFs."""
    files = serializers.ListField(
        child=serializers.FileField(),
        min_length=2,
        help_text='List of PDF files to merge (minimum 2)'
    )
    title = serializers.CharField(max_length=200, required=False)


class PDFSplitSerializer(serializers.Serializer):
    """Serializer for splitting PDF."""
    file = serializers.FileField(help_text='PDF file to split')
    page_ranges = serializers.CharField(
        help_text='Page ranges to extract, e.g., "1-3,5,7-10"'
    )
    title = serializers.CharField(max_length=200, required=False)
