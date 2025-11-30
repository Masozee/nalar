/**
 * TanStack Query hooks for Inventory module
 * SKU, Warehouses, Stock Records, Stock Transfers, Stock Adjustments, Physical Counts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  skuApi,
  warehouseApi,
  stockRecordApi,
  stockMovementApi,
  stockTransferApi,
  stockOpnameApi,
  type SKU,
  type SKUListItem,
  type Warehouse,
  type StockRecord,
  type StockMovement,
  type StockTransfer,
  type StockOpname,
} from '@/lib/api/inventory'

// ============================================================================
// Query Keys
// ============================================================================

export const inventoryKeys = {
  // SKU
  skus: {
    all: ['skus'] as const,
    lists: () => [...inventoryKeys.skus.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...inventoryKeys.skus.lists(), params] as const,
    details: () => [...inventoryKeys.skus.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.skus.details(), id] as const,
    lowStock: () => [...inventoryKeys.skus.all, 'low-stock'] as const,
    needsReorder: () => [...inventoryKeys.skus.all, 'needs-reorder'] as const,
    stockByWarehouse: (id: string) => [...inventoryKeys.skus.detail(id), 'stock-by-warehouse'] as const,
    movements: (id: string) => [...inventoryKeys.skus.detail(id), 'movements'] as const,
  },

  // Warehouses
  warehouses: {
    all: ['warehouses'] as const,
    lists: () => [...inventoryKeys.warehouses.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...inventoryKeys.warehouses.lists(), params] as const,
    details: () => [...inventoryKeys.warehouses.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.warehouses.details(), id] as const,
    default: () => [...inventoryKeys.warehouses.all, 'default'] as const,
  },

  // Stock Records
  stockRecords: {
    all: ['stock-records'] as const,
    lists: () => [...inventoryKeys.stockRecords.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...inventoryKeys.stockRecords.lists(), params] as const,
    details: () => [...inventoryKeys.stockRecords.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.stockRecords.details(), id] as const,
  },

  // Stock Movements
  movements: {
    all: ['stock-movements'] as const,
    lists: () => [...inventoryKeys.movements.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...inventoryKeys.movements.lists(), params] as const,
    details: () => [...inventoryKeys.movements.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.movements.details(), id] as const,
  },

  // Stock Transfers
  transfers: {
    all: ['stock-transfers'] as const,
    lists: () => [...inventoryKeys.transfers.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...inventoryKeys.transfers.lists(), params] as const,
    details: () => [...inventoryKeys.transfers.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.transfers.details(), id] as const,
    items: (id: string) => [...inventoryKeys.transfers.detail(id), 'items'] as const,
  },

  // Stock Opname (Physical Count)
  opnames: {
    all: ['stock-opnames'] as const,
    lists: () => [...inventoryKeys.opnames.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...inventoryKeys.opnames.lists(), params] as const,
    details: () => [...inventoryKeys.opnames.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.opnames.details(), id] as const,
    items: (id: string) => [...inventoryKeys.opnames.detail(id), 'items'] as const,
  },
}

// ============================================================================
// SKU
// ============================================================================

export interface SKUQueryParams {
  page?: number
  page_size?: number
  search?: string
  category?: string
  is_active?: boolean
  is_low_stock?: boolean
  needs_reorder?: boolean
  ordering?: string
}

export function useSKUs(params: SKUQueryParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.skus.list(params),
    queryFn: async () => {
      const response = await skuApi.list(params)
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

export function useSKU(id: string) {
  return useQuery({
    queryKey: inventoryKeys.skus.detail(id),
    queryFn: () => skuApi.get(id),
    enabled: !!id,
  })
}

export function useLowStockSKUs() {
  return useQuery({
    queryKey: inventoryKeys.skus.lowStock(),
    queryFn: () => skuApi.lowStock(),
  })
}

export function useNeedsReorderSKUs() {
  return useQuery({
    queryKey: inventoryKeys.skus.needsReorder(),
    queryFn: () => skuApi.needsReorder(),
  })
}

export function useSKUStockByWarehouse(skuId: string) {
  return useQuery({
    queryKey: inventoryKeys.skus.stockByWarehouse(skuId),
    queryFn: () => skuApi.stockByWarehouse(skuId),
    enabled: !!skuId,
  })
}

export function useSKUMovements(skuId: string) {
  return useQuery({
    queryKey: inventoryKeys.skus.movements(skuId),
    queryFn: () => skuApi.movements(skuId),
    enabled: !!skuId,
  })
}

export function useCreateSKU() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<SKU>) => skuApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.lowStock() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.needsReorder() })
    },
  })
}

export function useUpdateSKU(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<SKU>) => skuApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.detail(id) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.lowStock() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.needsReorder() })
    },
  })
}

export function useDeleteSKU() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => skuApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.lowStock() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.needsReorder() })
    },
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      sku_id: string
      warehouse_id: string
      adjustment_quantity: number
      reason: string
    }) => skuApi.adjustStock(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.detail(variables.sku_id) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.stockByWarehouse(variables.sku_id) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.movements(variables.sku_id) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockRecords.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.lowStock() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.needsReorder() })
    },
  })
}

// ============================================================================
// Warehouses
// ============================================================================

export interface WarehouseQueryParams {
  page?: number
  page_size?: number
  search?: string
  is_active?: boolean
  ordering?: string
}

export function useWarehouses(params: WarehouseQueryParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.warehouses.list(params),
    queryFn: async () => {
      const response = await warehouseApi.list(params)
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

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: inventoryKeys.warehouses.detail(id),
    queryFn: () => warehouseApi.get(id),
    enabled: !!id,
  })
}

export function useDefaultWarehouse() {
  return useQuery({
    queryKey: inventoryKeys.warehouses.default(),
    queryFn: () => warehouseApi.default(),
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Warehouse>) => warehouseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses.default() })
    },
  })
}

export function useUpdateWarehouse(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Warehouse>) => warehouseApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses.detail(id) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses.default() })
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => warehouseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses.default() })
    },
  })
}

// ============================================================================
// Stock Records
// ============================================================================

export interface StockRecordQueryParams {
  page?: number
  page_size?: number
  search?: string
  sku?: string
  warehouse?: string
  ordering?: string
}

export function useStockRecords(params: StockRecordQueryParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.stockRecords.list(params),
    queryFn: async () => {
      const response = await stockRecordApi.list(params)
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

export function useStockRecord(id: string) {
  return useQuery({
    queryKey: inventoryKeys.stockRecords.detail(id),
    queryFn: () => stockRecordApi.get(id),
    enabled: !!id,
  })
}

// ============================================================================
// Stock Movements
// ============================================================================

export interface StockMovementQueryParams {
  page?: number
  page_size?: number
  search?: string
  sku?: string
  warehouse?: string
  movement_type?: string
  date_from?: string
  date_to?: string
  ordering?: string
}

export function useStockMovements(params: StockMovementQueryParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.movements.list(params),
    queryFn: async () => {
      const response = await stockMovementApi.list(params)
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

export function useStockMovement(id: string) {
  return useQuery({
    queryKey: inventoryKeys.movements.detail(id),
    queryFn: () => stockMovementApi.get(id),
    enabled: !!id,
  })
}

// ============================================================================
// Stock Transfers
// ============================================================================

export interface StockTransferQueryParams {
  page?: number
  page_size?: number
  search?: string
  status?: string
  priority?: string
  source_warehouse?: string
  destination_warehouse?: string
  date_from?: string
  date_to?: string
  ordering?: string
}

export function useStockTransfers(params: StockTransferQueryParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.transfers.list(params),
    queryFn: async () => {
      const response = await stockTransferApi.list(params)
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

export function useStockTransfer(id: string) {
  return useQuery({
    queryKey: inventoryKeys.transfers.detail(id),
    queryFn: () => stockTransferApi.get(id),
    enabled: !!id,
  })
}

export function useStockTransferItems(transferId: string) {
  return useQuery({
    queryKey: inventoryKeys.transfers.items(transferId),
    queryFn: () => stockTransferApi.items(transferId),
    enabled: !!transferId,
  })
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<StockTransfer>) => stockTransferApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.lists() })
    },
  })
}

export function useUpdateStockTransfer(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<StockTransfer>) => stockTransferApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.detail(id) })
    },
  })
}

export function useDeleteStockTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockTransferApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.lists() })
    },
  })
}

// Stock Transfer Workflow Actions
export function useSubmitStockTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockTransferApi.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.detail(id) })
    },
  })
}

export function useApproveStockTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockTransferApi.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.detail(id) })
    },
  })
}

export function useRejectStockTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      stockTransferApi.reject(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.detail(id) })
    },
  })
}

export function useShipStockTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockTransferApi.ship(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.detail(id) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockRecords.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements.lists() })
    },
  })
}

export function useReceiveStockTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      items,
    }: {
      id: string
      items: { item_id: string; received_quantity: number }[]
    }) => stockTransferApi.receive(id, items),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.detail(id) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.items(id) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockRecords.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.lists() })
    },
  })
}

export function useCancelStockTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockTransferApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers.detail(id) })
    },
  })
}

// ============================================================================
// Stock Opname (Physical Count)
// ============================================================================

export interface StockOpnameQueryParams {
  page?: number
  page_size?: number
  search?: string
  warehouse?: string
  status?: string
  date_from?: string
  date_to?: string
  ordering?: string
}

export function useStockOpnames(params: StockOpnameQueryParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.opnames.list(params),
    queryFn: async () => {
      const response = await stockOpnameApi.list(params)
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

export function useStockOpname(id: string) {
  return useQuery({
    queryKey: inventoryKeys.opnames.detail(id),
    queryFn: () => stockOpnameApi.get(id),
    enabled: !!id,
  })
}

export function useStockOpnameItems(opnameId: string) {
  return useQuery({
    queryKey: inventoryKeys.opnames.items(opnameId),
    queryFn: () => stockOpnameApi.items(opnameId),
    enabled: !!opnameId,
  })
}

export function useCreateStockOpname() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<StockOpname>) => stockOpnameApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.lists() })
    },
  })
}

export function useUpdateStockOpname(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<StockOpname>) => stockOpnameApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.detail(id) })
    },
  })
}

export function useDeleteStockOpname() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockOpnameApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.lists() })
    },
  })
}

// Stock Opname Workflow Actions
export function useStartStockOpname() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockOpnameApi.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.detail(id) })
    },
  })
}

export function useSubmitStockOpname() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockOpnameApi.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.detail(id) })
    },
  })
}

export function useApproveStockOpname() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockOpnameApi.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.detail(id) })
    },
  })
}

export function useRejectStockOpname() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      stockOpnameApi.reject(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.detail(id) })
    },
  })
}

export function useCompleteStockOpname() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockOpnameApi.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.detail(id) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockRecords.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.skus.lists() })
    },
  })
}

export function useCancelStockOpname() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockOpnameApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames.detail(id) })
    },
  })
}
