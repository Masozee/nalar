"""
Tests for Expense Request module.
"""
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import (
    ExpenseRequest, ExpenseItem, ExpenseAdvance,
    ExpenseCategory, ExpenseStatus, PaymentMethod
)

User = get_user_model()


class ExpenseRequestModelTest(TestCase):
    """Test ExpenseRequest model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_create_expense_request(self):
        """Test creating expense request generates number."""
        expense = ExpenseRequest.objects.create(
            requester=self.user,
            title='Perjalanan Dinas Jakarta',
            expense_date='2024-01-15',
        )
        self.assertTrue(expense.request_number.startswith('EXP-'))
        self.assertEqual(expense.status, ExpenseStatus.DRAFT)

    def test_expense_request_workflow(self):
        """Test expense request approval workflow."""
        expense = ExpenseRequest.objects.create(
            requester=self.user,
            title='Test Expense',
            expense_date='2024-01-15',
        )
        # Add item first
        ExpenseItem.objects.create(
            expense_request=expense,
            category=ExpenseCategory.TRAVEL,
            description='Tiket pesawat',
            quantity=1,
            unit_price=Decimal('1500000'),
        )

        # Submit
        expense.submit()
        self.assertEqual(expense.status, ExpenseStatus.SUBMITTED)

        # Approve
        approver = User.objects.create_user(
            username='approver',
            email='approver@example.com',
            password='testpass123'
        )
        expense.approve(approver)
        self.assertEqual(expense.status, ExpenseStatus.APPROVED)
        self.assertEqual(expense.approved_amount, Decimal('1500000'))

    def test_expense_reject(self):
        """Test expense rejection."""
        expense = ExpenseRequest.objects.create(
            requester=self.user,
            title='Test Expense',
            expense_date='2024-01-15',
        )
        ExpenseItem.objects.create(
            expense_request=expense,
            category=ExpenseCategory.MEALS,
            description='Lunch',
            quantity=1,
            unit_price=Decimal('100000'),
        )
        expense.submit()

        approver = User.objects.create_user(
            username='approver2',
            email='approver2@example.com',
            password='testpass123'
        )
        expense.reject(approver, 'Budget exceeded')
        self.assertEqual(expense.status, ExpenseStatus.REJECTED)
        self.assertEqual(expense.rejection_reason, 'Budget exceeded')

    def test_payment_workflow(self):
        """Test expense payment workflow."""
        expense = ExpenseRequest.objects.create(
            requester=self.user,
            title='Test Expense',
            expense_date='2024-01-15',
        )
        ExpenseItem.objects.create(
            expense_request=expense,
            category=ExpenseCategory.TRANSPORT,
            description='Taxi',
            quantity=1,
            unit_price=Decimal('50000'),
        )
        expense.submit()

        approver = User.objects.create_user(
            username='approver3',
            email='approver3@example.com',
            password='testpass123'
        )
        expense.approve(approver)

        # Process payment
        processor = User.objects.create_user(
            username='processor',
            email='processor@example.com',
            password='testpass123'
        )
        expense.process_payment(processor, 'TRF-001')
        self.assertEqual(expense.status, ExpenseStatus.PROCESSING)

        # Mark paid
        expense.mark_paid()
        self.assertEqual(expense.status, ExpenseStatus.PAID)


class ExpenseItemModelTest(TestCase):
    """Test ExpenseItem model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='itemuser',
            email='item@example.com',
            password='testpass123'
        )
        self.expense = ExpenseRequest.objects.create(
            requester=self.user,
            title='Test Expense',
            expense_date='2024-01-15',
        )

    def test_item_amount_calculation(self):
        """Test item amount calculated from qty * price."""
        item = ExpenseItem.objects.create(
            expense_request=self.expense,
            category=ExpenseCategory.ACCOMMODATION,
            description='Hotel 2 malam',
            quantity=2,
            unit_price=Decimal('500000'),
        )
        self.assertEqual(item.amount, Decimal('1000000'))

    def test_expense_total_calculation(self):
        """Test expense total updates when items added."""
        ExpenseItem.objects.create(
            expense_request=self.expense,
            category=ExpenseCategory.ACCOMMODATION,
            description='Hotel',
            quantity=1,
            unit_price=Decimal('500000'),
        )
        ExpenseItem.objects.create(
            expense_request=self.expense,
            category=ExpenseCategory.MEALS,
            description='Meals',
            quantity=3,
            unit_price=Decimal('100000'),
        )
        self.expense.refresh_from_db()
        self.assertEqual(self.expense.total_amount, Decimal('800000'))


class ExpenseAdvanceModelTest(TestCase):
    """Test ExpenseAdvance model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='advanceuser',
            email='advance@example.com',
            password='testpass123'
        )

    def test_create_advance(self):
        """Test creating expense advance generates number."""
        advance = ExpenseAdvance.objects.create(
            requester=self.user,
            purpose='Uang muka perjalanan',
            amount=Decimal('2000000'),
        )
        self.assertTrue(advance.advance_number.startswith('ADV-'))
        self.assertEqual(advance.status, 'pending')

    def test_advance_balance(self):
        """Test advance balance property."""
        advance = ExpenseAdvance.objects.create(
            requester=self.user,
            purpose='Test advance',
            amount=Decimal('1000000'),
            settled_amount=Decimal('750000'),
        )
        self.assertEqual(advance.balance, Decimal('250000'))


class ExpenseRequestAPITest(APITestCase):
    """Test ExpenseRequest API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='apiuser',
            email='api@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_expense_request(self):
        """Test creating expense request via API."""
        data = {
            'title': 'Perjalanan Dinas Surabaya',
            'description': 'Meeting with client',
            'purpose': 'Client meeting for project X',
            'expense_date': '2024-02-01',
            'payment_method': PaymentMethod.BANK_TRANSFER,
        }
        response = self.client.post('/api/v1/finance/expenses/requests/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['request_number'].startswith('EXP-'))

    def test_list_expense_requests(self):
        """Test listing expense requests."""
        ExpenseRequest.objects.create(
            requester=self.user,
            title='Expense 1',
            expense_date='2024-01-15',
        )
        ExpenseRequest.objects.create(
            requester=self.user,
            title='Expense 2',
            expense_date='2024-01-16',
        )
        response = self.client.get('/api/v1/finance/expenses/requests/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_submit_expense(self):
        """Test submitting expense via API."""
        expense = ExpenseRequest.objects.create(
            requester=self.user,
            title='Submit Test',
            expense_date='2024-01-15',
        )
        ExpenseItem.objects.create(
            expense_request=expense,
            category=ExpenseCategory.SUPPLIES,
            description='Office supplies',
            quantity=1,
            unit_price=Decimal('250000'),
        )
        response = self.client.post(
            f'/api/v1/finance/expenses/requests/{expense.id}/submit/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expense.refresh_from_db()
        self.assertEqual(expense.status, ExpenseStatus.SUBMITTED)

    def test_approve_expense(self):
        """Test approving expense via API."""
        expense = ExpenseRequest.objects.create(
            requester=self.user,
            title='Approve Test',
            expense_date='2024-01-15',
            status=ExpenseStatus.SUBMITTED,
        )
        ExpenseItem.objects.create(
            expense_request=expense,
            category=ExpenseCategory.TRAINING,
            description='Training fee',
            quantity=1,
            unit_price=Decimal('3000000'),
        )
        response = self.client.post(
            f'/api/v1/finance/expenses/requests/{expense.id}/approve/',
            {'approved_amount': '2500000'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expense.refresh_from_db()
        self.assertEqual(expense.approved_amount, Decimal('2500000'))

    def test_reject_expense(self):
        """Test rejecting expense via API."""
        expense = ExpenseRequest.objects.create(
            requester=self.user,
            title='Reject Test',
            expense_date='2024-01-15',
            status=ExpenseStatus.SUBMITTED,
        )
        response = self.client.post(
            f'/api/v1/finance/expenses/requests/{expense.id}/reject/',
            {'reason': 'Melebihi budget'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expense.refresh_from_db()
        self.assertEqual(expense.status, ExpenseStatus.REJECTED)

    def test_summary_endpoint(self):
        """Test expense summary endpoint."""
        ExpenseRequest.objects.create(
            requester=self.user,
            title='Summary Test',
            expense_date='2024-01-15',
            total_amount=Decimal('1000000'),
        )
        response = self.client.get('/api/v1/finance/expenses/requests/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_requests', response.data)
        self.assertIn('by_status', response.data)


class ExpenseAdvanceAPITest(APITestCase):
    """Test ExpenseAdvance API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='advanceapiuser',
            email='advanceapi@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_advance(self):
        """Test creating advance via API."""
        data = {
            'purpose': 'Uang muka perjalanan dinas',
            'amount': '5000000',
        }
        response = self.client.post('/api/v1/finance/expenses/advances/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['advance_number'].startswith('ADV-'))

    def test_approve_advance(self):
        """Test approving advance via API."""
        advance = ExpenseAdvance.objects.create(
            requester=self.user,
            purpose='Test advance',
            amount=Decimal('1000000'),
        )
        response = self.client.post(
            f'/api/v1/finance/expenses/advances/{advance.id}/approve/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        advance.refresh_from_db()
        self.assertEqual(advance.status, 'approved')

    def test_disburse_advance(self):
        """Test disbursing advance via API."""
        advance = ExpenseAdvance.objects.create(
            requester=self.user,
            purpose='Disburse test',
            amount=Decimal('1000000'),
            status='approved',
        )
        response = self.client.post(
            f'/api/v1/finance/expenses/advances/{advance.id}/disburse/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        advance.refresh_from_db()
        self.assertEqual(advance.status, 'disbursed')

    def test_settle_advance(self):
        """Test settling advance via API."""
        advance = ExpenseAdvance.objects.create(
            requester=self.user,
            purpose='Settle test',
            amount=Decimal('1000000'),
            status='disbursed',
        )
        response = self.client.post(
            f'/api/v1/finance/expenses/advances/{advance.id}/settle/',
            {'settled_amount': '850000'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        advance.refresh_from_db()
        self.assertEqual(advance.status, 'settled')
        self.assertEqual(advance.settled_amount, Decimal('850000'))
