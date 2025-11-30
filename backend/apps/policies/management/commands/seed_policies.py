from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.policies.models import PolicyCategory, Policy, PolicyApproval
from apps.users.models import User
from apps.organization.models import Department
import os
from django.core.files.base import ContentFile


class Command(BaseCommand):
    help = 'Seed office policies in Bahasa Indonesia'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding office policies...')

        # Create or get directors
        executive_director = self.get_or_create_director(
            'executive.director@example.com',
            'Executive Director',
            'Dr. Budi Santoso'
        )

        operations_director = self.get_or_create_director(
            'operations.director@example.com',
            'Director of Operations',
            'Ibu Siti Rahayu'
        )

        # Create policy categories
        categories = self.create_categories()

        # Create policies for each category
        self.create_policies(categories, executive_director, operations_director)

        self.stdout.write(self.style.SUCCESS('Successfully seeded office policies'))

    def get_or_create_director(self, email, title, full_name):
        """Get or create a director user"""
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'first_name': full_name.split()[0] if ' ' in full_name else full_name,
                'last_name': ' '.join(full_name.split()[1:]) if ' ' in full_name else '',
                'is_active': True,
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            self.stdout.write(f'Created director: {full_name}')
        return user

    def create_categories(self):
        """Create policy categories"""
        categories_data = [
            {
                'name': 'Kebijakan Umum',
                'description': 'Kebijakan umum perusahaan dan tata kelola',
                'order': 1
            },
            {
                'name': 'Kehadiran dan Cuti',
                'description': 'Kebijakan terkait kehadiran, absensi, dan cuti karyawan',
                'order': 2
            },
            {
                'name': 'Kode Etik',
                'description': 'Kode etik dan perilaku karyawan',
                'order': 3
            },
            {
                'name': 'Keamanan Informasi',
                'description': 'Kebijakan keamanan data dan informasi',
                'order': 4
            },
            {
                'name': 'Kesehatan dan Keselamatan Kerja',
                'description': 'Kebijakan K3 di tempat kerja',
                'order': 5
            },
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = PolicyCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'order': cat_data['order']
                }
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'Created category: {cat_data["name"]}')

        return categories

    def create_policies(self, categories, exec_director, ops_director):
        """Create sample policies"""
        policies_data = [
            {
                'category': 'Kebijakan Umum',
                'title': 'Kebijakan Jam Kerja',
                'description': 'Peraturan mengenai jam kerja, istirahat, dan lembur',
                'content': '''
# Kebijakan Jam Kerja

## 1. Tujuan
Kebijakan ini mengatur jam kerja karyawan untuk memastikan produktivitas dan keseimbangan kehidupan kerja.

## 2. Jam Kerja Normal
- Senin - Jumat: 08:00 - 17:00 WIB
- Istirahat makan siang: 12:00 - 13:00 WIB
- Total jam kerja: 8 jam per hari, 40 jam per minggu

## 3. Keterlambatan
- Toleransi keterlambatan: 15 menit
- Lebih dari 3 kali keterlambatan dalam sebulan akan diberikan teguran tertulis
- Keterlambatan akan mempengaruhi penilaian kinerja

## 4. Lembur
- Lembur harus mendapat persetujuan atasan langsung
- Kompensasi lembur sesuai dengan peraturan ketenagakerjaan
- Lembur maksimal 3 jam per hari, 14 jam per minggu

## 5. Pekerjaan di Akhir Pekan
- Pekerjaan di hari Sabtu/Minggu harus mendapat persetujuan Manajer Departemen
- Diberikan kompensasi sesuai peraturan atau cuti pengganti
                ''',
                'version': '1.0',
                'tags': ['jam-kerja', 'lembur', 'kehadiran'],
                'requires_acknowledgment': True,
            },
            {
                'category': 'Kehadiran dan Cuti',
                'title': 'Kebijakan Cuti Tahunan',
                'description': 'Peraturan mengenai hak cuti tahunan karyawan',
                'content': '''
# Kebijakan Cuti Tahunan

## 1. Hak Cuti
- Karyawan berhak atas 12 hari kerja cuti tahunan per tahun
- Hak cuti diberikan setelah karyawan bekerja minimal 12 bulan berturut-turut
- Cuti yang tidak digunakan dapat dibawa ke tahun berikutnya (maksimal 6 hari)

## 2. Pengajuan Cuti
- Cuti harus diajukan minimal 3 hari kerja sebelumnya
- Pengajuan cuti melalui sistem HRIS
- Persetujuan dari atasan langsung diperlukan

## 3. Cuti Darurat
- Untuk keadaan darurat, cuti dapat diajukan dengan pemberitahuan segera
- Bukti pendukung harus diserahkan maksimal 3 hari setelah kembali bekerja

## 4. Cuti Bersama
- Cuti bersama mengikuti kalender pemerintah
- Tidak mengurangi jatah cuti tahunan karyawan

## 5. Pembatalan Cuti
- Perusahaan berhak membatalkan cuti yang sudah disetujui dalam kondisi mendesak
- Karyawan akan diberitahu minimal 24 jam sebelumnya
                ''',
                'version': '1.0',
                'tags': ['cuti', 'annual-leave', 'hris'],
                'requires_acknowledgment': True,
            },
            {
                'category': 'Kode Etik',
                'title': 'Kode Etik Karyawan',
                'description': 'Standar perilaku dan etika untuk semua karyawan',
                'content': '''
# Kode Etik Karyawan

## 1. Integritas
- Bersikap jujur dalam semua aspek pekerjaan
- Tidak menerima suap atau gratifikasi dalam bentuk apapun
- Melaporkan pelanggaran yang diketahui

## 2. Profesionalisme
- Berpakaian rapi dan sopan sesuai dengan ketentuan perusahaan
- Berkomunikasi dengan santun kepada rekan kerja dan klien
- Menghormati privasi dan kerahasiaan informasi

## 3. Konflik Kepentingan
- Menghindari situasi yang dapat menimbulkan konflik kepentingan
- Melaporkan kepada atasan jika terdapat potensi konflik kepentingan
- Tidak menggunakan posisi untuk keuntungan pribadi

## 4. Penggunaan Aset Perusahaan
- Aset perusahaan hanya digunakan untuk kepentingan pekerjaan
- Menjaga dan merawat aset perusahaan dengan baik
- Tidak menggunakan aset perusahaan untuk kepentingan pribadi tanpa izin

## 5. Kesetaraan dan Penghormatan
- Menghormati keberagaman di tempat kerja
- Tidak melakukan diskriminasi, pelecehan, atau intimidasi
- Menciptakan lingkungan kerja yang inklusif dan positif

## 6. Kerahasiaan
- Menjaga kerahasiaan informasi perusahaan dan klien
- Tidak membocorkan informasi rahasia kepada pihak ketiga
- Mengikuti protokol keamanan informasi yang ditetapkan
                ''',
                'version': '1.0',
                'tags': ['kode-etik', 'integritas', 'profesionalisme'],
                'requires_acknowledgment': True,
            },
            {
                'category': 'Keamanan Informasi',
                'title': 'Kebijakan Keamanan Data',
                'description': 'Peraturan mengenai perlindungan data dan informasi perusahaan',
                'content': '''
# Kebijakan Keamanan Data

## 1. Klasifikasi Data
- **Publik**: Informasi yang dapat dibagikan secara bebas
- **Internal**: Informasi untuk penggunaan internal perusahaan
- **Rahasia**: Informasi sensitif yang hanya untuk pihak tertentu
- **Sangat Rahasia**: Informasi kritis yang memerlukan proteksi tinggi

## 2. Penggunaan Password
- Password minimal 12 karakter dengan kombinasi huruf, angka, dan simbol
- Password harus diganti setiap 90 hari
- Tidak menggunakan password yang sama untuk akun yang berbeda
- Tidak membagikan password kepada siapapun

## 3. Akses Data
- Akses data berdasarkan prinsip need-to-know
- Persetujuan dari manajer diperlukan untuk akses data rahasia
- Akses akan dicabut jika karyawan berpindah posisi atau resign

## 4. Email dan Komunikasi
- Email perusahaan hanya untuk keperluan bisnis
- Tidak membuka lampiran dari pengirim yang tidak dikenal
- Berhati-hati dengan email phishing dan social engineering

## 5. Perangkat Mobile
- Perangkat yang mengakses data perusahaan harus memiliki password/PIN
- Tidak menyimpan data rahasia di perangkat pribadi
- Melaporkan segera jika perangkat hilang atau dicuri

## 6. Insiden Keamanan
- Melaporkan segera setiap insiden keamanan ke IT Security
- Tidak mencoba menangani sendiri insiden keamanan
- Bekerjasama dalam investigasi insiden keamanan
                ''',
                'version': '1.0',
                'tags': ['keamanan', 'data', 'informasi', 'cybersecurity'],
                'requires_acknowledgment': True,
            },
            {
                'category': 'Kesehatan dan Keselamatan Kerja',
                'title': 'Kebijakan K3 di Tempat Kerja',
                'description': 'Peraturan mengenai kesehatan dan keselamatan kerja',
                'content': '''
# Kebijakan Kesehatan dan Keselamatan Kerja (K3)

## 1. Tujuan
Memastikan lingkungan kerja yang aman dan sehat bagi semua karyawan.

## 2. Tanggung Jawab Karyawan
- Mematuhi semua prosedur keselamatan yang ditetapkan
- Menggunakan alat pelindung diri (APD) sesuai ketentuan
- Melaporkan kondisi tidak aman atau insiden segera

## 3. Fasilitas Kesehatan
- Klinik kesehatan tersedia di kantor dengan perawat standby
- Asuransi kesehatan untuk semua karyawan tetap
- Program medical check-up tahunan

## 4. Pencegahan Kebakaran
- Tidak merokok di dalam gedung
- Mengetahui lokasi alat pemadam kebakaran dan jalur evakuasi
- Mengikuti drill kebakaran yang diadakan secara berkala

## 5. Ergonomi
- Workstation harus diatur sesuai standar ergonomi
- Istirahat 5 menit setiap 1 jam untuk pengguna komputer
- Melaporkan keluhan terkait ergonomi ke HRD

## 6. Pelaporan Kecelakaan
- Setiap kecelakaan kerja harus dilaporkan dalam 24 jam
- Investigasi akan dilakukan untuk setiap insiden
- Tindakan perbaikan akan diimplementasikan

## 7. Lingkungan Kerja
- Menjaga kebersihan area kerja masing-masing
- Tidak membawa barang berbahaya ke tempat kerja
- Melaporkan kondisi yang dapat membahayakan keselamatan
                ''',
                'version': '1.0',
                'tags': ['k3', 'keselamatan', 'kesehatan', 'safety'],
                'requires_acknowledgment': True,
            },
        ]

        for policy_data in policies_data:
            category = categories[policy_data['category']]

            # Check if policy already exists
            if Policy.objects.filter(title=policy_data['title']).exists():
                self.stdout.write(f'Policy already exists: {policy_data["title"]}')
                continue

            # Create policy
            policy = Policy.objects.create(
                title=policy_data['title'],
                description=policy_data['description'],
                category=category,
                content=policy_data['content'],
                version=policy_data['version'],
                effective_date=timezone.now().date(),
                expiry_date=timezone.now().date() + timedelta(days=365),
                status='pending_approval',
                requires_acknowledgment=policy_data['requires_acknowledgment'],
                created_by=exec_director,
                tags=policy_data['tags'],
            )

            # Create a simple PDF-like text file for download
            file_content = f"""
KEBIJAKAN PERUSAHAAN
{policy_data['title']}
Version {policy_data['version']}

{policy_data['content']}

---
Dokumen ini bersifat rahasia dan hanya untuk penggunaan internal.
© {timezone.now().year} - All rights reserved
            """.strip()

            # Save file
            file_name = f"{policy_data['title'].replace(' ', '_').lower()}_v{policy_data['version']}.txt"
            policy.file.save(file_name, ContentFile(file_content.encode('utf-8')))
            policy.file_name = file_name
            policy.file_size = len(file_content.encode('utf-8'))
            policy.save()

            # Create approval workflow with 2 directors
            PolicyApproval.objects.create(
                policy=policy,
                approver=exec_director,
                approver_title='Executive Director',
                order=1,
                status='pending',
            )

            PolicyApproval.objects.create(
                policy=policy,
                approver=ops_director,
                approver_title='Director of Operations',
                order=2,
                status='pending',
            )

            self.stdout.write(self.style.SUCCESS(f'Created policy: {policy.title}'))
