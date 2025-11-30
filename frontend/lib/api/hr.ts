import { apiClient } from './client'

// Employee Types
export interface Employee {
  id: string
  employee_id: string
  user: number
  first_name: string
  last_name: string
  full_name: string
  gender?: string
  date_of_birth?: string
  place_of_birth?: string
  nationality?: string
  national_id?: string
  tax_id?: string
  marital_status?: string
  personal_email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  postal_code?: string
  employment_type: string
  employment_status: string
  department?: {
    id: string
    name: string
  }
  position?: string
  job_title?: string
  supervisor?: {
    id: string
    full_name: string
  }
  join_date?: string
  contract_start_date?: string
  contract_end_date?: string
  termination_date?: string
  avatar?: string
  bank_name?: string
  bank_account_number?: string
  bank_account_name?: string
  room_number?: string
  phone_extension?: string
  created_at: string
  updated_at: string
}

// Attendance Types
export interface Attendance {
  id: string
  employee: {
    id: string
    full_name: string
    employee_id: string
  }
  date: string
  check_in?: string
  check_out?: string
  status: string
  work_hours?: number
  overtime_hours: number
  notes?: string
  check_in_location?: string
  check_out_location?: string
  created_at: string
  updated_at: string
}

export interface AttendanceSummary {
  id: string
  employee: {
    id: string
    full_name: string
    employee_id: string
  }
  year: number
  month: number
  total_days: number
  present_days: number
  absent_days: number
  late_days: number
  leave_days: number
  sick_days: number
  wfh_days: number
  total_work_hours: number
  total_overtime_hours: number
}

// Leave Types
export interface LeavePolicy {
  id: string
  name: string
  leave_type: string
  year: number
  default_days: number
  max_carry_over: number
  requires_approval: boolean
  requires_document: boolean
  min_days_notice: number
  description?: string
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  employee: string // Employee ID
  employee_name: string
  leave_type: string
  leave_type_display: string
  year: number
  entitled_days: string | number
  used_days: string | number
  carried_over: string | number
  remaining_days: string | number
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: string
  employee: string // Employee ID
  employee_name: string
  leave_type: string
  leave_type_display: string
  start_date: string
  end_date: string
  total_days: string | number
  reason: string
  status: string
  status_display: string
  approved_by?: string // Approver ID
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  attachment?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  delegate_to?: string
  created_at: string
  updated_at: string
}

// Policy Types
export interface PolicyCategory {
  id: number
  name: string
  description: string
  order: number
}

export interface Policy {
  id: string
  title: string
  description: string
  category: number
  category_name?: string
  content: string
  file?: string
  file_url?: string
  file_size?: number
  file_name: string
  version: string
  effective_date: string
  expiry_date?: string
  status: string
  status_display?: string
  requires_acknowledgment: boolean
  created_by?: string
  created_by_name?: string
  tags: string[]
  is_active: boolean
  view_count: number
  approval_status?: {
    total: number
    approved: number
    pending: number
  }
  created_at: string
  updated_at: string
}

export interface PolicyApproval {
  id: string
  policy: string
  policy_title?: string
  approver: string
  approver_name?: string
  approver_title: string
  order: number
  status: string
  status_display?: string
  approved_at?: string
  comments: string
  created_at: string
  updated_at: string
}

// Payroll Types
export interface PayrollPeriod {
  id: string
  year: number
  month: number
  start_date: string
  end_date: string
  payment_date: string
  status: string
  total_employees: number
  total_gross_salary: number
  total_deductions: number
  total_net_salary: number
  created_at: string
  updated_at: string
}

export interface SalarySlip {
  id: string
  employee: {
    id: string
    full_name: string
    employee_id: string
  }
  period: {
    id: string
    year: number
    month: number
  }
  basic_salary: number
  allowances: number
  deductions: number
  tax: number
  gross_salary: number
  net_salary: number
  payment_date?: string
  paid: boolean
  notes?: string
  created_at: string
  updated_at: string
}

// Employee APIs
export const employeeApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: Employee[], count: number }>('/hr/employees/', params),

  get: (id: string) =>
    apiClient.get<Employee>(`/hr/employees/${id}/`),

  create: (data: Partial<Employee>) =>
    apiClient.post<Employee>('/hr/employees/', data),

  update: (id: string, data: Partial<Employee>) =>
    apiClient.patch<Employee>(`/hr/employees/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/hr/employees/${id}/`),
}

// Attendance APIs
export const attendanceApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<{ results: Attendance[], count: number }>('/hr/attendance/', params),

  get: (id: string) =>
    apiClient.get<Attendance>(`/hr/attendance/${id}/`),

  create: (data: Partial<Attendance>) =>
    apiClient.post<Attendance>('/hr/attendance/', data),

  update: (id: string, data: Partial<Attendance>) =>
    apiClient.patch<Attendance>(`/hr/attendance/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/hr/attendance/${id}/`),

  checkIn: (employeeId: string, data: { location?: string, latitude?: number, longitude?: number }) =>
    apiClient.post(`/hr/attendance/check-in/`, { employee: employeeId, ...data }),

  checkOut: (attendanceId: string, data: { location?: string, latitude?: number, longitude?: number }) =>
    apiClient.post(`/hr/attendance/${attendanceId}/check-out/`, data),

  summary: (params?: Record<string, any>) =>
    apiClient.get<{ results: AttendanceSummary[], count: number }>('/hr/attendance-summaries/', params),
}

// Leave APIs
export const leaveApi = {
  policies: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: LeavePolicy[], count: number }>('/hr/leave/policies/', params),

    get: (id: string) =>
      apiClient.get<LeavePolicy>(`/hr/leave/policies/${id}/`),
  },

  balances: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: LeaveBalance[], count: number }>('/hr/leave/balances/', params),

    get: (id: string) =>
      apiClient.get<LeaveBalance>(`/hr/leave/balances/${id}/`),
  },

  requests: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: LeaveRequest[], count: number }>('/hr/leave/requests/', params),

    get: (id: string) =>
      apiClient.get<LeaveRequest>(`/hr/leave/requests/${id}/`),

    create: (data: Partial<LeaveRequest>) =>
      apiClient.post<LeaveRequest>('/hr/leave/requests/', data),

    update: (id: string, data: Partial<LeaveRequest>) =>
      apiClient.patch<LeaveRequest>(`/hr/leave/requests/${id}/`, data),

    delete: (id: string) =>
      apiClient.delete(`/hr/leave/requests/${id}/`),

    approve: (id: string, notes?: string) =>
      apiClient.post(`/hr/leave/requests/${id}/approve/`, { notes }),

    reject: (id: string, reason: string) =>
      apiClient.post(`/hr/leave/requests/${id}/reject/`, { reason }),

    cancel: (id: string) =>
      apiClient.post(`/hr/leave/requests/${id}/cancel/`),
  },
}

// Payroll APIs
export const payrollApi = {
  periods: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: PayrollPeriod[], count: number }>('/hr/payroll/periods/', params),

    get: (id: string) =>
      apiClient.get<PayrollPeriod>(`/hr/payroll/periods/${id}/`),

    create: (data: Partial<PayrollPeriod>) =>
      apiClient.post<PayrollPeriod>('/hr/payroll/periods/', data),

    finalize: (id: string) =>
      apiClient.post(`/hr/payroll/periods/${id}/finalize/`),
  },

  salarySlips: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: SalarySlip[], count: number }>('/hr/payroll/salary-slips/', params),

    get: (id: string) =>
      apiClient.get<SalarySlip>(`/hr/payroll/salary-slips/${id}/`),

    download: async (id: string) => {
      const response = await fetch(`${apiClient['baseURL']}/hr/payroll/salary-slips/${id}/download/`, {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`
        }
      })
      return response.blob()
    },
  },
}

// Policy APIs
export const policyApi = {
  categories: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: PolicyCategory[], count: number }>('/policies/categories/', params),

    get: (id: number) =>
      apiClient.get<PolicyCategory>(`/policies/categories/${id}/`),
  },

  policies: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: Policy[], count: number }>('/policies/policies/', params),

    get: (id: string) =>
      apiClient.get<Policy>(`/policies/policies/${id}/`),

    create: (data: Partial<Policy>) =>
      apiClient.post<Policy>('/policies/policies/', data),

    update: (id: string, data: Partial<Policy>) =>
      apiClient.patch<Policy>(`/policies/policies/${id}/`, data),

    delete: (id: string) =>
      apiClient.delete(`/policies/policies/${id}/`),

    acknowledge: (id: string) =>
      apiClient.post(`/policies/policies/${id}/acknowledge/`),
  },

  approvals: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: PolicyApproval[], count: number }>('/policies/approvals/', params),

    get: (id: string) =>
      apiClient.get<PolicyApproval>(`/policies/approvals/${id}/`),

    approve: (id: string, comments?: string) =>
      apiClient.post(`/policies/approvals/${id}/approve/`, { comments }),

    reject: (id: string, comments: string) =>
      apiClient.post(`/policies/approvals/${id}/reject/`, { comments }),
  },
}
