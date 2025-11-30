from django.core.management.base import BaseCommand
from django.contrib.contenttypes.models import ContentType
from apps.workflow.models import WorkflowTemplate, WorkflowStep


class Command(BaseCommand):
    help = 'Seed workflow templates for common approval processes'

    def handle(self, *args, **options):
        self.stdout.write('Seeding workflow data...')

        # Clear existing data
        WorkflowStep.objects.all().delete()
        WorkflowTemplate.objects.all().delete()

        workflows = []

        # 1. Leave Request Workflow
        try:
            leave_ct = ContentType.objects.get(app_label='hr', model='leaverequest')
            leave_workflow = WorkflowTemplate.objects.create(
                name='Persetujuan Cuti',
                code='LEAVE_APPROVAL',
                description='Alur persetujuan pengajuan cuti karyawan',
                content_type=leave_ct,
            )
            workflows.append(leave_workflow)

            WorkflowStep.objects.create(
                workflow=leave_workflow,
                name='Persetujuan Supervisor',
                step_order=1,
                approver_type='supervisor',
                can_reject=True,
                can_request_revision=True,
                requires_comment=False,
            )
            WorkflowStep.objects.create(
                workflow=leave_workflow,
                name='Persetujuan HR',
                step_order=2,
                approver_type='role',
                approver_role='HR Manager',
                can_reject=True,
                can_request_revision=False,
                requires_comment=True,
            )
            self.stdout.write(f"  Created workflow: {leave_workflow.name}")
        except ContentType.DoesNotExist:
            self.stdout.write(self.style.WARNING("  LeaveRequest model not found, skipping"))

        # 2. Purchase Order Workflow (for future procurement module)
        try:
            # Try to get PurchaseOrder, but it might not exist yet
            po_ct = ContentType.objects.get_or_create(
                app_label='procurement',
                model='purchaseorder',
            )[0]
            po_workflow = WorkflowTemplate.objects.create(
                name='Persetujuan Purchase Order',
                code='PO_APPROVAL',
                description='Alur persetujuan pembelian barang/jasa',
                content_type=po_ct,
                auto_approve_threshold=1000000,  # Auto-approve under 1 juta
            )
            workflows.append(po_workflow)

            WorkflowStep.objects.create(
                workflow=po_workflow,
                name='Persetujuan Kepala Divisi',
                step_order=1,
                approver_type='department_head',
                can_reject=True,
                can_request_revision=True,
                requires_comment=False,
            )
            WorkflowStep.objects.create(
                workflow=po_workflow,
                name='Persetujuan Finance',
                step_order=2,
                approver_type='role',
                approver_role='Finance Manager',
                can_reject=True,
                can_request_revision=True,
                requires_comment=True,
            )
            WorkflowStep.objects.create(
                workflow=po_workflow,
                name='Persetujuan Direktur',
                step_order=3,
                approver_type='role',
                approver_role='Director',
                can_reject=True,
                can_request_revision=False,
                requires_comment=False,
            )
            self.stdout.write(f"  Created workflow: {po_workflow.name}")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"  PO workflow error: {e}"))

        # 3. Expense Request Workflow
        try:
            expense_ct = ContentType.objects.get_or_create(
                app_label='finance',
                model='expenserequest',
            )[0]
            expense_workflow = WorkflowTemplate.objects.create(
                name='Persetujuan Reimbursement',
                code='EXPENSE_APPROVAL',
                description='Alur persetujuan penggantian biaya',
                content_type=expense_ct,
                auto_approve_threshold=500000,  # Auto-approve under 500rb
            )
            workflows.append(expense_workflow)

            WorkflowStep.objects.create(
                workflow=expense_workflow,
                name='Persetujuan Supervisor',
                step_order=1,
                approver_type='supervisor',
                can_reject=True,
                can_request_revision=True,
                requires_comment=False,
            )
            WorkflowStep.objects.create(
                workflow=expense_workflow,
                name='Verifikasi Finance',
                step_order=2,
                approver_type='role',
                approver_role='Finance Staff',
                can_reject=True,
                can_request_revision=True,
                requires_comment=True,
            )
            self.stdout.write(f"  Created workflow: {expense_workflow.name}")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"  Expense workflow error: {e}"))

        # 4. Room Booking Workflow
        try:
            room_ct = ContentType.objects.get_or_create(
                app_label='admin_ops',
                model='roombooking',
            )[0]
            room_workflow = WorkflowTemplate.objects.create(
                name='Persetujuan Booking Ruangan',
                code='ROOM_BOOKING',
                description='Alur persetujuan pemesanan ruang meeting',
                content_type=room_ct,
            )
            workflows.append(room_workflow)

            WorkflowStep.objects.create(
                workflow=room_workflow,
                name='Persetujuan Admin',
                step_order=1,
                approver_type='role',
                approver_role='GA Staff',
                can_reject=True,
                can_request_revision=False,
                requires_comment=False,
                auto_approve_days=1,  # Auto-approve after 1 day if no action
            )
            self.stdout.write(f"  Created workflow: {room_workflow.name}")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"  Room booking workflow error: {e}"))

        # 5. Research Grant Workflow
        try:
            grant_ct = ContentType.objects.get_or_create(
                app_label='research',
                model='grantproposal',
            )[0]
            grant_workflow = WorkflowTemplate.objects.create(
                name='Persetujuan Proposal Hibah',
                code='GRANT_APPROVAL',
                description='Alur persetujuan pengajuan hibah penelitian',
                content_type=grant_ct,
            )
            workflows.append(grant_workflow)

            WorkflowStep.objects.create(
                workflow=grant_workflow,
                name='Review Kepala Riset',
                step_order=1,
                approver_type='role',
                approver_role='Research Director',
                can_reject=True,
                can_request_revision=True,
                requires_comment=True,
            )
            WorkflowStep.objects.create(
                workflow=grant_workflow,
                name='Persetujuan Direktur Eksekutif',
                step_order=2,
                approver_type='role',
                approver_role='Executive Director',
                can_reject=True,
                can_request_revision=True,
                requires_comment=True,
            )
            WorkflowStep.objects.create(
                workflow=grant_workflow,
                name='Persetujuan Board',
                step_order=3,
                approver_type='role',
                approver_role='Board Member',
                can_reject=True,
                can_request_revision=False,
                requires_comment=False,
            )
            self.stdout.write(f"  Created workflow: {grant_workflow.name}")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"  Grant workflow error: {e}"))

        total_workflows = WorkflowTemplate.objects.count()
        total_steps = WorkflowStep.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'Successfully created {total_workflows} workflow templates with {total_steps} steps'
        ))
