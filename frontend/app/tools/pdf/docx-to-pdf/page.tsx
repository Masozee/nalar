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
import { Icon } from "@/components/ui/icon"
import { API_BASE_URL } from "@/lib/api/client"

export default function DocxToPdfPage() {
  const [docxFile, setDocxFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ]
      if (!validTypes.includes(file.type) && !file.name.match(/\.(docx|doc)$/i)) {
        setError("Please select a valid Word document (.doc or .docx)")
        return
      }
      setDocxFile(file)
      setFileName(file.name)
      setFileSize(file.size)
      setError("")
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleConvert = async () => {
    if (!docxFile) return

    setIsProcessing(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      const formData = new FormData()
      formData.append("file", docxFile)

      const response = await fetch(`${API_BASE_URL}/tools/convert/docx-to-pdf/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        const baseName = fileName.replace(/\.(docx|doc)$/i, "")
        link.href = url
        link.download = `${baseName}.pdf`
        link.click()
        URL.revokeObjectURL(url)
      } else {
        const data = await response.json().catch(() => ({}))
        setError(data.detail || data.error || "Conversion failed. Please try again.")
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again later.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setDocxFile(null)
    setFileName("")
    setFileSize(0)
    setError("")
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
                  <BreadcrumbPage>DOCX to PDF</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DOCX to PDF Converter</h1>
            <p className="text-muted-foreground">
              Convert Word documents to PDF format.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/15 text-destructive rounded-lg">
              <Icon name="AlertCircle" size={20} />
              <p>{error}</p>
            </div>
          )}

          <div className="max-w-2xl mx-auto w-full">
            {!docxFile ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 bg-muted/30">
                <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Icon name="FileType" size={24} className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-lg font-medium mb-2">Upload Word Document</p>
                <p className="text-muted-foreground mb-4 text-center">
                  Drag and drop a .doc or .docx file, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="max-w-xs"
                />
              </div>
            ) : (
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Icon name="FileText" size={32} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(fileSize)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="h-16 w-14 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xs font-bold text-blue-600">DOCX</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Word</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-px w-8 bg-border" />
                      <span>→</span>
                      <div className="h-px w-8 bg-border" />
                    </div>
                    <div className="text-center">
                      <div className="h-16 w-14 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xs font-bold text-red-600">PDF</span>
                      </div>
                      <p className="text-sm text-muted-foreground">PDF</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm mb-6">
                  <Icon name="AlertCircle" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-800 dark:text-amber-200">
                    This conversion requires server processing. Your document will be uploaded securely and deleted after conversion.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleConvert}
                    className="flex-1 bg-[#005357] hover:bg-[#004145]"
                    disabled={isProcessing}
                  >
                    <Icon name="Download" size={16} className="mr-2" />
                    {isProcessing ? "Converting..." : "Convert to PDF"}
                  </Button>

                  <Button variant="outline" onClick={handleReset}>
                    <Icon name="RotateCcw" size={16} className="mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {/* Supported formats info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">Supported formats</p>
              <div className="flex justify-center gap-4">
                <div className="px-3 py-1 bg-muted rounded text-sm">.doc</div>
                <div className="px-3 py-1 bg-muted rounded text-sm">.docx</div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
