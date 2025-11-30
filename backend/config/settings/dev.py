"""
Django development settings.
"""

import os
from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-8lv3tn0&lk4+g=-+^wloh8iwhle^+g5ccod0yhh@l*(ycqsrd4'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Database - PostgreSQL (use environment variables or defaults)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'nalar'),
        'USER': os.environ.get('DB_USER', 'nalar'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'nalar_secret'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Redis Cache Configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://localhost:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PASSWORD': os.environ.get('REDIS_PASSWORD', 'nalar_redis_secret'),
            'CONNECTION_POOL_KWARGS': {'max_connections': 50},
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
        },
        'KEY_PREFIX': 'nalar',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# Use Redis for session storage
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Enable API caching in development
ENABLE_API_CACHE = True

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True

# JWT Signing Key (uses SECRET_KEY)
SIMPLE_JWT['SIGNING_KEY'] = SECRET_KEY

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Use simple JSON renderer in dev for browsable API
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = [
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
]
REST_FRAMEWORK['DEFAULT_PARSER_CLASSES'] = [
    'rest_framework.parsers.JSONParser',
    'rest_framework.parsers.FormParser',
    'rest_framework.parsers.MultiPartParser',
]

# Disable throttling in development
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []

# Allow any permission in development (no authentication required)
REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = [
    'rest_framework.permissions.AllowAny',
]

# Debug toolbar (install with: uv pip install django-debug-toolbar)
try:
    import debug_toolbar
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
    INTERNAL_IPS = ['127.0.0.1']
    DEBUG_TOOLBAR_CONFIG = {
        'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG,
    }
except ImportError:
    pass

# Silk profiler (install with: uv pip install django-silk)
try:
    import silk
    INSTALLED_APPS += ['silk']
    MIDDLEWARE += ['silk.middleware.SilkyMiddleware']
    SILKY_PYTHON_PROFILER = True
    SILKY_PYTHON_PROFILER_BINARY = True
except ImportError:
    pass

# Log SQL queries in development
LOGGING['loggers']['django.db.backends'] = {
    'handlers': ['console'],
    'level': 'DEBUG' if DEBUG else 'WARNING',
}
