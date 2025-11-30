from django.contrib import admin
from .models import Department, Team


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'parent', 'head', 'is_active']
    search_fields = ['name', 'code']
    list_filter = ['is_active']


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'lead', 'is_active']
    search_fields = ['name']
    list_filter = ['department', 'is_active']
