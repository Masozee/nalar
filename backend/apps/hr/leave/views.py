from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LeavePolicy, LeaveBalance, LeaveRequest, LeaveStatus
from .serializers import (
    LeavePolicySerializer,
    LeaveBalanceSerializer,
    LeaveRequestSerializer,
    LeaveRequestCreateSerializer,
    LeaveApprovalSerializer,
)


class LeavePolicyViewSet(viewsets.ModelViewSet):
    queryset = LeavePolicy.objects.all()
    serializer_class = LeavePolicySerializer
    filterset_fields = ['year', 'leave_type']
    search_fields = ['name']


class LeaveBalanceViewSet(viewsets.ModelViewSet):
    queryset = LeaveBalance.objects.select_related('employee').all()
    serializer_class = LeaveBalanceSerializer
    filterset_fields = ['employee', 'year', 'leave_type']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']

    @action(detail=False, methods=['get'])
    def my_balance(self, request):
        """Get current user's leave balances."""
        employee = getattr(request.user, 'employee', None)
        if not employee:
            return Response(
                {'error': 'User is not linked to an employee'},
                status=status.HTTP_400_BAD_REQUEST
            )

        year = request.query_params.get('year', timezone.now().year)
        queryset = self.queryset.filter(employee=employee, year=year)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related(
        'employee', 'approved_by', 'delegate_to'
    ).all()
    serializer_class = LeaveRequestSerializer
    filterset_fields = ['employee', 'status', 'leave_type', 'start_date', 'end_date']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']

    def get_serializer_class(self):
        if self.action == 'create':
            return LeaveRequestCreateSerializer
        return LeaveRequestSerializer

    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get current user's leave requests."""
        employee = getattr(request.user, 'employee', None)
        if not employee:
            return Response(
                {'error': 'User is not linked to an employee'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.queryset.filter(employee=employee)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get leave requests pending approval (for managers)."""
        employee = getattr(request.user, 'employee', None)
        if not employee:
            return Response(
                {'error': 'User is not linked to an employee'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get subordinates' pending requests
        queryset = self.queryset.filter(
            employee__supervisor=employee,
            status=LeaveStatus.PENDING
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve or reject a leave request."""
        leave_request = self.get_object()
        serializer = LeaveApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        employee = getattr(request.user, 'employee', None)
        if not employee:
            return Response(
                {'error': 'User is not linked to an employee'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if leave_request.status != LeaveStatus.PENDING:
            return Response(
                {'error': 'Leave request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )

        action_type = serializer.validated_data['action']
        if action_type == 'approve':
            leave_request.status = LeaveStatus.APPROVED
            leave_request.approved_by = employee
            leave_request.approved_at = timezone.now()

            # Update leave balance
            balance, _ = LeaveBalance.objects.get_or_create(
                employee=leave_request.employee,
                leave_type=leave_request.leave_type,
                year=leave_request.start_date.year,
                defaults={'entitled_days': 0}
            )
            balance.used_days += leave_request.total_days
            balance.save()
        else:
            leave_request.status = LeaveStatus.REJECTED
            leave_request.approved_by = employee
            leave_request.approved_at = timezone.now()
            leave_request.rejection_reason = serializer.validated_data.get('rejection_reason', '')

        leave_request.save()
        return Response(LeaveRequestSerializer(leave_request).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a leave request."""
        leave_request = self.get_object()
        employee = getattr(request.user, 'employee', None)

        if leave_request.employee != employee:
            return Response(
                {'error': 'You can only cancel your own leave requests'},
                status=status.HTTP_403_FORBIDDEN
            )

        if leave_request.status not in [LeaveStatus.PENDING, LeaveStatus.APPROVED]:
            return Response(
                {'error': 'Cannot cancel this leave request'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # If was approved, restore balance
        if leave_request.status == LeaveStatus.APPROVED:
            try:
                balance = LeaveBalance.objects.get(
                    employee=leave_request.employee,
                    leave_type=leave_request.leave_type,
                    year=leave_request.start_date.year,
                )
                balance.used_days -= leave_request.total_days
                balance.save()
            except LeaveBalance.DoesNotExist:
                pass

        leave_request.status = LeaveStatus.CANCELLED
        leave_request.save()
        return Response(LeaveRequestSerializer(leave_request).data)
