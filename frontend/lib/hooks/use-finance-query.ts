/**
 * TanStack Query hooks for Finance module
 * Expense Requests, Advances, Settlements
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  expenseRequestApi,
  expenseAdvanceApi,
  type ExpenseRequestListItem,
  type ExpenseRequest,
  type ExpenseRequestCreate,
  type ExpenseRequestUpdate,
  type ExpenseApprovalData,
  type ExpenseRejectData,
  type ExpenseAdvanceListItem,
  type ExpenseAdvance,
  type ExpenseAdvanceCreate,
  type ExpenseAdvanceSettleData,
} from '@/lib/api/finance'

// ============================================================================
// Query Keys
// ============================================================================

export const financeKeys = {
  expenseRequests: {
    all: ['expense-requests'] as const,
    lists: () => [...financeKeys.expenseRequests.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...financeKeys.expenseRequests.lists(), params] as const,
    details: () => [...financeKeys.expenseRequests.all, 'detail'] as const,
    detail: (id: string) => [...financeKeys.expenseRequests.details(), id] as const,
    pendingApproval: () => [...financeKeys.expenseRequests.all, 'pending-approval'] as const,
    summary: (params?: Record<string, any>) => [...financeKeys.expenseRequests.all, 'summary', params] as const,
  },
  advances: {
    all: ['expense-advances'] as const,
    lists: () => [...financeKeys.advances.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...financeKeys.advances.lists(), params] as const,
    details: () => [...financeKeys.advances.all, 'detail'] as const,
    detail: (id: string) => [...financeKeys.advances.details(), id] as const,
  },
}

// ============================================================================
// Expense Requests
// ============================================================================

export interface ExpenseRequestQueryParams {
  page?: number
  page_size?: number
  search?: string
  status?: string
  requester?: string
  department?: string
  date_from?: string
  date_to?: string
  ordering?: string
}

export function useExpenseRequests(params: ExpenseRequestQueryParams = {}) {
  return useQuery({
    queryKey: financeKeys.expenseRequests.list(params),
    queryFn: async () => {
      const response = await expenseRequestApi.list(params)
      return {
        results: response.results,
        count: response.count,
        pageCount: params.page_size
          ? Math.ceil(response.count / params.page_size)
          : 1,
      }
    },
  })
}

export function useExpenseRequest(id: string) {
  return useQuery({
    queryKey: financeKeys.expenseRequests.detail(id),
    queryFn: () => expenseRequestApi.get(id),
    enabled: !!id,
  })
}

export function useCreateExpenseRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ExpenseRequestCreate) => expenseRequestApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.lists() })
    },
  })
}

export function useUpdateExpenseRequest(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ExpenseRequestUpdate) => expenseRequestApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.detail(id) })
    },
  })
}

export function useDeleteExpenseRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => expenseRequestApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.lists() })
    },
  })
}

// Workflow Actions
export function useSubmitExpenseRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => expenseRequestApi.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.detail(id) })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.pendingApproval() })
    },
  })
}

export function useApproveExpenseRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseApprovalData }) =>
      expenseRequestApi.approve(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.detail(id) })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.pendingApproval() })
    },
  })
}

export function useRejectExpenseRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseRejectData }) =>
      expenseRequestApi.reject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.detail(id) })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.pendingApproval() })
    },
  })
}

export function useProcessPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      expenseRequestApi.processPayment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.detail(id) })
    },
  })
}

export function useMarkPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      expenseRequestApi.markPaid(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.detail(id) })
    },
  })
}

export function useCancelExpenseRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => expenseRequestApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.expenseRequests.detail(id) })
    },
  })
}

// Custom endpoints
export function usePendingApprovalRequests() {
  return useQuery({
    queryKey: financeKeys.expenseRequests.pendingApproval(),
    queryFn: () => expenseRequestApi.pendingApproval(),
  })
}

export function useExpenseRequestSummary(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: financeKeys.expenseRequests.summary(params),
    queryFn: () => expenseRequestApi.summary(params),
  })
}

// ============================================================================
// Expense Advances
// ============================================================================

export interface ExpenseAdvanceQueryParams {
  page?: number
  page_size?: number
  search?: string
  status?: string
  requester?: string
  ordering?: string
}

export function useExpenseAdvances(params: ExpenseAdvanceQueryParams = {}) {
  return useQuery({
    queryKey: financeKeys.advances.list(params),
    queryFn: async () => {
      const response = await expenseAdvanceApi.list(params)
      return {
        results: response.results,
        count: response.count,
        pageCount: params.page_size
          ? Math.ceil(response.count / params.page_size)
          : 1,
      }
    },
  })
}

export function useExpenseAdvance(id: string) {
  return useQuery({
    queryKey: financeKeys.advances.detail(id),
    queryFn: () => expenseAdvanceApi.get(id),
    enabled: !!id,
  })
}

export function useCreateExpenseAdvance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ExpenseAdvanceCreate) => expenseAdvanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.lists() })
    },
  })
}

export function useUpdateExpenseAdvance(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ExpenseAdvanceCreate>) => expenseAdvanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.detail(id) })
    },
  })
}

export function useDeleteExpenseAdvance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => expenseAdvanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.lists() })
    },
  })
}

// Workflow Actions
export function useApproveAdvance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => expenseAdvanceApi.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.detail(id) })
    },
  })
}

export function useRejectAdvance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reason?: string } }) =>
      expenseAdvanceApi.reject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.detail(id) })
    },
  })
}

export function useDisburseAdvance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => expenseAdvanceApi.disburse(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.detail(id) })
    },
  })
}

export function useSettleAdvance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseAdvanceSettleData }) =>
      expenseAdvanceApi.settle(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.lists() })
      queryClient.invalidateQueries({ queryKey: financeKeys.advances.detail(id) })
    },
  })
}
