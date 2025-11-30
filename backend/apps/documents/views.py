from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.models import User
from .models import (
    Folder, Document, DocumentAccessPermission,
    DocumentUserAccess, DocumentAccessLog,
    AccessLevel,
)
from .serializers import (
    FolderSerializer, FolderTreeSerializer,
    DocumentListSerializer, DocumentDetailSerializer,
    DocumentCreateSerializer, DocumentUpdateSerializer,
    DocumentAccessPermissionSerializer, DocumentUserAccessSerializer,
    DocumentAccessLogSerializer,
    GrantAccessSerializer, SetRolePermissionSerializer,
)


def get_client_ip(request):
    """Extract client IP from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def log_access(document, user, action, request, success=True, notes=''):
    """Create access log entry."""
    DocumentAccessLog.objects.create(
        document=document,
        user=user,
        action=action,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
        success=success,
        notes=notes,
    )


class FolderViewSet(viewsets.ModelViewSet):
    """ViewSet for folder management."""
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['parent', 'access_level', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        user = self.request.user
        qs = Folder.objects.filter(is_active=True)

        if not user.is_superuser:
            # Filter by access level
            qs = qs.filter(
                Q(access_level=AccessLevel.PUBLIC) |
                Q(access_level=AccessLevel.INTERNAL) |
                Q(owner=user)
            )

        return qs.select_related('parent', 'owner')

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get folder tree structure."""
        root_folders = self.get_queryset().filter(parent__isnull=True)
        serializer = FolderTreeSerializer(root_folders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get documents in a folder."""
        folder = self.get_object()
        documents = folder.documents.filter(is_active=True)

        # Apply access filtering
        user = request.user
        if not user.is_superuser:
            documents = documents.filter(
                Q(access_level=AccessLevel.PUBLIC) |
                Q(access_level=AccessLevel.INTERNAL) |
                Q(owner=user) |
                Q(user_access__user=user, user_access__can_read=True)
            ).distinct()

        serializer = DocumentListSerializer(documents, many=True)
        return Response(serializer.data)


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for document management with encryption and access control."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'access_level', 'folder', 'is_encrypted']
    search_fields = ['title', 'description', 'tags', 'original_filename']
    ordering_fields = ['title', 'created_at', 'download_count']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = Document.objects.filter(is_active=True)

        if not user.is_superuser:
            # Get user's roles
            user_roles = []
            if user.is_authenticated:
                # Simplified role extraction - customize as needed
                user_groups = user.groups.values_list('name', flat=True)
                role_map = {
                    'HR': 'hr', 'Finance': 'finance', 'Legal': 'legal',
                    'IT': 'it', 'Research': 'research', 'Operations': 'operations',
                    'Executive': 'executive', 'Manager': 'manager',
                }
                for group_name, role in role_map.items():
                    if group_name in user_groups:
                        user_roles.append(role)
                if not user_roles:
                    user_roles.append('staff')

            qs = qs.filter(
                Q(access_level=AccessLevel.PUBLIC) |
                Q(access_level=AccessLevel.INTERNAL) |
                Q(owner=user) |
                Q(user_access__user=user, user_access__can_read=True) |
                Q(role_permissions__role__in=user_roles, role_permissions__can_read=True)
            ).distinct()

        return qs.select_related('folder', 'owner', 'created_by', 'updated_by')

    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DocumentUpdateSerializer
        elif self.action == 'retrieve':
            return DocumentDetailSerializer
        return DocumentListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Check access
        if not instance.can_user_access(request.user):
            log_access(instance, request.user, 'access_denied', request, success=False)
            return Response(
                {'detail': 'Anda tidak memiliki akses ke dokumen ini.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Log view
        log_access(instance, request.user, 'view', request)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Check delete permission
        user = request.user
        can_delete = (
            instance.owner == user or
            user.is_superuser or
            instance.user_access.filter(user=user, can_delete=True).exists()
        )

        if not can_delete:
            log_access(instance, user, 'access_denied', request, success=False, notes='Delete attempt')
            return Response(
                {'detail': 'Anda tidak memiliki izin untuk menghapus dokumen ini.'},
                status=status.HTTP_403_FORBIDDEN
            )

        log_access(instance, user, 'delete', request)
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download decrypted document."""
        document = self.get_object()
        user = request.user

        # Check access
        if not document.can_user_access(user):
            log_access(document, user, 'access_denied', request, success=False, notes='Download attempt')
            return Response(
                {'detail': 'Anda tidak memiliki akses ke dokumen ini.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check download permission
        can_download = (
            document.owner == user or
            user.is_superuser or
            document.user_access.filter(user=user, can_download=True).exists() or
            document.role_permissions.filter(
                role__in=document.get_user_roles(user),
                can_download=True
            ).exists()
        )

        if not can_download:
            log_access(document, user, 'access_denied', request, success=False, notes='Download denied - no permission')
            return Response(
                {'detail': 'Anda tidak memiliki izin untuk mengunduh dokumen ini.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get decrypted content
        try:
            content = document.get_decrypted_content()
        except Exception as e:
            return Response(
                {'detail': f'Gagal mendekripsi dokumen: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Log download
        log_access(document, user, 'download', request)

        # Update download count
        document.download_count += 1
        document.last_accessed_at = timezone.now()
        document.save(update_fields=['download_count', 'last_accessed_at'])

        # Return file
        response = HttpResponse(content, content_type=document.content_type)
        response['Content-Disposition'] = f'attachment; filename="{document.original_filename}"'
        return response

    @action(detail=True, methods=['post'])
    def grant_access(self, request, pk=None):
        """Grant access to a specific user."""
        document = self.get_object()
        user = request.user

        # Check if user can share
        can_share = (
            document.owner == user or
            user.is_superuser or
            document.user_access.filter(user=user, can_share=True).exists()
        )

        if not can_share:
            return Response(
                {'detail': 'Anda tidak memiliki izin untuk membagikan dokumen ini.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = GrantAccessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            target_user = User.objects.get(id=serializer.validated_data['user_id'])
        except User.DoesNotExist:
            return Response(
                {'detail': 'User tidak ditemukan.'},
                status=status.HTTP_404_NOT_FOUND
            )

        access, created = DocumentUserAccess.objects.update_or_create(
            document=document,
            user=target_user,
            defaults={
                'granted_by': user,
                'can_read': serializer.validated_data['can_read'],
                'can_download': serializer.validated_data['can_download'],
                'can_edit': serializer.validated_data['can_edit'],
                'can_delete': serializer.validated_data['can_delete'],
                'can_share': serializer.validated_data['can_share'],
                'expires_at': serializer.validated_data.get('expires_at'),
            }
        )

        log_access(document, user, 'share', request, notes=f'Granted to {target_user.email}')
        return Response(DocumentUserAccessSerializer(access).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def revoke_access(self, request, pk=None):
        """Revoke access from a specific user."""
        document = self.get_object()
        user = request.user

        can_share = (
            document.owner == user or
            user.is_superuser
        )

        if not can_share:
            return Response(
                {'detail': 'Anda tidak memiliki izin untuk mengubah akses dokumen ini.'},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'detail': 'user_id diperlukan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted, _ = DocumentUserAccess.objects.filter(
            document=document,
            user_id=user_id
        ).delete()

        if deleted:
            return Response({'detail': 'Akses berhasil dicabut.'})
        return Response(
            {'detail': 'Akses tidak ditemukan.'},
            status=status.HTTP_404_NOT_FOUND
        )

    @action(detail=True, methods=['post'])
    def set_role_permission(self, request, pk=None):
        """Set role-based permission for document."""
        document = self.get_object()
        user = request.user

        if document.owner != user and not user.is_superuser:
            return Response(
                {'detail': 'Hanya pemilik yang dapat mengatur izin role.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = SetRolePermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        permission, created = DocumentAccessPermission.objects.update_or_create(
            document=document,
            role=serializer.validated_data['role'],
            defaults={
                'can_read': serializer.validated_data['can_read'],
                'can_download': serializer.validated_data['can_download'],
                'can_edit': serializer.validated_data['can_edit'],
                'can_delete': serializer.validated_data['can_delete'],
                'can_share': serializer.validated_data['can_share'],
            }
        )

        return Response(DocumentAccessPermissionSerializer(permission).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['delete'])
    def remove_role_permission(self, request, pk=None):
        """Remove role-based permission from document."""
        document = self.get_object()
        user = request.user

        if document.owner != user and not user.is_superuser:
            return Response(
                {'detail': 'Hanya pemilik yang dapat mengubah izin role.'},
                status=status.HTTP_403_FORBIDDEN
            )

        role = request.query_params.get('role')
        if not role:
            return Response(
                {'detail': 'Parameter role diperlukan.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted, _ = DocumentAccessPermission.objects.filter(
            document=document,
            role=role
        ).delete()

        if deleted:
            return Response({'detail': 'Izin role berhasil dihapus.'})
        return Response(
            {'detail': 'Izin role tidak ditemukan.'},
            status=status.HTTP_404_NOT_FOUND
        )

    @action(detail=True, methods=['get'])
    def access_logs(self, request, pk=None):
        """Get access logs for a document."""
        document = self.get_object()
        user = request.user

        if document.owner != user and not user.is_superuser:
            return Response(
                {'detail': 'Hanya pemilik yang dapat melihat log akses.'},
                status=status.HTTP_403_FORBIDDEN
            )

        logs = document.access_logs.all()[:100]  # Last 100 logs
        serializer = DocumentAccessLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_documents(self, request):
        """Get documents owned by current user."""
        documents = self.get_queryset().filter(owner=request.user)
        serializer = DocumentListSerializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def shared_with_me(self, request):
        """Get documents shared with current user."""
        documents = Document.objects.filter(
            is_active=True,
            user_access__user=request.user,
            user_access__can_read=True,
        ).exclude(owner=request.user)
        serializer = DocumentListSerializer(documents, many=True)
        return Response(serializer.data)


class DocumentAccessLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing document access logs (admin only)."""
    queryset = DocumentAccessLog.objects.all()
    serializer_class = DocumentAccessLogSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['document', 'user', 'action', 'success']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
