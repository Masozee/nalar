"""
Seed command for Ticketing module.
Creates sample categories, SLA policies, tickets, comments, and attachments.
"""
import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User
from apps.ticketing.models import (
    Category, SLAPolicy, Ticket, TicketComment, TicketAttachment,
    TicketPriority, TicketStatus, TicketType,
)


class Command(BaseCommand):
    help = 'Seed ticketing data with Indonesian context'

    def handle(self, *args, **options):
        self.stdout.write('Seeding ticketing data...')

        # Get or create users
        users = list(User.objects.all()[:10])
        if len(users) < 2:
            self.stdout.write(self.style.WARNING(
                'Need at least 2 users. Run seed_hr first.'
            ))
            return

        # Create categories
        categories = self.create_categories()

        # Create SLA policies
        sla_policies = self.create_sla_policies()

        # Create tickets
        tickets = self.create_tickets(users, categories)

        # Create comments
        self.create_comments(tickets, users)

        self.stdout.write(self.style.SUCCESS(
            f'Created {len(categories)} categories, '
            f'{len(sla_policies)} SLA policies, '
            f'{len(tickets)} tickets'
        ))

    def create_categories(self):
        """Create ticket categories with hierarchy."""
        categories = []

        # Root categories
        root_data = [
            ('IT', 'IT', 'Dukungan Teknologi Informasi'),
            ('GA', 'GA', 'General Affairs / Urusan Umum'),
            ('HR', 'HR-TKT', 'Pertanyaan SDM'),
            ('FINANCE', 'FIN', 'Pertanyaan Keuangan'),
        ]

        root_categories = {}
        for name, code, desc in root_data:
            cat, _ = Category.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'description': desc,
                }
            )
            root_categories[code] = cat
            categories.append(cat)

        # IT subcategories
        it_subs = [
            ('Hardware', 'IT-HW', 'Masalah perangkat keras'),
            ('Software', 'IT-SW', 'Masalah perangkat lunak'),
            ('Network', 'IT-NET', 'Masalah jaringan'),
            ('Email', 'IT-EMAIL', 'Masalah email dan komunikasi'),
            ('Account', 'IT-ACC', 'Akun dan akses sistem'),
            ('Printer', 'IT-PRINT', 'Masalah printer dan scanner'),
        ]
        for name, code, desc in it_subs:
            cat, _ = Category.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'description': desc,
                    'parent': root_categories['IT'],
                }
            )
            categories.append(cat)

        # GA subcategories
        ga_subs = [
            ('Ruangan', 'GA-ROOM', 'Pemesanan dan masalah ruangan'),
            ('AC', 'GA-AC', 'Masalah pendingin ruangan'),
            ('Listrik', 'GA-ELEC', 'Masalah kelistrikan'),
            ('Kebersihan', 'GA-CLEAN', 'Kebersihan dan sanitasi'),
            ('Keamanan', 'GA-SEC', 'Keamanan gedung'),
            ('Kendaraan', 'GA-VEH', 'Pemesanan kendaraan'),
            ('ATK', 'GA-ATK', 'Alat tulis kantor'),
        ]
        for name, code, desc in ga_subs:
            cat, _ = Category.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'description': desc,
                    'parent': root_categories['GA'],
                }
            )
            categories.append(cat)

        return categories

    def create_sla_policies(self):
        """Create SLA policies for each priority level."""
        policies = []

        sla_data = [
            (TicketPriority.CRITICAL, 'SLA Kritis', 15, 60, False),
            (TicketPriority.HIGH, 'SLA Tinggi', 30, 240, True),
            (TicketPriority.MEDIUM, 'SLA Sedang', 120, 480, True),
            (TicketPriority.LOW, 'SLA Rendah', 240, 1440, True),
        ]

        for priority, name, response, resolution, biz_hours in sla_data:
            policy, _ = SLAPolicy.objects.get_or_create(
                priority=priority,
                defaults={
                    'name': name,
                    'response_time': response,
                    'resolution_time': resolution,
                    'business_hours_only': biz_hours,
                }
            )
            policies.append(policy)

        return policies

    def create_tickets(self, users, categories):
        """Create sample tickets with various statuses."""
        tickets = []

        # Sample ticket data with Indonesian context
        ticket_templates = [
            # IT Hardware
            {
                'title': 'Laptop tidak bisa menyala',
                'description': 'Laptop Dell Latitude saya tidak bisa menyala sejak tadi pagi. Sudah coba charge tapi lampu indikator tidak menyala.',
                'category_code': 'IT-HW',
                'priority': TicketPriority.HIGH,
                'ticket_type': TicketType.INCIDENT,
            },
            {
                'title': 'Keyboard rusak, beberapa tombol tidak berfungsi',
                'description': 'Tombol A, S, D pada keyboard laptop tidak berfungsi. Sudah coba restart tapi tidak berhasil.',
                'category_code': 'IT-HW',
                'priority': TicketPriority.MEDIUM,
                'ticket_type': TicketType.INCIDENT,
            },
            {
                'title': 'Request monitor tambahan',
                'description': 'Mohon dibantu untuk pengadaan monitor tambahan untuk dual monitor setup. Saya membutuhkan monitor 24 inch untuk mendukung pekerjaan analisis data.',
                'category_code': 'IT-HW',
                'priority': TicketPriority.LOW,
                'ticket_type': TicketType.REQUEST,
            },
            # IT Software
            {
                'title': 'Microsoft Office tidak bisa dibuka',
                'description': 'Error "Product Activation Failed" saat membuka Microsoft Word dan Excel.',
                'category_code': 'IT-SW',
                'priority': TicketPriority.MEDIUM,
                'ticket_type': TicketType.INCIDENT,
            },
            {
                'title': 'Request instalasi software SPSS',
                'description': 'Mohon dibantu instalasi SPSS untuk kebutuhan analisis data penelitian.',
                'category_code': 'IT-SW',
                'priority': TicketPriority.LOW,
                'ticket_type': TicketType.REQUEST,
            },
            {
                'title': 'VPN tidak bisa connect',
                'description': 'VPN FortiClient error saat mencoba connect dari rumah. Pesan error: "Unable to establish connection".',
                'category_code': 'IT-SW',
                'priority': TicketPriority.HIGH,
                'ticket_type': TicketType.INCIDENT,
            },
            # IT Network
            {
                'title': 'Internet lambat di lantai 3',
                'description': 'Koneksi internet di area lantai 3 sangat lambat sejak kemarin. Speed test hanya menunjukkan 1 Mbps.',
                'category_code': 'IT-NET',
                'priority': TicketPriority.HIGH,
                'ticket_type': TicketType.INCIDENT,
            },
            {
                'title': 'Tidak bisa akses folder shared',
                'description': 'Tidak bisa mengakses folder \\\\fileserver\\departemen. Error "Access Denied".',
                'category_code': 'IT-NET',
                'priority': TicketPriority.MEDIUM,
                'ticket_type': TicketType.INCIDENT,
            },
            # IT Email
            {
                'title': 'Email tidak bisa mengirim attachment besar',
                'description': 'Tidak bisa mengirim email dengan attachment lebih dari 10MB. Mohon dinaikkan limitnya.',
                'category_code': 'IT-EMAIL',
                'priority': TicketPriority.LOW,
                'ticket_type': TicketType.REQUEST,
            },
            {
                'title': 'Email bouncing terus',
                'description': 'Email ke klien@external.com selalu bouncing dengan pesan "Mailbox full". Padahal bukan mailbox saya yang full.',
                'category_code': 'IT-EMAIL',
                'priority': TicketPriority.MEDIUM,
                'ticket_type': TicketType.INCIDENT,
            },
            # IT Account
            {
                'title': 'Reset password domain',
                'description': 'Lupa password akun domain Windows. Mohon dibantu reset.',
                'category_code': 'IT-ACC',
                'priority': TicketPriority.HIGH,
                'ticket_type': TicketType.REQUEST,
            },
            {
                'title': 'Request akses ke aplikasi ERP',
                'description': 'Mohon dibuatkan akses ke modul Finance pada aplikasi ERP untuk keperluan closing bulanan.',
                'category_code': 'IT-ACC',
                'priority': TicketPriority.MEDIUM,
                'ticket_type': TicketType.REQUEST,
            },
            # IT Printer
            {
                'title': 'Printer lantai 2 paper jam',
                'description': 'Printer HP LaserJet di lantai 2 sering paper jam. Sudah coba bersihkan tapi masih sering macet.',
                'category_code': 'IT-PRINT',
                'priority': TicketPriority.LOW,
                'ticket_type': TicketType.INCIDENT,
            },
            {
                'title': 'Scanner tidak terdeteksi',
                'description': 'Scanner Epson di ruang admin tidak terdeteksi di komputer. Driver sudah diinstall ulang.',
                'category_code': 'IT-PRINT',
                'priority': TicketPriority.MEDIUM,
                'ticket_type': TicketType.INCIDENT,
            },
            # GA Room
            {
                'title': 'AC ruang meeting mati',
                'description': 'AC di ruang meeting Garuda mati total sejak pagi. Ruangan sangat panas.',
                'category_code': 'GA-AC',
                'priority': TicketPriority.CRITICAL,
                'ticket_type': TicketType.INCIDENT,
            },
            {
                'title': 'Lampu ruang kerja berkedip',
                'description': 'Lampu di area workstation bagian selatan berkedip-kedip. Mohon diganti.',
                'category_code': 'GA-ELEC',
                'priority': TicketPriority.MEDIUM,
                'ticket_type': TicketType.INCIDENT,
            },
            {
                'title': 'Request pembersihan karpet',
                'description': 'Mohon dijadwalkan deep cleaning karpet di ruang Direktur.',
                'category_code': 'GA-CLEAN',
                'priority': TicketPriority.LOW,
                'ticket_type': TicketType.REQUEST,
            },
            {
                'title': 'Pintu kamar mandi rusak',
                'description': 'Kunci pintu kamar mandi pria lantai 1 rusak, tidak bisa dikunci dari dalam.',
                'category_code': 'GA-ROOM',
                'priority': TicketPriority.HIGH,
                'ticket_type': TicketType.INCIDENT,
            },
            {
                'title': 'Request booking mobil operasional',
                'description': 'Mohon booking mobil operasional untuk tanggal 25 November 2024, keperluan kunjungan ke Kementerian BUMN.',
                'category_code': 'GA-VEH',
                'priority': TicketPriority.MEDIUM,
                'ticket_type': TicketType.REQUEST,
            },
            {
                'title': 'Stock ATK habis',
                'description': 'Stock kertas A4 dan tinta printer di gudang sudah habis. Mohon segera diorder.',
                'category_code': 'GA-ATK',
                'priority': TicketPriority.MEDIUM,
                'ticket_type': TicketType.REQUEST,
            },
        ]

        categories_dict = {c.code: c for c in Category.objects.all()}

        statuses = [
            (TicketStatus.OPEN, 0.2),
            (TicketStatus.IN_PROGRESS, 0.3),
            (TicketStatus.WAITING_USER, 0.1),
            (TicketStatus.RESOLVED, 0.25),
            (TicketStatus.CLOSED, 0.15),
        ]

        it_staff = users[1:4] if len(users) > 3 else users[1:]  # IT support staff

        for template in ticket_templates:
            requester = random.choice(users)
            category = categories_dict.get(template['category_code'])

            # Weighted random status
            status_choice = random.choices(
                [s[0] for s in statuses],
                weights=[s[1] for s in statuses],
                k=1
            )[0]

            ticket = Ticket.objects.create(
                title=template['title'],
                description=template['description'],
                category=category,
                priority=template['priority'],
                ticket_type=template['ticket_type'],
                status=status_choice,
                requester=requester,
                assignee=random.choice(it_staff) if status_choice != TicketStatus.OPEN else None,
            )

            # Set timestamps based on status
            if status_choice in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
                ticket.first_response_at = ticket.created_at + timedelta(minutes=random.randint(10, 60))
                ticket.resolved_at = ticket.created_at + timedelta(hours=random.randint(1, 24))
                if status_choice == TicketStatus.CLOSED:
                    ticket.closed_at = ticket.resolved_at + timedelta(hours=random.randint(1, 48))
                ticket.save()
            elif status_choice in [TicketStatus.IN_PROGRESS, TicketStatus.WAITING_USER]:
                ticket.first_response_at = ticket.created_at + timedelta(minutes=random.randint(10, 60))
                ticket.save()

            # Randomly set SLA breach for some tickets
            if random.random() < 0.1:
                ticket.response_breached = True
                ticket.save()

            tickets.append(ticket)

        return tickets

    def create_comments(self, tickets, users):
        """Create comments for tickets."""
        response_templates = [
            'Terima kasih atas laporannya. Akan segera kami proses.',
            'Baik, tim kami akan segera menindaklanjuti.',
            'Mohon informasikan lokasi dan nomor aset perangkat.',
            'Kami sudah cek dan sedang dalam proses perbaikan.',
            'Sudah selesai diperbaiki. Mohon dicek kembali.',
            'Terima kasih atas konfirmasinya. Tiket akan ditutup.',
            'Mohon maaf atas ketidaknyamanannya. Kami akan prioritaskan.',
            'Apakah masalah ini masih terjadi?',
        ]

        user_response_templates = [
            'Terima kasih atas responnya.',
            'Baik, ditunggu ya.',
            'Sudah bisa. Terima kasih!',
            'Masih belum bisa, tolong dicek lagi.',
            'Lokasi di lantai 3, meja nomor 15.',
            'Noted, terima kasih.',
        ]

        for ticket in tickets:
            # Add 1-4 comments per ticket
            num_comments = random.randint(1, 4)
            assignee = ticket.assignee or random.choice(users)

            for i in range(num_comments):
                if i % 2 == 0:
                    # Staff response
                    TicketComment.objects.create(
                        ticket=ticket,
                        author=assignee,
                        content=random.choice(response_templates),
                        comment_type='reply' if i > 0 else 'reply',
                    )
                else:
                    # User response
                    TicketComment.objects.create(
                        ticket=ticket,
                        author=ticket.requester,
                        content=random.choice(user_response_templates),
                        comment_type='reply',
                    )
