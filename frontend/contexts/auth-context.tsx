"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  avatar?: string
  last_login?: string
  date_joined?: string
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchUser = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await refreshToken()
        if (refreshed) {
          await fetchUser()
        } else {
          logout()
        }
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    const refresh = localStorage.getItem("refresh_token")
    if (!refresh) return false

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("access_token", data.access)
        return true
      }
    } catch (error) {
      console.error("Failed to refresh token:", error)
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUser(null)
    router.push("/login")
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
