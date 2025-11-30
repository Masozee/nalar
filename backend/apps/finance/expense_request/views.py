"""
Views for Expense Request module.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from apps.common.cache import cache_api_response, invalidate_cache
from .models import ExpenseRequest, ExpenseItem, ExpenseAdvance, ExpenseStatus
from .serializers import (
    ExpenseRequestListSerializer,
    ExpenseRequestDetailSerializer,
    ExpenseRequestCreateSerializer,
    ExpenseRequestUpdateSerializer,
    ExpenseRequestApproveSerializer,
    ExpenseRequestRejectSerializer,
    ExpenseRequestProcessSerializer,
    ExpenseRequestPaySerializer,
    ExpenseItemSerializer,
    ExpenseAdvanceListSerializer,
    ExpenseAdvanceDetailSerializer,
    ExpenseAdvanceCreateSerializer,
    ExpenseAdvanceSettleSerializer,
)


class ExpenseRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for ExpenseRequest CRUD and workflow actions."""
    queryset = ExpenseRequest.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'requester', 'payment_method', 'expense_date']
    search_fields = ['request_number', 'title', 'description']
    ordering_fields = ['request_number', 'request_date', 'expense_date', 'total_amount', 'created_at']
    ordering = ['-created_at']

    @cache_api_response(timeout=180, key_prefix='expense_requests')
    def list(self, request, *args, **kwargs):
        """List expense requests with caching (3 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='expense_request_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve expense request detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create expense request and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('expense_requests:*')

    def perform_update(self, serializer):
        """Update expense request and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('expense_requests:*')
        invalidate_cache('expense_request_detail:*')

    def perform_destroy(self, instance):
        """Delete expense request and invalidate cache"""
        super().perform_destroy(instance)
        invalidate_cache('expense_requests:*')
        invalidate_cache('expense_request_detail:*')

    def get_serializer_class(self):
        if self.action == 'list':
            return ExpenseRequestListSerializer
        elif self.action == 'retrieve':
            return ExpenseRequestDetailSerializer
        elif self.action == 'create':
            return ExpenseRequestCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ExpenseRequestUpdateSerializer
        return ExpenseRequestDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by current user's requests (optional)
        my_requests = self.request.query_params.get('my_requests', None)
        if my_requests and my_requests.lower() == 'true':
            queryset = queryset.filter(requester=self.request.user)
        return queryset

    def create(self, request, *args, **kwargs):
        """Override to return detail serializer after create."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        # Invalidate cache after creation
        invalidate_cache('expense_requests:*')
        # Return with detail serializer
        detail_serializer = ExpenseRequestDetailSerializer(instance)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit expense request for approval."""
        expense = self.get_object()
        try:
            expense.submit()
            return Response({'status': 'submitted'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve expense request."""
        expense = self.get_object()
        serializer = ExpenseRequestApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            approved_amount = serializer.validated_data.get('approved_amount')
            expense.approve(request.user, approved_amount)

            finance_notes = serializer.validated_data.get('finance_notes')
            if finance_notes:
                expense.finance_notes = finance_notes
                expense.save(update_fields=['finance_notes'])

            return Response({'status': 'approved'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject expense request."""
        expense = self.get_object()
        serializer = ExpenseRequestRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            expense.reject(request.user, serializer.validated_data['reason'])
            return Response({'status': 'rejected'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        """Process expense for payment."""
        expense = self.get_object()
        serializer = ExpenseRequestProcessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payment_ref = serializer.validated_data.get('payment_reference', '')
            expense.process_payment(request.user, payment_ref)
            return Response({'status': 'processing'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark expense as paid."""
        expense = self.get_object()
        serializer = ExpenseRequestPaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payment_date = serializer.validated_data.get('payment_date')
            expense.mark_paid(payment_date)
            return Response({'status': 'paid'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel expense request."""
        expense = self.get_object()
        if expense.status in [ExpenseStatus.PAID, ExpenseStatus.PROCESSING]:
            return Response(
                {'error': 'Tidak dapat membatalkan expense yang sudah diproses'},
                status=status.HTTP_400_BAD_REQUEST
            )

        expense.status = ExpenseStatus.CANCELLED
        expense.save(update_fields=['status'])
        return Response({'status': 'cancelled'})

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get expenses pending approval."""
        expenses = self.get_queryset().filter(
            status__in=[ExpenseStatus.SUBMITTED, ExpenseStatus.PENDING_APPROVAL]
        )
        serializer = ExpenseRequestListSerializer(expenses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get expense summary statistics."""
        queryset = self.get_queryset()

        # Filter by date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(expense_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(expense_date__lte=end_date)

        total_requested = sum(e.total_amount for e in queryset)
        total_approved = sum(
            e.approved_amount for e in queryset.filter(status=ExpenseStatus.APPROVED)
        )
        total_paid = sum(
            e.approved_amount for e in queryset.filter(status=ExpenseStatus.PAID)
        )

        return Response({
            'total_requests': queryset.count(),
            'total_requested_amount': total_requested,
            'total_approved_amount': total_approved,
            'total_paid_amount': total_paid,
            'by_status': {
                'draft': queryset.filter(status=ExpenseStatus.DRAFT).count(),
                'submitted': queryset.filter(status=ExpenseStatus.SUBMITTED).count(),
                'approved': queryset.filter(status=ExpenseStatus.APPROVED).count(),
                'rejected': queryset.filter(status=ExpenseStatus.REJECTED).count(),
                'processing': queryset.filter(status=ExpenseStatus.PROCESSING).count(),
                'paid': queryset.filter(status=ExpenseStatus.PAID).count(),
            }
        })


class ExpenseItemViewSet(viewsets.ModelViewSet):
    """ViewSet for ExpenseItem CRUD."""
    queryset = ExpenseItem.objects.filter(is_active=True)
    serializer_class = ExpenseItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['expense_request', 'category']
    search_fields = ['description', 'receipt_number']

    def get_queryset(self):
        queryset = super().get_queryset()
        expense_request_id = self.request.query_params.get('expense_request_id')
        if expense_request_id:
            queryset = queryset.filter(expense_request_id=expense_request_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class ExpenseAdvanceViewSet(viewsets.ModelViewSet):
    """ViewSet for ExpenseAdvance CRUD and workflow."""
    queryset = ExpenseAdvance.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'requester']
    search_fields = ['advance_number', 'purpose']
    ordering_fields = ['advance_number', 'amount', 'created_at']
    ordering = ['-created_at']
    lookup_field = 'advance_number'
    lookup_value_regex = '[^/]+'  # Allow any characters except slash

    @cache_api_response(timeout=180, key_prefix='expense_advances')
    def list(self, request, *args, **kwargs):
        """List expense advances with caching (3 min)"""
        return super().list(request, *args, **kwargs)

    @cache_api_response(timeout=600, key_prefix='expense_advance_detail')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve expense advance detail with caching (10 min)"""
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Create expense advance and invalidate cache"""
        super().perform_create(serializer)
        invalidate_cache('expense_advances:*')

    def perform_update(self, serializer):
        """Update expense advance and invalidate cache"""
        super().perform_update(serializer)
        invalidate_cache('expense_advances:*')
        invalidate_cache('expense_advance_detail:*')

    def perform_destroy(self, instance):
        """Delete expense advance and invalidate cache"""
        super().perform_destroy(instance)
        invalidate_cache('expense_advances:*')
        invalidate_cache('expense_advance_detail:*')

    def get_serializer_class(self):
        if self.action == 'list':
            return ExpenseAdvanceListSerializer
        elif self.action == 'create':
            return ExpenseAdvanceCreateSerializer
        return ExpenseAdvanceDetailSerializer

    def create(self, request, *args, **kwargs):
        """Override to return detail serializer after create."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        # Invalidate cache after creation
        invalidate_cache('expense_advances:*')
        # Return with detail serializer
        detail_serializer = ExpenseAdvanceDetailSerializer(instance)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve expense advance."""
        advance = self.get_object()
        if advance.status != 'pending':
            return Response(
                {'error': 'Advance tidak dalam status pending'},
                status=status.HTTP_400_BAD_REQUEST
            )

        advance.status = 'approved'
        advance.approved_by = request.user
        advance.approved_at = timezone.now()
        advance.save(update_fields=['status', 'approved_by', 'approved_at'])
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject expense advance."""
        advance = self.get_object()
        if advance.status != 'pending':
            return Response(
                {'error': 'Advance tidak dalam status pending'},
                status=status.HTTP_400_BAD_REQUEST
            )

        advance.status = 'rejected'
        advance.approved_by = request.user
        advance.approved_at = timezone.now()
        advance.notes = request.data.get('reason', '')
        advance.save(update_fields=['status', 'approved_by', 'approved_at', 'notes'])
        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'])
    def disburse(self, request, pk=None):
        """Mark advance as disbursed."""
        advance = self.get_object()
        if advance.status != 'approved':
            return Response(
                {'error': 'Advance harus disetujui terlebih dahulu'},
                status=status.HTTP_400_BAD_REQUEST
            )

        advance.status = 'disbursed'
        advance.save(update_fields=['status'])
        return Response({'status': 'disbursed'})

    @action(detail=True, methods=['post'])
    def settle(self, request, pk=None):
        """Settle expense advance."""
        advance = self.get_object()
        if advance.status != 'disbursed':
            return Response(
                {'error': 'Advance harus sudah dicairkan'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ExpenseAdvanceSettleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        advance.settled_amount = serializer.validated_data['settled_amount']
        advance.settlement_date = serializer.validated_data.get(
            'settlement_date', timezone.now().date()
        )
        advance.status = 'settled'
        advance.save(update_fields=['settled_amount', 'settlement_date', 'status'])
        return Response({'status': 'settled', 'balance': advance.balance})
