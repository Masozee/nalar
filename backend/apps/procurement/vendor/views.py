from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vendor, VendorContact, VendorEvaluation, VendorStatus
from .serializers import (
    VendorListSerializer, VendorDetailSerializer, VendorCreateSerializer,
    VendorContactSerializer, VendorEvaluationSerializer,
)


class VendorViewSet(viewsets.ModelViewSet):
    """ViewSet for vendor management."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'vendor_type', 'city', 'province']
    search_fields = ['code', 'name', 'email', 'contact_person', 'npwp']
    ordering_fields = ['name', 'code', 'rating', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        return Vendor.objects.filter(is_active=True).prefetch_related('contacts')

    def get_serializer_class(self):
        if self.action == 'create':
            return VendorCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return VendorCreateSerializer
        elif self.action == 'retrieve':
            return VendorDetailSerializer
        return VendorListSerializer

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a vendor."""
        vendor = self.get_object()
        vendor.status = VendorStatus.ACTIVE
        vendor.save(update_fields=['status'])
        return Response({'detail': 'Vendor berhasil diaktifkan.'})

    @action(detail=True, methods=['post'])
    def blacklist(self, request, pk=None):
        """Blacklist a vendor."""
        vendor = self.get_object()
        reason = request.data.get('reason', '')
        vendor.status = VendorStatus.BLACKLISTED
        vendor.blacklist_reason = reason
        vendor.save(update_fields=['status', 'blacklist_reason'])
        return Response({'detail': 'Vendor berhasil di-blacklist.'})

    @action(detail=True, methods=['get'])
    def evaluations(self, request, pk=None):
        """Get vendor evaluations."""
        vendor = self.get_object()
        evaluations = vendor.evaluations.all()[:10]
        serializer = VendorEvaluationSerializer(evaluations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def purchase_orders(self, request, pk=None):
        """Get vendor purchase orders."""
        vendor = self.get_object()
        from apps.procurement.purchase_order.serializers import POListSerializer
        pos = vendor.purchase_orders.filter(is_active=True)[:20]
        serializer = POListSerializer(pos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active vendors only."""
        vendors = self.get_queryset().filter(status=VendorStatus.ACTIVE)
        serializer = VendorListSerializer(vendors, many=True)
        return Response(serializer.data)


class VendorContactViewSet(viewsets.ModelViewSet):
    """ViewSet for vendor contacts."""
    serializer_class = VendorContactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['vendor', 'is_primary']

    def get_queryset(self):
        return VendorContact.objects.filter(is_active=True).select_related('vendor')


class VendorEvaluationViewSet(viewsets.ModelViewSet):
    """ViewSet for vendor evaluations."""
    serializer_class = VendorEvaluationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['vendor']
    ordering_fields = ['evaluation_date', 'overall_score']
    ordering = ['-evaluation_date']

    def get_queryset(self):
        return VendorEvaluation.objects.filter(is_active=True).select_related('vendor', 'evaluator')
