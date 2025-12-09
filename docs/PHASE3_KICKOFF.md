# Phase 3: Subscription & Billing - STARTED! 🚀

## ✅ Step 1 Complete: Stripe SDK Installed

```bash
✓ Stripe Python SDK v14.0.1 installed
✓ Added to pyproject.toml dependencies
```

---

## 📋 Phase 3 Overview

**Goal:** Enable revenue generation through Stripe-powered subscription billing

**Timeline:** 2-3 weeks

**Key Features:**
1. ✅ Stripe integration (Step 1/8)
2. ⏳ Payment checkout flow
3. ⏳ Plan upgrades/downgrades
4. ⏳ Webhook processing
5. ⏳ Usage tracking
6. ⏳ Invoice management
7. ⏳ Subscription lifecycle
8. ⏳ Admin features

---

## 🎯 Next Steps

### Immediate: Complete Stripe Setup (Step 1)

**What needs to be done:**

1. **Create Stripe Service Layer**
   - File: `backend/apps/tenants/services/stripe_service.py`
   - Wrapper for Stripe API calls
   - Handles customer creation, subscriptions, checkout

2. **Add Stripe Configuration**
   - File: `backend/config/settings/base.py`
   - Add Stripe API keys
   - Configure webhook settings

3. **Update Environment Variables**
   - File: `.env` and `.env.production`
   - Add test and production Stripe keys

4. **Create Stripe Products**
   - In Stripe Dashboard
   - Create 4 products: Free, Starter, Professional, Enterprise
   - Get Price IDs

---

## 🔑 Required: Stripe Account Setup

### 1. Create Stripe Account
Visit: https://dashboard.stripe.com/register

### 2. Get API Keys
Dashboard → Developers → API Keys
- **Test Mode**: `pk_test_...` and `sk_test_...`
- **Live Mode**: `pk_live_...` and `sk_live_...`

### 3. Create Products & Prices

**Free Plan:**
- Name: Free
- Price: $0/month
- Metadata: `plan_type: free`

**Starter Plan:**
- Name: Starter
- Prices:
  - Monthly: $49/month
  - Yearly: $470/year (20% discount)
- Metadata: `plan_type: starter`

**Professional Plan:**
- Name: Professional
- Prices:
  - Monthly: $149/month
  - Yearly: $1,430/year (20% discount)
- Metadata: `plan_type: professional`

**Enterprise Plan:**
- Name: Enterprise
- Price: $499/month (or custom)
- Metadata: `plan_type: enterprise`

### 4. Set Up Webhook Endpoint
Dashboard → Developers → Webhooks → Add endpoint
- URL: `https://yourdomain.com/api/v1/billing/webhooks/stripe/`
- Events to listen: (will configure later)

---

## 📝 Quick Implementation Guide

### File 1: Stripe Service

```python
# backend/apps/tenants/services/stripe_service.py
import stripe
from django.conf import settings
from apps.tenants.models import Tenant, Subscription

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    @staticmethod
    def create_customer(tenant):
        """Create Stripe customer for tenant."""
        customer = stripe.Customer.create(
            email=tenant.email,
            name=tenant.name,
            metadata={'tenant_id': str(tenant.id)}
        )
        return customer

    @staticmethod
    def create_checkout_session(tenant, price_id, success_url, cancel_url):
        """Create Stripe Checkout session."""
        session = stripe.checkout.Session.create(
            customer=tenant.subscription.stripe_customer_id,
            mode='subscription',
            line_items=[{'price': price_id, 'quantity': 1}],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={'tenant_id': str(tenant.id)}
        )
        return session

    @staticmethod
    def handle_webhook(payload, sig_header):
        """Verify and process Stripe webhook."""
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
        return event
```

### File 2: Settings Configuration

```python
# backend/config/settings/base.py

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# Stripe Price IDs
STRIPE_PRICES = {
    'starter_monthly': os.environ.get('STRIPE_PRICE_STARTER_MONTHLY', ''),
    'starter_yearly': os.environ.get('STRIPE_PRICE_STARTER_YEARLY', ''),
    'professional_monthly': os.environ.get('STRIPE_PRICE_PROFESSIONAL_MONTHLY', ''),
    'professional_yearly': os.environ.get('STRIPE_PRICE_PROFESSIONAL_YEARLY', ''),
    'enterprise_monthly': os.environ.get('STRIPE_PRICE_ENTERPRISE_MONTHLY', ''),
}
```

### File 3: Environment Variables

```bash
# .env (development - test mode)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_PRICE_STARTER_MONTHLY=price_test_...
STRIPE_PRICE_STARTER_YEARLY=price_test_...
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_test_...
STRIPE_PRICE_PROFESSIONAL_YEARLY=price_test_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_test_...
```

### File 4: Checkout API

```python
# backend/apps/tenants/views_billing.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .services.stripe_service import StripeService

class BillingViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def create_checkout(self, request):
        """Create Stripe checkout session."""
        tenant = request.user.tenant  # Get from middleware
        price_id = request.data.get('price_id')

        success_url = request.data.get('success_url')
        cancel_url = request.data.get('cancel_url')

        session = StripeService.create_checkout_session(
            tenant, price_id, success_url, cancel_url
        )

        return Response({
            'checkout_url': session.url,
            'session_id': session.id
        })
```

---

## 🧪 Testing with Stripe Test Mode

### Test Card Numbers

**Successful Payment:**
- `4242 4242 4242 4242` (Visa)
- `5555 5555 5555 4444` (Mastercard)

**Payment Requires Authentication:**
- `4000 0025 0000 3155`

**Payment Declined:**
- `4000 0000 0000 9995`

**Exp Date:** Any future date (e.g., 12/34)
**CVC:** Any 3 digits (e.g., 123)
**ZIP:** Any 5 digits (e.g., 12345)

---

## 📊 Implementation Status

| Step | Feature | Status | Time |
|------|---------|--------|------|
| 1 | Stripe Setup | ✅ In Progress | 2-3 hours |
| 2 | Payment Checkout | ⏳ Pending | 4-5 hours |
| 3 | Plan Management | ⏳ Pending | 3-4 hours |
| 4 | Webhooks | ⏳ Pending | 4-5 hours |
| 5 | Usage Tracking | ⏳ Pending | 3-4 hours |
| 6 | Invoices | ⏳ Pending | 2-3 hours |
| 7 | Lifecycle | ⏳ Pending | 3-4 hours |
| 8 | Admin | ⏳ Pending | 2-3 hours |

**Total Progress:** 12% (1/8 steps)

---

## 🎓 Learning Resources

- [Stripe Checkout Quickstart](https://stripe.com/docs/checkout/quickstart)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Stripe](https://stripe.com/docs/testing)

---

## ✅ Ready to Continue?

The foundation is set! Here's what happens next:

1. I'll create the Stripe service layer
2. Add Stripe configuration to Django settings
3. Create the checkout session API
4. Build the webhook handler
5. Implement plan management
6. Add usage tracking
7. Complete invoice management
8. Finalize subscription lifecycle

**Want me to continue building the Stripe integration?**

Say "continue" and I'll implement the next steps!
