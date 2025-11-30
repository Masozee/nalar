import { apiClient } from './client'

// ==================== SKU MANAGEMENT ====================

export type ItemCategory =
  | 'office_supplies'
  | 'it_equipment'
  | 'furniture'
  | 'consumables'
  | 'maintenance'
  | 'cleaning'
  | 'pantry'
  | 'safety'
  | 'other'

export type UnitOfMeasure =
  | 'pcs'
  | 'unit'
  | 'box'
  | 'pack'
  | 'rim'
  | 'roll'
  | 'set'
  | 'liter'
  | 'kg'
  | 'meter'
  | 'dozen'
  | 'carton'

export interface SKU {
  id: string
  sku_code: string
  barcode?: string
  name: string
  description: string
  category: ItemCategory
  unit: UnitOfMeasure
  unit_price: number
  minimum_stock: number
  maximum_stock: number
  reorder_point: number
  reorder_quantity: number
  current_stock: number
  default_location?: string
  default_location_name?: string
  brand: string
  model: string
  specifications: Record<string, any>
  is_stockable: boolean
  is_purchasable: boolean
  is_low_stock?: boolean
  needs_reorder?: boolean
  image?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SKUListItem {
  id: string
  sku_code: string
  barcode?: string
  name: string
  category: ItemCategory
  unit: UnitOfMeasure
  unit_price: number
  current_stock: number
  minimum_stock: number
  reorder_point: number
  is_low_stock?: boolean
  needs_reorder?: boolean
  brand: string
  is_active: boolean
}

export interface Warehouse {
  id: string
  code: string
  name: string
  description: string
  address: string
  manager?: string
  manager_name?: string
  phone: string
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StockRecord {
  id: string
  sku: string
  sku_code?: string
  sku_name?: string
  warehouse: string
  warehouse_code?: string
  warehouse_name?: string
  quantity: number
  reserved_quantity: number
  available_quantity?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type MovementType =
  | 'in'
  | 'out'
  | 'adjustment'
  | 'transfer_in'
  | 'transfer_out'
  | 'opname'

export interface StockMovement {
  id: string
  sku: string
  sku_code?: string
  sku_name?: string
  warehouse: string
  warehouse_code?: string
  warehouse_name?: string
  movement_type: MovementType
  quantity: number
  quantity_before: number
  quantity_after: number
  reference_type: string
  reference_id: string
  notes: string
  movement_date: string
  created_at: string
  updated_at: string
}

// ==================== STOCK OPNAME ====================

export type OpnameStatus =
  | 'draft'
  | 'in_progress'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled'

export interface StockOpname {
  id: string
  opname_number: string
  warehouse: string
  warehouse_name?: string
  scheduled_date: string
  start_date?: string
  end_date?: string
  status: OpnameStatus
  category_filter: string
  is_full_count: boolean
  assigned_to?: string
  assigned_to_name?: string
  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  total_items: number
  counted_items: number
  variance_items: number
  total_variance_value: number
  notes: string
  rejection_reason: string
  created_at: string
  updated_at: string
}

export interface OpnameItem {
  id: string
  opname: string
  sku: string
  sku_code?: string
  sku_name?: string
  system_quantity: number
  counted_quantity?: number
  variance: number
  variance_value: number
  notes: string
  is_counted: boolean
  counted_by?: string
  counted_by_name?: string
  counted_at?: string
}

// ==================== STOCK TRANSFER ====================

export type TransferStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'partial'
  | 'received'
  | 'cancelled'

export type TransferPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'

export interface StockTransfer {
  id: string
  transfer_number: string
  source_warehouse: string
  source_warehouse_name?: string
  destination_warehouse: string
  destination_warehouse_name?: string
  status: TransferStatus
  priority: TransferPriority
  requested_date: string
  expected_date?: string
  shipped_date?: string
  received_date?: string
  requested_by?: string
  requested_by_name?: string
  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  shipped_by?: string
  shipped_by_name?: string
  received_by?: string
  received_by_name?: string
  reason: string
  notes: string
  rejection_reason: string
  total_items: number
  total_quantity: number
  created_at: string
  updated_at: string
}

export interface TransferItem {
  id: string
  transfer: string
  sku: string
  sku_code?: string
  sku_name?: string
  requested_quantity: number
  sent_quantity?: number
  received_quantity?: number
  notes: string
}

// ==================== API METHODS ====================

export const skuApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: SKUListItem[], count: number }>('/inventory/sku/skus/', params),

  get: (id: string) =>
    apiClient.get<SKU>(`/inventory/sku/skus/${id}/`),

  create: (data: Partial<SKU>) =>
    apiClient.post<SKU>('/inventory/sku/skus/', data),

  update: (id: string, data: Partial<SKU>) =>
    apiClient.patch<SKU>(`/inventory/sku/skus/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/inventory/sku/skus/${id}/`),

  lowStock: () =>
    apiClient.get<SKUListItem[]>('/inventory/sku/skus/low_stock/'),

  needsReorder: () =>
    apiClient.get<SKUListItem[]>('/inventory/sku/skus/needs_reorder/'),

  stockByWarehouse: (id: string) =>
    apiClient.get<StockRecord[]>(`/inventory/sku/skus/${id}/stock_by_warehouse/`),

  movements: (id: string) =>
    apiClient.get<StockMovement[]>(`/inventory/sku/skus/${id}/movements/`),

  adjustStock: (data: { sku_id: string, warehouse_id: string, adjustment_quantity: number, reason: string }) =>
    apiClient.post('/inventory/sku/skus/adjust_stock/', data),
}

export const warehouseApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: Warehouse[], count: number }>('/inventory/sku/warehouses/', params),

  get: (id: string) =>
    apiClient.get<Warehouse>(`/inventory/sku/warehouses/${id}/`),

  create: (data: Partial<Warehouse>) =>
    apiClient.post<Warehouse>('/inventory/sku/warehouses/', data),

  update: (id: string, data: Partial<Warehouse>) =>
    apiClient.patch<Warehouse>(`/inventory/sku/warehouses/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/inventory/sku/warehouses/${id}/`),

  default: () =>
    apiClient.get<Warehouse>('/inventory/sku/warehouses/default/'),
}

export const stockRecordApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: StockRecord[], count: number }>('/inventory/sku/stock-records/', params),

  get: (id: string) =>
    apiClient.get<StockRecord>(`/inventory/sku/stock-records/${id}/`),
}

export const stockMovementApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: StockMovement[], count: number }>('/inventory/sku/movements/', params),

  get: (id: string) =>
    apiClient.get<StockMovement>(`/inventory/sku/movements/${id}/`),
}

export const stockOpnameApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: StockOpname[], count: number }>('/inventory/opname/opnames/', params),

  get: (id: string) =>
    apiClient.get<StockOpname>(`/inventory/opname/opnames/${id}/`),

  create: (data: Partial<StockOpname>) =>
    apiClient.post<StockOpname>('/inventory/opname/opnames/', data),

  update: (id: string, data: Partial<StockOpname>) =>
    apiClient.patch<StockOpname>(`/inventory/opname/opnames/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/inventory/opname/opnames/${id}/`),

  start: (id: string) =>
    apiClient.post<StockOpname>(`/inventory/opname/opnames/${id}/start/`, {}),

  submit: (id: string) =>
    apiClient.post<StockOpname>(`/inventory/opname/opnames/${id}/submit/`, {}),

  approve: (id: string) =>
    apiClient.post<StockOpname>(`/inventory/opname/opnames/${id}/approve/`, {}),

  reject: (id: string, reason: string) =>
    apiClient.post<StockOpname>(`/inventory/opname/opnames/${id}/reject/`, { reason }),

  complete: (id: string) =>
    apiClient.post<StockOpname>(`/inventory/opname/opnames/${id}/complete/`, {}),

  cancel: (id: string) =>
    apiClient.post<StockOpname>(`/inventory/opname/opnames/${id}/cancel/`, {}),

  items: (id: string) =>
    apiClient.get<OpnameItem[]>(`/inventory/opname/opnames/${id}/items/`),
}

export const stockTransferApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: StockTransfer[], count: number }>('/inventory/transfer/transfers/', params),

  get: (id: string) =>
    apiClient.get<StockTransfer>(`/inventory/transfer/transfers/${id}/`),

  create: (data: Partial<StockTransfer>) =>
    apiClient.post<StockTransfer>('/inventory/transfer/transfers/', data),

  update: (id: string, data: Partial<StockTransfer>) =>
    apiClient.patch<StockTransfer>(`/inventory/transfer/transfers/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/inventory/transfer/transfers/${id}/`),

  submit: (id: string) =>
    apiClient.post<StockTransfer>(`/inventory/transfer/transfers/${id}/submit/`, {}),

  approve: (id: string) =>
    apiClient.post<StockTransfer>(`/inventory/transfer/transfers/${id}/approve/`, {}),

  reject: (id: string, reason: string) =>
    apiClient.post<StockTransfer>(`/inventory/transfer/transfers/${id}/reject/`, { reason }),

  ship: (id: string) =>
    apiClient.post<StockTransfer>(`/inventory/transfer/transfers/${id}/ship/`, {}),

  receive: (id: string, items: { item_id: string, received_quantity: number }[]) =>
    apiClient.post<StockTransfer>(`/inventory/transfer/transfers/${id}/receive/`, { items }),

  cancel: (id: string) =>
    apiClient.post<StockTransfer>(`/inventory/transfer/transfers/${id}/cancel/`, {}),

  items: (id: string) =>
    apiClient.get<TransferItem[]>(`/inventory/transfer/transfers/${id}/items/`),
}
