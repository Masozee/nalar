"""
CRM Views with Access Control
Implements permission-based filtering for VIP/VVIP contacts
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Prefetch
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.cache import cache_api_response, invalidate_cache
from apps.core.pagination import DefaultPagePagination
from .models import (
    Organization, Contact, JobPosition,
    ContactNote, ContactActivity, AccessLevel
)
from .serializers import (
    OrganizationListSerializer, OrganizationDetailSerializer,
    ContactListSerializer, ContactDetailSerializer,
    ContactCreateUpdateSerializer, JobPositionSerializer,
    ContactNoteSerializer, ContactActivitySerializer,
)


class OrganizationViewSet(viewsets.ModelViewSet):
    """ViewSet for organizations"""
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['organization_type', 'access_level', 'country', 'city']
    search_fields = ['name', 'industry', 'description']
    ordering_fields = ['name', 'created_at', 'organization_type']
    ordering = ['name']

    @cache_api_response(timeout=600, key_prefix='crm_organizations')
    def list(self, request, *args, **kwargs):
        """List organizations with caching (10 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=1800, key_prefix='crm_organization_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve organization detail with caching (30 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create organization and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('crm_organizations:*')

    def perform_update(self, serializer):
        """Update organization and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('crm_organizations:*')
        invalidate_cache('crm_organization_detail:*')

    def perform_destroy(self, instance):
        """Soft delete organization and invalidate cache"""
        instance.is_active = False
        instance.save()
        invalidate_cache('crm_organizations:*')
        invalidate_cache('crm_organization_detail:*')

    def get_queryset(self):
        """Filter based on access level"""
        user = self.request.user
        queryset = Organization.objects.filter(is_active=True)

        # Apply access control
        if not user.is_staff and not user.is_superuser:
            # Non-staff can only see PUBLIC and INTERNAL
            queryset = queryset.filter(
                access_level__in=[AccessLevel.PUBLIC, AccessLevel.INTERNAL]
            )

        return queryset.annotate(
            contact_count=Count('positions', filter=Q(positions__is_current=True))
        )

    def get_serializer_class(self):
        if self.action in ['list']:
            return OrganizationListSerializer
        return OrganizationDetailSerializer

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get organization count by type"""
        counts = self.get_queryset().values('organization_type').annotate(
            count=Count('id')
        ).order_by('-count')
        return Response(list(counts))


class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for contacts with VIP/VVIP access control

    Access levels:
    - PUBLIC: Everyone can see
    - INTERNAL: All authenticated users
    - RESTRICTED: Only assigned_to user and staff
    - VIP: Only staff and assigned users
    - VVIP: Only superusers and explicitly assigned users
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['access_level', 'contact_type', 'is_active', 'assigned_to', 'positions__organization']
    search_fields = [
        'first_name', 'last_name', 'email_primary',
        'positions__title', 'positions__organization__name'
    ]
    ordering_fields = ['last_name', 'first_name', 'created_at', 'last_contacted_at']
    ordering = ['last_name', 'first_name']
    pagination_class = DefaultPagePagination

    @cache_api_response(timeout=300, key_prefix='crm_contacts')
    def list(self, request, *args, **kwargs):
        """List contacts with caching (5 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='crm_contact_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve contact detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create contact and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('crm_contacts:*')

    def perform_update(self, serializer):
        """Update contact and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('crm_contacts:*')
        invalidate_cache('crm_contact_detail:*')

    def perform_destroy(self, instance):
        """Soft delete contact and invalidate cache"""
        instance.is_active = False
        instance.save()
        invalidate_cache('crm_contacts:*')
        invalidate_cache('crm_contact_detail:*')

    def get_queryset(self):
        """
        Filter contacts based on access level

        Access control logic:
        - Superusers: See all contacts
        - Staff: See all except VVIP (unless assigned)
        - Regular users: See PUBLIC, INTERNAL only (unless assigned)
        """
        user = self.request.user
        queryset = Contact.objects.filter(is_active=True).select_related(
            'assigned_to'
        ).prefetch_related(
            Prefetch(
                'positions',
                queryset=JobPosition.objects.filter(
                    is_current=True
                ).select_related('organization')
            )
        )

        # Superusers see everything
        if user.is_superuser:
            return queryset

        # Build access filter
        access_filters = Q(access_level=AccessLevel.PUBLIC)

        if user.is_staff:
            # Staff can see PUBLIC, INTERNAL, RESTRICTED, VIP
            access_filters |= Q(access_level__in=[
                AccessLevel.INTERNAL,
                AccessLevel.RESTRICTED,
                AccessLevel.VIP,
            ])
            # Staff can also see VVIP if assigned to them
            access_filters |= Q(
                access_level=AccessLevel.VVIP,
                assigned_to=user
            )
        else:
            # Regular users can see PUBLIC and INTERNAL
            access_filters |= Q(access_level=AccessLevel.INTERNAL)

        # Everyone can see contacts assigned to them regardless of access level
        access_filters |= Q(assigned_to=user)

        return queryset.filter(access_filters).distinct()

    def get_serializer_class(self):
        if self.action == 'list':
            return ContactListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ContactCreateUpdateSerializer
        return ContactDetailSerializer

    @action(detail=False, methods=['get'])
    def my_contacts(self, request):
        """Get contacts assigned to current user"""
        contacts = self.get_queryset().filter(assigned_to=request.user)
        serializer = ContactListSerializer(contacts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def vip_contacts(self, request):
        """Get VIP and VVIP contacts (staff only)"""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'Permission denied. Staff access required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        contacts = self.get_queryset().filter(
            access_level__in=[AccessLevel.VIP, AccessLevel.VVIP]
        )
        serializer = ContactListSerializer(contacts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_access_level(self, request):
        """Get contact counts by access level"""
        counts = self.get_queryset().values('access_level').annotate(
            count=Count('id')
        ).order_by('-count')
        return Response(list(counts))

    @action(detail=True, methods=['post'])
    def update_last_contacted(self, request, pk=None):
        """Update last contacted timestamp"""
        contact = self.get_object()
        contact.last_contacted_at = timezone.now()
        contact.save(update_fields=['last_contacted_at'])
        invalidate_cache('crm_contacts:*')
        invalidate_cache('crm_contact_detail:*')
        return Response({'detail': 'Last contacted time updated'})


class JobPositionViewSet(viewsets.ModelViewSet):
    """ViewSet for job positions"""
    serializer_class = JobPositionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['contact', 'organization', 'is_current', 'is_primary']
    search_fields = ['title', 'department', 'organization__name']
    ordering_fields = ['start_date', 'title']
    ordering = ['-is_current', '-is_primary', '-start_date']

    @cache_api_response(timeout=600, key_prefix='crm_positions')
    def list(self, request, *args, **kwargs):
        """List positions with caching (10 min)"""
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create position and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('crm_positions:*')
        invalidate_cache('crm_contacts:*')
        invalidate_cache('crm_contact_detail:*')

    def perform_update(self, serializer):
        """Update position and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('crm_positions:*')
        invalidate_cache('crm_contacts:*')
        invalidate_cache('crm_contact_detail:*')

    def perform_destroy(self, instance):
        """Delete position and invalidate cache"""
        super().perform_destroy(instance)
        invalidate_cache('crm_positions:*')
        invalidate_cache('crm_contacts:*')
        invalidate_cache('crm_contact_detail:*')

    def get_queryset(self):
        """Apply same access control as contacts"""
        user = self.request.user
        queryset = JobPosition.objects.filter(
            is_active=True
        ).select_related('contact', 'organization')

        # Apply contact access control
        contact_filter = self._get_contact_access_filter(user)
        return queryset.filter(contact_filter)

    def _get_contact_access_filter(self, user):
        """Reuse contact access logic"""
        if user.is_superuser:
            return Q()

        access_filters = Q(contact__access_level=AccessLevel.PUBLIC)

        if user.is_staff:
            access_filters |= Q(contact__access_level__in=[
                AccessLevel.INTERNAL,
                AccessLevel.RESTRICTED,
                AccessLevel.VIP,
            ])
            access_filters |= Q(
                contact__access_level=AccessLevel.VVIP,
                contact__assigned_to=user
            )
        else:
            access_filters |= Q(contact__access_level=AccessLevel.INTERNAL)

        access_filters |= Q(contact__assigned_to=user)
        return access_filters


class ContactNoteViewSet(viewsets.ModelViewSet):
    """ViewSet for contact notes"""
    serializer_class = ContactNoteSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['contact', 'author', 'is_private']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter notes based on contact access and privacy"""
        user = self.request.user
        queryset = ContactNote.objects.filter(is_active=True).select_related(
            'contact', 'author'
        )

        # Apply contact access control (same as ContactViewSet)
        contact_filter = self._get_contact_access_filter(user)
        queryset = queryset.filter(contact_filter)

        # Filter private notes - only author and admins can see
        if not user.is_superuser:
            queryset = queryset.filter(
                Q(is_private=False) | Q(author=user)
            )

        return queryset

    def _get_contact_access_filter(self, user):
        """Reuse contact access logic"""
        if user.is_superuser:
            return Q()

        access_filters = Q(contact__access_level=AccessLevel.PUBLIC)

        if user.is_staff:
            access_filters |= Q(contact__access_level__in=[
                AccessLevel.INTERNAL,
                AccessLevel.RESTRICTED,
                AccessLevel.VIP,
            ])
            access_filters |= Q(
                contact__access_level=AccessLevel.VVIP,
                contact__assigned_to=user
            )
        else:
            access_filters |= Q(contact__access_level=AccessLevel.INTERNAL)

        access_filters |= Q(contact__assigned_to=user)
        return access_filters


class ContactActivityViewSet(viewsets.ModelViewSet):
    """ViewSet for contact activities"""
    serializer_class = ContactActivitySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'contact', 'activity_type', 'requires_followup',
        'followup_completed', 'organized_by'
    ]
    search_fields = ['title', 'description', 'outcome']
    ordering_fields = ['activity_date', 'created_at']
    ordering = ['-activity_date']

    def get_queryset(self):
        """Apply contact access control"""
        user = self.request.user
        queryset = ContactActivity.objects.filter(
            is_active=True
        ).select_related('contact', 'organized_by').prefetch_related('participants')

        # Apply contact access control
        contact_filter = self._get_contact_access_filter(user)
        return queryset.filter(contact_filter)

    def _get_contact_access_filter(self, user):
        """Reuse contact access logic"""
        if user.is_superuser:
            return Q()

        access_filters = Q(contact__access_level=AccessLevel.PUBLIC)

        if user.is_staff:
            access_filters |= Q(contact__access_level__in=[
                AccessLevel.INTERNAL,
                AccessLevel.RESTRICTED,
                AccessLevel.VIP,
            ])
            access_filters |= Q(
                contact__access_level=AccessLevel.VVIP,
                contact__assigned_to=user
            )
        else:
            access_filters |= Q(contact__access_level=AccessLevel.INTERNAL)

        access_filters |= Q(contact__assigned_to=user)
        return access_filters

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming activities requiring follow-up"""
        activities = self.get_queryset().filter(
            requires_followup=True,
            followup_completed=False,
            followup_date__gte=timezone.now().date()
        ).order_by('followup_date')
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue follow-ups"""
        activities = self.get_queryset().filter(
            requires_followup=True,
            followup_completed=False,
            followup_date__lt=timezone.now().date()
        ).order_by('followup_date')
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)
