/**
 * TanStack Query hooks for Tenant Management
 * Tenants, Users, Subscriptions, Invoices, Audit Logs
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  tenantApi,
  tenantUserApi,
  subscriptionApi,
  invoiceApi,
  auditLogApi,
  type Tenant,
  type TenantUser,
  type Subscription,
  type Invoice,
  type AuditLog,
} from '@/lib/api/tenants'

// ============================================================================
// Query Keys
// ============================================================================

export const tenantKeys = {
  // Tenants
  tenants: {
    all: ['tenants'] as const,
    lists: () => [...tenantKeys.tenants.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...tenantKeys.tenants.lists(), params] as const,
    details: () => [...tenantKeys.tenants.all, 'detail'] as const,
    detail: (id: string) => [...tenantKeys.tenants.details(), id] as const,
    current: () => [...tenantKeys.tenants.all, 'current'] as const,
  },

  // Tenant Users
  users: {
    all: ['tenant-users'] as const,
    lists: () => [...tenantKeys.users.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...tenantKeys.users.lists(), params] as const,
    details: () => [...tenantKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...tenantKeys.users.details(), id] as const,
  },

  // Subscription
  subscription: {
    all: ['subscription'] as const,
    current: () => [...tenantKeys.subscription.all, 'current'] as const,
  },

  // Invoices
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...tenantKeys.invoices.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...tenantKeys.invoices.lists(), params] as const,
    details: () => [...tenantKeys.invoices.all, 'detail'] as const,
    detail: (id: string) => [...tenantKeys.invoices.details(), id] as const,
  },

  // Audit Logs
  auditLogs: {
    all: ['audit-logs'] as const,
    lists: () => [...tenantKeys.auditLogs.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...tenantKeys.auditLogs.lists(), params] as const,
    stats: () => [...tenantKeys.auditLogs.all, 'stats'] as const,
  },
}

// ============================================================================
// Tenant Hooks
// ============================================================================

/**
 * Get current tenant
 */
export function useCurrentTenant() {
  return useQuery({
    queryKey: tenantKeys.tenants.current(),
    queryFn: () => tenantApi.getCurrentTenant(),
  })
}

/**
 * List tenants (admin only)
 */
export function useTenants(params?: Record<string, any>) {
  return useQuery({
    queryKey: tenantKeys.tenants.list(params),
    queryFn: () => tenantApi.listTenants(params),
  })
}

/**
 * Get tenant by ID
 */
export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantKeys.tenants.detail(id),
    queryFn: () => tenantApi.getTenant(id),
    enabled: !!id,
  })
}

/**
 * Update current tenant
 */
export function useUpdateCurrentTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Tenant>) => tenantApi.updateCurrentTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.tenants.current() })
      queryClient.invalidateQueries({ queryKey: tenantKeys.tenants.lists() })
    },
  })
}

// ============================================================================
// Tenant User Hooks
// ============================================================================

/**
 * List tenant users
 */
export function useTenantUsers(params?: Record<string, any>) {
  return useQuery({
    queryKey: tenantKeys.users.list(params),
    queryFn: () => tenantUserApi.listUsers(params),
  })
}

/**
 * Get tenant user by ID
 */
export function useTenantUser(id: string) {
  return useQuery({
    queryKey: tenantKeys.users.detail(id),
    queryFn: () => tenantUserApi.getUser(id),
    enabled: !!id,
  })
}

/**
 * Add user to tenant
 */
export function useAddTenantUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { user_email: string; role: string; is_active?: boolean }) =>
      tenantUserApi.addUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.users.lists() })
    },
  })
}

/**
 * Update tenant user
 */
export function useUpdateTenantUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<TenantUser, 'role' | 'is_active'>> }) =>
      tenantUserApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.users.lists() })
      queryClient.invalidateQueries({ queryKey: tenantKeys.users.detail(variables.id) })
    },
  })
}

/**
 * Remove user from tenant
 */
export function useRemoveTenantUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tenantUserApi.removeUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.users.lists() })
    },
  })
}

// ============================================================================
// Subscription Hooks
// ============================================================================

/**
 * Get current subscription
 */
export function useCurrentSubscription() {
  return useQuery({
    queryKey: tenantKeys.subscription.current(),
    queryFn: () => subscriptionApi.getCurrentSubscription(),
  })
}

/**
 * Update subscription
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Subscription>) => subscriptionApi.updateSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.subscription.current() })
    },
  })
}

// ============================================================================
// Invoice Hooks
// ============================================================================

/**
 * List invoices for current tenant
 */
export function useInvoices(params?: Record<string, any>) {
  return useQuery({
    queryKey: tenantKeys.invoices.list(params),
    queryFn: () => invoiceApi.listInvoices(params),
  })
}

/**
 * Get invoice by ID
 */
export function useInvoice(id: string) {
  return useQuery({
    queryKey: tenantKeys.invoices.detail(id),
    queryFn: () => invoiceApi.getInvoice(id),
    enabled: !!id,
  })
}

// ============================================================================
// Audit Log Hooks
// ============================================================================

/**
 * List audit logs
 */
export function useAuditLogs(params?: Record<string, any>) {
  return useQuery({
    queryKey: tenantKeys.auditLogs.list(params),
    queryFn: () => auditLogApi.listLogs(params),
  })
}

/**
 * Get audit log statistics
 */
export function useAuditLogStats() {
  return useQuery({
    queryKey: tenantKeys.auditLogs.stats(),
    queryFn: () => auditLogApi.getStats(),
  })
}
