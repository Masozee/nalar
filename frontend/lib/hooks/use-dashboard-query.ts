/**
 * TanStack Query hooks for Dashboard Analytics
 */
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api/dashboard'

// ============================================================================
// Query Keys
// ============================================================================

export const dashboardKeys = {
  all: ['dashboard'] as const,
  organizationOverview: () => [...dashboardKeys.all, 'organization-overview'] as const,
  publicationsStats: () => [...dashboardKeys.all, 'publications-stats'] as const,
  departmentStats: () => [...dashboardKeys.all, 'department-stats'] as const,
  employeeDemographics: () => [...dashboardKeys.all, 'employee-demographics'] as const,
}

// ============================================================================
// Dashboard Hooks
// ============================================================================

/**
 * Get organization overview statistics
 */
export function useOrganizationOverview() {
  return useQuery({
    queryKey: dashboardKeys.organizationOverview(),
    queryFn: () => dashboardApi.getOrganizationOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get publications statistics
 */
export function usePublicationsStats() {
  return useQuery({
    queryKey: dashboardKeys.publicationsStats(),
    queryFn: () => dashboardApi.getPublicationsStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get department statistics
 */
export function useDepartmentStats() {
  return useQuery({
    queryKey: dashboardKeys.departmentStats(),
    queryFn: () => dashboardApi.getDepartmentStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get employee demographics
 */
export function useEmployeeDemographics() {
  return useQuery({
    queryKey: dashboardKeys.employeeDemographics(),
    queryFn: () => dashboardApi.getEmployeeDemographics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
