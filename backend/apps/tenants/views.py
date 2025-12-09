"""Views for tenant management API."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
import logging

from apps.core.pagination import DefaultPagePagination
from .models import Tenant, TenantUser, Subscription, Invoice, TenantRole, PlanType
from .serializers import (
    TenantSerializer,
    TenantUpdateSerializer,
    TenantUserSerializer,
    SubscriptionSerializer,
    InvoiceSerializer,
    TenantRoleChoicesSerializer,
    TenantPlanChoicesSerializer,
)
from .services.polar_service import polar_service

logger = logging.getLogger(__name__)


@extend_schema_view(
    list=extend_schema(
        summary="List All Tenants",
        description="""
        Get a list of all tenants accessible to the authenticated user.

        **Permissions:**
        - Super admins can see all tenants in the system
        - Regular users only see tenants they belong to

        **Use Cases:**
        - Admin dashboard showing all organizations
        - Tenant selector for multi-tenant users
        - Organization management interface
        """,
        tags=["Tenants"],
    ),
    retrieve=extend_schema(
        summary="Get Tenant Details",
        description="Retrieve detailed information about a specific tenant by ID.",
        tags=["Tenants"],
    ),
    create=extend_schema(
        summary="Create New Tenant",
        description="""
        Create a new tenant (organization) in the system.

        **Auto-created:**
        - Subscription record (trial status)
        - Creator as tenant owner
        - Default settings and limits
        """,
        tags=["Tenants"],
    ),
    update=extend_schema(
        summary="Update Tenant",
        description="Update tenant information (full update).",
        tags=["Tenants"],
    ),
    partial_update=extend_schema(
        summary="Partially Update Tenant",
        description="Update specific tenant fields (partial update).",
        tags=["Tenants"],
    ),
)
class TenantViewSet(viewsets.ModelViewSet):
    """
    **Multi-Tenant Organization Management**

    Manage organizations (tenants) in the multi-tenant ERP system. Each tenant represents
    a separate organization with isolated data, users, and resources.

    **Key Features:**
    - Data isolation between tenants
    - Subscription-based access control
    - Customizable branding and settings
    - User and role management per tenant
    """

    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get tenants accessible to the user."""
        user = self.request.user

        if user.is_superuser:
            # Super admin sees all tenants
            return Tenant.objects.all()

        # Regular users see only their tenants
        return Tenant.objects.filter(
            tenant_users__user=user,
            tenant_users__is_active=True
        ).distinct()

    @extend_schema(
        summary="Get Current Tenant",
        description="""
        Retrieve the current tenant context for the authenticated user.

        Returns the active tenant that the user is currently working within.
        This is typically used to display organization information in the UI header.

        **Response includes:**
        - Organization name and branding
        - Subscription plan and status
        - User limits and features
        - Contact information
        """,
        tags=["Tenants"],
        responses={
            200: TenantSerializer,
            404: {"description": "User not associated with any tenant"}
        }
    )
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current tenant for the authenticated user."""
        user = request.user

        # Get user's first active tenant membership
        tenant_user = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).select_related('tenant').first()

        if not tenant_user:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(tenant_user.tenant)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'])
    def update_current(self, request):
        """
        Update current tenant settings.

        Only tenant owners/admins can update settings.
        """
        user = request.user

        # Get user's tenant
        tenant_user = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).select_related('tenant').first()

        if not tenant_user:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user can manage tenant
        if not tenant_user.can_manage_users:
            return Response(
                {'detail': 'You do not have permission to update tenant settings.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TenantUpdateSerializer(
            tenant_user.tenant,
            data=request.data,
            partial=request.method == 'PATCH'
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Return full tenant data
        return Response(TenantSerializer(tenant_user.tenant).data)


class TenantUserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tenant users.

    Endpoints:
    - GET /api/v1/tenants/users/ - List users in current tenant
    - POST /api/v1/tenants/users/ - Add user to tenant
    - PUT /api/v1/tenants/users/{id}/ - Update user role
    - DELETE /api/v1/tenants/users/{id}/ - Remove user from tenant
    """

    serializer_class = TenantUserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagePagination

    def get_queryset(self):
        """Get users for the current tenant."""
        user = self.request.user

        # Get user's tenant
        tenant_user = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).first()

        if not tenant_user:
            return TenantUser.objects.none()

        # Return users in the same tenant
        return TenantUser.objects.filter(
            tenant=tenant_user.tenant
        ).select_related('user', 'tenant').order_by('-is_owner', 'role')

    def perform_create(self, serializer):
        """Create tenant user in the current tenant."""
        user = self.request.user

        # Get user's tenant
        tenant_user = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).first()

        if not tenant_user:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        if not tenant_user.can_manage_users:
            return Response(
                {'detail': 'You do not have permission to add users.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer.save(
            tenant=tenant_user.tenant,
            invited_by=user
        )

    @action(detail=False, methods=['get'])
    def roles(self, request):
        """Get available tenant roles."""
        roles = [
            {'value': choice[0], 'label': choice[1]}
            for choice in TenantRole.choices
        ]
        return Response(roles)


@extend_schema_view(
    list=extend_schema(
        summary="List Subscriptions",
        description="Get all subscriptions for tenants the user belongs to.",
        tags=["Subscriptions"],
    ),
    retrieve=extend_schema(
        summary="Get Subscription Details",
        description="Retrieve detailed subscription information by ID.",
        tags=["Subscriptions"],
    ),
)
class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    **Subscription Management (Read-Only)**

    View subscription details for your organization. Subscriptions define the plan tier,
    billing period, and feature access for each tenant.

    **Key Information:**
    - Current plan (free, starter, professional, enterprise)
    - Billing status and dates
    - Trial period information
    - Payment history

    **Note:** To modify subscriptions, use the Billing API endpoints.
    """

    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get subscription for user's tenants."""
        user = self.request.user

        # Get user's tenant IDs
        tenant_ids = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).values_list('tenant_id', flat=True)

        return Subscription.objects.filter(tenant_id__in=tenant_ids)

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get subscription for current tenant."""
        user = request.user

        # Get user's tenant
        tenant_user = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).select_related('tenant').first()

        if not tenant_user:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        subscription = get_object_or_404(
            Subscription,
            tenant=tenant_user.tenant
        )

        serializer = self.get_serializer(subscription)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def plans(self, request):
        """Get available subscription plans."""
        plans = [
            {
                'value': choice[0],
                'label': choice[1],
                'features': self._get_plan_features(choice[0])
            }
            for choice in PlanType.choices
        ]
        return Response(plans)

    def _get_plan_features(self, plan):
        """Get features for a plan."""
        features = {
            'free': {
                'max_users': 5,
                'max_storage_gb': 1,
                'modules': ['hr', 'organization'],
                'support': 'Community',
            },
            'starter': {
                'max_users': 25,
                'max_storage_gb': 10,
                'modules': ['hr', 'organization', 'finance', 'assets'],
                'support': 'Email',
            },
            'professional': {
                'max_users': 100,
                'max_storage_gb': 50,
                'modules': ['all'],
                'support': 'Priority Email',
            },
            'enterprise': {
                'max_users': 1000,
                'max_storage_gb': 100,
                'modules': ['all'],
                'support': '24/7 Phone & Email',
                'custom_features': True,
            },
        }
        return features.get(plan, {})


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing invoices.

    Endpoints:
    - GET /api/v1/tenants/invoices/ - List invoices for current tenant
    - GET /api/v1/tenants/invoices/{id}/ - Get invoice details
    """

    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagePagination

    def get_queryset(self):
        """Get invoices for the current tenant."""
        user = self.request.user

        # Get user's tenant
        tenant_user = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).first()

        if not tenant_user:
            return Invoice.objects.none()

        # Return invoices for the tenant
        queryset = Invoice.objects.filter(
            tenant=tenant_user.tenant
        ).select_related('tenant', 'subscription').order_by('-issue_date')

        # Filter by status if provided
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(issue_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(issue_date__lte=end_date)

        return queryset


@extend_schema_view(
    list=extend_schema(
        summary="List Billing Endpoints",
        description="Get a list of all available billing API endpoints and their purposes.",
        tags=["Billing"],
    ),
)
class BillingViewSet(viewsets.ViewSet):
    """
    **Billing & Subscription Management**

    Manage subscriptions, payments, and billing through Polar.sh integration.
    All billing operations are secured and require authentication.

    **Available Operations:**
    - Create checkout sessions for plan upgrades
    - Manage active subscriptions
    - Upgrade or downgrade plans
    - Cancel subscriptions
    - List available products and pricing
    """

    permission_classes = [IsAuthenticated]

    def _get_user_tenant(self, user):
        """Helper to get user's active tenant."""
        tenant_user = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).select_related('tenant').first()

        if not tenant_user:
            return None

        return tenant_user.tenant

    def list(self, request):
        """List available billing operations."""
        return Response({
            'message': 'Billing API',
            'endpoints': {
                'checkout': '/api/v1/billing/checkout/',
                'subscription': '/api/v1/billing/subscription/',
                'upgrade': '/api/v1/billing/subscription/upgrade/',
                'cancel': '/api/v1/billing/subscription/cancel/',
                'products': '/api/v1/billing/products/',
                'webhook': '/api/v1/billing/webhooks/polar/',
            }
        })

    @extend_schema(
        summary="Create Checkout Session",
        description="""
        Create a new Polar.sh checkout session to upgrade or subscribe to a plan.

        This endpoint initiates a payment flow by creating a checkout session with Polar.sh.
        The user will be redirected to Polar's secure payment page to complete the transaction.

        **Workflow:**
        1. User selects a plan (starter, professional, or enterprise)
        2. Backend creates a checkout session with Polar
        3. User is redirected to Polar's payment page
        4. After payment, user is redirected to success_url
        5. Webhook updates subscription status

        **Requirements:**
        - User must be authenticated
        - User must be associated with a tenant
        - Polar configuration must be set up
        """,
        tags=["Billing"],
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "plan": {
                        "type": "string",
                        "enum": ["starter", "professional", "enterprise"],
                        "description": "The subscription plan to purchase"
                    },
                    "success_url": {
                        "type": "string",
                        "format": "uri",
                        "description": "URL to redirect after successful payment"
                    },
                    "cancel_url": {
                        "type": "string",
                        "format": "uri",
                        "description": "URL to redirect if payment is canceled (optional)"
                    }
                },
                "required": ["plan", "success_url"],
                "example": {
                    "plan": "professional",
                    "success_url": "https://yourdomain.com/billing/success",
                    "cancel_url": "https://yourdomain.com/billing/cancel"
                }
            }
        },
        responses={
            201: {
                "description": "Checkout session created successfully",
                "content": {
                    "application/json": {
                        "example": {
                            "checkout_url": "https://polar.sh/checkout/abc123",
                            "checkout_id": "checkout_abc123",
                            "plan": "professional"
                        }
                    }
                }
            },
            400: {"description": "Invalid request data"},
            404: {"description": "User not associated with any tenant"},
            503: {"description": "Polar not configured"}
        }
    )
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Create a Polar checkout session for plan upgrade."""
        tenant = self._get_user_tenant(request.user)
        if not tenant:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get plan from request
        plan = request.data.get('plan')
        if not plan:
            return Response(
                {'detail': 'Plan is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Map plan to Polar product ID
        product_id_map = {
            'starter': settings.POLAR_PRODUCT_STARTER,
            'professional': settings.POLAR_PRODUCT_PROFESSIONAL,
            'enterprise': settings.POLAR_PRODUCT_ENTERPRISE,
        }

        product_id = product_id_map.get(plan)
        if not product_id:
            return Response(
                {'detail': f'Invalid plan: {plan}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate Polar configuration
        if not product_id or product_id.startswith('prod_REPLACE'):
            return Response(
                {'detail': 'Polar products not configured. Please set up Polar.sh integration.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Get URLs from request
        success_url = request.data.get('success_url')
        cancel_url = request.data.get('cancel_url')

        if not success_url:
            return Response(
                {'detail': 'success_url is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Create checkout session
            checkout_session = polar_service.create_checkout_session(
                tenant=tenant,
                product_id=product_id,
                success_url=success_url,
                cancel_url=cancel_url,
            )

            return Response({
                'checkout_url': checkout_session['checkout_url'],
                'checkout_id': checkout_session['checkout_id'],
                'plan': plan,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            return Response(
                {'detail': f'Failed to create checkout session: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Get Current Subscription",
        description="""
        Retrieve the current subscription details for the authenticated user's tenant.

        Returns subscription information including plan, status, billing period, and payment details.
        If no active subscription exists, returns a message indicating no subscription found.

        **Response includes:**
        - Subscription plan (free, starter, professional, enterprise)
        - Status (trialing, active, canceled, suspended)
        - Current billing period dates
        - Auto-renewal settings
        """,
        tags=["Billing"],
        responses={
            200: {
                "description": "Subscription details or no subscription message",
                "content": {
                    "application/json": {
                        "examples": {
                            "active_subscription": {
                                "value": {
                                    "id": "sub_123",
                                    "plan": "professional",
                                    "status": "active",
                                    "current_period_start": "2025-12-01T00:00:00Z",
                                    "current_period_end": "2026-01-01T00:00:00Z",
                                    "auto_renew": True
                                }
                            },
                            "no_subscription": {
                                "value": {
                                    "tenant": "uuid-here",
                                    "plan": "free",
                                    "status": "no_subscription",
                                    "message": "No active subscription found"
                                }
                            }
                        }
                    }
                }
            },
            404: {"description": "User not associated with any tenant"}
        }
    )
    @action(detail=False, methods=['get'])
    def subscription(self, request):
        """Get current subscription details."""
        tenant = self._get_user_tenant(request.user)
        if not tenant:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            subscription = Subscription.objects.get(tenant=tenant)
            serializer = SubscriptionSerializer(subscription)
            return Response(serializer.data)
        except Subscription.DoesNotExist:
            return Response({
                'tenant': str(tenant.id),
                'plan': tenant.plan,
                'status': 'no_subscription',
                'message': 'No active subscription found'
            }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='subscription/upgrade')
    def upgrade_subscription(self, request):
        """
        Upgrade to a higher plan.

        Body: {
            "plan": "starter" | "professional" | "enterprise"
        }
        """
        tenant = self._get_user_tenant(request.user)
        if not tenant:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user can manage billing
        tenant_user = TenantUser.objects.filter(
            user=request.user,
            tenant=tenant,
            is_active=True
        ).first()

        if not tenant_user or not tenant_user.can_manage_users:
            return Response(
                {'detail': 'You do not have permission to manage billing.'},
                status=status.HTTP_403_FORBIDDEN
            )

        new_plan = request.data.get('plan')
        if not new_plan:
            return Response(
                {'detail': 'Plan is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if tenant has an active subscription
        try:
            subscription = Subscription.objects.get(tenant=tenant)

            # Map plan to product ID
            product_id_map = {
                'starter': settings.POLAR_PRODUCT_STARTER,
                'professional': settings.POLAR_PRODUCT_PROFESSIONAL,
                'enterprise': settings.POLAR_PRODUCT_ENTERPRISE,
            }

            new_product_id = product_id_map.get(new_plan)
            if not new_product_id:
                return Response(
                    {'detail': f'Invalid plan: {new_plan}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update subscription via Polar
            updated_subscription = polar_service.update_subscription(
                subscription_id=subscription.stripe_subscription_id,
                product_id=new_product_id,
            )

            # Update local record
            subscription.plan = new_plan
            subscription.save()

            # Update tenant plan
            tenant.plan = new_plan
            tenant.save()

            return Response({
                'message': f'Successfully upgraded to {new_plan}',
                'subscription': SubscriptionSerializer(subscription).data
            }, status=status.HTTP_200_OK)

        except Subscription.DoesNotExist:
            return Response(
                {'detail': 'No active subscription. Please create a checkout session first.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error upgrading subscription: {str(e)}")
            return Response(
                {'detail': f'Failed to upgrade subscription: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='subscription/cancel')
    def cancel_subscription(self, request):
        """Cancel current subscription."""
        tenant = self._get_user_tenant(request.user)
        if not tenant:
            return Response(
                {'detail': 'User is not associated with any tenant.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user can manage billing
        tenant_user = TenantUser.objects.filter(
            user=request.user,
            tenant=tenant,
            is_active=True
        ).first()

        if not tenant_user or not tenant_user.can_manage_users:
            return Response(
                {'detail': 'You do not have permission to manage billing.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            subscription = Subscription.objects.get(tenant=tenant)

            # Cancel via Polar
            success = polar_service.cancel_subscription(
                subscription_id=subscription.stripe_subscription_id
            )

            if success:
                subscription.status = 'cancelled'
                subscription.save()

                return Response({
                    'message': 'Subscription canceled successfully',
                    'subscription': SubscriptionSerializer(subscription).data
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'detail': 'Failed to cancel subscription'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Subscription.DoesNotExist:
            return Response(
                {'detail': 'No active subscription found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error canceling subscription: {str(e)}")
            return Response(
                {'detail': f'Failed to cancel subscription: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="List Available Products",
        description="""
        Get a list of all available subscription products and their features.

        Returns product information including pricing, features, and limits for each plan.
        If Polar.sh is not configured, returns static default plan information.

        **Plans Available:**
        - **Free**: $0/month - 5 users, 1GB storage, basic modules
        - **Starter**: $49/month - 25 users, 10GB storage, all modules
        - **Professional**: $149/month - 100 users, 50GB storage, all modules + priority support
        - **Enterprise**: $499/month - 1000 users, 100GB storage, custom features

        **Use Case:** Display pricing page or plan selector UI
        """,
        tags=["Billing"],
        responses={
            200: {
                "description": "List of products with pricing and features",
                "content": {
                    "application/json": {
                        "example": {
                            "products": [
                                {
                                    "id": "starter",
                                    "name": "Starter",
                                    "price": 49,
                                    "currency": "USD",
                                    "interval": "month",
                                    "features": {
                                        "max_users": 25,
                                        "max_storage_gb": 10,
                                        "modules": ["all"],
                                        "support": "Email"
                                    }
                                }
                            ],
                            "note": "Polar.sh not configured. Showing default plans."
                        }
                    }
                }
            }
        }
    )
    @action(detail=False, methods=['get'])
    def products(self, request):
        """List available Polar products/plans."""
        try:
            # Check if Polar is configured
            if not settings.POLAR_ACCESS_TOKEN or settings.POLAR_ACCESS_TOKEN == 'polar_live_REPLACE_WITH_YOUR_TOKEN':
                # Return static plan information
                return Response({
                    'products': [
                        {
                            'id': 'free',
                            'name': 'Free',
                            'price': 0,
                            'currency': 'USD',
                            'interval': 'month',
                            'features': {
                                'max_users': 5,
                                'max_storage_gb': 1,
                                'modules': ['basic'],
                                'support': 'Community'
                            }
                        },
                        {
                            'id': 'starter',
                            'name': 'Starter',
                            'price': 49,
                            'currency': 'USD',
                            'interval': 'month',
                            'features': {
                                'max_users': 25,
                                'max_storage_gb': 10,
                                'modules': ['all'],
                                'support': 'Email'
                            }
                        },
                        {
                            'id': 'professional',
                            'name': 'Professional',
                            'price': 149,
                            'currency': 'USD',
                            'interval': 'month',
                            'features': {
                                'max_users': 100,
                                'max_storage_gb': 50,
                                'modules': ['all'],
                                'support': 'Priority'
                            }
                        },
                        {
                            'id': 'enterprise',
                            'name': 'Enterprise',
                            'price': 499,
                            'currency': 'USD',
                            'interval': 'month',
                            'features': {
                                'max_users': 1000,
                                'max_storage_gb': 100,
                                'modules': ['all'],
                                'support': 'Dedicated'
                            }
                        }
                    ],
                    'note': 'Polar.sh not configured. Showing default plans.'
                })

            # Fetch from Polar
            products = polar_service.list_products()

            return Response({
                'products': [
                    {
                        'id': product.id,
                        'name': product.name,
                        'description': product.description,
                    }
                    for product in products
                ]
            })

        except Exception as e:
            logger.error(f"Error listing products: {str(e)}")
            return Response(
                {'detail': f'Failed to list products: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema(
    summary="Polar.sh Webhook Receiver",
    description="""
    **Public endpoint for receiving Polar.sh webhook events.**

    This endpoint handles asynchronous updates from Polar when subscription events occur.
    Authentication is performed via webhook signature verification.

    **Supported Events:**
    - `checkout.created` - Checkout session initiated
    - `checkout.updated` - Checkout completed
    - `order.created` - Order confirmed
    - `subscription.created` - New subscription activated
    - `subscription.updated` - Subscription plan changed
    - `subscription.canceled` - Subscription canceled

    **Security:**
    - All webhooks must include valid `webhook-signature` header
    - Signature is verified using Polar webhook secret
    - Invalid signatures are rejected with 401

    **Note:** This endpoint should be registered in your Polar.sh dashboard.
    """,
    tags=["Billing", "Webhooks"],
    request={
        "application/json": {
            "type": "object",
            "description": "Polar webhook event payload",
            "example": {
                "type": "subscription.created",
                "data": {
                    "id": "sub_abc123",
                    "customer_id": "cus_abc123",
                    "status": "active",
                    "metadata": {
                        "tenant_id": "uuid-here"
                    }
                }
            }
        }
    },
    responses={
        200: {"description": "Webhook processed successfully"},
        400: {"description": "Missing signature"},
        401: {"description": "Invalid signature"},
        500: {"description": "Webhook processing failed"},
        503: {"description": "Webhook not configured"}
    }
)
@method_decorator(csrf_exempt, name='dispatch')
class PolarWebhookView(APIView):
    """
    **Polar.sh Webhook Receiver**

    Receives and processes webhook events from Polar.sh for subscription lifecycle management.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle Polar webhook events with signature verification."""
        try:
            # Get raw payload and signature
            payload = request.body
            signature = request.headers.get('webhook-signature')

            if not signature:
                logger.warning("Webhook received without signature")
                return HttpResponse("Missing signature", status=400)

            # Check if webhook secret is configured
            if not settings.POLAR_WEBHOOK_SECRET or settings.POLAR_WEBHOOK_SECRET.startswith('whsec_REPLACE'):
                logger.error("Polar webhook secret not configured")
                return HttpResponse("Webhook not configured", status=503)

            # Verify webhook signature
            try:
                event = polar_service.verify_webhook(payload, signature)
            except Exception as e:
                logger.error(f"Webhook verification failed: {str(e)}")
                return HttpResponse("Invalid signature", status=401)

            # Process webhook event
            success = polar_service.process_webhook_event(event)

            if success:
                return HttpResponse("Webhook processed", status=200)
            else:
                return HttpResponse("Webhook processing failed", status=500)

        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}")
            return HttpResponse(f"Error: {str(e)}", status=500)
