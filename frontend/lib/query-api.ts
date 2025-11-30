/**
 * Reusable fetch wrapper for TanStack Query
 * Works alongside your existing API client
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`)
    this.name = "ApiError"
  }
}

interface FetchOptions extends RequestInit {
  token?: string
  params?: Record<string, any>
}

/**
 * Generic fetch wrapper with automatic error handling
 */
export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, params, ...fetchOptions } = options

  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // Build headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  }

  // Add auth token if provided
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  } else if (typeof window !== "undefined") {
    // Try to get token from localStorage
    const storedToken = localStorage.getItem("access_token")
    if (storedToken) {
      headers["Authorization"] = `Bearer ${storedToken}`
    }
  }

  // Make the request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  // Handle non-OK responses
  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { message: response.statusText }
    }
    throw new ApiError(response.status, response.statusText, errorData)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  // Parse and return JSON
  return response.json()
}

/**
 * Convenience methods for different HTTP verbs
 */
export const queryApi = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { ...options, method: "DELETE" }),
}
