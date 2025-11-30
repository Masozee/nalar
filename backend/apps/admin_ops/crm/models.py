"""
CRM Models for Contact Management
Supports:
- Contacts with multiple job positions
- Organizations
- Access level controls (Public, Internal, Restricted, VIP, VVIP)
- Contact activities and notes
- Relationship tracking
"""
import uuid
from django.db import models
from django.conf import settings
from apps.core.models.base import BaseModel


class AccessLevel(models.TextChoices):
    """Access levels for contact information"""
    PUBLIC = 'public', 'Public'
    INTERNAL = 'internal', 'Internal'
    RESTRICTED = 'restricted', 'Restricted'
    VIP = 'vip', 'VIP'
    VVIP = 'vvip', 'VVIP'


class ContactType(models.TextChoices):
    """Type of contact"""
    INDIVIDUAL = 'individual', 'Individual'
    ORGANIZATION = 'organization', 'Organization'


class OrganizationType(models.TextChoices):
    """Organization categories"""
    GOVERNMENT = 'government', 'Government Agency'
    CORPORATE = 'corporate', 'Corporate'
    NGO = 'ngo', 'NGO/Non-Profit'
    EDUCATION = 'education', 'Educational Institution'
    MEDIA = 'media', 'Media'
    PARTNER = 'partner', 'Partner Organization'
    VENDOR = 'vendor', 'Vendor/Supplier'
    DONOR = 'donor', 'Donor'
    OTHER = 'other', 'Other'


class Organization(BaseModel):
    """Organization/Company entity"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    organization_type = models.CharField(
        max_length=20,
        choices=OrganizationType.choices,
        default=OrganizationType.OTHER
    )
    industry = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    # Access control
    access_level = models.CharField(
        max_length=20,
        choices=AccessLevel.choices,
        default=AccessLevel.INTERNAL
    )

    # Relationship management
    parent_organization = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subsidiaries'
    )

    # Metadata
    logo = models.TextField(blank=True, help_text="URL or base64 data URI for organization logo")
    tags = models.JSONField(default=list, blank=True)
    custom_fields = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'crm_organizations'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['organization_type']),
            models.Index(fields=['access_level']),
        ]

    def __str__(self):
        return self.name


class Contact(BaseModel):
    """Individual contact with support for multiple positions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Basic Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    prefix = models.CharField(max_length=20, blank=True, help_text="e.g., Dr., Prof., Hon.")
    suffix = models.CharField(max_length=20, blank=True, help_text="e.g., Ph.D., MBA")

    # Contact Details
    email_primary = models.EmailField(blank=True)
    email_secondary = models.EmailField(blank=True)
    phone_primary = models.CharField(max_length=50, blank=True)
    phone_secondary = models.CharField(max_length=50, blank=True)
    phone_mobile = models.CharField(max_length=50, blank=True)

    # Social Media
    linkedin_url = models.URLField(blank=True)
    twitter_handle = models.CharField(max_length=100, blank=True)

    # Address
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)

    # Professional Info
    biography = models.TextField(blank=True)
    expertise_areas = models.JSONField(default=list, blank=True, help_text="List of expertise areas")
    languages = models.JSONField(default=list, blank=True, help_text="Languages spoken")

    # Access Control - IMPORTANT for VIP/VVIP contacts
    access_level = models.CharField(
        max_length=20,
        choices=AccessLevel.choices,
        default=AccessLevel.INTERNAL,
        help_text="Controls who can view this contact"
    )

    # Relationship Management
    contact_type = models.CharField(
        max_length=20,
        choices=ContactType.choices,
        default=ContactType.INDIVIDUAL
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_contacts',
        help_text="Staff member responsible for this contact"
    )

    # Metadata
    photo_url = models.TextField(blank=True, help_text="URL or base64 data URI for contact photo")
    tags = models.JSONField(default=list, blank=True)
    custom_fields = models.JSONField(default=dict, blank=True)

    # Status
    is_active = models.BooleanField(default=True)
    last_contacted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'crm_contacts'
        ordering = ['last_name', 'first_name']
        indexes = [
            models.Index(fields=['last_name', 'first_name']),
            models.Index(fields=['email_primary']),
            models.Index(fields=['access_level']),
            models.Index(fields=['contact_type']),
            models.Index(fields=['assigned_to']),
        ]

    def __str__(self):
        return self.get_full_name()

    def get_full_name(self):
        """Return full name with prefix and suffix if available"""
        parts = []
        if self.prefix:
            parts.append(self.prefix)
        parts.append(f"{self.first_name} {self.last_name}")
        if self.suffix:
            parts.append(self.suffix)
        return ' '.join(parts)


class JobPosition(BaseModel):
    """
    Job positions for contacts - supports multiple positions per contact
    Links contacts to organizations with specific roles
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name='positions'
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='positions'
    )

    # Position details
    title = models.CharField(max_length=200, help_text="Job title/position")
    department = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(
        default=False,
        help_text="Is this the contact's primary position?"
    )

    # Date range
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text="Leave blank if currently active"
    )
    is_current = models.BooleanField(default=True)

    # Contact info specific to this position
    office_phone = models.CharField(max_length=50, blank=True)
    office_email = models.EmailField(blank=True)
    office_address = models.TextField(blank=True)

    # Additional details
    description = models.TextField(blank=True, help_text="Role description")
    responsibilities = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'crm_job_positions'
        ordering = ['-is_current', '-is_primary', '-start_date']
        indexes = [
            models.Index(fields=['contact', 'organization']),
            models.Index(fields=['is_current']),
            models.Index(fields=['is_primary']),
        ]
        unique_together = [['contact', 'organization', 'title', 'start_date']]

    def __str__(self):
        return f"{self.contact.get_full_name()} - {self.title} at {self.organization.name}"


class ContactNote(BaseModel):
    """Notes and comments about contacts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='contact_notes'
    )

    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    is_private = models.BooleanField(
        default=False,
        help_text="Only visible to author and admins"
    )

    # Metadata
    attachments = models.JSONField(
        default=list,
        blank=True,
        help_text="List of attachment URLs"
    )

    class Meta:
        db_table = 'crm_contact_notes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['contact', '-created_at']),
            models.Index(fields=['author']),
        ]

    def __str__(self):
        return f"Note on {self.contact.get_full_name()} by {self.author}"


class ActivityType(models.TextChoices):
    """Types of contact activities"""
    MEETING = 'meeting', 'Meeting'
    CALL = 'call', 'Phone Call'
    EMAIL = 'email', 'Email'
    LUNCH = 'lunch', 'Lunch/Dinner'
    EVENT = 'event', 'Event'
    CONFERENCE = 'conference', 'Conference'
    COLLABORATION = 'collaboration', 'Collaboration'
    OTHER = 'other', 'Other'


class ContactActivity(BaseModel):
    """Track interactions and activities with contacts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    activity_type = models.CharField(
        max_length=20,
        choices=ActivityType.choices,
        default=ActivityType.MEETING
    )

    # Activity details
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    activity_date = models.DateTimeField()
    duration_minutes = models.IntegerField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)

    # Participants
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='contact_activities',
        blank=True
    )
    organized_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='organized_activities'
    )

    # Follow-up
    requires_followup = models.BooleanField(default=False)
    followup_date = models.DateField(null=True, blank=True)
    followup_completed = models.BooleanField(default=False)

    # Outcome
    outcome = models.TextField(blank=True, help_text="Meeting outcome/notes")

    class Meta:
        db_table = 'crm_contact_activities'
        ordering = ['-activity_date']
        indexes = [
            models.Index(fields=['contact', '-activity_date']),
            models.Index(fields=['activity_type']),
            models.Index(fields=['requires_followup']),
        ]
        verbose_name_plural = 'Contact Activities'

    def __str__(self):
        return f"{self.activity_type} with {self.contact.get_full_name()} on {self.activity_date.date()}"
