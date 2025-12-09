# Tenant Management API Guide

Complete API reference for multi-tenant functionality including organization registration, user invitations, and tenant switching.

---

## 🏢 Tenant Registration

### Register New Organization
Register a new organization/tenant and become the owner.

**Endpoint:** `POST /api/v1/register/register/`
**Auth:** Required (Bearer Token)
**Permissions:** Any authenticated user

**Request Body:**
```json
{
  "organization_name": "Acme Corporation",
  "subdomain": "acme",  // Optional - auto-generated if not provided
  "email": "admin@acme.com",
  "phone": "+1-555-1234",  // Optional
  "user_first_name": "John",  // Optional
  "user_last_name": "Doe",  // Optional
  "plan": "starter"  // free, starter, professional, enterprise
}
```

**Response:** `201 Created`
```json
{
  "tenant": {
    "id": "uuid",
    "name": "Acme Corporation",
    "slug": "acme",
    "subdomain": "acme",
    "email": "admin@acme.com",
    "status": "trial",
    "plan": "starter",
    "plan_display": "Starter",
    "user_count": 1,
    "is_trial": true
  },
  "message": "Organization registered successfully!"
}
```

---

## 👥 Tenant Management

### Get Current Tenant
Get the authenticated user's current tenant.

**Endpoint:** `GET /api/v1/tenants/current/`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "slug": "acme",
  "subdomain": "acme",
  "email": "admin@acme.com",
  "status": "active",
  "plan": "starter",
  "user_count": 5,
  "is_trial": false
}
```

### Update Current Tenant
Update current tenant settings (admins/owners only).

**Endpoint:** `PUT /api/v1/tenants/update_current/`
**Auth:** Required
**Permissions:** Owner or Admin

**Request Body:**
```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "+1-555-5678",
  "primary_color": "#FF5733",
  "logo": "base64_or_url",
  "settings": {
    "timezone": "America/New_York",
    "currency": "USD"
  }
}
```

---

## 📧 User Invitations

### Send Invitation
Invite a user to join your organization.

**Endpoint:** `POST /api/v1/invitations/send/`
**Auth:** Required
**Permissions:** Owner or Admin

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "member",  // owner, admin, manager, member, viewer
  "message": "Welcome to our team!"  // Optional
}
```

**Response:** `201 Created`
```json
{
  "invitation": {
    "id": "uuid",
    "tenant": "uuid",
    "user": {
      "email": "user@example.com"
    },
    "role": "member",
    "role_display": "Member",
    "is_active": false,
    "invited_at": "2025-12-02T10:00:00Z"
  },
  "message": "Invitation sent successfully!"
}
```

### List Pending Invitations
Get all pending invitations for current tenant.

**Endpoint:** `GET /api/v1/invitations/pending/`
**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user": {
      "email": "user@example.com"
    },
    "role": "member",
    "invited_by": {
      "email": "admin@acme.com"
    },
    "invited_at": "2025-12-02T10:00:00Z"
  }
]
```

### Accept Invitation
Accept invitation to join organization (public endpoint).

**Endpoint:** `POST /api/v1/invitations/accept/`
**Auth:** None (public)

**Request Body:**
```json
{
  "invitation_token": "tenant-user-uuid",
  "password": "SecurePass123",  // Required for new users
  "first_name": "Jane",  // Optional
  "last_name": "Smith"  // Optional
}
```

**Response:** `200 OK`
```json
{
  "message": "Invitation accepted successfully!",
  "tenant": {
    "id": "uuid",
    "name": "Acme Corporation"
  },
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "member"
  },
  "tokens": {
    "refresh": "jwt_refresh_token",
    "access": "jwt_access_token"
  }
}
```

### Resend Invitation
Resend invitation email to pending user.

**Endpoint:** `POST /api/v1/invitations/{id}/resend/`
**Auth:** Required
**Permissions:** Owner or Admin

**Response:** `200 OK`
```json
{
  "message": "Invitation resent successfully!"
}
```

### Cancel Invitation
Cancel a pending invitation.

**Endpoint:** `DELETE /api/v1/invitations/{id}/cancel/`
**Auth:** Required
**Permissions:** Owner or Admin

**Response:** `204 No Content`

---

## 🔄 Tenant Switching

### List Available Tenants
Get all organizations the user belongs to (for tenant switcher).

**Endpoint:** `GET /api/v1/switch/available/`
**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Acme Corporation",
    "subdomain": "acme",
    "role": "owner",
    "role_display": "Owner",
    "is_owner": true
  },
  {
    "id": "uuid",
    "name": "Beta Inc",
    "subdomain": "beta",
    "role": "member",
    "role_display": "Member",
    "is_owner": false
  }
]
```

### Switch Tenant
Switch to a different organization (generates new JWT with tenant context).

**Endpoint:** `POST /api/v1/switch/switch/`
**Auth:** Required

**Request Body:**
```json
{
  "tenant_id": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "message": "Switched to Acme Corporation",
  "tenant": {
    "id": "uuid",
    "name": "Acme Corporation",
    "subdomain": "acme"
  },
  "tokens": {
    "refresh": "jwt_refresh_token_with_tenant_context",
    "access": "jwt_access_token_with_tenant_context"
  }
}
```

**JWT Token Claims:**
```json
{
  "user_id": "uuid",
  "tenant_id": "uuid",
  "tenant_slug": "acme",
  "tenant_role": "owner"
}
```

---

## 👤 Tenant Users

### List Tenant Users
Get all users in current tenant.

**Endpoint:** `GET /api/v1/tenant-users/`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "count": 5,
  "results": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "email": "admin@acme.com",
        "full_name": "John Doe"
      },
      "role": "owner",
      "role_display": "Owner",
      "is_owner": true,
      "is_active": true,
      "can_manage_users": true,
      "can_manage_billing": true,
      "joined_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Add User to Tenant
Add existing user to current tenant.

**Endpoint:** `POST /api/v1/tenant-users/`
**Auth:** Required
**Permissions:** Owner or Admin

**Request Body:**
```json
{
  "user_email": "user@example.com",
  "role": "member"
}
```

### Update User Role
Change user's role in tenant.

**Endpoint:** `PUT /api/v1/tenant-users/{id}/`
**Auth:** Required
**Permissions:** Owner or Admin

**Request Body:**
```json
{
  "role": "admin"
}
```

### Remove User from Tenant
Remove user from organization.

**Endpoint:** `DELETE /api/v1/tenant-users/{id}/`
**Auth:** Required
**Permissions:** Owner or Admin

**Response:** `204 No Content`

### Get Available Roles
Get list of all tenant roles.

**Endpoint:** `GET /api/v1/tenant-users/roles/`
**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "value": "owner",
    "label": "Owner"
  },
  {
    "value": "admin",
    "label": "Administrator"
  },
  {
    "value": "manager",
    "label": "Manager"
  },
  {
    "value": "member",
    "label": "Member"
  },
  {
    "value": "viewer",
    "label": "Viewer"
  }
]
```

---

## 📄 Subscriptions

### Get Current Subscription
Get subscription details for current tenant.

**Endpoint:** `GET /api/v1/subscriptions/current/`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "tenant_name": "Acme Corporation",
  "plan": "starter",
  "plan_display": "Starter",
  "status": "active",
  "is_active": true,
  "start_date": "2025-01-01T00:00:00Z",
  "end_date": "2025-02-01T00:00:00Z",
  "days_until_renewal": 30,
  "auto_renew": true
}
```

### Get Available Plans
Get list of subscription plans with features.

**Endpoint:** `GET /api/v1/subscriptions/plans/`
**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "value": "free",
    "label": "Free",
    "features": {
      "max_users": 5,
      "max_storage_gb": 1,
      "modules": ["hr", "organization"],
      "support": "Community"
    }
  },
  {
    "value": "enterprise",
    "label": "Enterprise",
    "features": {
      "max_users": 1000,
      "max_storage_gb": 100,
      "modules": ["all"],
      "support": "24/7 Phone & Email",
      "custom_features": true
    }
  }
]
```

---

## 🧾 Invoices

### List Invoices
Get all invoices for current tenant.

**Endpoint:** `GET /api/v1/invoices/`
**Auth:** Required

**Query Parameters:**
- `status`: Filter by status (pending, paid, failed, etc.)
- `start_date`: Filter from date (YYYY-MM-DD)
- `end_date`: Filter to date (YYYY-MM-DD)

**Response:** `200 OK`
```json
{
  "count": 12,
  "results": [
    {
      "id": "uuid",
      "invoice_number": "INV-202512-0001",
      "tenant_name": "Acme Corporation",
      "subscription_plan": "starter",
      "amount": 49.00,
      "currency": "USD",
      "tax_amount": 4.90,
      "total_amount": 53.90,
      "status": "paid",
      "status_display": "Paid",
      "issue_date": "2025-12-01",
      "due_date": "2025-12-15",
      "paid_date": "2025-12-05T10:30:00Z",
      "is_overdue": false,
      "pdf_url": "https://..."
    }
  ]
}
```

### Get Invoice Details
Get details for a specific invoice.

**Endpoint:** `GET /api/v1/invoices/{id}/`
**Auth:** Required

---

## 🔐 Permissions Matrix

| Role | View Data | Edit Data | Manage Users | Manage Billing | Owner Actions |
|------|-----------|-----------|--------------|----------------|---------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manager | ✅ | ✅ | ❌ | ❌ | ❌ |
| Member | ✅ | ✅ (own data) | ❌ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🚀 Integration Examples

### Frontend Tenant Context

```javascript
// React Context Provider
import { createContext, useContext } from 'react';

const TenantContext = createContext();

export function TenantProvider({ children }) {
  const [currentTenant, setCurrentTenant] = useState(null);

  useEffect(() => {
    // Load tenant from JWT or API
    fetchCurrentTenant();
  }, []);

  const switchTenant = async (tenantId) => {
    const response = await api.post('/switch/switch/', { tenant_id: tenantId });
    // Update tokens
    localStorage.setItem('access_token', response.data.tokens.access);
    localStorage.setItem('refresh_token', response.data.tokens.refresh);
    // Update context
    setCurrentTenant(response.data.tenant);
    // Reload app data
    window.location.reload();
  };

  return (
    <TenantContext.Provider value={{ currentTenant, switchTenant }}>
      {children}
    </TenantContext.Provider>
  );
}
```

### Tenant Switcher Component

```javascript
export function TenantSwitcher() {
  const { currentTenant, switchTenant } = useTenant();
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    loadAvailableTenants();
  }, []);

  return (
    <select value={currentTenant?.id} onChange={(e) => switchTenant(e.target.value)}>
      {tenants.map(t => (
        <option key={t.id} value={t.id}>
          {t.name} ({t.role_display})
        </option>
      ))}
    </select>
  );
}
```

---

## 📝 Notes

- All endpoints return standard error responses with proper HTTP status codes
- JWT tokens include tenant context after switching
- Invitation tokens are currently tenant_user UUIDs (enhance with signed tokens in production)
- Email sending is marked as TODO - integrate with your email provider
- Subdomain routing requires DNS/proxy configuration
- Rate limiting recommended for invitation endpoints
