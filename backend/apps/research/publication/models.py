"""
Publication models for Research module.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.models import TenantBaseModel
from apps.core.models.audit import AuditMixin


class PublicationType(models.TextChoices):
    JOURNAL_ARTICLE = 'journal_article', 'Artikel Jurnal'
    CONFERENCE_PAPER = 'conference_paper', 'Paper Konferensi'
    BOOK = 'book', 'Buku'
    BOOK_CHAPTER = 'book_chapter', 'Bab Buku'
    THESIS = 'thesis', 'Tesis/Disertasi'
    REPORT = 'report', 'Laporan'
    WORKING_PAPER = 'working_paper', 'Working Paper'
    POLICY_BRIEF = 'policy_brief', 'Policy Brief'
    OP_ED = 'op_ed', 'Op-Ed'
    BLOG = 'blog', 'Blog'
    OTHER = 'other', 'Lainnya'


class PublicationStatus(models.TextChoices):
    DRAFT = 'draft', 'Draf'
    IN_REVIEW = 'in_review', 'Dalam Review'
    REVISION = 'revision', 'Revisi'
    ACCEPTED = 'accepted', 'Diterima'
    PUBLISHED = 'published', 'Dipublikasikan'
    REJECTED = 'rejected', 'Ditolak'


class IndexationType(models.TextChoices):
    SCOPUS = 'scopus', 'Scopus'
    WOS = 'wos', 'Web of Science'
    SINTA = 'sinta', 'SINTA'
    DOAJ = 'doaj', 'DOAJ'
    GOOGLE_SCHOLAR = 'google_scholar', 'Google Scholar'
    NON_INDEXED = 'non_indexed', 'Tidak Terindeks'
    OTHER = 'other', 'Lainnya'


class Publication(TenantBaseModel, AuditMixin):
    """Research publication model."""
    title = models.CharField(max_length=500, verbose_name='Judul')
    abstract = models.TextField(blank=True, verbose_name='Abstrak')
    keywords = models.CharField(max_length=500, blank=True, verbose_name='Kata Kunci')

    # Type and status
    publication_type = models.CharField(
        max_length=20, choices=PublicationType.choices,
        default=PublicationType.JOURNAL_ARTICLE, verbose_name='Jenis Publikasi'
    )
    status = models.CharField(
        max_length=20, choices=PublicationStatus.choices,
        default=PublicationStatus.DRAFT, verbose_name='Status'
    )

    # Publication details
    journal_name = models.CharField(
        max_length=300, blank=True, verbose_name='Nama Jurnal/Publisher'
    )
    volume = models.CharField(max_length=20, blank=True)
    issue = models.CharField(max_length=20, blank=True)
    pages = models.CharField(max_length=50, blank=True, verbose_name='Halaman')
    publisher = models.CharField(max_length=200, blank=True, verbose_name='Penerbit')

    # Dates
    submission_date = models.DateField(
        null=True, blank=True, verbose_name='Tanggal Submit'
    )
    acceptance_date = models.DateField(
        null=True, blank=True, verbose_name='Tanggal Diterima'
    )
    publication_date = models.DateField(
        null=True, blank=True, verbose_name='Tanggal Publikasi'
    )
    year = models.IntegerField(
        null=True, blank=True, verbose_name='Tahun',
        help_text='Tahun publikasi'
    )

    # Identifiers
    doi = models.CharField(max_length=100, blank=True, verbose_name='DOI')
    isbn = models.CharField(max_length=20, blank=True, verbose_name='ISBN')
    issn = models.CharField(max_length=20, blank=True, verbose_name='ISSN')
    url = models.URLField(max_length=500, blank=True, verbose_name='URL')

    # Indexation
    indexation = models.CharField(
        max_length=20, choices=IndexationType.choices,
        default=IndexationType.NON_INDEXED, verbose_name='Indeksasi'
    )
    impact_factor = models.DecimalField(
        max_digits=6, decimal_places=3, null=True, blank=True,
        verbose_name='Impact Factor'
    )
    sinta_score = models.IntegerField(
        null=True, blank=True, verbose_name='Skor SINTA',
        help_text='1-6, 1 tertinggi'
    )
    quartile = models.CharField(
        max_length=2, blank=True, verbose_name='Kuartil',
        help_text='Q1, Q2, Q3, Q4'
    )

    # Metrics
    citation_count = models.IntegerField(default=0, verbose_name='Jumlah Sitasi')

    # Related grant
    grant = models.ForeignKey(
        'research.Grant',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='publications',
        verbose_name='Grant Terkait'
    )

    # Files
    manuscript_file = models.FileField(
        upload_to='publications/manuscripts/', blank=True, null=True,
        verbose_name='File Manuskrip'
    )
    published_file = models.FileField(
        upload_to='publications/published/', blank=True, null=True,
        verbose_name='File Publikasi'
    )

    notes = models.TextField(blank=True, verbose_name='Catatan')

    class Meta:
        verbose_name = 'Publikasi'
        verbose_name_plural = 'Publikasi'
        ordering = ['-publication_date', '-created_at']
        indexes = [
            models.Index(fields=['publication_type']),
            models.Index(fields=['status']),
            models.Index(fields=['publication_date']),
            models.Index(fields=['indexation']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Auto-set year from publication_date
        if self.publication_date and not self.year:
            self.year = self.publication_date.year
        super().save(*args, **kwargs)


class PublicationAuthor(TenantBaseModel):
    """Publication author model."""
    class AuthorType(models.TextChoices):
        INTERNAL = 'internal', 'Internal'
        EXTERNAL = 'external', 'Eksternal'

    publication = models.ForeignKey(
        Publication, on_delete=models.CASCADE,
        related_name='authors'
    )
    # For internal authors
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='publications_authored'
    )
    # For external authors
    author_type = models.CharField(
        max_length=10, choices=AuthorType.choices,
        default=AuthorType.INTERNAL
    )
    name = models.CharField(
        max_length=200, blank=True, verbose_name='Nama',
        help_text='Untuk penulis eksternal'
    )
    affiliation = models.CharField(
        max_length=300, blank=True, verbose_name='Afiliasi'
    )
    email = models.EmailField(blank=True)

    # Order and role
    order = models.IntegerField(default=1, verbose_name='Urutan')
    is_corresponding = models.BooleanField(
        default=False, verbose_name='Corresponding Author'
    )

    class Meta:
        verbose_name = 'Penulis Publikasi'
        verbose_name_plural = 'Penulis Publikasi'
        ordering = ['order']
        unique_together = ['publication', 'order']

    def __str__(self):
        author_name = self.name if self.author_type == self.AuthorType.EXTERNAL else (
            self.user.get_full_name() if self.user else 'Unknown'
        )
        return f"{author_name} - {self.publication.title[:50]}"

    @property
    def display_name(self):
        if self.author_type == self.AuthorType.EXTERNAL:
            return self.name
        return self.user.get_full_name() if self.user else 'Unknown'


class PublicationReview(TenantBaseModel, AuditMixin):
    """Internal review for publications."""
    class ReviewStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'Dalam Proses'
        COMPLETED = 'completed', 'Selesai'

    class Recommendation(models.TextChoices):
        ACCEPT = 'accept', 'Terima'
        MINOR_REVISION = 'minor_revision', 'Revisi Minor'
        MAJOR_REVISION = 'major_revision', 'Revisi Major'
        REJECT = 'reject', 'Tolak'

    publication = models.ForeignKey(
        Publication, on_delete=models.CASCADE,
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='publication_reviews'
    )
    status = models.CharField(
        max_length=20, choices=ReviewStatus.choices,
        default=ReviewStatus.PENDING
    )
    recommendation = models.CharField(
        max_length=20, choices=Recommendation.choices,
        blank=True
    )
    comments = models.TextField(blank=True, verbose_name='Komentar')
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Review Publikasi'
        verbose_name_plural = 'Review Publikasi'
        unique_together = ['publication', 'reviewer']

    def __str__(self):
        return f"Review: {self.publication.title[:50]} by {self.reviewer}"
