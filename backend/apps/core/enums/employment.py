from django.db import models


class EmploymentType(models.TextChoices):
    STAFF = 'staff', 'Staff'
    INTERN = 'intern', 'Intern'
    RESEARCH_FELLOW = 'research_fellow', 'Research Fellow'
    CONTRACT = 'contract', 'Contract'


class EmploymentStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    INACTIVE = 'inactive', 'Inactive'
    ON_LEAVE = 'on_leave', 'On Leave'
    TERMINATED = 'terminated', 'Terminated'
    RESIGNED = 'resigned', 'Resigned'


class Gender(models.TextChoices):
    MALE = 'male', 'Male'
    FEMALE = 'female', 'Female'


class MaritalStatus(models.TextChoices):
    SINGLE = 'single', 'Single'
    MARRIED = 'married', 'Married'
    DIVORCED = 'divorced', 'Divorced'
    WIDOWED = 'widowed', 'Widowed'


class FamilyRelation(models.TextChoices):
    SPOUSE = 'spouse', 'Spouse'
    CHILD = 'child', 'Child'
    PARENT = 'parent', 'Parent'
    SIBLING = 'sibling', 'Sibling'
    EMERGENCY_CONTACT = 'emergency_contact', 'Emergency Contact'
