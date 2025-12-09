"""
Management command to assign existing records to a default tenant.
Run this once after switching models to TenantBaseModel.

Usage:
    python manage.py assign_default_tenant
    python manage.py assign_default_tenant --tenant-name "My Organization"
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from django.apps import apps
from apps.tenants.models import Tenant


class Command(BaseCommand):
    help = 'Assigns all existing records to a default tenant'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-name',
            type=str,
            default='Default Organization',
            help='Name for the default tenant',
        )
        parser.add_argument(
            '--tenant-slug',
            type=str,
            default='default',
            help='Slug for the default tenant',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without making changes',
        )

    def handle(self, *args, **options):
        tenant_name = options['tenant_name']
        tenant_slug = options['tenant_slug']
        dry_run = options['dry_run']

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))

        self.stdout.write(self.style.WARNING(
            f'\nCreating default tenant: {tenant_name} ({tenant_slug})'
        ))

        with transaction.atomic():
            # Create or get default tenant
            if not dry_run:
                tenant, created = Tenant.objects.get_or_create(
                    slug=tenant_slug,
                    defaults={
                        'name': tenant_name,
                        'status': 'active',
                        'email': 'admin@nalar.com',
                        'plan': 'enterprise',
                    }
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(
                        f'✓ Created default tenant: {tenant.name}'
                    ))
                else:
                    self.stdout.write(self.style.WARNING(
                        f'✓ Using existing tenant: {tenant.name}'
                    ))
            else:
                tenant = None
                self.stdout.write(self.style.WARNING(
                    f'[DRY RUN] Would create/use tenant: {tenant_name}'
                ))

            # Auto-discover all models with tenant field
            self.stdout.write(self.style.WARNING(
                '\nScanning for models with tenant fields...'
            ))

            models_to_update = []
            for app_config in apps.get_app_configs():
                for model in app_config.get_models():
                    # Check if model has a tenant field
                    if hasattr(model, 'tenant'):
                        # Skip the Tenant model itself and TenantUser
                        if model._meta.app_label == 'tenants' and model.__name__ in ['Tenant', 'TenantUser']:
                            continue
                        models_to_update.append((model._meta.label, model))

            if not models_to_update:
                self.stdout.write(self.style.WARNING(
                    '\nNo models with tenant fields found.'
                ))
                return

            self.stdout.write(self.style.SUCCESS(
                f'\nFound {len(models_to_update)} models with tenant fields'
            ))

            # Assign tenant to all existing records
            total_updated = 0
            for model_label, Model in models_to_update:
                if dry_run:
                    count = Model.objects.filter(tenant__isnull=True).count()
                    if count > 0:
                        self.stdout.write(
                            f'[DRY RUN] Would update {count} {model_label} records'
                        )
                        total_updated += count
                else:
                    count = Model.objects.filter(tenant__isnull=True).update(tenant=tenant)
                    if count > 0:
                        self.stdout.write(self.style.SUCCESS(
                            f'✓ Updated {count} {model_label} records'
                        ))
                        total_updated += count

            if dry_run:
                self.stdout.write(self.style.WARNING(
                    f'\n[DRY RUN] Would assign {total_updated} total records to tenant: {tenant_name}'
                ))
                raise Exception("Dry run complete - rolling back transaction")
            else:
                self.stdout.write(self.style.SUCCESS(
                    f'\n✓ Successfully assigned {total_updated} records to tenant: {tenant.name}'
                ))
