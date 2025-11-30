/**
 * Research API client for grants, publications, and projects
 */
import { apiClient, type ApiListResponse } from './client'

// Grant Management Types
export type GrantType =
  | 'internal'
  | 'government'
  | 'private'
  | 'international'
  | 'partnership'

export type GrantStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'completed'
  | 'cancelled'

export type FundingSource =
  | 'dikti'
  | 'brin'
  | 'lpdp'
  | 'kemenkes'
  | 'corporate'
  | 'foundation'
  | 'ngo'
  | 'foreign_gov'
  | 'internal'
  | 'other'

export interface Grant {
  id: string
  grant_number: string
  title: string
  abstract?: string
  grant_type: GrantType
  grant_type_display: string
  funding_source: FundingSource
  funding_source_display: string
  funder_name?: string
  funder_contact?: string
  principal_investigator: string
  pi_name: string
  submission_date?: string
  start_date?: string
  end_date?: string
  currency: string
  requested_amount: string
  approved_amount: string
  disbursed_amount: string
  remaining_budget: number
  duration_months?: number
  status: GrantStatus
  status_display: string
  reviewed_by?: string
  reviewed_by_name?: string
  reviewed_at?: string
  review_notes?: string
  proposal_file?: string
  contract_file?: string
  notes?: string
  team_count?: number
  team_members?: GrantTeamMember[]
  milestones?: GrantMilestone[]
  disbursements?: GrantDisbursement[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GrantTeamMember {
  id: string
  grant: string
  user: string
  user_name: string
  role: string
  role_display: string
  responsibilities?: string
  allocation_percentage: string
  start_date?: string
  end_date?: string
  is_active: boolean
}

export interface GrantMilestone {
  id: string
  grant: string
  title: string
  description?: string
  due_date: string
  completed_date?: string
  status: string
  status_display: string
  deliverable_file?: string
  notes?: string
  is_active: boolean
}

export interface GrantDisbursement {
  id: string
  grant: string
  disbursement_number: string
  description: string
  amount: string
  status: string
  status_display: string
  request_date: string
  disbursement_date?: string
  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  supporting_document?: string
  notes?: string
  is_active: boolean
}

// Publication Types
export type PublicationType =
  | 'journal_article'
  | 'conference_paper'
  | 'book'
  | 'book_chapter'
  | 'thesis'
  | 'report'
  | 'working_paper'
  | 'policy_brief'
  | 'op_ed'
  | 'blog'
  | 'other'

export type PublicationStatus =
  | 'draft'
  | 'in_review'
  | 'revision'
  | 'accepted'
  | 'published'
  | 'rejected'

export type IndexationType =
  | 'scopus'
  | 'wos'
  | 'sinta'
  | 'doaj'
  | 'google_scholar'
  | 'non_indexed'
  | 'other'

export interface Publication {
  id: string
  title: string
  abstract?: string
  keywords?: string
  publication_type: PublicationType
  publication_type_display: string
  status: PublicationStatus
  status_display: string
  journal_name?: string
  volume?: string
  issue?: string
  pages?: string
  publisher?: string
  submission_date?: string
  acceptance_date?: string
  publication_date?: string
  year?: number
  doi?: string
  isbn?: string
  issn?: string
  url?: string
  indexation: IndexationType
  indexation_display: string
  impact_factor?: string
  sinta_score?: number
  quartile?: string
  citation_count: number
  grant?: string
  grant_number?: string
  manuscript_file?: string
  published_file?: string
  notes?: string
  authors?: PublicationAuthor[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PublicationAuthor {
  id: string
  publication: string
  user?: string
  author_type: 'internal' | 'external'
  name?: string
  display_name: string
  affiliation?: string
  email?: string
  order: number
  is_corresponding: boolean
  is_active: boolean
}

// Project Types
export type ProjectStatus =
  | 'planning'
  | 'proposal'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled'

export type ProjectType =
  | 'basic_research'
  | 'applied_research'
  | 'policy_research'
  | 'commissioned'
  | 'collaborative'
  | 'internal'

export interface ResearchProject {
  id: string
  project_code: string
  title: string
  description?: string
  objectives?: string
  methodology?: string
  project_type: ProjectType
  project_type_display: string
  status: ProjectStatus
  status_display: string
  lead_researcher: string
  lead_researcher_name: string
  grant?: string
  grant_number?: string
  start_date?: string
  end_date?: string
  actual_end_date?: string
  currency: string
  budget: string
  spent: string
  remaining_budget: string
  progress_percentage: number
  research_area?: string
  tags?: string
  notes?: string
  team_members?: ProjectTeamMember[]
  tasks?: ProjectTask[]
  updates?: ProjectUpdate[]
  is_overdue?: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProjectTeamMember {
  id: string
  project: string
  user: string
  user_name: string
  role: string
  role_display: string
  responsibilities?: string
  start_date?: string
  end_date?: string
  is_active: boolean
}

export interface ProjectTask {
  id: string
  project: string
  project_code?: string
  title: string
  description?: string
  status: string
  status_display: string
  priority: string
  priority_display: string
  assigned_to?: string
  assigned_to_name?: string
  due_date?: string
  completed_at?: string
  parent_task?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProjectUpdate {
  id: string
  project: string
  project_code?: string
  title: string
  content: string
  progress_percentage?: number
  attachment?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// API Clients
export const grantApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<ApiListResponse<Grant>>('/research/grants/grants/', params),

  retrieve: (id: string) =>
    apiClient.get<Grant>(`/research/grants/grants/${id}/`),

  create: (data: Partial<Grant>) =>
    apiClient.post<Grant>('/research/grants/grants/', data),

  update: (id: string, data: Partial<Grant>) =>
    apiClient.patch<Grant>(`/research/grants/grants/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/research/grants/grants/${id}/`),

  submit: (id: string) =>
    apiClient.post(`/research/grants/grants/${id}/submit/`),

  approve: (id: string, data: { approved_amount?: string; notes?: string }) =>
    apiClient.post(`/research/grants/grants/${id}/approve/`, data),

  activate: (id: string) =>
    apiClient.post(`/research/grants/grants/${id}/activate/`),

  complete: (id: string) =>
    apiClient.post(`/research/grants/grants/${id}/complete/`),

  summary: () =>
    apiClient.get('/research/grants/grants/summary/'),
}

export const grantMilestoneApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<ApiListResponse<GrantMilestone>>('/research/grants/milestones/', params),

  retrieve: (id: string) =>
    apiClient.get<GrantMilestone>(`/research/grants/milestones/${id}/`),

  create: (data: Partial<GrantMilestone>) =>
    apiClient.post<GrantMilestone>('/research/grants/milestones/', data),

  update: (id: string, data: Partial<GrantMilestone>) =>
    apiClient.patch<GrantMilestone>(`/research/grants/milestones/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/research/grants/milestones/${id}/`),

  complete: (id: string) =>
    apiClient.post(`/research/grants/milestones/${id}/complete/`),
}

export const grantDisbursementApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<ApiListResponse<GrantDisbursement>>('/research/grants/disbursements/', params),

  retrieve: (id: string) =>
    apiClient.get<GrantDisbursement>(`/research/grants/disbursements/${id}/`),

  create: (data: Partial<GrantDisbursement>) =>
    apiClient.post<GrantDisbursement>('/research/grants/disbursements/', data),

  update: (id: string, data: Partial<GrantDisbursement>) =>
    apiClient.patch<GrantDisbursement>(`/research/grants/disbursements/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/research/grants/disbursements/${id}/`),

  approve: (id: string) =>
    apiClient.post(`/research/grants/disbursements/${id}/approve/`),

  disburse: (id: string) =>
    apiClient.post(`/research/grants/disbursements/${id}/disburse/`),
}

export const publicationApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<ApiListResponse<Publication>>('/research/publications/publications/', params),

  retrieve: (id: string) =>
    apiClient.get<Publication>(`/research/publications/publications/${id}/`),

  create: (data: Partial<Publication>) =>
    apiClient.post<Publication>('/research/publications/publications/', data),

  update: (id: string, data: Partial<Publication>) =>
    apiClient.patch<Publication>(`/research/publications/publications/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/research/publications/publications/${id}/`),
}

export const projectApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<ApiListResponse<ResearchProject>>('/research/projects/projects/', params),

  retrieve: (id: string) =>
    apiClient.get<ResearchProject>(`/research/projects/projects/${id}/`),

  create: (data: Partial<ResearchProject>) =>
    apiClient.post<ResearchProject>('/research/projects/projects/', data),

  update: (id: string, data: Partial<ResearchProject>) =>
    apiClient.patch<ResearchProject>(`/research/projects/projects/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/research/projects/projects/${id}/`),
}

export const projectTaskApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<ApiListResponse<ProjectTask>>('/research/projects/tasks/', params),

  retrieve: (id: string) =>
    apiClient.get<ProjectTask>(`/research/projects/tasks/${id}/`),

  create: (data: Partial<ProjectTask>) =>
    apiClient.post<ProjectTask>('/research/projects/tasks/', data),

  update: (id: string, data: Partial<ProjectTask>) =>
    apiClient.patch<ProjectTask>(`/research/projects/tasks/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/research/projects/tasks/${id}/`),
}

export const projectUpdateApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<ApiListResponse<ProjectUpdate>>('/research/projects/updates/', params),

  retrieve: (id: string) =>
    apiClient.get<ProjectUpdate>(`/research/projects/updates/${id}/`),

  create: (data: Partial<ProjectUpdate>) =>
    apiClient.post<ProjectUpdate>('/research/projects/updates/', data),

  update: (id: string, data: Partial<ProjectUpdate>) =>
    apiClient.patch<ProjectUpdate>(`/research/projects/updates/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/research/projects/updates/${id}/`),
}
