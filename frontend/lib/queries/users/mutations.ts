/**
 * User domain mutations (useMutation hooks)
 */

import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query"
import { queryApi } from "@/lib/query-api"
import { queryKeys } from "@/lib/queries/query-keys"
import { User, UserProfile } from "./types"

/**
 * Update user data
 */
export function useUpdateUser(
  options?: Omit<UseMutationOptions<User, Error, { id: string; data: Partial<User> }>, "mutationFn">
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      queryApi.patch<User>(`/users/${id}/`, data),
    onSuccess: (updatedUser, variables) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })

      // Optionally update the cache directly for instant UI update
      queryClient.setQueryData(queryKeys.users.detail(variables.id), updatedUser)
    },
    ...options,
  })
}

/**
 * Update user profile
 */
export function useUpdateUserProfile(
  options?: Omit<UseMutationOptions<UserProfile, Error, { id: string; data: Partial<UserProfile> }>, "mutationFn">
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserProfile> }) =>
      queryApi.patch<UserProfile>(`/users/${id}/profile/`, data),
    onSuccess: (updatedProfile, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(variables.id) })
      queryClient.setQueryData(queryKeys.users.profile(variables.id), updatedProfile)
    },
    ...options,
  })
}

/**
 * Create a new user
 */
export function useCreateUser(
  options?: Omit<UseMutationOptions<User, Error, Partial<User>>, "mutationFn">
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<User>) => queryApi.post<User>("/users/", data),
    onSuccess: () => {
      // Invalidate user lists to refetch with new user
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
    ...options,
  })
}

/**
 * Delete a user
 */
export function useDeleteUser(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => queryApi.delete<void>(`/users/${userId}/`),
    onSuccess: (_, userId) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
    },
    ...options,
  })
}

/**
 * Activate/Deactivate user
 */
export function useToggleUserStatus(
  options?: Omit<UseMutationOptions<User, Error, { id: string; is_active: boolean }>, "mutationFn">
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      queryApi.patch<User>(`/users/${id}/`, { is_active }),
    onSuccess: (updatedUser, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      queryClient.setQueryData(queryKeys.users.detail(variables.id), updatedUser)
    },
    ...options,
  })
}
