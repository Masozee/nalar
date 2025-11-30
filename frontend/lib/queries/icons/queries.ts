/**
 * Icon Usage queries (useQuery hooks)
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { IconScanResult } from "./types"

/**
 * Fetch icon usage data from the API
 */
async function fetchIconUsage(): Promise<IconScanResult> {
  const response = await fetch("/api/icon-usage")

  if (!response.ok) {
    throw new Error(`Failed to fetch icon usage: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Query key for icon usage
 */
export const iconUsageKeys = {
  all: ["iconUsage"] as const,
  scan: () => [...iconUsageKeys.all, "scan"] as const,
}

/**
 * Hook to fetch icon usage data
 */
export function useIconUsage(
  options?: Omit<UseQueryOptions<IconScanResult, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: iconUsageKeys.scan(),
    queryFn: fetchIconUsage,
    // Don't refetch automatically - only when user clicks refresh
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  })
}
