# Phase 3: Subscription & Billing Integration

Complete payment processing and subscription management system for SaaS revenue generation.

---

## 🎯 Objectives

1. Integrate Stripe for payment processing
2. Implement plan upgrades/downgrades
3. Create webhook handlers for payment events
4. Add usage-based billing tracking
5. Manage subscription lifecycle (trial → paid → canceled)
6. Generate invoices automatically
7. Handle payment failures and retries

---

## 📋 Implementation Checklist

### Step 1: Stripe Setup & Configuration (2-3 hours)

- [ ] Install Stripe Python SDK
- [ ] Add Stripe API keys to environment
- [ ] Create Stripe service layer
- [ ] Set up Stripe webhooks
- [ ] Configure webhook signing secrets
- [ ] Create Stripe products and prices

**Files to Create/Modify:**
- `backend/requirements.txt` or `pyproject.toml`
- `backend/apps/tenants/services/stripe_service.py`
- `backend/config/settings/base.py` (Stripe config)
- `.env.production` (Stripe keys)

### Step 2: Payment Methods & Checkout (4-5 hours)

- [ ] Create payment method API endpoints
- [ ] Implement Stripe Checkout session creation
- [ ] Add payment method management UI endpoints
- [ ] Handle successful payment confirmation
- [ ] Store payment method details securely

**Endpoints to Create:**
- `POST /api/v1/billing/checkout/create/` - Create checkout session
- `POST /api/v1/billing/checkout/success/` - Handle success callback
- `GET /api/v1/billing/payment-methods/` - List payment methods
- `POST /api/v1/billing/payment-methods/` - Add payment method
- `DELETE /api/v1/billing/payment-methods/{id}/` - Remove payment method
- `POST /api/v1/billing/payment-methods/{id}/default/` - Set default

### Step 3: Plan Management (3-4 hours)

- [ ] Create subscription plan change API
- [ ] Implement upgrade logic (immediate)
- [ ] Implement downgrade logic (end of period)
- [ ] Calculate prorated amounts
- [ ] Handle plan limits enforcement
- [ ] Update tenant features on plan change

**Endpoints to Create:**
- `POST /api/v1/billing/subscriptions/upgrade/` - Upgrade plan
- `POST /api/v1/billing/subscriptions/downgrade/` - Downgrade plan
- `POST /api/v1/billing/subscriptions/cancel/` - Cancel subscription
- `POST /api/v1/billing/subscriptions/resume/` - Resume canceled subscription

### Step 4: Webhook Handler (4-5 hours)

- [ ] Create webhook receiver endpoint
- [ ] Implement signature verification
- [ ] Handle `checkout.session.completed`
- [ ] Handle `customer.subscription.created`
- [ ] Handle `customer.subscription.updated`
- [ ] Handle `customer.subscription.deleted`
- [ ] Handle `invoice.payment_succeeded`
- [ ] Handle `invoice.payment_failed`
- [ ] Handle `customer.subscription.trial_will_end`
- [ ] Implement idempotency for webhook processing

**Endpoint:**
- `POST /api/v1/billing/webhooks/stripe/` (public, no auth)

### Step 5: Usage Tracking (3-4 hours)

- [ ] Create usage tracking model
- [ ] Implement usage recording API
- [ ] Track billable metrics (users, storage, API calls)
- [ ] Create usage summary endpoint
- [ ] Implement usage-based billing calculations
- [ ] Add usage alerts (80%, 90%, 100% of limits)

**Models:**
- `UsageRecord` - Track daily/monthly usage
- `BillingMetric` - Define billable metrics

**Endpoints:**
- `GET /api/v1/billing/usage/current/` - Current period usage
- `GET /api/v1/billing/usage/history/` - Historical usage
- `POST /api/v1/billing/usage/record/` - Record usage event

### Step 6: Invoice Management (2-3 hours)

- [ ] Auto-generate invoices from Stripe
- [ ] Sync invoice data to database
- [ ] Create invoice PDF generation
- [ ] Email invoice to customer
- [ ] Add invoice download endpoint
- [ ] Track payment status

**Enhancements to Existing:**
- Enhance existing `Invoice` model
- Add PDF generation service
- Add email notification service

### Step 7: Subscription Lifecycle (3-4 hours)

- [ ] Implement trial period management
- [ ] Handle trial expiration
- [ ] Implement grace period for failed payments
- [ ] Auto-suspend on payment failure
- [ ] Auto-cancel after grace period
- [ ] Re-activate on successful payment
- [ ] Send lifecycle notifications

**State Machine:**
```
trial → active → past_due → unpaid → canceled
              ↓
           suspended
```

### Step 8: Admin Features (2-3 hours)

- [ ] Create admin billing dashboard API
- [ ] Add manual subscription override
- [ ] Implement refund processing
- [ ] Add billing analytics
- [ ] Export billing reports

---

## 🏗️ Architecture

### Stripe Integration Flow

```
Frontend → Create Checkout Session
         → Redirect to Stripe Checkout
         → Customer enters payment info
         → Stripe processes payment
         → Webhook: checkout.session.completed
         → Backend: Create subscription
         → Redirect to success page
```

### Subscription State Machine

```
NEW TENANT
   ↓
TRIAL (14 days)
   ↓
TRIAL_ENDING (3 days warning)
   ↓
PAYMENT_REQUIRED
   ↓ (payment success)
ACTIVE
   ↓ (payment failed)
PAST_DUE (7 days grace)
   ↓ (still failed)
UNPAID (suspend access)
   ↓ (14 days)
CANCELED
```

### Usage Tracking Flow

```
User Action → Record Usage Event
            → Check Against Limits
            → Send Alert if Near Limit
            → Block if Over Limit
            → Bill at End of Period
```

---

## 💳 Stripe Configuration

### Products & Prices to Create in Stripe

1. **Free Plan**
   - Price: $0/month
   - Features: 5 users, 1GB storage

2. **Starter Plan**
   - Price: $49/month ($470/year)
   - Features: 25 users, 10GB storage

3. **Professional Plan**
   - Price: $149/month ($1,430/year)
   - Features: 100 users, 50GB storage

4. **Enterprise Plan**
   - Price: $499/month (custom pricing)
   - Features: 1000 users, 100GB storage

### Stripe Webhook Events

Configure these events in Stripe dashboard:

- `checkout.session.completed` - Payment successful
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Plan changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Invoice paid
- `invoice.payment_failed` - Payment failed
- `customer.subscription.trial_will_end` - 3 days before trial ends
- `invoice.upcoming` - Invoice will be created soon
- `payment_intent.succeeded` - One-time payment successful
- `payment_intent.payment_failed` - Payment failed

---

## 📊 Data Models

### Subscription Model (Existing - Enhance)

```python
class Subscription(BaseModel):
    tenant = OneToOneField(Tenant)
    plan = CharField(choices=PlanType.choices)
    status = CharField(choices=SubscriptionStatus.choices)

    # Stripe IDs
    stripe_customer_id = CharField()
    stripe_subscription_id = CharField()
    stripe_price_id = CharField()

    # Billing cycle
    current_period_start = DateTimeField()
    current_period_end = DateTimeField()

    # Trial
    trial_start = DateTimeField()
    trial_end = DateTimeField()

    # Cancellation
    cancel_at_period_end = BooleanField()
    canceled_at = DateTimeField()

    # Payment
    default_payment_method = CharField()
```

### UsageRecord Model (New)

```python
class UsageRecord(BaseModel):
    tenant = ForeignKey(Tenant)
    metric = CharField()  # 'users', 'storage', 'api_calls'
    quantity = IntegerField()
    timestamp = DateTimeField()
    period_start = DateField()
    period_end = DateField()
```

### PaymentMethod Model (New)

```python
class PaymentMethod(BaseModel):
    tenant = ForeignKey(Tenant)
    stripe_payment_method_id = CharField()
    type = CharField()  # card, bank_account
    brand = CharField()  # visa, mastercard
    last4 = CharField()
    exp_month = IntegerField()
    exp_year = IntegerField()
    is_default = BooleanField()
```

---

## 🔒 Security Considerations

1. **Webhook Signature Verification**
   - Always verify Stripe webhook signatures
   - Reject unsigned requests

2. **Idempotency**
   - Store webhook event IDs
   - Prevent duplicate processing

3. **PCI Compliance**
   - Never store card numbers
   - Use Stripe Elements for card input
   - Store only Stripe tokens/IDs

4. **Access Control**
   - Only owners/admins can manage billing
   - Validate tenant ownership

5. **Rate Limiting**
   - Limit checkout session creation
   - Prevent abuse

---

## 📈 Success Metrics

- [ ] Subscription conversion rate (trial → paid)
- [ ] Churn rate
- [ ] Average revenue per user (ARPU)
- [ ] Monthly recurring revenue (MRR)
- [ ] Payment success rate
- [ ] Failed payment recovery rate

---

## 🧪 Testing Strategy

1. **Stripe Test Mode**
   - Use test API keys for development
   - Test cards: `4242 4242 4242 4242`

2. **Test Scenarios**
   - Successful subscription creation
   - Failed payment handling
   - Plan upgrades/downgrades
   - Subscription cancellation
   - Webhook processing
   - Usage limit enforcement

3. **Edge Cases**
   - Payment method expires
   - Subscription in grace period
   - Prorated charges
   - Refunds
   - Disputed charges

---

## 📝 Environment Variables

Add to `.env.production`:

```env
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product IDs
STRIPE_PRODUCT_FREE=prod_...
STRIPE_PRODUCT_STARTER=prod_...
STRIPE_PRODUCT_PROFESSIONAL=prod_...
STRIPE_PRODUCT_ENTERPRISE=prod_...

# Stripe Price IDs
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_...
STRIPE_PRICE_PROFESSIONAL_YEARLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
```

---

## 🚀 Deployment Checklist

- [ ] Add Stripe keys to production environment
- [ ] Create Stripe webhook endpoint
- [ ] Configure webhook URL in Stripe dashboard
- [ ] Create products and prices in Stripe
- [ ] Test webhook delivery
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications
- [ ] Add billing alerts

---

## 📚 Resources

- [Stripe Python SDK](https://stripe.com/docs/api/python)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Subscription Lifecycle](https://stripe.com/docs/billing/subscriptions/overview)
- [Usage-Based Billing](https://stripe.com/docs/billing/subscriptions/usage-based)

---

## ⏱️ Estimated Timeline

- **Total Time**: 2-3 weeks
- **Week 1**: Stripe setup, checkout, payment methods
- **Week 2**: Plan management, webhooks, usage tracking
- **Week 3**: Invoice management, lifecycle, admin features, testing

---

## 🎯 Phase 3 Success Criteria

- ✅ Customers can subscribe via Stripe Checkout
- ✅ Plans can be upgraded/downgraded
- ✅ Webhooks process all payment events
- ✅ Usage is tracked and billed correctly
- ✅ Failed payments trigger grace period
- ✅ Invoices generate automatically
- ✅ Trial-to-paid conversion is seamless
- ✅ All payment flows are secure and PCI compliant
