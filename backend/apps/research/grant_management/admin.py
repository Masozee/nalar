from django.contrib import admin
from .models import Grant, GrantTeamMember, GrantMilestone, GrantDisbursement


class GrantTeamMemberInline(admin.TabularInline):
    model = GrantTeamMember
    extra = 1
    raw_id_fields = ['user']


class GrantMilestoneInline(admin.TabularInline):
    model = GrantMilestone
    extra = 1


class GrantDisbursementInline(admin.TabularInline):
    model = GrantDisbursement
    extra = 0
    readonly_fields = ['disbursement_number']


@admin.register(Grant)
class GrantAdmin(admin.ModelAdmin):
    list_display = [
        'grant_number', 'title', 'principal_investigator', 'grant_type',
        'funding_source', 'status', 'approved_amount', 'start_date', 'end_date'
    ]
    list_filter = ['status', 'grant_type', 'funding_source', 'start_date']
    search_fields = ['grant_number', 'title', 'principal_investigator__username']
    raw_id_fields = ['principal_investigator', 'reviewed_by', 'created_by', 'updated_by']
    readonly_fields = ['grant_number', 'disbursed_amount', 'created_at', 'updated_at']
    inlines = [GrantTeamMemberInline, GrantMilestoneInline, GrantDisbursementInline]
    fieldsets = (
        ('Info Grant', {
            'fields': ('grant_number', 'title', 'abstract')
        }),
        ('Detail', {
            'fields': ('grant_type', 'funding_source', 'funder_name', 'funder_contact')
        }),
        ('Tim', {
            'fields': ('principal_investigator',)
        }),
        ('Tanggal', {
            'fields': ('submission_date', 'start_date', 'end_date')
        }),
        ('Keuangan', {
            'fields': ('currency', 'requested_amount', 'approved_amount', 'disbursed_amount')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Review', {
            'fields': ('reviewed_by', 'reviewed_at', 'review_notes'),
            'classes': ('collapse',)
        }),
        ('Dokumen', {
            'fields': ('proposal_file', 'contract_file'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GrantTeamMember)
class GrantTeamMemberAdmin(admin.ModelAdmin):
    list_display = ['grant', 'user', 'role', 'allocation_percentage', 'start_date', 'end_date']
    list_filter = ['role']
    search_fields = ['grant__grant_number', 'user__username']
    raw_id_fields = ['grant', 'user']


@admin.register(GrantMilestone)
class GrantMilestoneAdmin(admin.ModelAdmin):
    list_display = ['grant', 'title', 'due_date', 'status', 'completed_date']
    list_filter = ['status', 'due_date']
    search_fields = ['grant__grant_number', 'title']
    raw_id_fields = ['grant', 'created_by', 'updated_by']


@admin.register(GrantDisbursement)
class GrantDisbursementAdmin(admin.ModelAdmin):
    list_display = [
        'disbursement_number', 'grant', 'description', 'amount',
        'status', 'request_date', 'disbursement_date'
    ]
    list_filter = ['status', 'request_date']
    search_fields = ['disbursement_number', 'grant__grant_number', 'description']
    raw_id_fields = ['grant', 'approved_by', 'created_by', 'updated_by']
    readonly_fields = ['disbursement_number']
