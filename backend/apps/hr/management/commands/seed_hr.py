import random
from datetime import date, timedelta, datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.hr.models import Employee, EmployeeFamily
from apps.hr.attendance.models import Attendance, AttendanceSummary, AttendanceStatus
from apps.hr.leave.models import LeavePolicy, LeaveBalance, LeaveRequest, LeaveType, LeaveStatus
from apps.hr.payroll_light.models import (
    SalaryComponent, PayrollPeriod, Payslip, PayslipItem, PayrollStatus,
    AllowanceType, DeductionType,
)
from apps.core.enums import (
    EmploymentType,
    EmploymentStatus,
    Gender,
    MaritalStatus,
    FamilyRelation,
)

User = get_user_model()

# Indonesian names
FIRST_NAMES_MALE = [
    'Budi', 'Agus', 'Dedi', 'Eko', 'Firman', 'Gunawan', 'Hendra', 'Irwan',
    'Joko', 'Kurniawan', 'Lukman', 'Muhammad', 'Nanda', 'Oki', 'Purnomo',
    'Rudi', 'Slamet', 'Taufik', 'Umar', 'Wahyu', 'Yusuf', 'Zainal',
]
FIRST_NAMES_FEMALE = [
    'Ani', 'Bunga', 'Citra', 'Dewi', 'Endah', 'Fitri', 'Gita', 'Hani',
    'Intan', 'Julia', 'Kartini', 'Lestari', 'Maya', 'Nurul', 'Oktavia',
    'Putri', 'Ratna', 'Sari', 'Titi', 'Umi', 'Vina', 'Wulan', 'Yanti',
]
LAST_NAMES = [
    'Santoso', 'Wijaya', 'Kusuma', 'Pratama', 'Saputra', 'Nugroho', 'Hidayat',
    'Setiawan', 'Permana', 'Suryadi', 'Hartono', 'Susanto', 'Utomo', 'Wibowo',
    'Prasetyo', 'Kurniawan', 'Rahman', 'Handoko', 'Putra', 'Surya',
]

CITIES = [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar',
    'Palembang', 'Tangerang', 'Depok', 'Bekasi', 'Yogyakarta', 'Malang',
    'Solo', 'Bogor', 'Denpasar',
]
BANKS = ['BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB Niaga', 'Bank Danamon']
POSITIONS = [
    'Software Engineer', 'Data Analyst', 'Project Manager', 'HR Manager',
    'Finance Officer', 'Marketing Specialist', 'UI/UX Designer',
    'Business Analyst', 'Quality Assurance', 'DevOps Engineer',
    'Product Manager', 'Research Analyst', 'Administrative Staff',
    'Legal Officer', 'Public Relations',
]
DEGREES = [
    'S1 Teknik Informatika', 'S1 Sistem Informasi', 'S1 Manajemen',
    'S1 Akuntansi', 'S2 MBA', 'S1 Hukum', 'S1 Komunikasi',
    'S1 Teknik Industri', 'D3 Administrasi', 'S1 Psikologi',
]
OCCUPATIONS = [
    'Wiraswasta', 'PNS', 'Guru', 'Dokter', 'Ibu Rumah Tangga',
    'Pensiunan', 'Petani', 'Pedagang', 'Karyawan Swasta', 'Pelajar',
]


class Command(BaseCommand):
    help = 'Seed HR data with employees, family, attendance, leave, and payroll (Indonesian data)'

    def handle(self, *args, **options):
        self.stdout.write('Seeding HR data...')

        # Clear existing data (only HR-related, not users with other references)
        self.stdout.write('  Clearing existing data...')
        PayslipItem.objects.all().delete()
        Payslip.objects.all().delete()
        PayrollPeriod.objects.all().delete()
        SalaryComponent.objects.all().delete()
        LeaveRequest.objects.all().delete()
        LeaveBalance.objects.all().delete()
        LeavePolicy.objects.all().delete()
        AttendanceSummary.objects.all().delete()
        Attendance.objects.all().delete()
        EmployeeFamily.objects.all().delete()
        Employee.objects.all().delete()
        # Only delete users that are safe to delete (no other references)
        for user in User.objects.filter(email__endswith='@example.com'):
            try:
                user.delete()
            except Exception:
                pass  # Skip users with protected references

        # Create hierarchical employees
        self.stdout.write('  Creating organizational hierarchy...')
        employees = self.create_org_hierarchy()

        # Create 30 family members distributed across employees
        family_count = 0
        employee_index = 0
        while family_count < 30:
            employee = employees[employee_index % len(employees)]
            family = self.create_family_member(employee)
            self.stdout.write(f'  Created family: {family.name} ({family.get_relation_display()}) for {employee.full_name}')
            family_count += 1
            employee_index += 1

        # Create attendance data
        self.stdout.write('  Creating attendance data...')
        self.create_attendance_data(employees)

        # Create leave policies and data
        self.stdout.write('  Creating leave policies and data...')
        self.create_leave_data(employees)

        # Create payroll data
        self.stdout.write('  Creating payroll data...')
        self.create_payroll_data(employees)

        self.stdout.write(self.style.SUCCESS(
            'Successfully created 20 employees, 30 family members, '
            'attendance records, leave data, and payroll data'
        ))

    def create_employee(self, index):
        gender = random.choice([Gender.MALE, Gender.FEMALE])
        if gender == Gender.MALE:
            first_name = random.choice(FIRST_NAMES_MALE)
        else:
            first_name = random.choice(FIRST_NAMES_FEMALE)
        last_name = random.choice(LAST_NAMES)

        email = f"{first_name.lower()}.{last_name.lower()}{index}@example.com"
        username = f"{first_name.lower()}{index}"

        user = User.objects.create_user(
            email=email,
            username=username,
            password='password123',
        )

        # Random dates
        dob = date(1980 + random.randint(0, 20), random.randint(1, 12), random.randint(1, 28))
        join_date = date(2018 + random.randint(0, 5), random.randint(1, 12), random.randint(1, 28))

        employment_type = random.choices(
            [EmploymentType.STAFF, EmploymentType.INTERN, EmploymentType.RESEARCH_FELLOW, EmploymentType.CONTRACT],
            weights=[60, 15, 15, 10],
        )[0]

        city = random.choice(CITIES)

        employee = Employee.objects.create(
            user=user,
            employee_id=f'EMP{index:04d}',
            first_name=first_name,
            last_name=last_name,
            gender=gender,
            date_of_birth=dob,
            place_of_birth=random.choice(CITIES),
            nationality='Indonesia',
            national_id=f'317{random.randint(1000000000000, 9999999999999)}',
            tax_id=f'{random.randint(10, 99)}.{random.randint(100, 999)}.{random.randint(100, 999)}.{random.randint(1, 9)}-{random.randint(100, 999)}.{random.randint(100, 999)}',
            marital_status=random.choice([MaritalStatus.SINGLE, MaritalStatus.MARRIED, MaritalStatus.MARRIED]),
            personal_email=f'{first_name.lower()}.personal@gmail.com',
            phone=f'021-{random.randint(1000000, 9999999)}',
            mobile=f'08{random.randint(100000000, 999999999)}',
            address=f'Jl. {random.choice(["Sudirman", "Thamrin", "Gatot Subroto", "Rasuna Said", "Kuningan", "Kemang"])} No. {random.randint(1, 200)}',
            city=city,
            postal_code=f'{random.randint(10000, 99999)}',
            employment_type=employment_type,
            employment_status=random.choices(
                [EmploymentStatus.ACTIVE, EmploymentStatus.ON_LEAVE, EmploymentStatus.INACTIVE],
                weights=[85, 5, 10],
            )[0],
            position=random.choice(POSITIONS),
            job_title=random.choice(POSITIONS),
            join_date=join_date,
            contract_start_date=join_date,
            contract_end_date=join_date + timedelta(days=365 * random.randint(1, 3)) if employment_type == EmploymentType.CONTRACT else None,
            bank_name=random.choice(BANKS),
            bank_account_number=f'{random.randint(1000000000, 9999999999)}',
            bank_account_name=f'{first_name} {last_name}',
            room_number=f'{random.choice(["A", "B", "C"])}-{random.randint(101, 505)}',
            phone_extension=f'{random.randint(100, 999)}',
            printer_id=f'PRN-{random.choice(["FLOOR1", "FLOOR2", "FLOOR3"])}-{random.randint(1, 5)}',
            workstation_id=f'WS-{random.randint(1, 100):03d}',
        )
        return employee

    def create_family_member(self, employee):
        relation = random.choice([
            FamilyRelation.SPOUSE,
            FamilyRelation.CHILD,
            FamilyRelation.PARENT,
            FamilyRelation.SIBLING,
        ])

        # Determine gender and name based on relation
        if relation == FamilyRelation.SPOUSE:
            gender = Gender.FEMALE if employee.gender == Gender.MALE else Gender.MALE
        elif relation == FamilyRelation.CHILD:
            gender = random.choice([Gender.MALE, Gender.FEMALE])
        else:
            gender = random.choice([Gender.MALE, Gender.FEMALE])

        if gender == Gender.MALE:
            first_name = random.choice(FIRST_NAMES_MALE)
        else:
            first_name = random.choice(FIRST_NAMES_FEMALE)

        # Determine age based on relation
        if relation == FamilyRelation.CHILD:
            dob = date.today() - timedelta(days=365 * random.randint(1, 18))
        elif relation == FamilyRelation.PARENT:
            dob = date.today() - timedelta(days=365 * random.randint(50, 75))
        elif relation == FamilyRelation.SPOUSE:
            dob = date.today() - timedelta(days=365 * random.randint(25, 50))
        else:
            dob = date.today() - timedelta(days=365 * random.randint(20, 45))

        family = EmployeeFamily.objects.create(
            employee=employee,
            name=f'{first_name} {employee.last_name}' if relation in [FamilyRelation.CHILD, FamilyRelation.SPOUSE] else f'{first_name} {random.choice(LAST_NAMES)}',
            relation=relation,
            gender=gender,
            date_of_birth=dob,
            phone=f'08{random.randint(100000000, 999999999)}',
            is_emergency_contact=random.choice([True, False, False]),
            is_dependent=relation in [FamilyRelation.CHILD, FamilyRelation.SPOUSE],
            occupation=random.choice(OCCUPATIONS),
        )
        return family

    def create_attendance_data(self, employees):
        """Create attendance records for the past 30 days."""
        today = date.today()
        locations = [
            'Kantor Pusat Jakarta',
            'Gedung A Lantai 3',
            'Gedung B Lantai 2',
            'Work From Home',
        ]

        for employee in employees:
            # Create attendance for past 30 days (excluding weekends)
            for days_ago in range(30):
                current_date = today - timedelta(days=days_ago)
                if current_date.weekday() >= 5:  # Skip weekends
                    continue

                # 85% chance of being present
                if random.random() < 0.85:
                    status = random.choices(
                        [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.WORK_FROM_HOME],
                        weights=[70, 15, 15],
                    )[0]

                    # Random check-in time between 7:30 and 9:30
                    check_in_hour = random.randint(7, 9)
                    check_in_minute = random.randint(0, 59)
                    check_in = timezone.make_aware(
                        datetime(current_date.year, current_date.month, current_date.day,
                                check_in_hour, check_in_minute)
                    )

                    # Random check-out time between 17:00 and 19:30
                    check_out_hour = random.randint(17, 19)
                    check_out_minute = random.randint(0, 59)
                    check_out = timezone.make_aware(
                        datetime(current_date.year, current_date.month, current_date.day,
                                check_out_hour, check_out_minute)
                    )

                    work_hours = (check_out - check_in).total_seconds() / 3600
                    overtime = max(0, work_hours - 8)

                    location = random.choice(locations)

                    Attendance.objects.create(
                        employee=employee,
                        date=current_date,
                        check_in=check_in,
                        check_out=check_out,
                        status=status,
                        work_hours=round(work_hours, 2),
                        overtime_hours=round(overtime, 2),
                        check_in_location=location,
                        check_out_location=location,
                        check_in_latitude=Decimal('-6.2088') + Decimal(random.uniform(-0.01, 0.01)),
                        check_in_longitude=Decimal('106.8456') + Decimal(random.uniform(-0.01, 0.01)),
                    )
                else:
                    # Absent or on leave
                    status = random.choice([AttendanceStatus.ABSENT, AttendanceStatus.SICK, AttendanceStatus.LEAVE])
                    Attendance.objects.create(
                        employee=employee,
                        date=current_date,
                        status=status,
                        notes=f'Tidak hadir - {status}',
                    )

        # Create monthly summary for current month
        current_month = today.month
        current_year = today.year
        for employee in employees:
            attendances = Attendance.objects.filter(
                employee=employee,
                date__year=current_year,
                date__month=current_month,
            )
            AttendanceSummary.objects.create(
                employee=employee,
                year=current_year,
                month=current_month,
                total_days=attendances.count(),
                present_days=attendances.filter(status=AttendanceStatus.PRESENT).count(),
                absent_days=attendances.filter(status=AttendanceStatus.ABSENT).count(),
                late_days=attendances.filter(status=AttendanceStatus.LATE).count(),
                leave_days=attendances.filter(status=AttendanceStatus.LEAVE).count(),
                sick_days=attendances.filter(status=AttendanceStatus.SICK).count(),
                wfh_days=attendances.filter(status=AttendanceStatus.WORK_FROM_HOME).count(),
                total_work_hours=sum(a.work_hours or 0 for a in attendances),
                total_overtime_hours=sum(a.overtime_hours or 0 for a in attendances),
            )

    def create_leave_data(self, employees):
        """Create leave policies, balances, and some requests."""
        current_year = date.today().year

        # Create leave policies
        policies = [
            (LeaveType.ANNUAL, 'Cuti Tahunan', 12, 5),
            (LeaveType.SICK, 'Cuti Sakit', 12, 0),
            (LeaveType.MATERNITY, 'Cuti Melahirkan', 90, 0),
            (LeaveType.PATERNITY, 'Cuti Ayah', 3, 0),
            (LeaveType.MARRIAGE, 'Cuti Menikah', 3, 0),
            (LeaveType.BEREAVEMENT, 'Cuti Duka', 3, 0),
        ]

        for leave_type, name, days, carry_over in policies:
            LeavePolicy.objects.create(
                name=name,
                leave_type=leave_type,
                year=current_year,
                default_days=days,
                max_carry_over=carry_over,
                requires_approval=True,
                requires_document=leave_type in [LeaveType.SICK, LeaveType.MATERNITY],
                min_days_notice=3 if leave_type == LeaveType.ANNUAL else 0,
            )

        # Create leave balances for each employee
        for employee in employees:
            # Annual leave balance
            used = random.randint(0, 5)
            LeaveBalance.objects.create(
                employee=employee,
                leave_type=LeaveType.ANNUAL,
                year=current_year,
                entitled_days=12,
                used_days=used,
                carried_over=random.randint(0, 3),
            )
            # Sick leave balance
            LeaveBalance.objects.create(
                employee=employee,
                leave_type=LeaveType.SICK,
                year=current_year,
                entitled_days=12,
                used_days=random.randint(0, 3),
                carried_over=0,
            )

        # Create some leave requests (mix of statuses)
        leave_reasons = [
            'Keperluan keluarga',
            'Liburan bersama keluarga',
            'Acara pernikahan saudara',
            'Urusan pribadi',
            'Kontrol kesehatan',
            'Mengurus dokumen',
        ]

        for i, employee in enumerate(employees[:10]):
            start_date = date.today() + timedelta(days=random.randint(7, 30))
            days = random.randint(1, 5)
            end_date = start_date + timedelta(days=days - 1)

            status = random.choice([LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.APPROVED])
            approved_by = employees[(i + 5) % len(employees)] if status == LeaveStatus.APPROVED else None

            LeaveRequest.objects.create(
                employee=employee,
                leave_type=LeaveType.ANNUAL,
                start_date=start_date,
                end_date=end_date,
                total_days=days,
                reason=random.choice(leave_reasons),
                status=status,
                approved_by=approved_by,
                approved_at=timezone.now() if status == LeaveStatus.APPROVED else None,
                emergency_contact_name=f'Keluarga {employee.last_name}',
                emergency_contact_phone=f'08{random.randint(100000000, 999999999)}',
            )

    def create_org_hierarchy(self):
        """Create employees with proper organizational hierarchy."""
        from apps.organization.models import Department

        employees = []
        emp_index = [1]  # Use list to allow modification in nested function

        def create_emp(first_name, last_name, position, dept_code, supervisor=None, emp_type=EmploymentType.STAFF):
            """Helper to create employee with specific details."""
            email = f"{first_name.lower()}.{last_name.lower()}@example.com"
            username = f"{first_name.lower()}{emp_index[0]}"

            user = User.objects.create_user(
                email=email,
                username=username,
                password='password123',
            )

            # Get department
            dept = None
            try:
                dept = Department.objects.get(code=dept_code)
            except Department.DoesNotExist:
                pass

            dob = date(1970 + random.randint(0, 25), random.randint(1, 12), random.randint(1, 28))
            join_date = date(2018 + random.randint(0, 5), random.randint(1, 12), random.randint(1, 28))
            gender = random.choice([Gender.MALE, Gender.FEMALE])

            employee = Employee.objects.create(
                user=user,
                employee_id=f'EMP{emp_index[0]:04d}',
                first_name=first_name,
                last_name=last_name,
                gender=gender,
                date_of_birth=dob,
                place_of_birth=random.choice(CITIES),
                nationality='Indonesia',
                national_id=f'317{random.randint(1000000000000, 9999999999999)}',
                marital_status=random.choice([MaritalStatus.SINGLE, MaritalStatus.MARRIED]),
                personal_email=f'{first_name.lower()}.personal@gmail.com',
                phone=f'021-{random.randint(1000000, 9999999)}',
                mobile=f'08{random.randint(100000000, 999999999)}',
                address=f'Jl. {random.choice(["Sudirman", "Thamrin", "Gatot Subroto"])} No. {random.randint(1, 200)}',
                city=random.choice(CITIES),
                postal_code=f'{random.randint(10000, 99999)}',
                employment_type=emp_type,
                employment_status=EmploymentStatus.ACTIVE,
                department=dept,
                position=position,
                job_title=position,
                supervisor=supervisor,
                join_date=join_date,
                contract_start_date=join_date,
                bank_name=random.choice(BANKS),
                bank_account_number=f'{random.randint(1000000000, 9999999999)}',
                bank_account_name=f'{first_name} {last_name}',
            )
            emp_index[0] += 1
            self.stdout.write(f'    Created: {employee.full_name} - {position}')
            employees.append(employee)
            return employee

        # Level 1: CEO/Executive Director
        ceo = create_emp('Ahmad', 'Prasetyo', 'Direktur Eksekutif', 'DIR')

        # Level 2: Directors (report to CEO)
        dir_research = create_emp('Budi', 'Santoso', 'Direktur Riset', 'RES', supervisor=ceo)
        dir_comm = create_emp('Citra', 'Wijaya', 'Direktur Komunikasi', 'COM', supervisor=ceo)
        dir_ops = create_emp('Dewi', 'Kusuma', 'Direktur Operasional', 'OPS', supervisor=ceo)
        dir_program = create_emp('Eko', 'Nugroho', 'Direktur Program', 'PRG', supervisor=ceo)

        # Level 3: Department Heads (report to Directors)
        # Research Division Heads
        head_eco = create_emp('Firman', 'Hidayat', 'Kepala Divisi Ekonomi', 'RES-ECO', supervisor=dir_research)
        head_pol = create_emp('Gita', 'Setiawan', 'Kepala Divisi Politik', 'RES-POL', supervisor=dir_research)
        head_soc = create_emp('Hendra', 'Permana', 'Kepala Divisi Sosial', 'RES-SOC', supervisor=dir_research)
        head_int = create_emp('Intan', 'Suryadi', 'Kepala Divisi Hub. Internasional', 'RES-INT', supervisor=dir_research)

        # Communication Division Heads
        head_media = create_emp('Joko', 'Hartono', 'Kepala Divisi Media', 'COM-MED', supervisor=dir_comm)
        head_digital = create_emp('Kartini', 'Susanto', 'Kepala Divisi Digital', 'COM-DIG', supervisor=dir_comm)

        # Operations Division Heads
        head_fin = create_emp('Lukman', 'Utomo', 'Kepala Divisi Keuangan', 'OPS-FIN', supervisor=dir_ops)
        head_hr = create_emp('Maya', 'Wibowo', 'Kepala Divisi SDM', 'OPS-HR', supervisor=dir_ops)
        head_ga = create_emp('Nanda', 'Prasetyo', 'Kepala Divisi Umum', 'OPS-GA', supervisor=dir_ops)
        head_it = create_emp('Oktavia', 'Kurniawan', 'Kepala Divisi IT', 'OPS-IT', supervisor=dir_ops)

        # Program Division Heads
        head_event = create_emp('Purnomo', 'Rahman', 'Kepala Divisi Event', 'PRG-EVT', supervisor=dir_program)
        head_partner = create_emp('Ratna', 'Handoko', 'Kepala Divisi Kemitraan', 'PRG-PTR', supervisor=dir_program)

        # Level 4: Staff (report to Division Heads)
        # Research Staff
        create_emp('Slamet', 'Putra', 'Peneliti Senior', 'RES-ECO', supervisor=head_eco, emp_type=EmploymentType.RESEARCH_FELLOW)
        create_emp('Taufik', 'Surya', 'Peneliti', 'RES-ECO', supervisor=head_eco, emp_type=EmploymentType.RESEARCH_FELLOW)
        create_emp('Umar', 'Santoso', 'Peneliti', 'RES-POL', supervisor=head_pol, emp_type=EmploymentType.RESEARCH_FELLOW)
        create_emp('Vina', 'Wijaya', 'Peneliti Junior', 'RES-POL', supervisor=head_pol, emp_type=EmploymentType.RESEARCH_FELLOW)
        create_emp('Wahyu', 'Kusuma', 'Peneliti Senior', 'RES-SOC', supervisor=head_soc, emp_type=EmploymentType.RESEARCH_FELLOW)
        create_emp('Yanti', 'Pratama', 'Peneliti', 'RES-INT', supervisor=head_int, emp_type=EmploymentType.RESEARCH_FELLOW)

        # Communication Staff
        create_emp('Zainal', 'Saputra', 'Editor Senior', 'COM-MED', supervisor=head_media)
        create_emp('Ani', 'Nugroho', 'Public Relations Officer', 'COM-MED', supervisor=head_media)
        create_emp('Bunga', 'Hidayat', 'Social Media Specialist', 'COM-DIG', supervisor=head_digital)
        create_emp('Endah', 'Setiawan', 'Web Developer', 'COM-DIG', supervisor=head_digital)

        # Operations Staff
        create_emp('Fitri', 'Permana', 'Accounting Staff', 'OPS-FIN', supervisor=head_fin)
        create_emp('Hani', 'Suryadi', 'HR Staff', 'OPS-HR', supervisor=head_hr)
        create_emp('Julia', 'Hartono', 'Admin Staff', 'OPS-GA', supervisor=head_ga)
        create_emp('Lestari', 'Susanto', 'IT Support', 'OPS-IT', supervisor=head_it)
        create_emp('Nurul', 'Utomo', 'System Administrator', 'OPS-IT', supervisor=head_it)

        # Program Staff
        create_emp('Putri', 'Wibowo', 'Event Coordinator', 'PRG-EVT', supervisor=head_event)
        create_emp('Sari', 'Prasetyo', 'Partnership Officer', 'PRG-PTR', supervisor=head_partner)

        # Level 5: Interns (report to Staff or Division Heads)
        create_emp('Titi', 'Kurniawan', 'Research Intern', 'RES-ECO', supervisor=head_eco, emp_type=EmploymentType.INTERN)
        create_emp('Umi', 'Rahman', 'Communication Intern', 'COM-DIG', supervisor=head_digital, emp_type=EmploymentType.INTERN)
        create_emp('Wulan', 'Handoko', 'Admin Intern', 'OPS-GA', supervisor=head_ga, emp_type=EmploymentType.INTERN)

        return employees

    def create_payroll_data(self, employees):
        """Create salary components, payroll period, and payslips."""
        current_year = date.today().year
        current_month = date.today().month

        # Base salaries by position type (in IDR)
        base_salaries = {
            EmploymentType.STAFF: (8000000, 15000000),
            EmploymentType.INTERN: (3000000, 5000000),
            EmploymentType.RESEARCH_FELLOW: (10000000, 20000000),
            EmploymentType.CONTRACT: (6000000, 12000000),
        }

        # Create salary components for each employee
        for employee in employees:
            salary_range = base_salaries.get(employee.employment_type, (5000000, 10000000))
            basic_salary = random.randint(*salary_range)

            # Transport allowance
            SalaryComponent.objects.create(
                employee=employee,
                component_type='allowance',
                component_name='Tunjangan Transportasi',
                amount=Decimal('500000'),
                is_fixed=True,
                effective_date=employee.join_date or date.today(),
            )
            # Meal allowance
            SalaryComponent.objects.create(
                employee=employee,
                component_type='allowance',
                component_name='Tunjangan Makan',
                amount=Decimal('750000'),
                is_fixed=True,
                effective_date=employee.join_date or date.today(),
            )
            # Health allowance
            SalaryComponent.objects.create(
                employee=employee,
                component_type='allowance',
                component_name='Tunjangan Kesehatan',
                amount=Decimal('400000'),
                is_fixed=True,
                effective_date=employee.join_date or date.today(),
            )
            # BPJS Kesehatan deduction
            SalaryComponent.objects.create(
                employee=employee,
                component_type='deduction',
                component_name='BPJS Kesehatan',
                amount=Decimal(str(int(basic_salary * 0.01))),
                is_fixed=True,
                effective_date=employee.join_date or date.today(),
            )
            # BPJS Ketenagakerjaan deduction
            SalaryComponent.objects.create(
                employee=employee,
                component_type='deduction',
                component_name='BPJS Ketenagakerjaan',
                amount=Decimal(str(int(basic_salary * 0.02))),
                is_fixed=True,
                effective_date=employee.join_date or date.today(),
            )

        # Create payroll period for current month
        period = PayrollPeriod.objects.create(
            year=current_year,
            month=current_month,
            start_date=date(current_year, current_month, 1),
            end_date=date(current_year, current_month, 28),
            status=PayrollStatus.DRAFT,
            total_employees=len(employees),
        )

        # Create payslips for each employee
        total_gross = Decimal('0')
        total_deductions = Decimal('0')
        total_net = Decimal('0')

        for employee in employees:
            salary_range = base_salaries.get(employee.employment_type, (5000000, 10000000))
            basic_salary = Decimal(str(random.randint(*salary_range)))

            # Get attendance summary
            try:
                summary = AttendanceSummary.objects.get(
                    employee=employee,
                    year=current_year,
                    month=current_month,
                )
                present_days = summary.present_days + summary.late_days + summary.wfh_days
                absent_days = summary.absent_days
                overtime_hours = float(summary.total_overtime_hours)
            except AttendanceSummary.DoesNotExist:
                present_days = 20
                absent_days = 0
                overtime_hours = 0

            # Calculate overtime pay (1.5x hourly rate)
            hourly_rate = basic_salary / Decimal('176')  # 22 days * 8 hours
            overtime_pay = hourly_rate * Decimal('1.5') * Decimal(str(overtime_hours))

            payslip = Payslip.objects.create(
                payroll_period=period,
                employee=employee,
                basic_salary=basic_salary,
                working_days=22,
                present_days=present_days,
                absent_days=absent_days,
                overtime_hours=Decimal(str(overtime_hours)),
                overtime_pay=overtime_pay,
                status=PayrollStatus.DRAFT,
            )

            # Add allowances
            allowances = SalaryComponent.objects.filter(
                employee=employee,
                component_type='allowance',
            )
            total_allowances = Decimal('0')
            for allowance in allowances:
                PayslipItem.objects.create(
                    payslip=payslip,
                    item_type='allowance',
                    name=allowance.component_name,
                    amount=allowance.amount,
                )
                total_allowances += allowance.amount

            # Add deductions
            deductions = SalaryComponent.objects.filter(
                employee=employee,
                component_type='deduction',
            )
            total_ded = Decimal('0')
            for deduction in deductions:
                PayslipItem.objects.create(
                    payslip=payslip,
                    item_type='deduction',
                    name=deduction.component_name,
                    amount=deduction.amount,
                )
                total_ded += deduction.amount

            # Update payslip totals
            payslip.total_allowances = total_allowances
            payslip.total_deductions = total_ded
            payslip.calculate()
            payslip.save()

            total_gross += payslip.gross_salary
            total_deductions += payslip.total_deductions
            total_net += payslip.net_salary

        # Update period totals
        period.total_gross = total_gross
        period.total_deductions = total_deductions
        period.total_net = total_net
        period.save()
