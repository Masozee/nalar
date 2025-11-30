"""
Serializers for Project Tracking module.
"""
from rest_framework import serializers
from .models import ResearchProject, ProjectTeamMember, ProjectTask, ProjectUpdate


class ProjectTeamMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = ProjectTeamMember
        fields = [
            'id', 'project', 'user', 'user_name', 'role', 'role_display',
            'responsibilities', 'start_date', 'end_date', 'is_active'
        ]
        read_only_fields = ['id']


class ProjectTaskSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    subtasks = serializers.SerializerMethodField()

    class Meta:
        model = ProjectTask
        fields = [
            'id', 'project', 'title', 'description', 'status', 'status_display',
            'priority', 'priority_display', 'assigned_to', 'assigned_to_name',
            'due_date', 'completed_at', 'parent_task', 'subtasks', 'is_active'
        ]
        read_only_fields = ['id', 'completed_at']

    def get_subtasks(self, obj):
        subtasks = obj.subtasks.filter(is_active=True)
        return ProjectTaskSerializer(subtasks, many=True).data if subtasks else []


class ProjectUpdateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = ProjectUpdate
        fields = [
            'id', 'project', 'title', 'content', 'progress_percentage',
            'attachment', 'created_by', 'created_by_name', 'created_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at']


class ResearchProjectListSerializer(serializers.ModelSerializer):
    project_type_display = serializers.CharField(source='get_project_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    lead_name = serializers.CharField(source='lead_researcher.get_full_name', read_only=True)
    team_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = ResearchProject
        fields = [
            'id', 'project_code', 'title', 'project_type', 'project_type_display',
            'status', 'status_display', 'lead_researcher', 'lead_name',
            'start_date', 'end_date', 'progress_percentage', 'budget',
            'remaining_budget', 'is_overdue', 'team_count', 'task_count', 'is_active'
        ]

    def get_team_count(self, obj):
        return obj.team_members.filter(is_active=True).count()

    def get_task_count(self, obj):
        return obj.tasks.filter(is_active=True).count()


class ResearchProjectDetailSerializer(serializers.ModelSerializer):
    project_type_display = serializers.CharField(source='get_project_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    lead_name = serializers.CharField(source='lead_researcher.get_full_name', read_only=True)
    grant_number = serializers.CharField(source='grant.grant_number', read_only=True)
    team_members = ProjectTeamMemberSerializer(many=True, read_only=True)
    tasks = serializers.SerializerMethodField()
    updates = ProjectUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = ResearchProject
        fields = [
            'id', 'project_code', 'title', 'description', 'objectives', 'methodology',
            'project_type', 'project_type_display', 'status', 'status_display',
            'lead_researcher', 'lead_name', 'grant', 'grant_number',
            'start_date', 'end_date', 'actual_end_date',
            'currency', 'budget', 'spent', 'remaining_budget',
            'progress_percentage', 'is_overdue', 'research_area', 'tags', 'notes',
            'team_members', 'tasks', 'updates',
            'is_active', 'created_at', 'updated_at'
        ]

    def get_tasks(self, obj):
        # Only return top-level tasks (no parent)
        tasks = obj.tasks.filter(is_active=True, parent_task__isnull=True)
        return ProjectTaskSerializer(tasks, many=True).data


class ResearchProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchProject
        fields = [
            'title', 'description', 'objectives', 'methodology',
            'project_type', 'lead_researcher', 'grant',
            'start_date', 'end_date', 'currency', 'budget',
            'research_area', 'tags', 'notes'
        ]

    def create(self, validated_data):
        request = self.context['request']
        validated_data['created_by'] = request.user
        return super().create(validated_data)
