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

type PostInfo = {
  title: string
  thumbnail: string
  uploader: string
  description: string
  download_url: string
  type: string
}

export default function InstagramDownloaderPage() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [postInfo, setPostInfo] = useState<PostInfo | null>(null)

  const handleFetchInfo = async () => {
    if (!url) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/tools/download/instagram/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch post info')
      }

      const data = await response.json()
      setPostInfo(data)
    } catch (error) {
      console.error("Error fetching post info:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to fetch post info'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!postInfo?.download_url) return
    window.open(postInfo.download_url, '_blank')
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
                  <BreadcrumbPage>Instagram Downloader</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Icon name="Instagram" size={24} className="text-pink-600" />
              Instagram Downloader
            </h1>
            <p className="text-muted-foreground">
              Download photos and videos from Instagram posts, reels, and stories.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enter Instagram URL</CardTitle>
              <CardDescription>Paste the Instagram post/reel URL to download</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.instagram.com/p/..."
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

          {postInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Post Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {postInfo.thumbnail && (
                    <img
                      src={postInfo.thumbnail}
                      alt={postInfo.title}
                      className="w-48 h-auto rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{postInfo.title}</h3>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-muted-foreground">By {postInfo.uploader}</span>
                      <Badge variant={postInfo.type === 'video' ? 'default' : 'secondary'}>
                        {postInfo.type}
                      </Badge>
                    </div>
                    {postInfo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {postInfo.description}
                      </p>
                    )}
                    <Button onClick={handleDownload} className="mt-4">
                      <Icon name="Download" size={16} className="mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
