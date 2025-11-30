/**
 * TanStack Query hooks for Procurement module
 * Vendors, Purchase Orders, Goods Receipts, Vendor Evaluations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  vendorApi,
  purchaseOrderApi,
  poReceiptApi,
  vendorEvaluationApi,
  type Vendor,
  type VendorListItem,
  type PurchaseOrder,
  type POListItem,
  type POReceipt,
  type VendorEvaluation,
  type POApprovalData,
} from '@/lib/api/procurement'

// ============================================================================
// Query Keys
// ============================================================================

export const procurementKeys = {
  // Vendors
  vendors: {
    all: ['vendors'] as const,
    lists: () => [...procurementKeys.vendors.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...procurementKeys.vendors.lists(), params] as const,
    details: () => [...procurementKeys.vendors.all, 'detail'] as const,
    detail: (id: string) => [...procurementKeys.vendors.details(), id] as const,
    active: () => [...procurementKeys.vendors.all, 'active'] as const,
    evaluations: (id: string) => [...procurementKeys.vendors.detail(id), 'evaluations'] as const,
    purchaseOrders: (id: string) => [...procurementKeys.vendors.detail(id), 'purchase-orders'] as const,
  },

  // Purchase Orders
  purchaseOrders: {
    all: ['purchase-orders'] as const,
    lists: () => [...procurementKeys.purchaseOrders.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...procurementKeys.purchaseOrders.lists(), params] as const,
    details: () => [...procurementKeys.purchaseOrders.all, 'detail'] as const,
    detail: (id: string) => [...procurementKeys.purchaseOrders.details(), id] as const,
    receipts: (id: string) => [...procurementKeys.purchaseOrders.detail(id), 'receipts'] as const,
    myRequests: () => [...procurementKeys.purchaseOrders.all, 'my-requests'] as const,
    pendingApproval: () => [...procurementKeys.purchaseOrders.all, 'pending-approval'] as const,
    statistics: () => [...procurementKeys.purchaseOrders.all, 'statistics'] as const,
  },

  // Receipts
  receipts: {
    all: ['po-receipts'] as const,
    lists: () => [...procurementKeys.receipts.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...procurementKeys.receipts.lists(), params] as const,
    details: () => [...procurementKeys.receipts.all, 'detail'] as const,
    detail: (id: string) => [...procurementKeys.receipts.details(), id] as const,
  },

  // Vendor Evaluations
  evaluations: {
    all: ['vendor-evaluations'] as const,
    lists: () => [...procurementKeys.evaluations.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...procurementKeys.evaluations.lists(), params] as const,
    details: () => [...procurementKeys.evaluations.all, 'detail'] as const,
    detail: (id: string) => [...procurementKeys.evaluations.details(), id] as const,
  },
}

// ============================================================================
// Vendors
// ============================================================================

export interface VendorQueryParams {
  page?: number
  page_size?: number
  search?: string
  category?: string
  status?: string
  vendor_type?: string
  ordering?: string
}

export function useVendors(params: VendorQueryParams = {}) {
  return useQuery({
    queryKey: procurementKeys.vendors.list(params),
    queryFn: async () => {
      const response = await vendorApi.list(params)
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

export function useVendor(id: string) {
  return useQuery({
    queryKey: procurementKeys.vendors.detail(id),
    queryFn: () => vendorApi.get(id),
    enabled: !!id,
  })
}

export function useActiveVendors() {
  return useQuery({
    queryKey: procurementKeys.vendors.active(),
    queryFn: () => vendorApi.active(),
  })
}

export function useVendorEvaluationsForVendor(vendorId: string) {
  return useQuery({
    queryKey: procurementKeys.vendors.evaluations(vendorId),
    queryFn: () => vendorApi.evaluations(vendorId),
    enabled: !!vendorId,
  })
}

export function useVendorPurchaseOrders(vendorId: string) {
  return useQuery({
    queryKey: procurementKeys.vendors.purchaseOrders(vendorId),
    queryFn: () => vendorApi.purchaseOrders(vendorId),
    enabled: !!vendorId,
  })
}

export function useCreateVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Vendor>) => vendorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.active() })
    },
  })
}

export function useUpdateVendor(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Vendor>) => vendorApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.detail(id) })
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.active() })
    },
  })
}

export function useDeleteVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vendorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.active() })
    },
  })
}

// Vendor Workflow Actions
export function useActivateVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vendorApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.detail(id) })
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.active() })
    },
  })
}

export function useBlacklistVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      vendorApi.blacklist(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.detail(id) })
      queryClient.invalidateQueries({ queryKey: procurementKeys.vendors.active() })
    },
  })
}

// ============================================================================
// Purchase Orders
// ============================================================================

export interface PurchaseOrderQueryParams {
  page?: number
  page_size?: number
  search?: string
  status?: string
  priority?: string
  vendor?: string
  department?: string
  date_from?: string
  date_to?: string
  ordering?: string
}

export function usePurchaseOrders(params: PurchaseOrderQueryParams = {}) {
  return useQuery({
    queryKey: procurementKeys.purchaseOrders.list(params),
    queryFn: async () => {
      const response = await purchaseOrderApi.list(params)
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

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: procurementKeys.purchaseOrders.detail(id),
    queryFn: () => purchaseOrderApi.get(id),
    enabled: !!id,
  })
}

export function usePOReceiptsForOrder(poId: string) {
  return useQuery({
    queryKey: procurementKeys.purchaseOrders.receipts(poId),
    queryFn: () => purchaseOrderApi.receipts(poId),
    enabled: !!poId,
  })
}

export function useMyPORequests() {
  return useQuery({
    queryKey: procurementKeys.purchaseOrders.myRequests(),
    queryFn: () => purchaseOrderApi.myRequests(),
  })
}

export function usePendingPOApproval() {
  return useQuery({
    queryKey: procurementKeys.purchaseOrders.pendingApproval(),
    queryFn: () => purchaseOrderApi.pendingApproval(),
  })
}

// Alias for consistency with naming convention
export const usePendingApprovalPOs = usePendingPOApproval

export function usePOStatistics() {
  return useQuery({
    queryKey: procurementKeys.purchaseOrders.statistics(),
    queryFn: () => purchaseOrderApi.statistics(),
  })
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PurchaseOrder>) => purchaseOrderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.myRequests() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.statistics() })
    },
  })
}

export function useUpdatePurchaseOrder(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PurchaseOrder>) => purchaseOrderApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.detail(id) })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.statistics() })
    },
  })
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.myRequests() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.statistics() })
    },
  })
}

// Purchase Order Workflow Actions
export function useSubmitPO() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.detail(id) })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.pendingApproval() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.statistics() })
    },
  })
}

export function useApprovePO() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: POApprovalData }) =>
      purchaseOrderApi.approve(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.detail(id) })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.pendingApproval() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.statistics() })
    },
  })
}

export function useSendPO() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.send(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.detail(id) })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.statistics() })
    },
  })
}

export function useCancelPO() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      purchaseOrderApi.cancel(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.detail(id) })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.statistics() })
    },
  })
}

export function useClosePO() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.close(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.detail(id) })
      queryClient.invalidateQueries({ queryKey: procurementKeys.purchaseOrders.statistics() })
    },
  })
}

// ============================================================================
// Goods Receipts
// ============================================================================

export interface ReceiptQueryParams {
  page?: number
  page_size?: number
  search?: string
  purchase_order?: string
  date_from?: string
  date_to?: string
  ordering?: string
}

export function usePOReceipts(params: ReceiptQueryParams = {}) {
  return useQuery({
    queryKey: procurementKeys.receipts.list(params),
    queryFn: async () => {
      const response = await poReceiptApi.list(params)
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

export function usePOReceipt(id: string) {
  return useQuery({
    queryKey: procurementKeys.receipts.detail(id),
    queryFn: () => poReceiptApi.get(id),
    enabled: !!id,
  })
}

export function useCreatePOReceipt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<POReceipt>) => poReceiptApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.receipts.lists() })
      if (data.purchase_order) {
        queryClient.invalidateQueries({
          queryKey: procurementKeys.purchaseOrders.receipts(data.purchase_order)
        })
        queryClient.invalidateQueries({
          queryKey: procurementKeys.purchaseOrders.detail(data.purchase_order)
        })
      }
    },
  })
}

export function useUpdatePOReceipt(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<POReceipt>) => poReceiptApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.receipts.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.receipts.detail(id) })
      if (data.purchase_order) {
        queryClient.invalidateQueries({
          queryKey: procurementKeys.purchaseOrders.receipts(data.purchase_order)
        })
      }
    },
  })
}

export function useDeletePOReceipt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => poReceiptApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.receipts.lists() })
    },
  })
}

// ============================================================================
// Vendor Evaluations
// ============================================================================

export interface VendorEvaluationQueryParams {
  page?: number
  page_size?: number
  search?: string
  vendor?: string
  date_from?: string
  date_to?: string
  ordering?: string
}

export function useVendorEvaluations(params: VendorEvaluationQueryParams = {}) {
  return useQuery({
    queryKey: procurementKeys.evaluations.list(params),
    queryFn: async () => {
      const response = await vendorEvaluationApi.list(params)
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

export function useVendorEvaluation(id: string) {
  return useQuery({
    queryKey: procurementKeys.evaluations.detail(id),
    queryFn: () => vendorEvaluationApi.get(id),
    enabled: !!id,
  })
}

export function useCreateVendorEvaluation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<VendorEvaluation>) => vendorEvaluationApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.evaluations.lists() })
      if (data.vendor) {
        queryClient.invalidateQueries({
          queryKey: procurementKeys.vendors.evaluations(data.vendor)
        })
        queryClient.invalidateQueries({
          queryKey: procurementKeys.vendors.detail(data.vendor)
        })
      }
    },
  })
}

export function useUpdateVendorEvaluation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<VendorEvaluation>) => vendorEvaluationApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.evaluations.lists() })
      queryClient.invalidateQueries({ queryKey: procurementKeys.evaluations.detail(id) })
      if (data.vendor) {
        queryClient.invalidateQueries({
          queryKey: procurementKeys.vendors.evaluations(data.vendor)
        })
      }
    },
  })
}

export function useDeleteVendorEvaluation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vendorEvaluationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.evaluations.lists() })
    },
  })
}
