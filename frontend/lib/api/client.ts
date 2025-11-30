export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface RequestConfig extends RequestInit {
  params?: Record<string, any>
}

export class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token')
    }
    return null
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return url.toString()
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) return null

      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (!response.ok) return null

      const data = await response.json()
      localStorage.setItem('access_token', data.access)
      return data.access
    } catch {
      return null
    }
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, ...fetchConfig } = config
    const url = this.buildURL(endpoint, params)

    const token = this.getAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...config.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    let response = await fetch(url, {
      ...fetchConfig,
      headers,
    })

    // Handle 401 - try to refresh token
    if (response.status === 401 && !config.headers?.['X-Retry']) {
      const newToken = await this.refreshToken()
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
        headers['X-Retry'] = 'true'
        response = await fetch(url, {
          ...fetchConfig,
          headers,
        })
      } else {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
        throw new Error('Authentication failed')
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...config })
  }

  async post<T>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      params,
    })
  }

  async put<T>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      params,
    })
  }

  async patch<T>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      params,
    })
  }

  async delete<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', params })
  }
}

export const apiClient = new ApiClient()
