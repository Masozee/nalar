/**
 * Finance API client for expense requests and advances
 */
import { apiClient } from './client'
import type { PaginatedResponse } from './types'

// Enums and Types
export type ExpenseCategory =
  | 'travel'
  | 'accommodation'
  | 'meals'
  | 'transport'
  | 'supplies'
  | 'entertainment'
  | 'training'
  | 'communication'
  | 'utilities'
  | 'medical'
  | 'other'

export type ExpenseStatus =
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'paid'
  | 'cancelled'

export type PaymentMethod = 'cash' | 'bank_transfer' | 'petty_cash'

export type AdvanceStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'disbursed'
  | 'settled'
  | 'cancelled'

// Expense Item Interfaces
export interface ExpenseItem {
  id: string
  expense_request: string
  category: ExpenseCategory
  category_display: string
  description: string
  quantity: string
  unit_price: string
  amount: string
  receipt_number: string
  receipt_date: string | null
  receipt_file: string | null
  notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExpenseItemCreate {
  category: ExpenseCategory
  description: string
  quantity: number
  unit_price: number
  receipt_number?: string
  receipt_date?: string
  notes?: string
}

// Expense Request Interfaces
export interface ExpenseRequestListItem {
  id: string
  request_number: string
  title: string
  requester: string
  requester_name: string
  department: string
  status: ExpenseStatus
  status_display: string
  currency: string
  total_amount: string
  approved_amount: string
  payment_method: PaymentMethod
  payment_method_display: string
  request_date: string
  expense_date: string
  item_count: number
  is_active: boolean
  created_at: string
}

export interface ExpenseRequest {
  id: string
  request_number: string
  requester: string
  requester_name: string
  department: string
  title: string
  description: string
  purpose: string
  request_date: string
  expense_date: string
  status: ExpenseStatus
  status_display: string
  currency: string
  total_amount: string
  approved_amount: string
  payment_method: PaymentMethod
  payment_method_display: string
  bank_name: string
  bank_account_number: string
  bank_account_name: string
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  rejection_reason: string
  processed_by: string | null
  processed_by_name: string | null
  processed_at: string | null
  payment_reference: string
  payment_date: string | null
  notes: string
  finance_notes: string
  items: ExpenseItem[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExpenseRequestCreate {
  title: string
  description?: string
  purpose?: string
  expense_date: string
  payment_method: PaymentMethod
  bank_name?: string
  bank_account_number?: string
  bank_account_name?: string
  notes?: string
  items?: ExpenseItemCreate[]
}

export interface ExpenseRequestUpdate {
  title?: string
  description?: string
  purpose?: string
  expense_date?: string
  payment_method?: PaymentMethod
  bank_name?: string
  bank_account_number?: string
  bank_account_name?: string
  notes?: string
}

export interface ExpenseApprovalData {
  approved_amount?: number
  finance_notes?: string
}

export interface ExpenseRejectData {
  reason: string
}

export interface ExpenseProcessData {
  payment_reference?: string
}

export interface ExpensePayData {
  payment_date?: string
}

export interface ExpenseSummary {
  total_requests: number
  total_requested_amount: number
  total_approved_amount: number
  total_paid_amount: number
  by_status: {
    draft: number
    submitted: number
    approved: number
    rejected: number
    processing: number
    paid: number
  }
}

// Expense Advance Interfaces
export interface ExpenseAdvanceListItem {
  id: string
  advance_number: string
  requester: string
  requester_name: string
  purpose: string
  amount: string
  status: AdvanceStatus
  status_display: string
  settled_amount: string
  balance: number
  is_active: boolean
  created_at: string
}

export interface ExpenseAdvance {
  id: string
  advance_number: string
  requester: string
  requester_name: string
  expense_request: string | null
  expense_request_number: string | null
  purpose: string
  amount: string
  status: AdvanceStatus
  status_display: string
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  settled_amount: string
  settlement_date: string | null
  balance: number
  notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExpenseAdvanceCreate {
  expense_request?: string
  purpose: string
  amount: number
  notes?: string
}

export interface ExpenseAdvanceSettleData {
  settled_amount: number
  settlement_date?: string
}

// API Methods - Expense Requests
export const expenseRequestApi = {
  list: (params?: Record<string, any>): Promise<PaginatedResponse<ExpenseRequestListItem>> =>
    apiClient.get('/finance/expenses/requests/', { params }),

  get: (id: string): Promise<ExpenseRequest> =>
    apiClient.get(`/finance/expenses/requests/${id}/`),

  create: (data: ExpenseRequestCreate): Promise<ExpenseRequest> =>
    apiClient.post('/finance/expenses/requests/', data),

  update: (id: string, data: ExpenseRequestUpdate): Promise<ExpenseRequest> =>
    apiClient.patch(`/finance/expenses/requests/${id}/`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/finance/expenses/requests/${id}/`),

  // Workflow actions
  submit: (id: string): Promise<{ status: string }> =>
    apiClient.post(`/finance/expenses/requests/${id}/submit/`),

  approve: (id: string, data: ExpenseApprovalData): Promise<{ status: string }> =>
    apiClient.post(`/finance/expenses/requests/${id}/approve/`, data),

  reject: (id: string, data: ExpenseRejectData): Promise<{ status: string }> =>
    apiClient.post(`/finance/expenses/requests/${id}/reject/`, data),

  processPayment: (id: string, data: ExpenseProcessData): Promise<{ status: string }> =>
    apiClient.post(`/finance/expenses/requests/${id}/process_payment/`, data),

  markPaid: (id: string, data: ExpensePayData): Promise<{ status: string }> =>
    apiClient.post(`/finance/expenses/requests/${id}/mark_paid/`, data),

  cancel: (id: string): Promise<{ status: string }> =>
    apiClient.post(`/finance/expenses/requests/${id}/cancel/`),

  // Custom endpoints
  pendingApproval: (): Promise<ExpenseRequestListItem[]> =>
    apiClient.get('/finance/expenses/requests/pending_approval/'),

  summary: (params?: { start_date?: string; end_date?: string }): Promise<ExpenseSummary> =>
    apiClient.get('/finance/expenses/requests/summary/', { params }),
}

// API Methods - Expense Items
export const expenseItemApi = {
  list: (params?: Record<string, any>): Promise<PaginatedResponse<ExpenseItem>> =>
    apiClient.get('/finance/expenses/items/', { params }),

  get: (id: string): Promise<ExpenseItem> =>
    apiClient.get(`/finance/expenses/items/${id}/`),

  create: (data: Partial<ExpenseItem>): Promise<ExpenseItem> =>
    apiClient.post('/finance/expenses/items/', data),

  update: (id: string, data: Partial<ExpenseItem>): Promise<ExpenseItem> =>
    apiClient.patch(`/finance/expenses/items/${id}/`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/finance/expenses/items/${id}/`),
}

// API Methods - Expense Advances
export const expenseAdvanceApi = {
  list: (params?: Record<string, any>): Promise<PaginatedResponse<ExpenseAdvanceListItem>> =>
    apiClient.get('/finance/expenses/advances/', { params }),

  get: (id: string): Promise<ExpenseAdvance> =>
    apiClient.get(`/finance/expenses/advances/${id}/`),

  create: (data: ExpenseAdvanceCreate): Promise<ExpenseAdvance> =>
    apiClient.post('/finance/expenses/advances/', data),

  update: (id: string, data: Partial<ExpenseAdvanceCreate>): Promise<ExpenseAdvance> =>
    apiClient.patch(`/finance/expenses/advances/${id}/`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/finance/expenses/advances/${id}/`),

  // Workflow actions
  approve: (id: string): Promise<{ status: string }> =>
    apiClient.post(`/finance/expenses/advances/${id}/approve/`),

  reject: (id: string, data: { reason?: string }): Promise<{ status: string }> =>
    apiClient.post(`/finance/expenses/advances/${id}/reject/`, data),

  disburse: (id: string): Promise<{ status: string }> =>
    apiClient.post(`/finance/expenses/advances/${id}/disburse/`),

  settle: (id: string, data: ExpenseAdvanceSettleData): Promise<{ status: string; balance: number }> =>
    apiClient.post(`/finance/expenses/advances/${id}/settle/`, data),
}

// Helper functions
export const getExpenseStatusColor = (status: ExpenseStatus): string => {
  const colors: Record<ExpenseStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    processing: 'bg-purple-100 text-purple-800',
    paid: 'bg-teal-100 text-teal-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getAdvanceStatusColor = (status: AdvanceStatus): string => {
  const colors: Record<AdvanceStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    disbursed: 'bg-blue-100 text-blue-800',
    settled: 'bg-teal-100 text-teal-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
