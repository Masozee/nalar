from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from apps.users.models import User
from .models import (
    Folder, Document, DocumentAccessPermission,
    DocumentUserAccess, DocumentAccessLog,
    AccessLevel, DocumentCategory, DocumentStatus, DocumentRole,
)
from .encryption import encrypt_file, decrypt_file, encrypt_file_to_base64, decrypt_file_from_base64


class EncryptionTest(TestCase):
    """Tests for AES-256-GCM encryption utilities."""

    def test_encrypt_decrypt_file(self):
        """Test basic encryption/decryption cycle."""
        original_data = b"This is a test document content."
        encrypted_data, nonce = encrypt_file(original_data)

        # Encrypted data should be different from original
        self.assertNotEqual(encrypted_data, original_data)

        # Decrypt and verify
        decrypted_data = decrypt_file(encrypted_data, nonce)
        self.assertEqual(decrypted_data, original_data)

    def test_encrypt_decrypt_base64(self):
        """Test base64 encryption/decryption cycle."""
        original_data = b"Test content for base64 encryption."
        result = encrypt_file_to_base64(original_data)

        self.assertIn('data', result)
        self.assertIn('nonce', result)

        decrypted_data = decrypt_file_from_base64(result['data'], result['nonce'])
        self.assertEqual(decrypted_data, original_data)

    def test_different_nonce_each_encryption(self):
        """Test that each encryption produces different nonce."""
        data = b"Same data"
        _, nonce1 = encrypt_file(data)
        _, nonce2 = encrypt_file(data)

        self.assertNotEqual(nonce1, nonce2)


class FolderModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )

    def test_create_folder(self):
        folder = Folder.objects.create(
            name='Documents',
            owner=self.user,
            access_level=AccessLevel.INTERNAL,
        )
        self.assertEqual(str(folder), 'Documents')
        self.assertTrue(folder.is_active)

    def test_folder_hierarchy(self):
        parent = Folder.objects.create(name='Root', owner=self.user)
        child = Folder.objects.create(name='Subfolder', parent=parent, owner=self.user)

        self.assertEqual(child.parent, parent)
        self.assertIn(child, parent.children.all())
        self.assertEqual(child.get_full_path(), 'Root/Subfolder')


class DocumentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.folder = Folder.objects.create(
            name='Test Folder',
            owner=self.user,
        )

    def test_create_document(self):
        doc = Document.objects.create(
            title='Test Document',
            description='A test document',
            category=DocumentCategory.POLICY,
            status=DocumentStatus.DRAFT,
            original_filename='test.pdf',
            owner=self.user,
            folder=self.folder,
        )
        self.assertEqual(str(doc), 'Test Document')
        self.assertTrue(doc.is_active)

    def test_document_encryption(self):
        doc = Document(
            title='Encrypted Doc',
            category=DocumentCategory.CONTRACT,
            owner=self.user,
            is_encrypted=True,
        )
        original_content = b"Sensitive contract data"
        doc.save_encrypted_file(original_content, 'contract.pdf')
        doc.save()

        # Verify nonce was stored
        self.assertTrue(len(doc.encryption_nonce) > 0)

        # Verify we can decrypt
        decrypted = doc.get_decrypted_content()
        self.assertEqual(decrypted, original_content)

    def test_document_access_owner(self):
        doc = Document.objects.create(
            title='Owner Test',
            original_filename='test.txt',
            owner=self.user,
            access_level=AccessLevel.RESTRICTED,
        )
        self.assertTrue(doc.can_user_access(self.user))

    def test_document_access_public(self):
        other_user = User.objects.create_user(
            username='other',
            email='other@test.com',
            password='testpass123',
        )
        doc = Document.objects.create(
            title='Public Doc',
            original_filename='public.txt',
            owner=self.user,
            access_level=AccessLevel.PUBLIC,
        )
        self.assertTrue(doc.can_user_access(other_user))

    def test_document_access_internal(self):
        other_user = User.objects.create_user(
            username='other',
            email='other@test.com',
            password='testpass123',
        )
        doc = Document.objects.create(
            title='Internal Doc',
            original_filename='internal.txt',
            owner=self.user,
            access_level=AccessLevel.INTERNAL,
        )
        self.assertTrue(doc.can_user_access(other_user))


class DocumentAccessPermissionTest(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username='owner',
            email='owner@test.com',
            password='testpass123',
        )
        self.other_user = User.objects.create_user(
            username='other',
            email='other@test.com',
            password='testpass123',
        )
        self.doc = Document.objects.create(
            title='Confidential Doc',
            original_filename='confidential.txt',
            owner=self.owner,
            access_level=AccessLevel.CONFIDENTIAL,
        )

    def test_role_based_access(self):
        # Initially, other user shouldn't have access
        self.assertFalse(self.doc.can_user_access(self.other_user))

        # Grant HR role access
        DocumentAccessPermission.objects.create(
            document=self.doc,
            role=DocumentRole.STAFF,
            can_read=True,
        )

        # Now should have access (staff is default role)
        self.assertTrue(self.doc.can_user_access(self.other_user))

    def test_user_specific_access(self):
        # Grant user-specific access
        DocumentUserAccess.objects.create(
            document=self.doc,
            user=self.other_user,
            granted_by=self.owner,
            can_read=True,
            can_download=True,
        )

        self.assertTrue(self.doc.can_user_access(self.other_user))


class DocumentAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='adminpass123',
        )
        self.folder = Folder.objects.create(
            name='API Test Folder',
            owner=self.admin,
        )

    def test_list_folders(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:folder-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_folder(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:folder-list')
        data = {
            'name': 'My Folder',
            'access_level': AccessLevel.INTERNAL,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'My Folder')

    def test_folder_tree(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('api_v1:folder-tree')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_upload_document(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:document-list')

        file_content = b'Test document content for upload.'
        uploaded_file = SimpleUploadedFile(
            'test_document.txt',
            file_content,
            content_type='text/plain'
        )

        data = {
            'title': 'Uploaded Document',
            'description': 'Test upload',
            'category': DocumentCategory.REPORT,
            'file': uploaded_file,
            'is_encrypted': True,
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify document was created
        doc = Document.objects.get(title='Uploaded Document')
        self.assertTrue(doc.is_encrypted)
        self.assertTrue(len(doc.encryption_nonce) > 0)

    def test_my_documents(self):
        self.client.force_authenticate(user=self.user)

        # Create a document owned by user
        Document.objects.create(
            title='My Doc',
            original_filename='my.txt',
            owner=self.user,
        )

        url = reverse('api_v1:document-my-documents')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_grant_access(self):
        self.client.force_authenticate(user=self.admin)

        doc = Document.objects.create(
            title='Share Test',
            original_filename='share.txt',
            owner=self.admin,
            access_level=AccessLevel.CONFIDENTIAL,
        )

        url = reverse('api_v1:document-grant-access', kwargs={'pk': doc.id})
        data = {
            'user_id': str(self.user.id),
            'can_read': True,
            'can_download': True,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify access was granted
        self.assertTrue(
            DocumentUserAccess.objects.filter(
                document=doc,
                user=self.user,
                can_read=True,
                can_download=True,
            ).exists()
        )

    def test_set_role_permission(self):
        self.client.force_authenticate(user=self.admin)

        doc = Document.objects.create(
            title='Role Test',
            original_filename='role.txt',
            owner=self.admin,
        )

        url = reverse('api_v1:document-set-role-permission', kwargs={'pk': doc.id})
        data = {
            'role': DocumentRole.HR,
            'can_read': True,
            'can_download': True,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify permission was set
        self.assertTrue(
            DocumentAccessPermission.objects.filter(
                document=doc,
                role=DocumentRole.HR,
                can_read=True,
            ).exists()
        )

    def test_access_denied_confidential(self):
        self.client.force_authenticate(user=self.user)

        # Admin creates confidential doc
        doc = Document.objects.create(
            title='Secret',
            original_filename='secret.txt',
            owner=self.admin,
            access_level=AccessLevel.CONFIDENTIAL,
        )

        url = reverse('api_v1:document-detail', kwargs={'pk': doc.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class FolderAPITest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='adminpass123',
        )
        self.parent = Folder.objects.create(name='Parent', owner=self.admin)
        Folder.objects.create(name='Child 1', parent=self.parent, owner=self.admin)
        Folder.objects.create(name='Child 2', parent=self.parent, owner=self.admin)

    def test_folder_tree_structure(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('api_v1:folder-tree')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # One root
        self.assertEqual(len(response.data[0]['children']), 2)  # Two children
