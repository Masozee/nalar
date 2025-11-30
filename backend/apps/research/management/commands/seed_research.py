"""
Seed command for Research module.
"""
from decimal import Decimal
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
import random

from apps.research.grant_management.models import (
    Grant, GrantTeamMember, GrantMilestone, GrantDisbursement,
    GrantStatus, GrantType, FundingSource
)
from apps.research.publication.models import (
    Publication, PublicationAuthor, PublicationReview,
    PublicationType, PublicationStatus, IndexationType
)
from apps.research.project_tracking.models import (
    ResearchProject, ProjectTeamMember, ProjectTask, ProjectUpdate,
    ProjectStatus, ProjectType
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed research data (grants, publications, projects)'

    def handle(self, *args, **options):
        self.stdout.write('Seeding research data...')

        users = list(User.objects.all()[:5])
        if not users:
            user = User.objects.create_user(
                username='researcher',
                email='researcher@example.com',
                password='testpass123',
                first_name='John',
                last_name='Researcher'
            )
            users = [user]

        # Seed Grants
        grants = self._seed_grants(users)
        self.stdout.write(f'Created {len(grants)} grants')

        # Seed Publications
        pubs = self._seed_publications(users, grants)
        self.stdout.write(f'Created {len(pubs)} publications')

        # Seed Projects
        projects = self._seed_projects(users, grants)
        self.stdout.write(f'Created {len(projects)} research projects')

        self.stdout.write(self.style.SUCCESS('Research seed data created successfully!'))

    def _seed_grants(self, users):
        grant_data = [
            {
                'title': 'Pengembangan Sistem Kecerdasan Buatan untuk Diagnosis Dini Penyakit Tropis',
                'abstract': 'Penelitian ini bertujuan mengembangkan sistem berbasis AI untuk mendeteksi penyakit tropis seperti DBD, malaria, dan TB dengan akurasi tinggi menggunakan data medis Indonesia. Sistem akan diintegrasikan dengan fasilitas kesehatan primer di seluruh Indonesia.',
                'grant_type': GrantType.GOVERNMENT,
                'funding_source': FundingSource.DIKTI,
                'funder_name': 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi',
                'funder_contact': 'Direktorat Jenderal Pendidikan Tinggi, Riset, dan Teknologi\nJl. Jenderal Sudirman, Pintu Satu, Senayan, Jakarta\nTelp: (021) 5736365',
                'requested_amount': Decimal('850000000'),
                'approved_amount': Decimal('750000000'),
                'status': GrantStatus.ACTIVE,
            },
            {
                'title': 'Kajian Transisi Energi Terbarukan untuk Mencapai Net Zero Emission 2060',
                'abstract': 'Studi komprehensif mengenai strategi transisi energi Indonesia dari batu bara ke energi terbarukan, dengan fokus pada energi surya, angin, dan panas bumi. Penelitian mencakup analisis ekonomi, sosial, dan lingkungan untuk mendukung target penurunan emisi nasional.',
                'grant_type': GrantType.INTERNATIONAL,
                'funding_source': FundingSource.FOREIGN_GOV,
                'funder_name': 'Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)',
                'funder_contact': 'GIZ Indonesia\nMenara BCA Lt. 46\nJl. M.H. Thamrin No. 1, Jakarta Pusat\nTelp: (021) 2358 7111',
                'requested_amount': Decimal('1200000000'),
                'approved_amount': Decimal('1200000000'),
                'status': GrantStatus.ACTIVE,
            },
            {
                'title': 'Dampak Ekonomi Digital terhadap Transformasi UMKM di Era Pasca Pandemi',
                'abstract': 'Riset ini menganalisis bagaimana digitalisasi mengubah lanskap UMKM Indonesia, termasuk adopsi e-commerce, digital payment, dan social commerce. Penelitian melibatkan survei ke 500 UMKM di Jawa, Sumatera, dan Kalimantan untuk memahami tantangan dan peluang transformasi digital.',
                'grant_type': GrantType.PRIVATE,
                'funding_source': FundingSource.CORPORATE,
                'funder_name': 'GoTo Foundation',
                'funder_contact': 'GoTo Foundation\nPasaraya Blok M, Gedung B Lt. 6\nJl. Iskandarsyah II No. 7, Jakarta Selatan\nTelp: (021) 5080 8680',
                'requested_amount': Decimal('450000000'),
                'approved_amount': Decimal('450000000'),
                'status': GrantStatus.COMPLETED,
            },
            {
                'title': 'Penelitian dan Pengembangan Vaksin Dengue Berbasis Protein Rekombinan',
                'abstract': 'Program riset untuk mengembangkan vaksin dengue lokal menggunakan teknologi protein rekombinan. Penelitian melibatkan uji praklinis dan persiapan uji klinis fase I dengan target produksi vaksin dalam negeri untuk mengurangi ketergantungan impor.',
                'grant_type': GrantType.GOVERNMENT,
                'funding_source': FundingSource.BRIN,
                'funder_name': 'Badan Riset dan Inovasi Nasional (BRIN)',
                'funder_contact': 'Gedung BRIN, Lantai 2\nJl. M.H. Thamrin No. 8, Jakarta Pusat\nTelp: (021) 3169100',
                'requested_amount': Decimal('2500000000'),
                'approved_amount': Decimal('0'),
                'status': GrantStatus.UNDER_REVIEW,
            },
            {
                'title': 'Pengaruh Media Sosial terhadap Polarisasi Politik dan Partisipasi Pemilih Milenial',
                'abstract': 'Kajian mendalam tentang bagaimana platform media sosial membentuk opini politik generasi milenial dan Gen Z, serta dampaknya terhadap partisipasi dalam Pemilu. Penelitian menggunakan analisis big data dan survei kualitatif di 10 provinsi.',
                'grant_type': GrantType.INTERNAL,
                'funding_source': FundingSource.INTERNAL,
                'funder_name': 'Dana Riset Internal',
                'requested_amount': Decimal('180000000'),
                'approved_amount': Decimal('180000000'),
                'status': GrantStatus.APPROVED,
            },
            {
                'title': 'Strategi Mitigasi Bencana Berbasis Teknologi IoT dan Early Warning System',
                'abstract': 'Pengembangan sistem peringatan dini bencana alam menggunakan sensor IoT untuk gempa bumi, tsunami, dan banjir bandang. Sistem akan dipilot di wilayah rawan bencana di Aceh, Palu, dan Banten dengan melibatkan BMKG dan BNPB.',
                'grant_type': GrantType.PARTNERSHIP,
                'funding_source': FundingSource.FOUNDATION,
                'funder_name': 'Yayasan Tangguh Bencana Indonesia',
                'funder_contact': 'Jl. Pejaten Raya No. 45\nPasar Minggu, Jakarta Selatan\nTelp: (021) 7990 1234',
                'requested_amount': Decimal('950000000'),
                'approved_amount': Decimal('850000000'),
                'status': GrantStatus.ACTIVE,
            },
            {
                'title': 'Optimalisasi Produksi Pangan Melalui Pertanian Presisi dan Smart Farming',
                'abstract': 'Riset penerapan teknologi IoT, AI, dan drone untuk meningkatkan produktivitas pertanian padi, jagung, dan kedelai. Program melibatkan 100 petani di Jawa Tengah dan Jawa Timur sebagai pilot project dengan target peningkatan hasil panen 30%.',
                'grant_type': GrantType.GOVERNMENT,
                'funding_source': FundingSource.KEMENKES,
                'funder_name': 'Kementerian Pertanian',
                'requested_amount': Decimal('675000000'),
                'approved_amount': Decimal('0'),
                'status': GrantStatus.SUBMITTED,
            },
            {
                'title': 'Model Ekonomi Sirkular untuk Pengelolaan Sampah Plastik di Kota Besar',
                'abstract': 'Penelitian pengembangan model bisnis ekonomi sirkular untuk daur ulang sampah plastik di Jakarta, Surabaya, dan Bandung. Melibatkan bank sampah, industri daur ulang, dan pemerintah daerah untuk menciptakan ekosistem pengelolaan sampah berkelanjutan.',
                'grant_type': GrantType.PRIVATE,
                'funding_source': FundingSource.NGO,
                'funder_name': 'Indonesia Plastic Action',
                'requested_amount': Decimal('320000000'),
                'approved_amount': Decimal('0'),
                'status': GrantStatus.DRAFT,
            },
            {
                'title': 'Pengembangan Kurikulum STEAM untuk Pendidikan Dasar Berbasis Kearifan Lokal',
                'abstract': 'Riset dan pengembangan kurikulum STEAM (Science, Technology, Engineering, Arts, Mathematics) yang mengintegrasikan kearifan lokal Indonesia. Program mencakup pelatihan guru, pengembangan modul, dan pilot di 50 sekolah dasar di Indonesia Timur.',
                'grant_type': GrantType.GOVERNMENT,
                'funding_source': FundingSource.DIKTI,
                'funder_name': 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi',
                'requested_amount': Decimal('580000000'),
                'approved_amount': Decimal('520000000'),
                'status': GrantStatus.APPROVED,
            },
            {
                'title': 'Analisis Kebijakan Kesehatan Universal dan Aksesibilitas Layanan di Daerah 3T',
                'abstract': 'Studi evaluasi implementasi program JKN-KIS di daerah Terdepan, Terluar, dan Tertinggal (3T), dengan fokus pada aksesibilitas, kualitas layanan, dan kepuasan peserta. Penelitian mencakup 15 kabupaten di Papua, Maluku, dan NTT.',
                'grant_type': GrantType.GOVERNMENT,
                'funding_source': FundingSource.KEMENKES,
                'funder_name': 'Kementerian Kesehatan RI',
                'funder_contact': 'Jl. H.R. Rasuna Said Blok X5 Kav. 4-9\nKuningan, Jakarta Selatan\nTelp: (021) 5201590',
                'requested_amount': Decimal('425000000'),
                'approved_amount': Decimal('425000000'),
                'status': GrantStatus.COMPLETED,
            },
        ]

        grants = []
        for i, data in enumerate(grant_data):
            pi = users[i % len(users)]
            grant = Grant.objects.create(
                principal_investigator=pi,
                start_date=date.today() - timedelta(days=random.randint(30, 365)),
                end_date=date.today() + timedelta(days=random.randint(180, 730)),
                created_by=pi,
                **data
            )

            # Add team members
            for j, member in enumerate(random.sample(users, min(3, len(users)))):
                if member != pi:
                    GrantTeamMember.objects.create(
                        grant=grant,
                        user=member,
                        role=random.choice([GrantTeamMember.Role.CO_PI, GrantTeamMember.Role.RESEARCHER]),
                        allocation_percentage=Decimal(str(random.randint(20, 50))),
                    )

            # Add milestones
            milestone_titles = [
                'Tahap 1: Kajian Literatur dan Desain Penelitian',
                'Tahap 2: Pengumpulan dan Analisis Data',
                'Tahap 3: Penyusunan Laporan Akhir dan Publikasi'
            ]
            milestone_descriptions = [
                'Melakukan kajian literatur mendalam, menyusun kerangka teoritis, dan mendesain metodologi penelitian yang komprehensif.',
                'Mengumpulkan data primer dan sekunder, melakukan analisis data menggunakan metode kualitatif dan kuantitatif.',
                'Menyusun laporan penelitian lengkap, draft publikasi jurnal, dan rekomendasi kebijakan berdasarkan temuan penelitian.'
            ]

            for k in range(3):
                GrantMilestone.objects.create(
                    grant=grant,
                    title=milestone_titles[k],
                    description=milestone_descriptions[k],
                    due_date=grant.start_date + timedelta(days=90*(k+1)) if grant.start_date else date.today() + timedelta(days=90*(k+1)),
                    status=GrantMilestone.MilestoneStatus.COMPLETED if k == 0 else GrantMilestone.MilestoneStatus.IN_PROGRESS if k == 1 else GrantMilestone.MilestoneStatus.PENDING,
                    created_by=pi,
                )

            # Add disbursements for active/completed grants
            if grant.status in [GrantStatus.ACTIVE, GrantStatus.COMPLETED]:
                approved = grant.approved_amount
                # First disbursement (50%)
                disb1 = GrantDisbursement.objects.create(
                    grant=grant,
                    description='Pencairan Tahap I - Dana Awal Penelitian (50%)',
                    amount=approved * Decimal('0.5'),
                    status=GrantDisbursement.DisbursementStatus.DISBURSED,
                    request_date=grant.start_date or date.today(),
                    disbursement_date=grant.start_date or date.today(),
                    approved_by=random.choice(users),
                    notes='Digunakan untuk biaya persiapan penelitian, pengadaan peralatan, dan honorarium tim bulan 1-6',
                    created_by=pi,
                )

                # Second disbursement (30%)
                disb2 = GrantDisbursement.objects.create(
                    grant=grant,
                    description='Pencairan Tahap II - Dana Pelaksanaan Penelitian (30%)',
                    amount=approved * Decimal('0.3'),
                    status=GrantDisbursement.DisbursementStatus.APPROVED if grant.status == GrantStatus.ACTIVE else GrantDisbursement.DisbursementStatus.DISBURSED,
                    request_date=(grant.start_date or date.today()) + timedelta(days=90),
                    disbursement_date=(grant.start_date or date.today()) + timedelta(days=95) if grant.status == GrantStatus.COMPLETED else None,
                    approved_by=random.choice(users),
                    notes='Untuk biaya pengumpulan data, survei lapangan, dan operasional penelitian bulan 7-12',
                    created_by=pi,
                )

                # Third disbursement (20%) - only requested for active, disbursed for completed
                if grant.status == GrantStatus.ACTIVE:
                    disb3 = GrantDisbursement.objects.create(
                        grant=grant,
                        description='Pencairan Tahap III - Dana Penyelesaian dan Publikasi (20%)',
                        amount=approved * Decimal('0.2'),
                        status=GrantDisbursement.DisbursementStatus.REQUESTED,
                        request_date=date.today(),
                        notes='Untuk biaya analisis data, penyusunan laporan, dan publikasi hasil penelitian',
                        created_by=pi,
                    )
                elif grant.status == GrantStatus.COMPLETED:
                    disb3 = GrantDisbursement.objects.create(
                        grant=grant,
                        description='Pencairan Tahap III - Dana Penyelesaian dan Publikasi (20%)',
                        amount=approved * Decimal('0.2'),
                        status=GrantDisbursement.DisbursementStatus.DISBURSED,
                        request_date=(grant.start_date or date.today()) + timedelta(days=180),
                        disbursement_date=(grant.start_date or date.today()) + timedelta(days=185),
                        approved_by=random.choice(users),
                        notes='Dana telah digunakan untuk penyelesaian laporan dan publikasi di jurnal nasional/internasional',
                        created_by=pi,
                    )

            grants.append(grant)

        return grants

    def _seed_publications(self, users, grants):
        pub_data = [
            {
                'title': 'Pendekatan Deep Learning untuk Analisis Citra Medis Penyakit Tropis di Indonesia',
                'abstract': 'Penelitian ini mengembangkan model deep learning untuk mendeteksi penyakit tropis seperti DBD, malaria, dan TB dari citra medis. Model mencapai akurasi 94.2% pada dataset yang dikumpulkan dari 15 rumah sakit di Indonesia, menunjukkan potensi besar untuk implementasi di fasilitas kesehatan primer.',
                'keywords': 'deep learning, citra medis, penyakit tropis, dengue, malaria, tuberculosis, diagnosis otomatis',
                'publication_type': PublicationType.JOURNAL_ARTICLE,
                'journal_name': 'IEEE Transactions on Medical Imaging',
                'volume': '43',
                'issue': '8',
                'pages': '2845-2856',
                'status': PublicationStatus.PUBLISHED,
                'indexation': IndexationType.SCOPUS,
                'quartile': 'Q1',
                'impact_factor': Decimal('11.037'),
                'publication_date': date(2024, 3, 15),
                'year': 2024,
                'doi': '10.1109/TMI.2024.3376542',
                'issn': '0278-0062',
                'citation_count': 28,
            },
            {
                'title': 'Analisis Kebijakan Transisi Energi Terbarukan di Indonesia: Tantangan dan Peluang Menuju Net Zero 2060',
                'abstract': 'Studi ini menganalisis kebijakan energi terbarukan di Indonesia dengan membandingkan praktik terbaik dari negara ASEAN. Temuan menunjukkan bahwa Indonesia membutuhkan investasi sebesar USD 135 miliar untuk mencapai target 23% energi terbarukan pada 2025. Artikel ini memberikan rekomendasi kebijakan komprehensif untuk akselerasi transisi energi.',
                'keywords': 'energi terbarukan, transisi energi, net zero, kebijakan energi, Indonesia, ASEAN, dekarbonisasi',
                'publication_type': PublicationType.JOURNAL_ARTICLE,
                'journal_name': 'Energy Policy',
                'volume': '189',
                'pages': '114098',
                'status': PublicationStatus.PUBLISHED,
                'indexation': IndexationType.SCOPUS,
                'quartile': 'Q1',
                'impact_factor': Decimal('9.0'),
                'publication_date': date(2024, 5, 20),
                'year': 2024,
                'doi': '10.1016/j.enpol.2024.114098',
                'issn': '0301-4215',
                'citation_count': 15,
            },
            {
                'title': 'Transformasi Digital UMKM Indonesia: Studi Empiris pada 500 Usaha Mikro di Era Pasca Pandemi',
                'abstract': 'Paper ini mempresentasikan hasil survei terhadap 500 UMKM di Jawa, Sumatera, dan Kalimantan mengenai adopsi teknologi digital. Temuan menunjukkan 67% UMKM telah mengadopsi minimal satu platform digital, namun hanya 23% yang menggunakan digital payment secara konsisten. Penelitian mengidentifikasi lima faktor kunci keberhasilan transformasi digital UMKM.',
                'keywords': 'UMKM, transformasi digital, e-commerce, digital payment, Indonesia, COVID-19, ekonomi digital',
                'publication_type': PublicationType.CONFERENCE_PAPER,
                'journal_name': 'International Conference on Social and Economic Development (ICSED) 2024',
                'publisher': 'IEEE',
                'status': PublicationStatus.PUBLISHED,
                'indexation': IndexationType.SCOPUS,
                'publication_date': date(2024, 7, 10),
                'year': 2024,
                'doi': '10.1109/ICSED60654.2024.10201456',
                'citation_count': 7,
            },
            {
                'title': 'Roadmap Ekonomi Hijau Indonesia 2045: Strategi Menuju Ekonomi Berkelanjutan',
                'abstract': 'Policy brief ini menyajikan roadmap komprehensif untuk mengintegrasikan prinsip ekonomi hijau dalam perencanaan pembangunan nasional. Dokumen mencakup rekomendasi kebijakan fiskal, insentif investasi hijau, dan reformasi regulasi untuk mendukung transisi ke ekonomi berkelanjutan. Disusun berdasarkan konsultasi dengan 50 stakeholder dari pemerintah, industri, dan masyarakat sipil.',
                'keywords': 'ekonomi hijau, pembangunan berkelanjutan, Indonesia 2045, kebijakan lingkungan, green jobs',
                'publication_type': PublicationType.POLICY_BRIEF,
                'publisher': 'Institut Kebijakan Publik Indonesia',
                'status': PublicationStatus.PUBLISHED,
                'indexation': IndexationType.NON_INDEXED,
                'publication_date': date(2024, 8, 1),
                'year': 2024,
                'url': 'https://ikpi.id/publications/roadmap-ekonomi-hijau-2045',
            },
            {
                'title': 'Optimalisasi Model Machine Learning untuk Prediksi Curah Hujan Ekstrem di Indonesia',
                'abstract': 'Penelitian ini mengembangkan model ensemble machine learning yang mengintegrasikan LSTM, Random Forest, dan Gradient Boosting untuk memprediksi kejadian curah hujan ekstrem dengan lead time 7 hari. Model dilatih menggunakan data historis 30 tahun dari BMKG dan mencapai akurasi prediksi 87%, jauh lebih tinggi dari model konvensional (72%). Implementasi operasional sedang dikaji bersama BMKG.',
                'keywords': 'machine learning, prediksi cuaca, curah hujan ekstrem, LSTM, early warning system, Indonesia',
                'publication_type': PublicationType.JOURNAL_ARTICLE,
                'journal_name': 'Weather and Forecasting',
                'status': PublicationStatus.IN_REVIEW,
                'indexation': IndexationType.SCOPUS,
                'submission_date': date(2024, 9, 15),
            },
            {
                'title': 'Dinamika Partisipasi Politik Generasi Z di Media Sosial: Studi Kasus Pemilu 2024',
                'abstract': 'Studi kualitatif dan kuantitatif mengenai bagaimana Gen Z menggunakan TikTok, Instagram, dan Twitter untuk terlibat dalam diskusi politik menjelang Pemilu 2024. Penelitian menganalisis 50,000 posting media sosial dan melakukan wawancara mendalam dengan 60 pemilih muda di 10 provinsi. Temuan awal menunjukkan pola partisipasi politik yang berbeda signifikan dari generasi sebelumnya.',
                'keywords': 'media sosial, partisipasi politik, generasi Z, pemilu, TikTok, political engagement',
                'publication_type': PublicationType.JOURNAL_ARTICLE,
                'journal_name': 'Political Communication',
                'status': PublicationStatus.REVISION,
                'indexation': IndexationType.SCOPUS,
                'submission_date': date(2024, 6, 20),
            },
            {
                'title': 'Implementasi Teknologi Blockchain untuk Transparansi Rantai Pasok Komoditas Pertanian',
                'abstract': 'Draft artikel mengenai penerapan blockchain untuk meningkatkan transparansi dan efisiensi rantai pasok kopi, kakao, dan rempah-rempah dari petani hingga konsumen. Pilot project dilakukan di Aceh dan Sulawesi Selatan dengan melibatkan 200 petani dan 15 eksportir. Sistem berhasil mengurangi biaya transaksi 23% dan meningkatkan pendapatan petani 18%.',
                'keywords': 'blockchain, rantai pasok, pertanian, kopi, transparansi, smart contract, traceability',
                'publication_type': PublicationType.JOURNAL_ARTICLE,
                'journal_name': 'Computers and Electronics in Agriculture',
                'status': PublicationStatus.DRAFT,
                'indexation': IndexationType.SCOPUS,
            },
            {
                'title': 'Kajian Efektivitas Program JKN-KIS di Daerah Terpencil, Tertinggal, dan Terluar (3T)',
                'abstract': 'Laporan penelitian evaluasi implementasi JKN-KIS di 15 kabupaten 3T di Papua, Maluku, dan NTT. Studi menemukan 45% masyarakat di daerah 3T masih menghadapi hambatan akses ke fasilitas kesehatan, terutama akibat infrastruktur transportasi dan distribusi tenaga kesehatan. Rekomendasi mencakup program dokter flying, telemedicine, dan insentif khusus tenaga kesehatan.',
                'keywords': 'JKN-KIS, daerah 3T, aksesibilitas kesehatan, Papua, Maluku, NTT, universal health coverage',
                'publication_type': PublicationType.REPORT,
                'publisher': 'Kementerian Kesehatan RI',
                'status': PublicationStatus.PUBLISHED,
                'indexation': IndexationType.NON_INDEXED,
                'publication_date': date(2024, 11, 5),
                'year': 2024,
            },
            {
                'title': 'Pengembangan Sistem Early Warning Tsunami Berbasis IoT untuk Wilayah Pesisir Indonesia',
                'abstract': 'Working paper mengenai desain dan implementasi sistem peringatan dini tsunami menggunakan sensor IoT, AI, dan komunikasi satelit. Sistem dikembangkan untuk 50 titik lokasi rawan tsunami di Aceh, Bengkulu, Lampung, dan Nias dengan respons time 3-5 menit setelah gempa. Kolaborasi dengan BMKG, BNPB, dan pemerintah daerah.',
                'keywords': 'tsunami, early warning system, IoT, disaster mitigation, Indonesia, AI, sensor network',
                'publication_type': PublicationType.WORKING_PAPER,
                'publisher': 'Working Paper Series Institute for Disaster Studies',
                'status': PublicationStatus.PUBLISHED,
                'indexation': IndexationType.NON_INDEXED,
                'publication_date': date(2024, 10, 1),
                'year': 2024,
                'url': 'https://ids.ac.id/wp/2024/10-tsunami-ews',
            },
        ]

        pubs = []
        for i, data in enumerate(pub_data):
            grant = grants[i % len(grants)] if grants else None
            pub = Publication.objects.create(
                grant=grant,
                created_by=users[i % len(users)],
                **data
            )

            # Add authors
            author_count = random.randint(2, 4)
            affiliations = [
                'Pusat Riset Kebijakan Publik dan Teknologi, Jakarta',
                'Lembaga Ilmu Pengetahuan Indonesia (LIPI)',
                'Universitas Indonesia, Fakultas Teknik',
                'Institut Teknologi Bandung, Sekolah Teknik Elektro dan Informatika',
                'Universitas Gadjah Mada, Fakultas Ilmu Sosial dan Politik',
            ]
            for j in range(author_count):
                user = users[j % len(users)]
                PublicationAuthor.objects.create(
                    publication=pub,
                    user=user,
                    author_type=PublicationAuthor.AuthorType.INTERNAL,
                    order=j + 1,
                    is_corresponding=(j == 0),
                    affiliation=affiliations[j % len(affiliations)],
                )

            pubs.append(pub)

        return pubs

    def _seed_projects(self, users, grants):
        project_data = [
            {
                'title': 'Platform Diagnostik Medis Berbasis Kecerdasan Buatan untuk Puskesmas',
                'description': 'Pengembangan platform AI untuk mendukung tenaga medis di puskesmas dalam mendiagnosis penyakit umum seperti DBD, TB, dan pneumonia. Platform mengintegrasikan analisis citra medis, data lab, dan rekam medis elektronik.',
                'objectives': 'Meningkatkan akurasi diagnosis di fasilitas kesehatan primer, mengurangi beban dokter spesialis, dan mempercepat waktu diagnosis dari 2-3 hari menjadi kurang dari 1 jam',
                'methodology': 'Menggunakan deep learning (CNN dan ResNet) dengan dataset 50,000 kasus medis dari 30 puskesmas di Jawa dan Sumatera. Implementasi menggunakan TensorFlow dan deployment via cloud dan edge computing',
                'project_type': ProjectType.APPLIED_RESEARCH,
                'status': ProjectStatus.ACTIVE,
                'budget': Decimal('425000000'),
                'spent': Decimal('276250000'),
                'progress_percentage': 65,
                'research_area': 'Teknologi Kesehatan dan AI',
                'tags': 'AI, kesehatan, diagnostik, puskesmas, deep learning, computer vision',
            },
            {
                'title': 'Roadmap Transisi Energi Indonesia 2025-2060: Kajian Kebijakan dan Ekonomi',
                'description': 'Penelitian komprehensif untuk menyusun roadmap transisi energi dari batu bara ke energi terbarukan dengan mempertimbangkan aspek ekonomi, sosial, lingkungan, dan geopolitik',
                'objectives': 'Menghasilkan rekomendasi kebijakan konkret untuk mencapai 23% energi terbarukan pada 2025 dan net-zero emission pada 2060, dengan mempertimbangkan dampak ekonomi dan sosial bagi masyarakat di daerah pertambangan',
                'methodology': 'Analisis ekonometrik, pemodelan energi (LEAP dan TIMES), konsultasi stakeholder, studi banding 8 negara ASEAN, dan cost-benefit analysis',
                'project_type': ProjectType.POLICY_RESEARCH,
                'status': ProjectStatus.ACTIVE,
                'budget': Decimal('520000000'),
                'spent': Decimal('208000000'),
                'progress_percentage': 40,
                'research_area': 'Kebijakan Energi dan Lingkungan',
                'tags': 'energi terbarukan, transisi energi, kebijakan, net zero, batu bara, solar, wind',
            },
            {
                'title': 'Indeks Kesiapan Digital UMKM Indonesia 2024',
                'description': 'Pengembangan indeks untuk mengukur tingkat kesiapan digital UMKM di Indonesia, mencakup adopsi teknologi, kemampuan SDM, infrastruktur digital, dan integrasi e-commerce',
                'objectives': 'Menciptakan framework pengukuran standar kesiapan digital UMKM yang dapat digunakan oleh pemerintah daerah, perbankan, dan lembaga pemberdayaan UMKM untuk merancang program yang tepat sasaran',
                'methodology': 'Survei terhadap 2,000 UMKM di 20 provinsi, analisis faktor, validasi instrumen, dan pembobotan menggunakan Analytic Hierarchy Process (AHP)',
                'project_type': ProjectType.COMMISSIONED,
                'status': ProjectStatus.COMPLETED,
                'budget': Decimal('385000000'),
                'spent': Decimal('385000000'),
                'progress_percentage': 100,
                'research_area': 'Ekonomi Digital dan UMKM',
                'tags': 'UMKM, digitalisasi, e-commerce, indeks, pengukuran, ekonomi digital',
            },
            {
                'title': 'Dinamika Demokrasi Digital: Studi Media Sosial dan Partisipasi Politik Gen Z',
                'description': 'Penelitian kualitatif dan kuantitatif tentang bagaimana media sosial membentuk perilaku politik pemilih muda (17-27 tahun) dan pengaruhnya terhadap kualitas demokrasi Indonesia',
                'objectives': 'Memahami pola konsumsi informasi politik Gen Z, mengidentifikasi faktor yang mendorong/menghambat partisipasi politik aktif, dan merumuskan rekomendasi untuk meningkatkan literasi digital politik',
                'methodology': 'Analisis big data dari 100,000+ posting media sosial, survei 1,500 responden Gen Z, 50 wawancara mendalam, dan focus group discussion di 10 kota besar',
                'project_type': ProjectType.BASIC_RESEARCH,
                'status': ProjectStatus.PLANNING,
                'budget': Decimal('165000000'),
                'spent': Decimal('16500000'),
                'progress_percentage': 10,
                'research_area': 'Politik dan Komunikasi',
                'tags': 'demokrasi, media sosial, gen z, partisipasi politik, literasi digital, pemilu',
            },
            {
                'title': 'Sistem Mitigasi Bencana Terpadu Berbasis IoT dan AI',
                'description': 'Implementasi sistem peringatan dini dan mitigasi bencana menggunakan jaringan sensor IoT, AI untuk prediksi, dan aplikasi mobile untuk disseminasi informasi ke masyarakat',
                'objectives': 'Mengurangi waktu respons bencana dari 15-30 menit menjadi 3-5 menit, meningkatkan akurasi prediksi bencana, dan menjangkau 95% penduduk di area pilot project',
                'methodology': 'Deployment 500 sensor IoT (seismik, curah hujan, tinggi air), pengembangan model ML untuk prediksi, dan integrasi dengan sistem BMKG dan BNPB',
                'project_type': ProjectType.APPLIED_RESEARCH,
                'status': ProjectStatus.ACTIVE,
                'budget': Decimal('680000000'),
                'spent': Decimal('374000000'),
                'progress_percentage': 55,
                'research_area': 'Teknologi Mitigasi Bencana',
                'tags': 'IoT, bencana, tsunami, gempa, early warning, AI, sensor network',
            },
            {
                'title': 'Smart Farming untuk Peningkatan Produktivitas Pangan Nasional',
                'description': 'Program penelitian dan pilot project penerapan teknologi pertanian presisi menggunakan IoT, drone, dan AI untuk optimalisasi irigasi, pemupukan, dan pengendalian hama pada tanaman padi dan palawija',
                'objectives': 'Meningkatkan produktivitas padi 25-30%, mengurangi penggunaan air 40%, pupuk 30%, dan pestisida 50%, serta mendokumentasikan best practice untuk scale-up nasional',
                'methodology': 'Pilot project di 500 hektar lahan petani di Jawa Tengah dan Jawa Timur, pemasangan 200 sensor tanah dan cuaca, 10 drone pertanian, dan pendampingan 150 petani',
                'project_type': ProjectType.APPLIED_RESEARCH,
                'status': ProjectStatus.PROPOSAL,
                'budget': Decimal('575000000'),
                'spent': Decimal('0'),
                'progress_percentage': 5,
                'research_area': 'Pertanian dan Teknologi',
                'tags': 'pertanian, IoT, drone, AI, produktivitas, padi, smart farming, precision agriculture',
            },
        ]

        projects = []
        for i, data in enumerate(project_data):
            lead = users[i % len(users)]
            grant = grants[i % len(grants)] if i < len(grants) else None

            project = ResearchProject.objects.create(
                lead_researcher=lead,
                grant=grant,
                start_date=date.today() - timedelta(days=random.randint(30, 180)),
                end_date=date.today() + timedelta(days=random.randint(90, 365)),
                created_by=lead,
                **data
            )

            # Add team members
            for member in random.sample(users, min(2, len(users))):
                if member != lead:
                    ProjectTeamMember.objects.create(
                        project=project,
                        user=member,
                        role=random.choice([ProjectTeamMember.Role.RESEARCHER, ProjectTeamMember.Role.DATA_ANALYST]),
                    )

            # Add tasks
            tasks = [
                ('Kajian Literatur dan Studi Pustaka', 'Melakukan review literatur komprehensif dari jurnal nasional dan internasional terkait topik penelitian'),
                ('Pengumpulan Data Lapangan', 'Mengumpulkan data primer melalui survei, wawancara, dan observasi di lokasi penelitian'),
                ('Analisis Data dan Pemodelan', 'Mengolah dan menganalisis data menggunakan metode statistik dan pemodelan yang sesuai'),
                ('Penyusunan Laporan dan Diseminasi', 'Menyusun laporan akhir penelitian dan mempublikasikan hasil di jurnal/konferensi'),
            ]

            task_priorities = [ProjectTask.Priority.HIGH, ProjectTask.Priority.HIGH, ProjectTask.Priority.MEDIUM, ProjectTask.Priority.MEDIUM]

            for j, (task_title, task_desc) in enumerate(tasks):
                task_status = ProjectTask.TaskStatus.DONE if j < project.progress_percentage // 25 else ProjectTask.TaskStatus.IN_PROGRESS if j == project.progress_percentage // 25 else ProjectTask.TaskStatus.TODO

                ProjectTask.objects.create(
                    project=project,
                    title=task_title,
                    description=task_desc,
                    status=task_status,
                    priority=task_priorities[j],
                    assigned_to=random.choice(users),
                    due_date=project.start_date + timedelta(days=90*(j+1)) if project.start_date else date.today() + timedelta(days=90*(j+1)),
                    created_by=lead,
                )

            # Add update
            update_titles = [
                'Kick-off Meeting dan Pembentukan Tim',
                'Progress Report Bulan Pertama',
                'Update Pengumpulan Data',
                'Laporan Kemajuan Tengah Semester',
            ]
            update_contents = [
                f'Tim penelitian telah dibentuk dan kick-off meeting berhasil dilaksanakan. Target progress {project.progress_percentage}% dalam 6 bulan ke depan. Semua anggota tim sudah memahami peran dan tanggung jawab masing-masing.',
                f'Kajian literatur telah diselesaikan dengan total 150+ referensi. Desain penelitian telah difinalisasi dan instrumen penelitian sedang dalam tahap pengembangan. Progress saat ini {project.progress_percentage}%.',
                f'Pengumpulan data lapangan berjalan sesuai jadwal. Sudah terkumpul 60% dari target data yang dibutuhkan. Tidak ada kendala signifikan. Progress keseluruhan {project.progress_percentage}%.',
                f'Analisis data dimulai menggunakan software statistik. Temuan awal menunjukkan hasil yang menjanjikan. Preparation untuk publikasi di jurnal internasional sudah dimulai. Progress {project.progress_percentage}%.',
            ]

            update_index = min(project.progress_percentage // 25, len(update_titles) - 1)

            ProjectUpdate.objects.create(
                project=project,
                title=update_titles[update_index],
                content=update_contents[update_index],
                progress_percentage=project.progress_percentage,
                created_by=lead,
            )

            projects.append(project)

        return projects
