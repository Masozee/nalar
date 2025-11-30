import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { assetsApi, type AssetListItem, type Asset } from "@/lib/api/assets"

// Query keys
export const assetKeys = {
  all: ["assets"] as const,
  lists: () => [...assetKeys.all, "list"] as const,
  list: (params?: Record<string, any>) => [...assetKeys.lists(), params] as const,
  details: () => [...assetKeys.all, "detail"] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
  statistics: () => [...assetKeys.all, "statistics"] as const,
}

// Pagination & Filtering params
export interface AssetQueryParams {
  page?: number
  page_size?: number
  search?: string
  category?: string
  status?: string
  ordering?: string
}

// List Assets with Pagination
export function useAssets(params: AssetQueryParams = {}) {
  return useQuery({
    queryKey: assetKeys.list(params),
    queryFn: async () => {
      const response = await assetsApi.list(params)
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

// Single Asset
export function useAsset(id: string | undefined) {
  return useQuery({
    queryKey: assetKeys.detail(id!),
    queryFn: () => assetsApi.get(id!),
    enabled: !!id,
  })
}

// Asset Statistics
export function useAssetStatistics() {
  return useQuery({
    queryKey: assetKeys.statistics(),
    queryFn: () => assetsApi.statistics(),
  })
}

// Create Asset
export function useCreateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Asset>) => assetsApi.create(data),
    onSuccess: () => {
      // Invalidate all asset lists to refetch
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetKeys.statistics() })
    },
  })
}

// Update Asset
export function useUpdateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) =>
      assetsApi.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific asset in cache
      queryClient.setQueryData(assetKeys.detail(variables.id), data)
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetKeys.statistics() })
    },
  })
}

// Delete Asset
export function useDeleteAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetKeys.statistics() })
    },
  })
}
