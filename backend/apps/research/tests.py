"""
Tests for Research module.
"""
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from apps.research.grant_management.models import (
    Grant, GrantTeamMember, GrantMilestone, GrantDisbursement,
    GrantStatus, GrantType, FundingSource
)
from apps.research.publication.models import (
    Publication, PublicationAuthor, PublicationReview,
    PublicationType, PublicationStatus, IndexationType
)
from apps.research.project_tracking.models import (
    ResearchProject, ProjectTeamMember, ProjectTask, ProjectUpdate,
    ProjectStatus, ProjectType
)

User = get_user_model()


class GrantModelTest(TestCase):
    """Test Grant model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='piuser',
            email='pi@example.com',
            password='testpass123'
        )

    def test_create_grant(self):
        """Test creating grant generates number."""
        grant = Grant.objects.create(
            title='Penelitian AI untuk Kesehatan',
            principal_investigator=self.user,
            grant_type=GrantType.GOVERNMENT,
            funding_source=FundingSource.DIKTI,
        )
        self.assertTrue(grant.grant_number.startswith('GRT-'))
        self.assertEqual(grant.status, GrantStatus.DRAFT)

    def test_grant_remaining_budget(self):
        """Test remaining budget calculation."""
        grant = Grant.objects.create(
            title='Test Grant',
            principal_investigator=self.user,
            approved_amount=Decimal('100000000'),
            disbursed_amount=Decimal('30000000'),
        )
        self.assertEqual(grant.remaining_budget, Decimal('70000000'))


class GrantTeamMemberTest(TestCase):
    """Test GrantTeamMember model."""

    def setUp(self):
        self.pi = User.objects.create_user(
            username='pi', email='pi@test.com', password='pass'
        )
        self.member = User.objects.create_user(
            username='member', email='member@test.com', password='pass'
        )
        self.grant = Grant.objects.create(
            title='Test Grant',
            principal_investigator=self.pi,
        )

    def test_add_team_member(self):
        """Test adding team member."""
        member = GrantTeamMember.objects.create(
            grant=self.grant,
            user=self.member,
            role=GrantTeamMember.Role.RESEARCHER,
        )
        self.assertEqual(self.grant.team_members.count(), 1)


class PublicationModelTest(TestCase):
    """Test Publication model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='author',
            email='author@example.com',
            password='testpass123'
        )

    def test_create_publication(self):
        """Test creating publication."""
        from datetime import date
        pub = Publication.objects.create(
            title='Machine Learning in Healthcare',
            publication_type=PublicationType.JOURNAL_ARTICLE,
            journal_name='Nature Medicine',
            publication_date=date(2024, 6, 15),
        )
        self.assertEqual(pub.status, PublicationStatus.DRAFT)
        self.assertEqual(pub.year, 2024)

    def test_publication_authors(self):
        """Test adding authors to publication."""
        pub = Publication.objects.create(
            title='Test Publication',
            publication_type=PublicationType.CONFERENCE_PAPER,
        )
        author = PublicationAuthor.objects.create(
            publication=pub,
            user=self.user,
            author_type=PublicationAuthor.AuthorType.INTERNAL,
            order=1,
            is_corresponding=True,
        )
        self.assertEqual(pub.authors.count(), 1)
        self.assertTrue(author.is_corresponding)


class ResearchProjectModelTest(TestCase):
    """Test ResearchProject model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='lead',
            email='lead@example.com',
            password='testpass123'
        )

    def test_create_project(self):
        """Test creating project generates code."""
        project = ResearchProject.objects.create(
            title='Studi Kebijakan Energi Terbarukan',
            lead_researcher=self.user,
            project_type=ProjectType.POLICY_RESEARCH,
        )
        self.assertTrue(project.project_code.startswith('PRJ-'))
        self.assertEqual(project.status, ProjectStatus.PLANNING)

    def test_project_task(self):
        """Test adding task to project."""
        project = ResearchProject.objects.create(
            title='Test Project',
            lead_researcher=self.user,
        )
        task = ProjectTask.objects.create(
            project=project,
            title='Literature Review',
            priority=ProjectTask.Priority.HIGH,
        )
        self.assertEqual(project.tasks.count(), 1)
        self.assertEqual(task.status, ProjectTask.TaskStatus.TODO)


# API Tests
class GrantAPITest(APITestCase):
    """Test Grant API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='apiuser',
            email='api@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_grant(self):
        """Test creating grant via API."""
        data = {
            'title': 'Riset Machine Learning',
            'abstract': 'Penelitian tentang ML',
            'grant_type': GrantType.INTERNAL,
            'funding_source': FundingSource.INTERNAL,
            'principal_investigator': str(self.user.id),
            'requested_amount': '50000000',
        }
        response = self.client.post('/api/v1/research/grants/grants/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['grant_number'].startswith('GRT-'))

    def test_list_grants(self):
        """Test listing grants."""
        Grant.objects.create(
            title='Grant 1',
            principal_investigator=self.user,
        )
        Grant.objects.create(
            title='Grant 2',
            principal_investigator=self.user,
        )
        response = self.client.get('/api/v1/research/grants/grants/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_grant_summary(self):
        """Test grant summary endpoint."""
        Grant.objects.create(
            title='Active Grant',
            principal_investigator=self.user,
            status=GrantStatus.ACTIVE,
            approved_amount=Decimal('100000000'),
        )
        response = self.client.get('/api/v1/research/grants/grants/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_grants', response.data)


class PublicationAPITest(APITestCase):
    """Test Publication API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='pubuser',
            email='pub@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_publication(self):
        """Test creating publication via API."""
        data = {
            'title': 'Deep Learning for NLP',
            'publication_type': PublicationType.JOURNAL_ARTICLE,
            'journal_name': 'ACL',
        }
        response = self.client.post('/api/v1/research/publications/publications/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_publication_summary(self):
        """Test publication summary endpoint."""
        Publication.objects.create(
            title='Pub 1',
            publication_type=PublicationType.JOURNAL_ARTICLE,
            status=PublicationStatus.PUBLISHED,
            indexation=IndexationType.SCOPUS,
        )
        response = self.client.get('/api/v1/research/publications/publications/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('by_type', response.data)
        self.assertIn('by_indexation', response.data)


class ResearchProjectAPITest(APITestCase):
    """Test ResearchProject API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='projuser',
            email='proj@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_project(self):
        """Test creating project via API."""
        data = {
            'title': 'Policy Research Project',
            'description': 'Research on policy',
            'project_type': ProjectType.POLICY_RESEARCH,
            'lead_researcher': str(self.user.id),
            'budget': '75000000',
        }
        response = self.client.post('/api/v1/research/projects/projects/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['project_code'].startswith('PRJ-'))

    def test_project_summary(self):
        """Test project summary endpoint."""
        ResearchProject.objects.create(
            title='Project 1',
            lead_researcher=self.user,
            status=ProjectStatus.ACTIVE,
        )
        response = self.client.get('/api/v1/research/projects/projects/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('by_status', response.data)

    def test_start_project(self):
        """Test starting project via API."""
        project = ResearchProject.objects.create(
            title='Start Test',
            lead_researcher=self.user,
            status=ProjectStatus.PLANNING,
        )
        response = self.client.post(f'/api/v1/research/projects/projects/{project.id}/start/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project.refresh_from_db()
        self.assertEqual(project.status, ProjectStatus.ACTIVE)
