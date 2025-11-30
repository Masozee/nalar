"""
Seed command for Assets module.
Creates sample assets, maintenance records, and assignments.
"""
import random
from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User
from apps.assets.maintenance.models import (
    Asset, MaintenanceSchedule, MaintenanceRecord,
    AssetCategory, AssetStatus, MaintenanceType, MaintenanceStatus,
)
from apps.assets.assignment.models import (
    AssetAssignment, AssignmentType, AssignmentStatus,
)


class Command(BaseCommand):
    help = 'Seed assets data with Indonesian context'

    def handle(self, *args, **options):
        self.stdout.write('Seeding assets data...')

        users = list(User.objects.all()[:10])
        if len(users) < 2:
            self.stdout.write(self.style.WARNING('Need at least 2 users. Run seed_hr first.'))
            return

        assets = self.create_assets()
        self.create_maintenance_schedules(assets)
        self.create_maintenance_records(assets)
        self.create_assignments(assets, users)

        self.stdout.write(self.style.SUCCESS(
            f'Created {len(assets)} assets with maintenance and assignments'
        ))

    def create_assets(self):
        """Create various types of assets."""
        assets = []

        asset_data = [
            # IT Equipment
            ('IT-LAP-001', 'Laptop Dell Latitude 5520', AssetCategory.IT_EQUIPMENT, 'Dell', 'Latitude 5520', Decimal('15000000')),
            ('IT-LAP-002', 'Laptop Dell Latitude 5520', AssetCategory.IT_EQUIPMENT, 'Dell', 'Latitude 5520', Decimal('15000000')),
            ('IT-LAP-003', 'Laptop HP EliteBook 840', AssetCategory.IT_EQUIPMENT, 'HP', 'EliteBook 840', Decimal('14500000')),
            ('IT-LAP-004', 'Laptop Lenovo ThinkPad X1', AssetCategory.IT_EQUIPMENT, 'Lenovo', 'ThinkPad X1', Decimal('18000000')),
            ('IT-LAP-005', 'MacBook Pro 14"', AssetCategory.IT_EQUIPMENT, 'Apple', 'MacBook Pro 14', Decimal('35000000')),
            ('IT-MON-001', 'Monitor Dell 24"', AssetCategory.IT_EQUIPMENT, 'Dell', 'P2422H', Decimal('3500000')),
            ('IT-MON-002', 'Monitor Dell 24"', AssetCategory.IT_EQUIPMENT, 'Dell', 'P2422H', Decimal('3500000')),
            ('IT-MON-003', 'Monitor LG 27"', AssetCategory.IT_EQUIPMENT, 'LG', '27UK850', Decimal('5500000')),
            ('IT-PRN-001', 'Printer HP LaserJet Pro', AssetCategory.IT_EQUIPMENT, 'HP', 'LaserJet Pro M404', Decimal('4500000')),
            ('IT-PRN-002', 'Printer Canon imageCLASS', AssetCategory.IT_EQUIPMENT, 'Canon', 'imageCLASS MF445dw', Decimal('6500000')),
            ('IT-PRJ-001', 'Proyektor Epson EB-X51', AssetCategory.IT_EQUIPMENT, 'Epson', 'EB-X51', Decimal('7500000')),
            ('IT-PRJ-002', 'Proyektor BenQ MH733', AssetCategory.IT_EQUIPMENT, 'BenQ', 'MH733', Decimal('12000000')),
            ('IT-SVR-001', 'Server Dell PowerEdge', AssetCategory.IT_EQUIPMENT, 'Dell', 'PowerEdge R740', Decimal('150000000')),

            # Furniture
            ('FRN-DSK-001', 'Meja Kerja Executive', AssetCategory.FURNITURE, 'Informa', 'Executive Desk', Decimal('5000000')),
            ('FRN-DSK-002', 'Meja Kerja Staff', AssetCategory.FURNITURE, 'IKEA', 'BEKANT', Decimal('3500000')),
            ('FRN-CHR-001', 'Kursi Direktur', AssetCategory.FURNITURE, 'Ergotec', 'LX-960', Decimal('8000000')),
            ('FRN-CHR-002', 'Kursi Staff Ergonomis', AssetCategory.FURNITURE, 'Ergotec', 'LX-660', Decimal('3500000')),
            ('FRN-CAB-001', 'Lemari Arsip 4 Laci', AssetCategory.FURNITURE, 'Brother', 'FC-104', Decimal('2500000')),

            # Electronics
            ('ELC-AC-001', 'AC Daikin 2PK', AssetCategory.ELECTRONICS, 'Daikin', 'FTKC50TV', Decimal('12000000')),
            ('ELC-AC-002', 'AC Panasonic 1.5PK', AssetCategory.ELECTRONICS, 'Panasonic', 'CS-PN12VKJ', Decimal('8000000')),
            ('ELC-TV-001', 'TV Samsung 55"', AssetCategory.ELECTRONICS, 'Samsung', 'UA55AU7000', Decimal('9500000')),

            # Office Equipment
            ('OFC-PHN-001', 'Telepon IP Cisco', AssetCategory.OFFICE_EQUIPMENT, 'Cisco', '7841', Decimal('3000000')),
            ('OFC-FAX-001', 'Mesin Fax Panasonic', AssetCategory.OFFICE_EQUIPMENT, 'Panasonic', 'KX-FT987', Decimal('2500000')),
            ('OFC-SCN-001', 'Scanner Epson DS-530', AssetCategory.OFFICE_EQUIPMENT, 'Epson', 'DS-530', Decimal('5500000')),
        ]

        locations = ['Lantai 1', 'Lantai 2', 'Lantai 3', 'Lantai 4', 'Lantai 5']
        departments = ['IT', 'Riset', 'Keuangan', 'SDM', 'Operasional', 'Komunikasi']

        for code, name, category, brand, model, price in asset_data:
            purchase_date = timezone.now().date() - timedelta(days=random.randint(30, 1095))
            asset, created = Asset.objects.get_or_create(
                asset_code=code,
                defaults={
                    'name': name,
                    'category': category,
                    'brand': brand,
                    'model': model,
                    'serial_number': f'SN-{random.randint(100000, 999999)}',
                    'purchase_date': purchase_date,
                    'purchase_price': price,
                    'vendor': random.choice(['PT Datascrip', 'PT Synnex Metrodata', 'PT Bhinneka']),
                    'warranty_expiry': purchase_date + timedelta(days=random.choice([365, 730, 1095])),
                    'location': random.choice(locations),
                    'department': random.choice(departments),
                    'status': random.choice([AssetStatus.ACTIVE] * 9 + [AssetStatus.MAINTENANCE]),
                    'useful_life_years': 5,
                    'salvage_value': price * Decimal('0.1'),
                }
            )
            assets.append(asset)

        return assets

    def create_maintenance_schedules(self, assets):
        """Create maintenance schedules for assets."""
        it_assets = [a for a in assets if a.category == AssetCategory.IT_EQUIPMENT]
        ac_assets = [a for a in assets if 'AC' in a.name]

        # Laptop maintenance
        for asset in it_assets[:5]:
            MaintenanceSchedule.objects.get_or_create(
                asset=asset,
                title='Pembersihan dan Pengecekan Rutin',
                defaults={
                    'description': 'Pembersihan hardware, pengecekan software, update sistem',
                    'maintenance_type': MaintenanceType.PREVENTIVE,
                    'frequency_days': 90,
                    'next_due': timezone.now().date() + timedelta(days=random.randint(1, 90)),
                    'notify_days_before': 7,
                }
            )

        # AC maintenance
        for asset in ac_assets:
            MaintenanceSchedule.objects.get_or_create(
                asset=asset,
                title='Service AC Berkala',
                defaults={
                    'description': 'Pembersihan filter, pengecekan freon, general cleaning',
                    'maintenance_type': MaintenanceType.PREVENTIVE,
                    'frequency_days': 90,
                    'next_due': timezone.now().date() + timedelta(days=random.randint(1, 30)),
                    'notify_days_before': 14,
                }
            )

    def create_maintenance_records(self, assets):
        """Create maintenance history records."""
        maintenance_types = [
            ('Perbaikan LCD', MaintenanceType.CORRECTIVE, Decimal('2500000')),
            ('Ganti Baterai', MaintenanceType.CORRECTIVE, Decimal('1500000')),
            ('Service Rutin', MaintenanceType.PREVENTIVE, Decimal('350000')),
            ('Upgrade RAM', MaintenanceType.CORRECTIVE, Decimal('1200000')),
            ('Ganti Keyboard', MaintenanceType.CORRECTIVE, Decimal('800000')),
            ('Cleaning Internal', MaintenanceType.PREVENTIVE, Decimal('250000')),
        ]

        vendors = ['PT Datascrip Service', 'CV Teknik Mandiri', 'PT Maintenance Pro']

        for _ in range(15):
            asset = random.choice(assets)
            title, m_type, cost = random.choice(maintenance_types)
            date = timezone.now().date() - timedelta(days=random.randint(7, 180))

            MaintenanceRecord.objects.create(
                asset=asset,
                title=title,
                description=f'{title} untuk {asset.name}',
                maintenance_type=m_type,
                status=MaintenanceStatus.COMPLETED,
                scheduled_date=date,
                started_at=timezone.now() - timedelta(days=random.randint(7, 180)),
                completed_at=timezone.now() - timedelta(days=random.randint(1, 7)),
                vendor=random.choice(vendors),
                labor_cost=cost * Decimal('0.3'),
                parts_cost=cost * Decimal('0.7'),
            )

    def create_assignments(self, assets, users):
        """Create asset assignments to users."""
        assignable_assets = [a for a in assets if a.category in [AssetCategory.IT_EQUIPMENT, AssetCategory.FURNITURE]]

        for i, asset in enumerate(assignable_assets[:15]):
            if 'Laptop' in asset.name or 'Monitor' in asset.name:
                user = users[i % len(users)]
                assignment = AssetAssignment.objects.create(
                    asset=asset,
                    assigned_to=user,
                    assignment_type=AssignmentType.PERMANENT,
                    status=AssignmentStatus.ACTIVE,
                    purpose=f'Peralatan kerja untuk {user.email}',
                    location=asset.location,
                    condition_at_assignment='Baik, tidak ada kerusakan',
                )
