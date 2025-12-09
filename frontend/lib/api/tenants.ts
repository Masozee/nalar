/**
 * Tenant & Settings API Module
 * Handles tenant management, users, subscriptions, and audit logs
 */

import { ApiClient } from './client'
import type { PaginatedResponse } from './types'

const client = new ApiClient()

// ============================================================================
// Types
// ============================================================================

export interface Tenant {
  id: string
  name: string
  slug: string
  subdomain: string
  plan: 'free' | 'starter' | 'professional' | 'enterprise'
  status: 'trial' | 'active' | 'suspended' | 'cancelled'
  max_users: number
  enabled_modules: string[]
  settings: Record<string, any>
  logo?: string
  primary_color: string
  secondary_color?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface TenantUser {
  id: string
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    is_active: boolean
    last_login: string | null
    date_joined: string
  }
  tenant: string
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
  is_active: boolean
  joined_at: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  tenant: string
  plan: string
  status: string
  start_date: string
  end_date: string | null
  trial_end_date: string | null
  auto_renew: boolean
  payment_method: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user: {
    id: string
    email: string
    full_name: string
  } | null
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import'
  model_name: string
  object_id: string
  changes: Record<string, any>
  ip_address: string | null
  user_agent: string
  timestamp: string
  created_at: string
}

export interface Invoice {
  id: string
  tenant: string
  tenant_name: string
  subscription: string | null
  subscription_plan: string | null
  invoice_number: string
  amount: string
  currency: string
  tax_amount: string
  total_amount: string
  description: string
  line_items: Array<{
    description: string
    quantity: number
    unit_price: string
    amount: string
  }>
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'refunded' | 'canceled'
  status_display: string
  issue_date: string
  due_date: string
  paid_date: string | null
  stripe_invoice_id: string
  payment_method: string
  pdf_url: string
  days_overdue: number | null
  is_overdue: boolean
  created_at: string
  updated_at: string
}

export interface TenantInvitation {
  id: string
  tenant: string
  email: string
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
  invited_by: {
    id: string
    email: string
    full_name: string
  }
  invitation_token: string
  message: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  invited_at: string
  expires_at: string
  accepted_at: string | null
}

export interface AvailableTenant {
  id: string
  name: string
  slug: string
  subdomain: string
  role: string
  role_display: string
  is_owner: boolean
}

// ============================================================================
// Tenant API
// ============================================================================

export const tenantApi = {
  /**
   * Get current user's tenant
   */
  getCurrentTenant: () =>
    client.get<Tenant>('/tenants/current/'),

  /**
   * List all tenants (admin only)
   */
  listTenants: (params?: Record<string, any>) =>
    client.get<PaginatedResponse<Tenant>>('/tenants/', { params }),

  /**
   * Get tenant by ID
   */
  getTenant: (id: string) =>
    client.get<Tenant>(`/tenants/${id}/`),

  /**
   * Update tenant
   */
  updateTenant: (id: string, data: Partial<Tenant>) =>
    client.patch<Tenant>(`/tenants/${id}/`, data),

  /**
   * Update current tenant
   */
  updateCurrentTenant: (data: Partial<Tenant>) =>
    client.patch<Tenant>('/tenants/update_current/', data),
}

// ============================================================================
// Tenant User API
// ============================================================================

export const tenantUserApi = {
  /**
   * List users in tenant
   */
  listUsers: (params?: Record<string, any>) =>
    client.get<PaginatedResponse<TenantUser>>('/tenant-users/', { params }),

  /**
   * Get user by ID
   */
  getUser: (id: string) =>
    client.get<TenantUser>(`/tenant-users/${id}/`),

  /**
   * Add user to tenant
   */
  addUser: (data: { user_email: string; role: string; is_active?: boolean }) =>
    client.post<TenantUser>('/tenant-users/', data),

  /**
   * Update user
   */
  updateUser: (id: string, data: Partial<Pick<TenantUser, 'role' | 'is_active'>>) =>
    client.patch<TenantUser>(`/tenant-users/${id}/`, data),

  /**
   * Remove user from tenant
   */
  removeUser: (id: string) =>
    client.delete(`/tenant-users/${id}/`),
}

// ============================================================================
// Subscription API
// ============================================================================

export const subscriptionApi = {
  /**
   * Get current subscription
   */
  getCurrentSubscription: () =>
    client.get<Subscription>('/subscriptions/current/'),

  /**
   * Update subscription
   */
  updateSubscription: (data: Partial<Subscription>) =>
    client.put<Subscription>('/subscriptions/update/', data),
}

// ============================================================================
// Audit Log API
// ============================================================================

export const auditLogApi = {
  /**
   * List audit logs
   */
  listLogs: (params?: Record<string, any>) =>
    client.get<PaginatedResponse<AuditLog>>('/audit-logs/', { params }),

  /**
   * Get audit log statistics
   */
  getStats: () =>
    client.get<{
      total_logs: number
      top_action: string
      most_active_model: string
      active_users_count: number
    }>('/audit-logs/stats/'),
}

// ============================================================================
// Invoice API
// ============================================================================

export const invoiceApi = {
  /**
   * List invoices for current tenant
   */
  listInvoices: (params?: Record<string, any>) =>
    client.get<PaginatedResponse<Invoice>>('/invoices/', { params }),

  /**
   * Get invoice by ID
   */
  getInvoice: (id: string) =>
    client.get<Invoice>(`/invoices/${id}/`),

  /**
   * Download invoice PDF
   */
  downloadInvoice: (id: string) =>
    client.get<Blob>(`/invoices/${id}/download/`, { responseType: 'blob' }),
}

// ============================================================================
// Invitation API (Phase 2B)
// ============================================================================

export const invitationApi = {
  /**
   * Send invitation to join tenant
   */
  sendInvitation: (data: { email: string; role: string; message?: string }) =>
    client.post<TenantInvitation>('/invitations/send/', data),

  /**
   * List pending invitations
   */
  listPendingInvitations: (params?: Record<string, any>) =>
    client.get<PaginatedResponse<TenantInvitation>>('/invitations/pending/', { params }),

  /**
   * Accept invitation (public endpoint)
   */
  acceptInvitation: (data: {
    invitation_token: string
    password: string
    first_name?: string
    last_name?: string
  }) =>
    client.post<{
      message: string
      tenant: Tenant
      tokens: { access: string; refresh: string }
    }>('/invitations/accept/', data),

  /**
   * Resend invitation email
   */
  resendInvitation: (id: string) =>
    client.post<{ message: string }>(`/invitations/${id}/resend/`),

  /**
   * Cancel invitation
   */
  cancelInvitation: (id: string) =>
    client.delete(`/invitations/${id}/cancel/`),
}

// ============================================================================
// Tenant Switching API (Phase 2B)
// ============================================================================

export const tenantSwitchApi = {
  /**
   * Get list of tenants user has access to
   */
  getAvailableTenants: () =>
    client.get<AvailableTenant[]>('/switch/available/'),

  /**
   * Switch to a different tenant
   */
  switchTenant: (tenantId: string) =>
    client.post<{
      message: string
      tenant: Tenant
      tokens: { access: string; refresh: string }
    }>('/switch/switch/', { tenant_id: tenantId }),
}

// ============================================================================
// Registration API (Phase 2B)
// ============================================================================

export const registrationApi = {
  /**
   * Register new organization/tenant
   */
  registerOrganization: (data: {
    organization_name: string
    email: string
    plan: 'free' | 'starter' | 'professional' | 'enterprise'
    user_first_name: string
    user_last_name: string
    password: string
  }) =>
    client.post<{
      message: string
      tenant: Tenant
      user: any
    }>('/register/register/', data),
}
