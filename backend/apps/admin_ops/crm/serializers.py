"""
CRM Serializers
"""
from rest_framework import serializers
from .models import (
    Organization, Contact, JobPosition,
    ContactNote, ContactActivity
)


class OrganizationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for organization lists"""
    contact_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'organization_type', 'industry',
            'email', 'phone', 'website', 'city', 'country',
            'access_level', 'logo', 'contact_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_contact_count(self, obj):
        """Get number of contacts in this organization"""
        return obj.positions.filter(is_current=True).count()


class OrganizationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for organization detail view"""
    parent_organization_name = serializers.CharField(
        source='parent_organization.name',
        read_only=True
    )
    subsidiaries = OrganizationListSerializer(many=True, read_only=True)

    class Meta:
        model = Organization
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class JobPositionSerializer(serializers.ModelSerializer):
    """Serializer for job positions"""
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    organization_type = serializers.CharField(source='organization.organization_type', read_only=True)
    contact_name = serializers.CharField(source='contact.get_full_name', read_only=True)

    class Meta:
        model = JobPosition
        fields = [
            'id', 'contact', 'contact_name', 'organization', 'organization_name',
            'organization_type', 'title', 'department', 'is_primary', 'is_current',
            'start_date', 'end_date', 'office_phone', 'office_email',
            'office_address', 'description', 'responsibilities',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """Ensure end_date is after start_date"""
        if data.get('start_date') and data.get('end_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError(
                    "End date must be after start date"
                )
        return data


class ContactListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for contact lists"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    primary_position = serializers.SerializerMethodField()
    assigned_to_name = serializers.CharField(
        source='assigned_to.get_full_name',
        read_only=True
    )

    class Meta:
        model = Contact
        fields = [
            'id', 'full_name', 'first_name', 'last_name', 'prefix', 'suffix',
            'email_primary', 'phone_mobile', 'access_level', 'contact_type',
            'primary_position', 'assigned_to_name', 'tags',
            'last_contacted_at', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_primary_position(self, obj):
        """Get primary position details"""
        primary = obj.positions.filter(is_primary=True, is_current=True).first()
        if primary:
            return {
                'title': primary.title,
                'organization': primary.organization.name,
                'organization_id': str(primary.organization.id),
            }
        # Fallback to any current position
        current = obj.positions.filter(is_current=True).first()
        if current:
            return {
                'title': current.title,
                'organization': current.organization.name,
                'organization_id': str(current.organization.id),
            }
        return None


class ContactDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for contact detail view"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    positions = JobPositionSerializer(many=True, read_only=True)
    assigned_to_name = serializers.CharField(
        source='assigned_to.get_full_name',
        read_only=True
    )
    assigned_to_email = serializers.EmailField(
        source='assigned_to.email',
        read_only=True
    )

    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContactCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating contacts"""

    class Meta:
        model = Contact
        fields = [
            'first_name', 'last_name', 'middle_name', 'prefix', 'suffix',
            'email_primary', 'email_secondary', 'phone_primary',
            'phone_secondary', 'phone_mobile', 'linkedin_url', 'twitter_handle',
            'address', 'city', 'country', 'biography', 'expertise_areas',
            'languages', 'access_level', 'contact_type', 'assigned_to',
            'photo_url', 'tags', 'custom_fields', 'is_active'
        ]

    def validate_access_level(self, value):
        """Ensure only authorized users can set VIP/VVIP levels"""
        request = self.context.get('request')
        if value in ['vip', 'vvip']:
            # Only staff or superusers can set VIP/VVIP
            if request and not (request.user.is_staff or request.user.is_superuser):
                raise serializers.ValidationError(
                    "Only administrators can set VIP or VVIP access levels"
                )
        return value


class ContactNoteSerializer(serializers.ModelSerializer):
    """Serializer for contact notes"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    contact_name = serializers.CharField(source='contact.get_full_name', read_only=True)

    class Meta:
        model = ContactNote
        fields = [
            'id', 'contact', 'contact_name', 'author', 'author_name',
            'title', 'content', 'is_private', 'attachments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Auto-set author from request"""
        request = self.context.get('request')
        if request:
            validated_data['author'] = request.user
        return super().create(validated_data)


class ContactActivitySerializer(serializers.ModelSerializer):
    """Serializer for contact activities"""
    contact_name = serializers.CharField(source='contact.get_full_name', read_only=True)
    organized_by_name = serializers.CharField(
        source='organized_by.get_full_name',
        read_only=True
    )
    participant_names = serializers.SerializerMethodField()

    class Meta:
        model = ContactActivity
        fields = [
            'id', 'contact', 'contact_name', 'activity_type', 'title',
            'description', 'activity_date', 'duration_minutes', 'location',
            'organized_by', 'organized_by_name', 'participants', 'participant_names',
            'requires_followup', 'followup_date', 'followup_completed',
            'outcome', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_participant_names(self, obj):
        """Get names of all participants"""
        return [p.get_full_name() for p in obj.participants.all()]

    def create(self, validated_data):
        """Auto-set organized_by from request"""
        request = self.context.get('request')
        participants = validated_data.pop('participants', [])

        if request and not validated_data.get('organized_by'):
            validated_data['organized_by'] = request.user

        activity = super().create(validated_data)

        if participants:
            activity.participants.set(participants)

        return activity
