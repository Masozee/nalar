"""
Seed command for Documents module.
"""
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from apps.users.models import User
from apps.documents.models import (
    Folder, Document, DocumentAccessPermission,
    AccessLevel, DocumentCategory, DocumentStatus, DocumentRole,
)


class Command(BaseCommand):
    help = 'Seed Documents with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Documents...')

        # Get or create admin user
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@nalar.id',
                password='admin123',
            )
            self.stdout.write('  Created admin user')

        # Create folder structure
        folders_data = [
            {'name': 'Kebijakan', 'access_level': AccessLevel.INTERNAL},
            {'name': 'Prosedur', 'access_level': AccessLevel.INTERNAL},
            {'name': 'Kontrak', 'access_level': AccessLevel.CONFIDENTIAL},
            {'name': 'Laporan', 'access_level': AccessLevel.INTERNAL},
            {'name': 'HR', 'access_level': AccessLevel.CONFIDENTIAL},
            {'name': 'Finance', 'access_level': AccessLevel.RESTRICTED},
            {'name': 'Legal', 'access_level': AccessLevel.RESTRICTED},
            {'name': 'Public', 'access_level': AccessLevel.PUBLIC},
        ]

        folders = {}
        for data in folders_data:
            folder, created = Folder.objects.get_or_create(
                name=data['name'],
                parent=None,
                defaults={
                    'owner': admin,
                    'access_level': data['access_level'],
                }
            )
            folders[data['name']] = folder
            if created:
                self.stdout.write(f'  Created folder: {folder.name}')

        # Create subfolders
        subfolders_data = [
            {'name': 'SOP', 'parent': 'Prosedur'},
            {'name': 'Instruksi Kerja', 'parent': 'Prosedur'},
            {'name': 'Kontrak Vendor', 'parent': 'Kontrak'},
            {'name': 'Kontrak Karyawan', 'parent': 'Kontrak'},
            {'name': 'Laporan Bulanan', 'parent': 'Laporan'},
            {'name': 'Laporan Tahunan', 'parent': 'Laporan'},
            {'name': 'Rekrutmen', 'parent': 'HR'},
            {'name': 'Payroll', 'parent': 'HR'},
        ]

        for data in subfolders_data:
            parent = folders.get(data['parent'])
            if parent:
                subfolder, created = Folder.objects.get_or_create(
                    name=data['name'],
                    parent=parent,
                    defaults={
                        'owner': admin,
                        'access_level': parent.access_level,
                    }
                )
                if created:
                    self.stdout.write(f'  Created subfolder: {subfolder.get_full_path()}')

        # Create sample documents
        documents_data = [
            {
                'title': 'Kebijakan Keamanan Informasi',
                'description': 'Kebijakan tentang keamanan informasi dan data perusahaan.',
                'category': DocumentCategory.POLICY,
                'status': DocumentStatus.PUBLISHED,
                'access_level': AccessLevel.INTERNAL,
                'folder': folders.get('Kebijakan'),
                'content': b'Kebijakan Keamanan Informasi\n\n1. Pendahuluan\n2. Ruang Lingkup\n3. Kebijakan\n4. Tanggung Jawab',
            },
            {
                'title': 'SOP Pengadaan Barang',
                'description': 'Prosedur standar untuk pengadaan barang dan jasa.',
                'category': DocumentCategory.PROCEDURE,
                'status': DocumentStatus.PUBLISHED,
                'access_level': AccessLevel.INTERNAL,
                'folder': folders.get('Prosedur'),
                'content': b'SOP Pengadaan Barang\n\n1. Tujuan\n2. Prosedur\n3. Formulir Terkait',
            },
            {
                'title': 'Template Kontrak Vendor',
                'description': 'Template standar untuk kontrak dengan vendor.',
                'category': DocumentCategory.CONTRACT,
                'status': DocumentStatus.APPROVED,
                'access_level': AccessLevel.CONFIDENTIAL,
                'folder': folders.get('Kontrak'),
                'content': b'PERJANJIAN KERJASAMA\n\nPara pihak:\n1. Pihak Pertama\n2. Pihak Kedua',
                'roles': [DocumentRole.LEGAL, DocumentRole.FINANCE],
            },
            {
                'title': 'Laporan Keuangan Q3 2024',
                'description': 'Laporan keuangan kuartal 3 tahun 2024.',
                'category': DocumentCategory.REPORT,
                'status': DocumentStatus.PUBLISHED,
                'access_level': AccessLevel.RESTRICTED,
                'folder': folders.get('Finance'),
                'content': b'Laporan Keuangan Q3 2024\n\nPendapatan: Rp xxx\nBeban: Rp xxx\nLaba: Rp xxx',
                'roles': [DocumentRole.FINANCE, DocumentRole.EXECUTIVE],
            },
            {
                'title': 'Manual Karyawan Baru',
                'description': 'Panduan untuk karyawan baru.',
                'category': DocumentCategory.MANUAL,
                'status': DocumentStatus.PUBLISHED,
                'access_level': AccessLevel.INTERNAL,
                'folder': folders.get('HR'),
                'content': b'Manual Karyawan Baru\n\n1. Selamat Datang\n2. Visi Misi\n3. Struktur Organisasi',
            },
            {
                'title': 'Formulir Cuti',
                'description': 'Formulir pengajuan cuti karyawan.',
                'category': DocumentCategory.FORM,
                'status': DocumentStatus.PUBLISHED,
                'access_level': AccessLevel.PUBLIC,
                'folder': folders.get('Public'),
                'content': b'FORMULIR PENGAJUAN CUTI\n\nNama:\nNIK:\nTanggal Cuti:\nAlasan:',
            },
            {
                'title': 'Kebijakan WFH',
                'description': 'Kebijakan Work From Home.',
                'category': DocumentCategory.POLICY,
                'status': DocumentStatus.PUBLISHED,
                'access_level': AccessLevel.INTERNAL,
                'folder': folders.get('Kebijakan'),
                'content': b'Kebijakan WFH\n\n1. Ketentuan\n2. Prosedur\n3. Pelaporan',
            },
            {
                'title': 'Memo Internal - Libur Lebaran',
                'description': 'Pengumuman libur lebaran 2024.',
                'category': DocumentCategory.MEMO,
                'status': DocumentStatus.PUBLISHED,
                'access_level': AccessLevel.INTERNAL,
                'folder': None,
                'content': b'MEMO INTERNAL\n\nPerihal: Libur Lebaran 2024\n\nDiberitahukan bahwa...',
            },
            {
                'title': 'NDA Template',
                'description': 'Non-Disclosure Agreement template.',
                'category': DocumentCategory.CONTRACT,
                'status': DocumentStatus.APPROVED,
                'access_level': AccessLevel.CONFIDENTIAL,
                'folder': folders.get('Legal'),
                'content': b'NON-DISCLOSURE AGREEMENT\n\nThis Agreement...',
                'roles': [DocumentRole.LEGAL, DocumentRole.HR],
            },
            {
                'title': 'Laporan Audit Internal 2024',
                'description': 'Hasil audit internal tahun 2024.',
                'category': DocumentCategory.REPORT,
                'status': DocumentStatus.DRAFT,
                'access_level': AccessLevel.RESTRICTED,
                'folder': folders.get('Finance'),
                'content': b'LAPORAN AUDIT INTERNAL\n\nTemuan:\n1. ...\n2. ...',
                'roles': [DocumentRole.EXECUTIVE, DocumentRole.FINANCE],
            },
        ]

        for data in documents_data:
            roles = data.pop('roles', [])
            content = data.pop('content')

            doc, created = Document.objects.get_or_create(
                title=data['title'],
                defaults={
                    'description': data['description'],
                    'category': data['category'],
                    'status': data['status'],
                    'access_level': data['access_level'],
                    'folder': data['folder'],
                    'owner': admin,
                    'created_by': admin,
                    'updated_by': admin,
                    'is_encrypted': True,
                    'original_filename': f"{data['title'].lower().replace(' ', '_')}.txt",
                }
            )

            if created:
                # Encrypt and save content
                doc.save_encrypted_file(content, doc.original_filename)
                doc.save()
                self.stdout.write(f'  Created document: {doc.title}')

                # Add role permissions for confidential/restricted docs
                for role in roles:
                    DocumentAccessPermission.objects.create(
                        document=doc,
                        role=role,
                        can_read=True,
                        can_download=True,
                    )

        self.stdout.write(self.style.SUCCESS('Documents seeded successfully!'))
