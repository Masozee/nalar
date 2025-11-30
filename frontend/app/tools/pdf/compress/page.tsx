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
import { Icon } from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const compressionLevels = [
  { value: "low", label: "Low Compression", description: "Best quality, larger file" },
  { value: "medium", label: "Medium Compression", description: "Balanced quality and size" },
  { value: "high", label: "High Compression", description: "Smaller file, reduced quality" },
]

export default function CompressPdfPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState("")
  const [pageCount, setPageCount] = useState(0)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState<number | null>(null)
  const [compressionLevel, setCompressionLevel] = useState("medium")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfThumbnail, setPdfThumbnail] = useState<string>("")

  useEffect(() => {
    import('pdfjs-dist').then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs'
    })
  }, [])

  const generateThumbnail = async (arrayBuffer: ArrayBuffer) => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(1)
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

        setPdfThumbnail(canvas.toDataURL())
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setFileName(file.name)
      setOriginalSize(file.size)
      setCompressedSize(null)

      const arrayBuffer = await file.arrayBuffer()
      setPdfBytes(arrayBuffer)

      const pdfDoc = await PDFDocument.load(arrayBuffer)
      setPageCount(pdfDoc.getPageCount())

      generateThumbnail(arrayBuffer)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleCompress = async () => {
    if (!pdfBytes) return

    setIsProcessing(true)
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes)

      // Note: pdf-lib doesn't have built-in compression options
      // This is a simplified version - for real compression you'd need backend support
      // or use libraries like pdf.js with compression capabilities

      // Remove unused objects and optimize
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      })

      setCompressedSize(compressedPdfBytes.length)

      // Download
      const blob = new Blob([new Uint8Array(compressedPdfBytes)], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const baseName = fileName.replace(".pdf", "")
      link.href = url
      link.download = `${baseName}-compressed.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error compressing PDF:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setPdfFile(null)
    setPdfBytes(null)
    setFileName("")
    setPageCount(0)
    setOriginalSize(0)
    setCompressedSize(null)
    setCompressionLevel("medium")
    setPdfThumbnail("")
  }

  const compressionRatio =
    originalSize > 0 && compressedSize
      ? Math.round((1 - compressedSize / originalSize) * 100)
      : 0

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
                  <BreadcrumbPage>Compress PDF</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compress PDF</h1>
            <p className="text-muted-foreground">
              Reduce PDF file size while maintaining quality.
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="FileText" size={20} className="text-muted-foreground" />
                    <span className="font-medium truncate">{fileName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pageCount} pages
                  </p>
                </div>

                {pdfThumbnail && (
                  <div className="rounded-lg border overflow-hidden">
                    <img
                      src={pdfThumbnail}
                      alt="PDF Preview"
                      className="w-full h-auto"
                    />
                    <p className="text-xs text-center text-muted-foreground p-2 bg-muted/50">
                      Page 1 Preview
                    </p>
                  </div>
                )}

                <div>
                  <Label>Compression Level</Label>
                  <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {compressionLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <span className="font-medium">{level.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {level.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                  <Icon name="AlertCircle" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-800 dark:text-amber-200">
                    Browser-based compression has limitations. For better results with large files, use our backend API.
                  </p>
                </div>

                <Button
                  onClick={handleCompress}
                  className="w-full bg-[#005357] hover:bg-[#004145]"
                  disabled={isProcessing}
                >
                  <Icon name="Shrink" size={16} className="mr-2" />
                  {isProcessing ? "Processing..." : "Compress & Download"}
                </Button>

                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Reset
                </Button>
              </div>

              {/* Size Comparison */}
              <div className="lg:col-span-2">
                <div className="border rounded-lg p-6 bg-card">
                  <h3 className="font-medium mb-6">File Size Comparison</h3>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="h-32 w-32 mx-auto rounded-full border-8 border-muted flex items-center justify-center mb-4">
                        <Icon name="FileText" size={48} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Original</p>
                      <p className="text-2xl font-bold">{formatBytes(originalSize)}</p>
                    </div>

                    <div className="text-center">
                      <div
                        className={`h-32 w-32 mx-auto rounded-full border-8 flex items-center justify-center mb-4 ${
                          compressedSize
                            ? "border-green-500"
                            : "border-muted border-dashed"
                        }`}
                      >
                        <Shrink
                          className={`h-12 w-12 ${
                            compressedSize
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">Compressed</p>
                      <p className="text-2xl font-bold">
                        {compressedSize ? formatBytes(compressedSize) : "—"}
                      </p>
                    </div>
                  </div>

                  {compressedSize && (
                    <div className="mt-8 pt-6 border-t text-center">
                      {compressionRatio > 0 ? (
                        <p className="text-lg">
                          File size reduced by{" "}
                          <span className="text-green-600 font-bold">
                            {compressionRatio}%
                          </span>
                        </p>
                      ) : (
                        <p className="text-lg text-muted-foreground">
                          File could not be compressed further
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
