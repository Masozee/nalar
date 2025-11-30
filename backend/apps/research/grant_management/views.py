"""
Views for Grant Management module.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from .models import Grant, GrantTeamMember, GrantMilestone, GrantDisbursement, GrantStatus
from .serializers import (
    GrantListSerializer, GrantDetailSerializer, GrantCreateSerializer,
    GrantTeamMemberSerializer, GrantMilestoneSerializer, GrantDisbursementSerializer,
)


class GrantViewSet(viewsets.ModelViewSet):
    """ViewSet for Grant CRUD and workflow."""
    queryset = Grant.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'grant_type', 'funding_source', 'principal_investigator']
    search_fields = ['grant_number', 'title', 'abstract']
    ordering_fields = ['grant_number', 'start_date', 'approved_amount', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return GrantListSerializer
        elif self.action == 'create':
            return GrantCreateSerializer
        return GrantDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(GrantDetailSerializer(instance).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit grant for review."""
        grant = self.get_object()
        if grant.status != GrantStatus.DRAFT:
            return Response({'error': 'Grant harus dalam status draft'}, status=status.HTTP_400_BAD_REQUEST)
        grant.status = GrantStatus.SUBMITTED
        grant.submission_date = timezone.now().date()
        grant.save(update_fields=['status', 'submission_date'])
        return Response({'status': 'submitted'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve grant."""
        grant = self.get_object()
        if grant.status not in [GrantStatus.SUBMITTED, GrantStatus.UNDER_REVIEW]:
            return Response({'error': 'Grant tidak dapat disetujui'}, status=status.HTTP_400_BAD_REQUEST)

        approved_amount = request.data.get('approved_amount', grant.requested_amount)
        grant.status = GrantStatus.APPROVED
        grant.approved_amount = approved_amount
        grant.reviewed_by = request.user
        grant.reviewed_at = timezone.now()
        grant.review_notes = request.data.get('notes', '')
        grant.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate grant (start research)."""
        grant = self.get_object()
        if grant.status != GrantStatus.APPROVED:
            return Response({'error': 'Grant harus disetujui terlebih dahulu'}, status=status.HTTP_400_BAD_REQUEST)
        grant.status = GrantStatus.ACTIVE
        if not grant.start_date:
            grant.start_date = timezone.now().date()
        grant.save(update_fields=['status', 'start_date'])
        return Response({'status': 'active'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark grant as completed."""
        grant = self.get_object()
        if grant.status != GrantStatus.ACTIVE:
            return Response({'error': 'Grant harus dalam status aktif'}, status=status.HTTP_400_BAD_REQUEST)
        grant.status = GrantStatus.COMPLETED
        grant.save(update_fields=['status'])
        return Response({'status': 'completed'})

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get grant summary statistics."""
        queryset = self.get_queryset()
        total_approved = sum(g.approved_amount for g in queryset.filter(status__in=[GrantStatus.APPROVED, GrantStatus.ACTIVE, GrantStatus.COMPLETED]))
        total_disbursed = sum(g.disbursed_amount for g in queryset)

        return Response({
            'total_grants': queryset.count(),
            'total_approved_amount': total_approved,
            'total_disbursed_amount': total_disbursed,
            'by_status': {
                'draft': queryset.filter(status=GrantStatus.DRAFT).count(),
                'submitted': queryset.filter(status=GrantStatus.SUBMITTED).count(),
                'approved': queryset.filter(status=GrantStatus.APPROVED).count(),
                'active': queryset.filter(status=GrantStatus.ACTIVE).count(),
                'completed': queryset.filter(status=GrantStatus.COMPLETED).count(),
            }
        })


class GrantTeamMemberViewSet(viewsets.ModelViewSet):
    queryset = GrantTeamMember.objects.filter(is_active=True)
    serializer_class = GrantTeamMemberSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['grant', 'user', 'role']


class GrantMilestoneViewSet(viewsets.ModelViewSet):
    queryset = GrantMilestone.objects.filter(is_active=True)
    serializer_class = GrantMilestoneSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['grant', 'status']
    ordering = ['due_date']

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark milestone as completed."""
        milestone = self.get_object()
        milestone.status = GrantMilestone.MilestoneStatus.COMPLETED
        milestone.completed_date = timezone.now().date()
        milestone.save(update_fields=['status', 'completed_date'])
        return Response({'status': 'completed'})


class GrantDisbursementViewSet(viewsets.ModelViewSet):
    queryset = GrantDisbursement.objects.filter(is_active=True)
    serializer_class = GrantDisbursementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['grant', 'status']
    ordering = ['-request_date']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve disbursement."""
        disbursement = self.get_object()
        if disbursement.status != GrantDisbursement.DisbursementStatus.REQUESTED:
            return Response({'error': 'Pencairan tidak dapat disetujui'}, status=status.HTTP_400_BAD_REQUEST)
        disbursement.status = GrantDisbursement.DisbursementStatus.APPROVED
        disbursement.approved_by = request.user
        disbursement.approved_at = timezone.now()
        disbursement.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def disburse(self, request, pk=None):
        """Mark as disbursed."""
        disbursement = self.get_object()
        if disbursement.status != GrantDisbursement.DisbursementStatus.APPROVED:
            return Response({'error': 'Pencairan harus disetujui'}, status=status.HTTP_400_BAD_REQUEST)
        disbursement.status = GrantDisbursement.DisbursementStatus.DISBURSED
        disbursement.disbursement_date = timezone.now().date()
        disbursement.save()
        return Response({'status': 'disbursed'})
