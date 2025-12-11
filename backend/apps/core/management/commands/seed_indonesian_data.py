"""
Seed Indonesian SaaS data without deleting existing records
Multiple organizations with realistic Indonesian context
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from apps.tenants.models import Tenant, TenantUser, TenantRole
from apps.organization.models import Department, Position
from apps.hr.models import Employee
from apps.hr.leave.models import LeavePolicy
from apps.hr.payroll_light.models import PayrollPeriod
from decimal import Decimal
import random
from datetime import timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed Indonesian SaaS data (preserves existing data)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--organizations',
            type=int,
            default=3,
            help='Number of organizations to create (default: 3)'
        )

    def handle(self, *args, **options):
        num_orgs = options['organizations']

        self.stdout.write(self.style.SUCCESS(
            f'\n🌱 Seeding Indonesian SaaS Data ({num_orgs} organizations)...\n'
        ))

        try:
            self.seed_organizations(num_orgs)

            self.stdout.write(self.style.SUCCESS(
                '\n✅ Seeding completed successfully!\n'
            ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {str(e)}\n'))
            import traceback
            traceback.print_exc()
            raise

    def seed_organizations(self, num_orgs):
        """Create multiple Indonesian organizations"""

        # Indonesian company data - Expanded list
        companies = [
            {
                'name': 'PT Maju Bersama Indonesia',
                'domain': 'majubersama',
                'industry': 'Manufacturing',
                'employees_count': 150,
                'city': 'Jakarta',
                'email': 'info@majubersama.com',
                'phone': '021-5551234',
                'address': 'Jl. Sudirman No. 123, Jakarta Selatan',
                'postal_code': '12190',
            },
            {
                'name': 'CV Karya Digital Nusantara',
                'domain': 'karyadigital',
                'industry': 'Technology',
                'employees_count': 45,
                'city': 'Bandung',
                'email': 'hello@karyadigital.com',
                'phone': '022-4567890',
                'address': 'Jl. Dago No. 56, Bandung',
                'postal_code': '40135',
            },
            {
                'name': 'PT Sumber Rejeki Makmur',
                'domain': 'sumberrejeki',
                'industry': 'Trading',
                'employees_count': 80,
                'city': 'Surabaya',
                'email': 'contact@sumberrejeki.com',
                'phone': '031-7778899',
                'address': 'Jl. Basuki Rahmat No. 88, Surabaya',
                'postal_code': '60271',
            },
            {
                'name': 'Koperasi Sejahtera Mandiri',
                'domain': 'sejahteramandiri',
                'industry': 'Cooperative',
                'employees_count': 35,
                'city': 'Yogyakarta',
                'email': 'info@sejahteramandiri.com',
                'phone': '0274-555666',
                'address': 'Jl. Malioboro No. 45, Yogyakarta',
                'postal_code': '55271',
            },
            {
                'name': 'PT Teknologi Cerdas Indonesia',
                'domain': 'teknocerdas',
                'industry': 'IT Services',
                'employees_count': 60,
                'city': 'Tangerang',
                'email': 'info@teknocerdas.id',
                'phone': '021-2223344',
                'address': 'Jl. BSD Boulevard No. 99, Tangerang Selatan',
                'postal_code': '15321',
            },
            {
                'name': 'PT Nusantara Global Solutions',
                'domain': 'nusantaraglobal',
                'industry': 'Consulting',
                'employees_count': 75,
                'city': 'Jakarta',
                'email': 'contact@nusantaraglobal.co.id',
                'phone': '021-8889990',
                'address': 'Jl. Rasuna Said Kav. C-11, Jakarta Selatan',
                'postal_code': '12940',
            },
            {
                'name': 'CV Cahaya Gemilang',
                'domain': 'cahayagemilang',
                'industry': 'Retail',
                'employees_count': 50,
                'city': 'Semarang',
                'email': 'info@cahayagemilang.com',
                'phone': '024-3334455',
                'address': 'Jl. Pemuda No. 77, Semarang',
                'postal_code': '50132',
            },
            {
                'name': 'PT Bangun Karya Persada',
                'domain': 'bangunkarya',
                'industry': 'Construction',
                'employees_count': 120,
                'city': 'Medan',
                'email': 'info@bangunkarya.co.id',
                'phone': '061-4445566',
                'address': 'Jl. Gatot Subroto No. 200, Medan',
                'postal_code': '20112',
            },
            {
                'name': 'PT Edu Indonesia Cerdas',
                'domain': 'eduindonesia',
                'industry': 'Education',
                'employees_count': 90,
                'city': 'Malang',
                'email': 'info@eduindonesia.ac.id',
                'phone': '0341-556677',
                'address': 'Jl. Veteran No. 33, Malang',
                'postal_code': '65145',
            },
            {
                'name': 'PT Sehat Bersama Nusantara',
                'domain': 'sehatbersama',
                'industry': 'Healthcare',
                'employees_count': 110,
                'city': 'Bekasi',
                'email': 'info@sehatbersama.com',
                'phone': '021-6667788',
                'address': 'Jl. Ahmad Yani No. 150, Bekasi',
                'postal_code': '17141',
            },
        ]

        for i in range(min(num_orgs, len(companies))):
            company = companies[i]
            self.stdout.write(f'\n📊 Creating: {company["name"]}...')

            tenant = self.create_tenant(company)
            admin_user = self.create_admin_user(tenant, company)
            departments = self.create_departments(tenant)
            positions = self.create_positions(tenant, departments)
            self.create_employees(tenant, departments, positions, company['employees_count'])
            self.create_leave_types(tenant)
            self.create_payroll_periods(tenant)

            self.stdout.write(self.style.SUCCESS(
                f'   ✓ {company["name"]} ({company["city"]}) - {company["employees_count"]} employees'
            ))

    def create_tenant(self, company):
        """Create tenant organization"""
        tenant, created = Tenant.objects.get_or_create(
            subdomain=company['domain'],
            defaults={
                'name': company['name'],
                'email': company.get('email', f'info@{company["domain"]}.com'),
                'phone': company.get('phone', ''),
                'address': company.get('address', ''),
                'city': company.get('city', ''),
                'postal_code': company.get('postal_code', ''),
                'country': 'ID',
                'status': 'active',
                'plan': 'professional',
                'enabled_modules': ['hr', 'finance', 'organization', 'assets', 'procurement', 'inventory'],
            }
        )
        if not created:
            # Update existing tenant with additional data
            tenant.email = company.get('email', tenant.email)
            tenant.phone = company.get('phone', tenant.phone)
            tenant.address = company.get('address', tenant.address)
            tenant.city = company.get('city', tenant.city)
            tenant.postal_code = company.get('postal_code', tenant.postal_code)
            tenant.status = 'active'
            tenant.save()
            self.stdout.write(f'   → Tenant already exists, updated details')
        else:
            self.stdout.write(f'   → Created new tenant')
        return tenant

    def create_admin_user(self, tenant, company):
        """Create admin user for tenant"""
        email = f'admin@{company["domain"]}.com'
        username = f'admin_{company["domain"]}'

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': 'Admin',
                'last_name': company['name'].split()[-1],
                'is_staff': True,
                # 'is_active': True,
            }
        )

        if created:
            user.set_password('admin123')
            user.save()
            TenantUser.objects.get_or_create(
                user=user,
                tenant=tenant,
                defaults={'role': TenantRole.ADMIN, 'is_owner': True}
            )
            self.stdout.write(f'   → Created admin: {email} (password: admin123)')
        else:
            TenantUser.objects.get_or_create(
                user=user,
                tenant=tenant,
                defaults={'role': TenantRole.ADMIN, 'is_owner': True}
            )
            self.stdout.write(f'   → Admin already exists: {email}')

        return user

    def create_departments(self, tenant):
        """Create Indonesian departments"""
        dept_data = [
            {'name': 'Direksi', 'code': 'DIR', 'description': 'Dewan Direksi'},
            {'name': 'Sumber Daya Manusia', 'code': 'SDM', 'description': 'HR & GA'},
            {'name': 'Keuangan & Akuntansi', 'code': 'FIN', 'description': 'Finance & Accounting'},
            {'name': 'Pemasaran', 'code': 'MKT', 'description': 'Marketing & Sales'},
            {'name': 'Operasional', 'code': 'OPS', 'description': 'Operations'},
            {'name': 'Teknologi Informasi', 'code': 'IT', 'description': 'IT Department'},
            {'name': 'Produksi', 'code': 'PRD', 'description': 'Production'},
        ]

        departments = []
        for dept in dept_data:
            # Use tenant ID hash to make code unique globally (keeping it short)
            unique_code = f"{tenant.id.hex[:4]}_{dept['code']}"
            department, created = Department.objects.get_or_create(
                code=unique_code,
                defaults={
                    'tenant': tenant,
                    'name': dept['name'],
                    'description': dept['description'],
                }
            )
            # Store original code as an attribute for easy lookup
            department._original_code = dept['code']
            departments.append(department)

        return departments

    def create_positions(self, tenant, departments):
        """Create Indonesian job positions"""
        position_data = [
            # Direksi (Level 5 - Executive)
            {'name': 'Direktur Utama', 'code': 'DIR-CEO', 'dept_code': 'DIR', 'level': 5},
            {'name': 'Direktur Keuangan', 'code': 'DIR-CFO', 'dept_code': 'DIR', 'level': 5},
            {'name': 'Direktur Operasional', 'code': 'DIR-COO', 'dept_code': 'DIR', 'level': 5},

            # HR (Level 4 - Manager, Level 1 - Staff)
            {'name': 'Manajer SDM', 'code': 'SDM-MGR', 'dept_code': 'SDM', 'level': 4},
            {'name': 'Staff Rekrutmen', 'code': 'SDM-REC', 'dept_code': 'SDM', 'level': 1},
            {'name': 'Staff Payroll', 'code': 'SDM-PAY', 'dept_code': 'SDM', 'level': 1},

            # Finance (Level 4 - Manager, Level 3 - Senior, Level 1 - Staff)
            {'name': 'Manajer Keuangan', 'code': 'FIN-MGR', 'dept_code': 'FIN', 'level': 4},
            {'name': 'Akuntan Senior', 'code': 'FIN-ACC-SR', 'dept_code': 'FIN', 'level': 3},
            {'name': 'Staff Akuntansi', 'code': 'FIN-ACC', 'dept_code': 'FIN', 'level': 1},
            {'name': 'Kasir', 'code': 'FIN-CSH', 'dept_code': 'FIN', 'level': 1},

            # Marketing (Level 4 - Manager, Level 1 - Staff)
            {'name': 'Manajer Pemasaran', 'code': 'MKT-MGR', 'dept_code': 'MKT', 'level': 4},
            {'name': 'Sales Executive', 'code': 'MKT-SAL', 'dept_code': 'MKT', 'level': 1},
            {'name': 'Digital Marketing', 'code': 'MKT-DIG', 'dept_code': 'MKT', 'level': 1},

            # Operations (Level 4 - Manager, Level 2 - Supervisor, Level 1 - Staff)
            {'name': 'Manajer Operasional', 'code': 'OPS-MGR', 'dept_code': 'OPS', 'level': 4},
            {'name': 'Supervisor Gudang', 'code': 'OPS-WHS', 'dept_code': 'OPS', 'level': 2},
            {'name': 'Staff Administrasi', 'code': 'OPS-ADM', 'dept_code': 'OPS', 'level': 1},

            # IT (Level 4 - Manager, Level 3 - Senior, Level 1 - Staff)
            {'name': 'IT Manager', 'code': 'IT-MGR', 'dept_code': 'IT', 'level': 4},
            {'name': 'Software Developer', 'code': 'IT-DEV', 'dept_code': 'IT', 'level': 3},
            {'name': 'IT Support', 'code': 'IT-SUP', 'dept_code': 'IT', 'level': 1},

            # Production (Level 4 - Manager, Level 2 - Supervisor, Level 1 - Staff)
            {'name': 'Manajer Produksi', 'code': 'PRD-MGR', 'dept_code': 'PRD', 'level': 4},
            {'name': 'Supervisor Produksi', 'code': 'PRD-SUP', 'dept_code': 'PRD', 'level': 2},
            {'name': 'Operator Produksi', 'code': 'PRD-OPR', 'dept_code': 'PRD', 'level': 1},
        ]

        positions = []
        # Map using original code that we stored
        dept_map = {getattr(d, '_original_code', d.code): d for d in departments}

        for pos in position_data:
            if pos['dept_code'] in dept_map:
                # Make position code unique globally (short prefix)
                unique_code = f"{tenant.id.hex[:4]}_{pos['code']}"[:20]  # Ensure max 20 chars
                position, created = Position.objects.get_or_create(
                    code=unique_code,
                    defaults={
                        'tenant': tenant,
                        'name': pos['name'],
                        'department': dept_map[pos['dept_code']],
                        'level': pos['level'],
                    }
                )
                positions.append(position)

        return positions

    def create_employees(self, tenant, departments, positions, count):
        """Create employees with Indonesian names"""

        # Indonesian names
        first_names_male = [
            'Ahmad', 'Budi', 'Dedi', 'Eko', 'Fajar', 'Gunawan', 'Hadi', 'Indra',
            'Joko', 'Kurniawan', 'Lukman', 'Muhammad', 'Nur', 'Oki', 'Putra',
            'Rizki', 'Sandi', 'Teguh', 'Usman', 'Wawan', 'Yudi', 'Zaki'
        ]

        first_names_female = [
            'Ani', 'Dewi', 'Eka', 'Fitri', 'Indah', 'Maya', 'Novi', 'Putri',
            'Rina', 'Sari', 'Tuti', 'Wulan', 'Yuli', 'Zahra', 'Lestari'
        ]

        last_names = [
            'Santoso', 'Wijaya', 'Kurniawan', 'Pratama', 'Sutanto', 'Hartono',
            'Setiawan', 'Gunawan', 'Firmansyah', 'Nugroho', 'Hidayat', 'Ramadhan',
            'Saputra', 'Putra', 'Wibowo', 'Kusuma', 'Permana', 'Susanto'
        ]

        existing_count = Employee.objects.filter(tenant=tenant).count()
        to_create = max(0, count - existing_count)

        if to_create == 0:
            self.stdout.write(f'   → {existing_count} employees already exist')
            return

        # Get global employee count for unique IDs
        global_count = Employee.objects.count()

        for i in range(to_create):
            is_male = random.choice([True, False])
            first_name = random.choice(first_names_male if is_male else first_names_female)
            last_name = random.choice(last_names)

            # Create user
            username = f"{first_name.lower()}.{last_name.lower()}.{i}@{tenant.subdomain}"
            email = f"{first_name.lower()}.{last_name.lower()}.{i}@{tenant.subdomain}.com"

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'first_name': first_name,
                    'last_name': last_name,
                    # 'is_active': True,
                }
            )

            if created:
                user.set_password('password123')
                user.save()
                TenantUser.objects.get_or_create(
                    user=user,
                    tenant=tenant,
                    defaults={'role': TenantRole.MEMBER}
                )

            # Create employee
            pos_obj = random.choice(positions)
            department = pos_obj.department

            Employee.objects.get_or_create(
                tenant=tenant,
                employee_id=f'EMP{1000 + global_count + i}',
                defaults={
                    'user': user,
                    'first_name': first_name,
                    'last_name': last_name,
                    'department': department,
                    'position': pos_obj.name,
                    'join_date': timezone.now().date() - timedelta(days=random.randint(30, 1095)),
                    'employment_status': random.choice(['active', 'on_leave', 'probation']),
                    'phone': f'08{random.randint(1000000000, 9999999999)}',
                }
            )

    def create_leave_types(self, tenant):
        """Create Indonesian leave policies"""
        current_year = timezone.now().year
        leave_policies_data = [
            {
                'name': 'Cuti Tahunan',
                'leave_type': 'annual',
                'default_days': 12,
                'description': 'Cuti tahunan sesuai UU Ketenagakerjaan',
                'max_carry_over': 6,
                'requires_approval': True,
            },
            {
                'name': 'Cuti Sakit',
                'leave_type': 'sick',
                'default_days': 15,
                'description': 'Cuti sakit dengan surat dokter',
                'requires_approval': True,
                'requires_document': True,
            },
            {
                'name': 'Cuti Menikah',
                'leave_type': 'marriage',
                'default_days': 3,
                'description': 'Cuti untuk menikah',
                'requires_approval': True,
            },
            {
                'name': 'Cuti Melahirkan',
                'leave_type': 'maternity',
                'default_days': 90,
                'description': 'Cuti melahirkan 3 bulan',
                'requires_approval': True,
            },
            {
                'name': 'Cuti Ayah',
                'leave_type': 'paternity',
                'default_days': 2,
                'description': 'Cuti kelahiran anak',
                'requires_approval': True,
            },
            {
                'name': 'Cuti Kematian Keluarga',
                'leave_type': 'bereavement',
                'default_days': 2,
                'description': 'Cuti kematian keluarga dekat',
                'requires_approval': True,
            },
        ]

        for policy_data in leave_policies_data:
            # Check if policy exists for this tenant first
            exists = LeavePolicy.objects.filter(
                tenant=tenant,
                leave_type=policy_data['leave_type'],
                year=current_year
            ).exists()

            if not exists:
                try:
                    LeavePolicy.objects.create(
                        tenant=tenant,
                        name=policy_data['name'],
                        leave_type=policy_data['leave_type'],
                        year=current_year,
                        default_days=policy_data['default_days'],
                        description=policy_data['description'],
                        max_carry_over=policy_data.get('max_carry_over', 0),
                        requires_approval=policy_data.get('requires_approval', True),
                        requires_document=policy_data.get('requires_document', False),
                    )
                except Exception as e:
                    # Skip if already exists (race condition or unique constraint)
                    if 'duplicate key' not in str(e):
                        raise

    def create_payroll_periods(self, tenant):
        """Create payroll periods for current year"""
        current_year = timezone.now().year
        current_month = timezone.now().month

        for month in range(1, 13):
            start_date = timezone.datetime(current_year, month, 1).date()

            # Last day of month
            if month == 12:
                end_date = timezone.datetime(current_year, month, 31).date()
            else:
                end_date = (timezone.datetime(current_year, month + 1, 1) - timedelta(days=1)).date()

            # Check if exists first
            exists = PayrollPeriod.objects.filter(
                tenant=tenant,
                year=current_year,
                month=month
            ).exists()

            if not exists:
                try:
                    PayrollPeriod.objects.create(
                        tenant=tenant,
                        year=current_year,
                        month=month,
                        start_date=start_date,
                        end_date=end_date,
                        status='draft' if month >= current_month else 'paid',
                    )
                except Exception as e:
                    # Skip if already exists
                    if 'duplicate key' not in str(e):
                        raise
