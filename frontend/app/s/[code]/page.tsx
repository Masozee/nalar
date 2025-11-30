"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon } from "@/components/ui/icon"
import { API_BASE_URL } from "@/lib/api/client"

const API_URL = API_BASE_URL.replace('/api/v1', '')

// Parse user agent to extract device info
function parseUserAgent() {
  if (typeof window === "undefined") return {}

  const ua = navigator.userAgent.toLowerCase()

  const result: Record<string, string | boolean> = {
    user_agent: navigator.userAgent,
    referer: document.referrer || "",
    device_type: "desktop",
    browser: "",
    browser_version: "",
    os: "",
    os_version: "",
    is_bot: false,
  }

  // Check if bot
  const botKeywords = ["bot", "crawler", "spider", "scraper"]
  if (botKeywords.some((bot) => ua.includes(bot))) {
    result.is_bot = true
    result.device_type = "bot"
    return result
  }

  // Detect device type
  if (/mobile|android.*mobile|iphone|ipod/.test(ua)) {
    result.device_type = "mobile"
  } else if (/tablet|ipad|android(?!.*mobile)/.test(ua)) {
    result.device_type = "tablet"
  }

  // Detect OS
  if (ua.includes("windows nt 10")) {
    result.os = "Windows"
    result.os_version = "10"
  } else if (ua.includes("windows")) {
    result.os = "Windows"
  } else if (ua.includes("mac os x")) {
    result.os = "macOS"
    const match = ua.match(/mac os x (\d+[._]\d+)/)
    if (match) result.os_version = match[1].replace("_", ".")
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    result.os = "iOS"
    const match = ua.match(/os (\d+[._]\d+)/)
    if (match) result.os_version = match[1].replace("_", ".")
  } else if (ua.includes("android")) {
    result.os = "Android"
    const match = ua.match(/android (\d+\.?\d*)/)
    if (match) result.os_version = match[1]
  } else if (ua.includes("linux")) {
    result.os = "Linux"
  }

  // Detect browser
  if (ua.includes("edg/")) {
    result.browser = "Edge"
    const match = ua.match(/edg\/(\d+\.?\d*)/)
    if (match) result.browser_version = match[1]
  } else if (ua.includes("chrome") && !ua.includes("chromium")) {
    result.browser = "Chrome"
    const match = ua.match(/chrome\/(\d+\.?\d*)/)
    if (match) result.browser_version = match[1]
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    result.browser = "Safari"
    const match = ua.match(/version\/(\d+\.?\d*)/)
    if (match) result.browser_version = match[1]
  } else if (ua.includes("firefox")) {
    result.browser = "Firefox"
    const match = ua.match(/firefox\/(\d+\.?\d*)/)
    if (match) result.browser_version = match[1]
  } else if (ua.includes("opera") || ua.includes("opr/")) {
    result.browser = "Opera"
    const match = ua.match(/(?:opera|opr)\/(\d+\.?\d*)/)
    if (match) result.browser_version = match[1]
  }

  return result
}

export default function RedirectPage() {
  const params = useParams()
  const code = params.code as string
  const [status, setStatus] = useState<"loading" | "password" | "error" | "redirecting">("loading")
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        // Fetch URL info
        const response = await fetch(
          `${API_URL}/api/v1/tools/s/${code}/`
        )

        if (!response.ok) {
          if (response.status === 404) {
            setError("Link not found")
          } else if (response.status === 410) {
            setError("This link has expired")
          } else {
            setError("Something went wrong")
          }
          setStatus("error")
          return
        }

        const data = await response.json()

        if (data.protected) {
          setTitle(data.title || "Protected Link")
          setStatus("password")
          return
        }

        // Log click and redirect
        await logClickAndRedirect(data.original_url)
      } catch (err) {
        setError("Failed to connect to server")
        setStatus("error")
      }
    }

    fetchAndRedirect()
  }, [code])

  const logClickAndRedirect = async (originalUrl: string) => {
    setStatus("redirecting")

    // Parse device info
    const deviceInfo = parseUserAgent()

    // Log click to backend
    try {
      await fetch(`${API_URL}/api/v1/tools/s/${code}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          log_click: true,
          ...deviceInfo,
        }),
      })
    } catch (err) {
      // Continue with redirect even if logging fails
      console.error("Failed to log click:", err)
    }

    // Redirect to original URL
    window.location.href = originalUrl
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    try {
      const response = await fetch(
        `${API_URL}/api/v1/tools/s/${code}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.error || "Invalid password")
        return
      }

      // Log click and redirect
      await logClickAndRedirect(data.original_url)
    } catch (err) {
      setPasswordError("Failed to verify password")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Icon name="Loader2" size={32} className="animate-spin text-[#005357]" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  if (status === "redirecting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Icon name="Loader2" size={32} className="animate-spin text-[#005357]" />
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4 text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Oops!
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-[#005357] hover:bg-[#004145] text-white"
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    )
  }

  if (status === "password") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <Icon name="Lock" size={48} className="text-[#005357] mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900">
              Password Protected
            </h1>
            <p className="text-gray-600 mt-2">
              {title && <span className="font-medium">{title}</span>}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              This link requires a password to access.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={passwordError ? "border-red-500" : ""}
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-[#005357] hover:bg-[#004145] text-white"
              >
                Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return null
}
