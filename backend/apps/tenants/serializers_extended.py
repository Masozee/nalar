"""Extended serializers for tenant registration and invitations."""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Tenant, TenantUser, TenantRole, PlanType

User = get_user_model()


class TenantRegistrationSerializer(serializers.Serializer):
    """
    Serializer for tenant registration (organization sign-up).

    Creates a new tenant and makes the user the owner.
    """
    # Organization details
    organization_name = serializers.CharField(max_length=200)
    subdomain = serializers.SlugField(
        max_length=63,
        required=False,
        allow_blank=True,
        help_text="Custom subdomain (optional)"
    )
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    # User details (if creating new user)
    user_first_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    user_last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)

    # Plan selection
    plan = serializers.ChoiceField(
        choices=PlanType.choices,
        default=PlanType.FREE
    )

    def validate_subdomain(self, value):
        """Validate subdomain is unique."""
        if value and Tenant.objects.filter(subdomain=value).exists():
            raise serializers.ValidationError("This subdomain is already taken.")
        return value

    def validate(self, attrs):
        """Validate tenant registration data."""
        # Auto-generate subdomain from organization name if not provided
        if not attrs.get('subdomain'):
            from django.utils.text import slugify
            base_slug = slugify(attrs['organization_name'])
            slug = base_slug
            counter = 1
            while Tenant.objects.filter(subdomain=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            attrs['subdomain'] = slug

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        """Create tenant, associate user as owner, and create employee record."""
        from apps.hr.models import Employee

        user = self.context['request'].user

        # Update user name if provided
        if validated_data.get('user_first_name'):
            user.first_name = validated_data['user_first_name']
        if validated_data.get('user_last_name'):
            user.last_name = validated_data['user_last_name']
        user.save()

        # Create tenant
        tenant = Tenant.objects.create(
            name=validated_data['organization_name'],
            slug=validated_data['subdomain'],
            subdomain=validated_data['subdomain'],
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            plan=validated_data.get('plan', PlanType.FREE),
            status='trial',  # Start with trial
        )

        # Create tenant user (owner)
        TenantUser.objects.create(
            tenant=tenant,
            user=user,
            role=TenantRole.OWNER,
            is_owner=True,
            is_active=True,
        )

        # Auto-create Employee record for the user
        Employee.objects.create(
            tenant=tenant,
            user=user,
            first_name=user.first_name or '',
            last_name=user.last_name or '',
            email=user.email,
            employee_id=f'EMP{user.id}',  # Auto-generate employee ID
            employment_status='active',
            employment_type='full_time',
        )

        return tenant


class UserInvitationSerializer(serializers.Serializer):
    """
    Serializer for inviting users to a tenant.

    Sends email invitation and creates pending TenantUser record.
    """
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=TenantRole.choices,
        default=TenantRole.MEMBER
    )
    message = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        help_text="Personal message to include in invitation"
    )

    def validate_email(self, value):
        """Validate email is not already in tenant."""
        tenant = self.context['tenant']

        # Check if user already exists in tenant
        if TenantUser.objects.filter(
            tenant=tenant,
            user__email=value,
            is_active=True
        ).exists():
            raise serializers.ValidationError(
                "This user is already a member of your organization."
            )

        return value

    def validate_role(self, value):
        """Validate role - only admins can invite owners."""
        requesting_user = self.context['requesting_user']
        tenant = self.context['tenant']

        # Get requesting user's tenant membership
        tenant_user = TenantUser.objects.filter(
            tenant=tenant,
            user=requesting_user
        ).first()

        # Only owners can invite other owners
        if value == TenantRole.OWNER and not tenant_user.is_owner:
            raise serializers.ValidationError(
                "Only organization owners can invite other owners."
            )

        return value

    @transaction.atomic
    def create(self, validated_data):
        """Create invitation and send email."""
        tenant = self.context['tenant']
        inviting_user = self.context['requesting_user']
        email = validated_data['email']
        role = validated_data['role']

        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'is_active': False  # User must accept invitation
            }
        )

        # Create or update tenant user
        tenant_user, created = TenantUser.objects.get_or_create(
            tenant=tenant,
            user=user,
            defaults={
                'role': role,
                'is_active': False,  # Pending acceptance
                'invited_by': inviting_user,
            }
        )

        if not created:
            # Update existing invitation
            tenant_user.role = role
            tenant_user.invited_by = inviting_user
            tenant_user.save()

        # TODO: Send invitation email
        # self._send_invitation_email(tenant, user, tenant_user, validated_data.get('message'))

        return tenant_user

    def _send_invitation_email(self, tenant, user, tenant_user, message):
        """Send invitation email to user."""
        # TODO: Implement email sending
        # Use Django's send_mail or Celery task
        pass


class AcceptInvitationSerializer(serializers.Serializer):
    """
    Serializer for accepting a tenant invitation.
    """
    invitation_token = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
        required=False,
        help_text="Required if new user"
    )
    first_name = serializers.CharField(max_length=100, required=False)
    last_name = serializers.CharField(max_length=100, required=False)

    def validate_invitation_token(self, value):
        """Validate invitation token exists and is valid."""
        # TODO: Implement token validation
        # For now, use tenant_user_id as token
        try:
            tenant_user = TenantUser.objects.get(id=value, is_active=False)
            self.context['tenant_user'] = tenant_user
            return value
        except TenantUser.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired invitation.")

    @transaction.atomic
    def save(self):
        """Accept invitation and activate user."""
        tenant_user = self.context['tenant_user']
        user = tenant_user.user

        # Activate user if new
        if not user.is_active:
            password = self.validated_data.get('password')
            if not password:
                raise serializers.ValidationError({
                    'password': 'Password is required for new users.'
                })

            user.set_password(password)
            user.is_active = True

            # Set name if provided
            if self.validated_data.get('first_name'):
                user.first_name = self.validated_data['first_name']
            if self.validated_data.get('last_name'):
                user.last_name = self.validated_data['last_name']

            user.save()

        # Activate tenant membership
        tenant_user.is_active = True
        from django.utils import timezone
        tenant_user.joined_at = timezone.now()
        tenant_user.save()

        return tenant_user


class SwitchTenantSerializer(serializers.Serializer):
    """Serializer for switching active tenant."""
    tenant_id = serializers.UUIDField()

    def validate_tenant_id(self, value):
        """Validate user has access to this tenant."""
        user = self.context['request'].user

        try:
            tenant_user = TenantUser.objects.get(
                tenant_id=value,
                user=user,
                is_active=True
            )
            self.context['tenant_user'] = tenant_user
            return value
        except TenantUser.DoesNotExist:
            raise serializers.ValidationError(
                "You do not have access to this organization."
            )
