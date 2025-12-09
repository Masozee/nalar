"""
Polar.sh integration service for subscription and billing management.

Polar.sh is a merchant of record platform for developers and creators.
Handles payments, taxes, and compliance automatically.
"""

from typing import Optional, Dict, Any
from django.conf import settings
from polar_sdk import Polar
import logging

logger = logging.getLogger(__name__)


class PolarService:
    """
    Service layer for Polar.sh API integration.

    Handles:
    - Customer creation
    - Checkout session creation
    - Subscription management
    - Webhook processing
    - Product and price management
    """

    def __init__(self):
        """Initialize Polar SDK with access token."""
        self.client = Polar(
            access_token=settings.POLAR_ACCESS_TOKEN,
        )

    # ==================== Customer Management ====================

    def create_customer(self, tenant) -> Optional[str]:
        """
        Create a Polar customer for a tenant.

        Args:
            tenant: Tenant model instance

        Returns:
            customer_id: Polar customer ID
        """
        try:
            # In Polar, customers are created automatically during checkout
            # We'll store the customer ID when they complete their first checkout
            logger.info(f"Polar customer will be created for tenant {tenant.id} during checkout")
            return None
        except Exception as e:
            logger.error(f"Error preparing customer for tenant {tenant.id}: {str(e)}")
            raise

    # ==================== Checkout Session ====================

    def create_checkout_session(
        self,
        tenant,
        product_id: str,
        success_url: str,
        cancel_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a Polar checkout session.

        Args:
            tenant: Tenant model instance
            product_id: Polar product ID
            success_url: URL to redirect after successful payment
            cancel_url: Optional URL to redirect if user cancels

        Returns:
            checkout_session: Dict with checkout URL and session info
        """
        try:
            # Create checkout session
            checkout = self.client.checkouts.create(
                product_id=product_id,
                success_url=success_url,
                customer_email=tenant.email,
                customer_name=tenant.name,
                metadata={
                    'tenant_id': str(tenant.id),
                    'tenant_slug': tenant.slug,
                },
            )

            return {
                'checkout_url': checkout.url,
                'checkout_id': checkout.id,
                'product_id': product_id,
            }

        except Exception as e:
            logger.error(f"Error creating checkout session for tenant {tenant.id}: {str(e)}")
            raise

    # ==================== Subscription Management ====================

    def get_subscription(self, subscription_id: str):
        """
        Get subscription details from Polar.

        Args:
            subscription_id: Polar subscription ID

        Returns:
            subscription: Polar subscription object
        """
        try:
            subscription = self.client.subscriptions.get(subscription_id)
            return subscription
        except Exception as e:
            logger.error(f"Error getting subscription {subscription_id}: {str(e)}")
            raise

    def cancel_subscription(self, subscription_id: str) -> bool:
        """
        Cancel a subscription.

        Args:
            subscription_id: Polar subscription ID

        Returns:
            success: Boolean indicating success
        """
        try:
            self.client.subscriptions.cancel(subscription_id)
            logger.info(f"Canceled subscription {subscription_id}")
            return True
        except Exception as e:
            logger.error(f"Error canceling subscription {subscription_id}: {str(e)}")
            return False

    def update_subscription(
        self,
        subscription_id: str,
        product_id: Optional[str] = None,
    ):
        """
        Update subscription (change plan).

        Args:
            subscription_id: Polar subscription ID
            product_id: New Polar product ID

        Returns:
            subscription: Updated subscription object
        """
        try:
            subscription = self.client.subscriptions.update(
                id=subscription_id,
                product_id=product_id,
            )
            logger.info(f"Updated subscription {subscription_id}")
            return subscription
        except Exception as e:
            logger.error(f"Error updating subscription {subscription_id}: {str(e)}")
            raise

    # ==================== Product Management ====================

    def list_products(self):
        """
        List all available products.

        Returns:
            products: List of Polar product objects
        """
        try:
            products = self.client.products.list()
            return products.items
        except Exception as e:
            logger.error(f"Error listing products: {str(e)}")
            raise

    def get_product(self, product_id: str):
        """
        Get product details.

        Args:
            product_id: Polar product ID

        Returns:
            product: Polar product object
        """
        try:
            product = self.client.products.get(product_id)
            return product
        except Exception as e:
            logger.error(f"Error getting product {product_id}: {str(e)}")
            raise

    # ==================== Webhook Processing ====================

    def verify_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """
        Verify and parse Polar webhook.

        Args:
            payload: Raw webhook payload
            signature: Webhook signature header

        Returns:
            event: Parsed webhook event
        """
        try:
            # Polar uses standard webhooks library for verification
            from standardwebhooks import Webhook

            wh = Webhook(settings.POLAR_WEBHOOK_SECRET)
            event = wh.verify(payload, {
                'webhook-signature': signature,
            })

            return event
        except Exception as e:
            logger.error(f"Error verifying webhook: {str(e)}")
            raise

    def process_webhook_event(self, event: Dict[str, Any]) -> bool:
        """
        Process a verified webhook event.

        Args:
            event: Parsed webhook event

        Returns:
            success: Boolean indicating processing success
        """
        event_type = event.get('type')
        data = event.get('data')

        logger.info(f"Processing webhook event: {event_type}")

        handlers = {
            'checkout.created': self._handle_checkout_created,
            'checkout.updated': self._handle_checkout_updated,
            'order.created': self._handle_order_created,
            'subscription.created': self._handle_subscription_created,
            'subscription.updated': self._handle_subscription_updated,
            'subscription.canceled': self._handle_subscription_canceled,
        }

        handler = handlers.get(event_type)
        if handler:
            return handler(data)
        else:
            logger.warning(f"No handler for event type: {event_type}")
            return True

    # ==================== Webhook Event Handlers ====================

    def _handle_checkout_created(self, data: Dict[str, Any]) -> bool:
        """Handle checkout.created event."""
        logger.info(f"Checkout created: {data.get('id')}")
        return True

    def _handle_checkout_updated(self, data: Dict[str, Any]) -> bool:
        """Handle checkout.updated event."""
        logger.info(f"Checkout updated: {data.get('id')}")
        # Update subscription when checkout is completed
        if data.get('status') == 'confirmed':
            self._handle_checkout_confirmed(data)
        return True

    def _handle_checkout_confirmed(self, data: Dict[str, Any]) -> bool:
        """Handle successful checkout completion."""
        from apps.tenants.models import Tenant, Subscription
        from django.utils import timezone

        try:
            tenant_id = data.get('metadata', {}).get('tenant_id')
            if not tenant_id:
                logger.error("No tenant_id in checkout metadata")
                return False

            tenant = Tenant.objects.get(id=tenant_id)
            subscription_data = data.get('subscription')

            if subscription_data:
                # Create or update subscription
                subscription, created = Subscription.objects.update_or_create(
                    tenant=tenant,
                    defaults={
                        'stripe_subscription_id': subscription_data.get('id'),  # Reusing field
                        'stripe_customer_id': data.get('customer_id'),  # Reusing field
                        'status': 'active',
                        'current_period_start': timezone.now(),
                        'current_period_end': subscription_data.get('current_period_end'),
                    }
                )
                logger.info(f"{'Created' if created else 'Updated'} subscription for tenant {tenant_id}")

            return True
        except Exception as e:
            logger.error(f"Error handling checkout confirmation: {str(e)}")
            return False

    def _handle_order_created(self, data: Dict[str, Any]) -> bool:
        """Handle order.created event."""
        logger.info(f"Order created: {data.get('id')}")
        return True

    def _handle_subscription_created(self, data: Dict[str, Any]) -> bool:
        """Handle subscription.created event."""
        from apps.tenants.models import Tenant, Subscription
        from django.utils import timezone

        try:
            # Extract tenant from metadata
            tenant_id = data.get('metadata', {}).get('tenant_id')
            if not tenant_id:
                logger.error("No tenant_id in subscription metadata")
                return False

            tenant = Tenant.objects.get(id=tenant_id)

            # Create subscription record
            Subscription.objects.update_or_create(
                tenant=tenant,
                defaults={
                    'stripe_subscription_id': data.get('id'),
                    'stripe_customer_id': data.get('customer_id'),
                    'status': data.get('status', 'active'),
                    'current_period_start': timezone.now(),
                    'current_period_end': data.get('current_period_end'),
                }
            )

            logger.info(f"Created subscription for tenant {tenant_id}")
            return True
        except Exception as e:
            logger.error(f"Error handling subscription creation: {str(e)}")
            return False

    def _handle_subscription_updated(self, data: Dict[str, Any]) -> bool:
        """Handle subscription.updated event."""
        from apps.tenants.models import Subscription

        try:
            subscription_id = data.get('id')
            Subscription.objects.filter(
                stripe_subscription_id=subscription_id
            ).update(
                status=data.get('status'),
                current_period_end=data.get('current_period_end'),
            )

            logger.info(f"Updated subscription {subscription_id}")
            return True
        except Exception as e:
            logger.error(f"Error handling subscription update: {str(e)}")
            return False

    def _handle_subscription_canceled(self, data: Dict[str, Any]) -> bool:
        """Handle subscription.canceled event."""
        from apps.tenants.models import Subscription
        from django.utils import timezone

        try:
            subscription_id = data.get('id')
            Subscription.objects.filter(
                stripe_subscription_id=subscription_id
            ).update(
                status='canceled',
                canceled_at=timezone.now(),
            )

            logger.info(f"Canceled subscription {subscription_id}")
            return True
        except Exception as e:
            logger.error(f"Error handling subscription cancellation: {str(e)}")
            return False


# Singleton instance
polar_service = PolarService()
