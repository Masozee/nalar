"""
Seed command for Admin Ops module.
Creates sample rooms, vehicles, drivers, visitors, and bookings.
"""
import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User
from apps.admin_ops.room_booking.models import Room, RoomBooking, RoomType, BookingStatus as RoomBookingStatus
from apps.admin_ops.vehicle_management.models import (
    Vehicle, Driver, VehicleBooking, VehicleMaintenance,
    VehicleType, VehicleStatus, BookingStatus as VehicleBookingStatus,
)
from apps.admin_ops.visitor_log.models import (
    Visitor, VisitLog, VisitorBadge, VisitStatus, VisitPurpose, IDType,
)


class Command(BaseCommand):
    help = 'Seed admin ops data with Indonesian context'

    def handle(self, *args, **options):
        self.stdout.write('Seeding admin ops data...')

        users = list(User.objects.all()[:10])
        if len(users) < 2:
            self.stdout.write(self.style.WARNING('Need at least 2 users. Run seed_hr first.'))
            return

        rooms = self.create_rooms()
        self.create_room_bookings(rooms, users)

        vehicles = self.create_vehicles()
        drivers = self.create_drivers(users)
        self.create_vehicle_bookings(vehicles, drivers, users)

        visitors = self.create_visitors()
        badges = self.create_badges()
        self.create_visits(visitors, users, badges)

        self.stdout.write(self.style.SUCCESS(
            f'Created {len(rooms)} rooms, {len(vehicles)} vehicles, '
            f'{len(visitors)} visitors, and bookings/visits'
        ))

    def create_rooms(self):
        """Create meeting rooms."""
        rooms = []
        room_data = [
            ('Ruang Garuda', 'RG-01', RoomType.MEETING, '3', 'Gedung A', 20, True, True, True, False),
            ('Ruang Cendrawasih', 'RC-01', RoomType.MEETING, '3', 'Gedung A', 12, True, True, False, False),
            ('Ruang Elang', 'RE-01', RoomType.CONFERENCE, '4', 'Gedung A', 50, True, True, True, True),
            ('Ruang Merpati', 'RM-01', RoomType.HUDDLE, '2', 'Gedung A', 6, False, True, False, False),
            ('Ruang Direksi', 'RD-01', RoomType.BOARDROOM, '5', 'Gedung A', 15, True, True, True, True),
            ('Auditorium Utama', 'AU-01', RoomType.AUDITORIUM, '1', 'Gedung B', 200, True, False, True, True),
            ('Ruang Training A', 'RT-A', RoomType.TRAINING, '2', 'Gedung B', 30, True, True, True, False),
            ('Ruang Training B', 'RT-B', RoomType.TRAINING, '2', 'Gedung B', 30, True, True, True, False),
            ('Ruang Diskusi 1', 'RD-1', RoomType.HUDDLE, '3', 'Gedung A', 4, False, True, False, False),
            ('Ruang Diskusi 2', 'RD-2', RoomType.HUDDLE, '3', 'Gedung A', 4, False, True, False, False),
        ]

        for name, code, room_type, floor, building, capacity, proj, wb, vc, tc in room_data:
            room, _ = Room.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'room_type': room_type,
                    'floor': floor,
                    'building': building,
                    'capacity': capacity,
                    'has_projector': proj,
                    'has_whiteboard': wb,
                    'has_video_conference': vc,
                    'has_teleconference': tc,
                    'requires_approval': room_type in [RoomType.BOARDROOM, RoomType.AUDITORIUM],
                }
            )
            rooms.append(room)

        return rooms

    def create_room_bookings(self, rooms, users):
        """Create sample room bookings."""
        titles = [
            'Weekly Team Meeting',
            'Project Kickoff',
            'Client Presentation',
            'Budget Review',
            'Strategy Discussion',
            'Interview Kandidat',
            'Training Session',
            'Board Meeting',
            'Workshop Data Analysis',
            'Townhall Meeting',
        ]

        now = timezone.now()
        for i in range(20):
            room = random.choice(rooms)
            user = random.choice(users)
            start = now + timedelta(days=random.randint(-7, 14), hours=random.randint(8, 16))
            duration = random.choice([1, 2, 3, 4])

            status_choice = random.choice([
                RoomBookingStatus.APPROVED,
                RoomBookingStatus.APPROVED,
                RoomBookingStatus.COMPLETED,
                RoomBookingStatus.PENDING,
            ])

            RoomBooking.objects.create(
                room=room,
                booked_by=user,
                title=random.choice(titles),
                description='Agenda meeting rutin',
                start_time=start,
                end_time=start + timedelta(hours=duration),
                status=status_choice,
                expected_attendees=random.randint(3, room.capacity),
            )

    def create_vehicles(self):
        """Create operational vehicles."""
        vehicles = []
        vehicle_data = [
            ('Toyota Innova 1', 'B 1234 NLR', VehicleType.MPV, 'Toyota', 'Innova', 2022, 'Hitam', 7),
            ('Toyota Innova 2', 'B 5678 NLR', VehicleType.MPV, 'Toyota', 'Innova', 2021, 'Putih', 7),
            ('Toyota Avanza', 'B 9012 NLR', VehicleType.MPV, 'Toyota', 'Avanza', 2023, 'Silver', 7),
            ('Honda CR-V', 'B 3456 NLR', VehicleType.SUV, 'Honda', 'CR-V', 2022, 'Hitam', 5),
            ('Toyota HiAce', 'B 7890 NLR', VehicleType.VAN, 'Toyota', 'HiAce', 2020, 'Putih', 15),
            ('Honda Vario', 'B 1111 NLR', VehicleType.MOTORCYCLE, 'Honda', 'Vario', 2023, 'Merah', 2),
            ('Daihatsu Sigra', 'B 2222 NLR', VehicleType.CAR, 'Daihatsu', 'Sigra', 2022, 'Silver', 5),
        ]

        for name, plate, v_type, brand, model, year, color, capacity in vehicle_data:
            vehicle, _ = Vehicle.objects.get_or_create(
                plate_number=plate,
                defaults={
                    'name': name,
                    'vehicle_type': v_type,
                    'brand': brand,
                    'model': model,
                    'year': year,
                    'color': color,
                    'capacity': capacity,
                    'status': VehicleStatus.AVAILABLE,
                    'current_odometer': random.randint(10000, 80000),
                    'stnk_expiry': timezone.now().date() + timedelta(days=random.randint(30, 365)),
                    'insurance_expiry': timezone.now().date() + timedelta(days=random.randint(30, 365)),
                }
            )
            vehicles.append(vehicle)

        return vehicles

    def create_drivers(self, users):
        """Create drivers from existing users."""
        drivers = []
        driver_users = users[5:8] if len(users) >= 8 else users[:3]

        for i, user in enumerate(driver_users):
            driver, created = Driver.objects.get_or_create(
                user=user,
                defaults={
                    'license_number': f'SIM-{random.randint(100000, 999999)}',
                    'license_type': 'A',
                    'license_expiry': timezone.now().date() + timedelta(days=random.randint(365, 1095)),
                    'phone': f'08{random.randint(1000000000, 9999999999)}',
                }
            )
            drivers.append(driver)

        return drivers

    def create_vehicle_bookings(self, vehicles, drivers, users):
        """Create vehicle bookings."""
        destinations = [
            ('Kementerian BUMN', 'Meeting dengan Kementerian'),
            ('Kementerian Keuangan', 'Sosialisasi program'),
            ('Bank Indonesia', 'Koordinasi kebijakan'),
            ('DPR RI', 'Hearing dengan Komisi'),
            ('Istana Negara', 'Undangan resmi'),
            ('Hotel Mulia', 'Seminar nasional'),
            ('JCC Senayan', 'Konferensi internasional'),
            ('Bandara Soekarno-Hatta', 'Penjemputan tamu'),
            ('Universitas Indonesia', 'Guest lecture'),
            ('Kampus ITB', 'Kerjasama penelitian'),
        ]

        now = timezone.now()
        for i in range(15):
            vehicle = random.choice([v for v in vehicles if v.vehicle_type != VehicleType.MOTORCYCLE])
            user = random.choice(users)
            driver = random.choice(drivers) if drivers else None
            dest, purpose = random.choice(destinations)
            start = now + timedelta(days=random.randint(-7, 14), hours=random.randint(7, 14))

            status_choice = random.choice([
                VehicleBookingStatus.APPROVED,
                VehicleBookingStatus.COMPLETED,
                VehicleBookingStatus.PENDING,
            ])

            start_odo = vehicle.current_odometer
            end_odo = start_odo + random.randint(20, 100) if status_choice == VehicleBookingStatus.COMPLETED else None

            VehicleBooking.objects.create(
                vehicle=vehicle,
                booked_by=user,
                driver=driver,
                purpose=purpose,
                destination=dest,
                start_time=start,
                end_time=start + timedelta(hours=random.randint(2, 8)),
                status=status_choice,
                passenger_count=random.randint(1, vehicle.capacity),
                start_odometer=start_odo if status_choice != VehicleBookingStatus.PENDING else None,
                end_odometer=end_odo,
            )

    def create_visitors(self):
        """Create visitor master data."""
        visitors = []
        visitor_data = [
            ('Budi Santoso', 'PT Telkom Indonesia', '081234567890'),
            ('Siti Rahma', 'Bank Mandiri', '081234567891'),
            ('Ahmad Yani', 'Kementerian Keuangan', '081234567892'),
            ('Dewi Lestari', 'PT PLN', '081234567893'),
            ('Hendra Wijaya', 'Pertamina', '081234567894'),
            ('Maya Sari', 'Universitas Indonesia', '081234567895'),
            ('Rudi Hartono', 'Media Indonesia', '081234567896'),
            ('Linda Kusuma', 'Kompas', '081234567897'),
            ('Eko Prasetyo', 'Tempo', '081234567898'),
            ('Nur Hidayah', 'CNN Indonesia', '081234567899'),
            ('Agus Salim', 'Metro TV', '081234567800'),
            ('Ratna Dewi', 'BPKP', '081234567801'),
            ('Bambang Suryadi', 'BPK', '081234567802'),
            ('Fitri Handayani', 'KPK', '081234567803'),
            ('Doni Setiawan', 'OJK', '081234567804'),
        ]

        for name, company, phone in visitor_data:
            visitor, _ = Visitor.objects.get_or_create(
                phone=phone,
                defaults={
                    'name': name,
                    'company': company,
                    'email': f"{name.lower().replace(' ', '.')}@example.com",
                    'id_type': IDType.KTP,
                    'id_number': f'31{random.randint(10000000000000, 99999999999999)}',
                }
            )
            visitors.append(visitor)

        return visitors

    def create_badges(self):
        """Create visitor badges."""
        badges = []
        for i in range(1, 21):
            badge, _ = VisitorBadge.objects.get_or_create(
                badge_number=f'V{i:03d}',
                defaults={
                    'badge_type': 'Visitor',
                    'is_available': True,
                }
            )
            badges.append(badge)
        return badges

    def create_visits(self, visitors, users, badges):
        """Create visit logs."""
        purposes = list(VisitPurpose.choices)
        hosts = users[:5]

        now = timezone.now()
        for i in range(30):
            visitor = random.choice(visitors)
            host = random.choice(hosts)
            purpose = random.choice(purposes)[0]
            day_offset = random.randint(-14, 7)
            visit_time = now + timedelta(days=day_offset, hours=random.randint(8, 16))

            if day_offset < 0:
                # Past visits - mostly completed
                status = random.choice([VisitStatus.CHECKED_OUT, VisitStatus.CHECKED_OUT, VisitStatus.NO_SHOW])
                check_in = visit_time
                check_out = visit_time + timedelta(hours=random.randint(1, 4)) if status == VisitStatus.CHECKED_OUT else None
            elif day_offset == 0:
                # Today - mix of statuses
                status = random.choice([VisitStatus.CHECKED_IN, VisitStatus.CHECKED_OUT, VisitStatus.EXPECTED])
                check_in = visit_time if status in [VisitStatus.CHECKED_IN, VisitStatus.CHECKED_OUT] else None
                check_out = visit_time + timedelta(hours=2) if status == VisitStatus.CHECKED_OUT else None
            else:
                # Future visits - expected
                status = VisitStatus.EXPECTED
                check_in = None
                check_out = None

            VisitLog.objects.create(
                visitor=visitor,
                visitor_name=visitor.name,
                visitor_company=visitor.company,
                visitor_phone=visitor.phone,
                visitor_id_type=visitor.id_type,
                visitor_id_number=visitor.id_number,
                purpose=purpose,
                host=host,
                host_name=host.get_full_name() or host.email,
                expected_arrival=visit_time,
                check_in_time=check_in,
                check_out_time=check_out,
                status=status,
                badge_number=f'V{random.randint(1, 20):03d}' if status == VisitStatus.CHECKED_IN else '',
                is_pre_registered=random.choice([True, False]),
            )
