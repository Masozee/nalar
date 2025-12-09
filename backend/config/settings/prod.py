"""
Django production settings.
"""

import os
from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or os.environ.get('SECRET_KEY') or 'fallback-key-for-debugging'

DEBUG = False

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(',')

# Database with connection pooling
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'CONN_MAX_AGE': 60,
        'CONN_HEALTH_CHECKS': True,
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}

# Redis cache - using Django's built-in Redis cache (no django-redis dependency issues)
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': REDIS_URL,
        'KEY_PREFIX': 'nalar',
    }
}

# Session with Redis
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# SSL/HTTPS settings - disable for local testing, enable in real production with HTTPS
SESSION_COOKIE_SECURE = os.environ.get('ENABLE_HTTPS', 'False') == 'True'
CSRF_COOKIE_SECURE = os.environ.get('ENABLE_HTTPS', 'False') == 'True'
SECURE_SSL_REDIRECT = os.environ.get('ENABLE_HTTPS', 'False') == 'True'
SECURE_HSTS_SECONDS = 31536000 if os.environ.get('ENABLE_HTTPS', 'False') == 'True' else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.environ.get('ENABLE_HTTPS', 'False') == 'True'
SECURE_HSTS_PRELOAD = os.environ.get('ENABLE_HTTPS', 'False') == 'True'

# CORS settings - allow all origins for local development
CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL', 'True') == 'True'
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',') if os.environ.get('CORS_ALLOWED_ORIGINS') and not CORS_ALLOW_ALL_ORIGINS else []

# JWT Settings - explicitly set SIGNING_KEY
SIMPLE_JWT = SIMPLE_JWT.copy()
SIMPLE_JWT['SIGNING_KEY'] = SECRET_KEY

# Production logging
LOGGING['handlers']['file'] = {
    'class': 'logging.FileHandler',
    'filename': BASE_DIR / 'logs' / 'django.log',
    'formatter': 'verbose',
}
LOGGING['root']['handlers'] = ['console', 'file']

# RustFS / S3 Object Storage Configuration
# Note: RustFS uses RUSTFS_ACCESS_KEY and RUSTFS_SECRET_KEY (both default to 'rustfsadmin')
AWS_ACCESS_KEY_ID = os.environ.get('RUSTFS_ACCESS_KEY', 'rustfsadmin')
AWS_SECRET_ACCESS_KEY = os.environ.get('RUSTFS_SECRET_KEY', 'rustfsadmin')
AWS_STORAGE_BUCKET_NAME = os.environ.get('RUSTFS_MEDIA_BUCKET', 'nalar-media')
AWS_S3_ENDPOINT_URL = os.environ.get('RUSTFS_ENDPOINT_INTERNAL', 'http://rustfs:9000')
AWS_S3_REGION_NAME = 'us-east-1'
AWS_S3_SIGNATURE_VERSION = 's3v4'
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None
AWS_S3_VERIFY = False  # Disable SSL verification for local development
AWS_S3_USE_SSL = False
AWS_QUERYSTRING_AUTH = True
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}

# Use RustFS for media files
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

# Keep static files local (served by Caddy/Nginx in production)
# Or uncomment to use RustFS for static files too:
# STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
# AWS_STATIC_LOCATION = 'static'

# Media files configuration
MEDIA_URL = f'{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/'
