from django.contrib import admin
from .models import Publication, PublicationAuthor, PublicationReview


class PublicationAuthorInline(admin.TabularInline):
    model = PublicationAuthor
    extra = 1
    raw_id_fields = ['user']


class PublicationReviewInline(admin.TabularInline):
    model = PublicationReview
    extra = 0
    raw_id_fields = ['reviewer']


@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'publication_type', 'status', 'journal_name',
        'year', 'indexation', 'citation_count'
    ]
    list_filter = ['status', 'publication_type', 'indexation', 'year']
    search_fields = ['title', 'abstract', 'journal_name', 'doi']
    raw_id_fields = ['grant', 'created_by', 'updated_by']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [PublicationAuthorInline, PublicationReviewInline]
    fieldsets = (
        ('Info Publikasi', {
            'fields': ('title', 'abstract', 'keywords')
        }),
        ('Jenis & Status', {
            'fields': ('publication_type', 'status')
        }),
        ('Detail Publikasi', {
            'fields': ('journal_name', 'volume', 'issue', 'pages', 'publisher')
        }),
        ('Tanggal', {
            'fields': ('submission_date', 'acceptance_date', 'publication_date', 'year')
        }),
        ('Identifiers', {
            'fields': ('doi', 'isbn', 'issn', 'url')
        }),
        ('Indeksasi', {
            'fields': ('indexation', 'impact_factor', 'sinta_score', 'quartile', 'citation_count')
        }),
        ('Grant', {
            'fields': ('grant',),
            'classes': ('collapse',)
        }),
        ('Files', {
            'fields': ('manuscript_file', 'published_file'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PublicationAuthor)
class PublicationAuthorAdmin(admin.ModelAdmin):
    list_display = [
        'publication', 'display_name', 'author_type', 'order',
        'is_corresponding', 'affiliation'
    ]
    list_filter = ['author_type', 'is_corresponding']
    search_fields = ['publication__title', 'name', 'user__username']
    raw_id_fields = ['publication', 'user']


@admin.register(PublicationReview)
class PublicationReviewAdmin(admin.ModelAdmin):
    list_display = [
        'publication', 'reviewer', 'status', 'recommendation', 'reviewed_at'
    ]
    list_filter = ['status', 'recommendation']
    search_fields = ['publication__title', 'reviewer__username']
    raw_id_fields = ['publication', 'reviewer', 'created_by', 'updated_by']
