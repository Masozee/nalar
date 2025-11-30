/**
 * TanStack Query hooks for HR module
 * Employees, Attendance, Leave, Payroll, Policies
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  employeeApi,
  attendanceApi,
  leaveApi,
  payrollApi,
  policyApi,
  type Employee,
  type Attendance,
  type AttendanceSummary,
  type LeaveBalance,
  type LeaveRequest,
  type LeavePolicy,
  type PayrollPeriod,
  type SalarySlip,
  type Policy,
  type PolicyCategory,
  type PolicyApproval,
} from '@/lib/api/hr'

// ============================================================================
// Query Keys
// ============================================================================

export const hrKeys = {
  // Employees
  employees: {
    all: ['employees'] as const,
    lists: () => [...hrKeys.employees.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...hrKeys.employees.lists(), params] as const,
    details: () => [...hrKeys.employees.all, 'detail'] as const,
    detail: (id: string) => [...hrKeys.employees.details(), id] as const,
  },

  // Attendance
  attendance: {
    all: ['attendance'] as const,
    lists: () => [...hrKeys.attendance.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...hrKeys.attendance.lists(), params] as const,
    details: () => [...hrKeys.attendance.all, 'detail'] as const,
    detail: (id: string) => [...hrKeys.attendance.details(), id] as const,
    summaries: () => [...hrKeys.attendance.all, 'summary'] as const,
    summary: (params?: Record<string, any>) => [...hrKeys.attendance.summaries(), params] as const,
  },

  // Leave
  leave: {
    policies: {
      all: ['leave-policies'] as const,
      lists: () => [...hrKeys.leave.policies.all, 'list'] as const,
      list: (params?: Record<string, any>) => [...hrKeys.leave.policies.lists(), params] as const,
      detail: (id: string) => [...hrKeys.leave.policies.all, id] as const,
    },
    balances: {
      all: ['leave-balances'] as const,
      lists: () => [...hrKeys.leave.balances.all, 'list'] as const,
      list: (params?: Record<string, any>) => [...hrKeys.leave.balances.lists(), params] as const,
      detail: (id: string) => [...hrKeys.leave.balances.all, id] as const,
    },
    requests: {
      all: ['leave-requests'] as const,
      lists: () => [...hrKeys.leave.requests.all, 'list'] as const,
      list: (params?: Record<string, any>) => [...hrKeys.leave.requests.lists(), params] as const,
      detail: (id: string) => [...hrKeys.leave.requests.all, id] as const,
    },
  },

  // Payroll
  payroll: {
    periods: {
      all: ['payroll-periods'] as const,
      lists: () => [...hrKeys.payroll.periods.all, 'list'] as const,
      list: (params?: Record<string, any>) => [...hrKeys.payroll.periods.lists(), params] as const,
      detail: (id: string) => [...hrKeys.payroll.periods.all, id] as const,
    },
    salarySlips: {
      all: ['salary-slips'] as const,
      lists: () => [...hrKeys.payroll.salarySlips.all, 'list'] as const,
      list: (params?: Record<string, any>) => [...hrKeys.payroll.salarySlips.lists(), params] as const,
      detail: (id: string) => [...hrKeys.payroll.salarySlips.all, id] as const,
    },
  },

  // Policies
  policies: {
    categories: {
      all: ['policy-categories'] as const,
      lists: () => [...hrKeys.policies.categories.all, 'list'] as const,
      list: (params?: Record<string, any>) => [...hrKeys.policies.categories.lists(), params] as const,
      detail: (id: number) => [...hrKeys.policies.categories.all, id] as const,
    },
    policies: {
      all: ['policies'] as const,
      lists: () => [...hrKeys.policies.policies.all, 'list'] as const,
      list: (params?: Record<string, any>) => [...hrKeys.policies.policies.lists(), params] as const,
      detail: (id: string) => [...hrKeys.policies.policies.all, id] as const,
    },
    approvals: {
      all: ['policy-approvals'] as const,
      lists: () => [...hrKeys.policies.approvals.all, 'list'] as const,
      list: (params?: Record<string, any>) => [...hrKeys.policies.approvals.lists(), params] as const,
      detail: (id: string) => [...hrKeys.policies.approvals.all, id] as const,
    },
  },
}

// ============================================================================
// Employees
// ============================================================================

export interface EmployeeQueryParams {
  page?: number
  page_size?: number
  search?: string
  department?: string
  employment_status?: string
  employment_type?: string
  ordering?: string
}

export function useEmployees(params: EmployeeQueryParams = {}) {
  return useQuery({
    queryKey: hrKeys.employees.list(params),
    queryFn: async () => {
      const response = await employeeApi.list(params)
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

export function useEmployee(id: string) {
  return useQuery({
    queryKey: hrKeys.employees.detail(id),
    queryFn: () => employeeApi.get(id),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Employee>) => employeeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employees.lists() })
    },
  })
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Employee>) => employeeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employees.lists() })
      queryClient.invalidateQueries({ queryKey: hrKeys.employees.detail(id) })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employees.lists() })
    },
  })
}

// ============================================================================
// Attendance
// ============================================================================

export interface AttendanceQueryParams {
  page?: number
  page_size?: number
  search?: string
  employee?: string
  date?: string
  date_from?: string
  date_to?: string
  status?: string
  ordering?: string
}

export function useAttendance(params: AttendanceQueryParams = {}) {
  return useQuery({
    queryKey: hrKeys.attendance.list(params),
    queryFn: async () => {
      const response = await attendanceApi.list(params)
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

export function useAttendanceSummary(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: hrKeys.attendance.summary(params),
    queryFn: async () => {
      const response = await attendanceApi.summary(params)
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

export function useCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: any }) =>
      attendanceApi.checkIn(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.attendance.lists() })
    },
  })
}

export function useCheckOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ attendanceId, data }: { attendanceId: string; data: any }) =>
      attendanceApi.checkOut(attendanceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.attendance.lists() })
    },
  })
}

// ============================================================================
// Leave
// ============================================================================

export interface LeaveRequestQueryParams {
  page?: number
  page_size?: number
  search?: string
  employee?: string
  leave_type?: string
  status?: string
  start_date?: string
  end_date?: string
  ordering?: string
}

export function useLeaveBalances(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: hrKeys.leave.balances.list(params),
    queryFn: async () => {
      const response = await leaveApi.balances.list(params)
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

export function useLeaveRequests(params: LeaveRequestQueryParams = {}) {
  return useQuery({
    queryKey: hrKeys.leave.requests.list(params),
    queryFn: async () => {
      const response = await leaveApi.requests.list(params)
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

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<LeaveRequest>) => leaveApi.requests.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leave.requests.lists() })
      queryClient.invalidateQueries({ queryKey: hrKeys.leave.balances.lists() })
    },
  })
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      leaveApi.requests.approve(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leave.requests.lists() })
      queryClient.invalidateQueries({ queryKey: hrKeys.leave.balances.lists() })
    },
  })
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      leaveApi.requests.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.leave.requests.lists() })
    },
  })
}

// ============================================================================
// Payroll
// ============================================================================

export interface PayrollPeriodQueryParams {
  page?: number
  page_size?: number
  year?: number
  month?: number
  status?: string
  ordering?: string
}

export function usePayrollPeriods(params: PayrollPeriodQueryParams = {}) {
  return useQuery({
    queryKey: hrKeys.payroll.periods.list(params),
    queryFn: async () => {
      const response = await payrollApi.periods.list(params)
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

export function useSalarySlips(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: hrKeys.payroll.salarySlips.list(params),
    queryFn: async () => {
      const response = await payrollApi.salarySlips.list(params)
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

// ============================================================================
// Policies
// ============================================================================

export interface PolicyQueryParams {
  page?: number
  page_size?: number
  search?: string
  category?: number
  status?: string
  ordering?: string
}

export function usePolicyCategories(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: hrKeys.policies.categories.list(params),
    queryFn: async () => {
      const response = await policyApi.categories.list(params)
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

export function usePolicies(params: PolicyQueryParams = {}) {
  return useQuery({
    queryKey: hrKeys.policies.policies.list(params),
    queryFn: async () => {
      const response = await policyApi.policies.list(params)
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

export function usePolicy(id: string) {
  return useQuery({
    queryKey: hrKeys.policies.policies.detail(id),
    queryFn: () => policyApi.policies.get(id),
    enabled: !!id,
  })
}

export function useCreatePolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Policy>) => policyApi.policies.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.policies.policies.lists() })
    },
  })
}

export function useUpdatePolicy(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Policy>) => policyApi.policies.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.policies.policies.lists() })
      queryClient.invalidateQueries({ queryKey: hrKeys.policies.policies.detail(id) })
    },
  })
}

export function useAcknowledgePolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => policyApi.policies.acknowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.policies.policies.lists() })
    },
  })
}
