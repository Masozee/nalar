from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    WorkflowTemplate,
    WorkflowStep,
    ApprovalRequest,
    ApprovalAction,
    ApprovalDelegate,
    ApprovalStatus,
)
from .serializers import (
    WorkflowTemplateSerializer,
    WorkflowTemplateListSerializer,
    WorkflowStepSerializer,
    ApprovalRequestSerializer,
    ApprovalRequestListSerializer,
    ApprovalActionSerializer,
    ApprovalActionCreateSerializer,
    ApprovalDelegateSerializer,
)


class WorkflowTemplateViewSet(viewsets.ModelViewSet):
    queryset = WorkflowTemplate.objects.prefetch_related('steps').all()
    serializer_class = WorkflowTemplateSerializer
    filterset_fields = ['content_type', 'is_active']
    search_fields = ['name', 'code']

    def get_serializer_class(self):
        if self.action == 'list':
            return WorkflowTemplateListSerializer
        return WorkflowTemplateSerializer

    @action(detail=True, methods=['post'])
    def add_step(self, request, pk=None):
        """Add a step to the workflow."""
        workflow = self.get_object()
        serializer = WorkflowStepSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Auto-calculate step_order if not provided
        if 'step_order' not in request.data:
            max_order = workflow.steps.aggregate(
                max_order=models.Max('step_order')
            )['max_order'] or 0
            serializer.validated_data['step_order'] = max_order + 1

        serializer.save(workflow=workflow)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WorkflowStepViewSet(viewsets.ModelViewSet):
    queryset = WorkflowStep.objects.select_related('workflow').all()
    serializer_class = WorkflowStepSerializer
    filterset_fields = ['workflow', 'approver_type']
    search_fields = ['name']


class ApprovalRequestViewSet(viewsets.ModelViewSet):
    queryset = ApprovalRequest.objects.select_related(
        'workflow', 'requester'
    ).prefetch_related('actions').all()
    serializer_class = ApprovalRequestSerializer
    filterset_fields = ['workflow', 'status', 'requester']
    search_fields = ['title', 'requester__email']

    def get_serializer_class(self):
        if self.action == 'list':
            return ApprovalRequestListSerializer
        return ApprovalRequestSerializer

    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get current user's approval requests."""
        queryset = self.queryset.filter(requester=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ApprovalRequestListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ApprovalRequestListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_my_approval(self, request):
        """Get requests pending current user's approval."""
        # This is a simplified version - in production, you'd need to check
        # the approver_type and determine if user can approve based on their role
        user = request.user

        # Get requests where current user is the direct approver
        direct_approvals = self.queryset.filter(
            status=ApprovalStatus.PENDING,
            workflow__steps__approver_user=user,
            current_step=models.F('workflow__steps__step_order'),
        ).distinct()

        # Also check delegations
        active_delegations = ApprovalDelegate.objects.filter(
            delegate=user,
            start_date__lte=timezone.now().date(),
            end_date__gte=timezone.now().date(),
        ).values_list('delegator_id', flat=True)

        delegated_approvals = self.queryset.filter(
            status=ApprovalStatus.PENDING,
            workflow__steps__approver_user__in=active_delegations,
        ).distinct()

        combined = (direct_approvals | delegated_approvals).distinct()

        page = self.paginate_queryset(combined)
        if page is not None:
            serializer = ApprovalRequestListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ApprovalRequestListSerializer(combined, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def take_action(self, request, pk=None):
        """Take an approval action on a request."""
        approval_request = self.get_object()
        serializer = ApprovalActionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if approval_request.status != ApprovalStatus.PENDING:
            return Response(
                {'error': 'Request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_step = approval_request.get_current_step_instance()
        if not current_step:
            return Response(
                {'error': 'No current step found'},
                status=status.HTTP_400_BAD_REQUEST
            )

        action_type = serializer.validated_data['action']
        comment = serializer.validated_data.get('comment', '')

        if current_step.requires_comment and not comment:
            return Response(
                {'error': 'Comment is required for this step'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Record the action
        ApprovalAction.objects.create(
            approval_request=approval_request,
            step=current_step,
            action=action_type,
            actor=request.user,
            comment=comment,
        )

        # Update request status based on action
        if action_type == 'approve':
            next_step = approval_request.advance_to_next_step()
            if not next_step:
                # Workflow completed
                message = 'Request approved and workflow completed'
            else:
                message = f'Approved. Moved to step: {next_step.name}'
        elif action_type == 'reject':
            approval_request.status = ApprovalStatus.REJECTED
            approval_request.completed_at = timezone.now()
            approval_request.save()
            message = 'Request rejected'
        elif action_type == 'revision':
            approval_request.status = ApprovalStatus.REVISION
            approval_request.save()
            message = 'Revision requested'

        return Response({
            'message': message,
            'status': approval_request.status,
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an approval request."""
        approval_request = self.get_object()

        if approval_request.requester != request.user:
            return Response(
                {'error': 'Only the requester can cancel'},
                status=status.HTTP_403_FORBIDDEN
            )

        if approval_request.status not in [ApprovalStatus.PENDING, ApprovalStatus.REVISION]:
            return Response(
                {'error': 'Cannot cancel this request'},
                status=status.HTTP_400_BAD_REQUEST
            )

        approval_request.status = ApprovalStatus.CANCELLED
        approval_request.completed_at = timezone.now()
        approval_request.save()

        ApprovalAction.objects.create(
            approval_request=approval_request,
            step=approval_request.get_current_step_instance(),
            action='cancel',
            actor=request.user,
            comment=request.data.get('comment', 'Cancelled by requester'),
        )

        return Response({'message': 'Request cancelled'})


class ApprovalDelegateViewSet(viewsets.ModelViewSet):
    queryset = ApprovalDelegate.objects.select_related(
        'delegator', 'delegate', 'workflow'
    ).all()
    serializer_class = ApprovalDelegateSerializer
    filterset_fields = ['delegator', 'delegate', 'workflow']
    search_fields = ['delegator__email', 'delegate__email']

    @action(detail=False, methods=['get'])
    def my_delegations(self, request):
        """Get delegations where current user is delegator."""
        queryset = self.queryset.filter(delegator=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def delegated_to_me(self, request):
        """Get active delegations where current user is delegate."""
        today = timezone.now().date()
        queryset = self.queryset.filter(
            delegate=request.user,
            start_date__lte=today,
            end_date__gte=today,
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# Import for F expression
from django.db import models
