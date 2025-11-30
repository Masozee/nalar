from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Policy, PolicyCategory, PolicyApproval, PolicyAcknowledgment
from .serializers import (
    PolicyListSerializer, PolicyDetailSerializer, PolicyCategorySerializer,
    PolicyApprovalSerializer, PolicyAcknowledgmentSerializer
)


class PolicyCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for policy categories"""
    queryset = PolicyCategory.objects.all().order_by('order', 'name')
    serializer_class = PolicyCategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Disable pagination for categories


class PolicyViewSet(viewsets.ModelViewSet):
    """ViewSet for policies"""
    queryset = Policy.objects.filter(is_active=True).prefetch_related('approvals', 'category')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PolicyDetailSerializer
        return PolicyListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)

        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)

        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge a policy"""
        policy = self.get_object()
        user = request.user
        ip_address = request.META.get('REMOTE_ADDR')

        acknowledgment, created = PolicyAcknowledgment.objects.get_or_create(
            policy=policy,
            user=user,
            defaults={'ip_address': ip_address}
        )

        serializer = PolicyAcknowledgmentSerializer(acknowledgment)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def approvals(self, request, pk=None):
        """Get policy approvals"""
        policy = self.get_object()
        approvals = policy.approvals.all()
        serializer = PolicyApprovalSerializer(approvals, many=True)
        return Response(serializer.data)


class PolicyApprovalViewSet(viewsets.ModelViewSet):
    """ViewSet for policy approvals"""
    queryset = PolicyApproval.objects.select_related('policy', 'approver').all()
    serializer_class = PolicyApprovalSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a policy"""
        approval = self.get_object()
        
        if approval.approver != request.user:
            return Response(
                {'error': 'You are not authorized to approve this policy'},
                status=status.HTTP_403_FORBIDDEN
            )

        approval.status = 'approved'
        approval.approved_at = timezone.now()
        approval.comments = request.data.get('comments', '')
        approval.save()

        # Check if all approvals are complete
        policy = approval.policy
        all_approved = all(
            appr.status == 'approved' 
            for appr in policy.approvals.all()
        )
        
        if all_approved:
            policy.status = 'approved'
            policy.save(update_fields=['status'])

        serializer = self.get_serializer(approval)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a policy"""
        approval = self.get_object()
        
        if approval.approver != request.user:
            return Response(
                {'error': 'You are not authorized to reject this policy'},
                status=status.HTTP_403_FORBIDDEN
            )

        approval.status = 'rejected'
        approval.comments = request.data.get('comments', '')
        approval.save()

        # Update policy status
        policy = approval.policy
        policy.status = 'rejected'
        policy.save(update_fields=['status'])

        serializer = self.get_serializer(approval)
        return Response(serializer.data)
