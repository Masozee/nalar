from django.contrib import admin
from .models import CustomFieldDefinition, CustomFieldValue


@admin.register(CustomFieldDefinition)
class CustomFieldDefinitionAdmin(admin.ModelAdmin):
    list_display = ['name', 'key', 'field_type', 'is_required', 'is_active']
    list_filter = ['field_type', 'is_required', 'is_active']
    search_fields = ['name', 'key']
    prepopulated_fields = {'key': ('name',)}


@admin.register(CustomFieldValue)
class CustomFieldValueAdmin(admin.ModelAdmin):
    list_display = ['field', 'value', 'content_type', 'object_id']
    list_filter = ['field', 'content_type']
    search_fields = ['value']
