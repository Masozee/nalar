"""
Django Admin for CRM
"""
from django.contrib import admin
from .models import (
    Organization, Contact, JobPosition,
    ContactNote, ContactActivity
)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'organization_type', 'industry',
        'city', 'country', 'access_level', 'created_at'
    ]
    list_filter = ['organization_type', 'access_level', 'country']
    search_fields = ['name', 'industry', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'organization_type', 'industry')
        }),
        ('Contact Details', {
            'fields': ('website', 'email', 'phone', 'address', 'city', 'country')
        }),
        ('Access Control', {
            'fields': ('access_level',)
        }),
        ('Relationship', {
            'fields': ('parent_organization',)
        }),
        ('Additional Info', {
            'fields': ('description', 'logo', 'tags', 'custom_fields'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )


class JobPositionInline(admin.TabularInline):
    model = JobPosition
    extra = 1
    fields = ['organization', 'title', 'is_primary', 'is_current', 'start_date', 'end_date']


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = [
        'get_full_name', 'email_primary', 'phone_mobile',
        'access_level', 'contact_type', 'assigned_to', 'is_active'
    ]
    list_filter = ['access_level', 'contact_type', 'is_active', 'assigned_to']
    search_fields = ['first_name', 'last_name', 'email_primary', 'phone_mobile']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [JobPositionInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'prefix', 'first_name', 'middle_name', 'last_name', 'suffix')
        }),
        ('Contact Details', {
            'fields': (
                'email_primary', 'email_secondary',
                'phone_primary', 'phone_secondary', 'phone_mobile'
            )
        }),
        ('Social Media', {
            'fields': ('linkedin_url', 'twitter_handle')
        }),
        ('Address', {
            'fields': ('address', 'city', 'country')
        }),
        ('Professional Info', {
            'fields': ('biography', 'expertise_areas', 'languages')
        }),
        ('Access & Assignment', {
            'fields': ('access_level', 'contact_type', 'assigned_to')
        }),
        ('Additional Info', {
            'fields': ('photo_url', 'tags', 'custom_fields'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'last_contacted_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(JobPosition)
class JobPositionAdmin(admin.ModelAdmin):
    list_display = [
        'contact', 'title', 'organization',
        'is_primary', 'is_current', 'start_date', 'end_date'
    ]
    list_filter = ['is_primary', 'is_current', 'organization']
    search_fields = [
        'contact__first_name', 'contact__last_name',
        'title', 'organization__name'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ContactNote)
class ContactNoteAdmin(admin.ModelAdmin):
    list_display = ['contact', 'title', 'author', 'is_private', 'created_at']
    list_filter = ['is_private', 'author']
    search_fields = ['contact__first_name', 'contact__last_name', 'title', 'content']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ContactActivity)
class ContactActivityAdmin(admin.ModelAdmin):
    list_display = [
        'contact', 'activity_type', 'title',
        'activity_date', 'organized_by', 'requires_followup'
    ]
    list_filter = [
        'activity_type', 'requires_followup',
        'followup_completed', 'activity_date'
    ]
    search_fields = ['contact__first_name', 'contact__last_name', 'title', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    filter_horizontal = ['participants']
