from rest_framework import serializers
from django.utils import timezone
from .models import (
    Folder, Document, DocumentAccessPermission,
    DocumentUserAccess, DocumentAccessLog,
    DocumentCategory, AccessLevel, DocumentStatus, DocumentRole,
)


class FolderSerializer(serializers.ModelSerializer):
    full_path = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()
    documents_count = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = [
            'id', 'name', 'description', 'parent', 'owner',
            'access_level', 'full_path', 'children_count', 'documents_count',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def get_full_path(self, obj):
        return obj.get_full_path()

    def get_children_count(self, obj):
        return obj.children.filter(is_active=True).count()

    def get_documents_count(self, obj):
        return obj.documents.filter(is_active=True).count()

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class FolderTreeSerializer(serializers.ModelSerializer):
    """Serializer for folder tree view with nested children."""
    children = serializers.SerializerMethodField()
    documents_count = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ['id', 'name', 'access_level', 'children', 'documents_count']

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return FolderTreeSerializer(children, many=True).data

    def get_documents_count(self, obj):
        return obj.documents.filter(is_active=True).count()


class DocumentAccessPermissionSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = DocumentAccessPermission
        fields = [
            'id', 'document', 'role', 'role_display',
            'can_read', 'can_download', 'can_edit', 'can_delete', 'can_share',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DocumentUserAccessSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    granted_by_email = serializers.EmailField(source='granted_by.email', read_only=True)

    class Meta:
        model = DocumentUserAccess
        fields = [
            'id', 'document', 'user', 'user_email', 'granted_by', 'granted_by_email',
            'can_read', 'can_download', 'can_edit', 'can_delete', 'can_share',
            'expires_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'granted_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['granted_by'] = self.context['request'].user
        return super().create(validated_data)


class DocumentAccessLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = DocumentAccessLog
        fields = [
            'id', 'document', 'user', 'user_email',
            'action', 'action_display', 'ip_address', 'user_agent',
            'success', 'notes', 'created_at',
        ]
        read_only_fields = fields


class DocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing documents."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    access_level_display = serializers.CharField(source='get_access_level_display', read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    folder_name = serializers.CharField(source='folder.name', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'category', 'category_display',
            'status', 'status_display', 'access_level', 'access_level_display',
            'original_filename', 'file_size', 'content_type',
            'folder', 'folder_name', 'owner', 'owner_email',
            'version', 'download_count', 'created_at',
        ]


class DocumentDetailSerializer(serializers.ModelSerializer):
    """Full serializer for document detail view."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    access_level_display = serializers.CharField(source='get_access_level_display', read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    folder_name = serializers.CharField(source='folder.name', read_only=True)
    role_permissions = DocumentAccessPermissionSerializer(many=True, read_only=True)
    can_download = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'category', 'category_display',
            'status', 'status_display', 'access_level', 'access_level_display',
            'original_filename', 'file_size', 'content_type', 'is_encrypted',
            'folder', 'folder_name', 'owner', 'owner_email',
            'version', 'parent_version', 'tags',
            'effective_date', 'expiry_date',
            'download_count', 'last_accessed_at',
            'role_permissions', 'can_download', 'can_edit',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ]
        read_only_fields = [
            'id', 'encryption_nonce', 'file_size', 'download_count',
            'last_accessed_at', 'created_at', 'updated_at', 'created_by', 'updated_by',
        ]

    def get_can_download(self, obj):
        user = self.context['request'].user
        if obj.owner == user or user.is_superuser:
            return True
        user_access = obj.user_access.filter(user=user, can_download=True).first()
        if user_access:
            if user_access.expires_at and user_access.expires_at < timezone.now():
                return False
            return True
        user_roles = obj.get_user_roles(user)
        return obj.role_permissions.filter(role__in=user_roles, can_download=True).exists()

    def get_can_edit(self, obj):
        user = self.context['request'].user
        if obj.owner == user or user.is_superuser:
            return True
        user_access = obj.user_access.filter(user=user, can_edit=True).first()
        if user_access:
            if user_access.expires_at and user_access.expires_at < timezone.now():
                return False
            return True
        user_roles = obj.get_user_roles(user)
        return obj.role_permissions.filter(role__in=user_roles, can_edit=True).exists()


class DocumentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating documents with file upload."""
    file = serializers.FileField(write_only=True)

    class Meta:
        model = Document
        fields = [
            'title', 'description', 'category', 'status',
            'access_level', 'folder', 'tags',
            'effective_date', 'expiry_date', 'is_encrypted', 'file',
        ]

    def create(self, validated_data):
        file = validated_data.pop('file')
        user = self.context['request'].user

        document = Document(
            owner=user,
            created_by=user,
            updated_by=user,
            content_type=file.content_type or 'application/octet-stream',
            **validated_data
        )

        # Read and encrypt file
        file_data = file.read()
        document.save_encrypted_file(file_data, file.name)
        document.save()

        return document


class DocumentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating document metadata."""

    class Meta:
        model = Document
        fields = [
            'title', 'description', 'category', 'status',
            'access_level', 'folder', 'tags',
            'effective_date', 'expiry_date',
        ]

    def update(self, instance, validated_data):
        instance.updated_by = self.context['request'].user
        return super().update(instance, validated_data)


class GrantAccessSerializer(serializers.Serializer):
    """Serializer for granting access to users."""
    user_id = serializers.UUIDField()
    can_read = serializers.BooleanField(default=True)
    can_download = serializers.BooleanField(default=False)
    can_edit = serializers.BooleanField(default=False)
    can_delete = serializers.BooleanField(default=False)
    can_share = serializers.BooleanField(default=False)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)


class SetRolePermissionSerializer(serializers.Serializer):
    """Serializer for setting role-based permissions."""
    role = serializers.ChoiceField(choices=DocumentRole.choices)
    can_read = serializers.BooleanField(default=True)
    can_download = serializers.BooleanField(default=False)
    can_edit = serializers.BooleanField(default=False)
    can_delete = serializers.BooleanField(default=False)
    can_share = serializers.BooleanField(default=False)
