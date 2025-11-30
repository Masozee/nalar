from django.db import models
from apps.core.models import BaseModel, AuditMixin


class Department(BaseModel, AuditMixin):
    """Department model for organizational structure."""

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children',
    )
    head = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='departments_headed',
    )

    class Meta:
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['parent']),
        ]

    def __str__(self):
        return self.name


class Position(BaseModel, AuditMixin):
    """Position/Job Title model for organizational structure."""

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='positions',
    )
    level = models.PositiveIntegerField(default=1, help_text="Job level/grade")
    min_salary = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    max_salary = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = 'Position'
        verbose_name_plural = 'Positions'
        ordering = ['level', 'name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['department']),
            models.Index(fields=['level']),
        ]

    def __str__(self):
        return self.name


class Team(BaseModel, AuditMixin):
    """Team model within departments."""

    name = models.CharField(max_length=100, db_index=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='teams',
    )
    lead = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teams_led',
    )
    members = models.ManyToManyField(
        'users.User',
        related_name='teams',
        blank=True,
    )

    class Meta:
        verbose_name = 'Team'
        verbose_name_plural = 'Teams'
        ordering = ['name']
        indexes = [
            models.Index(fields=['department', 'name']),
        ]

    def __str__(self):
        return f"{self.department.name} - {self.name}"
