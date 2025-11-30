"""
Seed command for Finance module.
"""
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from apps.finance.expense_request.models import (
    ExpenseRequest, ExpenseItem, ExpenseAdvance,
    ExpenseCategory, ExpenseStatus, PaymentMethod
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed finance data (expense requests, items, advances)'

    def handle(self, *args, **options):
        self.stdout.write('Seeding finance data...')

        # Get or create users
        users = list(User.objects.all()[:5])
        if not users:
            self.stdout.write(self.style.WARNING('No users found. Creating test user.'))
            user = User.objects.create_user(
                username='financeuser',
                email='financeuser@example.com',
                password='testpass123',
                first_name='Finance',
                last_name='User'
            )
            users = [user]

        # Sample expense data
        expense_data = [
            {
                'title': 'Perjalanan Dinas Jakarta',
                'description': 'Meeting dengan klien untuk project ABC',
                'purpose': 'Koordinasi requirements project',
                'department': 'IT',
                'items': [
                    {'category': ExpenseCategory.TRAVEL, 'description': 'Tiket pesawat PP', 'qty': 1, 'price': 2500000},
                    {'category': ExpenseCategory.ACCOMMODATION, 'description': 'Hotel 2 malam', 'qty': 2, 'price': 800000},
                    {'category': ExpenseCategory.TRANSPORT, 'description': 'Taxi bandara', 'qty': 4, 'price': 150000},
                    {'category': ExpenseCategory.MEALS, 'description': 'Makan selama perjalanan', 'qty': 6, 'price': 100000},
                ]
            },
            {
                'title': 'Training Python Advanced',
                'description': 'Pelatihan Python untuk tim development',
                'purpose': 'Peningkatan skill tim',
                'department': 'IT',
                'items': [
                    {'category': ExpenseCategory.TRAINING, 'description': 'Biaya training 3 hari', 'qty': 1, 'price': 5000000},
                    {'category': ExpenseCategory.MEALS, 'description': 'Snack & makan siang', 'qty': 3, 'price': 150000},
                ]
            },
            {
                'title': 'Pembelian Perlengkapan Kantor',
                'description': 'Pengadaan ATK bulanan',
                'purpose': 'Kebutuhan operasional kantor',
                'department': 'General Affairs',
                'items': [
                    {'category': ExpenseCategory.SUPPLIES, 'description': 'Kertas A4 10 rim', 'qty': 10, 'price': 50000},
                    {'category': ExpenseCategory.SUPPLIES, 'description': 'Toner printer', 'qty': 3, 'price': 350000},
                    {'category': ExpenseCategory.SUPPLIES, 'description': 'Ballpoint & spidol', 'qty': 1, 'price': 200000},
                ]
            },
            {
                'title': 'Jamuan Tamu Kementerian',
                'description': 'Lunch meeting dengan perwakilan kementerian',
                'purpose': 'Koordinasi kebijakan penelitian',
                'department': 'Research',
                'items': [
                    {'category': ExpenseCategory.ENTERTAINMENT, 'description': 'Lunch di restoran', 'qty': 8, 'price': 250000},
                    {'category': ExpenseCategory.TRANSPORT, 'description': 'Transport tamu', 'qty': 2, 'price': 200000},
                ]
            },
            {
                'title': 'Perjalanan Dinas Surabaya',
                'description': 'Site visit untuk riset lapangan',
                'purpose': 'Pengumpulan data penelitian',
                'department': 'Research',
                'items': [
                    {'category': ExpenseCategory.TRAVEL, 'description': 'Tiket kereta PP', 'qty': 2, 'price': 450000},
                    {'category': ExpenseCategory.ACCOMMODATION, 'description': 'Hotel 3 malam', 'qty': 3, 'price': 650000},
                    {'category': ExpenseCategory.TRANSPORT, 'description': 'Sewa mobil', 'qty': 3, 'price': 500000},
                    {'category': ExpenseCategory.MEALS, 'description': 'Uang makan', 'qty': 9, 'price': 75000},
                ]
            },
            {
                'title': 'Biaya Komunikasi Q4',
                'description': 'Reimburse pulsa dan internet tim',
                'purpose': 'Operasional komunikasi',
                'department': 'HR',
                'items': [
                    {'category': ExpenseCategory.COMMUNICATION, 'description': 'Pulsa telepon', 'qty': 1, 'price': 500000},
                    {'category': ExpenseCategory.COMMUNICATION, 'description': 'Internet tambahan', 'qty': 1, 'price': 350000},
                ]
            },
            {
                'title': 'Medical Check-up Tahunan',
                'description': 'MCU untuk karyawan senior',
                'purpose': 'Program kesehatan karyawan',
                'department': 'HR',
                'items': [
                    {'category': ExpenseCategory.MEDICAL, 'description': 'Paket MCU executive', 'qty': 5, 'price': 1200000},
                ]
            },
            {
                'title': 'Workshop Internal',
                'description': 'Workshop penulisan laporan penelitian',
                'purpose': 'Capacity building',
                'department': 'Research',
                'items': [
                    {'category': ExpenseCategory.TRAINING, 'description': 'Fasilitator workshop', 'qty': 1, 'price': 3000000},
                    {'category': ExpenseCategory.SUPPLIES, 'description': 'Material workshop', 'qty': 1, 'price': 500000},
                    {'category': ExpenseCategory.MEALS, 'description': 'Konsumsi peserta', 'qty': 20, 'price': 75000},
                ]
            },
        ]

        statuses = [
            ExpenseStatus.DRAFT,
            ExpenseStatus.SUBMITTED,
            ExpenseStatus.APPROVED,
            ExpenseStatus.REJECTED,
            ExpenseStatus.PAID,
        ]

        created_expenses = []
        for i, data in enumerate(expense_data):
            requester = random.choice(users)
            status = statuses[i % len(statuses)]
            expense_date = timezone.now().date() - timedelta(days=random.randint(1, 60))

            expense = ExpenseRequest.objects.create(
                requester=requester,
                title=data['title'],
                description=data['description'],
                purpose=data['purpose'],
                department=data['department'],
                expense_date=expense_date,
                status=status,
                payment_method=random.choice([PaymentMethod.BANK_TRANSFER, PaymentMethod.PETTY_CASH]),
                bank_name='Bank Mandiri' if random.random() > 0.5 else 'BCA',
                bank_account_number='1234567890',
                bank_account_name=requester.get_full_name() or requester.username,
                created_by=requester,
            )

            # Create items
            for item in data['items']:
                ExpenseItem.objects.create(
                    expense_request=expense,
                    category=item['category'],
                    description=item['description'],
                    quantity=item['qty'],
                    unit_price=Decimal(str(item['price'])),
                )

            # Set approval data for approved/paid expenses
            if status in [ExpenseStatus.APPROVED, ExpenseStatus.PAID]:
                approver = users[0] if len(users) > 1 else requester
                expense.approved_by = approver
                expense.approved_at = timezone.now() - timedelta(days=random.randint(1, 30))
                expense.approved_amount = expense.total_amount
                expense.save()

            if status == ExpenseStatus.PAID:
                expense.processed_by = users[0] if len(users) > 1 else requester
                expense.processed_at = timezone.now() - timedelta(days=random.randint(1, 15))
                expense.payment_date = timezone.now().date() - timedelta(days=random.randint(1, 10))
                expense.payment_reference = f'TRF-{expense.request_number}'
                expense.save()

            if status == ExpenseStatus.REJECTED:
                expense.approved_by = users[0] if len(users) > 1 else requester
                expense.approved_at = timezone.now()
                expense.rejection_reason = 'Budget tidak mencukupi'
                expense.save()

            created_expenses.append(expense)

        self.stdout.write(f'Created {len(created_expenses)} expense requests')

        # Create some advances
        advance_data = [
            {'purpose': 'Uang muka perjalanan dinas Bali', 'amount': 5000000},
            {'purpose': 'Uang muka pembelian equipment', 'amount': 10000000},
            {'purpose': 'Petty cash refill', 'amount': 2000000},
        ]

        advance_statuses = ['pending', 'approved', 'disbursed', 'settled']

        for i, data in enumerate(advance_data):
            requester = random.choice(users)
            adv_status = advance_statuses[i % len(advance_statuses)]

            advance = ExpenseAdvance.objects.create(
                requester=requester,
                purpose=data['purpose'],
                amount=Decimal(str(data['amount'])),
                status=adv_status,
                created_by=requester,
            )

            if adv_status in ['approved', 'disbursed', 'settled']:
                advance.approved_by = users[0] if len(users) > 1 else requester
                advance.approved_at = timezone.now() - timedelta(days=5)
                advance.save()

            if adv_status == 'settled':
                advance.settled_amount = Decimal(str(data['amount'])) - Decimal('250000')
                advance.settlement_date = timezone.now().date()
                advance.save()

        self.stdout.write(f'Created {len(advance_data)} expense advances')
        self.stdout.write(self.style.SUCCESS('Finance seed data created successfully!'))
