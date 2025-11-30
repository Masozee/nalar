from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from .base import BaseModel


class CustomFieldDefinition(BaseModel):
    """Defines available custom fields that can be used across models."""

    name = models.CharField(max_length=100)
    key = models.SlugField(max_length=100, unique=True)
    field_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Text'),
            ('number', 'Number'),
            ('date', 'Date'),
            ('boolean', 'Boolean'),
            ('email', 'Email'),
            ('phone', 'Phone'),
            ('url', 'URL'),
        ],
        default='text',
    )
    description = models.TextField(blank=True)
    is_required = models.BooleanField(default=False)
    default_value = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Custom Field Definition'
        verbose_name_plural = 'Custom Field Definitions'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.field_type})"


class CustomFieldValue(BaseModel):
    """Stores custom field values for any model using GenericForeignKey."""

    field = models.ForeignKey(
        CustomFieldDefinition,
        on_delete=models.CASCADE,
        related_name='values',
    )
    value = models.TextField(blank=True)

    # Generic relation to any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        verbose_name = 'Custom Field Value'
        verbose_name_plural = 'Custom Field Values'
        unique_together = ['field', 'content_type', 'object_id']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f"{self.field.name}: {self.value}"


class CustomFieldMixin(models.Model):
    """Mixin to add custom fields capability to any model."""

    custom_fields = GenericRelation(CustomFieldValue)

    class Meta:
        abstract = True

    def get_custom_field(self, key):
        """Get a custom field value by key."""
        try:
            return self.custom_fields.get(field__key=key).value
        except CustomFieldValue.DoesNotExist:
            return None

    def set_custom_field(self, key, value):
        """Set a custom field value by key."""
        field = CustomFieldDefinition.objects.get(key=key)
        obj, created = self.custom_fields.update_or_create(
            field=field,
            defaults={'value': value}
        )
        return obj
