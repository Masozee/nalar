from django.db import models
from django.conf import settings
from apps.core.models import TenantBaseModel, AuditMixin
from apps.core.enums import (
    EmploymentType,
    EmploymentStatus,
    Gender,
    MaritalStatus,
    FamilyRelation,
)


class Employee(TenantBaseModel, AuditMixin):
    """Employee model containing all staff details."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employee',
        null=True,
        blank=True,
        help_text="Optional: Link to user account for system access"
    )
    employee_id = models.CharField(max_length=50, unique=True)

    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        blank=True,
    )
    date_of_birth = models.DateField(null=True, blank=True)
    place_of_birth = models.CharField(max_length=100, blank=True)
    nationality = models.CharField(max_length=50, blank=True)
    national_id = models.CharField(max_length=50, blank=True)
    tax_id = models.CharField(max_length=50, blank=True)
    marital_status = models.CharField(
        max_length=20,
        choices=MaritalStatus.choices,
        blank=True,
    )

    # Contact Information
    personal_email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    mobile = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)

    # Employment Information
    employment_type = models.CharField(
        max_length=20,
        choices=EmploymentType.choices,
        default=EmploymentType.STAFF,
    )
    employment_status = models.CharField(
        max_length=20,
        choices=EmploymentStatus.choices,
        default=EmploymentStatus.ACTIVE,
    )
    department = models.ForeignKey(
        'organization.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
    )
    position = models.CharField(max_length=100, blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    supervisor = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates',
    )

    # Dates
    join_date = models.DateField(null=True, blank=True)
    contract_start_date = models.DateField(null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)
    termination_date = models.DateField(null=True, blank=True)

    # Documents
    avatar = models.ImageField(upload_to='employees/avatars/', blank=True, null=True)

    # Face Recognition
    face_image = models.ImageField(
        upload_to='employees/faces/',
        blank=True,
        null=True,
        help_text='Reference face image for recognition'
    )
    face_encoding = models.TextField(
        blank=True,
        help_text='Encoded face data for recognition (JSON array)'
    )
    face_registered = models.BooleanField(
        default=False,
        help_text='Whether face recognition is registered for this employee'
    )

    # Banking Information
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_account_name = models.CharField(max_length=100, blank=True)

    # Office Information
    room_number = models.CharField(max_length=20, blank=True)
    phone_extension = models.CharField(max_length=10, blank=True)
    printer_id = models.CharField(max_length=50, blank=True)
    workstation_id = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
        ordering = ['employee_id']
        indexes = [
            models.Index(fields=['employment_type']),
            models.Index(fields=['employment_status']),
            models.Index(fields=['employment_type', 'employment_status']),
            models.Index(fields=['first_name', 'last_name']),
            models.Index(fields=['national_id']),
        ]

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class EmployeeFamily(TenantBaseModel):
    """Family members of an employee."""

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='family_members',
    )
    name = models.CharField(max_length=200)
    relation = models.CharField(
        max_length=20,
        choices=FamilyRelation.choices,
    )
    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        blank=True,
    )
    date_of_birth = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_emergency_contact = models.BooleanField(default=False)
    is_dependent = models.BooleanField(default=False)
    occupation = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = 'Employee Family Member'
        verbose_name_plural = 'Employee Family Members'
        ordering = ['employee', 'relation']
        indexes = [
            models.Index(fields=['employee', 'relation']),
            models.Index(fields=['is_emergency_contact']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.name} ({self.get_relation_display()})"


class EmployeeEducation(TenantBaseModel):
    """Education history of an employee."""

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='education_history',
    )
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=100)
    field_of_study = models.CharField(max_length=100, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    grade = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Employee Education'
        verbose_name_plural = 'Employee Education'
        ordering = ['-end_date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.degree} at {self.institution}"


class EmployeeWorkHistory(TenantBaseModel):
    """Previous work experience of an employee."""

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='work_history',
    )
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=100)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    responsibilities = models.TextField(blank=True)
    reason_for_leaving = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = 'Employee Work History'
        verbose_name_plural = 'Employee Work History'
        ordering = ['-end_date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.position} at {self.company}"
