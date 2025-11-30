import { apiClient } from './client'

// ==================== ASSET MAINTENANCE ====================

export type AssetCategory =
  | 'it_equipment'
  | 'furniture'
  | 'vehicle'
  | 'office_equipment'
  | 'building'
  | 'land'
  | 'other'

export type AssetStatus =
  | 'active'
  | 'maintenance'
  | 'repair'
  | 'retired'
  | 'lost'
  | 'damaged'

export type MaintenanceType =
  | 'preventive'
  | 'corrective'
  | 'inspection'

export type MaintenanceStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'pending_parts'

export interface Asset {
  id: string
  asset_code: string
  name: string
  description: string
  category: AssetCategory
  status: AssetStatus

  // Purchase Info
  brand?: string
  model?: string
  serial_number?: string
  purchase_date?: string
  purchase_price?: number
  supplier?: string
  invoice_number?: string

  // Warranty
  warranty_expiry?: string
  warranty_info?: string

  // Location & Assignment
  location?: string
  department?: string
  current_holder?: {
    id: string
    email: string
    full_name: string
  }

  // Depreciation
  depreciation_method?: string
  depreciation_rate?: number
  useful_life_years?: number
  current_value?: number

  // Metadata
  specifications?: Record<string, any>
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AssetListItem {
  id: string
  asset_code: string
  name: string
  category: AssetCategory
  status: AssetStatus
  brand?: string
  model?: string
  location?: string
  department?: string
  current_holder?: {
    id: string
    email: string
    full_name: string
  }
  purchase_date?: string
  purchase_price?: number
  current_value?: number
  is_active: boolean
}

export interface MaintenanceSchedule {
  id: string
  asset: string
  asset_name?: string
  asset_code?: string
  title: string
  description: string
  maintenance_type: MaintenanceType
  frequency_days: number
  last_performed?: string
  next_due: string
  estimated_duration_hours?: number
  assigned_to?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MaintenanceRecord {
  id: string
  asset: string
  asset_name?: string
  asset_code?: string
  schedule?: string
  title: string
  description: string
  maintenance_type: MaintenanceType
  status: MaintenanceStatus

  // Scheduling
  scheduled_date: string
  started_at?: string
  completed_at?: string

  // Assignment
  assigned_to?: string
  assigned_to_name?: string

  // Vendor
  vendor?: string
  vendor_contact?: string

  // Work Details
  findings?: string
  actions_taken?: string
  parts_replaced?: string

  // Costs
  labor_cost?: number
  parts_cost?: number
  total_cost?: number

  // Metadata
  notes?: string
  attachments?: string[]
  created_at: string
  updated_at: string
}

export interface MaintenanceRecordListItem {
  id: string
  asset: string
  asset_name?: string
  asset_code?: string
  title: string
  maintenance_type: MaintenanceType
  status: MaintenanceStatus
  scheduled_date: string
  completed_at?: string
  vendor?: string
  total_cost?: number
  assigned_to_name?: string
}

// ==================== ASSET ASSIGNMENT ====================

export type AssignmentType =
  | 'permanent'
  | 'temporary'
  | 'project'

export type AssignmentStatus =
  | 'active'
  | 'returned'
  | 'transferred'
  | 'lost'
  | 'damaged'

export interface AssetAssignment {
  id: string
  asset: string
  asset_name?: string
  asset_code?: string
  assigned_to: string
  assigned_to_name?: string
  assignment_type: AssignmentType
  status: AssignmentStatus

  // Dates
  assigned_date: string
  expected_return_date?: string
  actual_return_date?: string

  // Details
  purpose: string
  location: string

  // Condition
  condition_at_assignment: string
  condition_at_return?: string

  // Approval & Return
  approved_by?: string
  approved_by_name?: string
  returned_to?: string
  returned_to_name?: string

  notes: string
  created_at: string
  updated_at: string
}

export interface AssetAssignmentListItem {
  id: string
  asset: string
  asset_name?: string
  asset_code?: string
  assigned_to: string
  assigned_to_name?: string
  assignment_type: AssignmentType
  status: AssignmentStatus
  assigned_date: string
  expected_return_date?: string
  purpose: string
}

export interface AssetTransfer {
  id: string
  asset: string
  asset_name?: string
  asset_code?: string
  from_user: string
  from_user_name?: string
  to_user: string
  to_user_name?: string
  transfer_date: string
  reason: string
  condition: string
  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  notes: string
  created_at: string
  updated_at: string
}

export interface AssetCheckout {
  id: string
  asset: string
  asset_name?: string
  asset_code?: string
  checked_out_by: string
  checked_out_by_name?: string
  checkout_time: string
  expected_return_time: string
  actual_return_time?: string
  purpose: string
  location: string
  is_returned: boolean
  is_overdue?: boolean
  returned_to?: string
  returned_to_name?: string
  condition_on_return?: string
  notes: string
  created_at: string
  updated_at: string
}

// ==================== API METHODS ====================

export const assetsApi = {
  // Asset CRUD
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: AssetListItem[], count: number }>('/assets/maintenance/assets/', params),

  get: (id: string) =>
    apiClient.get<Asset>(`/assets/maintenance/assets/${id}/`),

  create: (data: Partial<Asset>) =>
    apiClient.post<Asset>('/assets/maintenance/assets/', data),

  update: (id: string, data: Partial<Asset>) =>
    apiClient.patch<Asset>(`/assets/maintenance/assets/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/assets/maintenance/assets/${id}/`),

  // Asset actions
  available: () =>
    apiClient.get<AssetListItem[]>('/assets/maintenance/assets/available/'),

  warrantyExpiring: () =>
    apiClient.get<AssetListItem[]>('/assets/maintenance/assets/warranty_expiring/'),

  byCategory: () =>
    apiClient.get<{ category: AssetCategory, count: number }[]>('/assets/maintenance/assets/by_category/'),

  statistics: () =>
    apiClient.get<{
      total: number
      by_status: { status: AssetStatus, count: number }[]
      by_category: { category: AssetCategory, count: number }[]
      total_purchase_value: number
    }>('/assets/maintenance/assets/statistics/'),
}

export const maintenanceSchedulesApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: MaintenanceSchedule[], count: number }>('/assets/maintenance/schedules/', params),

  get: (id: string) =>
    apiClient.get<MaintenanceSchedule>(`/assets/maintenance/schedules/${id}/`),

  create: (data: Partial<MaintenanceSchedule>) =>
    apiClient.post<MaintenanceSchedule>('/assets/maintenance/schedules/', data),

  update: (id: string, data: Partial<MaintenanceSchedule>) =>
    apiClient.patch<MaintenanceSchedule>(`/assets/maintenance/schedules/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/assets/maintenance/schedules/${id}/`),

  dueSoon: () =>
    apiClient.get<MaintenanceSchedule[]>('/assets/maintenance/schedules/due_soon/'),

  overdue: () =>
    apiClient.get<MaintenanceSchedule[]>('/assets/maintenance/schedules/overdue/'),
}

export const maintenanceRecordsApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: MaintenanceRecordListItem[], count: number }>('/assets/maintenance/records/', params),

  get: (id: string) =>
    apiClient.get<MaintenanceRecord>(`/assets/maintenance/records/${id}/`),

  create: (data: Partial<MaintenanceRecord>) =>
    apiClient.post<MaintenanceRecord>('/assets/maintenance/records/', data),

  update: (id: string, data: Partial<MaintenanceRecord>) =>
    apiClient.patch<MaintenanceRecord>(`/assets/maintenance/records/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/assets/maintenance/records/${id}/`),

  start: (id: string) =>
    apiClient.post<MaintenanceRecord>(`/assets/maintenance/records/${id}/start/`, {}),

  complete: (id: string, data: { findings?: string, actions_taken?: string, parts_replaced?: string }) =>
    apiClient.post<MaintenanceRecord>(`/assets/maintenance/records/${id}/complete/`, data),

  pending: () =>
    apiClient.get<MaintenanceRecordListItem[]>('/assets/maintenance/records/pending/'),

  costSummary: () =>
    apiClient.get<{
      monthly: { month: string, total_cost: number, count: number }[]
      by_type: { maintenance_type: MaintenanceType, total_cost: number, count: number }[]
    }>('/assets/maintenance/records/cost_summary/'),
}

export const assetAssignmentsApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: AssetAssignmentListItem[], count: number }>('/assets/assignment/assignments/', params),

  get: (id: string) =>
    apiClient.get<AssetAssignment>(`/assets/assignment/assignments/${id}/`),

  create: (data: Partial<AssetAssignment>) =>
    apiClient.post<AssetAssignment>('/assets/assignment/assignments/', data),

  update: (id: string, data: Partial<AssetAssignment>) =>
    apiClient.patch<AssetAssignment>(`/assets/assignment/assignments/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/assets/assignment/assignments/${id}/`),

  myAssets: () =>
    apiClient.get<AssetAssignmentListItem[]>('/assets/assignment/assignments/my_assets/'),

  overdueReturns: () =>
    apiClient.get<AssetAssignmentListItem[]>('/assets/assignment/assignments/overdue_returns/'),

  returnAsset: (id: string, data: { condition_on_return?: string, notes?: string }) =>
    apiClient.post<AssetAssignment>(`/assets/assignment/assignments/${id}/return_asset/`, data),
}

export const assetTransfersApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: AssetTransfer[], count: number }>('/assets/assignment/transfers/', params),

  get: (id: string) =>
    apiClient.get<AssetTransfer>(`/assets/assignment/transfers/${id}/`),

  create: (data: Partial<AssetTransfer>) =>
    apiClient.post<AssetTransfer>('/assets/assignment/transfers/', data),

  update: (id: string, data: Partial<AssetTransfer>) =>
    apiClient.patch<AssetTransfer>(`/assets/assignment/transfers/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/assets/assignment/transfers/${id}/`),

  approve: (id: string) =>
    apiClient.post<AssetTransfer>(`/assets/assignment/transfers/${id}/approve/`, {}),
}

export const assetCheckoutsApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: AssetCheckout[], count: number }>('/assets/assignment/checkouts/', params),

  get: (id: string) =>
    apiClient.get<AssetCheckout>(`/assets/assignment/checkouts/${id}/`),

  create: (data: Partial<AssetCheckout>) =>
    apiClient.post<AssetCheckout>('/assets/assignment/checkouts/', data),

  update: (id: string, data: Partial<AssetCheckout>) =>
    apiClient.patch<AssetCheckout>(`/assets/assignment/checkouts/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/assets/assignment/checkouts/${id}/`),

  myCheckouts: () =>
    apiClient.get<AssetCheckout[]>('/assets/assignment/checkouts/my_checkouts/'),

  active: () =>
    apiClient.get<AssetCheckout[]>('/assets/assignment/checkouts/active/'),

  overdue: () =>
    apiClient.get<AssetCheckout[]>('/assets/assignment/checkouts/overdue/'),

  returnItem: (id: string, data: { condition_on_return?: string, notes?: string }) =>
    apiClient.post<AssetCheckout>(`/assets/assignment/checkouts/${id}/return_item/`, data),
}
