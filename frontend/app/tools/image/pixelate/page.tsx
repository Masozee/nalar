"use client"

import * as React from "react"
import { useState, useRef, useCallback } from "react"

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

type BlurArea = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export default function PixelateImagePage() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [blurAreas, setBlurAreas] = useState<BlurArea[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentArea, setCurrentArea] = useState<BlurArea | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [pixelSize, setPixelSize] = useState(10)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height })
        }
        img.src = event.target?.result as string
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getMousePosition = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    const scaleX = imageSize.width / rect.width
    const scaleY = imageSize.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const pos = getMousePosition(e)

    // Check if clicking on existing area
    const clickedArea = blurAreas.find(
      (area) =>
        pos.x >= area.x &&
        pos.x <= area.x + area.width &&
        pos.y >= area.y &&
        pos.y <= area.y + area.height
    )

    if (clickedArea) {
      setSelectedArea(clickedArea.id)
      setIsDragging(true)
      setDragStart(pos)
    } else {
      // Start drawing new area
      setIsDrawing(true)
      setSelectedArea(null)
      const newArea: BlurArea = {
        id: Date.now().toString(),
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      }
      setCurrentArea(newArea)
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const scaleX = imageSize.width / rect.width
      const scaleY = imageSize.height / rect.height
      const pos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }

      if (isDrawing && currentArea) {
        setCurrentArea({
          ...currentArea,
          width: Math.max(0, pos.x - currentArea.x),
          height: Math.max(0, pos.y - currentArea.y),
        })
      } else if (isDragging && selectedArea) {
        const dx = pos.x - dragStart.x
        const dy = pos.y - dragStart.y
        setBlurAreas((areas) =>
          areas.map((area) =>
            area.id === selectedArea
              ? {
                  ...area,
                  x: Math.max(0, Math.min(imageSize.width - area.width, area.x + dx)),
                  y: Math.max(0, Math.min(imageSize.height - area.height, area.y + dy)),
                }
              : area
          )
        )
        setDragStart(pos)
      }
    },
    [isDrawing, isDragging, currentArea, selectedArea, dragStart, imageSize]
  )

  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentArea && currentArea.width > 10 && currentArea.height > 10) {
      setBlurAreas((areas) => [...areas, currentArea])
    }
    setIsDrawing(false)
    setIsDragging(false)
    setIsResizing(false)
    setCurrentArea(null)
  }, [isDrawing, currentArea])

  React.useEffect(() => {
    if (isDrawing || isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDrawing, isDragging, isResizing, handleMouseMove, handleMouseUp])

  React.useEffect(() => {
    updatePreview()
  }, [image, blurAreas, pixelSize])

  const updatePreview = () => {
    if (!image || !previewCanvasRef.current) return

    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Apply pixelation to blur areas
      blurAreas.forEach((area) => {
        const imageData = ctx.getImageData(area.x, area.y, area.width, area.height)
        const pixelated = pixelateImageData(imageData, pixelSize)
        ctx.putImageData(pixelated, area.x, area.y)
      })
    }
    img.src = image
  }

  const pixelateImageData = (imageData: ImageData, size: number) => {
    const { width, height, data } = imageData
    const pixelated = new ImageData(width, height)

    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        // Get average color of the block
        let r = 0, g = 0, b = 0, a = 0, count = 0

        for (let by = 0; by < size && y + by < height; by++) {
          for (let bx = 0; bx < size && x + bx < width; bx++) {
            const i = ((y + by) * width + (x + bx)) * 4
            r += data[i]
            g += data[i + 1]
            b += data[i + 2]
            a += data[i + 3]
            count++
          }
        }

        r = Math.floor(r / count)
        g = Math.floor(g / count)
        b = Math.floor(b / count)
        a = Math.floor(a / count)

        // Fill the block with average color
        for (let by = 0; by < size && y + by < height; by++) {
          for (let bx = 0; bx < size && x + bx < width; bx++) {
            const i = ((y + by) * width + (x + bx)) * 4
            pixelated.data[i] = r
            pixelated.data[i + 1] = g
            pixelated.data[i + 2] = b
            pixelated.data[i + 3] = a
          }
        }
      }
    }

    return pixelated
  }

  const handleDownload = () => {
    if (!previewCanvasRef.current) return

    const link = document.createElement("a")
    link.download = `pixelated-${fileName || "image.png"}`
    link.href = previewCanvasRef.current.toDataURL("image/png")
    link.click()
  }

  const handleReset = () => {
    setImage(null)
    setFileName("")
    setBlurAreas([])
    setSelectedArea(null)
    setPixelSize(10)
  }

  const handleDeleteArea = () => {
    if (selectedArea) {
      setBlurAreas((areas) => areas.filter((area) => area.id !== selectedArea))
      setSelectedArea(null)
    }
  }

  const scale =
    containerRef.current && imageSize.width > 0
      ? Math.min(1, (containerRef.current.clientWidth || 600) / imageSize.width)
      : 1

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
                  <BreadcrumbPage>Pixelate Image</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pixelate Image</h1>
            <p className="text-muted-foreground">
              Upload an image and select areas to pixelate for privacy protection.
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
                  <Label>Pixel Size</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[pixelSize]}
                      onValueChange={(value) => setPixelSize(value[0])}
                      min={5}
                      max={50}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">{pixelSize}</span>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-2">Instructions:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Click and drag to create blur areas</li>
                    <li>• Click on areas to select and move them</li>
                    <li>• Adjust pixel size with the slider</li>
                  </ul>
                </div>

                {blurAreas.length > 0 && (
                  <div>
                    <Label>Blur Areas ({blurAreas.length})</Label>
                    <div className="mt-2 space-y-2">
                      {blurAreas.map((area, index) => (
                        <div
                          key={area.id}
                          className={`p-2 border rounded cursor-pointer ${
                            selectedArea === area.id ? "border-[#005357] bg-[#005357]/10" : ""
                          }`}
                          onClick={() => setSelectedArea(area.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Area {index + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setBlurAreas((areas) => areas.filter((a) => a.id !== area.id))
                                if (selectedArea === area.id) setSelectedArea(null)
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-[#005357] hover:bg-[#004145]"
                    disabled={blurAreas.length === 0}
                  >
                    <Icon name="Download" size={16} className="mr-2" />
                    Download
                  </Button>
                </div>

                <Button variant="outline" onClick={handleReset} className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Reset
                </Button>
              </div>

              {/* Image Preview with Blur Areas */}
              <div className="lg:col-span-3">
                <div
                  ref={containerRef}
                  className="relative border rounded-lg overflow-hidden bg-[#1a1a1a] inline-block cursor-crosshair"
                  style={{ maxWidth: "100%" }}
                  onMouseDown={handleMouseDown}
                >
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      display: "block",
                      maxWidth: "100%",
                      height: "auto",
                    }}
                  />

                  {/* Blur area overlays */}
                  {blurAreas.map((area) => (
                    <div
                      key={area.id}
                      className={`absolute border-2 ${
                        selectedArea === area.id ? "border-[#005357]" : "border-white/50"
                      }`}
                      style={{
                        left: `${(area.x / imageSize.width) * 100}%`,
                        top: `${(area.y / imageSize.height) * 100}%`,
                        width: `${(area.width / imageSize.width) * 100}%`,
                        height: `${(area.height / imageSize.height) * 100}%`,
                        pointerEvents: "none",
                      }}
                    />
                  ))}

                  {/* Current drawing area */}
                  {isDrawing && currentArea && (
                    <div
                      className="absolute border-2 border-[#005357] bg-[#005357]/20"
                      style={{
                        left: `${(currentArea.x / imageSize.width) * 100}%`,
                        top: `${(currentArea.y / imageSize.height) * 100}%`,
                        width: `${(currentArea.width / imageSize.width) * 100}%`,
                        height: `${(currentArea.height / imageSize.height) * 100}%`,
                        pointerEvents: "none",
                      }}
                    />
                  )}
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
