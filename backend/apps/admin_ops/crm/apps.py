"""
CRM App Configuration
"""
from django.apps import AppConfig


class CrmConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.admin_ops.crm'
    label = 'crm'
    verbose_name = 'CRM (Contact Relationship Management)'
