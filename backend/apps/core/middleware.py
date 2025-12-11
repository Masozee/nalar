"""
Tenant middleware for automatic tenant detection and context management.
"""

import threading
from django.utils.deprecation import MiddlewareMixin
from apps.tenants.models import Tenant, TenantUser

# Thread-local storage for current tenant
_thread_locals = threading.local()


def get_current_tenant():
    """Get the current tenant from thread-local storage."""
    return getattr(_thread_locals, 'tenant', None)


def set_current_tenant(tenant):
    """Set the current tenant in thread-local storage."""
    _thread_locals.tenant = tenant


def clear_current_tenant():
    """Clear the current tenant from thread-local storage."""
    if hasattr(_thread_locals, 'tenant'):
        del _thread_locals.tenant


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to set the current tenant based on:
    1. Subdomain (e.g., acme.nalar.app)
    2. X-Tenant-ID header (for API calls)
    3. JWT token tenant claim
    4. User's current tenant selection

    The tenant is stored in thread-local storage and used by TenantManager
    to automatically filter all queries.
    """

    def process_request(self, request):
        """Extract tenant from request and set it in thread-local."""
        tenant = None

        # Method 1: From subdomain
        host = request.get_host().split(':')[0]
        subdomain_parts = host.split('.')
        if len(subdomain_parts) > 2:  # subdomain.nalar.app
            subdomain = subdomain_parts[0]
            try:
                tenant = Tenant.objects.get(subdomain=subdomain, status='active')
            except Tenant.DoesNotExist:
                pass

        # Method 2: From X-Tenant-ID header (for API calls)
        if not tenant:
            tenant_id = request.headers.get('X-Tenant-ID')
            if tenant_id:
                try:
                    tenant = Tenant.objects.get(id=tenant_id, is_active=True)
                except Tenant.DoesNotExist:
                    pass

        # Method 3: From authenticated user's JWT token or session
        if not tenant and request.user and request.user.is_authenticated:
            try:
                # Get user's primary tenant or first active tenant
                tenant_user = TenantUser.objects.filter(
                    user=request.user,
                    is_active=True,
                    tenant__is_active=True
                ).select_related('tenant').order_by('-is_owner', '-role').first()

                if tenant_user:
                    tenant = tenant_user.tenant
            except Exception:
                pass

        # Set tenant in thread-local and request
        set_current_tenant(tenant)
        request.tenant = tenant

    def process_response(self, request, response):
        """Clear tenant from thread-local after request."""
        clear_current_tenant()
        return response

    def process_exception(self, request, exception):
        """Clear tenant from thread-local on exception."""
        clear_current_tenant()
        return None
