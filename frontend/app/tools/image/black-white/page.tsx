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

const filterModes = [
  { value: "grayscale", label: "Grayscale (Standard)" },
  { value: "luminosity", label: "Luminosity" },
  { value: "average", label: "Average" },
  { value: "sepia", label: "Sepia Tone" },
  { value: "highContrast", label: "High Contrast B&W" },
]

export default function BlackWhitePage() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [filterMode, setFilterMode] = useState("grayscale")
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const applyFilter = (ctx: CanvasRenderingContext2D, imageData: ImageData) => {
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      let gray: number

      switch (filterMode) {
        case "luminosity":
          gray = 0.21 * r + 0.72 * g + 0.07 * b
          break
        case "average":
          gray = (r + g + b) / 3
          break
        case "sepia":
          data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b)
          data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b)
          data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b)
          continue
        case "highContrast":
          gray = 0.299 * r + 0.587 * g + 0.114 * b
          gray = gray > 128 ? 255 : 0
          break
        default: // grayscale
          gray = 0.299 * r + 0.587 * g + 0.114 * b
      }

      if (filterMode !== "sepia") {
        // Apply brightness
        gray = gray * (brightness / 100)

        // Apply contrast
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
        gray = factor * (gray - 128) + 128

        gray = Math.max(0, Math.min(255, gray))

        data[i] = gray
        data[i + 1] = gray
        data[i + 2] = gray
      }
    }

    return imageData
  }

  useEffect(() => {
    if (!image || !previewCanvasRef.current) return

    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Scale for preview
      const maxSize = 500
      let width = img.width
      let height = img.height

      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height)
        width = width * ratio
        height = height * ratio
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      const imageData = ctx.getImageData(0, 0, width, height)
      const filtered = applyFilter(ctx, imageData)
      ctx.putImageData(filtered, 0, 0)

      setPreviewUrl(canvas.toDataURL())
    }
    img.src = image
  }, [image, filterMode, brightness, contrast])

  const handleDownload = () => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      const filtered = applyFilter(ctx, imageData)
      ctx.putImageData(filtered, 0, 0)

      const link = document.createElement("a")
      const ext = fileName.split(".").pop()?.toLowerCase() || "png"
      link.download = `bw-${fileName || "image.png"}`
      link.href = canvas.toDataURL(`image/${ext === "jpg" ? "jpeg" : ext}`)
      link.click()
    }
    img.src = image
  }

  const handleReset = () => {
    setImage(null)
    setFileName("")
    setFilterMode("grayscale")
    setBrightness(100)
    setContrast(100)
    setPreviewUrl(null)
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
                  <BreadcrumbPage>Black & White</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Black & White Converter</h1>
            <p className="text-muted-foreground">
              Convert your images to black and white or sepia tones.
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
                <div>
                  <Label>Filter Mode</Label>
                  <Select value={filterMode} onValueChange={setFilterMode}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filterMode !== "sepia" && (
                  <>
                    <div>
                      <div className="flex justify-between">
                        <Label>Brightness</Label>
                        <span className="text-sm text-muted-foreground">{brightness}%</span>
                      </div>
                      <Slider
                        value={[brightness]}
                        onValueChange={([value]) => setBrightness(value)}
                        min={50}
                        max={150}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <Label>Contrast</Label>
                        <span className="text-sm text-muted-foreground">{contrast}%</span>
                      </div>
                      <Slider
                        value={[contrast]}
                        onValueChange={([value]) => setContrast(value)}
                        min={50}
                        max={150}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}

                <Button
                  onClick={handleDownload}
                  className="w-full bg-[#005357] hover:bg-[#004145]"
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Download
                </Button>

                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Reset
                </Button>
              </div>

              {/* Image Comparison */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 text-center">Original</p>
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
                    <p className="text-sm text-muted-foreground mb-2 text-center">Preview</p>
                    <div className="border rounded-lg overflow-hidden bg-[#1a1a1a] p-2">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
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
        <canvas ref={previewCanvasRef} className="hidden" />
      </SidebarInset>
    </SidebarProvider>
  )
}
