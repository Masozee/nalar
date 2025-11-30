"""
Seed command for Inventory module.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from apps.users.models import User
from apps.inventory.sku.models import (
    SKU, Warehouse, StockRecord, StockMovement,
    ItemCategory, UnitOfMeasure,
)
from apps.inventory.stock_opname.models import StockOpname, OpnameStatus
from apps.inventory.stock_transfer.models import StockTransfer, StockTransferItem, TransferStatus


class Command(BaseCommand):
    help = 'Seed Inventory with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Inventory...')

        # Get admin user
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@nalar.id',
                password='admin123',
            )

        # Create warehouses
        warehouses_data = [
            {'code': 'WH-JKT', 'name': 'Gudang Jakarta', 'is_default': True, 'address': 'Jl. Sudirman No. 1, Jakarta'},
            {'code': 'WH-BDG', 'name': 'Gudang Bandung', 'is_default': False, 'address': 'Jl. Braga No. 10, Bandung'},
            {'code': 'WH-SBY', 'name': 'Gudang Surabaya', 'is_default': False, 'address': 'Jl. Tunjungan No. 5, Surabaya'},
        ]

        warehouses = {}
        for data in warehouses_data:
            warehouse, created = Warehouse.objects.get_or_create(
                code=data['code'],
                defaults={
                    'name': data['name'],
                    'is_default': data['is_default'],
                    'address': data['address'],
                    'manager': admin,
                }
            )
            warehouses[data['code']] = warehouse
            if created:
                self.stdout.write(f'  Created warehouse: {warehouse.code} - {warehouse.name}')

        # Create SKUs
        skus_data = [
            # Office supplies
            {'name': 'Kertas A4 80gsm', 'category': ItemCategory.OFFICE_SUPPLIES, 'unit': UnitOfMeasure.RIM, 'unit_price': 45000, 'minimum_stock': 50, 'reorder_point': 30},
            {'name': 'Kertas F4 80gsm', 'category': ItemCategory.OFFICE_SUPPLIES, 'unit': UnitOfMeasure.RIM, 'unit_price': 50000, 'minimum_stock': 30, 'reorder_point': 20},
            {'name': 'Pulpen Pilot', 'category': ItemCategory.OFFICE_SUPPLIES, 'unit': UnitOfMeasure.PCS, 'unit_price': 5000, 'minimum_stock': 100, 'reorder_point': 50},
            {'name': 'Pensil 2B', 'category': ItemCategory.OFFICE_SUPPLIES, 'unit': UnitOfMeasure.PCS, 'unit_price': 3000, 'minimum_stock': 100, 'reorder_point': 50},
            {'name': 'Penghapus', 'category': ItemCategory.OFFICE_SUPPLIES, 'unit': UnitOfMeasure.PCS, 'unit_price': 2000, 'minimum_stock': 50, 'reorder_point': 25},
            {'name': 'Stapler HD-10', 'category': ItemCategory.OFFICE_SUPPLIES, 'unit': UnitOfMeasure.PCS, 'unit_price': 35000, 'minimum_stock': 20, 'reorder_point': 10},
            {'name': 'Isi Staples No.10', 'category': ItemCategory.OFFICE_SUPPLIES, 'unit': UnitOfMeasure.BOX, 'unit_price': 8000, 'minimum_stock': 50, 'reorder_point': 25},
            {'name': 'Paper Clip', 'category': ItemCategory.OFFICE_SUPPLIES, 'unit': UnitOfMeasure.BOX, 'unit_price': 5000, 'minimum_stock': 30, 'reorder_point': 15},
            {'name': 'Binder Clip', 'category': ItemCategory.OFFICE_SUPPLIES, 'unit': UnitOfMeasure.BOX, 'unit_price': 12000, 'minimum_stock': 30, 'reorder_point': 15},
            {'name': 'Post-it Notes', 'category': ItemCategory.OFFICE_SUPPLIES, 'unit': UnitOfMeasure.PACK, 'unit_price': 15000, 'minimum_stock': 50, 'reorder_point': 25},

            # IT Equipment
            {'name': 'Mouse Logitech M170', 'category': ItemCategory.IT_EQUIPMENT, 'unit': UnitOfMeasure.PCS, 'unit_price': 150000, 'minimum_stock': 10, 'reorder_point': 5},
            {'name': 'Keyboard Logitech K120', 'category': ItemCategory.IT_EQUIPMENT, 'unit': UnitOfMeasure.PCS, 'unit_price': 200000, 'minimum_stock': 10, 'reorder_point': 5},
            {'name': 'USB Flash Drive 32GB', 'category': ItemCategory.IT_EQUIPMENT, 'unit': UnitOfMeasure.PCS, 'unit_price': 75000, 'minimum_stock': 20, 'reorder_point': 10},
            {'name': 'Kabel HDMI 1.5m', 'category': ItemCategory.IT_EQUIPMENT, 'unit': UnitOfMeasure.PCS, 'unit_price': 50000, 'minimum_stock': 15, 'reorder_point': 8},
            {'name': 'Tinta Printer HP 680', 'category': ItemCategory.IT_EQUIPMENT, 'unit': UnitOfMeasure.PCS, 'unit_price': 180000, 'minimum_stock': 20, 'reorder_point': 10},

            # Pantry
            {'name': 'Aqua Galon', 'category': ItemCategory.PANTRY, 'unit': UnitOfMeasure.PCS, 'unit_price': 20000, 'minimum_stock': 20, 'reorder_point': 10},
            {'name': 'Kopi Kapal Api', 'category': ItemCategory.PANTRY, 'unit': UnitOfMeasure.PACK, 'unit_price': 25000, 'minimum_stock': 20, 'reorder_point': 10},
            {'name': 'Teh Sariwangi', 'category': ItemCategory.PANTRY, 'unit': UnitOfMeasure.BOX, 'unit_price': 15000, 'minimum_stock': 20, 'reorder_point': 10},
            {'name': 'Gula Pasir', 'category': ItemCategory.PANTRY, 'unit': UnitOfMeasure.KG, 'unit_price': 15000, 'minimum_stock': 10, 'reorder_point': 5},
            {'name': 'Creamer', 'category': ItemCategory.PANTRY, 'unit': UnitOfMeasure.PACK, 'unit_price': 20000, 'minimum_stock': 15, 'reorder_point': 8},

            # Cleaning
            {'name': 'Sapu', 'category': ItemCategory.CLEANING, 'unit': UnitOfMeasure.PCS, 'unit_price': 25000, 'minimum_stock': 10, 'reorder_point': 5},
            {'name': 'Pel Lantai', 'category': ItemCategory.CLEANING, 'unit': UnitOfMeasure.PCS, 'unit_price': 30000, 'minimum_stock': 10, 'reorder_point': 5},
            {'name': 'Pembersih Lantai', 'category': ItemCategory.CLEANING, 'unit': UnitOfMeasure.LITER, 'unit_price': 25000, 'minimum_stock': 20, 'reorder_point': 10},
            {'name': 'Tissue Paseo', 'category': ItemCategory.CLEANING, 'unit': UnitOfMeasure.PACK, 'unit_price': 15000, 'minimum_stock': 50, 'reorder_point': 25},
            {'name': 'Hand Sanitizer', 'category': ItemCategory.CLEANING, 'unit': UnitOfMeasure.LITER, 'unit_price': 50000, 'minimum_stock': 10, 'reorder_point': 5},
        ]

        skus = {}
        for data in skus_data:
            sku, created = SKU.objects.get_or_create(
                name=data['name'],
                defaults={
                    'category': data['category'],
                    'unit': data['unit'],
                    'unit_price': Decimal(str(data['unit_price'])),
                    'minimum_stock': Decimal(str(data['minimum_stock'])),
                    'reorder_point': Decimal(str(data['reorder_point'])),
                    'reorder_quantity': Decimal(str(data['minimum_stock'] * 2)),
                    'default_location': warehouses['WH-JKT'],
                    'created_by': admin,
                    'updated_by': admin,
                }
            )
            skus[data['name']] = sku
            if created:
                self.stdout.write(f'  Created SKU: {sku.sku_code} - {sku.name}')

        # Create stock records with initial quantities
        import random
        main_warehouse = warehouses['WH-JKT']
        for sku in SKU.objects.filter(is_active=True):
            # Random initial stock
            initial_qty = Decimal(str(random.randint(20, 100)))

            record, created = StockRecord.objects.get_or_create(
                sku=sku,
                warehouse=main_warehouse,
                defaults={
                    'quantity': initial_qty,
                    'created_by': admin,
                    'updated_by': admin,
                }
            )

            if created:
                # Create initial stock movement
                StockMovement.objects.create(
                    sku=sku,
                    warehouse=main_warehouse,
                    movement_type='in',
                    quantity=initial_qty,
                    quantity_before=Decimal('0'),
                    quantity_after=initial_qty,
                    reference_type='initial_stock',
                    notes='Stok awal',
                    created_by=admin,
                    updated_by=admin,
                )

        self.stdout.write(f'  Created stock records for {SKU.objects.count()} SKUs')

        # Create a sample stock opname
        opname, created = StockOpname.objects.get_or_create(
            opname_number='SO-2025-0001',
            defaults={
                'warehouse': main_warehouse,
                'scheduled_date': timezone.now().date(),
                'status': OpnameStatus.DRAFT,
                'assigned_to': admin,
                'is_full_count': True,
                'created_by': admin,
                'updated_by': admin,
            }
        )
        if created:
            opname.generate_items()
            self.stdout.write(f'  Created stock opname: {opname.opname_number}')

        # Create a sample transfer
        if len(warehouses) >= 2:
            transfer, created = StockTransfer.objects.get_or_create(
                transfer_number='ST-2025-0001',
                defaults={
                    'source_warehouse': warehouses['WH-JKT'],
                    'destination_warehouse': warehouses['WH-BDG'],
                    'status': TransferStatus.DRAFT,
                    'requested_by': admin,
                    'reason': 'Pengisian stok gudang Bandung',
                    'created_by': admin,
                    'updated_by': admin,
                }
            )
            if created:
                # Add some items
                sample_skus = list(SKU.objects.filter(is_active=True)[:5])
                for sku in sample_skus:
                    StockTransferItem.objects.create(
                        transfer=transfer,
                        sku=sku,
                        quantity=Decimal('10'),
                    )
                self.stdout.write(f'  Created stock transfer: {transfer.transfer_number}')

        self.stdout.write(self.style.SUCCESS('Inventory seeded successfully!'))
