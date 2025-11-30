import { apiClient } from './client'

// Enums and Types

export type VendorCategory = 'goods' | 'services' | 'both'
export type VendorStatus = 'active' | 'inactive' | 'blacklisted' | 'pending'
export type VendorType = 'pt' | 'cv' | 'ud' | 'perorangan' | 'koperasi' | 'yayasan' | 'other'

export type POStatus =
  | 'draft' | 'pending_approval' | 'approved' | 'rejected'
  | 'sent' | 'partial' | 'received' | 'cancelled' | 'closed'

export type POPriority = 'low' | 'normal' | 'high' | 'urgent'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

// Vendor Interfaces

export interface Vendor {
  id: string
  code: string
  name: string
  vendor_type: VendorType
  category: VendorCategory
  status: VendorStatus

  // Legal info
  npwp: string
  nib: string
  siup_number: string

  // Contact info
  address: string
  city: string
  province: string
  postal_code: string
  phone: string
  fax: string
  email: string
  website: string

  // Contact person
  contact_person: string
  contact_phone: string
  contact_email: string

  // Banking
  bank_name: string
  bank_branch: string
  bank_account_number: string
  bank_account_name: string

  // Terms
  payment_terms: number
  credit_limit: string

  // Rating
  rating: number
  notes: string
  blacklist_reason: string
  documents: any[]

  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface VendorListItem {
  id: string
  code: string
  name: string
  vendor_type: VendorType
  category: VendorCategory
  status: VendorStatus
  city: string
  phone: string
  email: string
  contact_person: string
  rating: number
  created_at: string
}

export interface VendorContact {
  id: string
  vendor: string
  name: string
  position: string
  phone: string
  email: string
  is_primary: boolean
  notes: string
}

export interface VendorEvaluation {
  id: string
  vendor: string
  vendor_name?: string
  evaluation_date: string
  period_start: string
  period_end: string

  quality_score: number
  delivery_score: number
  price_score: number
  service_score: number
  compliance_score: number
  overall_score: string

  recommendation: string
  evaluator?: string
  evaluator_name?: string
  created_at: string
}

// Purchase Order Interfaces

export interface PurchaseOrder {
  id: string
  po_number: string
  reference_number: string

  vendor: string
  vendor_name?: string

  status: POStatus
  priority: POPriority

  order_date: string
  expected_delivery_date?: string
  actual_delivery_date?: string

  requested_by?: string
  requested_by_name?: string
  department: string

  delivery_address: string
  delivery_notes: string

  currency: string
  subtotal: string
  discount_percent: string
  discount_amount: string
  tax_percent: string
  tax_amount: string
  total_amount: string

  payment_terms: number
  payment_status: PaymentStatus
  paid_amount: string

  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  rejection_reason: string

  terms_conditions: string
  internal_notes: string

  created_at: string
  updated_at: string
}

export interface POListItem {
  id: string
  po_number: string
  vendor_name: string
  order_date: string
  expected_delivery_date?: string
  status: POStatus
  priority: POPriority
  total_amount: string
  payment_status: PaymentStatus
  created_at: string
}

export interface POItem {
  id: string
  purchase_order: string
  line_number: number

  item_code: string
  item_name: string
  description: string
  unit: string

  quantity: string
  received_quantity: string

  unit_price: string
  discount_percent: string
  total_price: string

  notes: string
}

export interface POReceipt {
  id: string
  purchase_order: string
  receipt_number: string
  receipt_date: string

  received_by?: string
  received_by_name?: string

  delivery_note_number: string
  delivery_date?: string

  notes: string
  created_at: string
}

export interface POReceiptItem {
  id: string
  receipt: string
  po_item: string
  quantity_received: string
  quantity_rejected: string
  rejection_reason: string
  notes: string
}

export interface POApprovalData {
  action: 'approve' | 'reject'
  reason?: string
}

// API Response Interface
interface ApiListResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Vendor API
export const vendorApi = {
  list: (params?: Record<string, any>): Promise<ApiListResponse<VendorListItem>> =>
    apiClient.get('/procurement/vendor/vendors/', { params }),

  get: (id: string): Promise<Vendor> =>
    apiClient.get(`/procurement/vendor/vendors/${id}/`),

  create: (data: Partial<Vendor>): Promise<Vendor> =>
    apiClient.post('/procurement/vendor/vendors/', data),

  update: (id: string, data: Partial<Vendor>): Promise<Vendor> =>
    apiClient.patch(`/procurement/vendor/vendors/${id}/`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/procurement/vendor/vendors/${id}/`),

  activate: (id: string): Promise<{ detail: string }> =>
    apiClient.post(`/procurement/vendor/vendors/${id}/activate/`),

  blacklist: (id: string, reason: string): Promise<{ detail: string }> =>
    apiClient.post(`/procurement/vendor/vendors/${id}/blacklist/`, { reason }),

  evaluations: (id: string): Promise<VendorEvaluation[]> =>
    apiClient.get(`/procurement/vendor/vendors/${id}/evaluations/`),

  purchaseOrders: (id: string): Promise<POListItem[]> =>
    apiClient.get(`/procurement/vendor/vendors/${id}/purchase_orders/`),

  active: (): Promise<VendorListItem[]> =>
    apiClient.get('/procurement/vendor/vendors/active/'),
}

// Vendor Contact API
export const vendorContactApi = {
  list: (params?: Record<string, any>): Promise<ApiListResponse<VendorContact>> =>
    apiClient.get('/procurement/vendor/contacts/', { params }),

  get: (id: string): Promise<VendorContact> =>
    apiClient.get(`/procurement/vendor/contacts/${id}/`),

  create: (data: Partial<VendorContact>): Promise<VendorContact> =>
    apiClient.post('/procurement/vendor/contacts/', data),

  update: (id: string, data: Partial<VendorContact>): Promise<VendorContact> =>
    apiClient.patch(`/procurement/vendor/contacts/${id}/`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/procurement/vendor/contacts/${id}/`),
}

// Vendor Evaluation API
export const vendorEvaluationApi = {
  list: (params?: Record<string, any>): Promise<ApiListResponse<VendorEvaluation>> =>
    apiClient.get('/procurement/vendor/evaluations/', { params }),

  get: (id: string): Promise<VendorEvaluation> =>
    apiClient.get(`/procurement/vendor/evaluations/${id}/`),

  create: (data: Partial<VendorEvaluation>): Promise<VendorEvaluation> =>
    apiClient.post('/procurement/vendor/evaluations/', data),

  update: (id: string, data: Partial<VendorEvaluation>): Promise<VendorEvaluation> =>
    apiClient.patch(`/procurement/vendor/evaluations/${id}/`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/procurement/vendor/evaluations/${id}/`),
}

// Purchase Order API
export const purchaseOrderApi = {
  list: (params?: Record<string, any>): Promise<ApiListResponse<POListItem>> =>
    apiClient.get('/procurement/po/orders/', { params }),

  get: (id: string): Promise<PurchaseOrder> =>
    apiClient.get(`/procurement/po/orders/${id}/`),

  create: (data: Partial<PurchaseOrder>): Promise<PurchaseOrder> =>
    apiClient.post('/procurement/po/orders/', data),

  update: (id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> =>
    apiClient.patch(`/procurement/po/orders/${id}/`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/procurement/po/orders/${id}/`),

  submit: (id: string): Promise<{ detail: string }> =>
    apiClient.post(`/procurement/po/orders/${id}/submit/`),

  approve: (id: string, data: POApprovalData): Promise<{ detail: string }> =>
    apiClient.post(`/procurement/po/orders/${id}/approve/`, data),

  send: (id: string): Promise<{ detail: string }> =>
    apiClient.post(`/procurement/po/orders/${id}/send/`),

  cancel: (id: string, reason: string): Promise<{ detail: string }> =>
    apiClient.post(`/procurement/po/orders/${id}/cancel/`, { reason }),

  close: (id: string): Promise<{ detail: string }> =>
    apiClient.post(`/procurement/po/orders/${id}/close/`),

  receipts: (id: string): Promise<POReceipt[]> =>
    apiClient.get(`/procurement/po/orders/${id}/receipts/`),

  myRequests: (): Promise<POListItem[]> =>
    apiClient.get('/procurement/po/orders/my_requests/'),

  pendingApproval: (): Promise<POListItem[]> =>
    apiClient.get('/procurement/po/orders/pending_approval/'),

  statistics: (): Promise<{
    total: number
    by_status: Record<POStatus, number>
    total_value: number
    pending_approval: number
    pending_delivery: number
  }> =>
    apiClient.get('/procurement/po/orders/statistics/'),
}

// PO Item API
export const poItemApi = {
  list: (params?: Record<string, any>): Promise<ApiListResponse<POItem>> =>
    apiClient.get('/procurement/po/items/', { params }),

  get: (id: string): Promise<POItem> =>
    apiClient.get(`/procurement/po/items/${id}/`),

  create: (data: Partial<POItem>): Promise<POItem> =>
    apiClient.post('/procurement/po/items/', data),

  update: (id: string, data: Partial<POItem>): Promise<POItem> =>
    apiClient.patch(`/procurement/po/items/${id}/`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/procurement/po/items/${id}/`),
}

// PO Receipt API
export const poReceiptApi = {
  list: (params?: Record<string, any>): Promise<ApiListResponse<POReceipt>> =>
    apiClient.get('/procurement/po/receipts/', { params }),

  get: (id: string): Promise<POReceipt> =>
    apiClient.get(`/procurement/po/receipts/${id}/`),

  create: (data: Partial<POReceipt>): Promise<POReceipt> =>
    apiClient.post('/procurement/po/receipts/', data),

  update: (id: string, data: Partial<POReceipt>): Promise<POReceipt> =>
    apiClient.patch(`/procurement/po/receipts/${id}/`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/procurement/po/receipts/${id}/`),
}
