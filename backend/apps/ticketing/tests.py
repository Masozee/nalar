from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import timedelta
from apps.users.models import User
from .models import (
    Category, SLAPolicy, Ticket, TicketComment, TicketAttachment,
    TicketPriority, TicketStatus, TicketType,
)


class CategoryModelTest(TestCase):
    def test_create_category(self):
        category = Category.objects.create(
            name='IT Support',
            code='IT-SUPPORT',
            description='General IT support tickets',
        )
        self.assertEqual(str(category), 'IT Support')
        self.assertTrue(category.is_active)

    def test_category_hierarchy(self):
        parent = Category.objects.create(name='IT', code='IT')
        child = Category.objects.create(
            name='Hardware',
            code='IT-HW',
            parent=parent,
        )
        self.assertEqual(child.parent, parent)
        self.assertIn(child, parent.children.all())


class SLAPolicyModelTest(TestCase):
    def test_create_sla_policy(self):
        sla = SLAPolicy.objects.create(
            name='Critical SLA',
            priority=TicketPriority.CRITICAL,
            response_time=30,  # 30 minutes
            resolution_time=240,  # 4 hours
        )
        self.assertEqual(str(sla), 'Critical SLA (Kritis)')
        self.assertEqual(sla.response_time, 30)
        self.assertEqual(sla.resolution_time, 240)


class TicketModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='requester',
            email='requester@test.com',
            password='testpass123',
        )
        self.category = Category.objects.create(
            name='IT Support',
            code='IT-SUPPORT',
        )
        self.sla = SLAPolicy.objects.create(
            name='Medium SLA',
            priority=TicketPriority.MEDIUM,
            response_time=120,
            resolution_time=480,
        )

    def test_create_ticket_auto_number(self):
        ticket = Ticket.objects.create(
            title='Test Ticket',
            description='Test description',
            requester=self.user,
            category=self.category,
            priority=TicketPriority.MEDIUM,
        )
        self.assertTrue(ticket.ticket_number.startswith('TKT-'))
        self.assertEqual(len(ticket.ticket_number), 16)  # TKT-YYYYMM-XXXXX

    def test_ticket_auto_sla_assignment(self):
        ticket = Ticket.objects.create(
            title='Test Ticket',
            description='Test description',
            requester=self.user,
            priority=TicketPriority.MEDIUM,
        )
        self.assertEqual(ticket.sla_policy, self.sla)
        self.assertIsNotNone(ticket.response_due)
        self.assertIsNotNone(ticket.resolution_due)

    def test_ticket_sla_breach_detection(self):
        ticket = Ticket.objects.create(
            title='Test Ticket',
            description='Test description',
            requester=self.user,
            priority=TicketPriority.MEDIUM,
        )
        # Simulate breach by setting response_due in the past
        ticket.response_due = timezone.now() - timedelta(hours=1)
        ticket.check_sla_breach()
        self.assertTrue(ticket.response_breached)

    def test_ticket_number_sequential(self):
        ticket1 = Ticket.objects.create(
            title='Ticket 1',
            description='Description',
            requester=self.user,
        )
        ticket2 = Ticket.objects.create(
            title='Ticket 2',
            description='Description',
            requester=self.user,
        )
        # Extract sequence numbers
        seq1 = int(ticket1.ticket_number.split('-')[-1])
        seq2 = int(ticket2.ticket_number.split('-')[-1])
        self.assertEqual(seq2, seq1 + 1)


class TicketCommentModelTest(TestCase):
    def setUp(self):
        self.requester = User.objects.create_user(
            username='requester',
            email='requester@test.com',
            password='testpass123',
        )
        self.assignee = User.objects.create_user(
            username='assignee',
            email='assignee@test.com',
            password='testpass123',
        )
        self.ticket = Ticket.objects.create(
            title='Test Ticket',
            description='Test description',
            requester=self.requester,
            assignee=self.assignee,
        )

    def test_first_response_tracking(self):
        # Comment by assignee should mark first response
        # First verify there's no first_response_at initially
        self.assertIsNone(self.ticket.first_response_at)

        comment = TicketComment.objects.create(
            ticket=self.ticket,
            author=self.assignee,
            content='First response',
        )
        comment.refresh_from_db()
        self.ticket.refresh_from_db()
        # Note: is_first_response is set in model save() when assignee comments
        self.assertIsNotNone(self.ticket.first_response_at)

    def test_non_assignee_comment_not_first_response(self):
        # Comment by requester should not be marked as first response
        comment = TicketComment.objects.create(
            ticket=self.ticket,
            author=self.requester,
            content='Requester comment',
        )
        self.assertFalse(comment.is_first_response)


class TicketAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@test.com',
            password='testpass123',
        )
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='adminpass123',
        )
        self.category = Category.objects.create(
            name='IT Support',
            code='IT-SUPPORT',
        )
        SLAPolicy.objects.create(
            name='Medium SLA',
            priority=TicketPriority.MEDIUM,
            response_time=120,
            resolution_time=480,
        )

    def test_create_ticket(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:ticket-list')
        data = {
            'title': 'My laptop is broken',
            'description': 'Screen not working',
            'priority': TicketPriority.HIGH,
            'ticket_type': TicketType.INCIDENT,
            'category': str(self.category.id),
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check the ticket was created in DB
        ticket = Ticket.objects.filter(title='My laptop is broken').first()
        self.assertIsNotNone(ticket)
        self.assertTrue(ticket.ticket_number.startswith('TKT-'))

    def test_list_my_tickets(self):
        self.client.force_authenticate(user=self.user)
        # Create a ticket
        Ticket.objects.create(
            title='Test Ticket',
            description='Test description',
            requester=self.user,
        )
        url = reverse('api_v1:ticket-my-tickets')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_assign_ticket(self):
        self.client.force_authenticate(user=self.admin)
        ticket = Ticket.objects.create(
            title='Test Ticket',
            description='Test description',
            requester=self.user,
        )
        url = reverse('api_v1:ticket-assign', kwargs={'pk': ticket.id})
        data = {'assignee_id': str(self.admin.id)}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.assignee, self.admin)
        self.assertEqual(ticket.status, TicketStatus.IN_PROGRESS)

    def test_take_ticket(self):
        self.client.force_authenticate(user=self.admin)
        ticket = Ticket.objects.create(
            title='Unassigned Ticket',
            description='Test description',
            requester=self.user,
        )
        url = reverse('api_v1:ticket-take', kwargs={'pk': ticket.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.assignee, self.admin)

    def test_take_already_assigned_ticket(self):
        self.client.force_authenticate(user=self.admin)
        ticket = Ticket.objects.create(
            title='Assigned Ticket',
            description='Test description',
            requester=self.user,
            assignee=self.user,
        )
        url = reverse('api_v1:ticket-take', kwargs={'pk': ticket.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_ticket_status(self):
        self.client.force_authenticate(user=self.admin)
        ticket = Ticket.objects.create(
            title='Test Ticket',
            description='Test description',
            requester=self.user,
            assignee=self.admin,
            status=TicketStatus.IN_PROGRESS,
        )
        url = reverse('api_v1:ticket-update-status', kwargs={'pk': ticket.id})
        data = {
            'status': TicketStatus.RESOLVED,
            'comment': 'Issue resolved',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, TicketStatus.RESOLVED)
        self.assertIsNotNone(ticket.resolved_at)

    def test_add_comment(self):
        self.client.force_authenticate(user=self.user)
        ticket = Ticket.objects.create(
            title='Test Ticket',
            description='Test description',
            requester=self.user,
        )
        url = reverse('api_v1:ticket-add-comment', kwargs={'pk': ticket.id})
        data = {
            'content': 'This is a comment',
            'comment_type': 'reply',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ticket.comments.count(), 1)

    def test_dashboard_stats(self):
        self.client.force_authenticate(user=self.admin)
        # Create some tickets
        Ticket.objects.create(
            title='Open Ticket',
            description='Test',
            requester=self.user,
            status=TicketStatus.OPEN,
        )
        Ticket.objects.create(
            title='In Progress Ticket',
            description='Test',
            requester=self.user,
            status=TicketStatus.IN_PROGRESS,
        )
        url = reverse('api_v1:ticket-dashboard-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 2)
        self.assertEqual(response.data['open'], 1)
        self.assertEqual(response.data['in_progress'], 1)


class CategoryAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='adminpass123',
        )
        self.parent = Category.objects.create(name='IT', code='IT')
        Category.objects.create(name='Hardware', code='IT-HW', parent=self.parent)
        Category.objects.create(name='Software', code='IT-SW', parent=self.parent)

    def test_category_tree(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:category-tree')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # One root category
        self.assertEqual(len(response.data[0]['children']), 2)  # Two children


class SLAPolicyAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='adminpass123',
        )

    def test_create_sla_policy(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('api_v1:slapolicy-list')
        data = {
            'name': 'High Priority SLA',
            'priority': TicketPriority.HIGH,
            'response_time': 60,
            'resolution_time': 240,
            'business_hours_only': True,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
