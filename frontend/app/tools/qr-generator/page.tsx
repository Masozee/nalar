"use client"

import * as React from "react"
import { useState, useEffect } from "react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { TopNavbar } from "@/components/top-navbar"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Icon } from "@/components/ui/icon"
import { API_BASE_URL } from "@/lib/api/client"

type QRCodeRecord = {
  id: string
  content_type: string
  content: string
  title: string
  size: number
  error_correction: string
  foreground_color: string
  background_color: string
  qr_image: string | null
  download_count: number
  is_active: boolean
  created_at: string
}

const contentTypeIcons: Record<string, string> = {
  url: "Link",
  text: "FileText",
  vcard: "User",
  wifi: "Wifi",
  email: "Mail",
  phone: "Phone",
  sms: "MessageSquare",
}

const contentTypeLabels: Record<string, string> = {
  url: "URL",
  text: "Text",
  vcard: "vCard",
  wifi: "WiFi",
  email: "Email",
  phone: "Phone",
  sms: "SMS",
}

export default function QRGeneratorPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeRecord[]>([])
  const [filteredQrCodes, setFilteredQrCodes] = useState<QRCodeRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [formData, setFormData] = useState({
    content_type: "url",
    content: "",
    title: "",
    size: 300,
    error_correction: "M",
    foreground_color: "#000000",
    background_color: "#FFFFFF",
  })

  const fetchQrCodes = async () => {
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_BASE_URL}/tools/qrcodes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const qrList = data.results || data
        setQrCodes(qrList)
        setFilteredQrCodes(qrList)
      } else {
        setError("Failed to fetch QR codes")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQrCodes()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = qrCodes.filter(
        (qr) =>
          qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          qr.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredQrCodes(filtered)
    } else {
      setFilteredQrCodes(qrCodes)
    }
  }, [searchQuery, qrCodes])

  const handleOpenCreate = () => {
    setFormData({
      content_type: "url",
      content: "",
      title: "",
      size: 300,
      error_correction: "M",
      foreground_color: "#000000",
      background_color: "#FFFFFF",
    })
    setPreviewUrl(null)
    setIsOpen(true)
  }

  const generatePreview = async () => {
    if (!formData.content) return

    setIsGenerating(true)
    // Use external QR API for preview
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${formData.size}x${formData.size}&data=${encodeURIComponent(formData.content)}&color=${formData.foreground_color.replace("#", "")}&bgcolor=${formData.background_color.replace("#", "")}`
    setPreviewUrl(qrApiUrl)
    setIsGenerating(false)
  }

  useEffect(() => {
    if (formData.content) {
      const timer = setTimeout(() => {
        generatePreview()
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setPreviewUrl(null)
    }
  }, [formData.content, formData.size, formData.foreground_color, formData.background_color])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("access_token")

    try {
      const response = await fetch(`${API_BASE_URL}/tools/qrcodes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsOpen(false)
        fetchQrCodes()
      } else {
        const data = await response.json()
        setError(data.detail || "Failed to save QR code")
      }
    } catch (err) {
      setError("Failed to connect to server")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this QR code?")) return

    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_BASE_URL}/tools/qrcodes/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        fetchQrCodes()
      } else {
        setError("Failed to delete QR code")
      }
    } catch (err) {
      setError("Failed to connect to server")
    }
  }

  const handleCopyContent = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy")
    }
  }

  const handleDownload = async (qr: QRCodeRecord) => {
    if (qr.qr_image) {
      // Download from server
      try {
        const response = await fetch(qr.qr_image)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `qr-${qr.title || qr.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error("Failed to download")
      }
    } else {
      // Generate and download using external API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr.content)}`
      try {
        const response = await fetch(qrApiUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `qr-${qr.title || qr.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error("Failed to download")
      }
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const truncateContent = (content: string, maxLength = 50) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  const getContentIcon = (type: string) => {
    const iconName = contentTypeIcons[type] || "QrCode"
    return <Icon name={iconName} size={16} />
  }

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
                  <BreadcrumbPage>QR Code Generator</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">QR Code Generator</h1>
            <p className="text-muted-foreground">
              Create and manage QR codes for URLs, text, WiFi, and more.
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
                  placeholder="Search QR codes..."
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
              Create QR Code
            </Button>
          </div>

          {/* QR Codes Table */}
          <div className="rounded-lg border bg-card">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading QR codes...
              </div>
            ) : filteredQrCodes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery
                  ? "No QR codes match your search."
                  : "No QR codes yet. Create your first one."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQrCodes.map((qr) => (
                    <TableRow key={qr.id}>
                      <TableCell>
                        {qr.qr_image ? (
                          <img
                            src={qr.qr_image}
                            alt={qr.title}
                            className="h-12 w-12 rounded border"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded border flex items-center justify-center bg-muted">
                            <Icon name="QrCode" size={24} className="text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        <p className="font-medium break-words">
                          {qr.title || "Untitled"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {getContentIcon(qr.content_type)}
                          {contentTypeLabels[qr.content_type] || qr.content_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p
                          className="text-sm text-muted-foreground truncate"
                          title={qr.content}
                        >
                          {truncateContent(qr.content, 40)}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(qr.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Icon name="MoreHorizontal" size={16} />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(qr)}>
                              <Icon name="Download" size={16} className="mr-2" />
                              Download QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyContent(qr.content, qr.id)}
                            >
                              <Icon name="Copy" size={16} className="mr-2" />
                              {copiedId === qr.id ? "Copied!" : "Copy Content"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(qr.id)}
                              className="text-destructive"
                            >
                              <Icon name="Trash2" size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Create Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create QR Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-6">
                {/* Left side - Form */}
                <div className="space-y-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="content_type">Content Type</FieldLabel>
                      <Select
                        value={formData.content_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, content_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="wifi">WiFi</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="vcard">vCard</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="content">Content</FieldLabel>
                      {formData.content_type === "text" ? (
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) =>
                            setFormData({ ...formData, content: e.target.value })
                          }
                          placeholder="Enter your text..."
                          rows={3}
                          required
                        />
                      ) : (
                        <Input
                          id="content"
                          type={formData.content_type === "url" ? "url" : "text"}
                          value={formData.content}
                          onChange={(e) =>
                            setFormData({ ...formData, content: e.target.value })
                          }
                          placeholder={
                            formData.content_type === "url"
                              ? "https://example.com"
                              : formData.content_type === "email"
                                ? "email@example.com"
                                : formData.content_type === "phone"
                                  ? "+62812345678"
                                  : formData.content_type === "wifi"
                                    ? "WIFI:T:WPA;S:NetworkName;P:Password;;"
                                    : "Enter content..."
                          }
                          required
                        />
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="title">Title (Optional)</FieldLabel>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="My QR Code"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel htmlFor="foreground_color">Foreground</FieldLabel>
                        <div className="flex gap-2">
                          <Input
                            id="foreground_color"
                            type="color"
                            value={formData.foreground_color}
                            onChange={(e) =>
                              setFormData({ ...formData, foreground_color: e.target.value })
                            }
                            className="w-12 h-9 p-1"
                          />
                          <Input
                            value={formData.foreground_color}
                            onChange={(e) =>
                              setFormData({ ...formData, foreground_color: e.target.value })
                            }
                            className="flex-1"
                          />
                        </div>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="background_color">Background</FieldLabel>
                        <div className="flex gap-2">
                          <Input
                            id="background_color"
                            type="color"
                            value={formData.background_color}
                            onChange={(e) =>
                              setFormData({ ...formData, background_color: e.target.value })
                            }
                            className="w-12 h-9 p-1"
                          />
                          <Input
                            value={formData.background_color}
                            onChange={(e) =>
                              setFormData({ ...formData, background_color: e.target.value })
                            }
                            className="flex-1"
                          />
                        </div>
                      </Field>
                    </div>
                  </FieldGroup>
                </div>

                {/* Right side - Preview */}
                <div className="flex flex-col items-center justify-center border rounded-lg bg-muted/30 p-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="QR Preview"
                      className="rounded-lg"
                      style={{ maxWidth: "200px", maxHeight: "200px" }}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Icon name="QrCode" size={24} className="h-16 w-16 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Enter content to preview QR code</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
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
                  disabled={!formData.content}
                >
                  Create QR Code
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
