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
import { Icon } from "@/components/ui/icon"

type PdfFileItem = {
  id: string
  file: File
  name: string
  pageCount: number
  bytes: ArrayBuffer
  thumbnail?: string
}

export default function MergePdfPage() {
  const [pdfFiles, setPdfFiles] = useState<PdfFileItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    import('pdfjs-dist').then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs'
    })
  }, [])

  const generateThumbnail = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 0.3 })
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")

      canvas.width = viewport.width
      canvas.height = viewport.height

      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise

        return canvas.toDataURL()
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error)
    }
    return ""
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: PdfFileItem[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const thumbnail = await generateThumbnail(arrayBuffer)

        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          name: file.name,
          pageCount: pdfDoc.getPageCount(),
          bytes: arrayBuffer,
          thumbnail,
        })
      }
    }

    setPdfFiles((prev) => [...prev, ...newFiles])
    e.target.value = ""
  }

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...pdfFiles]
    const draggedItem = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedItem)
    setPdfFiles(newFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newFiles = [...pdfFiles]
    ;[newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]]
    setPdfFiles(newFiles)
  }

  const moveDown = (index: number) => {
    if (index === pdfFiles.length - 1) return
    const newFiles = [...pdfFiles]
    ;[newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
    setPdfFiles(newFiles)
  }

  const handleMerge = async () => {
    if (pdfFiles.length < 2) return

    setIsProcessing(true)
    try {
      const mergedPdf = await PDFDocument.create()

      for (const pdfFile of pdfFiles) {
        const srcDoc = await PDFDocument.load(pdfFile.bytes)
        const copiedPages = await mergedPdf.copyPages(
          srcDoc,
          srcDoc.getPageIndices()
        )
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page)
        })
      }

      const mergedPdfBytes = await mergedPdf.save()

      // Download
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "merged.pdf"
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error merging PDFs:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setPdfFiles([])
  }

  const totalPages = pdfFiles.reduce((sum, f) => sum + f.pageCount, 0)

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
                  <BreadcrumbPage>Merge PDF</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Merge PDF</h1>
            <p className="text-muted-foreground">
              Combine multiple PDF files into one document.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Controls */}
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Icon name="Upload" size={32} className="text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Click to add PDF files
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or drag and drop
                  </p>
                </label>
              </div>

              {pdfFiles.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{pdfFiles.length}</span> files
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {totalPages} pages total
                  </p>
                </div>
              )}

              <Button
                onClick={handleMerge}
                className="w-full bg-[#005357] hover:bg-[#004145]"
                disabled={pdfFiles.length < 2 || isProcessing}
              >
                <Icon name="Merge" size={16} className="mr-2" />
                {isProcessing ? "Processing..." : "Merge & Download"}
              </Button>

              {pdfFiles.length > 0 && (
                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {/* File List */}
            <div className="lg:col-span-3">
              {pdfFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 bg-muted/30 h-64">
                  <Icon name="FileText" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Add at least 2 PDF files to merge
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Drag to reorder files. Files will be merged in this order.
                  </p>
                  {pdfFiles.map((pdfFile, index) => (
                    <div
                      key={pdfFile.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border bg-card
                        transition-all cursor-grab active:cursor-grabbing
                        ${draggedIndex === index ? "opacity-50 scale-95" : ""}
                      `}
                    >
                      <Icon name="GripVertical" size={20} className="text-muted-foreground flex-shrink-0" />
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-16 w-12 rounded border overflow-hidden flex items-center justify-center flex-shrink-0 bg-muted">
                          {pdfFile.thumbnail ? (
                            <img
                              src={pdfFile.thumbnail}
                              alt={pdfFile.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Icon name="FileText" size={24} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{pdfFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {pdfFile.pageCount} pages
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                        >
                          <span className="text-lg">↑</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveDown(index)}
                          disabled={index === pdfFiles.length - 1}
                        >
                          <span className="text-lg">↓</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeFile(pdfFile.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <label
                    htmlFor="pdf-upload"
                    className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors text-muted-foreground"
                  >
                    <Icon name="Plus" size={16} />
                    Add more files
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
