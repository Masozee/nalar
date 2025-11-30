"""
Serializers for Publication module.
"""
from rest_framework import serializers
from .models import Publication, PublicationAuthor, PublicationReview


class PublicationAuthorSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = PublicationAuthor
        fields = [
            'id', 'publication', 'user', 'user_name', 'author_type', 'name',
            'affiliation', 'email', 'order', 'is_corresponding', 'display_name',
            'is_active'
        ]
        read_only_fields = ['id', 'display_name']


class PublicationReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    recommendation_display = serializers.CharField(source='get_recommendation_display', read_only=True)

    class Meta:
        model = PublicationReview
        fields = [
            'id', 'publication', 'reviewer', 'reviewer_name', 'status',
            'status_display', 'recommendation', 'recommendation_display',
            'comments', 'reviewed_at', 'is_active'
        ]
        read_only_fields = ['id']


class PublicationListSerializer(serializers.ModelSerializer):
    publication_type_display = serializers.CharField(source='get_publication_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    indexation_display = serializers.CharField(source='get_indexation_display', read_only=True)
    author_count = serializers.SerializerMethodField()
    first_author = serializers.SerializerMethodField()

    class Meta:
        model = Publication
        fields = [
            'id', 'title', 'publication_type', 'publication_type_display',
            'status', 'status_display', 'journal_name', 'year',
            'indexation', 'indexation_display', 'quartile', 'citation_count',
            'author_count', 'first_author', 'is_active'
        ]

    def get_author_count(self, obj):
        return obj.authors.filter(is_active=True).count()

    def get_first_author(self, obj):
        first = obj.authors.filter(is_active=True).order_by('order').first()
        return first.display_name if first else None


class PublicationDetailSerializer(serializers.ModelSerializer):
    publication_type_display = serializers.CharField(source='get_publication_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    indexation_display = serializers.CharField(source='get_indexation_display', read_only=True)
    authors = PublicationAuthorSerializer(many=True, read_only=True)
    reviews = PublicationReviewSerializer(many=True, read_only=True)
    grant_number = serializers.CharField(source='grant.grant_number', read_only=True)

    class Meta:
        model = Publication
        fields = [
            'id', 'title', 'abstract', 'keywords', 'publication_type',
            'publication_type_display', 'status', 'status_display',
            'journal_name', 'volume', 'issue', 'pages', 'publisher',
            'submission_date', 'acceptance_date', 'publication_date', 'year',
            'doi', 'isbn', 'issn', 'url',
            'indexation', 'indexation_display', 'impact_factor',
            'sinta_score', 'quartile', 'citation_count',
            'grant', 'grant_number', 'manuscript_file', 'published_file', 'notes',
            'authors', 'reviews',
            'is_active', 'created_at', 'updated_at'
        ]


class PublicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = [
            'title', 'abstract', 'keywords', 'publication_type',
            'journal_name', 'volume', 'issue', 'pages', 'publisher',
            'submission_date', 'acceptance_date', 'publication_date', 'year',
            'doi', 'isbn', 'issn', 'url', 'indexation',
            'impact_factor', 'sinta_score', 'quartile', 'grant', 'notes'
        ]

    def create(self, validated_data):
        request = self.context['request']
        validated_data['created_by'] = request.user
        return super().create(validated_data)
