from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from django.utils import timezone
from apps.users.models import User
from apps.inventory.sku.models import (
    SKU, Warehouse, StockRecord, StockMovement,
    ItemCategory, UnitOfMeasure,
)
from apps.inventory.stock_opname.models import (
    StockOpname, StockOpnameItem, OpnameStatus,
)
from apps.inventory.stock_transfer.models import (
    StockTransfer, StockTransferItem, TransferStatus, TransferPriority,
)


class SKUModelTest(TestCase):
    def test_create_sku(self):
        sku = SKU.objects.create(
            name='Kertas A4',
            category=ItemCategory.OFFICE_SUPPLIES,
            unit=UnitOfMeasure.RIM,
            unit_price=Decimal('45000'),
            minimum_stock=Decimal('10'),
        )
        self.assertIsNotNone(sku.sku_code)
        self.assertTrue(sku.sku_code.startswith('SKU-'))

    def test_sku_code_generation(self):
        sku1 = SKU.objects.create(name='Item 1')
        sku2 = SKU.objects.create(name='Item 2')
        self.assertEqual(sku1.sku_code, 'SKU-0001')
        self.assertEqual(sku2.sku_code, 'SKU-0002')

    def test_low_stock_property(self):
        sku = SKU.objects.create(
            name='Test Item',
            minimum_stock=Decimal('10'),
            current_stock=Decimal('5'),
        )
        self.assertTrue(sku.is_low_stock)

        sku.current_stock = Decimal('15')
        sku.save()
        self.assertFalse(sku.is_low_stock)


class WarehouseModelTest(TestCase):
    def test_create_warehouse(self):
        warehouse = Warehouse.objects.create(
            code='WH-001',
            name='Gudang Utama',
        )
        self.assertEqual(str(warehouse), 'WH-001 - Gudang Utama')

    def test_default_warehouse(self):
        wh1 = Warehouse.objects.create(code='WH-001', name='Warehouse 1', is_default=True)
        wh2 = Warehouse.objects.create(code='WH-002', name='Warehouse 2', is_default=True)

        wh1.refresh_from_db()
        self.assertFalse(wh1.is_default)
        self.assertTrue(wh2.is_default)


class StockRecordTest(TestCase):
    def setUp(self):
        self.sku = SKU.objects.create(name='Test Item')
        self.warehouse = Warehouse.objects.create(code='WH-001', name='Warehouse')

    def test_stock_record_updates_sku(self):
        record = StockRecord.objects.create(
            sku=self.sku,
            warehouse=self.warehouse,
            quantity=Decimal('100'),
        )
        self.sku.refresh_from_db()
        self.assertEqual(self.sku.current_stock, Decimal('100'))

    def test_available_quantity(self):
        record = StockRecord.objects.create(
            sku=self.sku,
            warehouse=self.warehouse,
            quantity=Decimal('100'),
            reserved_quantity=Decimal('20'),
        )
        self.assertEqual(record.available_quantity, Decimal('80'))


class StockOpnameTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.warehouse = Warehouse.objects.create(code='WH-001', name='Warehouse')
        self.sku = SKU.objects.create(name='Test Item', unit_price=Decimal('10000'))
        StockRecord.objects.create(
            sku=self.sku,
            warehouse=self.warehouse,
            quantity=Decimal('100'),
        )

    def test_create_opname(self):
        opname = StockOpname.objects.create(
            warehouse=self.warehouse,
            scheduled_date=timezone.now().date(),
            assigned_to=self.user,
        )
        self.assertTrue(opname.opname_number.startswith('SO-'))
        self.assertEqual(opname.status, OpnameStatus.DRAFT)

    def test_generate_items(self):
        opname = StockOpname.objects.create(
            warehouse=self.warehouse,
            scheduled_date=timezone.now().date(),
        )
        opname.generate_items()
        self.assertEqual(opname.total_items, 1)
        self.assertEqual(opname.items.count(), 1)

    def test_opname_item_variance(self):
        opname = StockOpname.objects.create(
            warehouse=self.warehouse,
            scheduled_date=timezone.now().date(),
        )
        opname.generate_items()

        item = opname.items.first()
        item.actual_quantity = Decimal('95')
        item.save()

        self.assertTrue(item.has_variance)
        self.assertEqual(item.variance_quantity, Decimal('-5'))
        self.assertEqual(item.variance_value, Decimal('-50000'))


class StockTransferTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.source = Warehouse.objects.create(code='WH-SRC', name='Source')
        self.dest = Warehouse.objects.create(code='WH-DST', name='Destination')
        self.sku = SKU.objects.create(name='Test Item')
        StockRecord.objects.create(
            sku=self.sku,
            warehouse=self.source,
            quantity=Decimal('100'),
        )

    def test_create_transfer(self):
        transfer = StockTransfer.objects.create(
            source_warehouse=self.source,
            destination_warehouse=self.dest,
            requested_by=self.user,
        )
        self.assertTrue(transfer.transfer_number.startswith('ST-'))
        self.assertEqual(transfer.status, TransferStatus.DRAFT)

    def test_ship_transfer(self):
        transfer = StockTransfer.objects.create(
            source_warehouse=self.source,
            destination_warehouse=self.dest,
            requested_by=self.user,
            status=TransferStatus.APPROVED,
        )
        StockTransferItem.objects.create(
            transfer=transfer,
            sku=self.sku,
            quantity=Decimal('50'),
        )

        transfer.ship(self.user)

        self.assertEqual(transfer.status, TransferStatus.IN_TRANSIT)

        # Check source stock reduced
        source_record = StockRecord.objects.get(sku=self.sku, warehouse=self.source)
        self.assertEqual(source_record.quantity, Decimal('50'))


class InventoryAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.warehouse = Warehouse.objects.create(code='WH-001', name='Main Warehouse')

    def test_list_skus(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:sku-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_sku(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:sku-list')
        data = {
            'name': 'New SKU',
            'category': ItemCategory.OFFICE_SUPPLIES,
            'unit': UnitOfMeasure.PCS,
            'unit_price': '10000',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_adjust_stock(self):
        self.client.force_authenticate(user=self.user)
        sku = SKU.objects.create(name='Test SKU')

        url = reverse('api_v1:sku-adjust-stock')
        data = {
            'sku_id': str(sku.id),
            'warehouse_id': str(self.warehouse.id),
            'adjustment_quantity': '50',
            'reason': 'Initial stock',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        sku.refresh_from_db()
        self.assertEqual(sku.current_stock, Decimal('50'))

    def test_list_warehouses(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:warehouse-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_stock_opname(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:stock-opname-list')
        data = {
            'warehouse': str(self.warehouse.id),
            'scheduled_date': timezone.now().date().isoformat(),
            'is_full_count': True,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_stock_transfer(self):
        self.client.force_authenticate(user=self.user)
        dest = Warehouse.objects.create(code='WH-002', name='Second Warehouse')

        url = reverse('api_v1:stock-transfer-list')
        data = {
            'source_warehouse': str(self.warehouse.id),
            'destination_warehouse': str(dest.id),
            'priority': TransferPriority.NORMAL,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
