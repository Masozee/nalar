from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from apps.common.cache import cache_api_response, invalidate_cache
from .models import AssetAssignment, AssetTransfer, AssetCheckout, AssignmentStatus
from .serializers import (
    AssetAssignmentSerializer, AssetAssignmentListSerializer,
    AssetTransferSerializer,
    AssetCheckoutSerializer, AssetReturnSerializer,
)


class AssetAssignmentViewSet(viewsets.ModelViewSet):
    queryset = AssetAssignment.objects.select_related('asset', 'assigned_to', 'approved_by')
    serializer_class = AssetAssignmentSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['asset__asset_code', 'asset__name', 'assigned_to__email']
    filterset_fields = ['status', 'assignment_type', 'asset']
    ordering_fields = ['assigned_date', 'expected_return_date']

    @cache_api_response(timeout=300, key_prefix='asset_assignments')
    def list(self, request, *args, **kwargs):
        """List asset assignments with caching (5 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='asset_assignment_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve asset assignment detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create assignment and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('asset_assignments:*')

    def perform_update(self, serializer):
        """Update assignment and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('asset_assignments:*')
        invalidate_cache('asset_assignment_detail:*')

    def perform_destroy(self, instance):
        """Delete assignment and invalidate cache"""
        super().perform_destroy(instance)
        invalidate_cache('asset_assignments:*')
        invalidate_cache('asset_assignment_detail:*')

    def get_serializer_class(self):
        if self.action == 'list':
            return AssetAssignmentListSerializer
        return AssetAssignmentSerializer

    @action(detail=False, methods=['get'])
    def my_assets(self, request):
        """Get assets assigned to current user."""
        assignments = self.queryset.filter(
            assigned_to=request.user,
            status=AssignmentStatus.ACTIVE,
        )
        serializer = AssetAssignmentListSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue_returns(self, request):
        """Get assignments with overdue returns."""
        today = timezone.now().date()
        assignments = self.queryset.filter(
            status=AssignmentStatus.ACTIVE,
            expected_return_date__lt=today,
        )
        serializer = AssetAssignmentListSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def return_asset(self, request, pk=None):
        """Return an assigned asset."""
        assignment = self.get_object()
        serializer = AssetReturnSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if assignment.status != AssignmentStatus.ACTIVE:
            return Response(
                {'error': 'Only active assignments can be returned.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        assignment.status = AssignmentStatus.RETURNED
        assignment.actual_return_date = timezone.now().date()
        assignment.condition_at_return = serializer.validated_data.get('condition_on_return', '')
        assignment.returned_to = request.user
        if serializer.validated_data.get('notes'):
            assignment.notes = serializer.validated_data['notes']
        assignment.save()

        return Response(AssetAssignmentSerializer(assignment).data)


class AssetTransferViewSet(viewsets.ModelViewSet):
    queryset = AssetTransfer.objects.select_related('asset', 'from_user', 'to_user', 'approved_by')
    serializer_class = AssetTransferSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['asset__asset_code', 'from_user__email', 'to_user__email']
    filterset_fields = ['asset']
    ordering_fields = ['transfer_date']

    @cache_api_response(timeout=300, key_prefix='asset_transfers')
    def list(self, request, *args, **kwargs):
        """List asset transfers with caching (5 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='asset_transfer_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve asset transfer detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create transfer and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('asset_transfers:*')

    def perform_update(self, serializer):
        """Update transfer and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('asset_transfers:*')
        invalidate_cache('asset_transfer_detail:*')

    def perform_destroy(self, instance):
        """Delete transfer and invalidate cache"""
        super().perform_destroy(instance)
        invalidate_cache('asset_transfers:*')
        invalidate_cache('asset_transfer_detail:*')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a transfer."""
        transfer = self.get_object()
        if transfer.approved_by:
            return Response(
                {'error': 'Transfer already approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        transfer.approved_by = request.user
        transfer.approved_at = timezone.now()
        transfer.save()

        # Update asset's current holder
        transfer.asset.current_holder = transfer.to_user
        transfer.asset.save(update_fields=['current_holder'])

        # Update related assignments
        AssetAssignment.objects.filter(
            asset=transfer.asset,
            assigned_to=transfer.from_user,
            status=AssignmentStatus.ACTIVE,
        ).update(status=AssignmentStatus.TRANSFERRED)

        return Response(AssetTransferSerializer(transfer).data)


class AssetCheckoutViewSet(viewsets.ModelViewSet):
    queryset = AssetCheckout.objects.select_related('asset', 'checked_out_by', 'returned_to')
    serializer_class = AssetCheckoutSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['asset__asset_code', 'checked_out_by__email', 'purpose']
    filterset_fields = ['is_returned', 'asset']
    ordering_fields = ['checkout_time', 'expected_return_time']

    @cache_api_response(timeout=300, key_prefix='asset_checkouts')
    def list(self, request, *args, **kwargs):
        """List asset checkouts with caching (5 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='asset_checkout_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve asset checkout detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create checkout and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('asset_checkouts:*')

    def perform_update(self, serializer):
        """Update checkout and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('asset_checkouts:*')
        invalidate_cache('asset_checkout_detail:*')

    def perform_destroy(self, instance):
        """Delete checkout and invalidate cache"""
        super().perform_destroy(instance)
        invalidate_cache('asset_checkouts:*')
        invalidate_cache('asset_checkout_detail:*')

    @action(detail=False, methods=['get'])
    def my_checkouts(self, request):
        """Get current user's active checkouts."""
        checkouts = self.queryset.filter(
            checked_out_by=request.user,
            is_returned=False,
        )
        serializer = self.get_serializer(checkouts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active checkouts."""
        checkouts = self.queryset.filter(is_returned=False)
        serializer = self.get_serializer(checkouts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue checkouts."""
        now = timezone.now()
        checkouts = self.queryset.filter(
            is_returned=False,
            expected_return_time__lt=now,
        )
        serializer = self.get_serializer(checkouts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def return_item(self, request, pk=None):
        """Return a checked out asset."""
        checkout = self.get_object()
        serializer = AssetReturnSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if checkout.is_returned:
            return Response(
                {'error': 'Item already returned.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        checkout.is_returned = True
        checkout.actual_return_time = timezone.now()
        checkout.returned_to = request.user
        checkout.condition_on_return = serializer.validated_data.get('condition_on_return', '')
        if serializer.validated_data.get('notes'):
            checkout.notes = serializer.validated_data['notes']
        checkout.save()

        return Response(AssetCheckoutSerializer(checkout).data)
