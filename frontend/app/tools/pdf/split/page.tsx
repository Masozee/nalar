"use client"

import * as React from "react"
import { useState, useEffect } from "react"

import { PDFDocument } from "pdf-lib"

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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Icon } from "@/components/ui/icon"

export default function SplitPdfPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState("")
  const [pageCount, setPageCount] = useState(0)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [pageRange, setPageRange] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pageThumbnails, setPageThumbnails] = useState<string[]>([])

  useEffect(() => {
    // Dynamically import pdfjs-dist only on client-side
    import('pdfjs-dist').then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs'
    })
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setFileName(file.name)

      const arrayBuffer = await file.arrayBuffer()
      setPdfBytes(arrayBuffer)

      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const count = pdfDoc.getPageCount()
      setPageCount(count)
      setSelectedPages([])
      setPageRange("")

      // Generate thumbnails
      generateThumbnails(arrayBuffer, count)
    }
  }

  const generateThumbnails = async (arrayBuffer: ArrayBuffer, count: number) => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const thumbnails: string[] = []

      for (let i = 1; i <= count; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.5 })
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")

        canvas.width = viewport.width
        canvas.height = viewport.height

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise

          thumbnails.push(canvas.toDataURL())
        }
      }

      setPageThumbnails(thumbnails)
    } catch (error) {
      console.error("Error generating thumbnails:", error)
    }
  }

  const parsePageRange = (range: string): number[] => {
    const pages: Set<number> = new Set()
    const parts = range.replace(/\s/g, "").split(",")

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number)
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(pageCount, end); i++) {
            pages.add(i)
          }
        }
      } else {
        const num = parseInt(part)
        if (!isNaN(num) && num >= 1 && num <= pageCount) {
          pages.add(num)
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b)
  }

  const handlePageRangeChange = (value: string) => {
    setPageRange(value)
    if (value) {
      const pages = parsePageRange(value)
      setSelectedPages(pages)
    } else {
      setSelectedPages([])
    }
  }

  const togglePage = (page: number) => {
    setSelectedPages((prev) => {
      if (prev.includes(page)) {
        return prev.filter((p) => p !== page)
      }
      return [...prev, page].sort((a, b) => a - b)
    })
    setPageRange("")
  }

  const selectAll = () => {
    setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1))
    setPageRange("")
  }

  const selectNone = () => {
    setSelectedPages([])
    setPageRange("")
  }

  const selectOdd = () => {
    setSelectedPages(
      Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p % 2 === 1)
    )
    setPageRange("")
  }

  const selectEven = () => {
    setSelectedPages(
      Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p % 2 === 0)
    )
    setPageRange("")
  }

  const handleSplit = async () => {
    if (!pdfBytes || selectedPages.length === 0) return

    setIsProcessing(true)
    try {
      const srcDoc = await PDFDocument.load(pdfBytes)
      const newDoc = await PDFDocument.create()

      const pageIndices = selectedPages.map((p) => p - 1)
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices)

      copiedPages.forEach((page) => {
        newDoc.addPage(page)
      })

      const newPdfBytes = await newDoc.save()

      // Download
      const blob = new Blob([new Uint8Array(newPdfBytes)], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const baseName = fileName.replace(".pdf", "")
      link.href = url
      link.download = `${baseName}-split.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error splitting PDF:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setPdfFile(null)
    setPdfBytes(null)
    setFileName("")
    setPageCount(0)
    setSelectedPages([])
    setPageRange("")
    setPageThumbnails([])
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
                  <BreadcrumbPage>Split PDF</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Split PDF</h1>
            <p className="text-muted-foreground">
              Extract specific pages from a PDF document.
            </p>
          </div>

          {!pdfFile ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 bg-muted/30">
              <Icon name="Upload" size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Drag and drop a PDF file or click to browse
              </p>
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="max-w-xs"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="FileText" size={20} className="text-muted-foreground" />
                    <span className="font-medium truncate">{fileName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pageCount} pages total
                  </p>
                </div>

                <div>
                  <Label>Page Range</Label>
                  <Input
                    placeholder="e.g., 1-3, 5, 7-10"
                    value={pageRange}
                    onChange={(e) => handlePageRangeChange(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter page numbers or ranges separated by commas
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    All
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectNone}>
                    None
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectOdd}>
                    Odd
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectEven}>
                    Even
                  </Button>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{selectedPages.length}</span> pages
                    selected
                  </p>
                  {selectedPages.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Pages: {selectedPages.join(", ")}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSplit}
                  className="w-full bg-[#005357] hover:bg-[#004145]"
                  disabled={selectedPages.length === 0 || isProcessing}
                >
                  <Icon name="Scissors" size={16} className="mr-2" />
                  {isProcessing ? "Processing..." : "Split & Download"}
                </Button>

                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Reset
                </Button>
              </div>

              {/* Page Grid */}
              <div className="lg:col-span-3">
                <p className="text-sm text-muted-foreground mb-3">
                  Click on pages to select/deselect them
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => togglePage(page)}
                      className={`
                        relative aspect-[3/4] rounded-lg border-2 overflow-hidden
                        transition-all hover:scale-105 group
                        ${
                          selectedPages.includes(page)
                            ? "border-[#005357] ring-2 ring-[#005357]/50"
                            : "border-muted hover:border-muted-foreground/50"
                        }
                      `}
                    >
                      {pageThumbnails[page - 1] ? (
                        <img
                          src={pageThumbnails[page - 1]}
                          alt={`Page ${page}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                          <Icon name="FileText" size={48} className="opacity-50" />
                        </div>
                      )}
                      <div className={`
                        absolute bottom-0 left-0 right-0 px-2 py-1.5 text-center font-medium text-sm
                        ${selectedPages.includes(page) ? "bg-[#005357] text-white" : "bg-black/70 text-white group-hover:bg-black/80"}
                      `}>
                        {page}
                      </div>
                      {selectedPages.includes(page) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#005357] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
