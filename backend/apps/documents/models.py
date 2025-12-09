"""
Document management models with encryption and role-based access control.
"""
from django.db import models
from django.conf import settings
from django.core.files.base import ContentFile
from apps.core.models import TenantBaseModel, AuditMixin


class DocumentCategory(models.TextChoices):
    """Document category classification."""
    POLICY = 'policy', 'Kebijakan'
    PROCEDURE = 'procedure', 'Prosedur'
    REPORT = 'report', 'Laporan'
    CONTRACT = 'contract', 'Kontrak'
    MEMO = 'memo', 'Memo'
    LETTER = 'letter', 'Surat'
    FORM = 'form', 'Formulir'
    MANUAL = 'manual', 'Manual'
    OTHER = 'other', 'Lainnya'


class AccessLevel(models.TextChoices):
    """Document access level - determines who can view the document."""
    PUBLIC = 'public', 'Publik'  # Anyone can access
    INTERNAL = 'internal', 'Internal'  # All employees
    CONFIDENTIAL = 'confidential', 'Rahasia'  # Specific roles/users only
    RESTRICTED = 'restricted', 'Sangat Rahasia'  # Very limited access


class DocumentStatus(models.TextChoices):
    """Document lifecycle status."""
    DRAFT = 'draft', 'Draf'
    PENDING_REVIEW = 'pending_review', 'Menunggu Review'
    APPROVED = 'approved', 'Disetujui'
    PUBLISHED = 'published', 'Dipublikasi'
    ARCHIVED = 'archived', 'Diarsipkan'
    EXPIRED = 'expired', 'Kadaluarsa'


class DocumentRole(models.TextChoices):
    """Roles that can be granted access to documents."""
    ADMIN = 'admin', 'Administrator'
    MANAGER = 'manager', 'Manager'
    HR = 'hr', 'HR'
    FINANCE = 'finance', 'Finance'
    LEGAL = 'legal', 'Legal'
    IT = 'it', 'IT'
    RESEARCH = 'research', 'Research'
    OPERATIONS = 'operations', 'Operations'
    EXECUTIVE = 'executive', 'Executive'
    STAFF = 'staff', 'Staff'


class Folder(TenantBaseModel):
    """Hierarchical folder structure for organizing documents."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='owned_folders',
    )
    # Access control
    access_level = models.CharField(
        max_length=20,
        choices=AccessLevel.choices,
        default=AccessLevel.INTERNAL,
    )

    class Meta:
        verbose_name = 'Folder'
        verbose_name_plural = 'Folders'
        ordering = ['name']
        unique_together = ['name', 'parent']
        indexes = [
            models.Index(fields=['parent']),
            models.Index(fields=['owner']),
            models.Index(fields=['access_level']),
        ]

    def __str__(self):
        return self.name

    def get_full_path(self):
        """Get full folder path from root."""
        if self.parent:
            return f"{self.parent.get_full_path()}/{self.name}"
        return self.name


class Document(TenantBaseModel, AuditMixin):
    """
    Document model with encryption support.
    Files are encrypted using AES-256-GCM before storage.
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=20,
        choices=DocumentCategory.choices,
        default=DocumentCategory.OTHER,
    )
    status = models.CharField(
        max_length=20,
        choices=DocumentStatus.choices,
        default=DocumentStatus.DRAFT,
    )

    # File storage
    file = models.FileField(upload_to='documents/%Y/%m/')
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0)
    content_type = models.CharField(max_length=100, blank=True)

    # Encryption
    is_encrypted = models.BooleanField(default=True)
    encryption_nonce = models.CharField(
        max_length=32,
        blank=True,
        help_text='Base64-encoded nonce for AES-GCM decryption'
    )

    # Organization
    folder = models.ForeignKey(
        Folder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents',
    )

    # Access control
    access_level = models.CharField(
        max_length=20,
        choices=AccessLevel.choices,
        default=AccessLevel.INTERNAL,
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='owned_documents',
    )

    # Versioning
    version = models.PositiveIntegerField(default=1)
    parent_version = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='child_versions',
    )

    # Metadata
    tags = models.CharField(max_length=200, blank=True, help_text='Comma-separated tags')
    effective_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    # Download tracking
    download_count = models.PositiveIntegerField(default=0)
    last_accessed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['status']),
            models.Index(fields=['access_level']),
            models.Index(fields=['folder']),
            models.Index(fields=['owner']),
            models.Index(fields=['effective_date']),
            models.Index(fields=['expiry_date']),
        ]

    def __str__(self):
        return self.title

    def save_encrypted_file(self, file_data: bytes, filename: str):
        """
        Encrypt and save file data.

        Args:
            file_data: Raw file bytes
            filename: Original filename
        """
        from .encryption import encrypt_file_to_base64
        import base64

        if self.is_encrypted:
            encrypted = encrypt_file_to_base64(file_data)
            encrypted_bytes = base64.b64decode(encrypted['data'])
            self.encryption_nonce = encrypted['nonce']
            self.file.save(filename, ContentFile(encrypted_bytes), save=False)
        else:
            self.file.save(filename, ContentFile(file_data), save=False)

        self.original_filename = filename
        self.file_size = len(file_data)

    def get_decrypted_content(self) -> bytes:
        """
        Get decrypted file content.

        Returns:
            bytes: Decrypted file data
        """
        from .encryption import decrypt_file_from_base64
        import base64

        file_data = self.file.read()

        if self.is_encrypted and self.encryption_nonce:
            encrypted_b64 = base64.b64encode(file_data).decode('utf-8')
            return decrypt_file_from_base64(encrypted_b64, self.encryption_nonce)

        return file_data

    def can_user_access(self, user) -> bool:
        """
        Check if user can access this document based on access level and permissions.

        Args:
            user: User instance to check

        Returns:
            bool: True if user can access
        """
        # Owner always has access
        if self.owner == user:
            return True

        # Superuser always has access
        if user.is_superuser:
            return True

        # Public documents - everyone can access
        if self.access_level == AccessLevel.PUBLIC:
            return True

        # Internal documents - any authenticated user
        if self.access_level == AccessLevel.INTERNAL:
            return user.is_authenticated

        # Confidential and Restricted - check explicit permissions
        # Check user-specific access
        if self.user_access.filter(user=user, can_read=True).exists():
            return True

        # Check role-based access
        user_roles = self.get_user_roles(user)
        if self.role_permissions.filter(role__in=user_roles, can_read=True).exists():
            return True

        return False

    def get_user_roles(self, user) -> list:
        """
        Get document roles for a user based on their groups/permissions.
        This should be customized based on your user role implementation.
        """
        roles = []

        if user.is_superuser:
            roles.append(DocumentRole.ADMIN)

        # Map user groups to document roles
        user_groups = user.groups.values_list('name', flat=True)

        group_role_map = {
            'HR': DocumentRole.HR,
            'Finance': DocumentRole.FINANCE,
            'Legal': DocumentRole.LEGAL,
            'IT': DocumentRole.IT,
            'Research': DocumentRole.RESEARCH,
            'Operations': DocumentRole.OPERATIONS,
            'Executive': DocumentRole.EXECUTIVE,
            'Manager': DocumentRole.MANAGER,
        }

        for group_name, role in group_role_map.items():
            if group_name in user_groups:
                roles.append(role)

        # Default role for all authenticated users
        if not roles:
            roles.append(DocumentRole.STAFF)

        return roles


class DocumentAccessPermission(TenantBaseModel):
    """
    Role-based access permissions for documents.
    Defines which roles can access specific documents.
    """
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='role_permissions',
    )
    role = models.CharField(max_length=20, choices=DocumentRole.choices)

    # Granular permissions
    can_read = models.BooleanField(default=True)
    can_download = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    can_share = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Document Access Permission'
        verbose_name_plural = 'Document Access Permissions'
        unique_together = ['document', 'role']
        indexes = [
            models.Index(fields=['document', 'role']),
        ]

    def __str__(self):
        return f"{self.document.title} - {self.get_role_display()}"


class DocumentUserAccess(TenantBaseModel):
    """
    Explicit user-level access to documents.
    Overrides role-based access for specific users.
    """
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='user_access',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='document_access',
    )
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='granted_document_access',
    )

    # Granular permissions
    can_read = models.BooleanField(default=True)
    can_download = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    can_share = models.BooleanField(default=False)

    # Access period
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Document User Access'
        verbose_name_plural = 'Document User Access'
        unique_together = ['document', 'user']
        indexes = [
            models.Index(fields=['document', 'user']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.document.title} - {self.user.email}"


class DocumentAccessLog(TenantBaseModel):
    """
    Audit log for document access attempts.
    Tracks who accessed/downloaded documents and when.
    """
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='access_logs',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='document_access_logs',
    )

    ACTION_CHOICES = [
        ('view', 'Dilihat'),
        ('download', 'Diunduh'),
        ('edit', 'Diedit'),
        ('delete', 'Dihapus'),
        ('share', 'Dibagikan'),
        ('access_denied', 'Akses Ditolak'),
    ]
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)

    # Context
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    success = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Document Access Log'
        verbose_name_plural = 'Document Access Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['action']),
        ]

    def __str__(self):
        return f"{self.document.title} - {self.action} by {self.user}"
