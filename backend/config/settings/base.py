"""
Django base settings for config project.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/topics/settings/
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load .env from project root (parent of backend) only if dotenv is available
PROJECT_ROOT = BASE_DIR.parent
try:
    from dotenv import load_dotenv
    load_dotenv(PROJECT_ROOT / '.env')
except ImportError:
    # dotenv not installed (e.g., in production), skip loading
    pass

# Application URLs
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:8000')


# Application definition

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_spectacular',  # OpenAPI/Swagger documentation
    'storages',  # S3/RustFS storage backend
]

LOCAL_APPS = [
    'apps.core',
    'apps.tenants',  # Multi-tenancy support
    'apps.users',
    'apps.organization',
    'apps.hr',
    'apps.admin_ops',
    'apps.admin_ops.crm',
    'apps.assets',
    'apps.inventory',
    'apps.procurement',
    'apps.ticketing',
    'apps.workflow',
    'apps.documents',
    'apps.research',
    'apps.finance',
    'apps.analytics',
    'apps.tools',
    'apps.policies',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.core.middleware.TenantMiddleware',  # Multi-tenancy support
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'users.User'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'apps.core.pagination.DefaultCursorPagination',
    'PAGE_SIZE': 20,
    # Use orjson for faster JSON rendering
    'DEFAULT_RENDERER_CLASSES': [
        'apps.core.renderers.ORJSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'apps.core.parsers.ORJSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    # Throttling
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
    # OpenAPI Schema
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Cache settings (override in dev/prod)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Session settings
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'WARNING',
        },
    },
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': None,  # Will use SECRET_KEY if None
    'VERIFYING_KEY': None,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    'JTI_CLAIM': 'jti',
}

# CORS Settings (override in dev/prod)
CORS_ALLOWED_ORIGINS = []
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]


# ===========================
# Polar.sh Configuration
# ===========================
POLAR_ACCESS_TOKEN = os.environ.get("POLAR_ACCESS_TOKEN", "")
POLAR_WEBHOOK_SECRET = os.environ.get("POLAR_WEBHOOK_SECRET", "")

# Polar Product IDs for different plans
POLAR_PRODUCT_STARTER = os.environ.get("POLAR_PRODUCT_STARTER", "")
POLAR_PRODUCT_PROFESSIONAL = os.environ.get("POLAR_PRODUCT_PROFESSIONAL", "")
POLAR_PRODUCT_ENTERPRISE = os.environ.get("POLAR_PRODUCT_ENTERPRISE", "")


# ===========================
# API Documentation (drf-spectacular)
# ===========================
SPECTACULAR_SETTINGS = {
    'TITLE': 'Nalar ERP API',
    'DESCRIPTION': '''
    **Comprehensive Multi-Tenant ERP System**

    Nalar is a modern, cloud-based ERP platform designed for small to medium enterprises.
    Built with Django REST Framework and React, it provides complete business management
    capabilities with enterprise-grade security and scalability.

    ## Key Features

    ### 🏢 Multi-Tenancy
    - Complete data isolation between organizations
    - Subscription-based access control
    - Customizable branding per tenant

    ### 💼 Core Modules
    - **HR Management**: Employee records, payroll, attendance, leave
    - **Finance**: Expense tracking, invoicing, payments
    - **Organization**: Department structure, positions, teams
    - **Assets**: Asset tracking, assignments, maintenance
    - **Inventory**: Stock management, transfers, opname
    - **Procurement**: Purchase orders, vendors, approvals
    - **Documents**: File management with access control
    - **Ticketing**: Issue tracking and support
    - **Workflow**: Approval processes and automation

    ### 🔐 Security
    - JWT-based authentication
    - Role-based access control (RBAC)
    - Multi-factor authentication support
    - Audit logging

    ### 💳 Billing & Subscriptions
    - Integrated with Polar.sh for payments
    - Multiple subscription tiers
    - Usage tracking and limits
    - Automated invoicing

    ## Getting Started

    1. **Authentication**: Obtain JWT token via `/api/v1/auth/login/`
    2. **Set Headers**: Include `Authorization: Bearer <token>` in all requests
    3. **Explore**: Use Swagger UI to test endpoints interactively

    ## Support

    - Documentation: https://docs.nalar.io
    - GitHub: https://github.com/yourusername/nalar
    - Support: support@nalar.io
    ''',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': True,
    'SERVE_PUBLIC': True,
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': True,
        'filter': True,
        'tryItOutEnabled': True,
    },
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v1',
    'SERVERS': [
        {'url': 'http://localhost:8000', 'description': 'Local Development'},
        {'url': 'https://api.nalar.io', 'description': 'Production API'},
    ],
    'EXTERNAL_DOCS': {
        'description': 'Full Documentation',
        'url': 'https://docs.nalar.io'
    },
    'CONTACT': {
        'name': 'Nalar Support',
        'email': 'support@nalar.io',
    },
    'LICENSE': {
        'name': 'Proprietary',
    },
    'TAGS': [
        {'name': 'Authentication', 'description': 'User authentication and token management'},
        {'name': 'Tenants', 'description': 'Multi-tenant organization management'},
        {'name': 'Subscriptions', 'description': 'Subscription and plan management'},
        {'name': 'Billing', 'description': 'Payment processing and billing operations'},
        {'name': 'HR - Employees', 'description': 'Employee lifecycle and profile management'},
        {'name': 'HR - Payroll', 'description': 'Salary processing and payslips'},
        {'name': 'HR - Leave', 'description': 'Leave requests and attendance'},
        {'name': 'Organization - Departments', 'description': 'Department hierarchy and structure'},
        {'name': 'Organization - Teams', 'description': 'Team management and collaboration'},
        {'name': 'Finance', 'description': 'Financial management and expense tracking'},
        {'name': 'Assets', 'description': 'Asset tracking and lifecycle management'},
        {'name': 'Inventory', 'description': 'Stock and inventory management'},
        {'name': 'Procurement', 'description': 'Purchase orders and vendor management'},
        {'name': 'Documents', 'description': 'Document management and file storage'},
        {'name': 'Ticketing', 'description': 'Issue tracking and support tickets'},
        {'name': 'Workflow', 'description': 'Approval workflows and automation'},
        {'name': 'CRM', 'description': 'Customer relationship management'},
        {'name': 'Research', 'description': 'Research projects and grants'},
        {'name': 'Admin Operations', 'description': 'Facilities and operations management'},
    ],
}
