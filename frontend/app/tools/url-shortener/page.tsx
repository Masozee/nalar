"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { TopNavbar } from "@/components/top-navbar"
import { Icon } from "@/components/ui/icon"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { DataTable } from "@/components/ui/data-table"
import { createUrlShortenerColumns, type ShortenedURL } from "./columns"
import { API_BASE_URL } from "@/lib/api/client"

const API_URL = API_BASE_URL.replace('/api/v1', '')

export default function URLShortenerPage() {
  const [urls, setUrls] = useState<ShortenedURL[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingUrl, setEditingUrl] = useState<ShortenedURL | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    original_url: "",
    title: "",
    short_code: "",
    expires_at: "",
    password: "",
  })

  const fetchUrls = async () => {
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_URL}/api/v1/tools/urls/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const urlList = data.results || data
        setUrls(urlList)
      } else {
        setError("Failed to fetch URLs")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUrls()
  }, [])

  const filteredUrls = useMemo(() => {
    if (searchQuery) {
      return urls.filter(
        (url) =>
          url.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          url.original_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          url.short_code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return urls
  }, [searchQuery, urls])

  const handleOpenCreate = () => {
    setEditingUrl(null)
    setFormData({
      original_url: "",
      title: "",
      short_code: "",
      expires_at: "",
      password: "",
    })
    setIsOpen(true)
  }

  const handleOpenEdit = (url: ShortenedURL) => {
    setEditingUrl(url)
    setFormData({
      original_url: url.original_url,
      title: url.title || "",
      short_code: url.short_code,
      expires_at: url.expires_at ? url.expires_at.split("T")[0] : "",
      password: "",
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("access_token")

    const payload: Record<string, string | null> = {
      original_url: formData.original_url,
      title: formData.title,
      expires_at: formData.expires_at || null,
    }

    // Include short_code for both create and edit
    if (formData.short_code) {
      payload.short_code = formData.short_code
    }

    if (formData.password) {
      payload.password = formData.password
    }

    try {
      const url = editingUrl
        ? `${API_URL}/api/v1/tools/urls/${editingUrl.id}/`
        : `${API_URL}/api/v1/tools/urls/`

      const response = await fetch(url, {
        method: editingUrl ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setIsOpen(false)
        fetchUrls()
      } else {
        const data = await response.json()
        setError(data.detail || "Failed to save URL")
      }
    } catch (err) {
      setError("Failed to connect to server")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this URL?")) return

    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(
        `${API_URL}/api/v1/tools/urls/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (response.ok) {
        fetchUrls()
      } else {
        setError("Failed to delete URL")
      }
    } catch (err) {
      setError("Failed to connect to server")
    }
  }

  const getFrontendUrl = () => {
    return process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  }

  const handleCopy = async (shortCode: string, id: string) => {
    try {
      const frontendUrl = `${getFrontendUrl()}/s/${shortCode}`
      await navigator.clipboard.writeText(frontendUrl)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy")
    }
  }

  const handleDownloadQr = async (shortCode: string, title: string) => {
    const shortUrl = `${getFrontendUrl()}/s/${shortCode}`
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`
    try {
      const response = await fetch(qrApiUrl)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `qr-${shortCode}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error("Failed to download QR code")
    }
  }

  const columns = useMemo(
    () =>
      createUrlShortenerColumns(
        handleOpenEdit,
        handleDelete,
        handleCopy,
        handleDownloadQr,
        copiedId
      ),
    [copiedId]
  )

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
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
                  <BreadcrumbPage>URL Shortener</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">URL Shortener</h1>
            <p className="text-muted-foreground">
              Create and manage shortened URLs with click tracking.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Search and Add Button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search URLs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button
              onClick={handleOpenCreate}
              className="bg-[#005357] hover:bg-[#004145] text-white"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Create Short URL
            </Button>
          </div>

          {/* URLs Table */}
          <DataTable
            columns={columns}
            data={filteredUrls}
            isLoading={isLoading}
            emptyMessage={
              searchQuery
                ? "No URLs match your search."
                : "No shortened URLs yet. Create your first one."
            }
          />
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingUrl ? "Edit Short URL" : "Create Short URL"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="original_url">Original URL</FieldLabel>
                  <Input
                    id="original_url"
                    type="url"
                    value={formData.original_url}
                    onChange={(e) =>
                      setFormData({ ...formData, original_url: e.target.value })
                    }
                    placeholder="https://example.com/very-long-url"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="title">Title (Optional)</FieldLabel>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="My Link"
                  />
                  <FieldDescription>
                    A friendly name to identify this link.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="short_code">
                    Short Code {!editingUrl && "(Optional)"}
                  </FieldLabel>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {getFrontendUrl()}/s/
                    </span>
                    <Input
                      id="short_code"
                      value={formData.short_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          short_code: e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                        })
                      }
                      placeholder={editingUrl ? "" : "mylink"}
                      className="flex-1"
                      required={!!editingUrl}
                    />
                  </div>
                  <FieldDescription>
                    {editingUrl
                      ? "Change the short code for this URL. Only letters and numbers allowed."
                      : "Leave empty to auto-generate. Only letters and numbers allowed."}
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="expires_at">
                    Expiration Date (Optional)
                  </FieldLabel>
                  <Input
                    id="expires_at"
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) =>
                      setFormData({ ...formData, expires_at: e.target.value })
                    }
                  />
                  <FieldDescription>
                    Leave empty for permanent link.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">
                    Password Protection (Optional)
                  </FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter password"
                  />
                  <FieldDescription>
                    Users will need to enter this password to access the link.
                  </FieldDescription>
                </Field>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#005357] hover:bg-[#004145] text-white"
                  >
                    {editingUrl ? "Update" : "Create"}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
