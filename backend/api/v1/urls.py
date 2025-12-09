from django.urls import path, include
from .routers import router

app_name = 'api_v1'

urlpatterns = [
    path('', include(router.urls)),
    path('', include('apps.tenants.urls')),  # Tenant management API
    path('', include('apps.core.urls')),  # Core API (audit logs, etc.)
    path('analytics/', include('apps.analytics.urls')),  # Dashboard analytics API
    path('auth/', include('apps.users.urls')),
    path('hr/', include('apps.hr.urls')),
    path('organization/', include('apps.organization.urls')),
    path('workflow/', include('apps.workflow.urls')),
    path('ticketing/', include('apps.ticketing.urls')),
    path('admin-ops/', include('apps.admin_ops.urls')),
    path('assets/', include('apps.assets.urls')),
    path('documents/', include('apps.documents.urls')),
    path('procurement/', include('apps.procurement.urls')),
    path('inventory/', include('apps.inventory.urls')),
    path('finance/', include('apps.finance.urls')),
    path('research/', include('apps.research.urls')),
    path('tools/', include('apps.tools.urls')),
    path('policies/', include('apps.policies.urls')),
]
