from django.contrib import admin
from .models import ResearchProject, ProjectTeamMember, ProjectTask, ProjectUpdate


class ProjectTeamMemberInline(admin.TabularInline):
    model = ProjectTeamMember
    extra = 1
    raw_id_fields = ['user']


class ProjectTaskInline(admin.TabularInline):
    model = ProjectTask
    extra = 1
    raw_id_fields = ['assigned_to']
    fields = ['title', 'status', 'priority', 'assigned_to', 'due_date']


class ProjectUpdateInline(admin.TabularInline):
    model = ProjectUpdate
    extra = 0
    readonly_fields = ['created_at']


@admin.register(ResearchProject)
class ResearchProjectAdmin(admin.ModelAdmin):
    list_display = [
        'project_code', 'title', 'lead_researcher', 'project_type',
        'status', 'progress_percentage', 'start_date', 'end_date'
    ]
    list_filter = ['status', 'project_type', 'start_date']
    search_fields = ['project_code', 'title', 'lead_researcher__username']
    raw_id_fields = ['lead_researcher', 'grant', 'created_by', 'updated_by']
    readonly_fields = ['project_code', 'spent', 'created_at', 'updated_at']
    inlines = [ProjectTeamMemberInline, ProjectTaskInline, ProjectUpdateInline]
    fieldsets = (
        ('Info Proyek', {
            'fields': ('project_code', 'title', 'description')
        }),
        ('Detail', {
            'fields': ('objectives', 'methodology', 'research_area', 'tags')
        }),
        ('Jenis & Status', {
            'fields': ('project_type', 'status', 'progress_percentage')
        }),
        ('Tim', {
            'fields': ('lead_researcher',)
        }),
        ('Tanggal', {
            'fields': ('start_date', 'end_date', 'actual_end_date')
        }),
        ('Anggaran', {
            'fields': ('currency', 'budget', 'spent')
        }),
        ('Grant', {
            'fields': ('grant',),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProjectTeamMember)
class ProjectTeamMemberAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'role', 'start_date', 'end_date']
    list_filter = ['role']
    search_fields = ['project__project_code', 'user__username']
    raw_id_fields = ['project', 'user']


@admin.register(ProjectTask)
class ProjectTaskAdmin(admin.ModelAdmin):
    list_display = [
        'project', 'title', 'status', 'priority',
        'assigned_to', 'due_date', 'completed_at'
    ]
    list_filter = ['status', 'priority', 'due_date']
    search_fields = ['project__project_code', 'title']
    raw_id_fields = ['project', 'assigned_to', 'parent_task', 'created_by', 'updated_by']


@admin.register(ProjectUpdate)
class ProjectUpdateAdmin(admin.ModelAdmin):
    list_display = ['project', 'title', 'progress_percentage', 'created_at']
    search_fields = ['project__project_code', 'title']
    raw_id_fields = ['project', 'created_by', 'updated_by']
    readonly_fields = ['created_at']
