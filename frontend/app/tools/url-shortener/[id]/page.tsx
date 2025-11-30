"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TopNavbar } from "@/components/top-navbar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { API_BASE_URL } from "@/lib/api/client"

const API_URL = API_BASE_URL.replace('/api/v1', '')

type ShortenedURL = {
  id: string
  original_url: string
  short_code: string
  short_url: string
  title: string
  click_count: number
  last_clicked_at: string | null
  expires_at: string | null
  is_expired: boolean
  is_active: boolean
  created_at: string
}

type ClickLog = {
  id: string
  clicked_at: string
  ip_address: string
  country: string
  city: string
  referer: string
  device_type: string
  browser: string
  browser_version: string
  os: string
  os_version: string
  is_bot: boolean
}

type URLStats = {
  total_clicks: number
  clicks_today: number
  clicks_this_week: number
  clicks_this_month: number
  top_countries: { country: string; count: number }[]
  recent_clicks: ClickLog[]
}

export default function URLDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [url, setUrl] = useState<ShortenedURL | null>(null)
  const [stats, setStats] = useState<URLStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("access_token")
    try {
      // Fetch URL details
      const urlResponse = await fetch(
        `${API_URL}/api/v1/tools/urls/${params.id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!urlResponse.ok) {
        setError("URL not found")
        return
      }
      const urlData = await urlResponse.json()
      setUrl(urlData)

      // Fetch stats
      const statsResponse = await fetch(
        `${API_URL}/api/v1/tools/urls/${params.id}/stats/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getShortUrl = useCallback(() => {
    if (!url) return ""
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
    return `${baseUrl}/s/${url.short_code}`
  }, [url])

  const handleCopy = async () => {
    if (url) {
      try {
        await navigator.clipboard.writeText(getShortUrl())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy")
      }
    }
  }

  const generateQrCode = async () => {
    if (!url) return
    const shortUrl = getShortUrl()
    // Use QR code API to generate QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`
    setQrDataUrl(qrApiUrl)
    setShowQrModal(true)
  }

  const downloadQrCode = async () => {
    if (!qrDataUrl || !url) return
    try {
      const response = await fetch(qrDataUrl)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `qr-${url.short_code}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error("Failed to download QR code")
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Icon name="Smartphone" size={16} />
      case "tablet":
        return <Icon name="Tablet" size={16} />
      case "bot":
        return <Icon name="Bot" size={16} />
      default:
        return <Icon name="Monitor" size={16} />
    }
  }

  // Calculate device stats from recent clicks
  const deviceStats = stats?.recent_clicks.reduce(
    (acc, click) => {
      const type = click.device_type || "desktop"
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Calculate browser stats
  const browserStats = stats?.recent_clicks.reduce(
    (acc, click) => {
      const browser = click.browser || "Unknown"
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Calculate OS stats
  const osStats = stats?.recent_clicks.reduce(
    (acc, click) => {
      const os = click.os || "Unknown"
      acc[os] = (acc[os] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  if (isLoading) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !url) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center h-screen gap-4">
            <p className="text-destructive">{error || "URL not found"}</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/tools/url-shortener">URL Shortener</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Back button and title */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/tools/url-shortener">
                <Icon name="ArrowLeft" size={16} />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {url.title || "Untitled URL"}
              </h1>
              <p className="text-sm text-muted-foreground truncate max-w-xl">
                {url.original_url}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-muted px-3 py-1.5 rounded text-sm">
                {getShortUrl()}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                <Icon name="Copy" size={16} className={copied ? "text-green-500" : ""} />
              </Button>
              <Button variant="outline" size="icon" onClick={generateQrCode}>
                <Icon name="QrCode" size={16} />
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={url.original_url} target="_blank" rel="noopener noreferrer">
                  <Icon name="ExternalLink" size={16} />
                </a>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <Icon name="MousePointer" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_clicks || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
                <Icon name="Clock" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.clicks_today || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Icon name="TrendingUp" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.clicks_this_week || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Icon name="Globe" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.clicks_this_month || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Device Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Devices</CardTitle>
              </CardHeader>
              <CardContent>
                {deviceStats && Object.keys(deviceStats).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(deviceStats).map(([device, count]) => (
                      <div key={device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device)}
                          <span className="text-sm capitalize">{device}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Browsers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Browsers</CardTitle>
              </CardHeader>
              <CardContent>
                {browserStats && Object.keys(browserStats).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(browserStats)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([browser, count]) => (
                        <div key={browser} className="flex items-center justify-between">
                          <span className="text-sm">{browser || "Unknown"}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Operating Systems */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Operating Systems</CardTitle>
              </CardHeader>
              <CardContent>
                {osStats && Object.keys(osStats).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(osStats)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([os, count]) => (
                        <div key={os} className="flex items-center justify-between">
                          <span className="text-sm">{os || "Unknown"}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Clicks Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recent_clicks && stats.recent_clicks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recent_clicks.map((click) => (
                      <TableRow key={click.id}>
                        <TableCell className="text-sm">
                          {formatDate(click.clicked_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(click.device_type)}
                            <span className="text-sm capitalize">
                              {click.device_type || "desktop"}
                            </span>
                            {click.is_bot && (
                              <Badge variant="outline" className="text-xs">
                                Bot
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {click.browser}
                          {click.browser_version && (
                            <span className="text-muted-foreground ml-1">
                              v{click.browser_version.split(".")[0]}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {click.os}
                          {click.os_version && (
                            <span className="text-muted-foreground ml-1">
                              {click.os_version}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {click.city && click.country
                            ? `${click.city}, ${click.country}`
                            : click.country || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {click.ip_address || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No clicks recorded yet. Share your short URL to start tracking!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Code Modal */}
        {showQrModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">QR Code</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowQrModal(false)}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
              <div className="flex flex-col items-center gap-4">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="rounded-lg border"
                    width={300}
                    height={300}
                  />
                )}
                <p className="text-sm text-muted-foreground text-center break-all">
                  Scan to open:{" "}
                  <code className="bg-muted px-1 rounded text-xs">
                    {getShortUrl()}
                  </code>
                </p>
                <Button onClick={downloadQrCode} className="w-full">
                  <Icon name="Download" size={16} className="mr-2" />
                  Download QR Code
                </Button>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
