/**
 * CRM API Client
 * Contact Relationship Management endpoints
 */

import { apiClient } from './client'
import type { PaginatedResponse } from './types'

// ============================================================================
// Types
// ============================================================================

export type AccessLevel = 'public' | 'internal' | 'restricted' | 'vip' | 'vvip'
export type ContactType = 'individual' | 'organization'
export type OrganizationType =
  | 'government'
  | 'corporate'
  | 'ngo'
  | 'education'
  | 'media'
  | 'partner'
  | 'vendor'
  | 'donor'
  | 'other'

export type ActivityType =
  | 'meeting'
  | 'call'
  | 'email'
  | 'lunch'
  | 'event'
  | 'conference'
  | 'collaboration'
  | 'other'

export interface Organization {
  id: string
  name: string
  organization_type: OrganizationType
  industry: string
  website: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  description: string
  access_level: AccessLevel
  parent_organization?: string
  logo: string
  tags: string[]
  custom_fields: Record<string, any>
  contact_count?: number
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface JobPosition {
  id: string
  contact: string
  contact_name?: string
  organization: string
  organization_name?: string
  organization_type?: OrganizationType
  title: string
  department: string
  is_primary: boolean
  is_current: boolean
  start_date?: string
  end_date?: string
  office_phone: string
  office_email: string
  office_address: string
  description: string
  responsibilities: string[]
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  full_name?: string
  first_name: string
  last_name: string
  middle_name: string
  prefix: string
  suffix: string
  email_primary: string
  email_secondary: string
  phone_primary: string
  phone_secondary: string
  phone_mobile: string
  linkedin_url: string
  twitter_handle: string
  address: string
  city: string
  country: string
  biography: string
  expertise_areas: string[]
  languages: string[]
  access_level: AccessLevel
  contact_type: ContactType
  assigned_to?: string
  assigned_to_name?: string
  assigned_to_email?: string
  photo_url: string
  tags: string[]
  custom_fields: Record<string, any>
  is_active: boolean
  last_contacted_at?: string
  primary_position?: {
    title: string
    organization: string
    organization_id: string
  }
  positions?: JobPosition[]
  created_at: string
  updated_at: string
}

export interface ContactNote {
  id: string
  contact: string
  contact_name?: string
  author?: string
  author_name?: string
  title: string
  content: string
  is_private: boolean
  attachments: string[]
  created_at: string
  updated_at: string
}

export interface ContactActivity {
  id: string
  contact: string
  contact_name?: string
  activity_type: ActivityType
  title: string
  description: string
  activity_date: string
  duration_minutes?: number
  location: string
  organized_by?: string
  organized_by_name?: string
  participants: string[]
  participant_names?: string[]
  requires_followup: boolean
  followup_date?: string
  followup_completed: boolean
  outcome: string
  created_at: string
  updated_at: string
}

export interface ContactFormData {
  first_name: string
  last_name: string
  middle_name?: string
  prefix?: string
  suffix?: string
  email_primary?: string
  email_secondary?: string
  phone_primary?: string
  phone_secondary?: string
  phone_mobile?: string
  linkedin_url?: string
  twitter_handle?: string
  address?: string
  city?: string
  country?: string
  biography?: string
  expertise_areas?: string[]
  languages?: string[]
  access_level?: AccessLevel
  contact_type?: ContactType
  assigned_to?: string
  photo_url?: string
  tags?: string[]
  custom_fields?: Record<string, any>
  is_active?: boolean
}

export interface OrganizationFormData {
  name: string
  organization_type?: OrganizationType
  industry?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  description?: string
  access_level?: AccessLevel
  parent_organization?: string
  logo?: string
  tags?: string[]
  custom_fields?: Record<string, any>
}

export interface JobPositionFormData {
  contact: string
  organization: string
  title: string
  department?: string
  is_primary?: boolean
  is_current?: boolean
  start_date?: string
  end_date?: string
  office_phone?: string
  office_email?: string
  office_address?: string
  description?: string
  responsibilities?: string[]
}

// ============================================================================
// Organizations
// ============================================================================

export async function getOrganizations(params?: Record<string, any>) {
  return await apiClient.get<PaginatedResponse<Organization>>(
    '/admin-ops/crm/organizations/',
    { params }
  )
}

export async function getOrganization(id: string) {
  return await apiClient.get<Organization>(`/admin-ops/crm/organizations/${id}/`)
}

export async function createOrganization(data: OrganizationFormData) {
  return await apiClient.post<Organization>('/admin-ops/crm/organizations/', data)
}

export async function updateOrganization(id: string, data: Partial<OrganizationFormData>) {
  return await apiClient.patch<Organization>(`/admin-ops/crm/organizations/${id}/`, data)
}

export async function deleteOrganization(id: string) {
  return await apiClient.delete<void>(`/admin-ops/crm/organizations/${id}/`)
}

export async function getOrganizationsByType() {
  return await apiClient.get<Record<string, number>>('/admin-ops/crm/organizations/by_type/')
}

// ============================================================================
// Contacts
// ============================================================================

export async function getContacts(params?: Record<string, any>) {
  return await apiClient.get<PaginatedResponse<Contact>>(
    '/admin-ops/crm/contacts/',
    { params }
  )
}

export async function getContact(id: string) {
  return await apiClient.get<Contact>(`/admin-ops/crm/contacts/${id}/`)
}

export async function createContact(data: ContactFormData) {
  return await apiClient.post<Contact>('/admin-ops/crm/contacts/', data)
}

export async function updateContact(id: string, data: Partial<ContactFormData>) {
  return await apiClient.patch<Contact>(`/admin-ops/crm/contacts/${id}/`, data)
}

export async function deleteContact(id: string) {
  return await apiClient.delete<void>(`/admin-ops/crm/contacts/${id}/`)
}

export async function getMyContacts() {
  return await apiClient.get<Contact[]>('/admin-ops/crm/contacts/my_contacts/')
}

export async function getVIPContacts() {
  return await apiClient.get<Contact[]>('/admin-ops/crm/contacts/vip_contacts/')
}

export async function getContactsByAccessLevel() {
  return await apiClient.get<Record<string, number>>('/admin-ops/crm/contacts/by_access_level/')
}

export async function updateLastContacted(id: string) {
  return await apiClient.post<Contact>(`/admin-ops/crm/contacts/${id}/update_last_contacted/`)
}

// ============================================================================
// Job Positions
// ============================================================================

export async function getJobPositions(params?: Record<string, any>) {
  return await apiClient.get<PaginatedResponse<JobPosition>>(
    '/admin-ops/crm/positions/',
    { params }
  )
}

export async function getJobPosition(id: string) {
  return await apiClient.get<JobPosition>(`/admin-ops/crm/positions/${id}/`)
}

export async function createJobPosition(data: JobPositionFormData) {
  return await apiClient.post<JobPosition>('/admin-ops/crm/positions/', data)
}

export async function updateJobPosition(id: string, data: Partial<JobPositionFormData>) {
  return await apiClient.patch<JobPosition>(`/admin-ops/crm/positions/${id}/`, data)
}

export async function deleteJobPosition(id: string) {
  return await apiClient.delete<void>(`/admin-ops/crm/positions/${id}/`)
}

// ============================================================================
// Contact Notes
// ============================================================================

export async function getContactNotes(params?: Record<string, any>) {
  return await apiClient.get<PaginatedResponse<ContactNote>>(
    '/admin-ops/crm/notes/',
    { params }
  )
}

export async function getContactNote(id: string) {
  return await apiClient.get<ContactNote>(`/admin-ops/crm/notes/${id}/`)
}

export async function createContactNote(data: Partial<ContactNote>) {
  return await apiClient.post<ContactNote>('/admin-ops/crm/notes/', data)
}

export async function updateContactNote(id: string, data: Partial<ContactNote>) {
  return await apiClient.patch<ContactNote>(`/admin-ops/crm/notes/${id}/`, data)
}

export async function deleteContactNote(id: string) {
  return await apiClient.delete<void>(`/admin-ops/crm/notes/${id}/`)
}

// ============================================================================
// Contact Activities
// ============================================================================

export async function getContactActivities(params?: Record<string, any>) {
  return await apiClient.get<PaginatedResponse<ContactActivity>>(
    '/admin-ops/crm/activities/',
    { params }
  )
}

export async function getContactActivity(id: string) {
  return await apiClient.get<ContactActivity>(`/admin-ops/crm/activities/${id}/`)
}

export async function createContactActivity(data: Partial<ContactActivity>) {
  return await apiClient.post<ContactActivity>('/admin-ops/crm/activities/', data)
}

export async function updateContactActivity(id: string, data: Partial<ContactActivity>) {
  return await apiClient.patch<ContactActivity>(`/admin-ops/crm/activities/${id}/`, data)
}

export async function deleteContactActivity(id: string) {
  return await apiClient.delete<void>(`/admin-ops/crm/activities/${id}/`)
}

export async function getUpcomingActivities() {
  return await apiClient.get<ContactActivity[]>('/admin-ops/crm/activities/upcoming/')
}

export async function getOverdueActivities() {
  return await apiClient.get<ContactActivity[]>('/admin-ops/crm/activities/overdue/')
}
