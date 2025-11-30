from rest_framework import serializers
from .models import Department, Position, Team


class DepartmentSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    head_name = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()
    employees_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'description',
            'parent', 'parent_name', 'head', 'head_name',
            'children_count', 'employees_count',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_head_name(self, obj):
        if obj.head:
            return obj.head.get_full_name() or obj.head.email
        return None

    def get_children_count(self, obj):
        return obj.children.count()

    def get_employees_count(self, obj):
        return obj.employees.count()


class DepartmentTreeSerializer(serializers.ModelSerializer):
    """Serializer for department hierarchy."""
    children = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'children']

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return DepartmentTreeSerializer(children, many=True).data


class PositionSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Position
        fields = [
            'id', 'name', 'code', 'description',
            'department', 'department_name', 'level',
            'min_salary', 'max_salary',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TeamSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    lead_name = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            'id', 'name', 'department', 'department_name',
            'lead', 'lead_name', 'members_count',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_lead_name(self, obj):
        if obj.lead:
            return obj.lead.get_full_name() or obj.lead.email
        return None

    def get_members_count(self, obj):
        return obj.members.count()


class TeamDetailSerializer(TeamSerializer):
    members = serializers.SerializerMethodField()

    class Meta(TeamSerializer.Meta):
        fields = TeamSerializer.Meta.fields + ['members']

    def get_members(self, obj):
        return [
            {'id': str(m.id), 'email': m.email, 'name': m.get_full_name() or m.email}
            for m in obj.members.all()
        ]
