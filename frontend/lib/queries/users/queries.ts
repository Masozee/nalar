/**
 * User domain queries (useQuery hooks)
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { queryApi } from "@/lib/query-api"
import { queryKeys } from "@/lib/queries/query-keys"
import { User, UserProfile, UserListResponse, UserFilters } from "./types"

/**
 * Fetch a list of users with optional filters
 */
export function useUsers(
  filters?: UserFilters,
  options?: Omit<UseQueryOptions<UserListResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.users.list(filters || {}),
    queryFn: () => queryApi.get<UserListResponse>("/users/", { params: filters }),
    ...options,
  })
}

/**
 * Fetch a single user by ID
 */
export function useUser(
  userId: string,
  options?: Omit<UseQueryOptions<User>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => queryApi.get<User>(`/users/${userId}/`),
    enabled: !!userId, // Only fetch if userId is provided
    ...options,
  })
}

/**
 * Fetch user profile with extended information
 */
export function useUserProfile(
  userId: string,
  options?: Omit<UseQueryOptions<UserProfile>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: () => queryApi.get<UserProfile>(`/users/${userId}/profile/`),
    enabled: !!userId,
    ...options,
  })
}

/**
 * Fetch current authenticated user
 */
export function useCurrentUser(
  options?: Omit<UseQueryOptions<User>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.users.detail("me"),
    queryFn: () => queryApi.get<User>("/users/me/"),
    ...options,
  })
}
