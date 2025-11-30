from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import timedelta
from apps.users.models import User
from apps.admin_ops.room_booking.models import Room, RoomBooking, RoomType, BookingStatus as RoomBookingStatus
from apps.admin_ops.vehicle_management.models import (
    Vehicle, Driver, VehicleBooking, VehicleMaintenance,
    VehicleType, VehicleStatus, BookingStatus as VehicleBookingStatus,
)
from apps.admin_ops.visitor_log.models import Visitor, VisitLog, VisitorBadge, VisitStatus, VisitPurpose


# ============= Room Booking Tests =============

class RoomModelTest(TestCase):
    def test_create_room(self):
        room = Room.objects.create(
            name='Ruang Garuda',
            code='RG-01',
            room_type=RoomType.MEETING,
            floor='3',
            building='Gedung A',
            capacity=20,
        )
        self.assertEqual(str(room), 'Ruang Garuda (RG-01)')
        self.assertTrue(room.is_active)

    def test_room_facilities(self):
        room = Room.objects.create(
            name='Conference Room',
            code='CR-01',
            has_projector=True,
            has_video_conference=True,
        )
        self.assertTrue(room.has_projector)
        self.assertTrue(room.has_video_conference)


class RoomBookingModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.room = Room.objects.create(
            name='Meeting Room',
            code='MR-01',
            capacity=10,
        )

    def test_create_booking(self):
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=2)
        booking = RoomBooking.objects.create(
            room=self.room,
            booked_by=self.user,
            title='Team Meeting',
            start_time=start,
            end_time=end,
        )
        self.assertIsNotNone(booking.id)
        # Auto-approved since room doesn't require approval
        self.assertEqual(booking.status, RoomBookingStatus.APPROVED)

    def test_booking_requires_approval(self):
        self.room.requires_approval = True
        self.room.save()

        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=2)
        booking = RoomBooking.objects.create(
            room=self.room,
            booked_by=self.user,
            title='Team Meeting',
            start_time=start,
            end_time=end,
        )
        self.assertEqual(booking.status, RoomBookingStatus.PENDING)


class RoomBookingAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.room = Room.objects.create(
            name='Meeting Room',
            code='MR-01',
            capacity=10,
        )

    def test_create_booking(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:roombooking-list')
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=2)
        data = {
            'room': str(self.room.id),
            'title': 'Team Meeting',
            'start_time': start.isoformat(),
            'end_time': end.isoformat(),
            'expected_attendees': 5,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_my_bookings(self):
        self.client.force_authenticate(user=self.user)
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=2)
        RoomBooking.objects.create(
            room=self.room,
            booked_by=self.user,
            title='Test',
            start_time=start,
            end_time=end,
        )
        url = reverse('api_v1:roombooking-my-bookings')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


# ============= Vehicle Management Tests =============

class VehicleModelTest(TestCase):
    def test_create_vehicle(self):
        vehicle = Vehicle.objects.create(
            name='Toyota Innova',
            plate_number='B 1234 ABC',
            vehicle_type=VehicleType.MPV,
            brand='Toyota',
            model='Innova',
            year=2022,
            capacity=7,
        )
        self.assertEqual(str(vehicle), 'Toyota Innova (B 1234 ABC)')
        self.assertEqual(vehicle.status, VehicleStatus.AVAILABLE)


class VehicleBookingModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
        )
        self.vehicle = Vehicle.objects.create(
            name='Toyota Innova',
            plate_number='B 1234 ABC',
            vehicle_type=VehicleType.MPV,
            brand='Toyota',
            model='Innova',
            year=2022,
        )

    def test_create_booking(self):
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=4)
        booking = VehicleBooking.objects.create(
            vehicle=self.vehicle,
            booked_by=self.user,
            purpose='Kunjungan ke Kementerian',
            destination='Kementerian BUMN',
            start_time=start,
            end_time=end,
        )
        self.assertIsNotNone(booking.id)
        self.assertEqual(booking.status, VehicleBookingStatus.PENDING)


class VehicleBookingAPITest(APITestCase):
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
        self.vehicle = Vehicle.objects.create(
            name='Toyota Innova',
            plate_number='B 1234 ABC',
            vehicle_type=VehicleType.MPV,
            brand='Toyota',
            model='Innova',
            year=2022,
        )

    def test_create_booking(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:vehiclebooking-list')
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=4)
        data = {
            'vehicle': str(self.vehicle.id),
            'purpose': 'Meeting',
            'destination': 'Jakarta',
            'start_time': start.isoformat(),
            'end_time': end.isoformat(),
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_approve_booking(self):
        self.client.force_authenticate(user=self.admin)
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=4)
        booking = VehicleBooking.objects.create(
            vehicle=self.vehicle,
            booked_by=self.user,
            purpose='Meeting',
            destination='Jakarta',
            start_time=start,
            end_time=end,
        )
        url = reverse('api_v1:vehiclebooking-approve', kwargs={'pk': booking.id})
        response = self.client.post(url, {'approved': True})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, VehicleBookingStatus.APPROVED)

    def test_start_and_end_trip(self):
        self.client.force_authenticate(user=self.admin)
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=4)
        booking = VehicleBooking.objects.create(
            vehicle=self.vehicle,
            booked_by=self.user,
            purpose='Meeting',
            destination='Jakarta',
            start_time=start,
            end_time=end,
            status=VehicleBookingStatus.APPROVED,
        )

        # Start trip
        url = reverse('api_v1:vehiclebooking-start-trip', kwargs={'pk': booking.id})
        response = self.client.post(url, {'start_odometer': 50000})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, VehicleBookingStatus.IN_PROGRESS)

        # End trip
        url = reverse('api_v1:vehiclebooking-end-trip', kwargs={'pk': booking.id})
        response = self.client.post(url, {'end_odometer': 50100})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, VehicleBookingStatus.COMPLETED)
        self.assertEqual(booking.distance_traveled, 100)


# ============= Visitor Log Tests =============

class VisitorModelTest(TestCase):
    def test_create_visitor(self):
        visitor = Visitor.objects.create(
            name='John Doe',
            company='PT ABC',
            phone='08123456789',
        )
        self.assertEqual(str(visitor), 'John Doe (PT ABC)')
        self.assertFalse(visitor.is_blacklisted)


class VisitLogModelTest(TestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='host',
            email='host@test.com',
            password='testpass123',
        )
        self.visitor = Visitor.objects.create(
            name='John Doe',
            company='PT ABC',
            phone='08123456789',
        )

    def test_create_visit(self):
        visit = VisitLog.objects.create(
            visitor=self.visitor,
            visitor_name=self.visitor.name,
            purpose=VisitPurpose.MEETING,
            host=self.host,
            expected_arrival=timezone.now() + timedelta(hours=1),
        )
        self.assertEqual(visit.status, VisitStatus.EXPECTED)

    def test_visit_duration(self):
        now = timezone.now()
        visit = VisitLog.objects.create(
            visitor_name='Test Visitor',
            purpose=VisitPurpose.MEETING,
            status=VisitStatus.CHECKED_OUT,
            check_in_time=now - timedelta(hours=2),
            check_out_time=now,
        )
        self.assertEqual(visit.duration_minutes, 120)


class VisitLogAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='security',
            email='security@test.com',
            password='testpass123',
        )
        self.host = User.objects.create_user(
            username='host',
            email='host@test.com',
            password='testpass123',
        )

    def test_pre_register_visitor(self):
        self.client.force_authenticate(user=self.host)
        url = reverse('api_v1:visitlog-pre-register')
        data = {
            'visitor_name': 'John Doe',
            'visitor_company': 'PT ABC',
            'visitor_phone': '08123456789',
            'purpose': VisitPurpose.MEETING,
            'host': str(self.host.id),
            'expected_arrival': (timezone.now() + timedelta(hours=1)).isoformat(),
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['is_pre_registered'])

    def test_walk_in_visitor(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:visitlog-walk-in')
        data = {
            'visitor_name': 'Jane Doe',
            'visitor_company': 'PT XYZ',
            'visitor_phone': '08987654321',
            'purpose': VisitPurpose.DELIVERY,
            'host_name': 'Reception',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], VisitStatus.CHECKED_IN)

    def test_check_in_and_check_out(self):
        self.client.force_authenticate(user=self.user)

        # Pre-register
        visit = VisitLog.objects.create(
            visitor_name='John Doe',
            purpose=VisitPurpose.MEETING,
            host=self.host,
            expected_arrival=timezone.now() + timedelta(hours=1),
            status=VisitStatus.EXPECTED,
            is_pre_registered=True,
        )

        # Check in
        url = reverse('api_v1:visitlog-check-in', kwargs={'pk': visit.id})
        response = self.client.post(url, {'badge_number': 'V001'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        visit.refresh_from_db()
        self.assertEqual(visit.status, VisitStatus.CHECKED_IN)

        # Check out
        url = reverse('api_v1:visitlog-check-out', kwargs={'pk': visit.id})
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        visit.refresh_from_db()
        self.assertEqual(visit.status, VisitStatus.CHECKED_OUT)

    def test_currently_in(self):
        self.client.force_authenticate(user=self.user)
        # Create a checked-in visitor
        VisitLog.objects.create(
            visitor_name='John Doe',
            purpose=VisitPurpose.MEETING,
            status=VisitStatus.CHECKED_IN,
            check_in_time=timezone.now(),
        )
        url = reverse('api_v1:visitlog-currently-in')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
