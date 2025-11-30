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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Icon } from "@/components/ui/icon"
import { API_BASE_URL } from "@/lib/api/client"

type PageAnalysis = {
  pageNumber: number
  totalSize: number
  images: number
  imagesSize: number
  fonts: number
  fontsSize: number
  textSize: number
  textLength: number
  contentStreams: number
  contentStreamsSize: number
  thumbnail?: string
}

type PDFAnalysis = {
  fileName: string
  totalSize: number
  pageCount: number
  pages: PageAnalysis[]
  metadata: {
    creator?: string
    producer?: string
    creationDate?: string
    modificationDate?: string
  }
  recommendations: string[]
}

export default function AuditPdfPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<PDFAnalysis | null>(null)

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setAnalysis(null)
      await analyzePDF(file)
    }
  }

  const analyzePDF = async (file: File) => {
    setIsAnalyzing(true)
    try {
      // Send PDF to backend for analysis and thumbnail generation
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/tools/audit-pdf/`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze PDF')
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Error analyzing PDF:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to analyze PDF'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getPageSizeStatus = (size: number, totalSize: number) => {
    const percentage = (size / totalSize) * 100
    if (percentage > 20) return { color: "text-red-600", icon: AlertTriangle }
    if (percentage > 10) return { color: "text-yellow-600", icon: AlertTriangle }
    return { color: "text-green-600", icon: CheckCircle }
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
                  <BreadcrumbPage>Audit PDF</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Audit PDF</h1>
            <p className="text-muted-foreground">
              Analyze PDF file size and content to identify optimization opportunities.
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
            <div className="space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>PDF Summary</CardTitle>
                  <CardDescription>{analysis?.fileName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner className="h-8 w-8 text-[#005357]" />
                      <span className="ml-3">Analyzing PDF...</span>
                    </div>
                  ) : analysis ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Size</p>
                          <p className="text-2xl font-bold">{formatBytes(analysis.totalSize)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pages</p>
                          <p className="text-2xl font-bold">{analysis.pageCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Page Size</p>
                          <p className="text-2xl font-bold">
                            {formatBytes(analysis.totalSize / analysis.pageCount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Images</p>
                          <p className="text-2xl font-bold">
                            {analysis.pages.reduce((sum, p) => sum + p.images, 0)}
                          </p>
                        </div>
                      </div>

                      {/* Metadata */}
                      {Object.values(analysis.metadata).some(v => v) && (
                        <div className="pt-4 border-t">
                          <h3 className="font-medium mb-2">Metadata</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {analysis.metadata.creator && (
                              <>
                                <span className="text-muted-foreground">Creator:</span>
                                <span>{analysis.metadata.creator}</span>
                              </>
                            )}
                            {analysis.metadata.producer && (
                              <>
                                <span className="text-muted-foreground">Producer:</span>
                                <span>{analysis.metadata.producer}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </CardContent>
              </Card>

              {/* Recommendations */}
              {analysis && analysis.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Info" size={20} />
                      Optimization Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Page Analysis */}
              {analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Page-by-Page Analysis</CardTitle>
                    <CardDescription>Visual breakdown of each page's content and size</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {analysis.pages.map((page) => {
                        // Calculate total from all components
                        const total = page.imagesSize + page.textSize + page.fontsSize + page.contentStreamsSize
                        const actualTotal = total > 0 ? total : page.totalSize

                        const imagesPercent = actualTotal > 0 ? (page.imagesSize / actualTotal) * 100 : 0
                        const textPercent = actualTotal > 0 ? (page.textSize / actualTotal) * 100 : 0
                        const fontsPercent = actualTotal > 0 ? (page.fontsSize / actualTotal) * 100 : 0
                        const contentPercent = actualTotal > 0 ? (page.contentStreamsSize / actualTotal) * 100 : 0

                        return (
                          <div key={page.pageNumber} className="relative group">
                            <div className="aspect-[3/4] rounded-lg border-2 border-muted overflow-hidden hover:border-[#005357] transition-all hover:shadow-lg">
                              {/* Thumbnail */}
                              {page.thumbnail ? (
                                <img
                                  src={page.thumbnail}
                                  alt={`Page ${page.pageNumber}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                                  <Icon name="FileText" size={48} className="text-muted-foreground opacity-50" />
                                </div>
                              )}

                              {/* Page Number Badge */}
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-black/70 text-white border-0">
                                  Page {page.pageNumber}
                                </Badge>
                              </div>

                              {/* Total Size Badge */}
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-[#005357] text-white border-0">
                                  {formatBytes(actualTotal)}
                                </Badge>
                              </div>

                              {/* Bottom Info Overlay */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pt-8">
                                <div className="space-y-1 text-white text-xs">
                                  {/* Images - Always show if there are images */}
                                  {page.images > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                        {page.images} {page.images === 1 ? 'Image' : 'Images'}
                                      </span>
                                      <span className="font-medium">{formatBytes(page.imagesSize)}</span>
                                    </div>
                                  )}
                                  {/* Show when no images detected but should be there */}
                                  {page.images === 0 && page.imagesSize === 0 && (
                                    <div className="flex items-center justify-between opacity-60">
                                      <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                        No Images
                                      </span>
                                    </div>
                                  )}
                                  {/* Text */}
                                  {page.textLength > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                        {page.textLength} chars
                                      </span>
                                      <span className="font-medium">{formatBytes(page.textSize)}</span>
                                    </div>
                                  )}
                                  {/* Fonts */}
                                  {page.fonts > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                                        {page.fonts} {page.fonts === 1 ? 'Font' : 'Fonts'}
                                      </span>
                                      <span className="font-medium">{formatBytes(page.fontsSize)}</span>
                                    </div>
                                  )}
                                  {/* Content Streams */}
                                  {page.contentStreamsSize > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                        Other
                                      </span>
                                      <span className="font-medium">{formatBytes(page.contentStreamsSize)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Hover Overlay with Percentage */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="text-white text-center space-y-1.5">
                                  {imagesPercent > 0 && (
                                    <div>
                                      <div className="text-2xl font-bold">{imagesPercent.toFixed(1)}%</div>
                                      <div className="text-xs opacity-90">Images</div>
                                    </div>
                                  )}
                                  {textPercent > 0 && (
                                    <div>
                                      <div className="text-lg font-bold">{textPercent.toFixed(1)}%</div>
                                      <div className="text-xs opacity-90">Text</div>
                                    </div>
                                  )}
                                  {fontsPercent > 0 && (
                                    <div>
                                      <div className="text-lg font-bold">{fontsPercent.toFixed(1)}%</div>
                                      <div className="text-xs opacity-90">Fonts</div>
                                    </div>
                                  )}
                                  {contentPercent > 0 && (
                                    <div>
                                      <div className="text-lg font-bold">{contentPercent.toFixed(1)}%</div>
                                      <div className="text-xs opacity-90">Other</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upload Another */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPdfFile(null)
                    setAnalysis(null)
                  }}
                >
                  Analyze Another PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
