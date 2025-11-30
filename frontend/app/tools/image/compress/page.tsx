"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"

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
import { Slider } from "@/components/ui/slider"
import { Icon } from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CompressImagePage() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState("jpeg")
  const [maxWidth, setMaxWidth] = useState<number | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageWidth, setImageWidth] = useState(0)
  const [imageHeight, setImageHeight] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setOriginalSize(file.size)

      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setImageWidth(img.width)
          setImageHeight(img.height)
        }
        img.src = event.target?.result as string
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const compressionRatio =
    originalSize > 0 && compressedSize > 0
      ? Math.round((1 - compressedSize / originalSize) * 100)
      : 0

  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      let width = img.width
      let height = img.height

      // Resize if maxWidth is set
      if (maxWidth && width > maxWidth) {
        const ratio = maxWidth / width
        width = maxWidth
        height = Math.round(height * ratio)
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      const mimeType = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png"
      const dataUrl = canvas.toDataURL(mimeType, quality / 100)

      // Calculate compressed size
      const base64Length = dataUrl.split(",")[1].length
      const compSize = Math.round((base64Length * 3) / 4)
      setCompressedSize(compSize)
      setPreviewUrl(dataUrl)
    }
    img.src = image
  }, [image, quality, format, maxWidth])

  const handleDownload = () => {
    if (!previewUrl) return

    const link = document.createElement("a")
    const baseName = fileName.split(".").slice(0, -1).join(".") || "image"
    const ext = format === "jpeg" ? "jpg" : format
    link.download = `compressed-${baseName}.${ext}`
    link.href = previewUrl
    link.click()
  }

  const handleReset = () => {
    setImage(null)
    setFileName("")
    setOriginalSize(0)
    setCompressedSize(0)
    setQuality(80)
    setFormat("jpeg")
    setMaxWidth(null)
    setPreviewUrl(null)
    setImageWidth(0)
    setImageHeight(0)
  }

  const presetWidths = [
    { label: "Original", value: null },
    { label: "1920px", value: 1920 },
    { label: "1280px", value: 1280 },
    { label: "800px", value: 800 },
    { label: "640px", value: 640 },
  ]

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
                  <BreadcrumbPage>Compress Image</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compress Image</h1>
            <p className="text-muted-foreground">
              Reduce image file size while maintaining quality.
            </p>
          </div>

          {!image ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 bg-muted/30">
              <Icon name="Upload" size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Drag and drop an image or click to browse
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="max-w-xs"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                {/* Size Comparison */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Original</p>
                      <p className="font-semibold">{formatBytes(originalSize)}</p>
                      <p className="text-xs text-muted-foreground">
                        {imageWidth} x {imageHeight}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Compressed</p>
                      <p className="font-semibold text-green-600">
                        {formatBytes(compressedSize)}
                      </p>
                      {maxWidth && maxWidth < imageWidth && (
                        <p className="text-xs text-muted-foreground">
                          {maxWidth} x {Math.round((imageHeight * maxWidth) / imageWidth)}
                        </p>
                      )}
                    </div>
                  </div>
                  {compressionRatio > 0 && (
                    <div className="mt-3 pt-3 border-t text-center">
                      <p className="text-sm">
                        <span className="text-green-600 font-semibold">
                          {compressionRatio}% smaller
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Output Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpeg">JPEG (Best for photos)</SelectItem>
                      <SelectItem value="webp">WebP (Best compression)</SelectItem>
                      <SelectItem value="png">PNG (Lossless)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(format === "jpeg" || format === "webp") && (
                  <div>
                    <div className="flex justify-between">
                      <Label>Quality</Label>
                      <span className="text-sm text-muted-foreground">{quality}%</span>
                    </div>
                    <Slider
                      value={[quality]}
                      onValueChange={([value]) => setQuality(value)}
                      min={10}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lower quality = smaller file size
                    </p>
                  </div>
                )}

                <div>
                  <Label>Max Width</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {presetWidths.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={maxWidth === preset.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMaxWidth(preset.value)}
                        className={
                          maxWidth === preset.value
                            ? "bg-[#005357] hover:bg-[#004145]"
                            : ""
                        }
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {format === "jpeg" && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                    <Icon name="AlertCircle" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-800 dark:text-amber-200">
                      JPEG does not support transparency. Transparent areas will become white.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleDownload}
                  className="w-full bg-[#005357] hover:bg-[#004145]"
                  disabled={!previewUrl}
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Download Compressed
                </Button>

                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Reset
                </Button>
              </div>

              {/* Image Preview */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 text-center">
                      Original ({formatBytes(originalSize)})
                    </p>
                    <div className="border rounded-lg overflow-hidden bg-[#1a1a1a] p-2">
                      <img
                        src={image}
                        alt="Original"
                        className="max-w-full h-auto mx-auto"
                        style={{ maxHeight: "400px" }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 text-center">
                      Compressed ({formatBytes(compressedSize)})
                    </p>
                    <div className="border rounded-lg overflow-hidden bg-[#1a1a1a] p-2">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Compressed"
                          className="max-w-full h-auto mx-auto"
                          style={{ maxHeight: "400px" }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                          Processing...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </SidebarInset>
    </SidebarProvider>
  )
}
