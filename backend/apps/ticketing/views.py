from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Category, SLAPolicy, Ticket, TicketComment, TicketAttachment,
    TicketStatus,
)
from .serializers import (
    CategorySerializer,
    SLAPolicySerializer,
    TicketSerializer,
    TicketListSerializer,
    TicketCreateSerializer,
    TicketCommentSerializer,
    TicketAttachmentSerializer,
    TicketAssignSerializer,
    TicketStatusUpdateSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.select_related('parent').all()
    serializer_class = CategorySerializer
    filterset_fields = ['parent', 'is_active']
    search_fields = ['name', 'code']

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get category hierarchy as tree."""
        root_categories = Category.objects.filter(
            parent__isnull=True,
            is_active=True,
        )

        def build_tree(category):
            return {
                'id': str(category.id),
                'name': category.name,
                'code': category.code,
                'children': [build_tree(c) for c in category.children.filter(is_active=True)]
            }

        return Response([build_tree(c) for c in root_categories])


class SLAPolicyViewSet(viewsets.ModelViewSet):
    queryset = SLAPolicy.objects.all()
    serializer_class = SLAPolicySerializer
    filterset_fields = ['priority', 'is_active']
    search_fields = ['name']


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.select_related(
        'requester', 'assignee', 'category', 'sla_policy'
    ).prefetch_related('comments', 'attachments').all()
    serializer_class = TicketSerializer
    filterset_fields = ['status', 'priority', 'ticket_type', 'category', 'requester', 'assignee']
    search_fields = ['ticket_number', 'title', 'description']

    def get_serializer_class(self):
        if self.action == 'list':
            return TicketListSerializer
        if self.action == 'create':
            return TicketCreateSerializer
        return TicketSerializer

    @action(detail=False, methods=['get'])
    def my_tickets(self, request):
        """Get tickets requested by current user."""
        queryset = self.queryset.filter(requester=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TicketListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = TicketListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def assigned_to_me(self, request):
        """Get tickets assigned to current user."""
        queryset = self.queryset.filter(
            assignee=request.user,
            status__in=[TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_USER]
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TicketListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = TicketListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unassigned(self, request):
        """Get unassigned tickets."""
        queryset = self.queryset.filter(
            assignee__isnull=True,
            status=TicketStatus.OPEN,
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TicketListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = TicketListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def breached(self, request):
        """Get tickets with SLA breach."""
        queryset = self.queryset.filter(
            models.Q(response_breached=True) | models.Q(resolution_breached=True)
        ).exclude(status__in=[TicketStatus.CLOSED, TicketStatus.CANCELLED])
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TicketListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = TicketListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign ticket to a user."""
        ticket = self.get_object()
        serializer = TicketAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from apps.users.models import User
        try:
            assignee = User.objects.get(id=serializer.validated_data['assignee_id'])
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        ticket.assignee = assignee
        if ticket.status == TicketStatus.OPEN:
            ticket.status = TicketStatus.IN_PROGRESS
        ticket.save()

        # Add comment about assignment
        TicketComment.objects.create(
            ticket=ticket,
            author=request.user,
            content=f'Ticket assigned to {assignee.email}',
            comment_type='status_change',
        )

        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['post'])
    def take(self, request, pk=None):
        """Take/self-assign a ticket."""
        ticket = self.get_object()

        if ticket.assignee:
            return Response(
                {'error': 'Ticket is already assigned'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.assignee = request.user
        ticket.status = TicketStatus.IN_PROGRESS
        ticket.save()

        TicketComment.objects.create(
            ticket=ticket,
            author=request.user,
            content=f'Ticket taken by {request.user.email}',
            comment_type='status_change',
        )

        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update ticket status."""
        ticket = self.get_object()
        serializer = TicketStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        comment = serializer.validated_data.get('comment', '')

        old_status = ticket.status
        ticket.status = new_status

        # Update timestamps based on status
        now = timezone.now()
        if new_status == TicketStatus.RESOLVED and not ticket.resolved_at:
            ticket.resolved_at = now
        elif new_status == TicketStatus.CLOSED and not ticket.closed_at:
            ticket.closed_at = now

        ticket.save()

        # Add status change comment
        TicketComment.objects.create(
            ticket=ticket,
            author=request.user,
            content=comment or f'Status changed from {old_status} to {new_status}',
            comment_type='status_change',
        )

        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to the ticket."""
        ticket = self.get_object()
        content = request.data.get('content')
        comment_type = request.data.get('comment_type', 'reply')

        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        comment = TicketComment.objects.create(
            ticket=ticket,
            author=request.user,
            content=content,
            comment_type=comment_type,
        )

        return Response(TicketCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics."""
        from django.db.models import Count, Q

        total = Ticket.objects.count()
        open_tickets = Ticket.objects.filter(status=TicketStatus.OPEN).count()
        in_progress = Ticket.objects.filter(status=TicketStatus.IN_PROGRESS).count()
        resolved = Ticket.objects.filter(status=TicketStatus.RESOLVED).count()
        breached = Ticket.objects.filter(
            Q(response_breached=True) | Q(resolution_breached=True)
        ).exclude(status__in=[TicketStatus.CLOSED, TicketStatus.CANCELLED]).count()

        by_priority = Ticket.objects.exclude(
            status__in=[TicketStatus.CLOSED, TicketStatus.CANCELLED]
        ).values('priority').annotate(count=Count('id'))

        by_category = Ticket.objects.exclude(
            status__in=[TicketStatus.CLOSED, TicketStatus.CANCELLED]
        ).values('category__name').annotate(count=Count('id'))

        return Response({
            'total': total,
            'open': open_tickets,
            'in_progress': in_progress,
            'resolved': resolved,
            'breached': breached,
            'by_priority': list(by_priority),
            'by_category': list(by_category),
        })


class TicketCommentViewSet(viewsets.ModelViewSet):
    queryset = TicketComment.objects.select_related('ticket', 'author').all()
    serializer_class = TicketCommentSerializer
    filterset_fields = ['ticket', 'author', 'comment_type']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class TicketAttachmentViewSet(viewsets.ModelViewSet):
    queryset = TicketAttachment.objects.select_related('ticket', 'uploaded_by').all()
    serializer_class = TicketAttachmentSerializer
    filterset_fields = ['ticket']

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


# Import for Q
from django.db import models
