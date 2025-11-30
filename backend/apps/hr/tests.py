from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Employee, EmployeeFamily, EmployeeEducation, EmployeeWorkHistory
from apps.core.enums import EmploymentType, EmploymentStatus, Gender, FamilyRelation

User = get_user_model()


class EmployeeModelTest(TestCase):
    """Tests for Employee model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.employee = Employee.objects.create(
            user=self.user,
            employee_id='EMP001',
            first_name='John',
            last_name='Doe',
            employment_type=EmploymentType.STAFF,
            employment_status=EmploymentStatus.ACTIVE,
        )

    def test_employee_creation(self):
        """Test employee is created correctly."""
        self.assertEqual(self.employee.employee_id, 'EMP001')
        self.assertEqual(self.employee.full_name, 'John Doe')
        self.assertEqual(self.employee.employment_type, EmploymentType.STAFF)

    def test_employee_str(self):
        """Test employee string representation."""
        self.assertEqual(str(self.employee), 'EMP001 - John Doe')

    def test_employee_full_name_property(self):
        """Test full_name property."""
        self.assertEqual(self.employee.full_name, 'John Doe')


class EmployeeFamilyModelTest(TestCase):
    """Tests for EmployeeFamily model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.employee = Employee.objects.create(
            user=self.user,
            employee_id='EMP001',
            first_name='John',
            last_name='Doe',
        )
        self.family_member = EmployeeFamily.objects.create(
            employee=self.employee,
            name='Jane Doe',
            relation=FamilyRelation.SPOUSE,
            is_emergency_contact=True,
        )

    def test_family_member_creation(self):
        """Test family member is created correctly."""
        self.assertEqual(self.family_member.name, 'Jane Doe')
        self.assertEqual(self.family_member.relation, FamilyRelation.SPOUSE)
        self.assertTrue(self.family_member.is_emergency_contact)

    def test_family_member_str(self):
        """Test family member string representation."""
        self.assertIn('Jane Doe', str(self.family_member))
        self.assertIn('Spouse', str(self.family_member))


class EmployeeAPITest(APITestCase):
    """Tests for Employee API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='adminpass123'
        )
        self.client.force_authenticate(user=self.user)

        self.employee = Employee.objects.create(
            user=self.user,
            employee_id='EMP001',
            first_name='John',
            last_name='Doe',
            employment_type=EmploymentType.STAFF,
            employment_status=EmploymentStatus.ACTIVE,
        )

    def test_list_employees(self):
        """Test listing employees."""
        response = self.client.get('/api/v1/hr/employees/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_retrieve_employee(self):
        """Test retrieving a single employee."""
        response = self.client.get(f'/api/v1/hr/employees/{self.employee.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['employee_id'], 'EMP001')

    def test_create_employee(self):
        """Test creating a new employee."""
        new_user = User.objects.create_user(
            email='new@example.com',
            username='newuser',
            password='newpass123'
        )
        data = {
            'user': str(new_user.id),
            'employee_id': 'EMP002',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'employment_type': EmploymentType.INTERN,
        }
        response = self.client.post('/api/v1/hr/employees/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Employee.objects.count(), 2)

    def test_filter_by_employment_type(self):
        """Test filtering employees by employment type."""
        response = self.client.get('/api/v1/hr/employees/', {'employment_type': 'staff'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

        response = self.client.get('/api/v1/hr/employees/', {'employment_type': 'intern'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_me_endpoint(self):
        """Test the /me endpoint returns current user's employee profile."""
        response = self.client.get('/api/v1/hr/employees/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['employee_id'], 'EMP001')


class EmployeeFamilyAPITest(APITestCase):
    """Tests for EmployeeFamily API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='adminpass123'
        )
        self.client.force_authenticate(user=self.user)

        self.employee = Employee.objects.create(
            user=self.user,
            employee_id='EMP001',
            first_name='John',
            last_name='Doe',
        )
        self.family_member = EmployeeFamily.objects.create(
            employee=self.employee,
            name='Jane Doe',
            relation=FamilyRelation.SPOUSE,
        )

    def test_list_family_members(self):
        """Test listing employee's family members."""
        response = self.client.get(f'/api/v1/hr/employees/{self.employee.id}/family/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_family_member(self):
        """Test adding a family member to an employee."""
        data = {
            'name': 'Baby Doe',
            'relation': FamilyRelation.CHILD,
            'is_dependent': True,
        }
        response = self.client.post(
            f'/api/v1/hr/employees/{self.employee.id}/family/',
            data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EmployeeFamily.objects.count(), 2)


class EmploymentTypeTest(TestCase):
    """Tests for employment type filtering."""

    def setUp(self):
        self.users = []
        for i in range(3):
            user = User.objects.create_user(
                email=f'user{i}@example.com',
                username=f'user{i}',
                password='pass123'
            )
            self.users.append(user)

        Employee.objects.create(
            user=self.users[0],
            employee_id='EMP001',
            first_name='Staff',
            last_name='Member',
            employment_type=EmploymentType.STAFF,
        )
        Employee.objects.create(
            user=self.users[1],
            employee_id='INT001',
            first_name='Intern',
            last_name='Student',
            employment_type=EmploymentType.INTERN,
        )
        Employee.objects.create(
            user=self.users[2],
            employee_id='RF001',
            first_name='Research',
            last_name='Fellow',
            employment_type=EmploymentType.RESEARCH_FELLOW,
        )

    def test_filter_staff(self):
        """Test filtering staff employees."""
        staff = Employee.objects.filter(employment_type=EmploymentType.STAFF)
        self.assertEqual(staff.count(), 1)
        self.assertEqual(staff.first().first_name, 'Staff')

    def test_filter_interns(self):
        """Test filtering intern employees."""
        interns = Employee.objects.filter(employment_type=EmploymentType.INTERN)
        self.assertEqual(interns.count(), 1)
        self.assertEqual(interns.first().first_name, 'Intern')

    def test_filter_research_fellows(self):
        """Test filtering research fellow employees."""
        fellows = Employee.objects.filter(employment_type=EmploymentType.RESEARCH_FELLOW)
        self.assertEqual(fellows.count(), 1)
        self.assertEqual(fellows.first().first_name, 'Research')
