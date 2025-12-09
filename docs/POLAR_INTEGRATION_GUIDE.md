# Polar.sh Integration Guide 🐻‍❄️

Complete guide for integrating Polar.sh payment processing and subscription management into your SaaS application.

---

## 🎯 What is Polar.sh?

**Polar** is a merchant of record platform designed for developers and creators. It handles:
- ✅ Payment processing (credit cards, PayPal)
- ✅ Tax calculations (worldwide VAT/sales tax)
- ✅ Compliance (PCI, GDPR)
- ✅ Invoicing
- ✅ Subscriptions
- ✅ Webhooks

**Benefits over Stripe:**
- Simpler pricing (no per-transaction fees in some regions)
- Built specifically for digital products
- Developer-first API
- Automatic tax handling

---

## ✅ Phase 3 Progress - Polar Integration

### Completed Steps:

1. ✅ **Polar SDK Installed**
   - Package: `polar-sdk` v0.28.0
   - Added to `pyproject.toml`

2. ✅ **Polar Service Layer Created**
   - File: [backend/apps/tenants/services/polar_service.py](backend/apps/tenants/services/polar_service.py)
   - Functions: checkout, subscriptions, webhooks

3. ✅ **Django Settings Updated**
   - File: [backend/config/settings/base.py](backend/config/settings/base.py#L259-270)
   - Added Polar configuration

4. ✅ **Environment Variables Added**
   - `.env` - Sandbox/development keys
   - `.env.production` - Live keys

---

## 🔑 Step 1: Get Your Polar Access Token

### 1. Create Polar Account
Visit: https://polar.sh/signup

### 2. Get Access Token
Dashboard → Settings → API → Create Personal Access Token

**Scopes needed:**
- `products:read`
- `products:write`
- `checkouts:read`
- `checkouts:write`
- `subscriptions:read`
- `subscriptions:write`
- `webhooks:read`

**Copy the token** - you'll need it for `.env`

### 3. Update Environment Variables

**For Development (.env):**
```bash
# Polar.sh Configuration (Sandbox)
POLAR_ACCESS_TOKEN=polar_sandbox_YOUR_TOKEN_HERE
POLAR_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Polar Product IDs (will create these next)
POLAR_PRODUCT_STARTER=
POLAR_PRODUCT_PROFESSIONAL=
POLAR_PRODUCT_ENTERPRISE=
```

**For Production (.env.production):**
```bash
# Polar.sh Configuration (Live)
POLAR_ACCESS_TOKEN=polar_live_YOUR_TOKEN_HERE
POLAR_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Polar Product IDs (Production)
POLAR_PRODUCT_STARTER=
POLAR_PRODUCT_PROFESSIONAL=
POLAR_PRODUCT_ENTERPRISE=
```

---

## 📦 Step 2: Create Products in Polar

### Via Polar Dashboard:

1. Go to: https://polar.sh/dashboard/products
2. Click "Create Product"

### Product 1: Starter Plan

```
Name: Starter Plan
Description: Perfect for small teams getting started
Price: $49/month
Billing Interval: Monthly
Organization: Your Org

Features (in description):
- 25 users
- 10GB storage
- Email support
- Core modules: HR, Organization, Finance, Assets
```

**After creation, copy the Product ID** (starts with `prod_`)

### Product 2: Professional Plan

```
Name: Professional Plan
Description: Advanced features for growing organizations
Price: $149/month
Billing Interval: Monthly

Features:
- 100 users
- 50GB storage
- Priority email support
- All modules included
- Advanced analytics
```

### Product 3: Enterprise Plan

```
Name: Enterprise Plan
Description: Unlimited scalability for large enterprises
Price: $499/month
Billing Interval: Monthly

Features:
- 1000 users
- 100GB storage
- 24/7 phone & email support
- All modules
- Custom integrations
- Dedicated account manager
```

### Update Environment Variables

After creating products, add their IDs to `.env`:

```bash
POLAR_PRODUCT_STARTER=prod_01HXXXXXXXXXXXXXXXXXXXXX
POLAR_PRODUCT_PROFESSIONAL=prod_01HYYYYYYYYYYYYYYYYYYYYYY
POLAR_PRODUCT_ENTERPRISE=prod_01HZZZZZZZZZZZZZZZZZZZZZ
```

---

## 🔗 Step 3: Set Up Webhooks

### 1. Create Webhook Endpoint in Polar

Dashboard → Settings → Webhooks → Create Webhook

**Webhook URL:**
```
https://yourdomain.com/api/v1/billing/webhooks/polar/
```

**Events to Subscribe:**
- `checkout.created`
- `checkout.updated`
- `order.created`
- `subscription.created`
- `subscription.updated`
- `subscription.canceled`

**Copy the Webhook Secret** and add to `.env`:

```bash
POLAR_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### 2. Test Webhook (Development)

For local testing, use **ngrok** or **localtunnel**:

```bash
# Install ngrok
brew install ngrok

# Start ngrok tunnel
ngrok http 8000

# Use the ngrok URL in Polar webhook settings
# Example: https://abc123.ngrok.io/api/v1/billing/webhooks/polar/
```

---

## 💻 Implementation Files Created

### 1. Polar Service Layer

**File:** `backend/apps/tenants/services/polar_service.py`

**Key Functions:**
- `create_checkout_session()` - Create payment checkout
- `get_subscription()` - Get subscription details
- `cancel_subscription()` - Cancel subscription
- `update_subscription()` - Change plan
- `verify_webhook()` - Verify webhook signature
- `process_webhook_event()` - Handle webhook events

**Usage Example:**
```python
from apps.tenants.services.polar_service import polar_service

# Create checkout
checkout = polar_service.create_checkout_session(
    tenant=request.user.tenant,
    product_id=settings.POLAR_PRODUCTS['starter'],
    success_url='https://yourdomain.com/success',
)

# Redirect user to checkout.checkout_url
```

### 2. Django Settings

**File:** `backend/config/settings/base.py` (lines 259-270)

```python
# Polar.sh Configuration
POLAR_ACCESS_TOKEN = os.environ.get("POLAR_ACCESS_TOKEN", "")
POLAR_WEBHOOK_SECRET = os.environ.get("POLAR_WEBHOOK_SECRET", "")

# Polar Product IDs for different plans
POLAR_PRODUCTS = {
    "starter": os.environ.get("POLAR_PRODUCT_STARTER", ""),
    "professional": os.environ.get("POLAR_PRODUCT_PROFESSIONAL", ""),
    "enterprise": os.environ.get("POLAR_PRODUCT_ENTERPRISE", ""),
}
```

---

## 🧪 Testing

### Test in Sandbox Mode

Polar automatically provides a sandbox environment. Use your `polar_sandbox_` token for testing.

**Test Checkout Flow:**
1. Create a checkout session via API
2. Visit the checkout URL
3. Use test payment details (Polar provides test cards)
4. Verify webhook events are received

**Test Cards:**
- Most major credit card test numbers work
- Use any future expiration date
- Use any 3-digit CVC

---

## 📊 Next Steps: API Endpoints

Now that Polar is configured, you need to create API endpoints:

### Endpoints to Create:

1. **POST /api/v1/billing/checkout/create/**
   - Create Polar checkout session
   - Redirect user to Polar checkout page

2. **POST /api/v1/billing/webhooks/polar/**
   - Receive Polar webhook events
   - Process subscription changes

3. **GET /api/v1/billing/subscription/current/**
   - Get current subscription status

4. **POST /api/v1/billing/subscription/cancel/**
   - Cancel subscription

5. **POST /api/v1/billing/subscription/upgrade/**
   - Upgrade to higher plan

Would you like me to create these API endpoints next?

---

## 🔐 Security Notes

1. **Webhook Verification**
   - Always verify webhook signatures
   - Use `POLAR_WEBHOOK_SECRET`

2. **Access Token Security**
   - Never commit tokens to Git
   - Use environment variables
   - Rotate tokens regularly

3. **Idempotency**
   - Store webhook event IDs
   - Prevent duplicate processing

---

## 📚 Polar API Documentation

- **API Reference**: https://docs.polar.sh/api
- **Python SDK**: https://github.com/polarsource/polar-python
- **Webhooks**: https://docs.polar.sh/webhooks
- **Products**: https://docs.polar.sh/products
- **Subscriptions**: https://docs.polar.sh/subscriptions

---

## ✅ Checklist

Before going live:

- [ ] Polar account created
- [ ] Access token generated and added to `.env`
- [ ] Products created in Polar dashboard
- [ ] Product IDs added to `.env`
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to `.env`
- [ ] Test checkout flow working
- [ ] Webhooks being received
- [ ] Subscription creation working
- [ ] API endpoints created (next step)

---

## 🎯 What's Next?

You have Polar fully configured! The foundation is ready.

**Next tasks:**
1. Create billing API endpoints
2. Implement checkout flow
3. Handle webhook events
4. Test subscription lifecycle
5. Build frontend integration

**Ready to continue?** Let me know and I'll create the billing API endpoints!
