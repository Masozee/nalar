"use client"

import * as React from "react"
import { useState } from "react"

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
import { TopNavbar } from "@/components/top-navbar"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Icon } from "@/components/ui/icon"
import { API_BASE_URL } from "@/lib/api/client"

type TweetInfo = {
  title: string
  thumbnail: string
  uploader: string
  description: string
  formats: Array<{
    format_id: string
    ext: string
    resolution: string | number
    filesize: number
  }>
  download_url: string
}

export default function TwitterDownloaderPage() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tweetInfo, setTweetInfo] = useState<TweetInfo | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return "Unknown"
    const mb = bytes / (1024 * 1024)
    if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`
    return `${mb.toFixed(2)} MB`
  }

  const handleFetchInfo = async () => {
    if (!url) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/tools/download/twitter/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch tweet info')
      }

      const data = await response.json()
      setTweetInfo(data)
    } catch (error) {
      console.error("Error fetching tweet info:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to fetch tweet info'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!tweetInfo?.download_url) return
    window.open(tweetInfo.download_url, '_blank')
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
                  <BreadcrumbLink href="/tools">Tools</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Twitter/X Downloader</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Icon name="Twitter" size={24} className="text-blue-500" />
              Twitter/X Downloader
            </h1>
            <p className="text-muted-foreground">
              Download videos from Twitter/X posts.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enter Twitter/X URL</CardTitle>
              <CardDescription>Paste the tweet URL containing a video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://twitter.com/.../status/... or https://x.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchInfo()}
                />
                <Button onClick={handleFetchInfo} disabled={isLoading || !url}>
                  {isLoading ? <Spinner className="h-4 w-4" /> : 'Fetch Info'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {tweetInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Tweet Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {tweetInfo.thumbnail && (
                    <img
                      src={tweetInfo.thumbnail}
                      alt={tweetInfo.title}
                      className="w-48 h-auto rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{tweetInfo.title}</h3>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-muted-foreground">By {tweetInfo.uploader}</span>
                    </div>
                    {tweetInfo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {tweetInfo.description}
                      </p>
                    )}
                    <Button onClick={handleDownload} className="mt-4">
                      <Icon name="Download" size={16} className="mr-2" />
                      Download Best Quality
                    </Button>
                  </div>
                </div>

                {tweetInfo.formats && tweetInfo.formats.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Available Formats</h4>
                    <div className="grid gap-2">
                      {tweetInfo.formats.map((format) => (
                        <div
                          key={format.format_id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex gap-3">
                            <Badge variant="outline">{format.ext.toUpperCase()}</Badge>
                            <span className="text-sm">{format.resolution}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatFileSize(format.filesize)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDownload}
                          >
                            <Icon name="Download" size={12} className="mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
