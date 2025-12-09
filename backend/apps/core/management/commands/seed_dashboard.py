
import random
import uuid
from datetime import timedelta, date
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model

from apps.tenants.models import Tenant
from apps.organization.models import Department, Position
from apps.hr.models import Employee
from apps.research.publication.models import Publication, PublicationType, PublicationStatus, IndexationType
from apps.core.enums import Gender, EmploymentType, EmploymentStatus

User = get_user_model()

INDONESIAN_NAMES = [
    ("Budi", "Santoso"), ("Siti", "Aminah"), ("Agus", "Pratama"), ("Dewi", "Lestari"),
    ("Bambang", "Pamungkas"), ("Rina", "Wati"), ("Eko", "Prasetyo"), ("Sri", "Mulyani"),
    ("Joko", "Susilo"), ("Lestari", "Indah"), ("Dedi", "Kurniawan"), ("Ratna", "Sari"),
    ("Hendra", "Saputra"), ("Nur", "Hidayah"), ("Adi", "Nugroho"), ("Indah", "Permata"),
    ("Rudi", "Hermawan"), ("Tuti", "Alawiyah"), ("Iwan", "Fals"), ("Mega", "Wati"),
    ("Bayu", "Samudra"), ("Putri", "Ayu"), ("Rian", "Hidayat"), ("Sari", "Puspa"),
    ("Arif", "Rahman"), ("Nia", "Ramadhani"), ("Reza", "Rahadian"), ("Dian", "Sastro"),
    ("Fajar", "Nugraha"), ("Lia", "Eden"), ("Gilang", "Dirga"), ("Maya", "Estianty"),
    ("Doni", "Tata"), ("Vina", "Panduwinata"), ("Gading", "Marten"), ("Gisel", "Anastasia")
]

PUBLICATION_TITLES = [
    "Analisis Dampak Hilirisasi Industri Nikel Terhadap Ekonomi Lokal di Sulawesi",
    "Penerapan Kecerdasan Buatan dalam Sistem Pertanian Cerdas di Jawa Barat",
    "Strategi Pengembangan UMKM Digital Pasca Pandemi di Jakarta",
    "Konservasi Terumbu Karang di Raja Ampat: Pendekatan Berbasis Masyarakat",
    "Evaluasi Kebijakan Transportasi Publik Terintegrasi di Jabodetabek",
    "Potensi Energi Terbarukan Micro-Hydro di Desa Terpencil Sumatera",
    "Pengaruh Media Sosial Terhadap Partisipasi Politik Generasi Z Indonesia",
    "Model Mitigasi Bencana Banjir di Kawasan Pesisir Utara Jawa",
    "Ketahanan Pangan Berkelanjutan melalui Diversifikasi Pangan Lokal Sagu",
    "Implementasi Blockchain untuk Transparansi Rantai Pasok Kopi Gayo",
    "Dinamika Sastra Kontemporer Indonesia dalam Era Digital",
    "Pengaruh Budaya Kerja Gotong Royong Terhadap Produktivitas Karyawan",
    "Optimasi Logistik Maritim Tol Laut Indonesia",
    "Revitalisasi Pasar Tradisional di Tengah Gempuran E-Commerce",
    "Studi Etnobotani Tumbuhan Obat Suku Dayak Kalimantan",
]

JOURNALS = [
    "Jurnal Ekonomi Indonesia", "Indonesian Journal of Computer Science",
    "Jurnal Sosial Humaniora", "Buletin Penelitian Pertanian",
    "Journal of Indonesian Tourism", "Gadjah Mada International Journal",
    "Jurnal Hukum Pembangunan", "Indonesian Medical Journal"
]

class Command(BaseCommand):
    help = 'Seeds dashboard data (Employees and Publications) for testing.'


    def handle(self, *args, **options):
        self.stdout.write("Seeding dashboard data...")

        # Target specific user
        email = "admin@gmail.com"
        password = "6876543"

        try:
            user = User.objects.get(email=email)
            self.stdout.write(f"Found user: {email}")
            user.set_password(password)
            user.save()
            self.stdout.write(f"Updated password for {email}")
        except User.DoesNotExist:
            self.stdout.write(f"User {email} not found. Creating...")
            user = User.objects.create_user(
                username=email, 
                email=email, 
                password=password, 
                first_name="Admin", 
                last_name="User"
            )

        # Get tenant for this user
        # We need to find a tenant this user belongs to, or create one if none
        from apps.tenants.models import TenantUser, TenantRole
        
        membership = TenantUser.objects.filter(user=user).first()
        if membership:
            tenant = membership.tenant
        else:
            # If no membership, check if any tenant exists, else create
            tenant = Tenant.objects.first()
            if not tenant:
                tenant = Tenant.objects.create(
                    name="Nalar Organization",
                    slug="nalar-org",
                    email="contact@nalar.app"
                )
            
            # Link user to tenant
            TenantUser.objects.create(
                tenant=tenant,
                user=user,
                role=TenantRole.OWNER,
                is_owner=True
            )
        
        self.stdout.write(f"Seeding data for Tenant: {tenant.name} ({tenant.id})")

        with transaction.atomic():
            self._ensure_departments(tenant)
            self._seed_employees(tenant)
            self._seed_publications(tenant)
        
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded dashboard data for {tenant.name}."))


    def _ensure_departments(self, tenant):
        # We generally check if this tenant has departments
        if Department.objects.filter(tenant=tenant).exists():
           return

        # Create basic departments
        depts = ["Human Resources", "Research", "Finance", "IT", "Operations"]
        for name in depts:
            # Generate a code that is likely unique globally or try/catch
            base_code = name[:3].upper()
            
            # Simple check or retry loop could work, but let's just use random suffix
            # since code is globally unique in this system apparently.
            code = f"{base_code}-{random.randint(1000, 9999)}"
            
            Department.objects.create(
                tenant=tenant,
                name=name,
                code=code
            )
        self.stdout.write(f"Created {len(depts)} departments.")



    def _seed_employees(self, tenant):
        # Check existing employees for this tenant
        if Employee.objects.filter(tenant=tenant).exists():
            self.stdout.write("Employees already exist. Skipping...")
            return

        departments = list(Department.objects.filter(tenant=tenant))
        if not departments:
            self.stdout.write("No departments found. Skipping employee creation.")
            return

        self.stdout.write("Creating employees...")
        
        # Determine starting ID based on global last ID
        import datetime
        current_year = datetime.date.today().year
        last_emp = Employee.objects.filter(employee_id__startswith=f"EMP-{current_year}-").order_by('-employee_id').first()
        start_count = 1
        if last_emp:
            try:
                # Format is usually EMP-YYYY-XXX
                parts = last_emp.employee_id.split('-')
                if len(parts) == 3:
                    start_count = int(parts[2]) + 1
            except (ValueError, IndexError):
                pass

        count = 0
        current_id_num = start_count
        
        for first, last in INDONESIAN_NAMES:
            # Create User
            email = f"{first.lower()}.{last.lower()}@example.com"
            if User.objects.filter(email__startswith=f"{first.lower()}.{last.lower()}").exists():
                 # Simple unique email gen
                 email = f"{first.lower()}.{last.lower()}.{random.randint(100,999)}@example.com"
            
            # Avoid duplicate user error if email exists (though checking above helps)
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
            else:
                 user = User.objects.create_user(
                    username=email,
                    email=email,
                    password="password123",
                    first_name=first,
                    last_name=last
                )

            # Create Employee
            dept = random.choice(departments)
            join_date = date.today() - timedelta(days=random.randint(30, 365*5))
            
            employee_id = f"EMP-{current_year}-{current_id_num:03d}"
            
            Employee.objects.create(
                tenant=tenant,
                user=user,
                employee_id=employee_id,
                first_name=first,
                last_name=last,
                gender=random.choice(['male', 'female']),
                employment_status='active',
                employment_type='staff',
                department=dept,
                position=f"Staff {dept.name}",
                join_date=join_date,
                date_of_birth=date(1980 + random.randint(0, 20), random.randint(1, 12), random.randint(1, 28)),
                nationality="Indonesia",
                phone=f"081{random.randint(100000000, 999999999)}"
            )
            count += 1
            current_id_num += 1
        
        self.stdout.write(f"Created {count} employees.")


    def _seed_publications(self, tenant):
        if Publication.objects.filter(tenant=tenant).exists():
            self.stdout.write("Publications already exist. Skipping...")
            return

        self.stdout.write("Creating publications...")
        count = 0
        
        # Link to random employees
        employees = list(Employee.objects.filter(tenant=tenant))

        for title in PUBLICATION_TITLES:
            pub_date = date.today() - timedelta(days=random.randint(1, 365*2))
            
            pub = Publication.objects.create(
                tenant=tenant,
                title=title,
                abstract=f"Ini adalah abstrak untuk penelitian tentang {title}. Penelitian ini bertujuan untuk mengevaluasi dampak dan efektivitas...",
                publication_type=random.choice(PublicationType.choices)[0],
                status=PublicationStatus.PUBLISHED,
                journal_name=random.choice(JOURNALS),
                volume=str(random.randint(1, 20)),
                issue=str(random.randint(1, 4)),
                year=pub_date.year,
                publication_date=pub_date,
                indexation=random.choice([IndexationType.SCOPUS, IndexationType.SINTA, IndexationType.GOOGLE_SCHOLAR]),
                citation_count=random.randint(0, 50)
            )

            # Add internal authors
            if employees:
                # 1-3 authors per paper
                num_authors = random.randint(1, min(3, len(employees)))
                authors = random.sample(employees, num_authors)
                for idx, emp in enumerate(authors):
                    pub.authors.create(
                        tenant=tenant,
                        user=emp.user,
                        author_type='internal',
                        order=idx+1,
                        is_corresponding=(idx==0)
                    )

            count += 1
        
        self.stdout.write(f"Created {count} publications.")
