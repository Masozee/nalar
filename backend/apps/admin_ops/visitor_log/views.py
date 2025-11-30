from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count
from datetime import timedelta
from .models import Visitor, VisitLog, VisitorBadge, VisitStatus
from .serializers import (
    VisitorSerializer,
    VisitLogSerializer,
    VisitLogListSerializer,
    VisitorBadgeSerializer,
    PreRegisterSerializer,
    CheckInSerializer,
    CheckOutSerializer,
    WalkInSerializer,
)


class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'company', 'phone', 'email', 'id_number']
    filterset_fields = ['is_blacklisted', 'is_active']
    ordering_fields = ['name', 'company', 'created_at']

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search visitors by name, phone, or company."""
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])

        visitors = self.queryset.filter(
            models.Q(name__icontains=query) |
            models.Q(phone__icontains=query) |
            models.Q(company__icontains=query)
        )[:10]
        serializer = self.get_serializer(visitors, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def blacklist(self, request, pk=None):
        """Blacklist or unblacklist a visitor."""
        visitor = self.get_object()
        is_blacklisted = request.data.get('is_blacklisted', True)
        reason = request.data.get('reason', '')

        visitor.is_blacklisted = is_blacklisted
        visitor.blacklist_reason = reason if is_blacklisted else ''
        visitor.save()

        return Response(self.get_serializer(visitor).data)

    @action(detail=True, methods=['get'])
    def visit_history(self, request, pk=None):
        """Get visit history for a visitor."""
        visitor = self.get_object()
        visits = visitor.visits.all()[:20]
        serializer = VisitLogListSerializer(visits, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def frequent(self, request):
        """Get frequent visitors."""
        visitors = self.queryset.annotate(
            visit_count=Count('visits')
        ).filter(visit_count__gt=0).order_by('-visit_count')[:20]
        serializer = self.get_serializer(visitors, many=True)
        return Response(serializer.data)


class VisitLogViewSet(viewsets.ModelViewSet):
    queryset = VisitLog.objects.select_related('visitor', 'host')
    serializer_class = VisitLogSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['visitor_name', 'visitor_company', 'host_name', 'badge_number']
    filterset_fields = ['status', 'purpose', 'is_pre_registered']
    ordering_fields = ['check_in_time', 'expected_arrival', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return VisitLogListSerializer
        if self.action == 'pre_register':
            return PreRegisterSerializer
        if self.action == 'walk_in':
            return WalkInSerializer
        return VisitLogSerializer

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's visits."""
        today = timezone.now().date()
        visits = self.queryset.filter(
            models.Q(check_in_time__date=today) |
            models.Q(expected_arrival__date=today)
        )
        serializer = VisitLogListSerializer(visits, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def currently_in(self, request):
        """Get visitors currently in the building."""
        visits = self.queryset.filter(status=VisitStatus.CHECKED_IN)
        serializer = VisitLogListSerializer(visits, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expected(self, request):
        """Get expected visitors (pre-registered, not yet checked in)."""
        today = timezone.now().date()
        visits = self.queryset.filter(
            status=VisitStatus.EXPECTED,
            expected_arrival__date__gte=today,
        )
        serializer = VisitLogListSerializer(visits, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_visitors(self, request):
        """Get visitors for current user (as host)."""
        visits = self.queryset.filter(host=request.user)
        serializer = VisitLogListSerializer(visits, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def pre_register(self, request):
        """Pre-register a visitor."""
        serializer = PreRegisterSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        visit = serializer.save()
        return Response(
            VisitLogSerializer(visit).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['post'])
    def walk_in(self, request):
        """Register a walk-in visitor (direct check-in)."""
        serializer = WalkInSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        visit = serializer.save()
        return Response(
            VisitLogSerializer(visit).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Check in a pre-registered visitor."""
        visit = self.get_object()
        serializer = CheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if visit.status != VisitStatus.EXPECTED:
            return Response(
                {'error': 'Only expected visitors can check in.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        visit.status = VisitStatus.CHECKED_IN
        visit.check_in_time = timezone.now()
        visit.checked_in_by = request.user
        visit.badge_number = serializer.validated_data.get('badge_number', '')
        visit.belongings = serializer.validated_data.get('belongings', '')
        visit.save()

        # Update badge if assigned
        if visit.badge_number:
            badge = VisitorBadge.objects.filter(badge_number=visit.badge_number).first()
            if badge:
                badge.is_available = False
                badge.current_holder = visit
                badge.save()

        return Response(VisitLogSerializer(visit).data)

    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        """Check out a visitor."""
        visit = self.get_object()
        serializer = CheckOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if visit.status != VisitStatus.CHECKED_IN:
            return Response(
                {'error': 'Only checked-in visitors can check out.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        visit.status = VisitStatus.CHECKED_OUT
        visit.check_out_time = timezone.now()
        visit.checked_out_by = request.user
        if serializer.validated_data.get('notes'):
            visit.notes = serializer.validated_data['notes']
        visit.save()

        # Release badge if assigned
        if visit.badge_number:
            badge = VisitorBadge.objects.filter(badge_number=visit.badge_number).first()
            if badge:
                badge.is_available = True
                badge.current_holder = None
                badge.save()

        return Response(VisitLogSerializer(visit).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a visit (for expected/pre-registered only)."""
        visit = self.get_object()

        if visit.status != VisitStatus.EXPECTED:
            return Response(
                {'error': 'Only expected visits can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        visit.status = VisitStatus.CANCELLED
        visit.save()

        return Response(VisitLogSerializer(visit).data)

    @action(detail=True, methods=['post'])
    def mark_no_show(self, request, pk=None):
        """Mark an expected visitor as no-show."""
        visit = self.get_object()

        if visit.status != VisitStatus.EXPECTED:
            return Response(
                {'error': 'Only expected visits can be marked as no-show.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        visit.status = VisitStatus.NO_SHOW
        visit.save()

        return Response(VisitLogSerializer(visit).data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get visitor statistics."""
        from django.db.models.functions import TruncDate, TruncMonth

        today = timezone.now().date()
        week_ago = today - timedelta(days=7)

        # Today's stats
        today_visits = self.queryset.filter(check_in_time__date=today)
        today_count = today_visits.count()
        currently_in = today_visits.filter(status=VisitStatus.CHECKED_IN).count()

        # Weekly by day
        weekly = VisitLog.objects.filter(
            check_in_time__date__gte=week_ago,
            status__in=[VisitStatus.CHECKED_IN, VisitStatus.CHECKED_OUT],
        ).annotate(
            date=TruncDate('check_in_time')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')

        # By purpose
        by_purpose = VisitLog.objects.filter(
            check_in_time__date__gte=week_ago,
        ).values('purpose').annotate(
            count=Count('id')
        ).order_by('-count')

        # Monthly trend
        monthly = VisitLog.objects.filter(
            status__in=[VisitStatus.CHECKED_IN, VisitStatus.CHECKED_OUT],
        ).annotate(
            month=TruncMonth('check_in_time')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('-month')[:12]

        return Response({
            'today_count': today_count,
            'currently_in': currently_in,
            'weekly': list(weekly),
            'by_purpose': list(by_purpose),
            'monthly': list(monthly),
        })


class VisitorBadgeViewSet(viewsets.ModelViewSet):
    queryset = VisitorBadge.objects.all()
    serializer_class = VisitorBadgeSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['badge_number']
    filterset_fields = ['is_available', 'badge_type', 'is_active']

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available badges."""
        badges = self.queryset.filter(is_available=True, is_active=True)
        serializer = self.get_serializer(badges, many=True)
        return Response(serializer.data)
