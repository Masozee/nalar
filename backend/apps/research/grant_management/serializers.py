"""
Serializers for Grant Management module.
"""
from rest_framework import serializers
from .models import Grant, GrantTeamMember, GrantMilestone, GrantDisbursement


class GrantTeamMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = GrantTeamMember
        fields = [
            'id', 'grant', 'user', 'user_name', 'role', 'role_display',
            'responsibilities', 'allocation_percentage', 'start_date', 'end_date',
            'is_active'
        ]
        read_only_fields = ['id']


class GrantMilestoneSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = GrantMilestone
        fields = [
            'id', 'grant', 'title', 'description', 'due_date', 'completed_date',
            'status', 'status_display', 'deliverable_file', 'notes', 'is_active'
        ]
        read_only_fields = ['id']


class GrantDisbursementSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)

    class Meta:
        model = GrantDisbursement
        fields = [
            'id', 'grant', 'disbursement_number', 'description', 'amount',
            'status', 'status_display', 'request_date', 'disbursement_date',
            'approved_by', 'approved_by_name', 'approved_at',
            'supporting_document', 'notes', 'is_active'
        ]
        read_only_fields = ['id', 'disbursement_number']


class GrantListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    grant_type_display = serializers.CharField(source='get_grant_type_display', read_only=True)
    funding_source_display = serializers.CharField(source='get_funding_source_display', read_only=True)
    pi_name = serializers.CharField(source='principal_investigator.get_full_name', read_only=True)
    team_count = serializers.SerializerMethodField()

    class Meta:
        model = Grant
        fields = [
            'id', 'grant_number', 'title', 'grant_type', 'grant_type_display',
            'funding_source', 'funding_source_display', 'principal_investigator',
            'pi_name', 'status', 'status_display', 'approved_amount',
            'disbursed_amount', 'remaining_budget', 'start_date', 'end_date',
            'team_count', 'is_active'
        ]

    def get_team_count(self, obj):
        return obj.team_members.filter(is_active=True).count()


class GrantDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    grant_type_display = serializers.CharField(source='get_grant_type_display', read_only=True)
    funding_source_display = serializers.CharField(source='get_funding_source_display', read_only=True)
    pi_name = serializers.CharField(source='principal_investigator.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    team_members = GrantTeamMemberSerializer(many=True, read_only=True)
    milestones = GrantMilestoneSerializer(many=True, read_only=True)
    disbursements = GrantDisbursementSerializer(many=True, read_only=True)

    class Meta:
        model = Grant
        fields = [
            'id', 'grant_number', 'title', 'abstract', 'grant_type', 'grant_type_display',
            'funding_source', 'funding_source_display', 'funder_name', 'funder_contact',
            'principal_investigator', 'pi_name', 'submission_date', 'start_date', 'end_date',
            'currency', 'requested_amount', 'approved_amount', 'disbursed_amount',
            'remaining_budget', 'duration_months', 'status', 'status_display',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at', 'review_notes',
            'proposal_file', 'contract_file', 'notes',
            'team_members', 'milestones', 'disbursements',
            'is_active', 'created_at', 'updated_at'
        ]


class GrantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grant
        fields = [
            'title', 'abstract', 'grant_type', 'funding_source', 'funder_name',
            'funder_contact', 'principal_investigator', 'submission_date',
            'start_date', 'end_date', 'currency', 'requested_amount', 'notes'
        ]

    def create(self, validated_data):
        request = self.context['request']
        validated_data['created_by'] = request.user
        return super().create(validated_data)
