/**
 * Dashboard Analytics API Module
 * Handles dashboard statistics and aggregated data
 */

import { ApiClient } from './client'

const client = new ApiClient()

// ============================================================================
// Types
// ============================================================================

export interface OrganizationOverview {
  total_employees: number
  total_departments: number
  total_positions: number
  total_publications: number
  employees_by_status: Array<{
    employment_status: string
    count: number
  }>
  employees_by_type: Array<{
    employment_type: string
    count: number
  }>
}

export interface PublicationsStats {
  publications_by_type: Array<{
    publication_type: string
    count: number
  }>
  publications_by_year: Array<{
    year: number
    count: number
  }>
  publications_by_status: Array<{
    status: string
    count: number
  }>
  publications_by_indexation: Array<{
    indexation: string
    count: number
  }>
  monthly_trend: Array<{
    month: string
    count: number
  }>
  recent_publications: Array<{
    id: string
    title: string
    publication_type: string
    publication_date: string
    journal_name: string
    indexation: string
    citation_count: number
  }>
}

export interface DepartmentStats {
  departments_by_employee_count: Array<{
    id: string
    name: string
    code: string
    employee_count: number
  }>
  top_departments: Array<{
    id: string
    name: string
    code: string
    employee_count: number
  }>
  department_hierarchy: Array<DepartmentNode>
}

export interface DepartmentNode {
  id: string
  name: string
  code: string
  employee_count: number
  children: DepartmentNode[]
}

export interface EmployeeDemographics {
  employees_by_gender: Array<{
    gender: string
    count: number
  }>
  employees_by_department: Array<{
    department_name: string
    count: number
  }>
  join_date_trend: Array<{
    month: string
    count: number
  }>
}

// ============================================================================
// Dashboard API
// ============================================================================

export const dashboardApi = {
  /**
   * Get organization overview statistics
   */
  getOrganizationOverview: () =>
    client.get<OrganizationOverview>('/analytics/dashboard/organization_overview/'),

  /**
   * Get publications statistics
   */
  getPublicationsStats: () =>
    client.get<PublicationsStats>('/analytics/dashboard/publications_stats/'),

  /**
   * Get department statistics
   */
  getDepartmentStats: () =>
    client.get<DepartmentStats>('/analytics/dashboard/department_stats/'),

  /**
   * Get employee demographics
   */
  getEmployeeDemographics: () =>
    client.get<EmployeeDemographics>('/analytics/dashboard/employee_demographics/'),
}
