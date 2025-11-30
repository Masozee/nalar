from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import timedelta
from decimal import Decimal
from apps.users.models import User
from apps.assets.maintenance.models import (
    Asset, MaintenanceSchedule, MaintenanceRecord,
    AssetCategory, AssetStatus, MaintenanceType, MaintenanceStatus,
)
from apps.assets.assignment.models import (
    AssetAssignment, AssetTransfer, AssetCheckout,
    AssignmentStatus, AssignmentType,
)


class AssetModelTest(TestCase):
    def test_create_asset(self):
        asset = Asset.objects.create(
            asset_code='IT-001',
            name='Laptop Dell Latitude',
            category=AssetCategory.IT_EQUIPMENT,
            brand='Dell',
            model='Latitude 5520',
            purchase_price=Decimal('15000000'),
        )
        self.assertEqual(str(asset), 'IT-001 - Laptop Dell Latitude')
        self.assertEqual(asset.status, AssetStatus.ACTIVE)

    def test_asset_depreciation(self):
        asset = Asset.objects.create(
            asset_code='IT-002',
            name='Test Asset',
            purchase_date=timezone.now().date() - timedelta(days=365),
            purchase_price=Decimal('10000000'),
            useful_life_years=5,
            salvage_value=Decimal('1000000'),
        )
        # After 1 year, should depreciate by (10M - 1M) / 5 = 1.8M
        current = asset.current_value
        expected = Decimal('10000000') - Decimal('1800000')
        self.assertAlmostEqual(float(current), float(expected), delta=100000)


class MaintenanceRecordModelTest(TestCase):
    def setUp(self):
        self.asset = Asset.objects.create(
            asset_code='IT-003',
            name='Test Asset',
        )

    def test_create_maintenance_record(self):
        record = MaintenanceRecord.objects.create(
            asset=self.asset,
            title='Annual Service',
            description='Yearly maintenance',
            maintenance_type=MaintenanceType.PREVENTIVE,
            scheduled_date=timezone.now().date(),
            labor_cost=Decimal('500000'),
            parts_cost=Decimal('200000'),
        )
        self.assertEqual(record.total_cost, Decimal('700000'))


class AssetAssignmentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.asset = Asset.objects.create(
            asset_code='IT-004',
            name='Test Laptop',
        )

    def test_create_assignment(self):
        assignment = AssetAssignment.objects.create(
            asset=self.asset,
            assigned_to=self.user,
            assignment_type=AssignmentType.PERMANENT,
        )
        self.assertEqual(assignment.status, AssignmentStatus.ACTIVE)
        # Asset's current holder should be updated
        self.asset.refresh_from_db()
        self.assertEqual(self.asset.current_holder, self.user)


class AssetAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.asset = Asset.objects.create(
            asset_code='IT-005',
            name='Test Asset',
            category=AssetCategory.IT_EQUIPMENT,
        )

    def test_list_assets(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:asset-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_asset(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:asset-list')
        data = {
            'asset_code': 'IT-006',
            'name': 'New Asset',
            'category': AssetCategory.IT_EQUIPMENT,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_available_assets(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:asset-available')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AssetAssignmentAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.asset = Asset.objects.create(
            asset_code='IT-007',
            name='Test Laptop',
        )

    def test_create_assignment(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:assetassignment-list')
        data = {
            'asset': str(self.asset.id),
            'assigned_to': str(self.user.id),
            'assignment_type': AssignmentType.PERMANENT,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_my_assets(self):
        self.client.force_authenticate(user=self.user)
        AssetAssignment.objects.create(
            asset=self.asset,
            assigned_to=self.user,
        )
        url = reverse('api_v1:assetassignment-my-assets')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_return_asset(self):
        self.client.force_authenticate(user=self.user)
        assignment = AssetAssignment.objects.create(
            asset=self.asset,
            assigned_to=self.user,
        )
        url = reverse('api_v1:assetassignment-return-asset', kwargs={'pk': assignment.id})
        response = self.client.post(url, {'condition_on_return': 'Good'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assignment.refresh_from_db()
        self.assertEqual(assignment.status, AssignmentStatus.RETURNED)


class AssetCheckoutAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.asset = Asset.objects.create(
            asset_code='PROJ-001',
            name='Projector',
        )

    def test_checkout_and_return(self):
        self.client.force_authenticate(user=self.user)

        # Checkout
        url = reverse('api_v1:assetcheckout-list')
        data = {
            'asset': str(self.asset.id),
            'expected_return_time': (timezone.now() + timedelta(hours=2)).isoformat(),
            'purpose': 'Meeting presentation',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        checkout_id = response.data['id']

        # Return
        url = reverse('api_v1:assetcheckout-return-item', kwargs={'pk': checkout_id})
        response = self.client.post(url, {'condition_on_return': 'Good'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_returned'])
