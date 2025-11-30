from django.core.management.base import BaseCommand
from apps.organization.models import Department, Team


class Command(BaseCommand):
    help = 'Seed organization data with departments and teams'

    def handle(self, *args, **options):
        self.stdout.write('Seeding organization data...')

        # Clear existing data
        Team.objects.all().delete()
        Department.objects.all().delete()

        # Create departments (Indonesian think tank / research organization structure)
        departments_data = [
            {
                'name': 'Direktorat Eksekutif',
                'code': 'DIR',
                'description': 'Pimpinan dan manajemen strategis organisasi',
                'children': []
            },
            {
                'name': 'Departemen Riset',
                'code': 'RES',
                'description': 'Penelitian dan analisis kebijakan',
                'children': [
                    {'name': 'Divisi Ekonomi', 'code': 'RES-ECO', 'description': 'Riset ekonomi dan kebijakan fiskal'},
                    {'name': 'Divisi Politik', 'code': 'RES-POL', 'description': 'Riset politik dan pemerintahan'},
                    {'name': 'Divisi Sosial', 'code': 'RES-SOC', 'description': 'Riset sosial dan kebijakan publik'},
                    {'name': 'Divisi Hubungan Internasional', 'code': 'RES-INT', 'description': 'Riset hubungan luar negeri'},
                ]
            },
            {
                'name': 'Departemen Komunikasi',
                'code': 'COM',
                'description': 'Publikasi, media, dan hubungan masyarakat',
                'children': [
                    {'name': 'Divisi Media', 'code': 'COM-MED', 'description': 'Media relations dan publikasi'},
                    {'name': 'Divisi Digital', 'code': 'COM-DIG', 'description': 'Platform digital dan sosial media'},
                ]
            },
            {
                'name': 'Departemen Operasional',
                'code': 'OPS',
                'description': 'Dukungan operasional organisasi',
                'children': [
                    {'name': 'Divisi Keuangan', 'code': 'OPS-FIN', 'description': 'Manajemen keuangan dan akuntansi'},
                    {'name': 'Divisi SDM', 'code': 'OPS-HR', 'description': 'Sumber daya manusia'},
                    {'name': 'Divisi Umum', 'code': 'OPS-GA', 'description': 'General affairs dan fasilitas'},
                    {'name': 'Divisi IT', 'code': 'OPS-IT', 'description': 'Teknologi informasi'},
                ]
            },
            {
                'name': 'Departemen Program',
                'code': 'PRG',
                'description': 'Manajemen program dan proyek',
                'children': [
                    {'name': 'Divisi Event', 'code': 'PRG-EVT', 'description': 'Pengelolaan acara dan konferensi'},
                    {'name': 'Divisi Kemitraan', 'code': 'PRG-PTR', 'description': 'Hubungan dengan donor dan mitra'},
                ]
            },
        ]

        departments = []
        for dept_data in departments_data:
            parent = Department.objects.create(
                name=dept_data['name'],
                code=dept_data['code'],
                description=dept_data['description'],
            )
            departments.append(parent)
            self.stdout.write(f"  Created department: {parent.name}")

            for child_data in dept_data.get('children', []):
                child = Department.objects.create(
                    name=child_data['name'],
                    code=child_data['code'],
                    description=child_data['description'],
                    parent=parent,
                )
                departments.append(child)
                self.stdout.write(f"    Created sub-department: {child.name}")

        # Create teams within departments
        teams_data = [
            ('RES-ECO', ['Tim Makroekonomi', 'Tim Perdagangan', 'Tim Kebijakan Fiskal']),
            ('RES-POL', ['Tim Analisis Politik', 'Tim Pemilu']),
            ('RES-SOC', ['Tim Kesehatan', 'Tim Pendidikan', 'Tim Kemiskinan']),
            ('RES-INT', ['Tim ASEAN', 'Tim Indo-Pacific']),
            ('COM-MED', ['Tim Publikasi', 'Tim Humas']),
            ('COM-DIG', ['Tim Web', 'Tim Sosial Media']),
            ('OPS-IT', ['Tim Infrastruktur', 'Tim Development']),
        ]

        for dept_code, team_names in teams_data:
            try:
                dept = Department.objects.get(code=dept_code)
                for team_name in team_names:
                    team = Team.objects.create(
                        name=team_name,
                        department=dept,
                    )
                    self.stdout.write(f"    Created team: {team_name} in {dept.name}")
            except Department.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"    Department {dept_code} not found"))

        total_depts = Department.objects.count()
        total_teams = Team.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'Successfully created {total_depts} departments and {total_teams} teams'
        ))
