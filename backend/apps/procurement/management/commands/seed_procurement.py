"""
Seed command for Procurement module.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from apps.users.models import User
from apps.procurement.vendor.models import (
    Vendor, VendorContact, VendorEvaluation,
    VendorStatus, VendorCategory, VendorType,
)
from apps.procurement.purchase_order.models import (
    PurchaseOrder, POItem, POStatus, POPriority,
)


class Command(BaseCommand):
    help = 'Seed Procurement with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Procurement...')

        # Get admin user
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@nalar.id',
                password='admin123',
            )

        # Create vendors
        vendors_data = [
            {
                'name': 'PT Mitra Sejahtera',
                'vendor_type': VendorType.PT,
                'category': VendorCategory.GOODS,
                'status': VendorStatus.ACTIVE,
                'npwp': '01.234.567.8-901.000',
                'address': 'Jl. Sudirman No. 123',
                'city': 'Jakarta Selatan',
                'province': 'DKI Jakarta',
                'postal_code': '12190',
                'phone': '021-5551234',
                'email': 'info@mitrasejahtera.co.id',
                'contact_person': 'Budi Santoso',
                'contact_phone': '08123456789',
                'bank_name': 'Bank Mandiri',
                'bank_account_number': '1234567890',
                'bank_account_name': 'PT Mitra Sejahtera',
                'payment_terms': 30,
                'rating': 4,
            },
            {
                'name': 'CV Berkah Jaya',
                'vendor_type': VendorType.CV,
                'category': VendorCategory.GOODS,
                'status': VendorStatus.ACTIVE,
                'npwp': '02.345.678.9-012.000',
                'address': 'Jl. Gatot Subroto No. 45',
                'city': 'Bandung',
                'province': 'Jawa Barat',
                'postal_code': '40123',
                'phone': '022-7771234',
                'email': 'order@berkahjaya.com',
                'contact_person': 'Dewi Lestari',
                'contact_phone': '08234567890',
                'bank_name': 'Bank BCA',
                'bank_account_number': '0987654321',
                'bank_account_name': 'CV Berkah Jaya',
                'payment_terms': 14,
                'rating': 5,
            },
            {
                'name': 'PT Tech Solutions Indonesia',
                'vendor_type': VendorType.PT,
                'category': VendorCategory.SERVICES,
                'status': VendorStatus.ACTIVE,
                'npwp': '03.456.789.0-123.000',
                'address': 'Menara BCA Lt. 20',
                'city': 'Jakarta Pusat',
                'province': 'DKI Jakarta',
                'postal_code': '10310',
                'phone': '021-3331234',
                'email': 'sales@techsolutions.id',
                'contact_person': 'Andi Wijaya',
                'contact_phone': '08345678901',
                'bank_name': 'Bank BNI',
                'bank_account_number': '1122334455',
                'bank_account_name': 'PT Tech Solutions Indonesia',
                'payment_terms': 30,
                'rating': 4,
            },
            {
                'name': 'UD Prima Abadi',
                'vendor_type': VendorType.UD,
                'category': VendorCategory.GOODS,
                'status': VendorStatus.ACTIVE,
                'address': 'Jl. Raya Bogor No. 78',
                'city': 'Bogor',
                'province': 'Jawa Barat',
                'postal_code': '16153',
                'phone': '0251-8881234',
                'email': 'prima.abadi@gmail.com',
                'contact_person': 'Hendra Gunawan',
                'contact_phone': '08456789012',
                'bank_name': 'Bank BRI',
                'bank_account_number': '5566778899',
                'bank_account_name': 'Hendra Gunawan',
                'payment_terms': 7,
                'rating': 3,
            },
            {
                'name': 'PT Konsultan Profesional',
                'vendor_type': VendorType.PT,
                'category': VendorCategory.SERVICES,
                'status': VendorStatus.ACTIVE,
                'npwp': '04.567.890.1-234.000',
                'address': 'Plaza Indonesia Lt. 15',
                'city': 'Jakarta Pusat',
                'province': 'DKI Jakarta',
                'postal_code': '10350',
                'phone': '021-2221234',
                'email': 'info@konsultanpro.co.id',
                'contact_person': 'Ratna Sari',
                'contact_phone': '08567890123',
                'bank_name': 'Bank CIMB Niaga',
                'bank_account_number': '6677889900',
                'bank_account_name': 'PT Konsultan Profesional',
                'payment_terms': 45,
                'rating': 5,
            },
            {
                'name': 'CV Supplies Center',
                'vendor_type': VendorType.CV,
                'category': VendorCategory.BOTH,
                'status': VendorStatus.PENDING,
                'address': 'Jl. Mangga Dua Raya No. 100',
                'city': 'Jakarta Utara',
                'province': 'DKI Jakarta',
                'postal_code': '14430',
                'phone': '021-6661234',
                'email': 'order@suppliescenter.com',
                'contact_person': 'Willy Tan',
                'contact_phone': '08678901234',
                'bank_name': 'Bank Danamon',
                'bank_account_number': '7788990011',
                'bank_account_name': 'CV Supplies Center',
                'payment_terms': 21,
                'rating': 3,
            },
        ]

        vendors = {}
        for data in vendors_data:
            vendor, created = Vendor.objects.get_or_create(
                name=data['name'],
                defaults={
                    **data,
                    'created_by': admin,
                    'updated_by': admin,
                }
            )
            vendors[data['name']] = vendor
            if created:
                self.stdout.write(f'  Created vendor: {vendor.code} - {vendor.name}')

        # Create purchase orders
        today = timezone.now().date()

        po_data = [
            {
                'vendor': vendors.get('PT Mitra Sejahtera'),
                'status': POStatus.CLOSED,
                'priority': POPriority.NORMAL,
                'items': [
                    {'item_name': 'Kertas A4 80gsm', 'quantity': 100, 'unit_price': 45000, 'unit': 'rim'},
                    {'item_name': 'Tinta Printer HP', 'quantity': 20, 'unit_price': 350000, 'unit': 'pcs'},
                    {'item_name': 'Pulpen Pilot', 'quantity': 200, 'unit_price': 5000, 'unit': 'pcs'},
                ],
            },
            {
                'vendor': vendors.get('CV Berkah Jaya'),
                'status': POStatus.SENT,
                'priority': POPriority.HIGH,
                'items': [
                    {'item_name': 'Laptop Dell Latitude', 'quantity': 5, 'unit_price': 15000000, 'unit': 'unit'},
                    {'item_name': 'Mouse Logitech', 'quantity': 10, 'unit_price': 250000, 'unit': 'pcs'},
                ],
            },
            {
                'vendor': vendors.get('PT Tech Solutions Indonesia'),
                'status': POStatus.APPROVED,
                'priority': POPriority.NORMAL,
                'items': [
                    {'item_name': 'Jasa Maintenance Server', 'quantity': 1, 'unit_price': 5000000, 'unit': 'paket'},
                    {'item_name': 'Lisensi Antivirus (1 tahun)', 'quantity': 50, 'unit_price': 500000, 'unit': 'user'},
                ],
            },
            {
                'vendor': vendors.get('UD Prima Abadi'),
                'status': POStatus.PENDING_APPROVAL,
                'priority': POPriority.LOW,
                'items': [
                    {'item_name': 'Aqua Galon', 'quantity': 50, 'unit_price': 20000, 'unit': 'galon'},
                    {'item_name': 'Tissue Paseo', 'quantity': 100, 'unit_price': 15000, 'unit': 'pack'},
                    {'item_name': 'Kopi Kapal Api', 'quantity': 30, 'unit_price': 25000, 'unit': 'pack'},
                ],
            },
            {
                'vendor': vendors.get('PT Konsultan Profesional'),
                'status': POStatus.DRAFT,
                'priority': POPriority.URGENT,
                'items': [
                    {'item_name': 'Jasa Konsultasi Hukum', 'quantity': 10, 'unit_price': 2500000, 'unit': 'jam'},
                ],
            },
        ]

        for data in po_data:
            vendor = data.pop('vendor')
            if not vendor:
                continue

            items_data = data.pop('items')

            # Check if PO exists for this vendor with similar items
            existing = PurchaseOrder.objects.filter(
                vendor=vendor,
                status=data['status'],
            ).first()

            if existing:
                continue

            po = PurchaseOrder.objects.create(
                vendor=vendor,
                order_date=today,
                expected_delivery_date=today + timezone.timedelta(days=14),
                requested_by=admin,
                created_by=admin,
                updated_by=admin,
                **data
            )

            for item_data in items_data:
                POItem.objects.create(
                    purchase_order=po,
                    item_name=item_data['item_name'],
                    quantity=Decimal(str(item_data['quantity'])),
                    unit_price=Decimal(str(item_data['unit_price'])),
                    unit=item_data['unit'],
                )

            self.stdout.write(f'  Created PO: {po.po_number} - {po.vendor.name} ({po.get_status_display()})')

        self.stdout.write(self.style.SUCCESS('Procurement seeded successfully!'))
