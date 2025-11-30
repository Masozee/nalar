from django.contrib import admin
from .models import ShortenedURL, URLClickLog, QRCode, CompressedImage, PDFOperation, PDFInputFile


class URLClickLogInline(admin.TabularInline):
    model = URLClickLog
    extra = 0
    readonly_fields = ['clicked_at', 'ip_address', 'user_agent', 'referer']
    can_delete = False


@admin.register(ShortenedURL)
class ShortenedURLAdmin(admin.ModelAdmin):
    list_display = [
        'short_code', 'original_url', 'title', 'click_count',
        'expires_at', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['short_code', 'original_url', 'title']
    readonly_fields = ['short_code', 'click_count', 'last_clicked_at', 'short_url', 'created_at']
    raw_id_fields = ['created_by', 'updated_by']
    inlines = [URLClickLogInline]


@admin.register(URLClickLog)
class URLClickLogAdmin(admin.ModelAdmin):
    list_display = ['shortened_url', 'clicked_at', 'ip_address', 'country', 'city']
    list_filter = ['clicked_at', 'country']
    search_fields = ['shortened_url__short_code', 'ip_address']
    raw_id_fields = ['shortened_url']
    readonly_fields = ['clicked_at']


@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'content_type', 'size', 'download_count',
        'is_active', 'created_at'
    ]
    list_filter = ['content_type', 'is_active', 'created_at']
    search_fields = ['title', 'content']
    readonly_fields = ['download_count', 'created_at']
    raw_id_fields = ['created_by', 'updated_by']


@admin.register(CompressedImage)
class CompressedImageAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'output_format', 'quality', 'original_size',
        'compressed_size', 'compression_ratio', 'created_at'
    ]
    list_filter = ['output_format', 'created_at']
    search_fields = ['title']
    readonly_fields = ['original_size', 'compressed_size', 'compression_ratio', 'created_at']
    raw_id_fields = ['created_by', 'updated_by']


class PDFInputFileInline(admin.TabularInline):
    model = PDFInputFile
    extra = 1


@admin.register(PDFOperation)
class PDFOperationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'operation_type', 'input_page_count',
        'output_page_count', 'is_active', 'created_at'
    ]
    list_filter = ['operation_type', 'created_at']
    search_fields = ['title']
    readonly_fields = ['input_page_count', 'output_page_count', 'created_at']
    raw_id_fields = ['created_by', 'updated_by']
    inlines = [PDFInputFileInline]
