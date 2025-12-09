"""
Management command to migrate existing single-tenant data to multi-tenant structure.

Usage:
    python manage.py migrate_to_multitenancy

This command:
1. Creates a default tenant
2. Assigns all existing users to the default tenant
3. Updates all existing records with the default tenant
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from apps.tenants.models import Tenant, TenantUser, TenantRole, PlanType, TenantStatus
from apps.users.models import User


class Command(BaseCommand):
    help = 'Migrate existing data to default tenant for multi-tenancy support'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-name',
            type=str,
            default='Default Organization',
            help='Name for the default tenant'
        )
        parser.add_argument(
            '--tenant-email',
            type=str,
            default='admin@nalar.app',
            help='Email for the default tenant'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without making changes (preview mode)'
        )

    def handle(self, *args, **options):
        tenant_name = options['tenant_name']
        tenant_email = options['tenant_email']
        dry_run = options['dry_run']

        if dry_run:
            self.stdout.write(self.style.WARNING('🔍 DRY RUN MODE - No changes will be made'))

        self.stdout.write('=' * 60)
        self.stdout.write(self.style.MIGRATE_HEADING('Multi-Tenancy Migration'))
        self.stdout.write('=' * 60)

        try:
            with transaction.atomic():
                # Step 1: Create default tenant
                self.stdout.write('\n📦 Step 1: Creating default tenant...')
                default_tenant = self._create_default_tenant(
                    tenant_name,
                    tenant_email,
                    dry_run
                )

                if dry_run:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'   Would create tenant: {tenant_name}'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'   ✓ Created tenant: {default_tenant.name} ({default_tenant.slug})'
                        )
                    )

                # Step 2: Assign users to tenant
                self.stdout.write('\n👥 Step 2: Assigning users to tenant...')
                user_count = self._assign_users_to_tenant(default_tenant, dry_run)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'   ✓ Assigned {user_count} users to tenant'
                    )
                )

                # Step 3: Update all tenant-aware models
                self.stdout.write('\n📊 Step 3: Updating existing records...')
                self._update_tenant_records(default_tenant, dry_run)

                # Summary
                self.stdout.write('\n' + '=' * 60)
                if dry_run:
                    self.stdout.write(
                        self.style.WARNING(
                            '🔍 DRY RUN COMPLETE - No changes were made'
                        )
                    )
                    self.stdout.write('   Run without --dry-run to apply changes')
                    raise CommandError('Dry run mode - rolling back transaction')
                else:
                    self.stdout.write(
                        self.style.SUCCESS(
                            '✅ Multi-tenancy migration completed successfully!'
                        )
                    )
                self.stdout.write('=' * 60)

        except CommandError:
            # Expected for dry-run mode
            pass
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'\n❌ Error during migration: {str(e)}')
            )
            raise

    def _create_default_tenant(self, tenant_name, email, dry_run):
        """Create or get the default tenant."""
        if dry_run:
            # Return a mock tenant for dry run
            class MockTenant:
                def __init__(self):
                    self.id = 'mock-id'
                    self.name = tenant_name
                    self.slug = 'default'
            return MockTenant()

        tenant, created = Tenant.objects.get_or_create(
            slug='default',
            defaults={
                'name': tenant_name,
                'email': email,
                'plan': PlanType.ENTERPRISE,
                'status': TenantStatus.ACTIVE,
                'max_users': 1000,
                'max_storage_gb': 100,
                'enabled_modules': [
                    'hr',
                    'finance',
                    'research',
                    'assets',
                    'inventory',
                    'procurement',
                    'documents',
                    'ticketing',
                    'workflow',
                    'admin_ops',
                    'crm',
                    'tools',
                ],
            }
        )

        if not created:
            self.stdout.write(
                self.style.WARNING(
                    '   ⚠ Default tenant already exists, using existing tenant'
                )
            )

        return tenant

    def _assign_users_to_tenant(self, tenant, dry_run):
        """Assign all existing users to the default tenant."""
        users = User.objects.all()
        count = 0

        for user in users:
            if dry_run:
                count += 1
                continue

            _, created = TenantUser.objects.get_or_create(
                tenant=tenant,
                user=user,
                defaults={
                    'role': TenantRole.ADMIN if user.is_staff else TenantRole.MEMBER,
                    'is_owner': user.is_superuser,
                    'is_active': user.is_active,
                }
            )

            if created:
                count += 1

        return count

    def _update_tenant_records(self, tenant, dry_run):
        """Update all tenant-aware models with the default tenant."""

        # Import models here to avoid circular imports
        try:
            from apps.organization.models import Department, Position, Team
            from apps.hr.models import Employee
            from apps.admin_ops.crm.models import Contact, Organization
        except ImportError as e:
            self.stdout.write(
                self.style.WARNING(
                    f'   ⚠ Some models not yet migrated: {str(e)}'
                )
            )
            return

        # List of models to update (only include models that have TenantMixin)
        models_to_check = [
            ('Organization', Department),
            ('Organization', Position),
            ('Organization', Team),
            ('HR', Employee),
            ('CRM', Contact),
            ('CRM', Organization),
        ]

        for app_name, model in models_to_check:
            try:
                # Check if model has tenant field
                if not hasattr(model, 'tenant'):
                    self.stdout.write(
                        self.style.WARNING(
                            f'   ⚠ {app_name}.{model.__name__} does not have tenant field yet'
                        )
                    )
                    continue

                if dry_run:
                    count = model.objects.filter(tenant__isnull=True).count()
                    self.stdout.write(
                        f'   Would update {count} {model.__name__} records'
                    )
                else:
                    count = model.objects.filter(tenant__isnull=True).update(
                        tenant=tenant
                    )
                    if count > 0:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'   ✓ Updated {count} {model.__name__} records'
                            )
                        )

            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(
                        f'   ⚠ Could not update {model.__name__}: {str(e)}'
                    )
                )
