/**
 * TypeScript types for User domain
 */

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  is_active: boolean
  is_staff: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile extends User {
  department?: string
  position?: string
  phone?: string
  avatar?: string
}

export interface UserListResponse {
  count: number
  next: string | null
  previous: string | null
  results: User[]
}

export interface UserFilters {
  search?: string
  is_active?: boolean
  is_staff?: boolean
  page?: number
  page_size?: number
}
