"""Signal handlers for tenant-related events."""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Tenant, Subscription, PlanType


@receiver(post_save, sender=Tenant)
def create_tenant_subscription(sender, instance, created, **kwargs):
    """
    Automatically create a subscription when a tenant is created.
    """
    if created:
        Subscription.objects.create(
            tenant=instance,
            plan=instance.plan,
            billing_email=instance.email,
            status='trialing'
        )
