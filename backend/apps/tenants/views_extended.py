"""Extended views for tenant registration, invitations, and switching."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction

from .models import Tenant, TenantUser, TenantRole
from .serializers import TenantSerializer, TenantUserSerializer
from .serializers_extended import (
    TenantRegistrationSerializer,
    UserInvitationSerializer,
    AcceptInvitationSerializer,
    SwitchTenantSerializer,
)


class TenantRegistrationViewSet(viewsets.ViewSet):
    """
    ViewSet for tenant registration (organization sign-up).

    Endpoints:
    - POST /api/v1/tenants/register/ - Register new organization
    """

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def register(self, request):
        """
        Register a new organization/tenant.

        Creates tenant and makes current user the owner.
        """
        serializer = TenantRegistrationSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        tenant = serializer.save()

        return Response(
            {
                'tenant': TenantSerializer(tenant).data,
                'message': 'Organization registered successfully!',
            },
            status=status.HTTP_201_CREATED
        )


class InvitationViewSet(viewsets.ViewSet):
    """
    ViewSet for user invitations.

    Endpoints:
    - POST /api/v1/tenants/invitations/send/ - Send invitation
    - GET /api/v1/tenants/invitations/pending/ - List pending invitations
    - POST /api/v1/tenants/invitations/accept/ - Accept invitation
    - POST /api/v1/tenants/invitations/{id}/resend/ - Resend invitation
    - DELETE /api/v1/tenants/invitations/{id}/cancel/ - Cancel invitation
    """

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def send(self, request):
        """
        Send invitation to user to join tenant.

        Only admins/owners can send invitations.
        """
        user = request.user

        # Get user's tenant
        tenant_user = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).select_related('tenant').first()

        if not tenant_user:
            return Response(
                {'detail': 'You are not associated with any organization.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        if not tenant_user.can_manage_users:
            return Response(
                {'detail': 'You do not have permission to invite users.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = UserInvitationSerializer(
            data=request.data,
            context={
                'tenant': tenant_user.tenant,
                'requesting_user': user,
            }
        )
        serializer.is_valid(raise_exception=True)
        invited_tenant_user = serializer.save()

        return Response(
            {
                'invitation': TenantUserSerializer(invited_tenant_user).data,
                'message': 'Invitation sent successfully!',
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """List pending invitations for current tenant."""
        user = request.user

        # Get user's tenant
        tenant_user = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).first()

        if not tenant_user:
            return Response([])

        # Get pending invitations
        pending = TenantUser.objects.filter(
            tenant=tenant_user.tenant,
            is_active=False
        ).select_related('user', 'invited_by')

        serializer = TenantUserSerializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def accept(self, request):
        """
        Accept invitation to join organization.

        Public endpoint - no authentication required.
        """
        serializer = AcceptInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tenant_user = serializer.save()

        # Generate JWT token for newly activated user
        refresh = RefreshToken.for_user(tenant_user.user)

        return Response(
            {
                'message': 'Invitation accepted successfully!',
                'tenant': TenantSerializer(tenant_user.tenant).data,
                'user': TenantUserSerializer(tenant_user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def resend(self, request, pk=None):
        """Resend invitation email."""
        user = request.user

        # Get invitation
        try:
            invitation = TenantUser.objects.get(
                id=pk,
                is_active=False
            )
        except TenantUser.DoesNotExist:
            return Response(
                {'detail': 'Invitation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        tenant_user = TenantUser.objects.filter(
            tenant=invitation.tenant,
            user=user,
            is_active=True
        ).first()

        if not tenant_user or not tenant_user.can_manage_users:
            return Response(
                {'detail': 'You do not have permission to manage invitations.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # TODO: Resend invitation email
        # send_invitation_email(invitation)

        return Response(
            {'message': 'Invitation resent successfully!'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['delete'])
    def cancel(self, request, pk=None):
        """Cancel pending invitation."""
        user = request.user

        # Get invitation
        try:
            invitation = TenantUser.objects.get(
                id=pk,
                is_active=False
            )
        except TenantUser.DoesNotExist:
            return Response(
                {'detail': 'Invitation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        tenant_user = TenantUser.objects.filter(
            tenant=invitation.tenant,
            user=user,
            is_active=True
        ).first()

        if not tenant_user or not tenant_user.can_manage_users:
            return Response(
                {'detail': 'You do not have permission to manage invitations.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Delete invitation
        invitation.delete()

        return Response(
            {'message': 'Invitation canceled successfully!'},
            status=status.HTTP_204_NO_CONTENT
        )


class TenantSwitchingViewSet(viewsets.ViewSet):
    """
    ViewSet for tenant switching (for users with multiple tenants).

    Endpoints:
    - GET /api/v1/tenants/switch/available/ - List available tenants
    - POST /api/v1/tenants/switch/ - Switch to different tenant
    """

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def available(self, request):
        """
        List all tenants user has access to.

        Used for tenant switcher in UI.
        """
        user = request.user

        # Get all active tenant memberships
        tenant_users = TenantUser.objects.filter(
            user=user,
            is_active=True
        ).select_related('tenant').order_by('-is_owner', 'tenant__name')

        tenants = []
        for tu in tenant_users:
            tenant_data = TenantSerializer(tu.tenant).data
            tenant_data['role'] = tu.role
            tenant_data['role_display'] = tu.get_role_display()
            tenant_data['is_owner'] = tu.is_owner
            tenants.append(tenant_data)

        return Response(tenants)

    @action(detail=False, methods=['post'])
    def switch(self, request):
        """
        Switch to a different tenant.

        Returns new JWT token with updated tenant context.
        """
        serializer = SwitchTenantSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        tenant_user = serializer.context['tenant_user']

        # Generate new JWT token with tenant context
        refresh = RefreshToken.for_user(request.user)

        # Add tenant ID to token claims
        refresh['tenant_id'] = str(tenant_user.tenant_id)
        refresh['tenant_slug'] = tenant_user.tenant.slug
        refresh['tenant_role'] = tenant_user.role

        return Response(
            {
                'message': f'Switched to {tenant_user.tenant.name}',
                'tenant': TenantSerializer(tenant_user.tenant).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
            },
            status=status.HTTP_200_OK
        )
