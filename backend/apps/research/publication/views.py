"""
Views for Publication module.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from .models import Publication, PublicationAuthor, PublicationReview, PublicationStatus
from .serializers import (
    PublicationListSerializer, PublicationDetailSerializer, PublicationCreateSerializer,
    PublicationAuthorSerializer, PublicationReviewSerializer,
)


class PublicationViewSet(viewsets.ModelViewSet):
    """ViewSet for Publication CRUD."""
    queryset = Publication.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'publication_type', 'indexation', 'year', 'grant']
    search_fields = ['title', 'abstract', 'keywords', 'journal_name', 'doi']
    ordering_fields = ['title', 'publication_date', 'year', 'citation_count', 'created_at']
    ordering = ['-publication_date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return PublicationListSerializer
        elif self.action == 'create':
            return PublicationCreateSerializer
        return PublicationDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(PublicationDetailSerializer(instance).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit publication for review."""
        pub = self.get_object()
        if pub.status != PublicationStatus.DRAFT:
            return Response({'error': 'Publikasi harus dalam status draft'}, status=status.HTTP_400_BAD_REQUEST)
        pub.status = PublicationStatus.IN_REVIEW
        pub.submission_date = timezone.now().date()
        pub.save(update_fields=['status', 'submission_date'])
        return Response({'status': 'in_review'})

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Mark publication as accepted."""
        pub = self.get_object()
        if pub.status not in [PublicationStatus.IN_REVIEW, PublicationStatus.REVISION]:
            return Response({'error': 'Publikasi tidak dapat diterima'}, status=status.HTTP_400_BAD_REQUEST)
        pub.status = PublicationStatus.ACCEPTED
        pub.acceptance_date = timezone.now().date()
        pub.save(update_fields=['status', 'acceptance_date'])
        return Response({'status': 'accepted'})

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Mark publication as published."""
        pub = self.get_object()
        if pub.status != PublicationStatus.ACCEPTED:
            return Response({'error': 'Publikasi harus diterima terlebih dahulu'}, status=status.HTTP_400_BAD_REQUEST)
        pub.status = PublicationStatus.PUBLISHED
        pub.publication_date = request.data.get('publication_date') or timezone.now().date()
        pub.save()
        return Response({'status': 'published'})

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get publication summary."""
        queryset = self.get_queryset()
        year = request.query_params.get('year')
        if year:
            queryset = queryset.filter(year=year)

        return Response({
            'total_publications': queryset.count(),
            'total_citations': sum(p.citation_count for p in queryset),
            'by_type': {
                'journal_article': queryset.filter(publication_type='journal_article').count(),
                'conference_paper': queryset.filter(publication_type='conference_paper').count(),
                'book': queryset.filter(publication_type='book').count(),
                'book_chapter': queryset.filter(publication_type='book_chapter').count(),
                'policy_brief': queryset.filter(publication_type='policy_brief').count(),
                'other': queryset.exclude(publication_type__in=['journal_article', 'conference_paper', 'book', 'book_chapter', 'policy_brief']).count(),
            },
            'by_indexation': {
                'scopus': queryset.filter(indexation='scopus').count(),
                'wos': queryset.filter(indexation='wos').count(),
                'sinta': queryset.filter(indexation='sinta').count(),
                'non_indexed': queryset.filter(indexation='non_indexed').count(),
            },
            'by_status': {
                'draft': queryset.filter(status=PublicationStatus.DRAFT).count(),
                'in_review': queryset.filter(status=PublicationStatus.IN_REVIEW).count(),
                'published': queryset.filter(status=PublicationStatus.PUBLISHED).count(),
            }
        })


class PublicationAuthorViewSet(viewsets.ModelViewSet):
    queryset = PublicationAuthor.objects.filter(is_active=True)
    serializer_class = PublicationAuthorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['publication', 'user', 'author_type', 'is_corresponding']


class PublicationReviewViewSet(viewsets.ModelViewSet):
    queryset = PublicationReview.objects.filter(is_active=True)
    serializer_class = PublicationReviewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['publication', 'reviewer', 'status', 'recommendation']

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete review."""
        review = self.get_object()
        recommendation = request.data.get('recommendation')
        if not recommendation:
            return Response({'error': 'Recommendation required'}, status=status.HTTP_400_BAD_REQUEST)
        review.status = PublicationReview.ReviewStatus.COMPLETED
        review.recommendation = recommendation
        review.comments = request.data.get('comments', '')
        review.reviewed_at = timezone.now()
        review.save()
        return Response({'status': 'completed'})
