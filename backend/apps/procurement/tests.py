from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from django.utils import timezone
from apps.users.models import User
from apps.procurement.vendor.models import (
    Vendor, VendorContact, VendorEvaluation,
    VendorStatus, VendorCategory, VendorType,
)
from apps.procurement.purchase_order.models import (
    PurchaseOrder, POItem, POReceipt, POReceiptItem,
    POStatus, POPriority, PaymentStatus,
)


class VendorModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )

    def test_create_vendor(self):
        vendor = Vendor.objects.create(
            name='PT Test Vendor',
            vendor_type=VendorType.PT,
            category=VendorCategory.GOODS,
            address='Jl. Test No. 1',
            city='Jakarta',
            province='DKI Jakarta',
            phone='021-1234567',
            email='test@vendor.com',
            contact_person='John Doe',
            contact_phone='08123456789',
        )
        self.assertIsNotNone(vendor.code)
        self.assertTrue(vendor.code.startswith('VND-'))
        self.assertEqual(vendor.status, VendorStatus.PENDING)

    def test_vendor_code_generation(self):
        v1 = Vendor.objects.create(
            name='Vendor 1',
            address='Address 1',
            city='Jakarta',
            province='DKI Jakarta',
            phone='021-111',
            email='v1@test.com',
            contact_person='Contact 1',
            contact_phone='081111',
        )
        v2 = Vendor.objects.create(
            name='Vendor 2',
            address='Address 2',
            city='Jakarta',
            province='DKI Jakarta',
            phone='021-222',
            email='v2@test.com',
            contact_person='Contact 2',
            contact_phone='081222',
        )
        self.assertEqual(v1.code, 'VND-0001')
        self.assertEqual(v2.code, 'VND-0002')


class VendorEvaluationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.vendor = Vendor.objects.create(
            name='Test Vendor',
            address='Address',
            city='Jakarta',
            province='DKI Jakarta',
            phone='021-111',
            email='vendor@test.com',
            contact_person='Contact',
            contact_phone='08111',
        )

    def test_evaluation_calculates_overall_score(self):
        evaluation = VendorEvaluation.objects.create(
            vendor=self.vendor,
            evaluation_date=timezone.now().date(),
            period_start=timezone.now().date(),
            period_end=timezone.now().date(),
            quality_score=5,
            delivery_score=4,
            price_score=3,
            service_score=4,
            compliance_score=4,
            evaluator=self.user,
        )
        # Average: (5+4+3+4+4)/5 = 4.0
        self.assertEqual(evaluation.overall_score, Decimal('4.00'))

    def test_evaluation_updates_vendor_rating(self):
        VendorEvaluation.objects.create(
            vendor=self.vendor,
            evaluation_date=timezone.now().date(),
            period_start=timezone.now().date(),
            period_end=timezone.now().date(),
            quality_score=5,
            delivery_score=5,
            price_score=5,
            service_score=5,
            compliance_score=5,
            evaluator=self.user,
        )
        self.vendor.refresh_from_db()
        self.assertEqual(self.vendor.rating, 5)


class PurchaseOrderModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.vendor = Vendor.objects.create(
            name='Test Vendor',
            status=VendorStatus.ACTIVE,
            address='Address',
            city='Jakarta',
            province='DKI Jakarta',
            phone='021-111',
            email='vendor@test.com',
            contact_person='Contact',
            contact_phone='08111',
        )

    def test_create_purchase_order(self):
        po = PurchaseOrder.objects.create(
            vendor=self.vendor,
            order_date=timezone.now().date(),
            requested_by=self.user,
        )
        self.assertIsNotNone(po.po_number)
        self.assertTrue(po.po_number.startswith('PO-'))
        self.assertEqual(po.status, POStatus.DRAFT)

    def test_po_item_total_calculation(self):
        po = PurchaseOrder.objects.create(
            vendor=self.vendor,
            order_date=timezone.now().date(),
            requested_by=self.user,
        )
        item = POItem.objects.create(
            purchase_order=po,
            item_name='Test Item',
            quantity=Decimal('10'),
            unit_price=Decimal('100000'),
        )
        self.assertEqual(item.total_price, Decimal('1000000'))

    def test_po_item_with_discount(self):
        po = PurchaseOrder.objects.create(
            vendor=self.vendor,
            order_date=timezone.now().date(),
            requested_by=self.user,
        )
        item = POItem.objects.create(
            purchase_order=po,
            item_name='Test Item',
            quantity=Decimal('10'),
            unit_price=Decimal('100000'),
            discount_percent=Decimal('10'),
        )
        # 10 * 100000 = 1000000, 10% discount = 900000
        self.assertEqual(item.total_price, Decimal('900000'))

    def test_po_total_calculation(self):
        po = PurchaseOrder.objects.create(
            vendor=self.vendor,
            order_date=timezone.now().date(),
            requested_by=self.user,
            tax_percent=Decimal('11'),
        )
        POItem.objects.create(
            purchase_order=po,
            item_name='Item 1',
            quantity=Decimal('5'),
            unit_price=Decimal('100000'),
        )
        POItem.objects.create(
            purchase_order=po,
            item_name='Item 2',
            quantity=Decimal('3'),
            unit_price=Decimal('200000'),
        )
        # Subtotal: 500000 + 600000 = 1100000
        # Tax 11%: 121000
        # Total: 1221000
        po.refresh_from_db()
        self.assertEqual(po.subtotal, Decimal('1100000'))
        self.assertEqual(po.tax_amount, Decimal('121000'))
        self.assertEqual(po.total_amount, Decimal('1221000'))


class VendorAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='adminpass123',
        )

    def test_list_vendors(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:vendor-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_vendor(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:vendor-list')
        data = {
            'name': 'New Vendor',
            'vendor_type': VendorType.PT,
            'category': VendorCategory.GOODS,
            'address': 'Test Address',
            'city': 'Jakarta',
            'province': 'DKI Jakarta',
            'phone': '021-1234567',
            'email': 'new@vendor.com',
            'contact_person': 'John',
            'contact_phone': '08123456789',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_blacklist_vendor(self):
        self.client.force_authenticate(user=self.admin)
        vendor = Vendor.objects.create(
            name='Bad Vendor',
            status=VendorStatus.ACTIVE,
            address='Address',
            city='Jakarta',
            province='DKI Jakarta',
            phone='021-111',
            email='bad@vendor.com',
            contact_person='Bad',
            contact_phone='08111',
        )
        url = reverse('api_v1:vendor-blacklist', kwargs={'pk': vendor.id})
        response = self.client.post(url, {'reason': 'Poor quality'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        vendor.refresh_from_db()
        self.assertEqual(vendor.status, VendorStatus.BLACKLISTED)


class PurchaseOrderAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.vendor = Vendor.objects.create(
            name='Test Vendor',
            status=VendorStatus.ACTIVE,
            address='Address',
            city='Jakarta',
            province='DKI Jakarta',
            phone='021-111',
            email='vendor@test.com',
            contact_person='Contact',
            contact_phone='08111',
        )

    def test_list_purchase_orders(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:purchase-order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_purchase_order(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:purchase-order-list')
        data = {
            'vendor': str(self.vendor.id),
            'order_date': timezone.now().date().isoformat(),
            'priority': POPriority.NORMAL,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_submit_po(self):
        self.client.force_authenticate(user=self.user)

        # Create PO with item
        po = PurchaseOrder.objects.create(
            vendor=self.vendor,
            order_date=timezone.now().date(),
            requested_by=self.user,
        )
        POItem.objects.create(
            purchase_order=po,
            item_name='Test Item',
            quantity=Decimal('1'),
            unit_price=Decimal('100000'),
        )

        url = reverse('api_v1:purchase-order-submit', kwargs={'pk': po.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        po.refresh_from_db()
        self.assertEqual(po.status, POStatus.PENDING_APPROVAL)

    def test_approve_po(self):
        self.client.force_authenticate(user=self.user)

        po = PurchaseOrder.objects.create(
            vendor=self.vendor,
            order_date=timezone.now().date(),
            requested_by=self.user,
            status=POStatus.PENDING_APPROVAL,
        )
        POItem.objects.create(
            purchase_order=po,
            item_name='Test Item',
            quantity=Decimal('1'),
            unit_price=Decimal('100000'),
        )

        url = reverse('api_v1:purchase-order-approve', kwargs={'pk': po.id})
        response = self.client.post(url, {'action': 'approve'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        po.refresh_from_db()
        self.assertEqual(po.status, POStatus.APPROVED)

    def test_statistics(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:purchase-order-statistics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('by_status', response.data)
