"use client"

import * as React from "react"
import { useState, useRef } from "react"

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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Icon } from "@/components/ui/icon"

const formats = [
  { value: "png", label: "PNG", mime: "image/png", description: "Lossless, supports transparency" },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg", description: "Best for photos, smaller size" },
  { value: "webp", label: "WebP", mime: "image/webp", description: "Modern format, best compression" },
  { value: "bmp", label: "BMP", mime: "image/bmp", description: "Uncompressed bitmap" },
  { value: "gif", label: "GIF", mime: "image/gif", description: "Limited colors, supports animation" },
]

export default function ConvertImagePage() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [originalFormat, setOriginalFormat] = useState("")
  const [originalSize, setOriginalSize] = useState(0)
  const [targetFormat, setTargetFormat] = useState("png")
  const [quality, setQuality] = useState(90)
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const detectFormat = (name: string): string => {
    const ext = name.split(".").pop()?.toLowerCase() || ""
    const formatMap: Record<string, string> = {
      jpg: "jpeg",
      jpeg: "jpeg",
      png: "png",
      webp: "webp",
      gif: "gif",
      bmp: "bmp",
    }
    return formatMap[ext] || "unknown"
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setOriginalFormat(detectFormat(file.name))
      setOriginalSize(file.size)

      const reader = new FileReader()
      reader.onload = (event) => {
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

  const handleConvert = () => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const format = formats.find((f) => f.value === targetFormat)
      const mimeType = format?.mime || "image/png"

      let dataUrl: string
      if (targetFormat === "jpeg" || targetFormat === "webp") {
        dataUrl = canvas.toDataURL(mimeType, quality / 100)
      } else {
        dataUrl = canvas.toDataURL(mimeType)
      }

      const link = document.createElement("a")
      const baseName = fileName.split(".").slice(0, -1).join(".") || "image"
      link.download = `${baseName}.${targetFormat}`
      link.href = dataUrl
      link.click()
    }
    img.src = image
  }

  const handleReset = () => {
    setImage(null)
    setFileName("")
    setOriginalFormat("")
    setOriginalSize(0)
    setTargetFormat("png")
    setQuality(90)
    setEstimatedSize(null)
  }

  const getFormatBadgeColor = (format: string): string => {
    const colors: Record<string, string> = {
      png: "bg-blue-100 text-blue-800",
      jpeg: "bg-orange-100 text-orange-800",
      webp: "bg-green-100 text-green-800",
      bmp: "bg-purple-100 text-purple-800",
      gif: "bg-pink-100 text-pink-800",
    }
    return colors[format] || "bg-gray-100 text-gray-800"
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
                  <BreadcrumbPage>Format Converter</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Image Format Converter</h1>
            <p className="text-muted-foreground">
              Convert images between PNG, JPEG, WebP, and other formats.
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
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Current Format</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getFormatBadgeColor(originalFormat)}>
                      {originalFormat.toUpperCase()}
                    </Badge>
                    <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
                    <Badge className={getFormatBadgeColor(targetFormat)}>
                      {targetFormat.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Original size: {formatBytes(originalSize)}
                  </p>
                </div>

                <div>
                  <Label>Target Format</Label>
                  <Select value={targetFormat} onValueChange={setTargetFormat}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div>
                            <span className="font-medium">{format.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {format.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(targetFormat === "jpeg" || targetFormat === "webp") && (
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
                      Higher quality = larger file size
                    </p>
                  </div>
                )}

                <div className="p-3 bg-muted/50 rounded-lg border">
                  <p className="text-sm font-medium mb-1">Format Info</p>
                  <p className="text-xs text-muted-foreground">
                    {formats.find((f) => f.value === targetFormat)?.description}
                  </p>
                  {targetFormat === "jpeg" && (
                    <p className="text-xs text-amber-600 mt-1">
                      Note: JPEG does not support transparency
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleConvert}
                  className="w-full bg-[#005357] hover:bg-[#004145]"
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Convert & Download
                </Button>

                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Reset
                </Button>
              </div>

              {/* Image Preview */}
              <div className="lg:col-span-3">
                <div className="border rounded-lg overflow-hidden bg-[#1a1a1a] p-4">
                  <img
                    src={image}
                    alt="Preview"
                    className="max-w-full h-auto mx-auto"
                    style={{ maxHeight: "500px" }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {fileName}
                </p>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </SidebarInset>
    </SidebarProvider>
  )
}
