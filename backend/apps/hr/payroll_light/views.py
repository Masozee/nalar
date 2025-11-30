from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SalaryComponent, PayrollPeriod, Payslip, PayslipItem, PayrollStatus
from .serializers import (
    SalaryComponentSerializer,
    PayrollPeriodSerializer,
    PayslipSerializer,
    PayslipSummarySerializer,
)


class SalaryComponentViewSet(viewsets.ModelViewSet):
    queryset = SalaryComponent.objects.select_related('employee').all()
    serializer_class = SalaryComponentSerializer
    filterset_fields = ['employee', 'component_type', 'is_fixed']
    search_fields = ['employee__first_name', 'employee__last_name', 'component_name']


class PayrollPeriodViewSet(viewsets.ModelViewSet):
    queryset = PayrollPeriod.objects.all()
    serializer_class = PayrollPeriodSerializer
    filterset_fields = ['year', 'month', 'status']
    search_fields = ['year', 'month']

    @action(detail=True, methods=['post'])
    def generate_payslips(self, request, pk=None):
        """Generate payslips for all active employees in this period."""
        from apps.hr.models import Employee
        from apps.core.enums import EmploymentStatus

        period = self.get_object()
        if period.status != PayrollStatus.DRAFT:
            return Response(
                {'error': 'Can only generate payslips for draft periods'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all active employees
        employees = Employee.objects.filter(
            employment_status=EmploymentStatus.ACTIVE
        ).select_related('user')

        created_count = 0
        for employee in employees:
            payslip, created = Payslip.objects.get_or_create(
                payroll_period=period,
                employee=employee,
                defaults={
                    'basic_salary': 0,  # Should be set from salary component or manual
                    'status': PayrollStatus.DRAFT,
                }
            )
            if created:
                created_count += 1

                # Add fixed salary components as payslip items
                components = SalaryComponent.objects.filter(
                    employee=employee,
                    is_fixed=True,
                    effective_date__lte=period.end_date,
                ).filter(
                    models.Q(end_date__isnull=True) | models.Q(end_date__gte=period.start_date)
                )

                for component in components:
                    PayslipItem.objects.create(
                        payslip=payslip,
                        item_type='allowance' if 'allowance' in component.component_type.lower() or 'tunjangan' in component.component_name.lower() else 'deduction',
                        name=component.component_name,
                        amount=component.amount,
                    )

        period.total_employees = Payslip.objects.filter(payroll_period=period).count()
        period.save()

        return Response({
            'message': f'Generated {created_count} payslips',
            'total_payslips': period.total_employees,
        })

    @action(detail=True, methods=['post'])
    def calculate_all(self, request, pk=None):
        """Calculate all payslips in this period."""
        period = self.get_object()
        payslips = Payslip.objects.filter(payroll_period=period)

        total_gross = 0
        total_deductions = 0
        total_net = 0

        for payslip in payslips:
            # Sum allowances and deductions from items
            allowances = PayslipItem.objects.filter(
                payslip=payslip, item_type='allowance'
            ).aggregate(total=models.Sum('amount'))['total'] or 0

            deductions = PayslipItem.objects.filter(
                payslip=payslip, item_type='deduction'
            ).aggregate(total=models.Sum('amount'))['total'] or 0

            payslip.total_allowances = allowances
            payslip.total_deductions = deductions
            payslip.calculate()
            payslip.status = PayrollStatus.CALCULATED
            payslip.save()

            total_gross += payslip.gross_salary
            total_deductions += payslip.total_deductions
            total_net += payslip.net_salary

        period.total_gross = total_gross
        period.total_deductions = total_deductions
        period.total_net = total_net
        period.status = PayrollStatus.CALCULATED
        period.save()

        return Response(PayrollPeriodSerializer(period).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve the payroll period."""
        period = self.get_object()
        if period.status != PayrollStatus.CALCULATED:
            return Response(
                {'error': 'Can only approve calculated payroll periods'},
                status=status.HTTP_400_BAD_REQUEST
            )

        period.status = PayrollStatus.APPROVED
        period.save()

        Payslip.objects.filter(payroll_period=period).update(status=PayrollStatus.APPROVED)

        return Response(PayrollPeriodSerializer(period).data)


class PayslipViewSet(viewsets.ModelViewSet):
    queryset = Payslip.objects.select_related(
        'payroll_period', 'employee'
    ).prefetch_related('items').all()
    serializer_class = PayslipSerializer
    filterset_fields = ['payroll_period', 'employee', 'status']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']

    def get_serializer_class(self):
        if self.action == 'list':
            return PayslipSummarySerializer
        return PayslipSerializer

    @action(detail=False, methods=['get'])
    def my_payslips(self, request):
        """Get current user's payslips."""
        employee = getattr(request.user, 'employee', None)
        if not employee:
            return Response(
                {'error': 'User is not linked to an employee'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.queryset.filter(employee=employee)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PayslipSummarySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PayslipSummarySerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Add an item (allowance/deduction) to a payslip."""
        payslip = self.get_object()
        if payslip.status not in [PayrollStatus.DRAFT, PayrollStatus.CALCULATED]:
            return Response(
                {'error': 'Cannot modify approved or paid payslips'},
                status=status.HTTP_400_BAD_REQUEST
            )

        item_type = request.data.get('item_type')
        name = request.data.get('name')
        amount = request.data.get('amount')

        if not all([item_type, name, amount]):
            return Response(
                {'error': 'item_type, name, and amount are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        PayslipItem.objects.create(
            payslip=payslip,
            item_type=item_type,
            name=name,
            amount=amount,
            description=request.data.get('description', ''),
        )

        return Response(PayslipSerializer(payslip).data)


# Need to import models at the top for aggregate
from django.db import models
